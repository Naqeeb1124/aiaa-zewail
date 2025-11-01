import { auth, provider } from './firebase'
import { signInWithPopup, signOut as fbSignOut } from 'firebase/auth'

export const signInWithGoogle = async () => {
  const res = await signInWithPopup(auth, provider)
  return res
}

export const signOut = async () => {
  await fbSignOut(auth)
}
