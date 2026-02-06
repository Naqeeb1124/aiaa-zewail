import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import { getBrandedTemplate } from '../../lib/emailTemplates';
import { getAdminDb } from '../../lib/firebase-admin';
import * as admin from 'firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).end()
  const { name, email, message } = req.body
  const SITE_URL = 'https://aiaa-zewail.vercel.app';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  const contentHtml = `
    <h2 style="color: #2b4b77; font-size: 20px;">New Contact Request</h2>
    <p style="margin-bottom: 10px;"><strong>Name:</strong> ${name}</p>
    <p style="margin-bottom: 10px;"><strong>Email:</strong> ${email}</p>
    <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #2b4b77;">
        <p style="margin: 0; font-style: italic; color: #475569;">${message}</p>
    </div>
  `;

  const mailOptions = {
    from: `"AIAA Zewail City" <${process.env.EMAIL_SERVER_USER}>`,
    to: 's-abdelrahman.alnaqeeb@zewailcity.edu.eg',
    subject: `Contact Request: ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    html: getBrandedTemplate(contentHtml, SITE_URL),
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ ok: true })
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error sending email' })
  }
}
