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
        if (!agency?.agencyId) return;

        // Fetch sub-agents for this agency
        const q = query(
            collection(db, "agencies"),
            where("parentAgencyId", "==", agency.agencyId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const agentList = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name || 'Unknown',
                    totalHosts: data.hostCount || 0,
                    revenue: data.totalRevenue || 0,
                    commission: (data.totalRevenue || 0) * 0.1, // Example 10% sub-agent commission
                };
            });
            setSubAgents(agentList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching sub-agents:", error);
            setLoading(false);
        });

        return () => unsubscribe();
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
