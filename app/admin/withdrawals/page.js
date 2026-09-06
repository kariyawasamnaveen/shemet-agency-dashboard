'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where, getDocs, runTransaction, increment, serverTimestamp } from 'firebase/firestore';
import { useAgency } from '../../context/AgencyContext';
import { useRouter } from 'next/navigation';

export default function AdminWithdrawalsPage() {
    const { agency, loading: agencyLoading } = useAgency();
    const [agentRequests, setAgentRequests] = useState([]);
    const [hostWithdrawals, setHostWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('agents'); // 'agents' or 'hosts'
    const [txModal, setTxModal] = useState({ show: false, requestId: null, userId: null, amount: 0 });
    const router = useRouter();

    const isSuperAdmin = agency?.email === 'hknskariyawasamnaveen@gmail.com';

    useEffect(() => {
        if (!agencyLoading && !isSuperAdmin) {
            router.push('/');
        }
    }, [isSuperAdmin, agencyLoading]);

    useEffect(() => {
        if (!isSuperAdmin) return;
        // Listen to Agent Payout Requests (using Unified collection)
        const qAgents = query(collection(db, "withdraw_requests"), orderBy("createdAt", "desc"));
        const unsubscribeAgents = onSnapshot(qAgents, (snapshot) => {
            const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAgentRequests(reqs);
            setLoading(false);
        }, (err) => {
            console.error("Agents fetch error:", err);
            setLoading(false);
        });

        // Listen to Host Self-Withdrawals
        const qHosts = query(collection(db, "host_withdrawals"), orderBy("timestamp", "desc"));
        const unsubscribeHosts = onSnapshot(qHosts, (snapshot) => {
            const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setHostWithdrawals(reqs);
        });

        return () => {
            unsubscribeAgents();
            unsubscribeHosts();
        };
    }, []);

    const handlePayout = async (txHash) => {
        const { requestId, userId, amount } = txModal;
        if (!txHash) {
            alert("Please provide a TXID");
            return;
        }

        try {
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, "users", userId);
                const requestRef = doc(db, "withdraw_requests", requestId);
                
                // Find corresponding wallet_transactions entry
                const txQuery = query(collection(db, "wallet_transactions"), where("requestId", "==", requestId));
                const txSnapshot = await getDocs(txQuery);
                
                // 1. Update User Balance
                transaction.update(userRef, {
                    walletBalanceUSD: increment(-amount),
                    updatedAt: serverTimestamp()
                });

                // 2. Update Withdrawal Request
                transaction.update(requestRef, {
                    status: 'paid',
                    txHash: txHash,
                    updatedAt: serverTimestamp()
                });

                // 3. Update Wallet Transaction Log
                if (!txSnapshot.empty) {
                    const txDocRef = txSnapshot.docs[0].ref;
                    transaction.update(txDocRef, {
                        status: 'completed',
                        txHash: txHash
                    });
                }
            });

            alert("Payout confirmed successfully!");
            setTxModal({ show: false, requestId: null, userId: null, amount: 0 });
        } catch (err) {
            console.error("Payout Error:", err);
            alert("Failed to process payout: " + err.message);
        }
    };

    const handleUpdateStatus = async (requestId, newStatus) => {
        try {
            await updateDoc(doc(db, "withdraw_requests", requestId), {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
        } catch (err) {
            console.error("Update Status Error:", err);
            alert("Failed to update status");
        }
    };

    if (agencyLoading || loading) return <div className="p-8">Loading Withdrawals...</div>;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Withdrawal Management</h1>
                <p className="text-slate-500 mt-1">Monitor agent payout requests and host self-withdrawals.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('agents')}
                    className={`pb-3 px-4 font-bold transition-all ${activeTab === 'agents' ? 'border-b-2 border-[#3a2639] text-[#3a2639]' : 'text-slate-400'}`}
                >
                    Agent Requests ({agentRequests.length})
                </button>
                <button
                    onClick={() => setActiveTab('hosts')}
                    className={`pb-3 px-4 font-bold transition-all ${activeTab === 'hosts' ? 'border-b-2 border-[#3a2639] text-[#3a2639]' : 'text-slate-400'}`}
                >
                    Host Self-Withdraws ({hostWithdrawals.length})
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        {activeTab === 'agents' ? (
                            <tr>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">Agent ID / Name</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">Amount (USDT)</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">TRC20 Address</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">Date</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">Status</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600 text-right">Action</th>
                            </tr>
                        ) : (
                            <tr>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">Host ID / Name</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">Amount</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">Timestamp</th>
                                <th className="px-6 py-4 text-sm font-bold text-slate-600">Method</th>
                            </tr>
                        )}
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {activeTab === 'agents' ? (
                            agentRequests.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">No pending requests</td></tr>
                            ) : (
                                agentRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-700">{req.agentName || 'Unknown Agent'}<br /><span className="text-xs text-slate-400">UID: {req.agentId}</span></td>
                                        <td className="px-6 py-4 font-bold text-emerald-600">${req.amount}</td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-500 break-all max-w-[150px]">{req.payoutAddress || req.walletAddress}</td>
                                        <td className="px-6 py-4 text-xs text-slate-500">{req.createdAt?.toDate ? req.createdAt.toDate().toLocaleString() : 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${req.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                                    req.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                                {req.txHash && <span className="text-[10px] font-mono text-slate-400 break-all max-w-[100px]">{req.txHash}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {req.status === 'pending' && (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => setTxModal({ show: true, requestId: req.id, userId: req.userId, amount: req.amount })}
                                                        className="px-3 py-1 bg-[#3a2639] text-white text-xs font-bold rounded-lg hover:opacity-90"
                                                    >
                                                        Confirm Paid
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.id, 'rejected')}
                                                        className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )
                        ) : (
                            hostWithdrawals.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">No host withdrawals recorded</td></tr>
                            ) : (
                                hostWithdrawals.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-700">Host #{req.hostNbr || req.hostId}</td>
                                        <td className="px-6 py-4 font-bold text-slate-700">${req.amount}</td>
                                        <td className="px-6 py-4 text-xs text-slate-500">{req.timestamp?.toDate ? req.timestamp.toDate().toLocaleString() : 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{req.method || 'Self-Withdraw'}</td>
                                    </tr>
                                ))
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {/* TXID Modal */}
            {txModal.show && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Confirm Payment</h2>
                        <p className="text-slate-500 mb-6 text-sm">Please enter the Binance Transaction Hash (TXID) after sending <strong>${txModal.amount}</strong>.</p>
                        
                        <input 
                            type="text"
                            id="txHashInput"
                            placeholder="Paste TXID here..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 mb-6 focus:ring-2 focus:ring-[#3a2639] outline-none"
                        />

                        <div className="flex gap-4">
                            <button 
                                onClick={() => handlePayout(document.getElementById('txHashInput').value)}
                                className="flex-1 bg-[#3a2639] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all"
                            >
                                Confirm & Mark Paid
                            </button>
                            <button 
                                onClick={() => setTxModal({ show: false, requestId: null, userId: null, amount: 0 })}
                                className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
