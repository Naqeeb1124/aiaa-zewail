import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import { verifyIdToken } from '../../lib/firebase-admin';
import { getBrandedTemplate } from '../../lib/emailTemplates';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  console.log('Received email request body:', req.body);

  try {
    // Authentication check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
      await verifyIdToken(idToken);
    } catch (error: any) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Unauthorized: Token verification failed', error: error.message });
    }

    const { to, subject, text, html } = req.body
    
    if (!to || !subject) {
        return res.status(400).json({ message: 'Missing required fields: to or subject' });
    }

    const SITE_URL = 'https://aiaa-zewail.vercel.app'; // Consistent fallback

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Always wrap the content in the branded template for consistency
    const contentHtml = html || `<div style="white-space: pre-wrap;">${text}</div>`;
    const finalHtml = getBrandedTemplate(contentHtml, SITE_URL);

    const mailOptions = {
      from: `"AIAA Zewail City" <${process.env.EMAIL_SERVER_USER}>`,
      to,
      subject,
      text: text || 'Please view this email in an HTML-compatible client.',
      html: finalHtml,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email sent successfully' })

  } catch (error: any) {
    console.error('API Error in send-email:', error);
    return res.status(500).json({ 
      message: 'Error processing email request',
      error: error.message || 'Unknown error'
    })
  }
}