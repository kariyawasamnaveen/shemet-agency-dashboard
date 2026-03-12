'use client';
import { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, Timestamp, doc, setDoc } from 'firebase/firestore';

export default function SeedPage() {
    const [status, setStatus] = useState('Ready to seed');
    const [loading, setLoading] = useState(false);

    const generateData = async () => {
        setLoading(true);
        setStatus('Starting seeding process...');

        try {
            // 1. Create Dummy Hosts
            setStatus('Creating hosts...');
            const hosts = [];
            const hostNames = ['Alice Chen', 'Bella Rose', 'Candy Sweet', 'Diana Prince', 'Elena Gilbert'];

            for (let i = 0; i < hostNames.length; i++) {
                const hostId = `host_test_${i}`;
                const hostData = {
                    name: hostNames[i],
                    email: `host${i}@agency.test`,
                    isHost: true,
                    isOnline: Math.random() > 0.3, // 70% chance online
                    isLive: Math.random() > 0.7,   // 30% chance live
                    level: Math.floor(Math.random() * 10) + 1,
                    diamonds: Math.floor(Math.random() * 50000),
                    followers: Math.floor(Math.random() * 1000),
                    country: ['USA', 'Philippines', 'Brazil', 'Thailand'][Math.floor(Math.random() * 4)],
                    photoURL: `https://i.pravatar.cc/150?u=${hostId}`,
                    createdAt: Timestamp.now(),
                    lastSeen: Timestamp.now()
                };

                await setDoc(doc(db, 'users', hostId), hostData);
                hosts.push({ id: hostId, ...hostData });
            }

            // 2. Create Pending Applications
            setStatus('Creating applications...');
            const appNames = ['Fiona Green', 'Gina Letti', 'Hannah Montana', 'Ivy Blue', 'Jenny Kim'];

            for (let i = 0; i < appNames.length; i++) {
                await addDoc(collection(db, 'host_applications'), {
                    userName: appNames[i],
                    userId: `applicant_test_${i}`,
                    email: `app${i}@test.com`,
                    status: 'pending',
                    category: ['Dance', 'Music', 'Gaming'][Math.floor(Math.random() * 3)],
                    age: 18 + Math.floor(Math.random() * 10),
                    submittedAt: Timestamp.now(),
                    socialLinks: ['https://instagram.com/test', 'https://tiktok.com/@test'],
                    idDocumentUrl: 'https://placehold.co/600x400/000000/FFFFFF/png?text=ID+Card',
                    verificationPhotos: ['https://placehold.co/400x400/222222/FFFFFF/png?text=Selfie']
                });
            }

            // 3. Create Gift Transactions (Last 7 Days)
            setStatus('Generating transaction history...');
            const days = 7;
            for (let d = 0; d < days; d++) {
                const date = new Date();
                date.setDate(date.getDate() - d);

                // Generate random number of transactions per day (5-15)
                const dailyTxCount = 5 + Math.floor(Math.random() * 10);

                for (let t = 0; t < dailyTxCount; t++) {
                    const randomHost = hosts[Math.floor(Math.random() * hosts.length)];
                    const amount = [10, 50, 100, 500, 1000, 5000][Math.floor(Math.random() * 6)];

                    await addDoc(collection(db, 'gift_transactions'), {
                        receiverId: randomHost.id,
                        receiverName: randomHost.name,
                        senderId: 'random_user',
                        senderName: 'Fan User',
                        diamondAmount: amount,
                        giftName: 'Test Gift',
                        timestamp: Timestamp.fromDate(date)
                    });
                }
            }

            // 4. Create Withdrawals
            setStatus('Creating withdrawal records...');
            await addDoc(collection(db, 'withdrawals'), {
                userId: hosts[0].id,
                amount: 500,
                status: 'completed',
                timestamp: Timestamp.now()
            });
            await addDoc(collection(db, 'withdrawals'), {
                userId: hosts[1].id,
                amount: 250,
                status: 'pending',
                timestamp: Timestamp.now()
            });

            setStatus('✅ Seeding Complete! Database is populated.');
        } catch (error) {
            console.error(error);
            setStatus(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full text-center space-y-6">
                <h1 className="text-3xl font-bold">🌱 Data Seeder</h1>
                <p className="text-slate-400">
                    This tool will populate your Firestore with dummy data for testing the Agency Dashboard.
                </p>

                <div className="p-4 bg-black/30 rounded-xl font-mono text-sm text-yellow-400">
                    Status: {status}
                </div>

                <button
                    onClick={generateData}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${loading
                            ? 'bg-slate-700 cursor-not-allowed opacity-50'
                            : 'bg-green-600 hover:bg-green-500 hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-1'
                        }`}
                >
                    {loading ? 'Seeding...' : 'Generate Test Data 🚀'}
                </button>
            </div>
        </div>
    );
}
