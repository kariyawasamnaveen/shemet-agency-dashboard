'use client'

import { useState, useEffect } from 'react'
import { useAgency } from '../../context/AgencyContext'
import { db } from '@/lib/firebase'
import { collection, query, getDocs, orderBy, limit, startAfter } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

export default function SuperAdminTradeLogsPage() {
    const { agent, loading: authLoading } = useAgency()
    const router = useRouter()
    const isSuperAdmin = agent?.email === 'hknskariyawasamnaveen@gmail.com'

    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [lastVisible, setLastVisible] = useState(null)

    const brandPlum = '#3a2639'

    useEffect(() => {
        if (!authLoading && !isSuperAdmin) {
            router.push('/')
        }
    }, [isSuperAdmin, authLoading, router])

    useEffect(() => {
        if (isSuperAdmin) {
            fetchLogs()
        }
    }, [isSuperAdmin])

    const fetchLogs = async (loadMore = false) => {
        if (!isSuperAdmin) return
        if (!loadMore) setLoading(true)

        try {
            let q = query(
                collection(db, 'diamond_trade_transactions'),
                orderBy('createdAt', 'desc'),
                limit(20)
            )

            if (loadMore && lastVisible) {
                q = query(q, startAfter(lastVisible))
            }

            const snapshot = await getDocs(q)
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            
            setLastVisible(snapshot.docs[snapshot.docs.length - 1])
            
            if (loadMore) {
                setLogs(prev => [...prev, ...list])
            } else {
                setLogs(list)
            }
        } catch (error) {
            console.error('Error fetching trade logs:', error)
        }
        setLoading(false)
    }

    if (authLoading || (loading && logs.length === 0)) return <div style={{ padding: 40, textAlign: 'center' }}>Loading Diamond Trade Logs...</div>
    if (!isSuperAdmin) return null

    return (
        <main style={{ padding: 24, background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
            <header style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, marginBottom: 8 }}>Global Diamond Trade Logs</h1>
                    <p style={{ color: '#64748b', margin: 0 }}>Monitor all diamond transfers from agencies to users.</p>
                </div>
                <button 
                    onClick={() => fetchLogs(false)} 
                    style={{ padding: '10px 20px', background: brandPlum, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
                >
                    Refresh
                </button>
            </header>

            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f1f5f9' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700 }}>Time</th>
                            <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700 }}>Agent / Agency</th>
                            <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700 }}>Recipient (User ID)</th>
                            <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No trade transactions found.</td></tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px', fontSize: 13, color: '#64748b' }}>
                                        {log.createdAt?.toDate().toLocaleString() || 'Just now'}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: 600 }}>{log.agentName}</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8' }}>UID: {log.agentUid?.slice(0, 8)}...</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: 600 }}>{log.userName}</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8' }}>User ID: {log.userSequentialId}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <div style={{ fontSize: 16, fontWeight: 800, color: '#10b981' }}>+ 💎 {log.amount?.toLocaleString()}</div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {lastVisible && (
                <div style={{ textAlign: 'center', marginTop: 32 }}>
                    <button 
                        onClick={() => fetchLogs(true)} 
                        style={{ padding: '10px 30px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontWeight: 700, cursor: 'pointer', color: '#64748b' }}
                    >
                        Load More
                    </button>
                </div>
            )}
        </main>
    )
}
