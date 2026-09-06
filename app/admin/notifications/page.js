'use client'

import { useState } from 'react'
import { useAgency } from '../../context/AgencyContext'
import { db } from '@/lib/firebase'
import {
    collection,
    addDoc,
    serverTimestamp
} from 'firebase/firestore'
import { useRouter } from 'next/navigation'

export default function AdminNotificationsPage() {
    const { agent, loading: authLoading } = useAgency()
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [status, setStatus] = useState('')
    const [sending, setSending] = useState(false)

    if (authLoading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
    if (!agent?.isAdmin) {
        if (typeof window !== 'undefined') router.push('/')
        return null
    }

    const handleBroadcast = async (e) => {
        e.preventDefault()
        if (!title.trim() || !message.trim()) return alert('Please enter both title and message.')

        if (!confirm('Are you sure you want to broadcast this message to all agents?')) return

        setSending(true)
        setStatus('')
        try {
            await addDoc(collection(db, "admin_broadcasts"), {
                title,
                message,
                senderId: agent.uid,
                senderName: agent.name || 'Admin',
                createdAt: serverTimestamp(),
                type: 'broadcast'
            })

            setStatus('Broadcast message sent successfully!')
            setTitle('')
            setMessage('')
        } catch (error) {
            console.error("Error sending broadcast:", error)
            setStatus('Failed to send broadcast: ' + error.message)
        } finally {
            setSending(false)
        }
    }

    return (
        <main style={{ padding: 24, background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
            <header style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: 0, marginBottom: 8 }}>Notification Center</h1>
                <p style={{ color: '#64748b', margin: 0 }}>Broadcast official announcements and notifications to all agents.</p>
            </header>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">New Agency Broadcast</h2>
                    <p className="text-sm text-slate-500">This message will be visible to all registered Agency Owners.</p>
                </div>

                {status && (
                    <div className={`mx-8 mt-6 p-4 rounded-xl text-center font-bold ${status.includes('successfully') ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {status}
                    </div>
                )}

                <form onSubmit={handleBroadcast} className="p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Message Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Weekly Commission Update"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3a2639]/20"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Notice Content</label>
                        <textarea
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message here..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3a2639]/20"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={sending}
                        className="w-full py-4 bg-[#3a2639] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#4e344d] transition-all shadow-lg shadow-[#3a2639]/20 disabled:opacity-50"
                    >
                        {sending ? 'Broadcasting...' : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                                Send Broadcast to All Agents
                            </>
                        )}
                    </button>

                    <div style={{ marginTop: 24, padding: 16, background: '#fff7ed', borderRadius: 8, border: '1px solid #ffedd5' }}>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ color: '#f97316' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#9a3412' }}>Attention</h4>
                                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#c2410c' }}>This message will be visible to all registered agents on their mobile app immediately after sending.</p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    )
}
