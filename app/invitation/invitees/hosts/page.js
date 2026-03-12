'use client'

import { useState } from 'react'

export default function HostsListPage() {
    const [showAddHostModal, setShowAddHostModal] = useState(false)
    const [addHostForm, setAddHostForm] = useState({ id: '', contact: '' })
    const [requestSent, setRequestSent] = useState(false)
    const [activeTab, setActiveTab] = useState('agreed') // 'agreed' or 'record'

    const brandPlum = '#3a2639'
    const brandPlumLight = '#7d537b'

    const handleAddHost = (e) => {
        e.preventDefault()
        setRequestSent(true)
        setTimeout(() => {
            setShowAddHostModal(false)
            setRequestSent(false)
            setAddHostForm({ id: '', contact: '' })
            alert('Request successfully sent to the host! Waiting for approval.')
        }, 1500)
    }

    // Mock data for the table
    const hostsData = [
        { id: '99109710', nickname: 'CútéğīŔt', gender: 'Female', phone: '-', email: 'em****@gmail.com', charm: 0, registerTime: '2025-01-04 22:24:46.0', lastActive: '2025-01-31 21:05:59', faceStatus: 'unverified', status: 'Active' },
        { id: '98707969', nickname: 'kim Sadiya', gender: 'Female', phone: '-', email: 'je****@gmail.com', charm: 0, registerTime: '2024-12-31 22:26:10.0', lastActive: '2025-01-12 20:44:42', faceStatus: 'verified', status: 'Active' },
        { id: '98704925', nickname: '_Aliza★', gender: 'Female', phone: '-', email: 'za****@gmail.com', charm: 0, registerTime: '2024-12-31 21:33:59.0', lastActive: '2025-01-05 19:36:43', faceStatus: 'verified', status: 'Active' },
        { id: '98700439', nickname: 'Smile smiley', gender: 'Female', phone: '-', email: 'mi****@gmail.com', charm: 0, registerTime: '2024-12-31 20:16:50.0', lastActive: '2024-12-31 20:18:52', faceStatus: 'unverified', status: 'Active' },
        { id: '98699603', nickname: 'Sharati Larki', gender: 'Female', phone: '-', email: 'hi****@gmail.com', charm: 0, registerTime: '2024-12-31 19:46:09.0', lastActive: '2024-12-31 23:45:57', faceStatus: 'unverified', status: 'Active' },
        { id: '98688693', nickname: 'I am guriya 🥰', gender: 'Female', phone: '-', email: 'ma****@gmail.com', charm: 0, registerTime: '2024-12-31 17:20:21.0', lastActive: '2025-01-04 19:43:20', faceStatus: 'unverified', status: 'Active' },
    ]

    return (
        <main style={{ background: '#f0f2f5', minHeight: '100vh', padding: '16px 16px' }}>
            {/* Add Host Modal */}
            {showAddHostModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(2px)'
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: 16,
                        width: '100%',
                        maxWidth: 400,
                        padding: 32,
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setShowAddHostModal(false)}
                            style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
                        >✕</button>

                        <h2 style={{ fontSize: 20, fontWeight: 700, color: brandPlum, marginBottom: 8 }}>Add New Host</h2>
                        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Enter the host details to send a binding request.</p>

                        <form onSubmit={handleAddHost}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Shemet ID</label>
                                <input
                                    type="text"
                                    required
                                    value={addHostForm.id}
                                    onChange={(e) => setAddHostForm({ ...addHostForm, id: e.target.value })}
                                    placeholder="e.g. 98700439"
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                />
                            </div>
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Phone Number or Gmail</label>
                                <input
                                    type="text"
                                    required
                                    value={addHostForm.contact}
                                    onChange={(e) => setAddHostForm({ ...addHostForm, contact: e.target.value })}
                                    placeholder="Enter phone or email"
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={requestSent}
                                style={{
                                    width: '100%',
                                    background: brandPlum,
                                    color: '#fff',
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: 8,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: requestSent ? 'not-allowed' : 'pointer',
                                    opacity: requestSent ? 0.8 : 1,
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 12px rgba(58,38,57,0.2)'
                                }}
                            >
                                {requestSent ? 'Sending Request...' : 'Send Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ width: '100%' }}>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 8, display: 'flex', gap: 6 }}>
                    <span>My Invitation</span> / <span>Invitee List</span> / <span style={{ color: '#111' }}>Hosts List</span>
                </div>
                <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginBottom: 24 }}>Hosts List</h1>

                {/* Content Container */}
                <div style={{ background: '#fff', borderRadius: 12, padding: '0px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

                    {/* Tab Switcher */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #eee', padding: '0 24px' }}>
                        <button
                            onClick={() => setActiveTab('agreed')}
                            style={{
                                padding: '16px 20px',
                                background: 'none',
                                border: 'none',
                                fontSize: 14,
                                fontWeight: activeTab === 'agreed' ? 600 : 400,
                                color: activeTab === 'agreed' ? brandPlum : '#666',
                                borderBottom: activeTab === 'agreed' ? `2px solid ${brandPlum}` : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Agreed List
                        </button>
                        <button
                            onClick={() => setActiveTab('record')}
                            style={{
                                padding: '16px 20px',
                                background: 'none',
                                border: 'none',
                                fontSize: 14,
                                fontWeight: activeTab === 'record' ? 600 : 400,
                                color: activeTab === 'record' ? brandPlum : '#666',
                                borderBottom: activeTab === 'record' ? `2px solid ${brandPlum}` : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Invitation Record List
                        </button>
                    </div>

                    <div style={{ padding: 24 }}>
                        {/* Filters Row */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                            <input
                                type="text"
                                placeholder="ID"
                                style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, width: 150 }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 4, padding: '0 8px', background: '#fff' }}>
                                <input type="date" style={{ border: 'none', padding: '8px 4px', fontSize: 13, outline: 'none' }} />
                                <span style={{ color: '#ccc', margin: '0 4px' }}>-</span>
                                <input type="date" style={{ border: 'none', padding: '8px 4px', fontSize: 13, outline: 'none' }} />
                            </div>
                            <select style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, color: '#666', minWidth: 180 }}>
                                <option>Inactive hosts yesterday</option>
                                <option>Active hosts yesterday</option>
                            </select>

                            <div style={{ display: 'flex', gap: 8 }}>
                                <button style={{
                                    background: brandPlum,
                                    color: '#fff',
                                    border: 'none',
                                    padding: '8px 24px',
                                    borderRadius: 4,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 6px rgba(58,38,57,0.2)'
                                }}>
                                    Search
                                </button>

                                <button
                                    onClick={() => setShowAddHostModal(true)}
                                    style={{
                                        background: '#fff',
                                        color: brandPlum,
                                        border: `1.5px solid ${brandPlum}`,
                                        padding: '8px 24px',
                                        borderRadius: 4,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    + Add Host
                                </button>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                            <span style={{ fontSize: 14, color: '#111', fontWeight: 500 }}>Total of bound hosts: {hostsData.length}</span>
                            <button style={{
                                background: '#fff',
                                color: '#666',
                                border: '1px solid #ddd',
                                padding: '6px 16px',
                                borderRadius: 4,
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: 'pointer'
                            }}>
                                Export Excel
                            </button>
                        </div>

                        {/* Table Area */}
                        <div style={{ overflowX: 'auto', border: '1px solid #f0f0f0', borderRadius: 8 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                                        <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>ID</th>
                                        <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>NickName</th>
                                        <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Gender</th>
                                        <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Phone</th>
                                        <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Email</th>
                                        <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Shemet Level</th>
                                        <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Poster</th>
                                        <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Recent Live Record</th>
                                        <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Register Time</th>
                                        <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Last Active Time</th>
                                        <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Face Verification Result</th>
                                        <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Deletion Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hostsData.map((row) => (
                                        <tr key={row.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                            <td style={{ padding: '16px', fontSize: 13, color: brandPlumLight, fontWeight: 500 }}>{row.id}</td>
                                            <td style={{ padding: '16px', fontSize: 13, color: '#333' }}>{row.nickname}</td>
                                            <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.gender}</td>
                                            <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.phone}</td>
                                            <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.email}</td>
                                            <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.charm}</td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ width: 44, height: 44, background: '#f5f5f5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ width: 44, height: 44, background: '#f5f5f5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.registerTime}</td>
                                            <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.lastActive}</td>
                                            <td style={{ padding: '16px', fontSize: 13, color: row.faceStatus === 'verified' ? '#10b981' : '#666' }}>{row.faceStatus}</td>
                                            <td style={{ padding: '16px', fontSize: 13, color: '#10b981', fontWeight: 500 }}>{row.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Placeholder */}
                        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: 24, gap: 12 }}>
                            <span style={{ fontSize: 13, color: '#666' }}>Per page</span>
                            <select style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}>
                                <option>10</option>
                                <option>20</option>
                                <option>50</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
