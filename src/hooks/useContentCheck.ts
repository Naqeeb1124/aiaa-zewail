import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

export function useContentCheck() {
  const [hasEvents, setHasEvents] = useState(true);
  const [hasProjects, setHasProjects] = useState(true);
  const [hasOpportunities, setHasOpportunities] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkContent() {
      try {
        // Fetch small batches to check for active content
        // We fetch instead of complex queries to avoid index requirements and handle missing fields
        const [eventsSnap, projectsSnap, opportunitiesSnap] = await Promise.all([
          getDocs(query(collection(db, 'events'), limit(10))),
          getDocs(query(collection(db, 'projects'), limit(10))),
          getDocs(query(collection(db, 'opportunities'), limit(1)))
        ]);

        const activeEvents = eventsSnap.docs.some(doc => {
          const data = doc.data();
          return !data.isArchived && !data.isDraft;
        });

        const activeProjects = projectsSnap.docs.some(doc => {
          const data = doc.data();
          return !data.isArchived;
        });

        setHasEvents(activeEvents);
        setHasProjects(activeProjects);
        setHasOpportunities(!opportunitiesSnap.empty);
      } catch (error) {
        console.error("Error checking content visibility:", error);
        // Default to showing if error
        setHasEvents(true);
        setHasProjects(true);
        setHasOpportunities(true);
      } finally {
        setLoading(false);
      }
    }

    checkContent();
  }, []);

  return { hasEvents, hasProjects, hasOpportunities, loading };
}
