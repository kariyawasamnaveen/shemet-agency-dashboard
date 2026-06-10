'use client'

import { useState, useEffect } from 'react'
import { useAgency } from '../../context/AgencyContext'
import { db, storage } from '@/lib/firebase'
import { collection, addDoc, query, where, getDocs, limit, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import ShemetLoader from '../../components/ShemetLoader'

export default function BuyDiamondsPage() {
    const { agent, loading: authLoading } = useAgency()
    const [amount, setAmount] = useState('')
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState({ text: '', type: '' })
    const [dealerData, setDealerData] = useState(null)

    const brandPlum = '#3a2639'
    const brandPink = '#ff1493'

    // Fetch current inventory for the agent
    useEffect(() => {
        if (agent?.uid) {
            const q = query(collection(db, "diamond_dealers"), where("uid", "==", agent.uid), limit(1))
            getDocs(q).then(snapshot => {
                if (!snapshot.empty) {
                    setDealerData({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() })
                }
            })
        }
    }, [agent])

    const handleFileChange = (e) => {
        const selected = e.target.files[0]
        if (selected) {
            setFile(selected)
            setPreview(URL.createObjectURL(selected))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!amount || parseInt(amount) <= 0) {
            setMessage({ text: 'Please enter a valid amount.', type: 'error' })
            return
        }
        if (!file) {
            setMessage({ text: 'Please upload payment proof (Screenshot/Receipt).', type: 'error' })
            return
        }

        setIsSubmitting(true)
        setMessage({ text: '', type: '' })

        try {
            // 1. Upload proof image to Storage
            const fileRef = ref(storage, `payment_proofs/${agent.uid}_${Date.now()}_${file.name}`)
            const uploadSnapshot = await uploadBytes(fileRef, file)
            const downloadLink = await getDownloadURL(uploadSnapshot.ref)

            // 2. Create request in Firestore
            await addDoc(collection(db, "diamond_purchase_requests"), {
                agentUid: agent.uid,
                agentName: agent.name || 'Agent',
                agentId: agent.id || 'N/A',
                amount: parseInt(amount),
                proofUrl: downloadLink,
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            })

            setMessage({ text: 'Purchase request submitted successfully! Admin will review it soon.', type: 'success' })
            setAmount('')
            setFile(null)
            setPreview(null)
        } catch (err) {
            console.error(err)
            setMessage({ text: 'System error: ' + err.message, type: 'error' })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (authLoading) return <ShemetLoader />

    return (
        <main style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <header style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', color: brandPlum, margin: 0 }}>Buy Diamond Inventory</h1>
                    <p style={{ color: '#64748b', marginTop: '8px', fontSize: '15px' }}>Top-up your agency shop diamonds by submitting a payment proof.</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
                    {/* Main Form Area */}
                    <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.02)' }}>
                        <form onSubmit={handleSubmit}>
                            {/* Amount Input */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '10px' }}>Diamonds Requested</label>
                                <input
                                    type="number"
                                    placeholder="Enter amount (e.g. 50000)"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: '#f1f5f9',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '16px',
                                        fontSize: '18px',
                                        fontWeight: '800',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* Payment Proof Upload */}
                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#475569', marginBottom: '10px' }}>Upload Payment Proof (Screenshot)</label>
                                <div 
                                    onClick={() => document.getElementById('fileInput').click()}
                                    style={{
                                        border: '2px dashed #cbd5e1',
                                        borderRadius: '16px',
                                        padding: '32px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        background: '#f8fafc',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <input 
                                        type="file" 
                                        id="fileInput" 
                                        hidden 
                                        accept="image/*" 
                                        onChange={handleFileChange} 
                                    />
                                    {preview ? (
                                        <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    ) : (
                                        <div>
                                            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📸</div>
                                            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Click to select or drop image here</div>
                                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>PNG, JPG or WEBP (Max 5MB)</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {message.text && (
                                <div style={{ 
                                    padding: '16px', 
                                    borderRadius: '16px', 
                                    marginBottom: '24px',
                                    background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
                                    color: message.type === 'success' ? '#065f46' : '#b91c1c',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`
                                }}>
                                    {message.type === 'success' ? '✅ ' : '⚠️ '} {message.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    width: '100%',
                                    padding: '18px',
                                    background: brandPlum,
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '16px',
                                    fontSize: '16px',
                                    fontWeight: '800',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 10px 20px -5px rgba(58, 38, 57, 0.3)',
                                    transition: 'transform 0.2s active'
                                }}
                            >
                                {isSubmitting ? 'Uploading & Processing...' : 'Submit Purchase Request'}
                            </button>
                        </form>
                    </div>

                    {/* Side Info Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Current Inventory Card */}
                        <div style={{ background: 'linear-gradient(135deg, #3a2639, #573955)', borderRadius: '24px', padding: '24px', color: '#fff', boxShadow: '0 10px 15px -3px rgba(58, 38, 57, 0.2)' }}>
                            <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', opacity: 0.7, marginBottom: '8px', letterSpacing: '0.05em' }}>Current Inventory</div>
                            <div style={{ fontSize: '32px', fontWeight: '900', color: '#fcd34d' }}>💎 {dealerData?.inventoryDiamonds?.toLocaleString() || 0}</div>
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '16px 0' }}></div>
                            <div style={{ fontSize: '12px', opacity: 0.8 }}>Once your purchase is approved, diamonds will be added here automatically.</div>
                        </div>

                        {/* Payment Details Card */}
                        <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ color: brandPink }}>💳</span> Official Payment Details
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>USDT Address (TRC20)</div>
                                    <div style={{ fontSize: '13px', fontWeight: '800', color: brandPlum, background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9', wordBreak: 'break-all' }}>
                                        TJ7XpXW... (Placeholder - Update via Admin)
                                    </div>
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', background: '#fffbeb', borderRadius: '8px', padding: '10px', border: '1px solid #fef3c7' }}>
                                    💡 *Please ensure you send the exact amount as requested to avoid approval delays.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
