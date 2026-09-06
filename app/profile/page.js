'use client'

import { useState, useEffect } from 'react'

// Mock admin data
const MOCK_ADMIN = {
  id: 'admin1',
  name: 'Admin User',
  email: 'admin@shemet.com',
  role: 'super_admin',
  joinedAt: '2025-01-15',
  lastLogin: Date.now() - 3600000,
  status: 'active',
  permissions: {
    canBanUsers: true,
    canManageCoins: true,
    canViewAnalytics: true,
    canManageLiveStreams: true,
    canModerateContent: true,
    canManageAdmins: false,
    canAccessReports: true,
    canSendMessages: true,
  },
}

const PERMISSION_DESCRIPTIONS = {
  canBanUsers: 'Ban or suspend user accounts',
  canManageCoins: 'Adjust user coin and diamond balances',
  canViewAnalytics: 'View platform analytics and reports',
  canManageLiveStreams: 'Stop or control live streams',
  canModerateContent: 'Moderate user content and messages',
  canManageAdmins: 'Create and manage other admin accounts',
  canAccessReports: 'Access detailed business reports',
  canSendMessages: 'Send system-wide notifications',
}

export default function ProfilePage() {
  const [admin, setAdmin] = useState(MOCK_ADMIN)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate Firebase fetch
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setEditForm({ name: admin.name, email: admin.email })
    }, 500)
  }, [])

  const handleSaveProfile = (e) => {
    e.preventDefault()
    if (!editForm.name || !editForm.email) {
      alert('Please fill all fields')
      return
    }
    setAdmin({ ...admin, name: editForm.name, email: editForm.email })
    setEditing(false)
    alert('Profile updated!')
  }

  const handlePermissionToggle = (permission) => {
    setAdmin({
      ...admin,
      permissions: {
        ...admin.permissions,
        [permission]: !admin.permissions[permission],
      },
    })
  }

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>Loading profile...</div>
      </main>
    )
  }

  return (
    <main style={{ padding: 24 }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 8 }}>Admin Profile</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Manage your account and permissions</p>
      </header>

      {/* Profile Card */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            {admin.name.charAt(0)}
          </div>

          <div>
            <h2 style={{ margin: 0, marginBottom: 4 }}>{admin.name}</h2>
            <div style={{ color: '#6b7280', marginBottom: 12 }}>{admin.email}</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <span
                style={{
                  display: 'inline-block',
                  background: '#e0e7ff',
                  color: '#4f46e5',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                {admin.role.replace('_', ' ')}
              </span>
              <span
                style={{
                  display: 'inline-block',
                  background: '#dcfce7',
                  color: '#166534',
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                {admin.status}
              </span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Joined</div>
              <div style={{ fontWeight: 600 }}>{new Date(admin.joinedAt).toLocaleDateString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Last Login</div>
              <div style={{ fontWeight: 600 }}>{new Date(admin.lastLogin).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Section */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0 }}>Profile Information</h2>
          <button
            onClick={() => setEditing(!editing)}
            style={{
              padding: '8px 16px',
              background: editing ? '#ef4444' : '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSaveProfile}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: '#059669',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Save Changes
            </button>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Name</div>
              <div style={{ fontWeight: 600 }}>{admin.name}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Email</div>
              <div style={{ fontWeight: 600 }}>{admin.email}</div>
            </div>
          </div>
        )}
      </div>

      {/* Permissions Section */}
      <div style={{ background: '#fff', borderRadius: 8, padding: 24 }}>
        <h2 style={{ margin: 0, marginBottom: 20 }}>Permissions</h2>

        <div style={{ display: 'grid', gap: 16 }}>
          {Object.entries(admin.permissions).map(([permission, enabled]) => (
            <div
              key={permission}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 16,
                background: '#f9fafb',
                borderRadius: 6,
                border: '1px solid #e5e7eb',
              }}
            >
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => handlePermissionToggle(permission)}
                style={{
                  width: 20,
                  height: 20,
                  cursor: 'pointer',
                  accentColor: '#7c3aed',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 4, textTransform: 'capitalize' }}>
                  {permission.replace(/([A-Z])/g, ' $1').replace(/^can /, '')}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  {PERMISSION_DESCRIPTIONS[permission]}
                </div>
              </div>
              <div
                style={{
                  display: 'inline-block',
                  background: enabled ? '#dcfce7' : '#fee2e2',
                  color: enabled ? '#166534' : '#991b1b',
                  padding: '4px 12px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {enabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
          <button
            onClick={() => alert('Permissions saved!')}
            style={{
              padding: '10px 20px',
              background: '#059669',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Save Permissions
          </button>
        </div>
      </div>
    </main>
  )
}
