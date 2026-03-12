'use client'

import { useState } from 'react'

export default function AgentDailyReportPage() {
    const brandPlum = '#3a2639'

    // Mock data for Agent Daily Report
    const agencyData = [
        { name: 'Zubi Agency', date: '2026-03-12', activeHosts: 45, totalRevenue: '$1,250.00', commission: '$125.00', rank: 1 },
        { name: 'Star Global', date: '2026-03-12', activeHosts: 32, totalRevenue: '$980.00', commission: '$98.00', rank: 2 },
        { name: 'Elite Stream', date: '2026-03-12', activeHosts: 28, totalRevenue: '$850.00', commission: '$85.00', rank: 3 },
        { name: 'Dating Live HQ', date: '2026-03-12', activeHosts: 15, totalRevenue: '$420.00', commission: '$42.00', rank: 4 },
    ]

    return (
        <main style={{ background: '#f0f2f5', minHeight: '100vh', padding: '16px 16px' }}>
            <div style={{ width: '100%' }}>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 8, display: 'flex', gap: 6 }}>
                    <span>Reports</span> / <span style={{ color: '#111' }}>Agent Daily Report</span>
                </div>
                <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginBottom: 24 }}>Agent Daily Report</h1>

                <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    {/* Summary Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                        <div style={{ padding: 16, borderRadius: 8, border: '1px solid #f1f5f9', background: '#f8fafc' }}>
                            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total Agency Earnings</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: brandPlum }}>$3,500.00</div>
                        </div>
                        <div style={{ padding: 16, borderRadius: 8, border: '1px solid #f1f5f9', background: '#f8fafc' }}>
                            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Active Agencies To-day</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: brandPlum }}>12</div>
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: 'auto', border: '1px solid #f0f0f0', borderRadius: 8 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Rank</th>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Agency Name</th>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Date</th>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Active Hosts</th>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Total Revenue</th>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Net Commission</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agencyData.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ padding: '16px', fontSize: 14, fontWeight: 700, color: i < 3 ? '#f59e0b' : '#666' }}>#{row.rank}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#3a2639', fontWeight: 600 }}>{row.name}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.date}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.activeHosts}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.totalRevenue}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#10b981', fontWeight: 600 }}>{row.commission}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    )
}
