'use client'

import { useState, useEffect } from 'react'
import TransactionTable from '../components/TransactionTable'

// Mock data updated for USD
const MOCK_TRANSACTIONS = [
  { id: '1', userName: 'Settlement #821', type: 'USD', amount: 450.00, reason: 'Weekly Commission', before: 0, after: 450.00, timestamp: Date.now() - 3600000 },
  { id: '2', userName: 'Withdrawal #102', type: 'USD', amount: -200.00, reason: 'TRC20 Payout', before: 450.00, after: 250.00, timestamp: Date.now() - 7200000 },
  { id: '3', userName: 'Settlement #820', type: 'USD', amount: 320.50, reason: 'Weekly Commission', before: 250.00, after: 570.50, timestamp: Date.now() - 10800000 },
]

export default function CoinsDiamondsPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [adjustForm, setAdjustForm] = useState({ userId: '', type: 'USD', amount: 0, reason: '' })
  const [withdrawalAddress, setWithdrawalAddress] = useState('')
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false)

  const brandPlum = '#3a2639'
  const goldGradient = 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 45%, #b38728 70%, #fbf5b7 100%)'
  const darkGoldBg = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setTransactions(MOCK_TRANSACTIONS)
      setLoading(false)
    }, 500)
  }, [])

  const handleAdjust = (e) => {
    e.preventDefault()
    if (adjustForm.amount === 0) {
      alert('Please enter an amount')
      return
    }

    const newTx = {
      id: Date.now().toString(),
      userName: 'Admin Adjustment',
      type: 'USD',
      amount: parseFloat(adjustForm.amount),
      reason: adjustForm.reason || 'Manual Adjustment',
      before: transactions[0]?.after || 0,
      after: (transactions[0]?.after || 0) + parseFloat(adjustForm.amount),
      timestamp: Date.now(),
    }

    setTransactions([newTx, ...transactions])
    setAdjustForm({ userId: '', type: 'USD', amount: 0, reason: '' })
    setShowAdjustModal(false)
    alert('Adjustment successful!')
  }

  const handleUpdateAddress = () => {
    if (!withdrawalAddress) {
      alert('Please enter a valid address')
      return
    }
    setIsUpdatingAddress(true)
    setTimeout(() => {
      setIsUpdatingAddress(false)
      alert('Binance TRC20 address updated successfully!')
    }, 1000)
  }

  // Calculate totals
  const balance = transactions[0]?.after || 0
  const totalEarned = transactions
    .filter(t => t.type === 'USD' && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <main style={{ padding: 24, background: '#ffffff', minHeight: '100vh', position: 'relative', overflow: 'hidden', color: '#1e293b' }}>

      {/* Background Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        background: 'radial-gradient(circle, rgba(191,149,63,0.08) 0%, transparent 70%)',
        zIndex: 0
      }} />

      <header style={{ marginBottom: 32, position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', margin: 0, marginBottom: 8, letterSpacing: '-0.5px' }}>My Wallet</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: 15, fontWeight: 500 }}>Securely manage your premium agent earnings and withdrawals.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: 24, position: 'relative', zIndex: 1 }}>

        {/* Left Column: Stats & Balance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Main Balance Card - Dark Gold Theme - Reduced Padding for smaller look */}
          <div style={{
            background: darkGoldBg,
            borderRadius: 24,
            padding: '24px 32px',
            color: '#fff',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid rgba(191, 149, 63, 0.2)'
          }}>
            {/* Gold Shimmer Overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: -100,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
              animation: 'shimmer 4s infinite',
              transform: 'skewX(-20deg)',
              zIndex: 1
            }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#bf953f', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Available Balance</div>
              <div style={{ fontSize: 42, fontWeight: 900, marginBottom: 4, display: 'flex', alignItems: 'baseline', gap: 8, color: '#fcf6ba' }}>
                <span style={{ fontSize: 24, opacity: 0.8 }}>$</span>
                {balance.toFixed(2)}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button
                  onClick={() => setShowAdjustModal(true)}
                  style={{
                    padding: '10px 20px',
                    background: goldGradient,
                    color: '#1a1a1a',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(191, 149, 63, 0.3)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Withdraw Now
                </button>
              </div>
            </div>

            {/* Premium Gold Dollar Illustration - ENLARGED */}
            <div style={{
              position: 'relative',
              zIndex: 2,
              perspective: '1000px'
            }}>
              <style dangerouslySetInnerHTML={{
                __html: `
                  @keyframes rotateGold {
                    0% { transform: rotateY(-30deg); }
                    50% { transform: rotateY(30deg); }
                    100% { transform: rotateY(-30deg); }
                  }
                  @keyframes shimmer {
                    0% { left: -150%; }
                    100% { left: 150%; }
                  }
                `}} />
              <img
                src="/images/dollr_gold.png"
                alt="Gold USD Illustration"
                style={{
                  width: 180,
                  height: 'auto',
                  objectFit: 'contain',
                  animation: 'rotateGold 6s ease-in-out infinite',
                  filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.6))'
                }}
              />
            </div>
          </div>

          {/* Secondary Stats Cards - White Theme */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 20,
              padding: 24,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 8 }}>Total Agent Commission</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a' }}>${totalEarned.toFixed(2)}</div>
            </div>
            <div style={{
              background: '#fff',
              borderRadius: 20,
              padding: 24,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600, marginBottom: 8 }}>Pending Withdrawals</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a' }}>$0.00</div>
            </div>
          </div>
        </div>

        {/* Right Column: Withdrawal Settings - ENLARGED Payout Details Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{
            background: '#fff',
            borderRadius: 24,
            padding: 32,
            border: '1px solid #e2e8f0',
            boxShadow: '0 15px 40px -5px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 24
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48,
                height: 48,
                background: '#fef3c7',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24
              }}>💰</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', margin: 0 }}>Payout Details</h2>
            </div>

            <div style={{
              background: '#f8fafc',
              borderRadius: 18,
              padding: 20,
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: 13, color: '#bf953f', fontWeight: 700, marginBottom: 6 }}>Binance TRC20 Address</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>Network: <span style={{ color: '#d97706', fontWeight: 700 }}>TRon (TRC20) Only</span></div>
              <input
                type="text"
                placeholder="Enter TRC20 Wallet Address..."
                value={withdrawalAddress}
                onChange={(e) => setWithdrawalAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: '#fff',
                  border: '2px solid #e2e8f0',
                  borderRadius: 12,
                  fontSize: 14,
                  boxSizing: 'border-box',
                  color: '#1e293b',
                  fontWeight: 600,
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
              <button
                onClick={handleUpdateAddress}
                disabled={isUpdatingAddress}
                style={{
                  width: '100%',
                  marginTop: 16,
                  padding: '14px',
                  background: brandPlum,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(58, 38, 57, 0.2)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                {isUpdatingAddress ? 'Saving Securely...' : 'Save Payout Address'}
              </button>
            </div>

            <div style={{
              padding: '16px 20px',
              background: '#fffbeb',
              borderRadius: 14,
              border: '1px solid #fef3c7',
              fontSize: 12,
              color: '#92400e',
              lineHeight: 1.6,
              fontWeight: 500
            }}>
              <strong style={{ display: 'block', marginBottom: 4 }}>⚠️ Warning:</strong>
              Please double check your wallet address. TRC20 transactions are permanent and cannot be reversed once initiated.
            </div>
          </div>
        </div>

      </div>

      {/* Activities Section - Light Mode Table */}
      <div style={{ marginTop: 40, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', margin: 0 }}>Recent Activities</h2>
          <button style={{
            background: 'transparent',
            border: 'none',
            color: '#bf953f',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer'
          }}>View Full History ›</button>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: 20,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8', fontWeight: 500 }}>
              <div style={{ marginBottom: 12 }}>⏳</div>
              Syncing financial transactions...
            </div>
          ) : (
            <TransactionTable transactions={transactions} darkMode={false} />
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          input:focus { border-color: #bf953f !important; outline: none; }
          tbody tr:hover { background: #f8fafc !important; }
        `}} />

      {/* Admin Adjust Modal - Refined for Light Theme */}
      {showAdjustModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(6px)'
          }}
          onClick={() => setShowAdjustModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 24,
              padding: 32,
              maxWidth: 400,
              width: '90%',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)',
              border: '1px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: 0, marginBottom: 8, fontSize: 22, fontWeight: 800, color: '#1e293b' }}>Manual Settlement</h2>
            <p style={{ margin: 0, marginBottom: 24, fontSize: 13, color: '#64748b' }}>Initialize a manual payout record for this agent.</p>

            <form onSubmit={handleAdjust}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Settlement Amount ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={adjustForm.amount}
                  onChange={(e) => setAdjustForm({ ...adjustForm, amount: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 12,
                    fontSize: 14,
                    boxSizing: 'border-box',
                    fontWeight: 600,
                    color: '#1e293b'
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8 }}>Transaction Memo</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly Profit Share"
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e2e8f0',
                    borderRadius: 12,
                    fontSize: 14,
                    boxSizing: 'border-box',
                    color: '#1e293b'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: goldGradient,
                    color: '#1a1a1a',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Finalize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
