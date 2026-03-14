'use client'

export default function LeaderboardTable({ rankings = [] }) {
  if (rankings.length === 0) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: 8,
        padding: 32,
        textAlign: 'center',
        color: '#9ca3af'
      }}>
        No rankings found
      </div>
    )
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank
  }

  const getRankColor = (rank) => {
    if (rank === 1) return '#fbbf24'
    if (rank === 2) return '#d1d5db'
    if (rank === 3) return '#f97316'
    return '#6b7280'
  }

  return (
    <div style={{ background: '#fff', borderRadius: 8, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280', width: 80 }}>Rank</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Name</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Level</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Diamonds</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Withdraw पॉइंट्स (60%)</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Type</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((user, idx) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6', background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
              <td style={{ padding: 16, fontSize: 18, fontWeight: 700, color: getRankColor(user.rank), textAlign: 'center' }}>
                {getRankBadge(user.rank)}
              </td>
              <td style={{ padding: 16, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                {user.name}
              </td>
              <td style={{ padding: 16, fontSize: 14, color: '#6b7280' }}>
                <span style={{
                  display: 'inline-block',
                  background: '#f3e8ff',
                  color: '#6b21a8',
                  padding: '4px 12px',
                  borderRadius: 4,
                  fontWeight: 600,
                  fontSize: 12
                }}>
                  Level {user.level}
                </span>
              </td>
              <td style={{ padding: 16, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                {user.earnings.toLocaleString()}
              </td>
              <td style={{ padding: 16, fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>
                ${(user.withdrawPoints / 100).toFixed(2)}
              </td>
              <td style={{ padding: 16, fontSize: 12 }}>
                <span style={{
                  display: 'inline-block',
                  background: user.type === 'host' ? '#dbeafe' : '#f0fdf4',
                  color: user.type === 'host' ? '#0369a1' : '#166534',
                  padding: '4px 12px',
                  borderRadius: 4,
                  fontWeight: 600
                }}>
                  {user.type}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
