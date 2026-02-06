import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'

export async function getAdminEmails(): Promise<string[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'admins'))
    return querySnapshot.docs.map(doc => doc.id) // Assuming document ID is the email
  } catch (error) {
    console.error('Error fetching admin emails:', error)
    return []
  }
}
