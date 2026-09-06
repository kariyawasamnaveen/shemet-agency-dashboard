'use client'

export default function TransactionTable({ transactions = [] }) {
  if (transactions.length === 0) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: 8,
        padding: 32,
        textAlign: 'center',
        color: '#9ca3af'
      }}>
        No transactions found
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', borderRadius: 8, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>#</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>User</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Type</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Amount</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Reason</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Before</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>After</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, idx) => (
            <tr key={tx.id} style={{ borderBottom: '1px solid #f3f4f6', background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
              <td style={{ padding: 16, fontSize: 14, color: '#6b7280' }}>{idx + 1}</td>
              <td style={{ padding: 16, fontSize: 14, fontWeight: 500, color: '#1f2937' }}>{tx.userName}</td>
              <td style={{ padding: 16, fontSize: 12 }}>
                <span style={{
                  display: 'inline-block',
                  background: tx.type === 'coin' ? '#dbeafe' : '#e9d5ff',
                  color: tx.type === 'coin' ? '#0369a1' : '#6b21a8',
                  padding: '4px 12px',
                  borderRadius: 4,
                  fontWeight: 600
                }}>
                  {tx.type}
                </span>
              </td>
              <td style={{ padding: 16, fontSize: 14, fontWeight: 600, color: tx.amount > 0 ? '#16a34a' : '#991b1b' }}>
                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
              </td>
              <td style={{ padding: 16, fontSize: 14, color: '#6b7280' }}>{tx.reason}</td>
              <td style={{ padding: 16, fontSize: 12, color: '#6b7280' }}>{tx.before.toLocaleString()}</td>
              <td style={{ padding: 16, fontSize: 12, color: '#6b7280' }}>{tx.after.toLocaleString()}</td>
              <td style={{ padding: 16, fontSize: 12, color: '#6b7280' }}>
                {new Date(tx.timestamp).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
