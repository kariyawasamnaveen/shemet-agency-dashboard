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
    writeBatch,
    serverTimestamp
} from 'firebase/firestore'
import { useRouter } from 'next/navigation'

export default function HostApplicationsPage() {
    const { agency: agent, loading: authLoading } = useAgency()
    const router = useRouter()
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState(null)

    // Redirect if not admin
    useEffect(() => {
        if (!authLoading && !agent?.isAdmin) {
            router.push('/')
        }
    }, [agent, authLoading, router])

    useEffect(() => {
        if (!agent?.isAdmin) return

        // Fetch all pending host applications
        const q = query(
            collection(db, "host_applications"),
            where("status", "==", "pending"),
            orderBy("createdAt", "desc")
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setApplications(docs)
            setLoading(false)
        }, (error) => {
            console.error("Error fetching applications:", error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [agent])

    const handleApprove = async (app) => {
        if (!confirm(`Approve host application for ${app.userName}?`)) return

        setProcessingId(app.id)
        try {
            const batch = writeBatch(db)

            // 1. Update application status
            const appRef = doc(db, "host_applications", app.id)
            batch.update(appRef, {
                status: 'approved',
                updatedAt: serverTimestamp(),
                approvedAt: serverTimestamp(),
                processedBy: agent.uid
            })

            // 2. Update user profile
            const userRef = doc(db, "users", app.userId)
            batch.update(userRef, {
                isHost: true,
                agencyId: app.agencyId, // Bind to the agency that invited them
                updatedAt: serverTimestamp()
            })

            await batch.commit()
            alert(`${app.userName} is now a Host!`)
        } catch (error) {
            console.error("Error approving application:", error)
            alert('Failed to approve application.')
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (app) => {
        const reason = prompt("Reason for rejection:")
        if (reason === null) return

        setProcessingId(app.id)
        try {
            await updateDoc(doc(db, "host_applications", app.id), {
                status: 'rejected',
                rejectionReason: reason,
                updatedAt: serverTimestamp(),
                processedBy: agent.uid
            })
            alert('Application rejected.')
        } catch (error) {
            console.error("Error rejecting application:", error)
        } finally {
            setProcessingId(null)
        }
    }

    if (authLoading || (loading && agent?.isAdmin)) return <div style={{ padding: 40, textAlign: 'center' }}>Loading applications...</div>

    if (!agent?.isAdmin) return null

    return (
        <main style={{ padding: 24, background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
            <header style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: 0, marginBottom: 8 }}>Host Applications</h1>
                <p style={{ color: '#64748b', margin: 0 }}>Review and approve new host onboarding requests.</p>
            </header>

            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: '#475569' }}>User</th>
                            <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: '#475569' }}>Applied Agency</th>
                            <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: '#475569' }}>Selfie Info</th>
                            <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: '#475569' }}>Date</th>
                            <th style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700, color: '#475569', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No pending applications.</td>
                            </tr>
                        ) : (
                            applications.map((app) => (
                                <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{app.userName}</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{app.userId}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: 13, color: '#3a2639', fontWeight: 600 }}>{app.agencyName || 'Direct'}</div>
                                        <div style={{ fontSize: 11, color: '#94a3b8' }}>ID: {app.agencyId}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        {app.photoUrl ? (
                                            <a href={app.photoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: 12, fontWeight: 600 }}>View Verification Photo</a>
                                        ) : 'No photo'}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: 13, color: '#64748b' }}>
                                        {app.createdAt?.toDate ? app.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => handleReject(app)}
                                                style={{ padding: '6px 12px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                                            >Reject</button>
                                            <button
                                                onClick={() => handleApprove(app)}
                                                style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                                            >Approve</button>
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
