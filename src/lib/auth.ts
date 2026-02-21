import { auth, provider, db } from './firebase'
import { signInWithPopup, signOut as fbSignOut } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

/**
 * Extracts Name and Student ID from Zewail City Google Display Name
 * Handles formats: 
 * 1. "First Last 202200281" (Space separated)
 * 2. "First Last-202200281" (Hyphen separated)
 */
export const parseZewailName = (displayName: string | null) => {
  if (!displayName) return { firstName: '', lastName: '', studentId: '' };

  let namePart = displayName.trim();
  let studentId = '';

  // Match ID at the end (either space or hyphen before 9 digits starting with 20)
  const idMatch = namePart.match(/[\s-](20\d{7})$/);
  
  if (idMatch) {
    studentId = idMatch[1];
    // Remove the ID and the separator (space or hyphen) from the name
    namePart = namePart.substring(0, idMatch.index).trim();
  }

  const parts = namePart.split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';

  return {
    firstName,
    lastName,
    fullName: namePart,
    studentId: studentId
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
    const docSnap = await getDoc(docRef);

    const userData: any = { 
      email: user.email, 
      name: fullName || user.displayName, 
      firstName,
      lastName,
      studentId,
      subscribedToAnnouncements: true,
      lastLogin: serverTimestamp(),
    };

    if (!docSnap.exists()) {
      userData.joinedAt = serverTimestamp();
    }
    
    await setDoc(docRef, userData, { merge: true });

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