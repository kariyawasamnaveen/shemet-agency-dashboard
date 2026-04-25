'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

const AgencyContext = createContext();

export function AgencyProvider({ children }) {
    const [agent, setAgent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("[AUTH_DEBUG] AgencyContext: Initializing onAuthStateChanged");
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            console.log("[AUTH_DEBUG] AgencyContext: onAuthStateChanged uid =", user?.uid);
            if (user) {
                // Use a real-time listener for the user document to catch role changes or profile updates
                const unsubscribeDoc = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
                    console.log("[AUTH_DEBUG] AgencyContext: onSnapshot received. Exists =", docSnap.exists());
                    const userData = docSnap.data();
                    const isNaveen = user.email?.toLowerCase() === 'hknskariyawasamnaveen@gmail.com';
                    const hasAdminPrivs = isNaveen || userData?.isAdmin === true;

                    if ((docSnap.exists() && userData.isAgent) || hasAdminPrivs) {
                        console.log("[AUTH_DEBUG] AgencyContext: Setting Agent. isAgent =", userData.isAgent, "isAdmin =", hasAdminPrivs);
                        setAgent({
                            uid: user.uid,
                            email: user.email,
                            ...userData,
                            isAgent: true,
                            isAdmin: hasAdminPrivs
                        });
                    } else {
                        console.warn("[AUTH_DEBUG] AgencyContext: User document exists but not an agent or missing fields.");
                        setAgent(null);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("[AUTH_DEBUG] AgencyContext: Firestore Error:", error);
                    setLoading(false);
                });

                return () => {
                    console.log("[AUTH_DEBUG] AgencyContext: Cleaning up onSnapshot listener");
                    unsubscribeDoc();
                };
            } else {
                console.log("[AUTH_DEBUG] AgencyContext: User is null, clearing agent state");
                setAgent(null);
                setLoading(false);
            }
        });

        return () => {
            console.log("[AUTH_DEBUG] AgencyContext: Cleaning up onAuthStateChanged listener");
            unsubscribeAuth();
        };
    }, []);

    return (
        <AgencyContext.Provider value={{ agent, loading }}>
            {children}
        </AgencyContext.Provider>
    );
}

export const useAgency = () => useContext(AgencyContext);
