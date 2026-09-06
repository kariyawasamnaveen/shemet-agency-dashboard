'use client'

import { useState } from 'react'

export default function SettingsPage() {
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        sms: false
    })

    const toggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
    }

    return (
        <main style={{ background: '#f0f2f5', minHeight: '100vh', padding: '16px 24px' }}>
            {/* Breadcrumbs */}
            <nav style={{ fontSize: 13, color: '#666', marginBottom: 16, display: 'flex', gap: 8 }}>
                <span>Home</span>
                <span>/</span>
                <span style={{ color: '#111' }}>Settings</span>
            </nav>

            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginBottom: 24 }}>Account & Security</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 800 }}>

                {/* Security Section */}
                <section style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 20 }}>
                        Security & Passwords
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>Login Password</div>
                                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Regularly update your password to keep your account secure.</div>
                            </div>
                            <button style={{
                                padding: '8px 24px',
                                border: '1px solid #e2e8f0',
                                borderRadius: 6,
                                background: '#fff',
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: 'pointer',
                                color: '#3a2639'
                            }}>Change</button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>Withdrawal PIN</div>
                                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Required for all financial transactions and withdrawals.</div>
                            </div>
                            <button style={{
                                padding: '8px 24px',
                                border: '1px solid #e2e8f0',
                                borderRadius: 6,
                                background: '#fff',
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: 'pointer',
                                color: '#3a2639'
                            }}>Modify</button>
                        </div>
                    </div>
                </section>

                {/* Notifications Section */}
                <section style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 20 }}>
                        Notification Preferences
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {[
                            { id: 'email', label: 'Email Notifications', desc: 'Receive daily reports and payment alerts via email.' },
                            { id: 'push', label: 'Push Notifications', desc: 'Get instant alerts about host activities on your device.' },
                            { id: 'sms', label: 'SMS Alerts', desc: 'Receive critical security alerts via text message.' }
                        ].map((item) => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>{item.label}</div>
                                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{item.desc}</div>
                                </div>
                                <div
                                    onClick={() => toggleNotification(item.id)}
                                    style={{
                                        width: 44,
                                        height: 24,
                                        background: notifications[item.id] ? '#3a2639' : '#e2e8f0',
                                        borderRadius: 12,
                                        position: 'relative',
                                        cursor: 'pointer',
                                        transition: 'background 0.3s'
                                    }}
                                >
                                    <div style={{
                                        width: 18,
                                        height: 18,
                                        background: '#fff',
                                        borderRadius: '50%',
                                        position: 'absolute',
                                        top: 3,
                                        left: notifications[item.id] ? 23 : 3,
                                        transition: 'left 0.3s'
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Interface Settings */}
                <section style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111', marginBottom: 20 }}>
                        Interface & Language
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'start', gap: 40 }}>
                            <div style={{ width: 200 }}>
                                <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>Language</div>
                                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Select your preferred language.</div>
                            </div>
                            <select style={{
                                padding: '10px 16px',
                                border: '1px solid #e2e8f0',
                                borderRadius: 6,
                                background: '#f8fafc',
                                fontSize: 13,
                                width: 200,
                                outline: 'none'
                            }}>
                                <option>English (US)</option>
                                <option>Sinhala (SL)</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'start', gap: 40 }}>
                            <div style={{ width: 200 }}>
                                <div style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>Dark Mode</div>
                                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Adjust the visual appearance.</div>
                            </div>
                            <div style={{
                                width: 44,
                                height: 24,
                                background: '#e2e8f0',
                                borderRadius: 12,
                                position: 'relative',
                                cursor: 'wait'
                            }}>
                                <div style={{ width: 18, height: 18, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, left: 3 }} />
                            </div>
                        </div>
                    </div>
                </section>

                <div style={{ marginTop: 20, display: 'flex', gap: 16 }}>
                    <button style={{
                        background: 'linear-gradient(135deg, #573955, #3a2639)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '12px 32px',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(58, 38, 57, 0.15)'
                    }}>Save Changes</button>
                    <button style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        border: 'none',
                        borderRadius: 6,
                        padding: '12px 32px',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}>Reset to Default</button>
                </div>
            </div>
        </main>
    )
}
