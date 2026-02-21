import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../../lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 1. Security Check
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const email = decodedToken.email;

    if (!email) {
        return res.status(401).json({ message: 'Unauthorized: No email' });
    }

    // Verify Admin Status
    const adminDoc = await admin.firestore().collection('admins').doc(email).get();
    if (!adminDoc.exists) {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    // 2. Fetch ALL users from Firebase AUTH (This gets the 95 users)
    const authUsers = await admin.auth().listUsers();
    const filterType = req.query.filter as string;
    
    // 3. Fetch all Firestore data to merge
    const firestoreSnap = await admin.firestore().collection('users').get();
    const firestoreData: Record<string, any> = {};
    firestoreSnap.forEach(doc => {
        firestoreData[doc.id] = doc.data();
    });

    // 4. Filter logic
    let filteredList = authUsers.users;
    if (filterType === 'students') {
      filteredList = authUsers.users.filter(user => 
        user.email?.startsWith('s-') && user.email?.endsWith('@zewailcity.edu.eg')
      );
    }

    // 5. Define CSV Headers
    const headers = [
      'UID',
      'Display Name',
      'Email',
      'Created At',
      'Last Sign In',
      'Major (Firestore)',
      'Year (Firestore)'
    ];

    // 6. Convert to CSV
    const rows = filteredList.map(user => {
      const fs = firestoreData[user.uid] || {};
      
      return [
        user.uid,
        `"${(user.displayName || fs.name || '').replace(/"/g, '""')}"`,
        user.email || '',
        user.metadata.creationTime,
        user.metadata.lastSignInTime,
        fs.major || 'N/A',
        fs.year || 'N/A'
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    // 7. Send Response
    const filename = filterType === 'students' ? 'aiaa-students-only.csv' : 'aiaa-all-accounts.csv';
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    return res.status(200).send(csvContent);

  } catch (error: any) {
    console.error('Export error details:', error);
    return res.status(500).json({ 
        message: 'Export failed', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
