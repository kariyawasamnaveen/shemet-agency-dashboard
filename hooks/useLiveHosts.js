import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export function useLiveHosts(agencyId) {
    const [liveHosts, setLiveHosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!agencyId) return;

        const hostsQuery = query(
            collection(db, 'users'),
            where('isHost', '==', true),
            where('agencyId', '==', agencyId)
        );

        const unsubscribe = onSnapshot(hostsQuery, (snapshot) => {
            const liveList = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.isLive) {
                    liveList.push({ id: doc.id, ...data });
                }
            });
            setLiveHosts(liveList);
            setLoading(false);
        }, (error) => {
            console.error("useLiveHosts Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [agencyId]);

    return { liveHosts, loading };
}
