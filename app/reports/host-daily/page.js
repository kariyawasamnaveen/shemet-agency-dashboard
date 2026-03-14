'use client'

import { useState, useEffect } from 'react'
import { useAgency } from '../../../lib/hooks'
import { db } from '../../../lib/firebase'
import { collection, query, where, getDocs, Timestamp, onSnapshot } from 'firebase/firestore'

export default function HostDailyReportPage() {
    const { agency } = useAgency()
    const [hosts, setHosts] = useState([])
    const [dailyStats, setDailyStats] = useState({})
    const [loading, setLoading] = useState(true)
    const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0])
    const [searchTerm, setSearchTerm] = useState('')

    const brandPlum = '#3a2639'

    // 1. Fetch agency hosts
    useEffect(() => {
        if (!agency?.agencyId) return;

        const q = query(
            collection(db, "users"),
            where("isHost", "==", true),
            where("agencyId", "==", agency.agencyId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                nickname: doc.data().name || 'No Name',
                level: doc.data().level || 0,
                ...doc.data()
            }));
            setHosts(list);
        });

        return () => unsubscribe();
    }, [agency]);

    // 2. Fetch and aggregate transactions for searching date
    const fetchDailyStats = async () => {
        if (!agency?.agencyId || hosts.length === 0) return;

        setLoading(true);
        try {
            const startOfDay = new Date(searchDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(searchDate);
            endOfDay.setHours(23, 59, 59, 999);

            const q = query(
                collection(db, "gift_transactions"),
                where("timestamp", ">=", Timestamp.fromDate(startOfDay)),
                where("timestamp", "<=", Timestamp.fromDate(endOfDay))
            );

            const snapshot = await getDocs(q);
            const stats = {};

            // Initialize stats for each agency host
            hosts.forEach(h => {
                stats[h.id] = { coins: 0, callDiamonds: 0, duration: '0h 0m', status: 'Completed' };
            });

            // 2a. Process gift transactions
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (stats[data.receiverId]) {
                    stats[data.receiverId].coins += (data.diamondAmount || 0);
                }
            });

            // 2b. Process call transactions
            const callsQuery = query(
                collection(db, "calls"),
                where("endedAt", ">=", Timestamp.fromDate(startOfDay)),
                where("endedAt", "<=", Timestamp.fromDate(endOfDay)),
                where("receiverId", "in", hosts.map(h => h.id).slice(0, 10))
            );
            const callsSnapshot = await getDocs(callsQuery);
            callsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                if (stats[data.receiverId]) {
                    stats[data.receiverId].callDiamonds += (data.diamondsEarned || 0);
                }
            });

            setDailyStats(stats);
        } catch (error) {
            console.error("Error fetching daily report:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDailyStats();
    }, [searchDate, hosts]);

    // Prepare table data
    const dailyData = hosts
        .filter(h => h.id.includes(searchTerm) || h.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(h => ({
            id: h.id,
            nickname: h.nickname,
            level: h.level,
            date: searchDate,
            liveDuration: dailyStats[h.id]?.duration || '0h 0m',
            coins: (dailyStats[h.id]?.coins || 0) + (dailyStats[h.id]?.callDiamonds || 0),
            earnings: `$${((((dailyStats[h.id]?.coins || 0) + (dailyStats[h.id]?.callDiamonds || 0)) * 0.6) / 100).toFixed(2)}`,
            status: dailyStats[h.id]?.status || 'Completed'
        }));

    return (
        <main style={{ background: '#f0f2f5', minHeight: '100vh', padding: '16px 16px' }}>
            <div style={{ width: '100%' }}>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 8, display: 'flex', gap: 6 }}>
                    <span>Reports</span> / <span style={{ color: '#111' }}>Host Daily Report</span>
                </div>
                <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginBottom: 24 }}>Host Daily Report</h1>

                <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    {/* Filters */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                        <input
                            type="date"
                            defaultValue="2026-03-12"
                            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                        />
                        <input
                            type="text"
                            placeholder="Host ID"
                            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, width: 150 }}
                        />
                        <button style={{
                            background: brandPlum,
                            color: '#fff',
                            border: 'none',
                            padding: '8px 24px',
                            borderRadius: 4,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}>Search</button>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: 'auto', border: '1px solid #f0f0f0', borderRadius: 8 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Host ID</th>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Nickname</th>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Level</th>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Date</th>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Live Duration</th>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Total Diamonds</th>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>USD Earnings (60%)</th>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dailyData.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#3a2639', fontWeight: 500 }}>{row.id}</td>
                                        <td style={{ padding: '16px', fontSize: 13 }}>{row.nickname}</td>
                                        <td style={{ padding: '16px', fontSize: 13 }}>
                                            <span style={{ background: '#7c3aed', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 10 }}>Lv.{row.level}</span>
                                        </td>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.date}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.liveDuration}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.coins.toLocaleString()}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>{row.earnings}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: row.status === 'Completed' ? '#10b981' : '#f59e0b' }}>{row.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    )
}
