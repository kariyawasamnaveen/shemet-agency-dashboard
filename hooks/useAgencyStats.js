import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { convertDiamondsToPoints } from '@/lib/utils/commission';

export function useAgencyStats(agencyId) {
    const [stats, setStats] = useState({
        totalRevenuePoints: 0,
        onlineHosts: 0,
        activeLive: 0,
        pendingApps: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!agencyId) return;

        let pendingHostsCount = 0;
        let rev = 0;
        let online = 0;
        let live = 0;

        let appsLoaded = false;
        let hostsLoaded = false;

        const updateStats = () => {
            setStats({
                totalRevenuePoints: convertDiamondsToPoints(rev),
                onlineHosts: online,
                activeLive: live,
                pendingApps: pendingHostsCount
            });
            if (appsLoaded && hostsLoaded) setLoading(false);
        };

        const hostsQuery = query(
            collection(db, 'users'),
            where('isHost', '==', true),
            where('agencyId', '==', agencyId)
        );
        
        const unsubscribeHosts = onSnapshot(hostsQuery, (snapshot) => {
            rev = 0;
            online = 0;
            live = 0;
            snapshot.forEach(doc => {
                const data = doc.data();
                rev += (data.diamonds || 0);
                if (data.isOnline) online++;
                if (data.isLive) live++;
            });
            hostsLoaded = true;
            updateStats();
        }, (error) => {
            console.error("useAgencyStats (hosts) Error:", error);
            hostsLoaded = true;
            updateStats();
        });

        const appsQuery = query(
            collection(db, 'host_applications'),
            where('status', '==', 'pending'),
            where('agencyId', '==', agencyId)
        );

        const unsubscribeApps = onSnapshot(appsQuery, (snapshot) => {
            pendingHostsCount = snapshot.size;
            appsLoaded = true;
            updateStats();
        }, (error) => {
            console.error("useAgencyStats (apps) Error:", error);
            appsLoaded = true;
            updateStats();
        });

        return () => {
            unsubscribeHosts();
            unsubscribeApps();
        };
    }, [agencyId]);

    return { stats, loading };
}
