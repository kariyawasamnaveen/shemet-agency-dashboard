'use client'

import { useState, useEffect } from 'react'
import { useAgency } from '../../../lib/hooks'
import { db } from '../../../lib/firebase'
import { collection, query, where, getDocs, Timestamp, onSnapshot } from 'firebase/firestore'

export default function AgentDailyReportPage() {
    const { agency } = useAgency()
    const [subAgents, setSubAgents] = useState([])
    const [agentStats, setAgentStats] = useState({})
    const [loading, setLoading] = useState(true)
    const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0])

    const brandPlum = '#3a2639'

    // 1. Fetch sub-agents for this agency
    useEffect(() => {
        if (!agency?.agencyId) return;

        const q = query(
            collection(db, "users"),
            where("isAgent", "==", true),
            where("parentAgencyId", "==", agency.agencyId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name || 'Unnamed Agent',
                ...doc.data()
            }));
            setSubAgents(list);
        });

        return () => unsubscribe();
    }, [agency]);

    // 2. Fetch and aggregate performance for sub-agents
    const fetchAgentPerformance = async () => {
        if (!agency?.agencyId || subAgents.length === 0) return;

        setLoading(true);
        try {
            const startOfDay = new Date(searchDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(searchDate);
            endOfDay.setHours(23, 59, 59, 999);

            const stats = {};
            // Initialize for each sub-agent
            for (const sa of subAgents) {
                // Find hosts for this sub-agent
                const hostsQuery = query(
                    collection(db, "users"),
                    where("isHost", "==", true),
                    where("agencyId", "==", sa.agencyId)
                );
                const hostsSnap = await getDocs(hostsQuery);
                const hostIds = hostsSnap.docs.map(d => d.id);

                let revenue = 0;
                if (hostIds.length > 0) {
                    // This is a simplified fetch - ideally you'd have a 'daily_agency_stats' collection
                    const txQuery = query(
                        collection(db, "gift_transactions"),
                        where("receiverId", "in", hostIds.slice(0, 10)), // Firestore 'in' limit is 10
                        where("timestamp", ">=", Timestamp.fromDate(startOfDay)),
                        where("timestamp", "<=", Timestamp.fromDate(endOfDay))
                    );
                    const txSnap = await getDocs(txQuery);
                    txSnap.docs.forEach(doc => {
                        revenue += (doc.data().diamondAmount || 0);
                    });
                }

                let callRevenue = 0;
                if (hostIds.length > 0) {
                    const callsQuery = query(
                        collection(db, "calls"),
                        where("receiverId", "in", hostIds.slice(0, 10)),
                        where("endedAt", ">=", Timestamp.fromDate(startOfDay)),
                        where("endedAt", "<=", Timestamp.fromDate(endOfDay))
                    );
                    const callsSnap = await getDocs(callsQuery);
                    callsSnap.docs.forEach(doc => {
                        callRevenue += (doc.data().diamondsEarned || 0);
                    });
                }

                const totalDiamonds = revenue + callRevenue;
                const withdrawableRevenue = (totalDiamonds * 0.6) / 100; // Converted to USD

                stats[sa.id] = {
                    activeHosts: hostIds.length,
                    revenue: withdrawableRevenue,
                    commission: withdrawableRevenue * 0.1 // 10% of the withdrawable revenue
                };
            }
            setAgentStats(stats);
        } catch (error) {
            console.error("Error fetching agent performance:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAgentPerformance();
    }, [searchDate, subAgents]);

    // Prepare table data
    const agencyData = subAgents.map((sa, i) => ({
        rank: i + 1,
        name: sa.name,
        date: searchDate,
        activeHosts: agentStats[sa.id]?.activeHosts || 0,
        totalRevenue: `$${((agentStats[sa.id]?.revenue || 0) / 100).toFixed(2)}`,
        commission: `$${((agentStats[sa.id]?.commission || 0) / 100).toFixed(2)}`
    }));

    const totalRevenue = Object.values(agentStats).reduce((sum, s) => sum + s.revenue, 0);
    const activeAgencies = subAgents.length;

    return (
        <main style={{ background: '#f0f2f5', minHeight: '100vh', padding: '16px 16px' }}>
            <div style={{ width: '100%' }}>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 8, display: 'flex', gap: 6 }}>
                    <span>Reports</span> / <span style={{ color: '#111' }}>Agent Daily Report</span>
                </div>
                <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginBottom: 24 }}>Agent Daily Report</h1>

                <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    {/* Summary Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                        <div style={{ padding: 16, borderRadius: 8, border: '1px solid #f1f5f9', background: '#f8fafc' }}>
                            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total Agency Earnings</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: brandPlum }}>${(totalRevenue).toFixed(2)}</div>
                        </div>
                        <div style={{ padding: 16, borderRadius: 8, border: '1px solid #f1f5f9', background: '#f8fafc' }}>
                            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Active Agencies Today</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: brandPlum }}>{activeAgencies}</div>
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: 'auto', border: '1px solid #f0f0f0', borderRadius: 8 }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>Calculating agency performance...</div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                                        <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Rank</th>
                                        <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Agency Name</th>
                                        <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Date</th>
                                        <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Active Hosts</th>
                                        <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Total Revenue (60%)</th>
                                        <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Net Commission</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {agencyData.map((row, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                            <td style={{ padding: '16px', fontSize: 14, fontWeight: 700, color: i < 3 ? '#f59e0b' : '#666' }}>#{row.rank}</td>
                                            <td style={{ padding: '16px', fontSize: 13, color: '#3a2639', fontWeight: 600 }}>{row.name}</td>
                                            <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.date}</td>
                                            <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.activeHosts}</td>
                                            <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.totalRevenue}</td>
                                            <td style={{ padding: '16px', fontSize: 13, color: '#10b981', fontWeight: 600 }}>{row.commission}</td>
                                        </tr>
                                    ))}
                                    {agencyData.length === 0 && (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#999' }}>No sub-agent data found for this date.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
