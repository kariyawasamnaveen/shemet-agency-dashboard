'use client';
import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export function useAgency() {
    const [agency, setAgency] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        setAgency({
                            uid: user.uid,
                            ...userDoc.data()
                        });
                    } else {
                        setError("Agency profile not found");
                    }
                } catch (err) {
                    console.error("Error fetching agency profile:", err);
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            } else {
                setAgency(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return { agency, loading, error };
}
