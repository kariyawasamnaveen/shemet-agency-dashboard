'use client'

import { useState, useEffect } from 'react'
import LeaderboardTable from '../components/LeaderboardTable'

// Mock data for different periods
const MOCK_WEEKLY = [
  { id: '1', name: 'Naveen Singh', rank: 1, level: 45, earnings: 125000, type: 'host' },
  { id: '2', name: 'Priya Sharma', rank: 2, level: 38, earnings: 98000, type: 'host' },
  { id: '3', name: 'Anjali Verma', rank: 3, level: 42, earnings: 87500, type: 'host' },
  { id: '4', name: 'Ravi Kumar', rank: 4, level: 35, earnings: 72000, type: 'user' },
  { id: '5', name: 'Deepa Singh', rank: 5, level: 40, earnings: 65000, type: 'host' },
]

const MOCK_MONTHLY = [
  { id: '1', name: 'Naveen Singh', rank: 1, level: 45, earnings: 450000, type: 'host' },
  { id: '2', name: 'Priya Sharma', rank: 2, level: 38, earnings: 380000, type: 'host' },
  { id: '3', name: 'Anjali Verma', rank: 3, level: 42, earnings: 320000, type: 'host' },
  { id: '4', name: 'Ravi Kumar', rank: 4, level: 35, earnings: 250000, type: 'user' },
  { id: '5', name: 'Deepa Singh', rank: 5, level: 40, earnings: 210000, type: 'host' },
]

const MOCK_ALLTIME = [
  { id: '1', name: 'Naveen Singh', rank: 1, level: 45, earnings: 2500000, type: 'host' },
  { id: '2', name: 'Priya Sharma', rank: 2, level: 38, earnings: 1950000, type: 'host' },
  { id: '3', name: 'Anjali Verma', rank: 3, level: 42, earnings: 1750000, type: 'host' },
  { id: '4', name: 'Ravi Kumar', rank: 4, level: 35, earnings: 1200000, type: 'user' },
  { id: '5', name: 'Deepa Singh', rank: 5, level: 40, earnings: 950000, type: 'host' },
]

export default function LeaderboardPage() {
  const [rankings, setRankings] = useState([])
  const [period, setPeriod] = useState('weekly')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate Firebase fetch
    setLoading(true)
    setTimeout(() => {
      if (period === 'weekly') setRankings(MOCK_WEEKLY)
      else if (period === 'monthly') setRankings(MOCK_MONTHLY)
      else setRankings(MOCK_ALLTIME)
      setLoading(false)
    }, 400)
  }, [period])

  // Calculate stats for current period
  const topHost = rankings.find(r => r.type === 'host')
  const totalEarnings = rankings.reduce((sum, r) => sum + r.earnings, 0)

  return (
    <main style={{ padding: 24 }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 8 }}>Leaderboards</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>View top earners across different periods</p>
      </header>

      {/* Period Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {['weekly', 'monthly', 'alltime'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: 6,
              background: period === p ? '#7c3aed' : '#e5e7eb',
              color: period === p ? '#fff' : '#1f2937',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            {p === 'alltime' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>🏆 Top Host</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>
            {topHost?.name}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            ${topHost?.earnings.toLocaleString()}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>💰 Total Period Earnings</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>
            ${totalEarnings.toLocaleString()}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>📊 Rankings Count</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>
            {rankings.length}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textTransform: 'capitalize' }}>
        {period === 'alltime' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)} Rankings
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>Loading leaderboard...</div>
      ) : (
        <LeaderboardTable rankings={rankings} />
      )}
    </main>
  )
}
