'use client'

import { useState, useEffect } from 'react'
import TransactionTable from '../components/TransactionTable'

// Mock data
const MOCK_TRANSACTIONS = [
  {
    id: '1',
    userName: 'Naveen Singh',
    type: 'coin',
    amount: 1000,
    reason: 'Purchase',
    before: 5000,
    after: 6000,
    timestamp: Date.now() - 3600000,
  },
  {
    id: '2',
    userName: 'Priya Sharma',
    type: 'diamond',
    amount: 50,
    reason: 'Earned from stream',
    before: 200,
    after: 250,
    timestamp: Date.now() - 7200000,
  },
  {
    id: '3',
    userName: 'Anjali Verma',
    type: 'coin',
    amount: -500,
    reason: 'Admin adjustment',
    before: 3000,
    after: 2500,
    timestamp: Date.now() - 10800000,
  },
]

export default function CoinsDiamondsPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [adjustForm, setAdjustForm] = useState({ userId: '', type: 'coin', amount: 0, reason: '' })

  useEffect(() => {
    // Simulate Firebase fetch
    setLoading(true)
    setTimeout(() => {
      setTransactions(MOCK_TRANSACTIONS)
      setLoading(false)
    }, 500)
  }, [])

  const handleAdjust = (e) => {
    e.preventDefault()
    if (!adjustForm.userId || adjustForm.amount === 0) {
      alert('Please fill all fields')
      return
    }

    const newTx = {
      id: Date.now().toString(),
      userName: 'User ' + adjustForm.userId,
      type: adjustForm.type,
      amount: parseInt(adjustForm.amount),
      reason: adjustForm.reason,
      before: 1000,
      after: 1000 + parseInt(adjustForm.amount),
      timestamp: Date.now(),
    }

    setTransactions([newTx, ...transactions])
    setAdjustForm({ userId: '', type: 'coin', amount: 0, reason: '' })
    setShowAdjustModal(false)
    alert('Adjustment successful!')
  }

  // Calculate totals
  const coinsSpent = transactions
    .filter(t => t.type === 'coin' && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const diamondsEarned = transactions
    .filter(t => t.type === 'diamond' && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <main style={{ padding: 24 }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 8 }}>Coins & Diamonds</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Manage user balances and transactions</p>
      </header>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', borderRadius: 8, padding: 16, color: '#fff' }}>
          <div style={{ fontSize: 12, marginBottom: 8, opacity: 0.9 }}>Coins Spent</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{coinsSpent.toLocaleString()}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', borderRadius: 8, padding: 16, color: '#fff' }}>
          <div style={{ fontSize: 12, marginBottom: 8, opacity: 0.9 }}>Diamonds Earned</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{diamondsEarned.toLocaleString()}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #34d399, #10b981)', borderRadius: 8, padding: 16, color: '#fff' }}>
          <div style={{ fontSize: 12, marginBottom: 8, opacity: 0.9 }}>Total Transactions</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{transactions.length}</div>
        </div>
      </div>

      {/* Adjust Button */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => setShowAdjustModal(true)}
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
          + Adjust Balance
        </button>
      </div>

      {/* Adjustment Modal */}
      {showAdjustModal && (
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
          onClick={() => setShowAdjustModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 8,
              padding: 24,
              maxWidth: 400,
              width: '90%',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: 0, marginBottom: 20 }}>Adjust Balance</h2>

            <form onSubmit={handleAdjust}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>User ID</label>
                <input
                  type="text"
                  placeholder="Enter user ID..."
                  value={adjustForm.userId}
                  onChange={(e) => setAdjustForm({ ...adjustForm, userId: e.target.value })}
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

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Type</label>
                <select
                  value={adjustForm.type}
                  onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: 6,
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="coin">Coin</option>
                  <option value="diamond">Diamond</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Amount</label>
                <input
                  type="number"
                  placeholder="Enter amount (positive or negative)..."
                  value={adjustForm.amount}
                  onChange={(e) => setAdjustForm({ ...adjustForm, amount: e.target.value })}
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
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Reason</label>
                <input
                  type="text"
                  placeholder="Reason for adjustment..."
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
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

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
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
                  Adjust
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Recent Transactions</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>Loading transactions...</div>
      ) : (
        <TransactionTable transactions={transactions} />
      )}
    </main>
  )
}
