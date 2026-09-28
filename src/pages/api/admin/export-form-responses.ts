import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../../lib/firebase-admin';
import { verifyIdToken, isAdminEmail } from '../../../lib/firebase-admin';

/**
 * CSV export of a form's responses. Reachable by the form's owner as well as
 * admins, mirroring the Firestore rule for the responses subcollection.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const formId = typeof req.query.formId === 'string' ? req.query.formId.trim() : '';
    if (!formId || formId.length > 200) {
        return res.status(400).json({ message: 'A valid formId is required.' });
    }

    try {
        const decoded = await verifyIdToken(authHeader.slice('Bearer '.length));

        const db = admin.firestore();
        const formSnap = await db.collection('forms').doc(formId).get();
        if (!formSnap.exists) {
            return res.status(404).json({ message: 'Form not found.' });
        }

        const form = formSnap.data() as any;
        const callerIsAdmin = await isAdminEmail(decoded.email);
        if (!callerIsAdmin && form.createdBy !== decoded.uid) {
            return res.status(403).json({ message: 'Forbidden: You do not own this form.' });
        }

        const fields: any[] = Array.isArray(form.fields) ? form.fields : [];
        const snap = await db.collection('forms').doc(formId).collection('responses').get();

        const escape = (value: unknown): string => {
            if (value === null || value === undefined) return '';
            const text = Array.isArray(value) ? value.join('; ') : String(value);
            return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
        };

        const headers = [
            'Submitted At',
            'Name',
            'Email',
            'University',
            'Status',
            'Notes',
            ...fields.map(f => f.label),
        ];

        const rows = snap.docs.map(doc => {
            const data = doc.data();
            const submittedAt = data.createdAt?.toDate?.();
            return [
                escape(submittedAt ? submittedAt.toISOString() : ''),
                escape(data.submitter?.name),
                escape(data.submitter?.email),
                escape(data.submitter?.university),
                escape(data.status),
                escape(data.notes),
                ...fields.map(f => escape(data.answers?.[f.id])),
            ].join(',');
        });

        const csv = [headers.map(escape).join(','), ...rows].join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=form-responses-${formId}.csv`);
        return res.status(200).send(csv);
    } catch (error: any) {
        if (error?.code === 'auth/id-token-expired' || error?.code === 'auth/argument-error') {
            return res.status(401).json({ message: 'Unauthorized: Token verification failed' });
        }
        console.error('Form response export error:', error);
        return res.status(500).json({ message: 'Export failed' });
    }
}
