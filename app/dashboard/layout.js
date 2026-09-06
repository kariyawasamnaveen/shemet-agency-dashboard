'use client';
import Sidebar from '../components/Sidebar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push('/login');
            } else {
                try {
                    const { doc, getDoc } = await import('firebase/firestore');
                    const { db } = await import('@/lib/firebase');
                    const userDoc = await getDoc(doc(db, "users", user.uid));

                    if ((userDoc.exists() && userDoc.data().isAgent) || user.email === 'hknskariyawasamnaveen@gmail.com') {
                        setUser({
                            ...user,
                            ...userDoc.data(),
                            isAgent: true // Ensure flag is true for UI consistency
                        });
                        setLoading(false);
                    } else {
                        // Safe fallback if role is missing
                        const { signOut } = await import('firebase/auth');
                        await signOut(auth);
                        router.push('/login');
                    }
                } catch (e) {
                    console.error("Layout Auth Error:", e);
                    setLoading(false);
                }
            }
        });

        return () => unsubscribe();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-pink-500/30">
            <Sidebar />

            {/* Main Content Area */}
            <main className="md:ml-64 min-h-screen transition-all duration-300">
                <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
