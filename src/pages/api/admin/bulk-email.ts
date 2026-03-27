import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import { verifyIdToken, getAdminDb } from '../../../lib/firebase-admin';
import { getBrandedTemplate } from '../../../lib/emailTemplates';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // 1. Security Check
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  let decodedToken;
  try {
    decodedToken = await verifyIdToken(idToken);
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const adminEmail = decodedToken.email;

  const { recipients, subject, htmlTemplate, useBranding, siteUrl, ctaText, ctaUrl } = req.body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ message: 'No recipients provided' });
  }

  // 2. Setup Transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  };

  // 3. Send Emails (Mail Merge Logic)
  for (const recipient of recipients) {
    try {
      let personalizedContent = htmlTemplate;
      
      // Smart First Name logic
      let firstName = '';
      if (recipient.firstName) {
        firstName = recipient.firstName;
      } else if (recipient.name) {
        firstName = recipient.name.split(' ')[0].replace(/\d+$/, '');
      }

      // Basic Mail Merge: Replace placeholders
      if (firstName) {
        personalizedContent = personalizedContent.replace(/{{name}}/g, firstName);
      }
      personalizedContent = personalizedContent.replace(/{{email}}/g, recipient.email);

      let finalHtml = personalizedContent;
      if (useBranding) {
          const unsubscribeUrl = recipient.id ? `${siteUrl}/api/unsubscribe?userId=${recipient.id}` : undefined;
          const cta = (ctaText && ctaUrl) ? { text: ctaText, url: ctaUrl } : undefined;
          finalHtml = getBrandedTemplate(personalizedContent, siteUrl || 'https://aiaa-zewail.vercel.app', unsubscribeUrl, cta);
      }

      await transporter.sendMail({
        from: `"AIAA Zewail City" <${process.env.EMAIL_SERVER_USER}>`,
        to: recipient.email,
        subject: subject,
        html: finalHtml,
      });
      results.success++;
    } catch (err: any) {
      results.failed++;
      const errorMessage = `Failed for ${recipient.email}: ${err.message}`;
      results.errors.push(errorMessage);
      console.error(errorMessage);
    }
  }

  // 4. Audit Logging (The Black Box)
  try {
      const adminDb = getAdminDb();
      if (adminDb && (results.success > 0 || results.failed > 0)) {
          const logData = {
              type: 'bulk_dispatch_batch',
              adminEmail: adminEmail || 'unknown_admin',
              recipientCount: recipients.length,
              successCount: results.success,
              failedCount: results.failed,
              subject,
              timestamp: new Date().toISOString(),
              status: results.failed === 0 ? 'success' : 'partial',
              errors: results.errors // Log all errors
          };
          console.log('Logging batch dispatch:', logData.adminEmail, '->', results.success, '/', recipients.length, 'success');
          await adminDb.collection('audit_logs').add(logData);
      }
  } catch (logError: any) {
      console.error('Failed to log batch dispatch to audit_logs:', logError.message);
  }

  res.status(200).json(results);
}
