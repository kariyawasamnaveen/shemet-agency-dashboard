'use client'

import { useState } from 'react'

export default function NotificationPage() {
    const [selectedId, setSelectedId] = useState(1)

    const brandPlum = '#3a2639'

    const notifications = [
        {
            id: 1,
            title: 'Report failed!',
            date: '2026-03-11 11:52:45',
            content: `After verification, your report against 103681240 - Scam for money or account is invalid.\n\nDear user, thanks for your report. However, the evidence you provided is insufficient. Please submit again with more information. Thank you!\n\n- For multiple accounts reports, please report the user's New account and specify the user's Old account in the description part.\n\n- For fraud & scam reports, please share the FULL chatting history with the relevant user.`
        },
        {
            id: 2,
            title: 'Thank you for reporting!',
            date: '2026-03-11 06:06:28',
            content: 'Thank you for your report. Our team has reviewed the information and taking necessary actions.'
        },
        {
            id: 3,
            title: 'Charm Queens Ranking Rules Update',
            date: '2025-12-31 14:31:43',
            content: 'Please note the upcoming changes to the Charm Queens Ranking rules effective from next month.'
        },
        {
            id: 4,
            title: 'Notice of Shemet Wallet Binding',
            date: '2025-12-30 15:22:40',
            content: 'Important notice regarding the binding of your Shemet Wallet account for secure transactions.'
        },
        {
            id: 5,
            title: 'Notice of Sanctions Regarding Violations...',
            date: '2025-12-10 09:54:44',
            content: 'We maintain a strict policy against platform violations. Please review the updated sanctions list.'
        }
    ]

    const selectedNotification = notifications.find(n => n.id === selectedId) || notifications[0]

    return (
        <main style={{ background: '#f0f2f5', minHeight: '100vh', padding: '16px 24px' }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginBottom: 24 }}>Notification</h1>

            <div style={{ display: 'flex', gap: 1, background: '#eee', borderRadius: 8, overflow: 'hidden', height: 'calc(100vh - 120px)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                {/* Master List */}
                <div style={{ width: 350, background: '#fff', overflowY: 'auto' }}>
                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => setSelectedId(n.id)}
                            style={{
                                padding: '24px',
                                borderBottom: '1px solid #f0f2f5',
                                cursor: 'pointer',
                                background: selectedId === n.id ? '#f8fafc' : '#fff',
                                position: 'relative'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'red', marginTop: 6 }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: selectedId === n.id ? brandPlum : '#333',
                                        marginBottom: 8,
                                        lineHeight: '1.4'
                                    }}>
                                        {n.title}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{n.date}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Detail View */}
                <div style={{ flex: 1, background: '#fff', padding: '40px', overflowY: 'auto' }}>
                    {selectedNotification && (
                        <div style={{ maxWidth: 800 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 8 }}>
                                {selectedNotification.title}
                            </h2>
                            <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 32 }}>
                                {selectedNotification.date}
                            </div>
                            <div style={{
                                fontSize: 14,
                                color: '#4b5563',
                                lineHeight: '1.8',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {selectedNotification.content}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
