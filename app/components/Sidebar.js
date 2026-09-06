'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAgency } from '../context/AgencyContext'

export default function Sidebar() {
  const pathname = usePathname();
  const { agent } = useAgency();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleDropdown = (e, key) => {
    e.preventDefault();
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const menuStructure = [
    { label: 'Home', href: '/' },
    { label: 'My Profile', href: '/my-profile' },
    { label: 'My Hostess', href: '/invitation/invitees/hosts' },
    { label: 'Sub Agents', href: '/invitation/invitees/agents' },
    { label: 'Sell Diamonds', href: '/recharge' },
    { label: 'Buy Diamonds', href: '/dashboard/buy-diamonds' },
    { label: 'Diamond Trade', href: '/diamonds/trade' },
    { label: 'Host Daily Report', href: '/reports/host-daily' },
    { label: 'Agent Daily Report', href: '/reports/agent-daily' },
    {
      label: 'Weekly Settlement',
      href: '/dashboard/settlement'
    },
    { label: 'Sub Agent Commission', href: '/invitation/rewards/extra' },
    { label: 'My Wallet', href: '/coins-diamonds' },
  ];

  const isSuperAdmin = agent?.email === 'hknskariyawasamnaveen@gmail.com';
  const isAdminUser = agent?.isAdmin || agent?.email === 'admin@shemet.com';

  if (isAdminUser) {
    // Show All Admin tools (Standard + Super) to anyone with isAdmin flag
    menuStructure.push({
      label: 'Agency Management',
      children: [
        { label: 'Host Applications', href: '/admin/applications' },
        { label: 'Notifications', href: '/admin/notifications' },
      ]
    });

    menuStructure.push({
      label: 'Super Admin Tools',
      children: [
        { label: 'Pending Withdrawals', href: '/admin/withdrawals' },
        { label: 'Diamond Purchase Requests', href: '/admin/purchase-requests' },
        { label: 'Diamond Dealers Management', href: '/admin/dealers' },
        { label: 'Diamond Trade Logs', href: '/admin/trade-logs' },
        { label: 'All Users', href: '/users' },
      ]
    });

    menuStructure.push({
      label: 'Virtual Economy',
      children: [
        { label: 'Gifts Management', href: '/economy/gifts' },
        { label: 'Top-Up Approvals', href: '/economy/topups' },
        { label: 'Transactions Ledger', href: '/economy/transactions' },
      ]
    });
  }

  const renderMenu = (items, depth = 0) => {
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((item, idx) => {
          const isActive = pathname === item.href;
          const isExpanded = expandedItems[item.label];
          const hasChildren = item.children && item.children.length > 0;

          return (
            <li key={idx} style={{ marginBottom: depth === 0 ? 6 : 2 }}>
              {hasChildren ? (
                // Parent Item (Toggle)
                <div
                  onClick={(e) => toggleDropdown(e, item.label)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `12px 16px 12px ${16 + (depth * 16)}px`,
                    cursor: 'pointer',
                    color: isExpanded ? '#1e293b' : '#64748b',
                    fontSize: depth === 0 ? 14 : 13,
                    fontWeight: isExpanded ? 700 : 500,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: isExpanded ? 'rgba(58, 38, 57, 0.04)' : 'transparent',
                    borderRadius: '12px',
                    margin: '0 8px'
                  }}
                  className="hover-lift"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>{item.label}</span>
                  </div>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: isExpanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      color: isExpanded ? '#ff1493' : '#94a3b8'
                    }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              ) : item.disabled ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: `10px 16px 10px ${16 + (depth * 16)}px`,
                  color: '#94a3b8',
                  fontSize: 13,
                  fontStyle: 'italic',
                  cursor: 'default',
                  margin: '0 8px'
                }}>
                  {item.label}
                </div>
              ) : (
                // Nav Link
                <Link href={item.href || '#'} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: `12px 16px 12px ${16 + (depth * 16)}px`,
                  textDecoration: 'none',
                  background: isActive ? 'linear-gradient(90deg, #3a2639 0%, #4e344d 100%)' : 'transparent',
                  color: isActive ? '#fff' : '#64748b',
                  fontSize: depth === 0 ? 14 : 13,
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: '12px',
                  margin: '0 8px',
                  boxShadow: isActive ? '0 8px 20px -8px rgba(58, 38, 57, 0.4)' : 'none'
                }} className={!isActive ? "hover-lift" : ""}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', width: '100%' }}>
                    <span>{item.label}</span>
                    {isActive && (
                      <div style={{ 
                        marginLeft: 'auto', 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        background: '#ff1493',
                        boxShadow: '0 0 10px #ff1493'
                      }} />
                    )}
                  </div>
                </Link>
              )}

              {/* Children Rendering */}
              {hasChildren && (
                <div style={{ 
                  maxHeight: isExpanded ? '500px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: isExpanded ? 1 : 0
                }}>
                  <div style={{ padding: '4px 0' }}>
                    {renderMenu(item.children, depth + 1)}
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <aside style={{
      width: 250,
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(0, 0, 0, 0.05)',
      height: 'calc(100vh - 60px)',
      overflowY: 'auto',
      position: 'fixed',
      top: 60,
      left: 0,
      zIndex: 100,
      padding: '20px 0'
    }} className="no-scrollbar">
      <nav>
        {renderMenu(menuStructure)}
      </nav>
      <div style={{ padding: '20px', fontSize: '10px', color: '#94a3b8', opacity: 0.5 }}>
        v1.0.5-FINAL-FIX
      </div>
    </aside>
  )
}
