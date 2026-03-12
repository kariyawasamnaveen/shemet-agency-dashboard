'use client'

export default function MessageList({ messages = [], onDelete, onMarkRead }) {
  if (messages.length === 0) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: 8,
        padding: 32,
        textAlign: 'center',
        color: '#9ca3af'
      }}>
        No messages
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          style={{
            background: msg.read ? '#f9fafb' : '#f0f9ff',
            border: msg.read ? '1px solid #e5e7eb' : '1px solid #0ea5e9',
            borderRadius: 8,
            padding: 16,
            display: 'flex',
            gap: 16,
            alignItems: 'flex-start',
          }}
        >
          <div style={{ fontSize: 24 }}>
            {msg.type === 'notification' ? '🔔' : msg.type === 'alert' ? '⚠️' : '📢'}
          </div>

          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, marginBottom: 6, fontWeight: 600, color: '#1f2937' }}>
              {msg.subject}
            </h3>
            <p style={{ margin: 0, marginBottom: 8, fontSize: 14, color: '#6b7280' }}>
              {msg.content}
            </p>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>
              {new Date(msg.sentAt).toLocaleString()}
              {msg.recipientType === 'all' && ' • Sent to all'}
              {msg.recipientType === 'hosts' && ' • Sent to hosts'}
              {msg.recipientType === 'vip_users' && ' • Sent to VIP users'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {!msg.read && (
              <button
                onClick={() => onMarkRead(msg.id)}
                style={{
                  padding: '6px 12px',
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Mark Read
              </button>
            )}
            <button
              onClick={() => onDelete(msg.id)}
              style={{
                padding: '6px 12px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
