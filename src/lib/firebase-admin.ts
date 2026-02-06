import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) 
  : null;

if (!admin.apps.length) {
  try {
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin initialized with service account.");
    } else {
      admin.initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
      console.log("Firebase Admin initialized with project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const verifyIdToken = async (token: string) => {
  return admin.auth().verifyIdToken(token);
};

export const getAdminDb = () => {
  if (!admin.apps.length) {
      console.error("getAdminDb called but admin.apps.length is 0");
      return null;
  }
  return admin.firestore();
};

export const adminDb = admin.apps.length ? admin.firestore() : null;

export default admin;
