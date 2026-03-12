'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname();
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
    {
      label: 'My Commission',
      children: [
        { label: 'Your Commission', href: '/invitation/rewards/regular' },
        { label: 'Sub Agent Commission', href: '/invitation/rewards/extra' },
      ]
    },
    {
      label: 'Diamonds Seller',
      children: [
        { label: 'Dealers Management', href: '/diamonds/dealers' },
        { label: 'Complaint', href: '/diamonds/complaint' },
      ]
    },
    { label: 'My Wallet', href: '/coins-diamonds' },
  ];

  const renderMenu = (items, depth = 0) => {
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((item, idx) => {
          const isActive = pathname === item.href;
          const isExpanded = expandedItems[item.label];
          const hasChildren = item.children && item.children.length > 0;

          return (
            <li key={idx} style={{ marginBottom: depth === 0 ? 4 : 2 }}>
              {hasChildren ? (
                // Parent Item (Toggle)
                <div
                  onClick={(e) => toggleDropdown(e, item.label)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `10px 16px 10px ${18 + (depth * 20)}px`,
                    cursor: 'pointer',
                    color: depth === 0 ? '#475569' : '#64748b',
                    fontSize: depth === 0 ? 14 : 13,
                    fontWeight: depth === 0 ? 500 : 400,
                    transition: 'all 0.2s',
                    background: 'transparent',
                    letterSpacing: depth === 0 ? '0.2px' : '0.1px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>{item.label}</span>
                  </div>
                  {/* Custom Chevron SVG for a professional look */}
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
                      transition: 'transform 0.3s ease',
                      color: '#94a3b8'
                    }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              ) : item.disabled ? (
                // Disabled / Coming Soon item
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: `10px 16px 10px ${18 + (depth * 20)}px`,
                  color: '#94a3b8',
                  fontSize: 13,
                  fontStyle: 'italic',
                  cursor: 'default',
                  letterSpacing: '0.1px',
                }}>
                  {item.label}
                </div>
              ) : (
                // Nav Link
                <Link href={item.href || '#'} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: `10px 16px 10px ${18 + (depth * 20)}px`,
                  textDecoration: 'none',
                  background: isActive ? '#f8f4f7' : 'transparent',
                  borderLeft: depth === 0 ? (isActive ? '4px solid #3a2639' : '4px solid transparent') : '4px solid transparent',
                  color: isActive ? '#3a2639' : (depth === 0 ? '#475569' : '#64748b'),
                  fontSize: depth === 0 ? 14 : 13,
                  fontWeight: isActive ? 600 : (depth === 0 ? 500 : 400),
                  transition: 'background-color 0.2s, color 0.2s',
                  letterSpacing: depth === 0 ? '0.2px' : '0.1px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ position: 'relative', display: 'inline-block' }}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              )}

              {/* Children Rendering */}
              {hasChildren && isExpanded && (
                <div style={{ background: 'transparent' }}>
                  {renderMenu(item.children, depth + 1)}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <aside className="custom-scroll" style={{
      width: 240,
      background: '#fff',
      borderRight: '1px solid #e5e7eb',
      height: 'calc(100vh - 60px)',
      overflowY: 'auto',
      position: 'fixed',
      top: 60,
      left: 0,
      zIndex: 40
    }}>
      <nav style={{ padding: '12px 0' }}>
        {renderMenu(menuStructure)}
      </nav>
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 4px;
        }
      `}} />
    </aside>
  )
}
