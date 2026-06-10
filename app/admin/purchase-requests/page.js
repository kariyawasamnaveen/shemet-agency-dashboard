'use client'

import { useState, useEffect } from 'react'
import { useAgency } from '../../context/AgencyContext'
import { db } from '@/lib/firebase'
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    doc, 
    runTransaction, 
    serverTimestamp,
    orderBy
} from 'firebase/firestore'
import ShemetLoader from '../../components/ShemetLoader'

export default function AdminPurchaseRequestsPage() {
    const { agent, loading: authLoading } = useAgency()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState(null)
    const [error, setError] = useState('')

    const brandPlum = '#3a2639'
    const brandPink = '#ff1493'

    useEffect(() => {
        if (!authLoading && !agent?.isAdmin) {
            window.location.href = '/'
            return
        }
        fetchRequests()
    }, [agent, authLoading])

    const fetchRequests = async () => {
        setLoading(true)
        try {
            const q = query(
                collection(db, "diamond_purchase_requests"), 
                where("status", "==", "pending")
            )
            const snapshot = await getDocs(q)
            const reqData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setRequests(reqData)
        } catch (err) {
            console.error(err)
            setError('Failed to load requests.')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (request) => {
        if (!confirm(`Approve ${request.amount.toLocaleString()} diamonds for ${request.agentName}?`)) return
        
        setProcessingId(request.id)
        try {
            await runTransaction(db, async (transaction) => {
                // 1. Get Dealer Record
                const dealerQuery = query(collection(db, "diamond_dealers"), where("uid", "==", request.agentUid))
                const dealerSnap = await getDocs(dealerQuery)
                
                if (dealerSnap.empty) {
                    throw new Error("Target agent is not registered as a diamond dealer.")
                }
                
                const dealerDoc = dealerSnap.docs[0]
                const dealerRef = doc(db, "diamond_dealers", dealerDoc.id)
                const currentInventory = dealerDoc.data().inventoryDiamonds || 0

                // 2. Update Request Status
                const requestRef = doc(db, "diamond_purchase_requests", request.id)
                transaction.update(requestRef, { 
                    status: 'approved',
                    updatedAt: serverTimestamp() 
                })

                // 3. Update Dealer Balance
                transaction.update(dealerRef, {
                    inventoryDiamonds: currentInventory + request.amount,
                    updatedAt: serverTimestamp()
                })

                // 4. Log the Transaction
                const logRef = doc(collection(db, "diamond_recharge_logs"))
                transaction.set(logRef, {
                    agentUid: request.agentUid,
                    agentId: request.agentId,
                    amount: request.amount,
                    previousBalance: currentInventory,
                    newBalance: currentInventory + request.amount,
                    approvedBy: agent.uid,
                    timestamp: serverTimestamp(),
                    type: 'inventory_replenishment',
                    requestId: request.id
                })
            })

            setRequests(prev => prev.filter(r => r.id !== request.id))
            alert('Request approved and diamonds credited!')
        } catch (err) {
            console.error(err)
            alert('Approval failed: ' + err.message)
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (requestId) => {
        const reason = prompt("Enter reason for rejection:")
        if (!reason) return

        setProcessingId(requestId)
        try {
            const reqRef = doc(db, "diamond_purchase_requests", requestId)
            const { updateDoc } = await import('firebase/firestore')
            // Using direct updateDoc here to keep it simple if no race condition expected for rejection
            await updateDoc(reqRef, {
                status: 'rejected',
                rejectionReason: reason,
                updatedAt: serverTimestamp()
            })
            setRequests(prev => prev.filter(r => r.id !== requestId))
        } catch (err) {
            console.error(err)
            alert('Rejection failed.')
        } finally {
            setProcessingId(null)
        }
    }

    if (authLoading || loading) return <ShemetLoader />

    return (
        <main style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '900', color: brandPlum, margin: 0 }}>Diamond Purchase Requests</h1>
                <p style={{ color: '#64748b', marginTop: '8px' }}>Review and approve emerald inventory orders from agents.</p>
            </header>

            {requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 0', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>☕</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#64748b' }}>No pending requests found</h3>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                    {requests.map((req) => (
                        <div key={req.id} style={{ 
                            background: '#fff', 
                            borderRadius: '24px', 
                            padding: '24px', 
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: brandPlum }}>{req.agentName}</h3>
                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Agent ID: {req.agentId}</div>
                                </div>
                                <div style={{ background: '#fef3c7', color: '#92400e', padding: '6px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: '800' }}>
                                    💎 {req.amount.toLocaleString()}
                                </div>
                            </div>

                            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>PAYMENT PROOF</div>
                                <a href={req.proofUrl} target="_blank" rel="noopener noreferrer">
                                    <img 
                                        src={req.proofUrl} 
                                        alt="Proof" 
                                        style={{ width: '100%', height: '200px', objectFit: 'cover', cursor: 'zoom-in' }} 
                                    />
                                </a>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <button
                                    onClick={() => handleApprove(req)}
                                    disabled={processingId === req.id}
                                    style={{
                                        padding: '12px',
                                        background: '#10b981',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: '800',
                                        cursor: processingId === req.id ? 'not-allowed' : 'pointer',
                                        opacity: processingId === req.id ? 0.7 : 1
                                    }}
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleReject(req.id)}
                                    disabled={processingId === req.id}
                                    style={{
                                        padding: '12px',
                                        background: '#fff',
                                        color: '#ef4444',
                                        border: '1px solid #ef4444',
                                        borderRadius: '12px',
                                        fontWeight: '800',
                                        cursor: processingId === req.id ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    )
}
