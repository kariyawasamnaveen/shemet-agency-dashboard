'use client'

import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'

// Mock Data for Analytics
const lineChartData = [
  { date: '2026-03-02', hosts: 0, agents: 0 },
  { date: '2026-03-03', hosts: 10, agents: 5 },
  { date: '2026-03-04', hosts: 8, agents: 12 },
  { date: '2026-03-05', hosts: 15, agents: 8 },
  { date: '2026-03-06', hosts: 12, agents: 15 },
  { date: '2026-03-07', hosts: 20, agents: 10 },
  { date: '2026-03-08', hosts: 18, agents: 25 },
]

const distributionData = [
  { name: 'Host Earnings', value: 400 },
  { name: 'Agent Commissions', value: 300 },
]

const COLORS = ['#3a2639', '#7d537b'] // Primary Plum and Medium Plum for Bar Chart

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
        {/* Tie detail for Orange icon */}
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

const CashStackIllustration = () => (
  <svg width="120" height="80" viewBox="0 0 200 120" fill="none">
    <g transform="rotate(-15) translate(-20, 20)">
      <rect x="40" y="40" width="120" height="60" rx="8" fill="#4ade80" />
      <rect x="50" y="50" width="100" height="40" rx="4" fill="#22c55e" />
      <circle cx="100" cy="70" r="15" fill="#16a34a" />
      <text x="100" y="78" fontSize="20" fontWeight="bold" fill="#4ade80" textAnchor="middle">$</text>
    </g>
    <g transform="rotate(-5) translate(10, -5)">
      <rect x="60" y="20" width="120" height="60" rx="8" fill="#22c55e" />
      <rect x="70" y="30" width="100" height="40" rx="4" fill="#16a34a" />
      <circle cx="120" cy="50" r="15" fill="#15803d" />
      <text x="120" y="58" fontSize="20" fontWeight="bold" fill="#22c55e" textAnchor="middle">$</text>
    </g>
  </svg>
);
// ------------------------

export default function HomePage() {
  const [copied, setCopied] = useState(null)

  const copyToClipboard = (link, type) => {
    navigator.clipboard.writeText(link)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  // Mock user avatars for hero grid
  const userAvatars = [
    { initials: 'A', color: '#e91e63' },
    { initials: 'B', color: '#2196f3' },
    { initials: 'C', color: '#4caf50' },
    { initials: 'D', color: '#ff9800' },
    { initials: 'E', color: '#9c27b0' },
    { initials: 'F', color: '#00bcd4' },
    { initials: 'G', color: '#f44336' },
    { initials: 'H', color: '#673ab7' },
  ]

  return (
    <main style={{ background: '#f0f2f5', minHeight: '100vh', padding: 0 }}>
      {/* Hero Section Container */}
      <div style={{ padding: '16px 16px 0 16px' }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: '0 0 16px 0' }}>Home</h1>

        {/* Banner Card */}
        <div style={{
          position: 'relative',
          borderRadius: 12,
          overflow: 'hidden',
          minHeight: '480px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          background: '#1a1a1a',
        }}>
          {/* Background Image with Blur */}
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

          {/* Centered Content */}
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <img
                src="/shemet-logo.png"
                alt="Logo"
                style={{
                  width: 110,
                  height: 110,
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '3px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                }}
              />
            </div>

            <h2 style={{
              fontSize: 52,
              fontWeight: 800,
              color: '#fff',
              margin: 0,
              textShadow: '0 2px 8px rgba(0,0,0,0.6)',
              letterSpacing: '1px',
            }}>Shemet</h2>
            <p style={{
              fontSize: 22,
              color: '#fff',
              margin: 0,
              marginTop: 6,
              fontWeight: 600,
              opacity: 0.95,
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}>Chat borderless</p>
          </div>
        </div>

        {/* Invitation Mini Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginTop: 16,
          marginBottom: 24,
        }}>
          {/* Cards for Hosts and Agents */}
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
                style={{
                  padding: '8px 18px',
                  background: '#fff',
                  color: '#3a2639',
                  border: 'none',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginLeft: 12,
                }}
              >
                {copied === item.id ? 'Copied' : 'Share'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '0 16px' }}>
        {/* Commission Progress Section */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 24,
          marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          position: 'relative',
          zIndex: 1 // lower z-index
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: 14, color: '#333', fontWeight: 500, marginBottom: 12 }}>
                My Commission Ratio : <span style={{ color: '#f59e0b', fontWeight: 700 }}>0%</span> <span style={{ cursor: 'help', color: '#999', fontSize: 14 }}>ⓘ</span>
              </div>

              {/* Progress Bar Container */}
              <div style={{ width: '100%', marginBottom: 12 }}>
                <div style={{ height: 10, background: '#f3f4f6', borderRadius: 5, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ width: '0%', height: '100%', background: 'linear-gradient(90deg, #573955, #3a2639)', borderRadius: 5 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: '#666' }}>
                  <span style={{ fontWeight: 600, color: '#3a2639' }}>$0<span style={{ color: '#999', fontWeight: 400 }}>/0%</span></span>
                  <span style={{ fontWeight: 600, color: '#3a2639' }}>$500<span style={{ color: '#999', fontWeight: 400 }}>/5%</span></span>
                </div>
                <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 8, fontWeight: 500 }}>
                  $500 more to reach the ratio of 5%
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* FULL WIDTH REWARDS SECTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>

          {/* Monthly Rewards (Full Width) */}
          {/* Modified: overflow: 'visible' to allow the image to break out */}
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '24px 32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            overflow: 'visible', // Changed from hidden to visible
            marginTop: 20 // Added margin top to accommodate the popping out image
          }}>
            <div>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 4, padding: '4px 8px', width: 'fit-content', fontSize: 12, color: '#666', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                2026-03 <span style={{ fontSize: 14 }}>📅</span>
              </div>
              <div style={{ fontSize: 16, color: '#444', fontWeight: 600 }}>
                Monthly Rewards: <span style={{ color: '#f59e0b', fontSize: 24, fontWeight: 700, marginLeft: 8 }}>$0</span>
              </div>
            </div>

            {/* High-End 3D Floating Gold Image */}
            <div style={{
              position: 'absolute',
              right: 80,       // Shifted ~2cm (60px more) to the left horizontally
              bottom: -10,
              zIndex: 10,      // Ensures it renders above adjacent elements
              filter: 'drop-shadow(-10px 15px 20px rgba(0, 0, 0, 0.25)) drop-shadow(-5px 5px 10px rgba(245, 158, 11, 0.4))', // Natural + Gold glowing shadow
              animation: 'floatPremium 4s ease-in-out infinite',
              willChange: 'transform' // Optimizes performance for low-end devices
            }}>
              <style dangerouslySetInnerHTML={{
                __html: `
                  @keyframes floatPremium {
                    0% { transform: translate3d(0px, 0px, 0px) rotate(-3deg) scale(1); }
                    50% { transform: translate3d(-5px, -15px, 0px) rotate(4deg) scale(1.02); }
                    100% { transform: translate3d(0px, 0px, 0px) rotate(-3deg) scale(1); }
                  }
                `}} />
              {/* Large size for premium presence */}
              <img src="/images/gold.png" alt="Premium Gold Rewards" style={{ width: 180, height: 'auto', objectFit: 'contain' }} />
            </div>
          </div>

          {/* Daily Rewards (Full Width) */}
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '24px 32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 4, padding: '4px 8px', width: 'fit-content', fontSize: 12, color: '#666', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              2026-03-12 <span style={{ fontSize: 14 }}>📅</span>
            </div>
            <div style={{ fontSize: 16, color: '#444', fontWeight: 600, marginBottom: 32 }}>
              Daily Rewards: <span style={{ color: '#f59e0b', fontSize: 24, fontWeight: 700, marginLeft: 8 }}>$0</span>
            </div>

            {/* Daily Rewards 2x3 Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px 16px' }}>

              {/* Row 1 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <PurplePeopleIcon badge="star" />
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>Earning Hosts</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>0</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <PurplePeopleIcon badge="coin" />
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>Invitees' Earning</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>$0</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <GoldCoinIcon />
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>My Regular Rewards</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
                    $0 <span style={{ fontSize: 14, color: '#475569', cursor: 'pointer' }}>›</span>
                  </div>
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1', height: 1, background: '#f1f5f9', margin: '-10px 0' }} /> {/* Divider */}

              {/* Row 2 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <OrangePeopleIcon />
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>Earning Agents</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>0</div>
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
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 }}>
                    $0 <span style={{ fontSize: 14, color: '#475569', cursor: 'pointer' }}>›</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Earning Distribution Section */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#111' }}>Earning Distribution</h3>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 4, padding: '4px 12px', width: 'fit-content', fontSize: 13, color: '#666', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            2026-02-05 — 2026-03-12 📅
          </div>
          <div style={{ height: 300, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: 13, fontWeight: 600 }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Earning Line Chart Section */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#111' }}>Earning Line Chart</h3>
          <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 4, padding: '4px 12px', fontSize: 13, color: '#666', display: 'flex', alignItems: 'center', gap: 8 }}>
              2026-02-05 — 2026-03-12 📅
            </div>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 4, padding: '4px 12px', fontSize: 13, color: '#666', display: 'flex', alignItems: 'center', gap: 8, minWidth: 200, justifyContent: 'space-between', cursor: 'pointer' }}>
              persons <span>▼</span>
            </div>
          </div>

          <div style={{ height: 350, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  tickFormatter={(val) => val.split('-').slice(2).join('/')}
                />
                <YAxis fontSize={11} tickLine={false} axisLine={false} orientation="left" />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    padding: '12px'
                  }}
                  itemStyle={{ fontSize: 13, fontWeight: 600 }}
                  labelStyle={{ marginBottom: 8, fontWeight: 700, color: '#666' }}
                />
                <Legend
                  verticalAlign="top"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: 20, fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="hosts"
                  stroke="#3a2639"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="Hosts"
                />
                <Line
                  type="monotone"
                  dataKey="agents"
                  stroke="#7d537b"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#fff', strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  name="Agents"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </main>
  )
}
