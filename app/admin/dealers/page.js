'use client'

import { useState, useEffect } from 'react'
import { useAgency } from '../../../lib/hooks'
import { db } from '@/lib/firebase'
import {
    collection,
    query,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp,
    increment,
    orderBy
} from 'firebase/firestore'
import { useRouter } from 'next/navigation'

export default function AdminDealersPage() {
    const { agency: agent, loading: authLoading } = useAgency()
    const router = useRouter()
    const [dealers, setDealers] = useState([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState(null)
    const [topupForm, setTopupForm] = useState({ id: '', amount: '' })

    const brandPlum = '#3a2639'

    const isSuperAdmin = agent?.email === 'hknskariyawasamnaveen@gmail.com';

    // Redirect if not super admin
    useEffect(() => {
        if (!authLoading && !isSuperAdmin) {
            router.push('/')
        }
    }, [isSuperAdmin, authLoading, router])

    useEffect(() => {
        if (!isSuperAdmin) return

        const q = query(collection(db, "diamond_dealers"), orderBy("createdAt", "desc"))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setDealers(list)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [agent])

    const handleStatusChange = async (id, newStatus) => {
        if (!confirm(`Change dealer status to ${newStatus}?`)) return
        setProcessingId(id)
        try {
            await updateDoc(doc(db, "diamond_dealers", id), {
                status: newStatus,
                updatedAt: serverTimestamp()
            })
            alert(`Dealer ${newStatus}!`)
        } catch (error) {
            console.error("Status Update Error:", error)
        } finally {
            setProcessingId(null)
        }
    }

    const handleTopup = async (e) => {
        e.preventDefault()
        const amount = parseInt(topupForm.amount)
        if (isNaN(amount) || amount <= 0) return

        setProcessingId(topupForm.id)
        try {
            await updateDoc(doc(db, "diamond_dealers", topupForm.id), {
                inventoryDiamonds: increment(amount),
                updatedAt: serverTimestamp()
            })
            alert(`Added ${amount} diamonds to stock.`)
            setTopupForm({ id: '', amount: '' })
        } catch (error) {
            console.error("Topup Error:", error)
        } finally {
            setProcessingId(null)
        }
    }

    if (authLoading || (loading && agent?.isAdmin)) return <div style={{ padding: 40, textAlign: 'center' }}>Loading dealers...</div>
    if (!agent?.isAdmin) return null

    return (
        <main style={{ padding: 24, background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
            <header style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, marginBottom: 8 }}>Diamond Dealers Management</h1>
                <p style={{ color: '#64748b', margin: 0 }}>Review applications and manage distributor inventory.</p>
            </header>

            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f1f5f9' }}>
                        <tr>
                            <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700 }}>Dealer / Agency</th>
                            <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700 }}>Stock (Diamonds)</th>
                            <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700 }}>Status</th>
                            <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dealers.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No dealer records found.</td></tr>
                        ) : (
                            dealers.map(dealer => (
                                <tr key={dealer.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: 600 }}>{dealer.officialName}</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8' }}>Agency ID: {dealer.agencyId}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: 15, fontWeight: 800, color: brandPlum }}>{dealer.inventoryDiamonds?.toLocaleString() || 0}</div>
                                        <button
                                            onClick={() => setTopupForm({ id: dealer.id, amount: '' })}
                                            style={{ fontSize: 11, color: '#3b82f6', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 600 }}
                                        >+ Add Stock</button>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{
                                            fontSize: 10,
                                            padding: '4px 8px',
                                            borderRadius: 20,
                                            fontWeight: 700,
                                            background: dealer.status === 'authorized' ? '#f0fdf4' : dealer.status === 'pending' ? '#fffbeb' : '#fef2f2',
                                            color: dealer.status === 'authorized' ? '#15803d' : dealer.status === 'pending' ? '#92400e' : '#b91c1c'
                                        }}>
                                            {dealer.status?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {dealer.status === 'pending' && (
                                                <button
                                                    onClick={() => handleStatusChange(dealer.id, 'authorized')}
                                                    style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                                                >Approve</button>
                                            )}
                                            {dealer.status === 'authorized' ? (
                                                <button
                                                    onClick={() => handleStatusChange(dealer.id, 'suspended')}
                                                    style={{ padding: '6px 12px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                                                >Suspend</button>
                                            ) : dealer.status !== 'pending' ? (
                                                <button
                                                    onClick={() => handleStatusChange(dealer.id, 'authorized')}
                                                    style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                                                >Restore</button>
                                            ) : null}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Topup Modal (Simplified) */}
            {topupForm.id && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div style={{ background: '#fff', padding: 32, borderRadius: 16, width: 400 }}>
                        <h3 style={{ marginBottom: 16 }}>Top-up Dealer Stock</h3>
                        <form onSubmit={handleTopup}>
                            <input
                                type="number"
                                placeholder="Diamond Amount"
                                value={topupForm.amount}
                                onChange={(e) => setTopupForm({ ...topupForm, amount: e.target.value })}
                                required
                                style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, marginBottom: 16 }}
                            />
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="button" onClick={() => setTopupForm({ id: '', amount: '' })} style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #ddd' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: 12, background: brandPlum, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700 }}>Confirm</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}
