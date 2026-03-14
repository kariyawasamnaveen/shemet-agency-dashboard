'use client'

import { useState, useEffect } from 'react'
import { useAgency } from '../../../lib/hooks'
import { db } from '../../../lib/firebase'
import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    doc,
    updateDoc,
    increment,
    writeBatch,
    serverTimestamp
} from 'firebase/firestore'
import { useRouter } from 'next/navigation'

export default function WithdrawalsApprovalPage() {
    const { agent } = useAgency()
    const router = useRouter()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState(null)

    // Redirect if not admin
    useEffect(() => {
        if (!loading && !agent?.isAdmin) {
            router.push('/')
        }
    }, [agent, loading, router])

    useEffect(() => {
        if (!agent?.isAdmin) return

        const q = query(
            collection(db, "withdraw_requests"),
            where("status", "==", "pending"),
            orderBy("createdAt", "desc")
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setRequests(docs)
            setLoading(false)
        }, (error) => {
            console.error("Error fetching withdrawals:", error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [agent])

    const handleApprove = async (request) => {
        if (!confirm(`Are you sure you want to approve this withdrawal of $${request.amount} for ${request.userName}?`)) return

        setProcessingId(request.id)
        try {
            const batch = writeBatch(db)

            // 1. Update request status
            const requestRef = doc(db, "withdraw_requests", request.id)
            batch.update(requestRef, {
                status: 'approved',
                updatedAt: serverTimestamp(),
                approvedAt: serverTimestamp(),
                processedBy: agent.uid
            })

            // 2. Deduct diamonds from Agent
            // Logic: If request was $X, we need to find how many diamonds that represents.
            // Based on CoinsDiamondsPage: $USD = (Diamonds * 0.6) / 100
            // So Diamonds = (USD * 100) / 0.6
            const diamondsToDeduct = Math.ceil((request.amount * 100) / 0.6)

            const agentRef = doc(db, "users", request.userId)
            batch.update(agentRef, {
                diamonds: increment(-diamondsToDeduct),
                updatedAt: serverTimestamp()
            })

            await batch.commit()
            alert('Withdrawal approved and balance deducted successfully!')
        } catch (error) {
            console.error("Error approving withdrawal:", error)
            alert('Failed to approve withdrawal: ' + error.message)
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (request) => {
        const reason = prompt("Enter reason for rejection:")
        if (reason === null) return

        setProcessingId(request.id)
        try {
            await updateDoc(doc(db, "withdraw_requests", request.id), {
                status: 'rejected',
                rejectionReason: reason,
                updatedAt: serverTimestamp(),
                processedBy: agent.uid
            })
            alert('Withdrawal rejected.')
        } catch (error) {
            console.error("Error rejecting withdrawal:", error)
            alert('Failed to reject withdrawal.')
        } finally {
            setProcessingId(null)
        }
    }

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading pending withdrawals...</div>

    if (!agent?.isAdmin) return null

    return (
        <main style={{ padding: 24, background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
            <header style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: 0, marginBottom: 8 }}>Pending Withdrawals</h1>
                <p style={{ color: '#64748b', margin: 0 }}>Review and process agent payout requests.</p>
            </header>

            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: '#475569' }}>Agent</th>
                            <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: '#475569' }}>Amount (USD)</th>
                            <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: '#475569' }}>Address (TRC20)</th>
                            <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: '#475569' }}>Date</th>
                            <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: '#475569', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No pending withdrawal requests.</td>
                            </tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{req.userName}</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8' }}>ID: {req.userId}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ fontWeight: 800, color: '#059669', fontSize: 16 }}>${req.amount}</span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <code style={{ background: '#f8fafc', padding: '4px 8px', borderRadius: 6, fontSize: 12, color: '#475569' }}>{req.payoutAddress || 'Not set'}</code>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: 13, color: '#64748b' }}>
                                        {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => handleReject(req)}
                                                disabled={processingId === req.id}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: '#fee2e2',
                                                    color: '#b91c1c',
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleApprove(req)}
                                                disabled={processingId === req.id}
                                                style={{
                                                    padding: '8px 16px',
                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    fontSize: 12,
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                                                }}
                                            >
                                                {processingId === req.id ? 'Processing...' : 'Approve'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    )
}
