import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '../../../lib/firebase-admin';

type RegistrationResponse = {
  id: string;
  eventId: string;
  userId: string;
  userEmail: string;
  userName: string;
  university: string;
  isExternal: true;
  status: 'registered';
  registeredAt: string;
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const eventId = typeof req.body?.eventId === 'string' ? req.body.eventId.trim() : '';
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const university = typeof req.body?.university === 'string' ? req.body.university.trim() : '';

  if (!eventId || !name || !email || !university || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Please provide a valid name, email, university, and event.' });
  }

  if (eventId.length > 200 || name.length > 120 || email.length > 254 || university.length > 160) {
    return res.status(400).json({ message: 'One or more registration fields are too long.' });
  }

  try {
    const db = admin.firestore();
    const registrationId = `guest_${encodeURIComponent(eventId)}_${encodeURIComponent(email)}`;
    const eventRef = db.collection('events').doc(eventId);
    const registrationRef = db.collection('registrations').doc(registrationId);
    let created = false;

    const registration = await db.runTransaction(async (transaction) => {
      const eventSnapshot = await transaction.get(eventRef);
      const registrationSnapshot = await transaction.get(registrationRef);

      if (!eventSnapshot.exists) {
        throw new Error('EVENT_NOT_FOUND');
      }

      const event = eventSnapshot.data();
      if (event?.isArchived || event?.isDraft || !event?.allowExternal) {
        throw new Error('EVENT_CLOSED');
      }

      if (registrationSnapshot.exists) {
        return registrationSnapshot.data() as RegistrationResponse;
      }

      created = true;
      const registrationData: RegistrationResponse = {
        id: registrationId,
        eventId,
        userId: registrationId,
        userEmail: email,
        userName: name,
        university,
        isExternal: true,
        status: 'registered',
        registeredAt: new Date().toISOString(),
      };
      transaction.set(registrationRef, registrationData);
      return registrationData;
    });

    return res.status(created ? 201 : 200).json({ registration });
  } catch (error) {
    if (error instanceof Error && error.message === 'EVENT_NOT_FOUND') {
      return res.status(404).json({ message: 'Event not found.' });
    }
    if (error instanceof Error && error.message === 'EVENT_CLOSED') {
      return res.status(409).json({ message: 'This event is no longer accepting guest registrations.' });
    }

    console.error('Guest registration error:', error);
    return res.status(500).json({ message: 'Unable to complete registration.' });
  }
}
