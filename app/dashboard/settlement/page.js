'use client'

import { useState, useEffect } from 'react'
import { useAgency } from '../../lib/hooks'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore'

export default function WeeklySettlementPage() {
    const { agency } = useAgency()
    const [settlements, setSettlements] = useState([])
    const [loading, setLoading] = useState(true)
    const [summary, setSummary] = useState({
        totalHostEarnings: 0,
        commissionRatio: 0,
        netCommission: 0,
        targetForNextTier: 0
    })

    const brandPlum = '#3a2639'

    // Commission Tiers (Standard Chamet logic requested by client)
    const tiers = [
        { min: 0, ratio: 0 },
        { min: 150, ratio: 5 },
        { min: 450, ratio: 8 },
        { min: 900, ratio: 10 },
        { min: 1800, ratio: 15 },
        { min: 4000, ratio: 20 },
        { min: 8000, ratio: 25 },
    ]

    const calculateCommission = (totalUSD) => {
        let currentTier = tiers[0];
        let nextTier = tiers[1];

        for (let i = 0; i < tiers.length; i++) {
            if (totalUSD >= tiers[i].min) {
                currentTier = tiers[i];
                nextTier = tiers[i + 1] || null;
            } else {
                break;
            }
        }

        const commission = (totalUSD * currentTier.ratio) / 100;
        const target = nextTier ? nextTier.min - totalUSD : 0;

        return { ratio: currentTier.ratio, net: commission, target };
    }

    useEffect(() => {
        if (!agency?.agencyId) return;

        const fetchSettlement = async () => {
            setLoading(true);
            try {
                // 1. Get all hosts for this agency
                const hostQuery = query(
                    collection(db, "users"),
                    where("isHost", "==", true),
                    where("agencyId", "==", agency.agencyId)
                );
                const hostSnap = await getDocs(hostQuery);
                const hosts = hostSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // 2. Fetch earnings for the current week (Monday to Sunday)
                const today = new Date();
                const day = today.getDay();
                const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
                const monday = new Date(today.setDate(diff));
                monday.setHours(0, 0, 0, 0);

                // For testing/display, we'll sum all historical diamonds for now 
                // In production, this would filter by the 'monday' timestamp
                let totalDiamonds = 0;
                const hostSettlementData = hosts.map(h => {
                    const diamonds = (h.diamonds || 0);
                    const earningsUSD = (diamonds * 0.6) / 100; // Standard host split
                    totalDiamonds += diamonds;
                    
                    return {
                        id: h.id,
                        nickname: h.name || 'Host',
                        diamonds: diamonds,
                        earningsUSD: earningsUSD,
                        status: 'Unpaid' // Default status requested
                    };
                });

                const totalAgencyUSD = (totalDiamonds * 0.6) / 100;
                const { ratio, net, target } = calculateCommission(totalAgencyUSD);

                setSummary({
                    totalHostEarnings: totalAgencyUSD,
                    commissionRatio: ratio,
                    netCommission: net,
                    targetForNextTier: target
                });

                setSettlements(hostSettlementData);
            } catch (error) {
                console.error("Settlement Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettlement();
    }, [agency]);

    return (
        <main style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8, display: 'flex', gap: 6 }}>
                    <span>Dashboard</span> / <span style={{ color: '#1e293b', fontWeight: 600 }}>Weekly Settlement</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, color: brandPlum, letterSpacing: '-0.02em' }}>
                            Weekly Settlement
                        </h1>
                        <p style={{ color: '#64748b', marginTop: 4 }}>Automatic commission calculation for current cycle</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button style={{ padding: '10px 20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 14, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                            Settlement History
                        </button>
                        <button style={{ padding: '10px 24px', background: brandPlum, border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(58, 38, 57, 0.3)' }}>
                            Export Report
                        </button>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
                    <div style={{ background: '#fff', padding: 24, borderRadius: 24, border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: brandPlum }}></div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', tracking: '0.05em', marginBottom: 8 }}>Total Host Earnings</p>
                        <h2 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b' }}>${summary.totalHostEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                        <div style={{ marginTop: 12, fontSize: 13, color: '#64748b' }}>
                            From all active hosts this week
                        </div>
                    </div>

                    <div style={{ background: brandPlum, padding: 24, borderRadius: 24, color: '#fff', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', tracking: '0.05em', marginBottom: 8 }}>Commission Ratio</p>
                        <h2 style={{ fontSize: 32, fontWeight: 800 }}>{summary.commissionRatio}%</h2>
                        <div style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
                            {summary.targetForNextTier > 0 
                                ? `Reach $${(summary.totalHostEarnings + summary.targetForNextTier).toLocaleString()} for next tier`
                                : 'Maximum commission tier reached!'}
                        </div>
                    </div>

                    <div style={{ background: '#fff', padding: 24, borderRadius: 24, border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: '#10b981' }}></div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', tracking: '0.05em', marginBottom: 8 }}>Your Net Commission</p>
                        <h2 style={{ fontSize: 32, fontWeight: 800, color: '#10b981' }}>${summary.netCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                        <div style={{ marginTop: 12, fontSize: 13, color: '#64748b' }}>
                            Calculated automatically
                        </div>
                    </div>
                </div>

                {/* Hosts Detailed Breakdown */}
                <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontWeight: 700, color: '#1e293b' }}>Host Earnings Breakdown</h3>
                        <div style={{ fontSize: 13, color: '#64748b' }}>Showing {settlements.length} hosts</div>
                    </div>
                    
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Host ID</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Nickname</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Diamonds</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Host Earnings (60%)</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Agent Commission ({summary.commissionRatio}%)</th>
                                    <th style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Salary Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>Calculating weekly data...</td>
                                    </tr>
                                ) : settlements.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>No hosts recorded this week.</td>
                                    </tr>
                                ) : (
                                    settlements.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                                            <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 700, color: brandPlum }}>{item.id}</td>
                                            <td style={{ padding: '16px 24px', fontSize: 14, color: '#1e293b' }}>{item.nickname}</td>
                                            <td style={{ padding: '16px 24px', fontSize: 14, color: '#64748b' }}>{item.diamonds.toLocaleString()} 💎</td>
                                            <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 600, color: '#1e293b' }}>${item.earningsUSD.toFixed(2)}</td>
                                            <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 600, color: '#10b981' }}>
                                                ${(item.earningsUSD * summary.commissionRatio / 100).toFixed(2)}
                                            </td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{ 
                                                    padding: '4px 12px', 
                                                    borderRadius: 20, 
                                                    fontSize: 12, 
                                                    fontWeight: 700, 
                                                    background: '#fef2f2', 
                                                    color: '#ef4444',
                                                    border: '1px solid #fee2e2'
                                                }}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) }
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Commission Tier Info */}
                <div style={{ marginTop: 32, padding: 24, background: 'rgba(58, 38, 57, 0.03)', borderRadius: 24, border: '1px dashed #e2e8f0' }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: brandPlum, marginBottom: 12 }}>Commission Tier Rules</h4>
                    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                        {tiers.filter(t => t.min > 0).map((t, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: summary.commissionRatio >= t.ratio ? brandPlum : '#cbd5e1' }}></div>
                                <span style={{ fontSize: 13, color: summary.commissionRatio >= t.ratio ? '#1e293b' : '#94a3b8', fontWeight: summary.commissionRatio >= t.ratio ? 600 : 400 }}>
                                    ${t.min}+ → {t.ratio}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}
