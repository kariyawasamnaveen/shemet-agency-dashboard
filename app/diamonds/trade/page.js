'use client'

import { useState, useEffect } from 'react'
import { useAgency } from '../../context/AgencyContext'
import { db } from '@/lib/firebase'
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    limit, 
    runTransaction, 
    doc, 
    serverTimestamp 
} from 'firebase/firestore'
import { useRouter } from 'next/navigation'

export default function DiamondTradePage() {
    const { agent, loading: authLoading } = useAgency()
    const router = useRouter()
    
    const [searchId, setSearchId] = useState('')
    const [foundUser, setFoundUser] = useState(null)
    const [searching, setSearching] = useState(false)
    const [amount, setAmount] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [dealerData, setDealerData] = useState(null)

    const brandPlum = '#3a2639'
    const goldGradient = 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 45%, #b38728 70%, #fbf5b7 100%)'

    // 1. Check if user is an agent and get their dealer inventory
    useEffect(() => {
        if (!authLoading && !agent) {
            router.push('/login')
            return
        }

        if (agent?.uid) {
            // Fetch dealer record to see current stock
            const q = query(collection(db, "diamond_dealers"), where("uid", "==", agent.uid), limit(1))
            getDocs(q).then(snapshot => {
                if (!snapshot.empty) {
                    setDealerData({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() })
                } else {
                    console.error("No authorized dealer record found for this agent.")
                }
            })
        }
    }, [agent, authLoading, router])

    // 2. Lookup user by Sequential ID
    useEffect(() => {
        const lookupUser = async () => {
            if (!searchId || searchId.length < 4) {
                setFoundUser(null)
                return
            }

            setSearching(true)
            try {
                const q = query(collection(db, "users"), where("id", "==", searchId), limit(1))
                const snapshot = await getDocs(q)
                if (!snapshot.empty) {
                    setFoundUser({ uid: snapshot.docs[0].id, ...snapshot.docs[0].data() })
                } else {
                    setFoundUser(null)
                }
            } catch (err) {
                console.error("User lookup error:", err)
            } finally {
                setSearching(false)
            }
        }

        const timer = setTimeout(lookupUser, 500)
        return () => clearTimeout(timer)
    }, [searchId])

    const handleTransfer = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        const transferAmount = parseInt(amount)
        if (isNaN(transferAmount) || transferAmount <= 0) {
            setError('Please enter a valid diamond amount.')
            return
        }

        if (!foundUser) {
            setError('Select a valid user first.')
            return
        }

        if (!dealerData || (dealerData.inventoryDiamonds || 0) < transferAmount) {
            setError('Insufficient diamond stock in your inventory.')
            return
        }

        if (!confirm(`Are you sure you want to transfer ${transferAmount} diamonds to ${foundUser.name}?`)) return

        setIsProcessing(true)
        try {
            await runTransaction(db, async (transaction) => {
                // Get fresh refs
                const dealerRef = doc(db, "diamond_dealers", dealerData.id)
                const userRef = doc(db, "users", foundUser.uid)

                // 1. Verify fresh stock
                const dealerSnap = await transaction.get(dealerRef)
                const currentStock = dealerSnap.data().inventoryDiamonds || 0
                
                if (currentStock < transferAmount) {
                    throw new Error("Insufficient stock verified during transaction.")
                }

                // 2. Perform updates
                transaction.update(dealerRef, {
                    inventoryDiamonds: currentStock - transferAmount,
                    updatedAt: serverTimestamp()
                })

                transaction.update(userRef, {
                    diamonds: (foundUser.diamonds || 0) + transferAmount,
                    updatedAt: serverTimestamp()
                })

                // 3. Log the transaction
                const logRef = doc(collection(db, "diamond_trade_transactions"))
                transaction.set(logRef, {
                    agentUid: agent.uid,
                    agentName: agent.name || 'Agent',
                    userUid: foundUser.uid,
                    userSequentialId: foundUser.id,
                    userName: foundUser.name,
                    amount: transferAmount,
                    type: 'selling',
                    status: 'completed',
                    createdAt: serverTimestamp()
                })
            })

            // Update local state for immediate UI feedback
            setDealerData(prev => ({ ...prev, inventoryDiamonds: prev.inventoryDiamonds - transferAmount }))
            setSuccess(`Successfully transferred ${transferAmount} diamonds to ${foundUser.name}!`)
            setAmount('')
            setSearchId('')
            setFoundUser(null)

        } catch (err) {
            console.error("Transfer error:", err)
            setError(err.message || 'Transfer failed. Please try again.')
        } finally {
            setIsProcessing(false)
        }
    }

    if (authLoading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading Diamond Trade Portal...</div>

    return (
        <main style={{ padding: 24, background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
            <header style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, marginBottom: 8 }}>Diamond Trade Portal</h1>
                <p style={{ color: '#64748b', margin: 0 }}>Transfer diamonds from your inventory directly to user accounts.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
                {/* Left Side: Trade Form */}
                <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <form onSubmit={handleTransfer}>
                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 12 }}>Search User (Sequential ID)</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="Enter User ID (e.g. 1045)"
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        background: '#f8fafc',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: 12,
                                        fontSize: 15,
                                        fontWeight: 600,
                                        boxSizing: 'border-box',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                />
                                {searching && <div style={{ position: 'absolute', right: 16, top: 14 }}>⏳</div>}
                            </div>
                        </div>

                        {foundUser && (
                            <div style={{ 
                                padding: 20, 
                                background: 'rgba(58, 38, 57, 0.05)', 
                                borderRadius: 16, 
                                marginBottom: 24, 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 16,
                                animation: 'fadeIn 0.3s ease-out'
                            }}>
                                <img 
                                    src={foundUser.photoURL || '/images/default-avatar.png'} 
                                    alt="User" 
                                    style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff' }}
                                />
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: 16 }}>{foundUser.name}</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>User ID: {foundUser.id}</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>Current: 💎 {foundUser.diamonds || 0}</div>
                                </div>
                            </div>
                        )}

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 12 }}>Transfer Amount (Diamonds)</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    background: '#f8fafc',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: 12,
                                    fontSize: 15,
                                    fontWeight: 600,
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        {error && <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>⚠️ {error}</div>}
                        {success && <div style={{ color: '#10b981', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>✅ {success}</div>}

                        <button
                            type="submit"
                            disabled={isProcessing || !foundUser}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: foundUser ? goldGradient : '#e2e8f0',
                                color: foundUser ? '#1a1a1a' : '#94a3b8',
                                border: 'none',
                                borderRadius: 12,
                                fontSize: 15,
                                fontWeight: 800,
                                cursor: (isProcessing || !foundUser) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {isProcessing ? 'Processing Transfer...' : 'Complete Transfer'}
                        </button>
                    </form>
                </div>

                {/* Right Side: Agent Info & Stock */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ 
                        background: brandPlum, 
                        color: '#fff', 
                        padding: 24, 
                        borderRadius: 20, 
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 8, textTransform: 'uppercase' }}>Available Stock</div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: '#fcf6ba' }}>
                            💎 {dealerData?.inventoryDiamonds?.toLocaleString() || 0}
                        </div>
                        <p style={{ fontSize: 11, marginTop: 16, opacity: 0.8, lineHeight: 1.5 }}>
                            This is your official supply for distribution. Contact the super admin to top-up your stock.
                        </p>
                    </div>

                    <div style={{ 
                        background: '#fff', 
                        padding: 24, 
                        borderRadius: 20, 
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Trade Guidelines</h3>
                        <ul style={{ paddingLeft: 20, margin: 0, fontSize: 12, color: '#64748b', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <li>Verify User ID twice before hitting transfer.</li>
                            <li>Transactions are recorded and permanent.</li>
                            <li>Maintain screenshots for local records.</li>
                            <li>Report any disputed transfers immediately.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    )
}
