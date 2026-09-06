'use client'

import { useState, useEffect } from 'react'
import { useAgency } from '../../../../lib/hooks'
import { db } from '../../../../lib/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

export default function ExtraRewardsPage() {
    const { agency } = useAgency()
    const [subAgents, setSubAgents] = useState([])
    const [loading, setLoading] = useState(true)

    const brandPlum = '#3a2639'

    useEffect(() => {
        if (!agency) return;

        if (!agency.agencyId) {
            console.warn("User has no agencyId, cannot fetch sub-agent rewards.");
            setLoading(false);
            return;
        }

        console.log("Fetching sub-agents for extra rewards. Master Agency ID:", agency.agencyId);

        // Fetch sub-agents for this agency
        // We look in 'users' collection for items where isAgent is true AND parentAgencyId matches
        const q = query(
            collection(db, "users"),
            where("isAgent", "==", true),
            where("parentAgencyId", "==", agency.agencyId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            console.log(`Found ${snapshot.size} sub-agents.`);
            const agentList = snapshot.docs.map(doc => {
                const data = doc.data();
                // We calculate commission based on their network revenue
                // For now using data.totalRevenue if it exists, or 0
                const revenue = data.networkRevenue || 0; 
                return {
                    id: doc.id,
                    shemetId: data.shemetId || doc.id,
                    name: data.name || 'Unknown',
                    totalHosts: data.hostsInvitedCount || 0,
                    revenue: revenue,
                    commission: revenue * 0.1, // 10% sub-agent network commission
                };
            });
            setSubAgents(agentList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching sub-agents:", error);
            setLoading(false);
        });

        // Safety timeout
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
                <h1 style={{ color: brandPlum, fontSize: 24, fontWeight: 700 }}>Extra Rewards</h1>
                <p style={{ color: '#64748b', marginTop: 4 }}>Commissions earned from your sub-agent network.</p>
            </div>

            <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                <th style={{ padding: 12, color: '#64748b', fontSize: 13, fontWeight: 600 }}>Agent ID</th>
                                <th style={{ padding: 12, color: '#64748b', fontSize: 13, fontWeight: 600 }}>Agent Name</th>
                                <th style={{ padding: 12, color: '#64748b', fontSize: 13, fontWeight: 600 }}>Total Hosts</th>
                                <th style={{ padding: 12, color: '#64748b', fontSize: 13, fontWeight: 600 }}>Network Revenue</th>
                                <th style={{ padding: 12, color: '#64748b', fontSize: 13, fontWeight: 600 }}>Extra Bonus (10%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>Loading sub-agents...</td>
                                </tr>
                            ) : subAgents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No sub-agents found.</td>
                                </tr>
                            ) : (
                                subAgents.map((item) => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: 12, fontSize: 14 }}>{item.id}</td>
                                        <td style={{ padding: 12, fontSize: 14, fontWeight: 500 }}>{item.name}</td>
                                        <td style={{ padding: 12, fontSize: 14 }}>{item.totalHosts}</td>
                                        <td style={{ padding: 12, fontSize: 14 }}>${item.revenue.toFixed(2)}</td>
                                        <td style={{ padding: 12, fontSize: 14, color: '#10b981', fontWeight: 600 }}>
                                            +${item.commission.toFixed(2)}
                                        </td>
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
