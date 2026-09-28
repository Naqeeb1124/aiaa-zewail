import type { NextApiRequest, NextApiResponse } from 'next';
import { createHash } from 'crypto';
import admin from '../../../lib/firebase-admin';
import { verifyIdToken, emailAffiliation } from '../../../lib/firebase-admin';
import {
    audienceAllows,
    isValidEmail,
    validateSubmission,
    type SubmitterContext,
} from '../../../lib/forms';
import type { FormDoc, FormField } from '../../../types/form';

/** Bots fill forms faster than a human can read them. */
const MIN_FILL_MS = 2500;
/** Clock skew and slow client clocks must not produce absurd timestamps. */
const MAX_FILL_MS = 1000 * 60 * 60 * 12;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 1000 * 60 * 60;

/**
 * Salt for the per-submitter rate limit key. The project id is not secret, but
 * it only has to be stable and not user-controlled: the counter is a speed bump
 * against casual spam, not an authentication control.
 */
const RATE_SALT = process.env.FORM_RATE_LIMIT_SALT || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'aiaa';

const clientIp = (req: NextApiRequest): string => {
    const forwarded = req.headers['x-forwarded-for'];
    const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return (raw || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
};

const hash = (value: string) => createHash('sha256').update(`${RATE_SALT}:${value}`).digest('hex');

const clean = (value: unknown, max: number) =>
    typeof value === 'string' ? value.trim().slice(0, max) : '';

/**
 * Fixed-window counter, keyed by form + hashed IP + hour bucket. Returns false
 * when the caller is over the limit. Runs in a transaction so parallel
 * submissions cannot race past the cap.
 */
async function withinRateLimit(formId: string, ip: string): Promise<boolean> {
    const db = admin.firestore();
    const bucket = Math.floor(Date.now() / RATE_WINDOW_MS);
    const limitRef = db.collection('formRateLimits').doc(`${hash(`${formId}:${ip}`)}.${bucket}`);

    return db.runTransaction(async (transaction) => {
        const snap = await transaction.get(limitRef);
        const count = snap.exists && typeof snap.data()?.count === 'number' ? snap.data()!.count : 0;
        if (count >= RATE_LIMIT) return false;
        transaction.set(limitRef, { count: count + 1, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        return true;
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const formId = clean(req.body?.formId, 200);
    if (!formId) {
        return res.status(400).json({ message: 'Missing form.' });
    }

    // Honeypot: a real browser never fills a field it cannot see.
    if (clean(req.body?.website, 200)) {
        return res.status(400).json({ message: 'Submission rejected.' });
    }

    const startedAt = Number(req.body?.startedAt);
    const elapsed = Date.now() - startedAt;
    if (!Number.isFinite(startedAt) || elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS) {
        return res.status(400).json({ message: 'Submission rejected.' });
    }

    if (!(await withinRateLimit(formId, clientIp(req)))) {
        return res.status(429).json({ message: 'Too many submissions from this connection. Try again later.' });
    }

    // Identify the submitter from a verified token when one is offered. Never
    // trust an identity supplied in the request body.
    let uid: string | null = null;
    let email = '';
    let affiliation: SubmitterContext['affiliation'] = null;
    let role: string | null = null;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
        try {
            const decoded = await verifyIdToken(authHeader.slice('Bearer '.length));
            uid = decoded.uid;
            email = (decoded.email || '').toLowerCase();
            affiliation = emailAffiliation(email);
            const userSnap = await admin.firestore().collection('users').doc(decoded.uid).get();
            role = userSnap.exists ? (userSnap.data()?.role ?? null) : null;
        } catch {
            return res.status(401).json({ message: 'Your session expired. Reload and try again.' });
        }
    }

    const name = clean(req.body?.name, 120);
    const guestEmail = clean(req.body?.email, 254).toLowerCase();
    const guestUniversity = clean(req.body?.university, 160);

    // Guests are only viable on a public form, and must identify themselves.
    if (!uid) {
        if (!name || !isValidEmail(guestEmail)) {
            return res.status(400).json({ message: 'Please provide your name and a valid email address.' });
        }
        email = guestEmail;
    }
    if (!name && uid) {
        return res.status(400).json({ message: 'Please provide your name.' });
    }

    const db = admin.firestore();
    let form: FormDoc | null = null;
    try {
        const snap = await db.collection('forms').doc(formId).get();
        form = snap.exists ? (snap.data() as FormDoc) : null;
    } catch (error) {
        console.error('Form lookup failed:', error);
        return res.status(500).json({ message: 'Unable to load this form.' });
    }

    if (!form) return res.status(404).json({ message: 'Form not found.' });
    if (form.status !== 'published') {
        return res.status(409).json({ message: 'This form is no longer accepting responses.' });
    }

    const who: SubmitterContext = {
        email,
        affiliation,
        role,
        authenticated: !!uid,
    };
    if (!audienceAllows(form.audience, who)) {
        return res.status(403).json({
            message:
                form.audience === 'public'
                    ? 'This form is restricted.'
                    : 'Please sign in with an eligible account to fill this form.',
        });
    }

    // Authoritative validation against the stored schema. The client's own
    // checks are only a convenience; unknown answer keys are dropped here.
    const fields: FormField[] = Array.isArray(form.fields) ? form.fields : [];
    const result = validateSubmission(fields, req.body?.answers);
    if (!result.ok) {
        return res.status(400).json({ message: 'Please fix the highlighted fields.', errors: result.errors });
    }

    const responseId = db.collection('forms').doc(formId).collection('responses').doc().id;

    // One response per email per form, so a double-clicked submit does not
    // create a duplicate for whoever has to triage it.
    const existing = await db
        .collection('forms')
        .doc(formId)
        .collection('responses')
        .where('submitter.email', '==', email)
        .limit(1)
        .get();

    if (!existing.empty) {
        return res.status(200).json({ ok: true, duplicate: true, message: 'We already have your response. Thank you.' });
    }

    try {
        await db.collection('forms').doc(formId).collection('responses').doc(responseId).set({
            answers: result.answers,
            submitter: {
                userId: uid,
                name,
                email,
                university: guestUniversity || (affiliation === 'zewail' ? 'Zewail City' : undefined),
            },
            status: 'new',
            notes: '',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return res.status(201).json({ ok: true, responseId });
    } catch (error) {
        console.error('Form submission failed:', error);
        return res.status(500).json({ message: 'Unable to record your response.' });
    }
}
