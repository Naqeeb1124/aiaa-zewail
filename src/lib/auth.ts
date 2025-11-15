import { auth, provider, db } from './firebase'
import { signInWithPopup, signOut as fbSignOut } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

export const signInWithGoogle = async () => {
  console.log("Attempting to sign in with Google...");
  try {
    const res = await signInWithPopup(auth, provider)
    const user = res.user
    const docRef = doc(db, 'users', user.uid)
    await setDoc(docRef, { email: user.email, name: user.displayName, subscribedToAnnouncements: true }, { merge: true })
    console.log("Signed in successfully:", user);
    return res
  } catch (error) {
    console.error("Error during sign in:", error);
    throw error;
  }
}

export const signOut = async () => {
  await fbSignOut(auth)
}
