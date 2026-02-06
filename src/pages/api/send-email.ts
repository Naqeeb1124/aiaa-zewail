import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import { verifyIdToken } from '../../lib/firebase-admin';
import { getBrandedTemplate } from '../../lib/emailTemplates';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    // Authentication check
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
      await verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Unauthorized: Token verification failed' });
    }

    const { to, subject, text, html } = req.body
    const SITE_URL = 'https://aiaa-zewail.vercel.app'; // Consistent fallback

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    let finalHtml = html;
    if (!finalHtml && text) {
        // Automatically wrap text in branded template if no HTML is provided
        const contentHtml = `<div style="white-space: pre-wrap;">${text}</div>`;
        finalHtml = getBrandedTemplate(contentHtml, SITE_URL);
    }

    const mailOptions = {
      from: `"AIAA Zewail City" <${process.env.EMAIL_SERVER_USER}>`,
      to,
      subject,
      text,
      html: finalHtml,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Email sent successfully' })
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error sending email' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}