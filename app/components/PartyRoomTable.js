'use client'

export default function PartyRoomTable({ rooms = [] }) {
  if (rooms.length === 0) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: 8,
        padding: 32,
        textAlign: 'center',
        color: '#9ca3af'
      }}>
        No party rooms found
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', borderRadius: 8, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>#</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Room Name</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Creator</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Participants</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Status</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Duration</th>
            <th style={{ padding: 16, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, idx) => (
            <tr key={room.id} style={{ borderBottom: '1px solid #f3f4f6', background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
              <td style={{ padding: 16, fontSize: 14, color: '#6b7280' }}>{idx + 1}</td>
              <td style={{ padding: 16, fontSize: 14, fontWeight: 500, color: '#1f2937' }}>{room.name}</td>
              <td style={{ padding: 16, fontSize: 14, color: '#6b7280' }}>{room.creator}</td>
              <td style={{ padding: 16, fontSize: 14, fontWeight: 600, color: '#1f2937' }}>
                👥 {room.participants}
              </td>
              <td style={{ padding: 16, fontSize: 12 }}>
                <span style={{
                  display: 'inline-block',
                  background: room.status === 'active' ? '#dcfce7' : '#fee2e2',
                  color: room.status === 'active' ? '#166534' : '#991b1b',
                  padding: '4px 12px',
                  borderRadius: 4,
                  fontWeight: 600
                }}>
                  {room.status}
                </span>
              </td>
              <td style={{ padding: 16, fontSize: 14, color: '#6b7280' }}>
                {room.durationMins}m
              </td>
              <td style={{ padding: 16, fontSize: 12, display: 'flex', gap: 8 }}>
                <button style={{
                  padding: '6px 12px',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600
                }}>
                  View Chat
                </button>
                <button style={{
                  padding: '6px 12px',
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600
                }}>
                  Close
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
