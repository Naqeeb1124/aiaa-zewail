import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import { verifyIdToken, getAdminDb } from '../../lib/firebase-admin';
import { getBrandedTemplate } from '../../lib/emailTemplates';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const startTime = Date.now();
  const log = (msg: string) => console.log(`[send-email] [${Date.now() - startTime}ms] ${msg}`);
  // 1. Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, GET, OPTIONS');
    return res.status(200).end();
  }

  // 2. Debugging helper for GET
  if (req.method === 'GET') {
    let firebaseParses = false;
    let firebaseError = '';
    try {
        let keyString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (keyString) {
            if ((keyString.startsWith("'") && keyString.endsWith("'")) || (keyString.startsWith('"') && keyString.endsWith('"'))) {
                keyString = keyString.slice(1, -1);
            }
            JSON.parse(keyString);
            firebaseParses = true;
        }
    } catch (e: any) {
        firebaseError = e.message;
    }

    return res.status(200).json({ 
        status: 'online',
        message: 'Email API is active.',
        config: {
            hasUser: !!process.env.EMAIL_SERVER_USER,
            hasPass: !!process.env.EMAIL_SERVER_PASSWORD,
            hasFirebaseKey: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
            firebaseParses,
            firebaseError
        },
        runtime: process.env.VERCEL ? 'vercel' : 'local',
        nodeVersion: process.version
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: `Method ${req.method} not allowed` })
  }

  try {
    // 3. Authentication check
    log('Processing POST request');
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      log('REJECTED: Missing or invalid auth header');
      return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    log(`Token received (${idToken ? idToken.length : 0} chars)`);
    let decodedToken;
    try {
      decodedToken = await verifyIdToken(idToken);
      log(`Token verified for: ${decodedToken.email}`);
    } catch (error: any) {
      log(`Token verification FAILED: ${error.message}`);
      console.error('Token verification failed:', error);
      return res.status(401).json({ 
        message: 'Unauthorized: Token verification failed', 
        error: error.message,
        hint: 'This often happens if FIREBASE_SERVICE_ACCOUNT_KEY is invalid or missing.'
      });
    }

    const adminEmail = decodedToken.email;

    // 4. Request validation
    const { to, subject, text, html, type = 'single', ctaText, ctaUrl } = req.body
    if (!to || !subject) {
        return res.status(400).json({ message: 'Missing required fields: to or subject' });
    }

    // 5. Send Email
    log(`Preparing email to: ${to}, subject: ${subject}`);
    const SITE_URL = 'https://aiaa-zewail.vercel.app'; 
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
    log('Transporter created');

    const contentHtml = html || `<div style="white-space: pre-wrap;">${text}</div>`;
    const cta = (ctaText && ctaUrl) ? { text: ctaText, url: ctaUrl } : undefined;
    const finalHtml = getBrandedTemplate(contentHtml, SITE_URL, undefined, cta);

    const mailOptions = {
      from: `"AIAA Zewail City" <${process.env.EMAIL_SERVER_USER}>`,
      to,
      subject,
      text: text || 'Please view this email in an HTML-compatible client.',
      html: finalHtml,
    };

    await transporter.sendMail(mailOptions);
    log('Email sent successfully');

    // 6. Audit Logging (The Black Box)
    try {
        const adminDb = getAdminDb();
        if (adminDb) {
            const logData = {
                type: 'dispatch',
                emailType: type,
                adminEmail: adminEmail || 'unknown_admin',
                recipient: to,
                subject,
                timestamp: new Date().toISOString(),
                status: 'success'
            };
            
            console.log('Attempting to log transmission to Black Box:', logData.adminEmail, '->', logData.recipient);
            await adminDb.collection('audit_logs').add(logData);
            console.log('Successfully recorded entry in Black Box.');
        } else {
            console.warn('Black Box Logging failed: Firestore Admin not initialized.');
        }
    } catch (logError: any) {
        console.error('CRITICAL: Failed to write to audit_logs collection:', logError.message);
    }

    return res.status(200).json({ message: 'Email sent successfully' })

  } catch (error: any) {
    log(`CRITICAL ERROR: ${error.message}`);
    console.error('CRITICAL API Error in send-email:', error);
    return res.status(500).json({ 
      message: 'Error processing email request',
      error: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}