import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).end()
  const { name, email, message } = req.body

  // Minimal example: respond OK (configure SMTP in env for real email)
  console.log('Contact message', name, email, message)
  return res.status(200).json({ ok: true })
}
