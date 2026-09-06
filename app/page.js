'use client'

import { useState, useEffect } from 'react'
import { useAgency } from '../lib/hooks'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'

// --- Custom SVG Icons ---
const PurplePeopleIcon = ({ badge }) => (
  <svg width="52" height="52" viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="pGrad1" x1="0" y1="0" x2="100" y2="100">
        <stop offset="0%" stopColor="#e879f9" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
      <linearGradient id="pGrad2" x1="0" y1="0" x2="100" y2="100">
        <stop offset="0%" stopColor="#d8b4fe" />
        <stop offset="100%" stopColor="#9333ea" />
      </linearGradient>
      <filter id="pGlow" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#a855f7" floodOpacity="0.4" />
      </filter>
    </defs>
    <g filter="url(#pGlow)">
      <g transform="translate(0, 0) scale(0.85)">
        <circle cx="35" cy="35" r="20" fill="url(#pGrad2)" />
        <path d="M0,95 Q35,55 70,95 Z" fill="url(#pGrad2)" />
      </g>
      <g transform="translate(15, 10) scale(0.9)">
        <circle cx="50" cy="35" r="20" fill="url(#pGrad1)" />
        <path d="M15,95 Q50,55 85,95 Z" fill="url(#pGrad1)" />
      </g>
      {badge === 'star' && (
        <g transform="translate(55, 60)">
          <circle cx="15" cy="15" r="15" fill="#fcd34d" stroke="#fff" strokeWidth="2" />
          <path d="M15,6 L17.5,11.5 L23.5,12 L19,16 L20.5,22 L15,19 L9.5,22 L11,16 L6.5,12 L12.5,11.5 Z" fill="#fff" />
        </g>
      )}
      {badge === 'coin' && (
        <g transform="translate(55, 60)">
          <circle cx="15" cy="15" r="15" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
          <text x="15" y="21" fontSize="16" fontWeight="900" fill="#fff" textAnchor="middle">$</text>
        </g>
      )}
    </g>
  </svg>
);

const OrangePeopleIcon = ({ badge }) => (
  <svg width="52" height="52" viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="oGrad1" x1="0" y1="0" x2="100" y2="100">
        <stop offset="0%" stopColor="#fcd34d" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
      <linearGradient id="oGrad2" x1="0" y1="0" x2="100" y2="100">
        <stop offset="0%" stopColor="#fde68a" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <filter id="oGlow">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.4" />
      </filter>
    </defs>
    <g filter="url(#oGlow)">
      <g transform="translate(0, 0) scale(0.85)">
        <circle cx="35" cy="35" r="20" fill="url(#oGrad2)" />
        <path d="M0,95 Q35,55 70,95 Z" fill="url(#oGrad2)" />
      </g>
      <g transform="translate(15, 10) scale(0.9)">
        <circle cx="50" cy="35" r="20" fill="url(#oGrad1)" />
        <path d="M15,95 Q50,55 85,95 Z" fill="url(#oGrad1)" />
        <path d="M45,65 L55,65 L52,85 L50,90 L48,85 Z" fill="#fff" opacity="0.8" />
      </g>
      {badge === 'coin' && (
        <g transform="translate(55, 60)">
          <circle cx="15" cy="15" r="15" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
          <text x="15" y="21" fontSize="16" fontWeight="900" fill="#fff" textAnchor="middle">$</text>
        </g>
      )}
    </g>
  </svg>
);

const GoldCoinIcon = () => (
  <svg width="52" height="52" viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="cGrad" x1="20" y1="20" x2="80" y2="80">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
      <filter id="cGlow">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.5" />
      </filter>
    </defs>
    <g filter="url(#cGlow)">
      <circle cx="50" cy="50" r="35" fill="url(#cGrad)" stroke="#fef08a" strokeWidth="4" />
      <circle cx="50" cy="50" r="28" fill="none" stroke="#d97706" strokeWidth="2" opacity="0.5" />
      <text x="50" y="65" fontSize="40" fontWeight="900" fill="#fff" textAnchor="middle">$</text>
    </g>
  </svg>
);

export default function HomePage() {
  const { agency, loading: agencyLoading } = useAgency()
  const router = useRouter()
  const [copied, setCopied] = useState(null)
  const [stats, setStats] = useState({
    totalHosts: 0,
    activeHosts: 0,
    totalEarnings: 0,
    earningAgents: 0
  })
  const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [monthlyEarnings, setMonthlyEarnings] = useState(0)
  const [commissionInfo, setCommissionInfo] = useState({ ratio: 0, current: 0, target: 500 })
  const [showTooltip, setShowTooltip] = useState(false)
  const [historicalData, setHistoricalData] = useState([])

  useEffect(() => {
    if (!agencyLoading && !agency) {
      router.push('/login')
    }
  }, [agency, agencyLoading, router])


  useEffect(() => {
    if (!agency?.agencyId) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = searchDate === todayStr;

    const fetchPerformance = async () => {
      try {
        if (isToday) {
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);

          const giftQ = query(
            collection(db, "gift_transactions"),
            where("agencyId", "==", agency.agencyId),
            where("timestamp", ">=", Timestamp.fromDate(startOfDay))
          );

          const callQ = query(
            collection(db, "calls"),
            where("agencyId", "==", agency.agencyId),
            where("endedAt", ">=", Timestamp.fromDate(startOfDay))
          );

          const [giftSnap, callSnap] = await Promise.all([getDocs(giftQ), getDocs(callQ)]);

          let total = 0;
          giftSnap.forEach(d => total += (d.data().diamondAmount || 0));
          callSnap.forEach(d => total += (d.data().diamondsEarned || 0));

          setStats(prev => ({
            ...prev,
            totalEarnings: (total * 0.6) / 100 // USD
          }));
        } else {
          const q = query(
            collection(db, "daily_agency_performance"),
            where("date", "==", searchDate),
            where("agencyId", "==", agency.agencyId)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const data = snap.docs[0].data();
            setStats(prev => ({
              ...prev,
              activeHosts: data.hostCount || 0,
              totalEarnings: data.totalRevenueUSD || 0,
            }));
          } else {
            setStats(prev => ({ ...prev, activeHosts: 0, totalEarnings: 0 }));
          }
        }
      } catch (e) { console.error(e); }
    };

    fetchPerformance();
  }, [agency, searchDate]);

  // 4. Fetch Monthly Stats from aggregated collection
  useEffect(() => {
    if (!agency?.agencyId) return;

    const fetchMonthlyStats = async () => {
      try {
        const q = query(
          collection(db, "daily_agency_performance"),
          where("agencyId", "==", agency.agencyId),
          where("date", ">=", `${selectedMonth}-01`),
          where("date", "<=", `${selectedMonth}-31`)
        );
        const snap = await getDocs(q);
        let total = 0;
        snap.forEach(d => total += (d.data().totalRevenueUSD || 0));

        // If selectedMonth is current month, add today's earnings too
        const currentMonth = new Date().toISOString().slice(0, 7);
        if (selectedMonth === currentMonth) {
          total += stats.totalEarnings;
        }

        setMonthlyEarnings(total);
      } catch (e) {
        console.error("Error fetching monthly stats:", e);
      }
    };

    fetchMonthlyStats();
  }, [agency, selectedMonth, stats.totalEarnings]);

  // 5. Fetch Historical Data for Charts (Last 14 Days)
  useEffect(() => {
    if (!agency?.agencyId) return;

    const fetchHistoricalData = async () => {
      try {
        const q = query(
          collection(db, "daily_agency_performance"),
          where("agencyId", "==", agency.agencyId),
          orderBy("date", "desc"),
          limit(14)
        );
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({
          date: doc.data().date,
          hosts: doc.data().hostCount || 0,
          agents: doc.data().agentCount || 0, // Assuming we have this field
          revenue: doc.data().totalRevenueUSD || 0
        })).reverse();

        // Add today to the end of the history
        const todayStr = new Date().toISOString().split('T')[0];
        if (data.length === 0 || data[data.length - 1].date !== todayStr) {
          data.push({
            date: todayStr,
            hosts: stats.totalHosts,
            agents: stats.earningAgents,
            revenue: stats.totalEarnings
          });
        }

        setHistoricalData(data);
      } catch (e) {
        console.error("Error fetching historical data:", e);
      }
    };

    fetchHistoricalData();
  }, [agency, stats.totalEarnings, stats.totalHosts, stats.earningAgents]);

  // Real-time tracking for static counts (Total Hosts, etc.)
  useEffect(() => {
    if (!agency?.agencyId) return;

    const hostsQuery = query(collection(db, "users"), where("isHost", "==", true), where("agencyId", "==", agency.agencyId));
    const unsubHosts = onSnapshot(hostsQuery, s => setStats(p => ({ ...p, totalHosts: s.size })));

    const agentsQuery = query(collection(db, "users"), where("isAgent", "==", true), where("parentAgencyId", "==", agency.agencyId));
    const unsubAgents = onSnapshot(agentsQuery, s => setStats(p => ({ ...p, earningAgents: s.size })));

    return () => { unsubHosts(); unsubAgents(); };
  }, [agency]);

  // Calculate commission based on totalEarnings (simple tiers)
  useEffect(() => {
    const earnings = stats.totalEarnings;
    let ratio = 0;
    let target = 500;

    if (earnings >= 10000) { ratio = 20; target = 20000; }
    else if (earnings >= 5000) { ratio = 15; target = 10000; }
    else if (earnings >= 2000) { ratio = 10; target = 5000; }
    else if (earnings >= 500) { ratio = 5; target = 2000; }
    else { ratio = 0; target = 500; }

    setCommissionInfo({ ratio, current: earnings, target });
  }, [stats.totalEarnings]);

  if (agencyLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fc' }}>Loading Shemet Dashboard...</div>
  }

  if (!agency) return null;


  const copyToClipboard = (type) => {
    const baseUrl = window.location.origin;
    const realLink = `${baseUrl}/join?agencyId=${agency?.agencyId || 'test'}&role=${type === 'hosts' ? 'host' : 'agent'}`;
    navigator.clipboard.writeText(realLink)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }


  const lineChartData = historicalData.length > 0 ? historicalData : [
    { date: '2026-03-02', hosts: 0, agents: 0 },
  ]

  const distributionData = [
    { name: 'Host Diamonds', value: stats.totalEarnings },
    { name: 'Agency Commission', value: (stats.totalEarnings * (commissionInfo.ratio / 100)) },
  ]

  const COLORS = ['#3a2639', '#7d537b']

  return (
    <main style={{ background: '#f8fafc', minHeight: '100vh', padding: 0 }} className="animate-fade-in">
      <div style={{ padding: '24px 24px 0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
             <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0, letterSpacing: '-0.02em' }}>Dashboard</h1>
             <p style={{ fontSize: 13, color: '#64748b', margin: 0, fontWeight: 500 }}>Welcome back to Shemet Agent Hub</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
             <div style={{ background: '#fff', borderRadius: 12, padding: '8px 16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>TODAY IS</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#3a2639' }}>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
             </div>
          </div>
        </div>

        {/* Banner Card - Premium Overhaul */}
        <div style={{
          position: 'relative',
          borderRadius: 24,
          overflow: 'hidden',
          minHeight: '340px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
          boxShadow: '0 20px 40px -10px rgba(58, 38, 57, 0.4)',
          background: '#020617',
          marginBottom: 32
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("/images/banner.jpeg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px) brightness(0.35)',
            opacity: 0.9,
            zIndex: 0,
          }} />
          
          {/* Animated Overlay Gradients */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 10% 20%, rgba(255, 20, 147, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(58, 38, 57, 0.4) 0%, transparent 40%)',
            zIndex: 1
          }} />

          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: 16,
              position: 'relative'
            }}>
               {/* Glowing Background for Logo */}
               <div style={{
                 position: 'absolute',
                 width: '140px',
                 height: '140px',
                 background: 'rgba(255, 20, 147, 0.2)',
                 filter: 'blur(40px)',
                 borderRadius: '50%',
                 animation: 'pulseGlow 3s ease-in-out infinite'
               }} />

              {/* IMPROVED 3D ROTATING LOGO */}
              <div style={{ 
                perspective: '1000px',
                width: '120px',
                height: '120px',
                position: 'relative'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  animation: 'spin3D 4s linear infinite'
                }}>
                  {/* Front Side */}
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '4px',
                    WebkitBackfaceVisibility: 'hidden',
                    backfaceVisibility: 'hidden',
                    zIndex: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img
                      src="/shemet-logo.png"
                      alt="Logo"
                      style={{
                        width: '94%',
                        height: '94%',
                        objectFit: 'cover',
                        borderRadius: '50%'
                      }}
                    />
                  </div>
                  {/* Back Side */}
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: '#3a2639',
                    transform: 'rotateY(180deg)',
                    WebkitBackfaceVisibility: 'hidden',
                    backfaceVisibility: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                    border: '4px solid rgba(255, 20, 147, 0.3)'
                  }}>
                    <img
                      src="/shemet-logo.png"
                      alt="Logo Back"
                      style={{
                        width: '94%',
                        height: '94%',
                        objectFit: 'cover',
                        borderRadius: '50%'
                      }}
                    />
                  </div>
                </div>
              </div>
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin3D { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
                @keyframes pulseGlow { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
              ` }} />
            </div>
            <h2 style={{ fontSize: 48, fontWeight: 900, color: '#fff', margin: 0, textShadow: '0 4px 12px rgba(0,0,0,0.8)', letterSpacing: '-0.03em' }}>Shemet</h2>
            <div style={{ 
               display: 'flex', 
               alignItems: 'center', 
               gap: 8, 
               marginTop: 8,
               background: 'rgba(255, 255, 255, 0.15)',
               backdropFilter: 'blur(10px)',
               padding: '6px 16px',
               borderRadius: '30px',
               border: '1px solid rgba(255, 255, 255, 0.2)',
               boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <p style={{ fontSize: 16, color: '#fff', margin: 0, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Chat borderless</p>
            </div>
          </div>
        </div>

        {/* Invitation Mini Cards Grid - Premium */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginBottom: 32 }}>
          {[
            { label: 'Shemet Hosts', link: 'https://chamet.com/invite/hosts', id: 'hosts' },
            { label: 'Shemet Agents', link: 'https://chamet.com/invite/agents', id: 'agents' }
          ].map((item) => (
            <div key={item.id} style={{
              background: item.id === 'hosts' ? 'linear-gradient(135deg, #3a2639 0%, #7d537b 100%)' : 'linear-gradient(135deg, #FF1493 0%, #C91273 100%)',
              borderRadius: 20,
              padding: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#fff',
              boxShadow: '0 12px 24px -10px rgba(58, 38, 57, 0.3)',
              position: 'relative',
              overflow: 'hidden'
            }} className="hover-lift">
              <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                filter: 'blur(30px)'
              }} />
              <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Invitation Link for</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{item.label}</div>
              </div>
              <button
                onClick={() => copyToClipboard(item.id)}
                style={{ 
                   padding: '10px 22px', 
                   background: '#fff', 
                   color: item.id === 'hosts' ? '#3a2639' : '#FF1493', 
                   border: 'none', 
                   borderRadius: '14px', 
                   fontSize: 13, 
                   fontWeight: 800, 
                   cursor: 'pointer', 
                   marginLeft: 12,
                   boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                   position: 'relative',
                   zIndex: 1
                }}
              >
                {copied === item.id ? 'Copied ✅' : 'Share Link 🔗'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 24px 40px 24px' }} className="dashboard-grid">
        {/* Commission Progress Section - Elite Design */}
        <div className="glass-card" style={{ padding: 28, position: 'relative', overflow: 'visible' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
             <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', margin: 0 }}>Agency Commission Status</h3>
             <div style={{ background: '#fef3f2', color: '#ff1493', padding: '6px 14px', borderRadius: '30px', fontSize: 13, fontWeight: 800 }}>
                Tier: <span style={{ fontSize: 16 }}>{commissionInfo.ratio}%</span>
             </div>
          </div>
          
          <div style={{ position: 'relative', marginBottom: 24 }}>
             <div style={{ height: 14, background: '#f1f5f9', borderRadius: 10, padding: '3px' }}>
                <div style={{
                   width: `${Math.min(100, (commissionInfo.current / commissionInfo.target) * 100)}%`,
                   height: '100%',
                   background: 'linear-gradient(90deg, #3a2639 0%, #ff1493 100%)',
                   borderRadius: 7,
                   transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
                   position: 'relative'
                }}>
                   <div style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: '4px',
                      height: '100%',
                      background: '#fff',
                      opacity: 0.5
                   }} />
                </div>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                <div>
                   <span style={{ fontSize: 22, fontWeight: 900, color: '#3a2639' }}>${Math.floor(commissionInfo.current)}</span>
                   <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginLeft: 6 }}>Earned</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <span style={{ fontSize: 22, fontWeight: 900, color: '#ff1493' }}>${commissionInfo.target}</span>
                   <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginLeft: 6 }}>Next Goal</span>
                </div>
             </div>
          </div>

          <div style={{ 
             background: 'rgba(255, 20, 147, 0.04)', 
             borderRadius: '16px', 
             padding: '16px', 
             display: 'flex', 
             alignItems: 'center', 
             gap: 12,
             border: '1px dashed rgba(255, 20, 147, 0.2)' 
          }}>
             <span style={{ fontSize: 24 }}>📈</span>
             <p style={{ fontSize: 13, color: '#3a2639', fontWeight: 600, margin: 0 }}>
                You are just <span style={{ color: '#ff1493' }}>${Math.floor(commissionInfo.target - commissionInfo.current)}</span> away from the <strong>Next Commission Tier!</strong>
             </p>
          </div>
        </div>

        {/* Rewards Sections - Premium Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Monthly Rewards Card */}
          <div className="glass-card" style={{ padding: 28, minHeight: '160px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.8)', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '6px 14px', width: 'fit-content', marginBottom: 14 }}>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#334155', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
                />
              </div>
              <p style={{ fontSize: 14, color: '#64748b', fontWeight: 700, margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Monthly Rewards</p>
              <h2 style={{ fontSize: 36, fontWeight: 900, color: '#3a2639', margin: 0 }}>${monthlyEarnings.toLocaleString()}</h2>
            </div>
            <div style={{ position: 'absolute', right: -20, bottom: -20, zIndex: 0, opacity: 0.9, filter: 'drop-shadow(-10px 20px 30px rgba(0, 0, 0, 0.2))', transform: 'rotate(-5deg)' }}>
              <img src="/images/gold.png" alt="Gold" style={{ width: 200, height: 'auto' }} />
            </div>
          </div>

          {/* Daily Rewards Grid - High Performance Look */}
          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
               <div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.8)', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '6px 14px', width: 'fit-content', marginBottom: 8 }}>
                    <input
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#334155', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
                    />
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', fontWeight: 700, margin: 0 }}>DAILY PERFORMANCE</p>
               </div>
               <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, margin: 0 }}>EARNINGS TODAY</p>
                  <h3 style={{ fontSize: 24, fontWeight: 900, color: '#ff1493', margin: 0 }}>${(stats.totalEarnings).toLocaleString()}</h3>
               </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px 16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <PurplePeopleIcon badge="star" />
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Earning Hosts</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#1e293b' }}>{stats.activeHosts}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <PurplePeopleIcon badge="coin" />
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Hosts Earning</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#1e293b' }}>{(stats.totalEarnings).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <GoldCoinIcon />
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Regular Rewards</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#10b981' }}>$0</div>
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1', height: 1, background: '#f1f5f9', margin: '0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <OrangePeopleIcon />
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Earning Agents</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#1e293b' }}>{stats.earningAgents}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <OrangePeopleIcon badge="coin" />
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Invitees' Performance</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#1e293b' }}>$0</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <GoldCoinIcon />
                <div>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Extra Rewards</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#10b981' }}>$0</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section - Clean & Modern */}
        <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
             <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: 0 }}>Earning Distribution</h3>
             <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>REAL-TIME ANALYTICS</div>
          </div>
          <div style={{ height: 320, width: '100%', padding: '0 0 10px 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} fontWeight={700} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} fontWeight={600} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(58, 38, 57, 0.04)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={50}>
                  {distributionData.map((entry, index) => <Cell key={index} fill={index === 0 ? '#3a2639' : '#ff1493'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
             <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b', margin: 0 }}>Historical Growth Trend</h3>
             <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700 }}>LAST 14 DAYS</div>
          </div>
          <div style={{ height: 350, width: '100%', padding: '0 0 10px 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" fontSize={10} fontWeight={700} axisLine={false} tickLine={false} tickFormatter={(val) => val.split('-').slice(2).join('/')} />
                <YAxis fontSize={10} fontWeight={600} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 20, fontWeight: 700, fontSize: 12 }} />
                <Line type="monotone" dataKey="hosts" stroke="#3a2639" strokeWidth={4} dot={{ r: 5, fill: '#3a2639', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} name="Earning Hosts" />
                <Line type="monotone" dataKey="agents" stroke="#ff1493" strokeWidth={4} dot={{ r: 5, fill: '#ff1493', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} name="Active Agents" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  )
}
