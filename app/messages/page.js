'use client'

import { useState, useEffect } from 'react'
import MessageList from '../components/MessageList'

// Mock data
const MOCK_MESSAGES = [
  {
    id: '1',
    type: 'notification',
    subject: 'Platform Update',
    content: 'System maintenance scheduled for tonight at 10 PM. Expected downtime: 1 hour.',
    recipientType: 'all',
    read: false,
    sentAt: Date.now() - 3600000,
  },
  {
    id: '2',
    type: 'alert',
    subject: 'Suspicious Activity Detected',
    content: 'Multiple failed login attempts from user account #12345. Account temporarily locked.',
    recipientType: 'hosts',
    read: true,
    sentAt: Date.now() - 7200000,
  },
  {
    id: '3',
    type: 'broadcast',
    subject: 'New Feature: Party Rooms',
    content: 'We have launched Party Rooms! Users can now host group calls with up to 50 participants.',
    recipientType: 'all',
    read: true,
    sentAt: Date.now() - 86400000,
  },
]

export default function MessagesPage() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCompose, setShowCompose] = useState(false)
  const [composeForm, setComposeForm] = useState({
    subject: '',
    content: '',
    type: 'notification',
    recipientType: 'all',
  })

  useEffect(() => {
    // Simulate Firebase fetch
    setLoading(true)
    setTimeout(() => {
      setMessages(MOCK_MESSAGES)
      setLoading(false)
    }, 500)
  }, [])

  const handleCompose = (e) => {
    e.preventDefault()
    if (!composeForm.subject || !composeForm.content) {
      alert('Please fill all fields')
      return
    }

    const newMsg = {
      id: Date.now().toString(),
      type: composeForm.type,
      subject: composeForm.subject,
      content: composeForm.content,
      recipientType: composeForm.recipientType,
      read: true,
      sentAt: Date.now(),
    }

    setMessages([newMsg, ...messages])
    setComposeForm({ subject: '', content: '', type: 'notification', recipientType: 'all' })
    setShowCompose(false)
    alert('Message sent!')
  }

  const handleDelete = (msgId) => {
    if (confirm('Delete this message?')) {
      setMessages(messages.filter(m => m.id !== msgId))
    }
  }

  const handleMarkRead = (msgId) => {
    setMessages(messages.map(m => m.id === msgId ? { ...m, read: true } : m))
  }

  const unreadCount = messages.filter(m => !m.read).length

  return (
    <main style={{ padding: 24 }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 8 }}>System Messages</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Send notifications and alerts to users {unreadCount > 0 && `(${unreadCount} unread)`}
        </p>
      </header>

      {/* Compose Button */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => setShowCompose(true)}
          style={{
            padding: '10px 20px',
            background: '#7c3aed',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Compose Message
        </button>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowCompose(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 8,
              padding: 24,
              maxWidth: 500,
              width: '90%',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: 0, marginBottom: 20 }}>Send Message</h2>

            <form onSubmit={handleCompose}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Message Type</label>
                <select
                  value={composeForm.type}
                  onChange={(e) => setComposeForm({ ...composeForm, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="notification">Notification</option>
                  <option value="alert">Alert</option>
                  <option value="broadcast">Broadcast</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Recipient Type</label>
                <select
                  value={composeForm.recipientType}
                  onChange={(e) => setComposeForm({ ...composeForm, recipientType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="all">All Users</option>
                  <option value="hosts">Hosts Only</option>
                  <option value="vip_users">VIP Users Only</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Subject</label>
                <input
                  type="text"
                  placeholder="Message subject..."
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Message</label>
                <textarea
                  placeholder="Message content..."
                  value={composeForm.content}
                  onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: 'border-box',
                    minHeight: 120,
                    fontFamily: 'system-ui, sans-serif',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: '#e5e7eb',
                    color: '#1f2937',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: '#7c3aed',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Messages List */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Recent Messages</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>Loading messages...</div>
      ) : (
        <MessageList
          messages={messages}
          onDelete={handleDelete}
          onMarkRead={handleMarkRead}
        />
      )}
    </main>
  )
}
