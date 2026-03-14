'use client'

import { useState, useEffect } from 'react'
import { db } from '../../lib/firebase'
import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore'
import { useAgency } from '../../lib/hooks'

export default function LeaderboardPage() {
  const { agency } = useAgency()
  const [rankings, setRankings] = useState([])
  const [period, setPeriod] = useState('weekly')
  const [loading, setLoading] = useState(true)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  const fetchRankings = async () => {
    if (!agency?.agencyId) return;
    setLoading(true);
    try {
      const now = new Date();
      let startTime;
      if (period === 'weekly') {
        startTime = new Date(now.setDate(now.getDate() - 7));
      } else if (period === 'monthly') {
        startTime = new Date(now.setMonth(now.getMonth() - 1));
      } else {
        startTime = new Date(0); // All time
      }

      // 1. Fetch agency hosts
      const hostsQuery = query(
        collection(db, "users"),
        where("isHost", "==", true),
        where("agencyId", "==", agency.agencyId)
      );
      const hostsSnap = await getDocs(hostsQuery);
      const hosts = hostsSnap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'No Name',
        level: doc.data().level || 0
      }));

      const hostIds = hosts.map(h => h.id);
      if (hostIds.length === 0) {
        setRankings([]);
        return;
      }

      // 2. Fetch gift transactions for these hosts (Firestore limit 10 for 'in' query)
      const txQuery = query(
        collection(db, "gift_transactions"),
        where("receiverId", "in", hostIds.slice(0, 10)),
        where("timestamp", ">=", Timestamp.fromDate(startTime)),
        orderBy("timestamp", "desc")
      );
      const txSnap = await getDocs(txQuery);

      const earningsMap = {};
      txSnap.docs.forEach(doc => {
        const data = doc.data();
        earningsMap[data.receiverId] = (earningsMap[data.receiverId] || 0) + (data.diamondAmount || 0);
      });

      // 3. Compile and rank
      const ranked = hosts.map(h => ({
        ...h,
        earnings: earningsMap[h.id] || 0,
        type: 'host'
      }))
        .sort((a, b) => b.earnings - a.earnings)
        .map((item, index) => ({
          ...item,
          rank: index + 1,
          // Apply 60% rule for display
          withdrawPoints: (item.earnings * 0.6)
        }));

      setRankings(ranked);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRankings();
  }, [period, agency]);

  // Calculate stats for current period
  const topHost = rankings.find(r => r.type === 'host')
  const totalEarnings = rankings.reduce((sum, r) => sum + r.earnings, 0)

  if (!hydrated) return null;

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
            ${((topHost?.earnings || 0) * 0.6 / 100).toLocaleString()} (60%)
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>💰 Total Period Earnings</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>
            ${(totalEarnings * 0.6 / 100).toLocaleString()}
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
