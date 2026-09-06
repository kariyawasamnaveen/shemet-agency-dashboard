'use client';
import Link from 'next/link';
import { useAgency } from '../context/AgencyContext';
import { convertDiamondsToPoints, formatCurrency } from '../../lib/utils/commission';
import { useAgencyStats } from '../../hooks/useAgencyStats';
import { useLiveHosts } from '../../hooks/useLiveHosts';

export default function Dashboard() {
    const { agent } = useAgency();
    const { stats, loading: statsLoading } = useAgencyStats(agent?.agencyId);
    const { liveHosts, loading: hostsLoading } = useLiveHosts(agent?.agencyId);
    
    const loading = statsLoading || hostsLoading;

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                    <p className="text-slate-400">Welcome, {agent?.name || 'Agent'}. Here's what's happening today.</p>
                </div>
                <div className="bg-slate-900 px-4 py-2 rounded-xl text-slate-300 border border-slate-800 text-sm font-mono">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Agency Revenue"
                    value={formatCurrency(stats.totalRevenuePoints)}
                    label="Points (60% Conversion)"
                    icon="💰"
                    color="from-pink-500 to-rose-600"
                />
                <StatCard
                    title="Active Hosts"
                    value={stats.onlineHosts}
                    label="Online Now"
                    icon="🟢"
                    color="from-emerald-500 to-teal-600"
                />
                <StatCard
                    title="Live Streams"
                    value={stats.activeLive}
                    label="Broadcasting"
                    icon="🎥"
                    color="from-violet-500 to-indigo-600"
                />
                <Link href="/dashboard/applications">
                    <div className="h-full bg-slate-900/50 border border-slate-800 hover:border-yellow-500/50 rounded-2xl p-6 transition-all group cursor-pointer hover:bg-slate-900">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-400 text-sm font-medium">Pending Approvals</p>
                                <h3 className="text-3xl font-bold text-white mt-2 group-hover:text-yellow-400 transition-colors">
                                    {stats.pendingApps}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                📝
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-4 group-hover:text-yellow-500/70">
                            Review Applications →
                        </p>
                    </div>
                </Link>
            </div>

            {/* Live Operations Section */}
            <div>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-red-500 mr-3 animate-pulse"></span>
                    Live Operations
                </h2>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-900 rounded-2xl animate-pulse"></div>)}
                    </div>
                ) : liveHosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {liveHosts.map(host => (
                            <div key={host.id} className="relative group overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                                <div className="aspect-video relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent z-10"></div>
                                    <img
                                        src={host.photoURL || host.photos?.[0]}
                                        alt={host.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute top-3 left-3 z-20">
                                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">LIVE</span>
                                    </div>
                                    <div className="absolute bottom-3 left-3 z-20">
                                        <p className="text-white font-bold">{host.name}</p>
                                        <p className="text-xs text-slate-300 flex items-center mt-0.5">
                                            Viewer Count: {host.viewerCount || 0} 👤
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase">Received</p>
                                        <p className="font-mono text-pink-400 font-bold">{formatCurrency(host.diamonds)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase">Revenue</p>
                                        <p className="font-mono text-white font-bold">{formatCurrency(convertDiamondsToPoints(host.diamonds))}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-10 text-center">
                        <div className="text-4xl opacity-50 mb-3">📡</div>
                        <h3 className="text-white font-medium">No Active Streams</h3>
                        <p className="text-slate-500 text-sm">None of your agency hosts are broadcasting right now.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ title, value, label, icon, color }) {
    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-pink-500/20 transition-all">
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>

            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-slate-400 text-sm font-medium">{title}</p>
                    <h3 className="text-3xl font-bold text-white mt-2 tracking-tight">{value}</h3>
                    <p className="text-xs text-slate-500 mt-1">{label}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl shadow-lg`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
