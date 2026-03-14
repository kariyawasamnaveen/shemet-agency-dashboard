'use client'

import { useState, useEffect } from 'react'
import { useAgency } from '../lib/hooks'
import { db } from '../lib/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
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

  useEffect(() => {
    if (!agencyLoading && !agency) {
      router.push('/login')
    }
  }, [agency, agencyLoading, router])


  useEffect(() => {
    if (!agency?.agencyId) return;

    const hostsQuery = query(
      collection(db, "users"),
      where("isHost", "==", true),
      where("agencyId", "==", agency.agencyId)
    );

    const unsubscribeHosts = onSnapshot(hostsQuery, (snapshot) => {
      let totalDiamonds = 0;
      let activeCount = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        totalDiamonds += (data.diamonds || 0);
        if (data.isOnline || data.isLive) activeCount++;
      });

      setStats(prev => ({
        ...prev,
        totalHosts: snapshot.size,
        activeHosts: activeCount,
        totalEarnings: totalDiamonds * 0.6
      }));
    });

    const subAgentsQuery = query(
      collection(db, "users"),
      where("isAgent", "==", true),
      where("parentAgencyId", "==", agency.agencyId)
    );

    const unsubscribeSubAgents = onSnapshot(subAgentsQuery, (snapshot) => {
      setStats(prev => ({
        ...prev,
        earningAgents: snapshot.size
      }));
    });

    return () => {
      unsubscribeHosts();
      unsubscribeSubAgents();
    };
  }, [agency]);

  if (agencyLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fc' }}>Loading Shemet Dashboard...</div>
  }

  if (!agency) return null;

  const copyToClipboard = (link, type) => {
    const realLink = `https://chamet.com/invite/${type}?agencyId=${agency?.agencyId || 'test'}`;
    navigator.clipboard.writeText(realLink)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const lineChartData = [
    { date: '2026-03-02', hosts: Math.max(0, stats.totalHosts - 2), agents: stats.earningAgents },
    { date: '2026-03-03', hosts: Math.max(0, stats.totalHosts - 1), agents: stats.earningAgents },
    { date: '2026-03-12', hosts: stats.totalHosts, agents: stats.earningAgents },
  ]

  const distributionData = [
    { name: 'Host Diamonds', value: stats.totalEarnings },
    { name: 'Sub Commissions', value: 0 },
  ]

  const COLORS = ['#3a2639', '#7d537b']

  return (
    <main style={{ background: '#f0f2f5', minHeight: '100vh', padding: 0 }}>
      <div style={{ padding: '16px 16px 0 16px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: '0 0 16px 0' }}>Home</h1>

        {/* Banner Card */}
        <div style={{
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          minHeight: '320px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          background: '#1a1a1a',
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
            filter: 'blur(3px) brightness(0.4)',
            opacity: 0.9,
            zIndex: 0,
          }} />

          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <img
                src="/shemet-logo.png"
                alt="Logo"
                style={{
                  width: 90,
                  height: 90,
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '3px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                }}
              />
            </div>
            <h2 style={{ fontSize: 42, fontWeight: 800, color: '#fff', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.6)', letterSpacing: '1px' }}>Shemet</h2>
            <p style={{ fontSize: 18, color: '#fff', margin: 0, marginTop: 4, fontWeight: 600, opacity: 0.95, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>Chat borderless</p>
          </div>
        </div>

        {/* Invitation Mini Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16, marginBottom: 24 }}>
          {[
            { label: 'Shemet Hosts', link: 'https://chamet.com/invite/hosts', id: 'hosts' },
            { label: 'Shemet Agents', link: 'https://chamet.com/invite/agents', id: 'agents' }
          ].map((item) => (
            <div key={item.id} style={{
              background: 'linear-gradient(135deg, #573955, #3a2639)',
              borderRadius: 12,
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(58, 38, 57, 0.25)',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 500 }}>Invitation Link for</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{item.label}</div>
              </div>
              <button
                onClick={() => copyToClipboard(item.link, item.id)}
                style={{ padding: '8px 18px', background: '#fff', color: '#3a2639', border: 'none', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', marginLeft: 12 }}
              >
                {copied === item.id ? 'Copied' : 'Share'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Commission Progress Section */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: 14, color: '#333', fontWeight: 500, marginBottom: 12 }}>
                My Commission Ratio : <span style={{ color: '#f59e0b', fontWeight: 700 }}>0%</span> <span style={{ cursor: 'help', color: '#999', fontSize: 14 }}>ⓘ</span>
              </div>
              <div style={{ width: '100%', marginBottom: 12 }}>
                <div style={{ height: 10, background: '#f3f4f6', borderRadius: 5, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ width: '0%', height: '100%', background: 'linear-gradient(90deg, #573955, #3a2639)', borderRadius: 5 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#666' }}>
                  <span style={{ fontWeight: 600, color: '#3a2639' }}>$0<span style={{ color: '#999', fontWeight: 400 }}>/0%</span></span>
                  <span style={{ fontWeight: 600, color: '#3a2639' }}>$500<span style={{ color: '#999', fontWeight: 400 }}>/5%</span></span>
                </div>
                <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 8, fontWeight: 500 }}>$500 more to reach the ratio of 5%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '24px 32px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'visible', marginTop: 20 }}>
            <div>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 4, padding: '4px 8px', width: 'fit-content', fontSize: 12, color: '#666', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                2026-03 <span style={{ fontSize: 14 }}>📅</span>
              </div>
              <div style={{ fontSize: 16, color: '#444', fontWeight: 600 }}>Monthly Rewards: <span style={{ color: '#f59e0b', fontSize: 24, fontWeight: 700, marginLeft: 8 }}>$0</span></div>
            </div>
            <div style={{ position: 'absolute', right: 80, bottom: -10, zIndex: 10, filter: 'drop-shadow(-10px 15px 20px rgba(0, 0, 0, 0.25))', animation: 'floatPremium 4s ease-in-out infinite' }}>
              <style dangerouslySetInnerHTML={{ __html: `@keyframes floatPremium { 0% { transform: translate3d(0px, 0px, 0px) rotate(-3deg); } 50% { transform: translate3d(-5px, -15px, 0px) rotate(4deg); } 100% { transform: translate3d(0px, 0px, 0px) rotate(-3deg); } }` }} />
              <img src="/images/gold.png" alt="Gold" style={{ width: 180, height: 'auto' }} />
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: '24px 32px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 4, padding: '4px 8px', width: 'fit-content', fontSize: 12, color: '#666', marginBottom: 16 }}>2026-03-12 📅</div>
            <div style={{ fontSize: 16, color: '#444', fontWeight: 600, marginBottom: 32 }}>Daily Rewards: <span style={{ color: '#f59e0b', fontSize: 24, fontWeight: 700, marginLeft: 8 }}>$0</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <PurplePeopleIcon badge="star" />
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>Earning Hosts</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{stats.activeHosts}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <PurplePeopleIcon badge="coin" />
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>Invitees' Earning</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{(stats.totalEarnings).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <GoldCoinIcon />
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>My Regular Rewards</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>$0</div>
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1', height: 1, background: '#f1f5f9', margin: '-10px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <OrangePeopleIcon />
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>Earning Agents</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{stats.earningAgents}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <OrangePeopleIcon badge="coin" />
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>Invitees' Achievement</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>$0</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <GoldCoinIcon />
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>My Extra Rewards</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>$0</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#111' }}>Earning Distribution</h3>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                  {distributionData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#111' }}>Earning Line Chart</h3>
          <div style={{ height: 350, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={11} tickFormatter={(val) => val.split('-').slice(2).join('/')} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="hosts" stroke="#3a2639" strokeWidth={3} dot={{ r: 4 }} name="Hosts" />
                <Line type="monotone" dataKey="agents" stroke="#7d537b" strokeWidth={3} dot={{ r: 4 }} name="Agents" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  )
}
