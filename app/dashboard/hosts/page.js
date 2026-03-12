'use client';
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function HostsPage() {
    const [hosts, setHosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchHosts = async () => {
            try {
                // Query users where isHost is true
                // Note: You might need to create an index in Firebase for compound queries
                // For now, client-side filtering might be safer if the dataset is small
                const q = query(
                    collection(db, "users"),
                    where("isHost", "==", true)
                );

                const querySnapshot = await getDocs(q);
                const hostsList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setHosts(hostsList);
            } catch (error) {
                console.error("Error fetching hosts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHosts();
    }, []);

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
                    <p className="text-slate-400 mt-1">Manage your agency's talent pool</p>
                </div>

                {/* Search Bar */}
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
                                            {/* Host Profile */}
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

                                            {/* Status */}
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

                                            {/* Level */}
                                            <td className="p-5 text-center">
                                                <div className="inline-block px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-yellow-500">
                                                    ⭐ {host.level || 0}
                                                </div>
                                            </td>

                                            {/* Earnings */}
                                            <td className="p-5 text-right">
                                                <span className="font-mono font-medium text-pink-300">
                                                    {(host.diamonds || 0).toLocaleString()} 💎
                                                </span>
                                            </td>

                                            {/* Followers */}
                                            <td className="p-5 text-right font-medium text-slate-300">
                                                {(host.followers || 0).toLocaleString()}
                                            </td>

                                            {/* Actions */}
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
                                            No hosts found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
