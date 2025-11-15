import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const userRef = doc(db, 'users', Array.isArray(userId) ? userId[0] : userId);
    await updateDoc(userRef, {
      subscribedToAnnouncements: false,
    });
    res.status(200).send('You have been successfully unsubscribed.');
  } catch (error) {
    console.error('Error unsubscribing user:', error);
    res.status(500).json({ message: 'Error unsubscribing user' });
  }
}
