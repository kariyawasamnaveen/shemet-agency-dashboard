'use client'

import { useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, doc, runTransaction, Timestamp } from 'firebase/firestore'
import { useAgency } from '../context/AgencyContext'

export default function RechargePage() {
  const { agent } = useAgency()
  const [searchId, setSearchId] = useState('')
  const [loading, setLoading] = useState(false)
  const [foundUser, setFoundUser] = useState(null)
  const [amount, setAmount] = useState('')
  const [recharging, setRecharging] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchId) return

    setLoading(true)
    setFoundUser(null)
    setMessage({ text: '', type: '' })

    try {
      const q = query(collection(db, "users"), where("id", "==", searchId))
      const snap = await getDocs(q)

      if (snap.empty) {
        setMessage({ text: 'No user found with this Numeric ID.', type: 'error' })
      } else {
        const userData = snap.docs[0].data()
        setFoundUser({
          docId: snap.docs[0].id,
          ...userData
        })
      }
    } catch (err) {
      console.error(err)
      setMessage({ text: 'Error searching user: ' + err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleRecharge = async () => {
    const rechargeAmount = parseInt(amount)
    if (!foundUser || isNaN(rechargeAmount) || rechargeAmount <= 0) {
      setMessage({ text: 'Please enter a valid amount.', type: 'error' })
      return
    }

    setRecharging(true)
    setMessage({ text: '', type: '' })

    try {
      const userRef = doc(db, "users", foundUser.docId)
      
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef)
        if (!userDoc.exists()) throw "User document does not exist!"

        const newBalance = (userDoc.data().diamonds || 0) + rechargeAmount
        
        // 1. Update user balance
        transaction.update(userRef, { diamonds: newBalance })

        // 2. Log the transaction
        const logRef = doc(collection(db, "diamond_recharge_logs"))
        transaction.set(logRef, {
          userId: foundUser.docId,
          numericId: foundUser.id,
          amount: rechargeAmount,
          previousBalance: userDoc.data().diamonds || 0,
          newBalance: newBalance,
          agentId: agent.uid,
          agentEmail: agent.email,
          timestamp: Timestamp.now(),
          type: 'manual_admin_recharge'
        })
      })

      setMessage({ text: `Successfully added ${rechargeAmount} diamonds to ${foundUser.name || 'User'}!`, type: 'success' })
      setFoundUser(prev => ({ ...prev, diamonds: (prev.diamonds || 0) + rechargeAmount }))
      setAmount('')
    } catch (err) {
      console.error(err)
      setMessage({ text: 'Transaction failed: ' + err.message, type: 'error' })
    } finally {
      setRecharging(false)
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#1e293b' }}>Recharge Portal</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Search users by their 8-digit Numeric ID to add diamonds.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: 24, alignItems: 'start' }}>
        {/* Search Card */}
        <div style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <form onSubmit={handleSearch}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Enter 8-Digit ID</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Ex: 87654321"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  fontSize: 15
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#3a2639',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '0 20px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {message.text && message.type === 'error' && (
            <div style={{ marginTop: 16, padding: 12, background: '#fef2f2', color: '#b91c1c', borderRadius: 8, fontSize: 13, border: '1px solid #fee2e2' }}>
              {message.text}
            </div>
          )}
        </div>

        {/* Result Card */}
        {foundUser && (
          <div style={{ background: '#fff', padding: 24, borderRadius: 16, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', animation: 'fadeIn 0.3s ease-out' }}>
            <style dangerouslySetInnerHTML={{ __html: `@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }` }} />
            
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 24 }}>
              <img 
                src={foundUser.photoURL || 'https://via.placeholder.com/80'} 
                alt="Profile" 
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #f1f5f9' }}
              />
              <div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{foundUser.name || 'Anonymous User'}</h3>
                <div style={{ display: 'inline-block', background: '#fef3c7', color: '#92400e', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                  ID: {foundUser.id}
                </div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>
                  Current Diamonds: <span style={{ fontWeight: 700, color: '#3a2639' }}>{foundUser.diamonds || 0}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: 20, background: '#f8fafc', borderRadius: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>Recharge Amount (Diamonds)</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    outline: 'none',
                    fontSize: 18,
                    fontWeight: 700
                  }}
                />
                <button
                  onClick={handleRecharge}
                  disabled={recharging}
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '0 32px',
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: recharging ? 'not-allowed' : 'pointer',
                    opacity: recharging ? 0.7 : 1,
                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  {recharging ? 'Processing...' : 'Add Diamonds'}
                </button>
              </div>
            </div>

            {message.text && message.type === 'success' && (
              <div style={{ marginTop: 16, padding: 12, background: '#ecfdf5', color: '#065f46', borderRadius: 8, fontSize: 14, fontWeight: 500, border: '1px solid #d1fae5' }}>
                {message.text}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
