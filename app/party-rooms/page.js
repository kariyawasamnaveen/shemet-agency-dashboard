'use client'

import { useState, useEffect } from 'react'
import PartyRoomTable from '../components/PartyRoomTable'

// Mock data — replace with Firebase real-time listener later
const MOCK_ROOMS = [
  {
    id: '1',
    name: 'Weekend Party',
    creator: 'Naveen Singh',
    participants: 12,
    status: 'active',
    durationMins: 45,
    createdAt: Date.now() - 2700000,
  },
  {
    id: '2',
    name: 'Music Night',
    creator: 'Priya Sharma',
    participants: 8,
    status: 'active',
    durationMins: 20,
    createdAt: Date.now() - 1200000,
  },
  {
    id: '3',
    name: 'Gaming Zone',
    creator: 'Anjali Verma',
    participants: 15,
    status: 'active',
    durationMins: 60,
    createdAt: Date.now() - 3600000,
  },
  {
    id: '4',
    name: 'Dance Floor',
    creator: 'Ravi Kumar',
    participants: 0,
    status: 'closed',
    durationMins: 90,
    createdAt: Date.now() - 324000000,
  },
]

export default function PartyRoomsPage() {
  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [status, setStatus] = useState('active')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate Firebase real-time listener
    setLoading(true)
    setTimeout(() => {
      setRooms(MOCK_ROOMS)
      setLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    // Apply filter
    const filtered = rooms.filter(room => {
      if (status === 'all') return true
      return room.status === status
    })
    setFilteredRooms(filtered)
  }, [status, rooms])

  const handleCloseRoom = (roomId) => {
    if (confirm('Are you sure you want to close this party room?')) {
      setRooms(rooms.map(r => r.id === roomId ? { ...r, status: 'closed' } : r))
      alert('Party room closed successfully')
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 8 }}>Party Room Management</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Moderate and manage active party rooms</p>
      </header>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Active Rooms</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>
            {rooms.filter(r => r.status === 'active').length}
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Total Participants</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>
            {rooms.reduce((sum, r) => sum + r.participants, 0)}
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Closed Rooms</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>
            {rooms.filter(r => r.status === 'closed').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {['all', 'active', 'closed'].map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: 6,
              background: status === s ? '#7c3aed' : '#e5e7eb',
              color: status === s ? '#fff' : '#1f2937',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>Loading party rooms...</div>
      ) : (
        <PartyRoomTable rooms={filteredRooms} />
      )}
    </main>
  )
}
