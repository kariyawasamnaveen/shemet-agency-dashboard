'use client'

import { useState, useEffect } from 'react'
import { useAgency } from '../../../../lib/hooks'
import { db } from '../../../../lib/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

export default function RegularRewardsPage() {
    const { agency } = useAgency()
    const [rewards, setRewards] = useState([])
    const [loading, setLoading] = useState(true)

    const brandPlum = '#3a2639'

    useEffect(() => {
        if (!agency) return;

        // If user is logged in but doesn't have an agencyId (unlikely after repair), 
        // we should still stop the loading spinner
        if (!agency.agencyId) {
            console.warn("User has no agencyId, cannot fetch rewards.");
            setLoading(false);
            return;
        }

        console.log("Fetching host rewards for agency:", agency.agencyId);

        // Fetch hosts for this agency to calculate rewards
        const q = query(
            collection(db, "users"),
            where("isHost", "==", true),
            where("agencyId", "==", agency.agencyId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log(`Found ${snapshot.size} hosts for rewards.`);
            const hostRewards = snapshot.docs.map(doc => {
                const data = doc.data();
                const totalDiamonds = (data.diamonds || 0) + (data.points || 0);
                
                return {
                    id: doc.id,
                    shemetId: data.shemetId || doc.id,
                    name: data.name || 'Unknown',
                    diamonds: totalDiamonds,
                    withdrawableUSD: (totalDiamonds * 0.6) / 1000, 
                    lastActive: data.lastSeen?.toDate()?.toLocaleDateString() || '-',
                };
            });
            setRewards(hostRewards);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching host rewards:", error);
            setLoading(false);
        });

        // Safety timeout to prevent infinite loading
        const timer = setTimeout(() => {
            if (loading) setLoading(false);
        }, 8000);

        return () => {
            unsubscribe();
            clearTimeout(timer);
        };
    }, [agency]);

    return (
        <main style={{ padding: 24, background: '#f8f9fa', minHeight: '100vh' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ color: brandPlum, fontSize: 24, fontWeight: 700 }}>Regular Rewards</h1>
                <p style={{ color: '#64748b', marginTop: 4 }}>Commissions and rewards from your direct hosts.</p>
            </div>

            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                <th style={{ padding: 12, color: '#64748b', fontSize: 13, fontWeight: 600 }}>Host ID</th>
                                <th style={{ padding: 12, color: '#64748b', fontSize: 13, fontWeight: 600 }}>Name</th>
                                <th style={{ padding: 12, color: '#64748b', fontSize: 13, fontWeight: 600 }}>Total Diamonds</th>
                                <th style={{ padding: 12, color: '#64748b', fontSize: 13, fontWeight: 600 }}>Withdrawable (60%)</th>
                                <th style={{ padding: 12, color: '#64748b', fontSize: 13, fontWeight: 600 }}>Last Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>Loading rewards...</td>
                                </tr>
                            ) : rewards.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No hosts found.</td>
                                </tr>
                            ) : (
                                rewards.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: 12, fontSize: 14 }}>{item.id}</td>
                                        <td style={{ padding: 12, fontSize: 14, fontWeight: 500 }}>{item.name}</td>
                                        <td style={{ padding: 12, fontSize: 14 }}>💎 {item.diamonds.toLocaleString()}</td>
                                        <td style={{ padding: 12, fontSize: 14, color: '#10b981', fontWeight: 600 }}>
                                            ${item.withdrawableUSD.toFixed(2)}
                                        </td>
                                        <td style={{ padding: 12, fontSize: 14, color: '#64748b' }}>{item.lastActive}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    )
}
