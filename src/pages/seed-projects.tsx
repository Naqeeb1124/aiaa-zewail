import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

export default function SeedProjects() {
    const [status, setStatus] = useState('Idle');

    useEffect(() => {
        const seed = async () => {
            setStatus('Checking existing projects...');
            const colRef = collection(db, 'projects');
            const snapshot = await getDocs(colRef);

            if (!snapshot.empty) {
                setStatus('Projects already exist. Skipping seed to prevent duplicates.');
                return;
            }
            setStatus('Seeding projects...');

            const projects = [
                {
                    title: 'Flight Test Alpha',
                    category: 'Flight Testing',
                    description: 'Our flagship project for Season 1. Designing and building a flight test platform for control systems and telemetry.',
                    status: 'Recruiting',
                    icon: ' ',
                    progress: 10,
                    createdAt: new Date().toISOString()
                },
                {
                    title: 'Autonomous Glider',
                    category: 'Glider Systems',
                    description: 'Developing a fixed-wing autonomous glider capable of waypoint navigation for environmental monitoring.',
                    status: 'Planning',
                    icon: '✈️',
                    progress: 5,
                    createdAt: new Date().toISOString()
                },
                {
                    title: 'CanSat Competition',
                    category: 'Space Systems',
                    description: 'Designing a simulation of a real satellite, integrated within the volume and shape of a soft drink can, to be launched and deployed.',
                    status: 'Concept',
                    icon: '🛰️',
                    progress: 0,
                    createdAt: new Date().toISOString()
                }
            ];

            try {
                for (const p of projects) {
                    await addDoc(colRef, p);
                }
                setStatus('Success! Projects added. You can now delete this page.');
            } catch (e: any) {
                setStatus('Error: ' + e.message);
            }
        };
        seed();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-ink text-white font-sans">
            <h1 className="text-2xl font-black uppercase tracking-tight">{status}</h1>
        </div>
    );
}
