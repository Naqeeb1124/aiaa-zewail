import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../../lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 1. Security Check
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const email = decodedToken.email;

    if (!email) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify Admin Status
    const adminDoc = await admin.firestore().collection('admins').doc(email).get();
    if (!adminDoc.exists) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // 2. Fetch ALL users from Firebase AUTH
    const authUsers = await admin.auth().listUsers();
    
    // 3. Return simplified list for the communications hub
    const recipients = authUsers.users.map(user => ({
        id: user.uid,
        name: user.displayName || '',
        email: user.email,
        firstName: user.displayName ? user.displayName.split(' ')[0] : ''
    })).filter(r => r.email);

    return res.status(200).json(recipients);

  } catch (error: any) {
    console.error('Auth fetch error:', error);
    return res.status(500).json({ message: 'Failed to fetch auth users', error: error.message });
  }
}
