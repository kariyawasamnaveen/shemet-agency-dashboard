'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAgency } from '../../context/AgencyContext';
import { formatCurrency } from '../../../lib/utils/commission';

export default function HostsPage() {
    const { agent } = useAgency();
    const [hosts, setHosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [inviteHostId, setInviteHostId] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState('');

    const isSuperAdmin = agent?.email === 'hknskariyawasamnaveen@gmail.com';

    useEffect(() => {
        if (!agent) return;

        let q;
        if (isSuperAdmin) {
            // Super Admin sees all hosts
            q = query(
                collection(db, "users"),
                where("isHost", "==", true)
            );
        } else {
            // Agent sees only their hosts
            if (!agent.agencyId) return;
            q = query(
                collection(db, "users"),
                where("isHost", "==", true),
                where("agencyId", "==", agent.agencyId)
            );
        }

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const hostsList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setHosts(hostsList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching hosts:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [agent]);

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviteError('');
        setInviteLoading(true);

        try {
            // 1. Search for the host by their Numeric ID (id field)
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("id", "==", inviteHostId));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setInviteError('No user found with this ID. Please check the 8-digit Numeric UID.');
                setInviteLoading(false);
                return;
            }

            const hostDoc = querySnapshot.docs[0];
            const hostData = hostDoc.data();
            const hostUid = hostDoc.id;

            // 2. Security Check: Only females (Auto-Hosts) or people with isHost status can be bound
            if (!hostData.isHost && hostData.gender?.toLowerCase() !== 'female') {
                setInviteError('This user is not eligible to be a Host.');
                setInviteLoading(false);
                return;
            }

            // 3. Prevent binding if already bound to an agency
            if (hostData.agencyId) {
                setInviteError(`This host is already bound to another agency (ID: ${hostData.agencyId}).`);
                setInviteLoading(false);
                return;
            }

            // 4. Perform Direct Binding (as requested: "auto verify style")
            const { updateDoc, doc } = await import('firebase/firestore');
            await updateDoc(doc(db, "users", hostUid), {
                agencyId: agent.agencyId,
                agencyName: agent.agencyName || agent.name || 'Your Agency',
                boundAt: serverTimestamp(),
                hostStatus: 'active'
            });

            // 5. Log the binding for audit
            await addDoc(collection(db, "host_invitations"), {
                hostId: hostUid,
                hostNumericId: inviteHostId,
                agencyId: agent.agencyId,
                status: 'accepted', // Auto-accepted binding
                type: 'direct_bind',
                createdAt: serverTimestamp()
            });

            setShowAddModal(false);
            setInviteHostId('');
            alert(`Host "${hostData.name || inviteHostId}" bound successfully!`);
        } catch (error) {
            console.error("Binding Error:", error);
            setInviteError('Failed to bind host. Please try again.');
        } finally {
            setInviteLoading(false);
        }
    };

    // Filter hosts based on search
    const filteredHosts = hosts.filter(host =>
        host.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        host.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Host Management
                    </h1>
                    <p className="text-slate-400 mt-1">Manage your agency's talent pool ({hosts.length} Active)</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search hosts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500/50 pl-10 transition-all"
                        />
                        <span className="absolute left-3 top-3 text-slate-500">🔍</span>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-pink-500/20"
                    >
                        Add Host +
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-48 bg-slate-900/50 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900/80 text-slate-400 text-sm uppercase tracking-wider border-b border-slate-800">
                                    <th className="p-5 font-semibold">Host</th>
                                    <th className="p-5 font-semibold text-center">Status</th>
                                    <th className="p-5 font-semibold text-center">Level</th>
                                    <th className="p-5 font-semibold text-right">Diamonds</th>
                                    <th className="p-5 font-semibold text-right">Followers</th>
                                    <th className="p-5 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {filteredHosts.length > 0 ? (
                                    filteredHosts.map((host) => (
                                        <tr key={host.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="p-5">
                                                <div className="flex items-center space-x-3">
                                                    <div className="relative w-10 h-10">
                                                        <img
                                                            src={host.photoURL || host.photos?.[0] || `https://ui-avatars.com/api/?name=${host.name}&background=random`}
                                                            alt={host.name}
                                                            className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 group-hover:border-pink-500 transition-colors"
                                                        />
                                                        {host.isOnline && (
                                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white group-hover:text-pink-400 transition-colors">{host.name || 'Unknown'}</p>
                                                        <p className="text-xs text-slate-500 flex items-center">
                                                            {host.country || 'Global'}
                                                            {host.country && <span className="ml-1 opacity-70">🌍</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-5 text-center">
                                                {host.isLive ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse">
                                                        ● LIVE
                                                    </span>
                                                ) : host.isOnline ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                                        Online
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-500 border border-slate-500/20">
                                                        Offline
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-5 text-center">
                                                <div className="inline-block px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-yellow-500">
                                                    ⭐ {host.level || 0}
                                                </div>
                                            </td>

                                            <td className="p-5 text-right">
                                                <span className="font-mono font-medium text-pink-300">
                                                    {formatCurrency(host.diamonds)} 💎
                                                </span>
                                            </td>

                                            <td className="p-5 text-right font-medium text-slate-300">
                                                {formatCurrency(host.followers)}
                                            </td>

                                            <td className="p-5 text-right">
                                                <button className="text-sm px-3 py-1.5 rounded-lg bg-pink-500/10 text-pink-500 hover:bg-pink-500 hover:text-white transition-all border border-pink-500/20">
                                                    Manage
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-10 text-center text-slate-500">
                                            No hosts found bound to your agency.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Host Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Invite New Host</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                ╳
                            </button>
                        </div>

                        <form onSubmit={handleInvite} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Host User ID (UID)</label>
                                <input
                                    type="text"
                                    value={inviteHostId}
                                    onChange={(e) => setInviteHostId(e.target.value)}
                                    placeholder="Enter Host's mobile app UID"
                                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all font-mono"
                                    required
                                />
                                {inviteError && <p className="text-red-500 text-xs mt-2">{inviteError}</p>}
                            </div>

                            <div className="bg-slate-950/50 border border-slate-800/50 rounded-2xl p-4 text-xs text-slate-500 italic">
                                Note: The host will receive a binding invitation in their mobile app to join "{agent.name}".
                            </div>

                            <button
                                type="submit"
                                disabled={inviteLoading}
                                className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-pink-500/20"
                            >
                                {inviteLoading ? 'Sending...' : 'Send Invitation'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
