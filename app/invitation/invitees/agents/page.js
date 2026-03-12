'use client'

import { useState } from 'react'

export default function AgentsListPage() {
    const brandPlum = '#3a2639'
    const brandPlumLight = '#7d537b'

    return (
        <main style={{ background: '#f0f2f5', minHeight: '100vh', padding: '16px 24px' }}>
            {/* Breadcrumbs */}
            <nav style={{ fontSize: 13, color: '#666', marginBottom: 16, display: 'flex', gap: 8 }}>
                <span>My Invitation</span>
                <span>/</span>
                <span>Invitee List</span>
                <span>/</span>
                <span style={{ color: '#111' }}>Agents List</span>
            </nav>

            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginBottom: 24 }}>Agents List</h1>

            <div style={{ background: '#fff', borderRadius: 12, padding: '24px 32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                {/* Search Header */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                    <div style={{ position: 'relative', width: 240 }}>
                        <select
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: 4,
                                fontSize: 13,
                                color: '#666',
                                background: '#fff',
                                outline: 'none'
                            }}
                        >
                            <option value="">Agent Name</option>
                        </select>
                    </div>
                    <button style={{
                        background: 'linear-gradient(135deg, #573955, #3a2639)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '0 24px',
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer'
                    }}>
                        Search
                    </button>
                </div>

                {/* Legend/Utility Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <div style={{ width: 32, height: 32, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {/* Mock icon for view toggle */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#94a3b8"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                        </div>
                    </div>
                    <div style={{ fontSize: 14, color: '#111', fontWeight: 500 }}>
                        Total of bound agents :0
                    </div>
                </div>

                {/* Data Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f0f2f5' }}>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>ID</th>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Agent Name</th>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Phone</th>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>The number of hosts he invited</th>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>The number of agents he invited</th>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Bind Time</th>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Register Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Empty state visual match */}
                            <tr>
                                <td colSpan="7" style={{ padding: '80px 0', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#e5e7eb" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="12" />
                                            <line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                        <span style={{ fontSize: 14, color: '#94a3b8' }}>No data</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    )
}
