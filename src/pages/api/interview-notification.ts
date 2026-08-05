import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { verifyIdToken, getAdminDb } from '../../lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decodedToken = await verifyIdToken(authHeader.slice('Bearer '.length));
    const db = getAdminDb();
    if (!db || !decodedToken.uid || !decodedToken.email) {
      return res.status(503).json({ message: 'Notification service unavailable' });
    }

    const interview = await db.collection('interviews').doc(decodedToken.uid).get();
    const interviewData = interview.data();
    if (!interview.exists || interviewData?.status !== 'scheduled') {
      return res.status(403).json({ message: 'A scheduled interview is required' });
    }

    const admins = await db.collection('admins').get();
    const adminEmails = admins.docs.map(adminDoc => adminDoc.id).filter(Boolean);
    if (adminEmails.length === 0) {
      return res.status(200).json({ message: 'No admin recipients configured' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const selectedSlot = interviewData?.selectedSlot || req.body?.selectedSlot;
    const location = interviewData?.location || req.body?.location;
    await transporter.sendMail({
      from: `"AIAA Zewail City" <${process.env.EMAIL_SERVER_USER}>`,
      to: adminEmails,
      subject: `Interview Scheduled with ${decodedToken.name || decodedToken.email}`,
      text: `${decodedToken.name || decodedToken.email} scheduled for ${new Date(selectedSlot).toLocaleString()} at ${location}.`,
    });

    return res.status(200).json({ message: 'Admins notified' });
  } catch (error) {
    console.error('Interview notification error:', error);
    return res.status(500).json({ message: 'Failed to notify admins' });
  }
}
