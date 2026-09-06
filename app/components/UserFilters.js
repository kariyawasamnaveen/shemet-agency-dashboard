'use client'

export default function UserFilters({ filters, setFilters }) {
  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: 16, marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Status Filter */}
        <div>
          <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Status</label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            style={{
              marginTop: 6,
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              fontSize: 14,
            }}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Type</label>
          <select
            value={filters.type || 'all'}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            style={{
              marginTop: 6,
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              fontSize: 14,
            }}
          >
            <option value="all">All</option>
            <option value="host">Host</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Search */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Search</label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={{
              marginTop: 6,
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              fontSize: 14,
            }}
          />
        </div>
      </div>
    </div>
  )
}
