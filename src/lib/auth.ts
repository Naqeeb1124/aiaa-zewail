import { auth, provider, db } from './firebase'
import { signInWithPopup, signOut as fbSignOut } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

/**
 * Extracts Name and Student ID from Zewail City Google Display Name
 * Format: "First Last ID" -> e.g., "Abdelrahman Mohamed 202200281"
 */
export const parseZewailName = (displayName: string | null) => {
  if (!displayName) return { firstName: '', lastName: '', studentId: '' };

  const parts = displayName.trim().split(/\s+/);
  
  // Assuming the last part is always the ID
  const studentId = parts.length > 1 ? parts[parts.length - 1] : '';
  
  // If we have an ID, remove it from the name parts
  const nameParts = /^\d+$/.test(studentId) ? parts.slice(0, -1) : parts;
  
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    firstName,
    lastName,
    fullName: nameParts.join(' '),
    studentId: /^\d+$/.test(studentId) ? studentId : ''
  };
}

export const signInWithGoogle = async () => {
  console.log("Attempting to sign in with Google...");

  let user;
  let res;

  // Step 1: Authenticate
  try {
    res = await signInWithPopup(auth, provider)
    user = res.user

    // Strict Check: Only s- prefixed Zewail City emails allowed
    if (!user.email?.endsWith('@zewailcity.edu.eg') || !user.email?.startsWith('s-')) {
      await fbSignOut(auth); 
      alert('Access Denied: Please use your Zewail City student email (starting with s-).');
      throw new Error('Only Zewail City students are allowed to join.');
    }

    console.log("Authentication successful:", user.uid);
  } catch (authError) {
    console.error("Error during authentication:", authError);
    throw authError;
  }

  // Step 2: Write structured data to Database
  try {
    const { firstName, lastName, fullName, studentId } = parseZewailName(user.displayName);
    const docRef = doc(db, 'users', user.uid);
    
    await setDoc(docRef, { 
      email: user.email, 
      name: fullName || user.displayName, // Fallback to display name if parse fails
      firstName,
      lastName,
      studentId,
      subscribedToAnnouncements: true,
      lastLogin: serverTimestamp(),
      joinedAt: serverTimestamp() // Set on first login
    }, { merge: true });

    console.log("Database record updated for:", fullName);
    return res;
  } catch (error) {
    console.error("Error updating user record:", error);
    throw error;
  }
}

export const signOut = async () => {
  await fbSignOut(auth)
}