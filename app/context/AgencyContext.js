'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

const AgencyContext = createContext();

export function AgencyProvider({ children }) {
    const [agent, setAgent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Use a real-time listener for the user document to catch role changes or profile updates
                const unsubscribeDoc = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
                    if ((docSnap.exists() && docSnap.data().isAgent) || user.email === 'hknskariyawasamnaveen@gmail.com') {
                        setAgent({
                            uid: user.uid,
                            email: user.email,
                            ...docSnap.data(),
                            isAgent: true // Force true for Naveen
                        });
                    } else {
                        setAgent(null);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("AgencyContext Firestore Error:", error);
                    setLoading(false);
                });

                return () => unsubscribeDoc();
            } else {
                setAgent(null);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    return (
        <AgencyContext.Provider value={{ agent, loading }}>
            {children}
        </AgencyContext.Provider>
    );
}

export const useAgency = () => useContext(AgencyContext);
