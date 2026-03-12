'use client'

import { useState } from 'react'

export default function HostDailyReportPage() {
    const brandPlum = '#3a2639'

    // Mock data for Host Daily Report
    const dailyData = [
        { id: '99109710', nickname: 'CútéğīŔt', date: '2026-03-12', liveDuration: '2h 15m', earnings: '$12.50', coins: 1250, status: 'Completed' },
        { id: '98707969', nickname: 'kim Sadiya', date: '2026-03-12', liveDuration: '4h 05m', earnings: '$45.20', coins: 4520, status: 'Completed' },
        { id: '98704925', nickname: '_Aliza★', date: '2026-03-12', liveDuration: '1h 30m', earnings: '$8.00', coins: 800, status: 'Completed' },
        { id: '98700439', nickname: 'Smile smiley', date: '2026-03-12', liveDuration: '0h 45m', earnings: '$3.50', coins: 350, status: 'In Review' },
    ]

    return (
        <main style={{ background: '#f0f2f5', minHeight: '100vh', padding: '16px 16px' }}>
            <div style={{ width: '100%' }}>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 8, display: 'flex', gap: 6 }}>
                    <span>Reports</span> / <span style={{ color: '#111' }}>Host Daily Report</span>
                </div>
                <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginBottom: 24 }}>Host Daily Report</h1>

                <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    {/* Filters */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                        <input
                            type="date"
                            defaultValue="2026-03-12"
                            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
                        />
                        <input
                            type="text"
                            placeholder="Host ID"
                            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, width: 150 }}
                        />
                        <button style={{
                            background: brandPlum,
                            color: '#fff',
                            border: 'none',
                            padding: '8px 24px',
                            borderRadius: 4,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}>Search</button>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: 'auto', border: '1px solid #f0f0f0', borderRadius: 8 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Host ID</th>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Nickname</th>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Date</th>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Live Duration</th>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Coins Earned</th>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>USD Earnings</th>
                                    <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dailyData.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#3a2639', fontWeight: 500 }}>{row.id}</td>
                                        <td style={{ padding: '16px', fontSize: 13 }}>{row.nickname}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.date}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.liveDuration}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.coins}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>{row.earnings}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: row.status === 'Completed' ? '#10b981' : '#f59e0b' }}>{row.status}</td>
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
