import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../../lib/firebase-admin';
import nodemailer from 'nodemailer';
import { getBrandedTemplate } from '../../../lib/emailTemplates';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Security Check (Optional: You can add a CRON_SECRET header check here)
  // if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
  //   return res.status(401).json({ message: 'Unauthorized' });
  // }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = admin.firestore();
    const now = new Date().toISOString();

    // 2. Fetch pending emails whose scheduled time has passed
    const snapshot = await db.collection('scheduled_emails')
      .where('status', '==', 'pending')
      .where('scheduledAt', '<=', now)
      .limit(1) // Process one batch at a time to avoid timeouts
      .get();

    if (snapshot.empty) {
      return res.status(200).json({ message: 'No emails to process.' });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // 3. Setup Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // 4. Send Emails (Same logic as bulk-email.ts)
    const results = { success: 0, failed: 0 };
    for (const recipient of data.recipients) {
      try {
        let personalizedContent = data.htmlTemplate;
        let firstName = recipient.firstName || (recipient.name ? recipient.name.split(' ')[0] : '');

        if (firstName) {
          personalizedContent = personalizedContent.replace(/{{name}}/g, firstName);
        }
        personalizedContent = personalizedContent.replace(/{{email}}/g, recipient.email);

        let finalHtml = personalizedContent;
        if (data.useBranding) {
          const unsubscribeUrl = recipient.id ? `${data.siteUrl}/api/unsubscribe?userId=${recipient.id}` : undefined;
          finalHtml = getBrandedTemplate(personalizedContent, data.siteUrl, unsubscribeUrl);
        }

        await transporter.sendMail({
          from: `"AIAA Zewail City" <${process.env.EMAIL_SERVER_USER}>`,
          to: recipient.email,
          subject: data.subject,
          html: finalHtml,
        });
        results.success++;
      } catch (err) {
        results.failed++;
      }
    }

    // 5. Update Status
    await doc.ref.update({
      status: 'sent',
      sentAt: new Date().toISOString(),
      results
    });

    return res.status(200).json({ message: 'Scheduled email processed.', results });

  } catch (error: any) {
    console.error('Cron error:', error);
    return res.status(500).json({ error: error.message });
  }
}
