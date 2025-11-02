import { auth, provider } from './firebase'
import { signInWithPopup, signOut as fbSignOut } from 'firebase/auth'

export const signInWithGoogle = async () => {
  console.log("Attempting to sign in with Google...");
  try {
    const res = await signInWithPopup(auth, provider)
    console.log("Signed in successfully:", res.user);
    return res
  } catch (error) {
    console.error("Error during sign in:", error);
    throw error;
  }
}

export const signOut = async () => {
  await fbSignOut(auth)
}
