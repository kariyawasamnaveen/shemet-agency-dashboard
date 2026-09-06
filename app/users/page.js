'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAgency } from '../context/AgencyContext'
import UserFilters from '../components/UserFilters'
import UserTable from '../components/UserTable'

const ITEMS_PER_PAGE = 10

export default function UsersPage() {
  const { agent, loading: authLoading } = useAgency()
  const router = useRouter()
  const isSuperAdmin = agent?.email === 'hknskariyawasamnaveen@gmail.com'

  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [filters, setFilters] = useState({ status: 'all', type: 'all', search: '' })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      router.push('/')
    }
  }, [isSuperAdmin, authLoading, router])

  useEffect(() => {
    if (!isSuperAdmin) return

    // Real Firebase fetch
    const { collection, query, onSnapshot, orderBy } = require('firebase/firestore')
    const { db } = require('@/lib/firebase')

    setLoading(true)
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUsers(userList)
      setLoading(false)
    }, (error) => {
      console.error("Firebase Auth/Firestore Error:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [isSuperAdmin])

  useEffect(() => {
    // Apply filters locally on the fetched list for speed
    let filtered = users.filter(user => {
      const statusParam = filters.status === 'all' || (user.status || 'active') === filters.status
      const typeParam = filters.type === 'all' || 
                       (filters.type === 'host' ? user.isHost === true : 
                        filters.type === 'agent' ? user.isAgent === true : true)
      
      const searchParam = !filters.search || 
                        (user.name?.toLowerCase().includes(filters.search.toLowerCase())) || 
                        (user.email?.toLowerCase().includes(filters.search.toLowerCase())) ||
                        (user.id?.toLowerCase().includes(filters.search.toLowerCase()))
      
      return statusParam && typeParam && searchParam
    })
    setFilteredUsers(filtered)
    setPage(1)
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
