'use client'

import { useState, useEffect } from 'react'
import UserFilters from '../components/UserFilters'
import UserTable from '../components/UserTable'

// Mock data — replace with Firebase later
const MOCK_USERS = [
  { id: '1', name: 'Naveen', email: 'nav@example.com', type: 'host', status: 'active', createdAt: '2026-01-15' },
  { id: '2', name: 'Priya', email: 'pri@example.com', type: 'user', status: 'active', createdAt: '2026-01-20' },
  { id: '3', name: 'Ravi', email: 'rav@example.com', type: 'user', status: 'banned', createdAt: '2025-12-01' },
  { id: '4', name: 'Anjali', email: 'anj@example.com', type: 'host', status: 'active', createdAt: '2026-02-01' },
  { id: '5', name: 'Amit', email: 'amit@example.com', type: 'user', status: 'suspended', createdAt: '2026-02-10' },
]

const ITEMS_PER_PAGE = 10

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [filters, setFilters] = useState({ status: 'all', type: 'all', search: '' })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate Firebase fetch
    setLoading(true)
    setTimeout(() => {
      setUsers(MOCK_USERS)
      setLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    // Apply filters
    let filtered = users.filter(user => {
      const statusMatch = filters.status === 'all' || user.status === filters.status
      const typeMatch = filters.type === 'all' || user.type === filters.type
      const searchMatch = !filters.search || user.name.toLowerCase().includes(filters.search.toLowerCase()) || user.email.toLowerCase().includes(filters.search.toLowerCase())
      return statusMatch && typeMatch && searchMatch
    })
    setFilteredUsers(filtered)
    setPage(1) // Reset to page 1 on filter change
  }, [filters, users])

  const paginatedUsers = filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)

  return (
    <main style={{ padding: 24 }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 8 }}>User Management</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Manage and monitor all platform users</p>
      </header>

      <UserFilters filters={filters} setFilters={setFilters} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>Loading users...</div>
      ) : (
        <>
          <UserTable users={paginatedUsers} />

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
            <div style={{ color: '#6b7280', fontSize: 14 }}>
              Total: {filteredUsers.length} users | Showing {(page - 1) * ITEMS_PER_PAGE + 1}—{Math.min(page * ITEMS_PER_PAGE, filteredUsers.length)}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  background: page === 1 ? '#f3f4f6' : '#fff',
                  color: page === 1 ? '#9ca3af' : '#1f2937',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                ← Prev
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  style={{
                    padding: '8px 12px',
                    border: page === i + 1 ? '1px solid #7c3aed' : '1px solid #e5e7eb',
                    borderRadius: 6,
                    background: page === i + 1 ? '#7c3aed' : '#fff',
                    color: page === i + 1 ? '#fff' : '#1f2937',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  background: page === totalPages ? '#f3f4f6' : '#fff',
                  color: page === totalPages ? '#9ca3af' : '#1f2937',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
