import { auth, provider, db } from './firebase'
import { signInWithPopup, signOut as fbSignOut } from 'firebase/auth'
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { classifyEmail } from './config'

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

/**
 * Splits a display name for accounts outside Zewail City, whose Google display
 * names carry no student-ID convention to strip.
 */
const splitDisplayName = (displayName: string) => {
  const parts = displayName.trim().split(/\s+/).filter(Boolean)

  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
    fullName: displayName.trim(),
    studentId: '',
  }
}

export const signInWithGoogle = async () => {
  console.log("Attempting to sign in with Google...");

  let user;
  let res;

  // Step 1: Authenticate
  try {
    res = await signInWithPopup(auth, provider)
    user = res.user
  } catch (authError) {
    console.error("Error during authentication:", authError);
    throw authError;
  }

  // Step 2: Confirm Google shared a usable email address. Sign-up is open, so
  // any valid email gets an account; Zewail City students get the member tier
  // and everyone else the external tier.
  const identity = classifyEmail(user.email);
  if (!identity) {
    await fbSignOut(auth);
    alert(
      'Access Denied: Your Google account did not share a valid email address. Please try a different account.'
    );
    throw new Error('Sign-in requires a Google account with a valid email address.');
  }

  console.log("Authentication successful:", user.uid, identity.affiliation);

  // Step 3: Write structured data to Database
  try {
    const rawName = user.displayName || '';
    const profile = identity.affiliation === 'zewail'
      ? parseZewailName(rawName)
      : splitDisplayName(rawName);

    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    const userData: any = { 
      email: identity.email, 
      name: profile.fullName || rawName, 
      firstName: profile.firstName,
      lastName: profile.lastName,
      // External students have no Zewail ID, so this stays an empty string.
      studentId: profile.studentId,
      affiliation: identity.affiliation,
      university: identity.university,
      subscribedToAnnouncements: true,
      lastLogin: serverTimestamp(),
    };

    if (!docSnap.exists()) {
      userData.joinedAt = serverTimestamp();
    }
    
    await setDoc(docRef, userData, { merge: true });

    console.log("Database record updated for:", profile.fullName);
    return res;
  } catch (error) {
    console.error("Error updating user record:", error);
    throw error;
  }
}

export const signOut = async () => {
  await fbSignOut(auth)
}