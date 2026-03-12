'use client';
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

export default function EarningsPage() {
    const [topHosts, setTopHosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Real-time Stats
    const [stats, setStats] = useState({
        availableBalance: 0,
        totalPaid: 0,
        pendingWithdrawals: 0
    });

    // Chart Data
    const [weeklyData, setWeeklyData] = useState([
        { day: 'Mon', value: 0 },
        { day: 'Tue', value: 0 },
        { day: 'Wed', value: 0 },
        { day: 'Thu', value: 0 },
        { day: 'Fri', value: 0 },
        { day: 'Sat', value: 0 },
        { day: 'Sun', value: 0 },
    ]);

    const maxVal = Math.max(...weeklyData.map(d => d.value)) || 100; // Avoid divide by zero

    useEffect(() => {
        // 1. Listen to Top Performers & Wallet Balance
        const qHosts = query(
            collection(db, "users"),
            where("isHost", "==", true),
            orderBy("diamonds", "desc"),
            limit(5)
        );

        const unsubscribeHosts = onSnapshot(qHosts, (snapshot) => {
            const hosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTopHosts(hosts);
            setLoading(false);

            // Calculate Available Balance (Sum of all host diamonds)
            const totalDiamonds = hosts.reduce((sum, host) => sum + (host.diamonds || 0), 0);
            setStats(prev => ({ ...prev, availableBalance: totalDiamonds }));
        });

        // 2. Listen to Withdrawals (Total Paid & Pending)
        const qWithdrawals = query(collection(db, "withdrawals"));
        const unsubscribeWithdrawals = onSnapshot(qWithdrawals, (snapshot) => {
            let paid = 0;
            let pending = 0;

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.status === 'completed') paid += (data.amount || 0);
                if (data.status === 'pending') pending += (data.amount || 0);
            });

            setStats(prev => ({ ...prev, totalPaid: paid, pendingWithdrawals: pending }));
        });

        // 3. Listen to Recent Transactions (Weekly Chart)
        // Get start of the week (Monday)
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
        const diffToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust to make Mon=0
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - diffToMon);
        startOfWeek.setHours(0, 0, 0, 0);

        const qTransactions = query(
            collection(db, "gift_transactions"),
            where("timestamp", ">=", startOfWeek),
            orderBy("timestamp", "asc")
        );

        const unsubscribeTransactions = onSnapshot(qTransactions, (snapshot) => {
            const dailyTotals = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
            const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            snapshot.forEach(doc => {
                const data = doc.data();
                const date = data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
                const dayName = daysMap[date.getDay()];

                // Safety check for existing day key
                if (dailyTotals[dayName] !== undefined) {
                    dailyTotals[dayName] += (data.diamondAmount || 0);
                }
            });

            const chartData = [
                { day: 'Mon', value: dailyTotals['Mon'] },
                { day: 'Tue', value: dailyTotals['Tue'] },
                { day: 'Wed', value: dailyTotals['Wed'] },
                { day: 'Thu', value: dailyTotals['Thu'] },
                { day: 'Fri', value: dailyTotals['Fri'] },
                { day: 'Sat', value: dailyTotals['Sat'] },
                { day: 'Sun', value: dailyTotals['Sun'] },
            ];

            setWeeklyData(chartData);
        });

        return () => {
            unsubscribeHosts();
            unsubscribeWithdrawals();
            unsubscribeTransactions();
        };
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-pink-500/10 rounded-xl">
                        <span className="text-2xl">💰</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Financial Analytics
                        </h1>
                        <p className="text-slate-400 mt-0.5">Real-time revenue tracking</p>
                    </div>
                </div>
                <button className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-2 rounded-xl font-bold transition shadow-lg shadow-pink-600/20 flex items-center gap-2">
                    <span>💳</span> Request Withdrawal
                </button>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Charts & Overview */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Wallet Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-2">Total Diamonds</p>
                            <h3 className="text-3xl font-bold text-white tracking-tight">{(stats.availableBalance || 0).toLocaleString()} <span className="text-lg text-slate-500">💎</span></h3>
                            <p className="text-green-500 text-xs mt-2 flex items-center font-bold">
                                Now Available
                            </p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-2">Total Paid OUT</p>
                            <h3 className="text-3xl font-bold text-slate-300 tracking-tight">${(stats.totalPaid || 0).toLocaleString()}</h3>
                            <p className="text-blue-500 text-xs mt-2 flex items-center font-bold">
                                Lifetime Payouts
                            </p>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                            <p className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-2">Pending Requests</p>
                            <h3 className="text-3xl font-bold text-yellow-500 tracking-tight flex items-center gap-2">
                                ${(stats.pendingWithdrawals || 0).toLocaleString()}
                                {stats.pendingWithdrawals > 0 && <span className="flex w-3 h-3 bg-yellow-500 rounded-full animate-ping"></span>}
                            </h3>
                            <p className="text-yellow-600/80 text-xs mt-2 flex items-center font-bold">
                                Processing...
                            </p>
                        </div>
                    </div>

                    {/* Revenue Chart */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-white">Weekly Revenue</h3>
                                <p className="text-slate-400 text-sm">Real-time gift transaction history</p>
                            </div>
                        </div>

                        {/* CSS Bar Chart */}
                        <div className="h-64 flex items-end justify-between gap-2 md:gap-4 px-2">
                            {weeklyData.map((item, index) => {
                                const height = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center group cursor-pointer">
                                        <div className="relative w-full rounded-t-lg bg-slate-800 group-hover:bg-gradient-to-t group-hover:from-pink-600 group-hover:to-violet-600 transition-all duration-500" style={{ height: `${Math.max(height, 5)}%` }}>
                                            {/* Tooltip */}
                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs font-bold py-1.5 px-3 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap z-10">
                                                {item.value.toLocaleString()} 💎
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white"></div>
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-500 mt-3 font-medium group-hover:text-white transition-colors">{item.day}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Top Performers */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 h-fit backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        🏆 Top Earners
                    </h3>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-slate-900 rounded-xl animate-pulse"></div>)}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {topHosts.map((host, index) => (
                                <div key={host.id} className="flex items-center space-x-4 p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-pink-500/30 transition-all group hover:bg-slate-800/80">
                                    <span className={`text-lg font-bold w-6 text-center ${index === 0 ? 'text-yellow-400 scale-125' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-400' : 'text-slate-600'}`}>
                                        #{index + 1}
                                    </span>
                                    <div className="relative">
                                        <img
                                            src={host.photoURL || host.photos?.[0]}
                                            alt={host.name}
                                            className="w-10 h-10 rounded-full border border-slate-700 object-cover"
                                        />
                                        {index === 0 && <span className="absolute -top-2 -right-1 text-sm animate-bounce">👑</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate group-hover:text-pink-400 transition-colors">{host.name}</p>
                                        <p className="text-xs text-slate-500">Level {host.level}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-mono font-bold text-pink-400 group-hover:scale-110 transition-transform">{(host.diamonds || 0).toLocaleString()}</p>
                                        <p className="text-[10px] text-slate-500">Diamonds</p>
                                    </div>
                                </div>
                            ))}

                            <button className="w-full mt-4 py-3 text-sm text-slate-400 hover:text-white border border-slate-800 rounded-xl hover:bg-slate-800 transition">
                                View Full Leaderboard
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
