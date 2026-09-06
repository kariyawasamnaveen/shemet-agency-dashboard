'use client'

import { useState, useEffect } from 'react'

// Mock analytics data
const MOCK_ANALYTICS = {
  daily: {
    totalUsers: 15234,
    activeUsers: 8945,
    newUsers: 234,
    totalDiamondsSpent: 450000,
    totalCoinsEarned: 2300000,
    liveStreams: 156,
    totalViewers: 450000,
    avgSessionDuration: 2345,
  },
  monthly: {
    totalUsers: 125000,
    activeUsers: 78500,
    newUsers: 8900,
    totalDiamondsSpent: 5600000,
    totalCoinsEarned: 28500000,
    liveStreams: 3200,
    totalViewers: 8900000,
    avgSessionDuration: 2100,
  },
  alltime: {
    totalUsers: 850000,
    activeUsers: 425000,
    newUsers: 125000,
    totalDiamondsSpent: 125000000,
    totalCoinsEarned: 650000000,
    liveStreams: 125000,
    totalViewers: 125000000,
    avgSessionDuration: 1950,
  },
}

export default function ReportsPage() {
  const [period, setPeriod] = useState('daily')
  const [dateRange, setDateRange] = useState({ start: '2026-02-17', end: '2026-02-24' })
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(MOCK_ANALYTICS.daily)

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      if (period === 'daily') setData(MOCK_ANALYTICS.daily)
      else if (period === 'monthly') setData(MOCK_ANALYTICS.monthly)
      else setData(MOCK_ANALYTICS.alltime)
      setLoading(false)
    }, 300)
  }, [period])

  const handleExport = (format) => {
    alert(`Exporting report as ${format.toUpperCase()}...`)
    // In production: generate CSV/PDF and download
  }

  const stats = [
    { label: 'Total Users', value: data.totalUsers, icon: '👥', color: '#3b82f6' },
    { label: 'Active Users', value: data.activeUsers, icon: '✅', color: '#10b981' },
    { label: 'New Users', value: data.newUsers, icon: '⭐', color: '#f59e0b' },
    { label: 'Diamonds Spent', value: `$${(data.totalDiamondsSpent / 1000).toFixed(0)}K`, icon: '💎', color: '#a78bfa' },
    { label: 'Coins Earned', value: `$${(data.totalCoinsEarned / 1000).toFixed(0)}K`, icon: '🪙', color: '#fbbf24' },
    { label: 'Live Streams', value: data.liveStreams, icon: '📡', color: '#ef4444' },
    { label: 'Total Viewers', value: `${(data.totalViewers / 1000).toFixed(0)}K`, icon: '👁️', color: '#06b6d4' },
    { label: 'Avg Session (min)', value: Math.round(data.avgSessionDuration / 60), icon: '⏱️', color: '#6b7280' },
  ]

  return (
    <main style={{ padding: 24 }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 8 }}>Reports & Analytics</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Track platform performance and user engagement</p>
      </header>

      {/* Date Range & Period Selection */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 16, marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 6 }}>Period</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['daily', 'monthly', 'alltime'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: 6,
                  background: period === p ? '#7c3aed' : '#e5e7eb',
                  color: period === p ? '#fff' : '#1f2937',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                {p === 'alltime' ? 'All Time' : p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 6 }}>Date Range</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 4, fontSize: 12 }}
            />
            <span style={{ alignSelf: 'center' }}>—</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              style={{ padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 4, fontSize: 12 }}
            />
          </div>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 6 }}>Export</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => handleExport('csv')}
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              style={{
                padding: '8px 16px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              PDF
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>Loading analytics...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            {stats.map((stat, idx) => (
              <div key={idx} style={{ background: '#fff', borderRadius: 8, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 32 }}>{stat.icon}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{stat.label}</div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>
                  {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Placeholder */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: 20 }}>
              <h3 style={{ margin: 0, marginBottom: 20, fontSize: 16, fontWeight: 600 }}>User Activity Trend</h3>
              <div style={{
                height: 200,
                display: 'flex',
                alignItems: 'flex-end',
                gap: 8,
                paddingTop: 20,
                borderTop: '1px solid #e5e7eb',
              }}>
                {[45, 52, 38, 71, 64, 82, 55].map((height, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${height * 2}px`,
                      background: 'linear-gradient(180deg, #7c3aed, #6d28d9)',
                      borderRadius: 4,
                      opacity: 0.8,
                    }}
                  />
                ))}
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
                Mon — Tue — Wed — Thu — Fri — Sat — Sun
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 8, padding: 20 }}>
              <h3 style={{ margin: 0, marginBottom: 20, fontSize: 16, fontWeight: 600 }}>Revenue Distribution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
                {[
                  { label: 'Diamonds', amount: 45, color: '#a78bfa' },
                  { label: 'Coins', amount: 55, color: '#fbbf24' },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                      <span style={{ fontWeight: 600 }}>{item.label}</span>
                      <span style={{ color: '#6b7280' }}>{item.amount}%</span>
                    </div>
                    <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${item.amount}%`,
                          background: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 8, padding: 20 }}>
              <h3 style={{ margin: 0, marginBottom: 20, fontSize: 16, fontWeight: 600 }}>Top Metrics</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
                {[
                  { name: 'Peak Hours', time: '8-10 PM', icon: '⏰' },
                  { name: 'Most Active Region', region: 'Asia', icon: '🌏' },
                  { name: 'Avg Host Earnings', amount: '$450', icon: '💰' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 20 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{item.name}</div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {item.time || item.region || item.amount}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Reports */}
          <div style={{ marginTop: 32, background: '#fff', borderRadius: 8, padding: 20 }}>
            <h2 style={{ margin: 0, marginBottom: 20, fontSize: 18, fontWeight: 700 }}>Detailed Report</h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                    <th style={{ padding: 12, textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>Metric</th>
                    <th style={{ padding: 12, textAlign: 'right', fontWeight: 600, color: '#6b7280' }}>Today</th>
                    <th style={{ padding: 12, textAlign: 'right', fontWeight: 600, color: '#6b7280' }}>This Month</th>
                    <th style={{ padding: 12, textAlign: 'right', fontWeight: 600, color: '#6b7280' }}>All Time</th>
                    <th style={{ padding: 12, textAlign: 'right', fontWeight: 600, color: '#6b7280' }}>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { metric: 'Total Users', today: '15,234', month: '125,000', alltime: '850,000', change: '+12.5%' },
                    { metric: 'Active Users', today: '8,945', month: '78,500', alltime: '425,000', change: '+8.3%' },
                    { metric: 'Revenue', today: '$47,500', month: '$580,000', alltime: '$12,500,000', change: '+15.2%' },
                    { metric: 'Engagement Rate', today: '58.7%', month: '62.8%', alltime: '50%', change: '-4.1%' },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: 12, fontWeight: 600 }}>{row.metric}</td>
                      <td style={{ padding: 12, textAlign: 'right' }}>{row.today}</td>
                      <td style={{ padding: 12, textAlign: 'right' }}>{row.month}</td>
                      <td style={{ padding: 12, textAlign: 'right' }}>{row.alltime}</td>
                      <td style={{
                        padding: 12,
                        textAlign: 'right',
                        color: row.change.startsWith('+') ? '#10b981' : '#ef4444',
                        fontWeight: 600,
                      }}>
                        {row.change}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
