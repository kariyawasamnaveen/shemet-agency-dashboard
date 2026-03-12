'use client'

export default function UserTable({ users = [] }) {
  if (users.length === 0) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: 8,
        padding: 32,
        textAlign: 'center',
        color: '#9ca3af'
      }}>
        No users found
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', borderRadius: 8, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>#</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Name</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Email</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Type</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Status</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Joined</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr key={user.id} style={{ borderBottom: '1px solid #f3f4f6', background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
              <td style={{ padding: 16, fontSize: 14, color: '#6b7280' }}>{idx + 1}</td>
              <td style={{ padding: 16, fontSize: 14, fontWeight: 500, color: '#1f2937' }}>{user.name}</td>
              <td style={{ padding: 16, fontSize: 14, color: '#6b7280' }}>{user.email}</td>
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
              <td style={{ padding: 16, fontSize: 12 }}>
                <span style={{
                  display: 'inline-block',
                  background: user.status === 'active' ? '#dcfce7' : user.status === 'banned' ? '#fee2e2' : '#fef3c7',
                  color: user.status === 'active' ? '#166534' : user.status === 'banned' ? '#991b1b' : '#92400e',
                  padding: '4px 12px',
                  borderRadius: 4,
                  fontWeight: 600
                }}>
                  {user.status}
                </span>
              </td>
              <td style={{ padding: 16, fontSize: 14, color: '#6b7280' }}>
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </td>
              <td style={{ padding: 16, fontSize: 12 }}>
                <button style={{
                  padding: '6px 12px',
                  marginRight: 8,
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600
                }}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
