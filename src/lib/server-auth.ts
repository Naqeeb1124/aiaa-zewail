import { GetServerSidePropsContext } from 'next';
import admin from './firebase-admin';

export async function requireAuth(context: GetServerSidePropsContext) {
  const token = context.req.cookies.token;

  if (!token) {
    return {
      redirect: {
        destination: '/join',
        permanent: false,
      },
    };
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return {
      props: {
        user: {
          email: decodedToken.email,
          uid: decodedToken.uid,
        },
      },
    };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return {
      redirect: {
        destination: '/join',
        permanent: false,
      },
    };
  }
}

export async function requireAdmin(context: GetServerSidePropsContext) {
  const token = context.req.cookies.token;

  if (!token) {
    return {
      redirect: {
        destination: '/join',
        permanent: false,
      },
    };
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const email = decodedToken.email;

    if (!email) {
      throw new Error('No email in token');
    }

    const adminDoc = await admin.firestore().collection('admins').doc(email).get();

    if (!adminDoc.exists) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }

    return {
      props: {
        user: {
          email: decodedToken.email,
          uid: decodedToken.uid,
        },
      },
    };
  } catch (error) {
    console.error('Admin verification failed:', error);
    return {
      redirect: {
        destination: '/join',
        permanent: false,
      },
    };
  }
}
