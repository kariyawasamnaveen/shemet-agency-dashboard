'use client'

import { useState, useEffect } from 'react'
import { useAgency } from '../../../lib/hooks'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment, getDocs, limit, runTransaction } from 'firebase/firestore'

export default function DealersManagementPage() {
    const { agency } = useAgency()
    const [dealerProfile, setDealerProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [applying, setApplying] = useState(false)
    const [transferForm, setTransferForm] = useState({ userId: '', amount: '' })
    const [transferLoading, setTransferLoading] = useState(false)
    const [history, setHistory] = useState([])
    const [realDealers, setRealDealers] = useState([])

    const brandPlum = '#3a2639'
    const brandPlumLight = '#5a3d59'

    // 1. Listen to dealer status
    useEffect(() => {
        if (!agency?.uid) return;

        const q = query(collection(db, "diamond_dealers"), where("uid", "==", agency.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setDealerProfile({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
            } else {
                setDealerProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [agency]);

    // 2. Fetch transaction history if authorized
    useEffect(() => {
        if (!dealerProfile || dealerProfile.status !== 'authorized') return;

        const q = query(
            collection(db, "dealer_transactions"),
            where("dealerId", "==", agency.uid),
            limit(10)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setHistory(list);
        });

        return () => unsubscribe();
    }, [dealerProfile, agency]);

    // 3. Fetch all authorized dealers for the sidebox
    useEffect(() => {
        const q = query(collection(db, "diamond_dealers"), where("status", "==", "authorized"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRealDealers(list);
        });
        return () => unsubscribe();
    }, []);

    const handleApply = async () => {
        setApplying(true);
        try {
            await addDoc(collection(db, "diamond_dealers"), {
                uid: agency.uid,
                agencyId: agency.agencyId || '',
                officialName: agency.name || 'Official Dealer',
                region: 'South Asia',
                status: 'pending',
                inventoryDiamonds: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            alert("Application submitted! Admin will review your request.");
        } catch (error) {
            console.error("Application Error:", error);
            alert("Failed to submit application.");
        } finally {
            setApplying(false);
        }
    };

    const handleTransfer = async (e) => {
        e.preventDefault();
        if (parseInt(transferForm.amount) > (dealerProfile.inventoryDiamonds || 0)) {
            alert("Insufficient stock!");
            return;
        }

        setTransferLoading(true);
        try {
            // Find user by shemetId or UID
            const uq = query(collection(db, "users"), where("shemetId", "==", transferForm.userId));
            const usnap = await getDocs(uq);

            let targetUser = null;
            if (!usnap.empty) {
                targetUser = { id: usnap.docs[0].id, ...usnap.docs[0].data() };
            } else {
                // Fallback to UID check
                const uq2 = query(collection(db, "users"), where("uid", "==", transferForm.userId));
                const usnap2 = await getDocs(uq2);
                if (!usnap2.empty) {
                    targetUser = { id: usnap2.docs[0].id, ...usnap2.docs[0].data() };
                }
            }

            if (!targetUser) {
                alert("User not found! Please check the ID.");
                return;
            }

            // Perform Atomic Transfer using runTransaction
            await runTransaction(db, async (transaction) => {
                const amount = parseInt(transferForm.amount);
                
                // 1. Get current dealer and user snapshots again within transaction to ensure data hasn't changed
                const dealerRef = doc(db, "diamond_dealers", dealerProfile.id);
                const userRef = doc(db, "users", targetUser.id);
                
                const dealerSnap = await transaction.get(dealerRef);
                if (!dealerSnap.exists()) throw "Dealer document missing!";
                
                const currentInventory = dealerSnap.data().inventoryDiamonds || 0;
                if (amount > currentInventory) throw "Insufficient stock (Transaction)!";

                // 2. Log transaction (Create a new doc ref for the transaction)
                const txRef = doc(collection(db, "dealer_transactions"));
                transaction.set(txRef, {
                    dealerId: agency.uid,
                    targetUserId: targetUser.id,
                    targetShemetId: targetUser.shemetId || '',
                    amount: amount,
                    timestamp: serverTimestamp(),
                    status: 'success'
                });

                // 3. Update user wallet
                transaction.update(userRef, {
                    diamonds: increment(amount),
                    updatedAt: serverTimestamp()
                });

                // 4. Update dealer inventory
                transaction.update(dealerRef, {
                    inventoryDiamonds: increment(-amount),
                    updatedAt: serverTimestamp()
                });
            });

            setTransferForm({ userId: '', amount: '' });
            alert("Transferred successfully via secure transaction!");
        } catch (error) {
            console.error("Transfer Error:", error);
            alert("Transfer failed: " + (typeof error === 'string' ? error : "Database error"));
        } finally {
            setTransferLoading(false);
        }
    };

    const handleContactSupport = () => {
        window.open('https://wa.me/923165922766', '_blank');
    };

    const topUpAgents = realDealers.length > 0 ? realDealers : [
        { officialName: 'Elite Top-up Global', region: 'Global', status: 'Authorized' },
        { officialName: 'Shemet Official Pay', region: 'South Asia', status: 'Authorized' },
        { officialName: 'MetWallet Direct', region: 'MENA', status: 'Authorized' },
    ]

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading Diamond System...</div>

    return (
        <main style={{ padding: 24, background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
            <header style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, marginBottom: 8 }}>Diamond Seller Portal</h1>
                <p style={{ color: '#64748b', margin: 0, fontSize: 15 }}>Authorized portal for official diamond distribution.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
                {/* Main Content Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {!dealerProfile ? (
                        <div style={{ background: '#fff', borderRadius: 16, padding: 32, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div style={{ background: '#fffbeb', color: '#92400e', padding: '16px 20px', borderRadius: 12, marginBottom: 24, border: '1px solid #fef3c7', fontWeight: 600, fontSize: 14 }}>
                                You are not currently an authorized Diamond Dealer.
                            </div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: brandPlum }}>Apply as Official Dealer</h2>
                            <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: 24 }}>
                                Become an official Shemet Diamond Distributor. You can buy diamonds in bulk from the platform and sell them directly to users via their Shemet ID.
                            </p>
                            <button
                                onClick={handleApply}
                                disabled={applying}
                                style={{
                                    background: brandPlum,
                                    color: '#fff',
                                    padding: '12px 24px',
                                    borderRadius: 10,
                                    border: 'none',
                                    fontWeight: 700,
                                    cursor: applying ? 'not-allowed' : 'pointer',
                                    opacity: applying ? 0.7 : 1
                                }}
                            >
                                {applying ? 'Submitting Application...' : 'Apply Now'}
                            </button>
                        </div>
                    ) : dealerProfile.status === 'pending' ? (
                        <div style={{ background: '#fff', borderRadius: 16, padding: 32, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#92400e' }}>Application Pending</h2>
                            <p style={{ color: '#64748b', maxWidth: 400, margin: '16px auto' }}>
                                Your application to become an official dealer is being reviewed by the administration. You will be notified once approved.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Inventory Card */}
                            <div style={{ background: `linear-gradient(135deg, ${brandPlum}, ${brandPlumLight})`, borderRadius: 16, padding: 32, color: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                                <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8, fontWeight: 600 }}>Available Stock</div>
                                <div style={{ fontSize: 42, fontWeight: 800, marginBottom: 4, letterSpacing: '-1px' }}>
                                    {dealerProfile.inventoryDiamonds?.toLocaleString() || 0} <span style={{ fontSize: 20, fontWeight: 400, opacity: 0.7 }}>Diamonds</span>
                                </div>
                                <div style={{ fontSize: 13, background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 8, display: 'inline-block', marginTop: 12 }}>
                                    Status: <span style={{ fontWeight: 800, color: '#4ade80' }}>ACTIVE DEALER</span>
                                </div>
                            </div>
                            
                            {/* Transfer Tool */}
                            <div style={{ background: '#fff', borderRadius: 16, padding: 32, border: '1px solid #e2e8f0' }}>
                                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: brandPlum }}>Diamond Transfer</h2>
                                <form onSubmit={handleTransfer} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, alignItems: 'end' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Target User ID (Shemet ID/UID)</label>
                                        <input
                                            type="text"
                                            value={transferForm.userId}
                                            onChange={(e) => setTransferForm({ ...transferForm, userId: e.target.value })}
                                            placeholder="User ID"
                                            required
                                            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Amount to Transfer</label>
                                        <input
                                            type="number"
                                            value={transferForm.amount}
                                            onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                                            placeholder="Amount"
                                            required
                                            style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none' }}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={transferLoading}
                                        style={{
                                            background: brandPlum,
                                            color: '#fff',
                                            padding: '12px 24px',
                                            borderRadius: 10,
                                            border: 'none',
                                            fontWeight: 700,
                                            cursor: transferLoading ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {transferLoading ? 'Processing...' : 'Send Diamonds'}
                                    </button>
                                </form>
                            </div>

                            {/* History */}
                            <div style={{ background: '#fff', borderRadius: 16, padding: 0, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 15, color: brandPlum }}>
                                    Recent Transfers
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ background: '#f8fafc' }}>
                                        <tr>
                                            <th style={{ padding: '12px 24px', fontSize: 12, color: '#64748b' }}>Target User</th>
                                            <th style={{ padding: '12px 24px', fontSize: 12, color: '#64748b' }}>Amount</th>
                                            <th style={{ padding: '12px 24px', fontSize: 12, color: '#64748b' }}>Date</th>
                                            <th style={{ padding: '12px 24px', fontSize: 12, color: '#64748b' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.length === 0 ? (
                                            <tr><td colSpan="4" style={{ padding: 32, textAlign: 'center', color: '#94a3b8' }}>No recent history</td></tr>
                                        ) : (
                                            history.map(tx => (
                                                <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '12px 24px', fontSize: 13 }}>{tx.targetShemetId || tx.targetUserId}</td>
                                                    <td style={{ padding: '12px 24px', fontSize: 13, fontWeight: 700 }}>{tx.amount.toLocaleString()} 💎</td>
                                                    <td style={{ padding: '12px 24px', fontSize: 12, color: '#64748b' }}>{tx.timestamp?.toDate()?.toLocaleString()}</td>
                                                    <td style={{ padding: '12px 24px' }}>
                                                        <span style={{ fontSize: 10, background: '#f0fdf4', color: '#15803d', padding: '4px 8px', borderRadius: 20, fontWeight: 700 }}>{tx.status}</span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar Info */}
                <div style={{ background: brandPlum, borderRadius: 16, padding: 24, color: '#fff', height: 'fit-content' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20 }}>💎</span> Top-up Agents
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {topUpAgents.map((agent, i) => (
                            <div key={i} style={{
                                background: 'rgba(255,255,255,0.08)',
                                padding: 16,
                                borderRadius: 12,
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{agent.officialName}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{agent.region}</span>
                                    <span style={{ fontSize: 10, background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                                        {agent.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={handleContactSupport}
                        style={{
                            width: '100%',
                            marginTop: 24,
                            padding: '12px',
                            background: '#fff',
                            color: brandPlum,
                            border: 'none',
                            borderRadius: 10,
                            fontWeight: 800,
                            fontSize: 13,
                            cursor: 'pointer'
                        }}
                    >
                        Contact Official Support
                    </button>

                    <div style={{ marginTop: 24, padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: 12, fontSize: 12, opacity: 0.8, lineHeight: 1.6 }}>
                        Authorized dealers can purchase diamonds at wholesale prices. Minimum top-up for dealer inventory is $500 USD.
                    </div>
                </div>
            </div>
        </main>
    )
}
