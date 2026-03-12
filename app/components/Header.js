'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header style={{
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 60,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Left: Logo + Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44,
          height: 44,
          background: '#3b2739',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: 4,
          border: '2px solid #e5e7eb',
        }}>
          <img
            src="/shemet-logo.png"
            alt="Shemet Logo"
            style={{ width: 32, height: 32, objectFit: 'contain' }}
          />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1f2937' }}>Shemet Agent</div>
        </div>
      </div>

      {/* Right: Icons + Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Notification */}
        <Link href="/notification" style={{ textDecoration: 'none' }}>
          <button style={{
            background: 'none',
            border: 'none',
            fontSize: 20,
            cursor: 'pointer',
            position: 'relative',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center'
          }}>
            🔔
            <div style={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 18,
              height: 18,
              background: '#ef4444',
              color: '#fff',
              borderRadius: '50%',
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              border: '2px solid #fff'
            }}>
              11
            </div>
          </button>
        </Link>

        {/* Settings */}
        <Link href="/settings" style={{ textDecoration: 'none' }}>
          <button style={{
            background: 'none',
            border: 'none',
            fontSize: 20,
            cursor: 'pointer',
            color: '#1f2937'
          }}>
            ⚙️
          </button>
        </Link>

        {/* Profile Dropdown Trigger */}
        <div
          ref={dropdownRef}
          style={{ position: 'relative' }}
        >
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              paddingLeft: 12,
              paddingRight: 4,
              borderLeft: '1px solid #e5e7eb',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #573955, #3a2639)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
            }}>
              ZA
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>Zubi Agency</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Admin</div>
            </div>
          </div>

          {/* Cute Dropdown Menu */}
          {isProfileOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 12,
              width: 180,
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #f1f5f9',
              padding: 6,
              zIndex: 100,
              animation: 'slideDown 0.2s ease-out'
            }}>
              <Link href="/my-profile" onClick={() => setIsProfileOpen(false)} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                color: '#475569',
                fontSize: 13,
                fontWeight: 500,
                transition: 'background 0.2s'
              }} className="dropdown-item">
                <span>My Profile</span>
              </Link>
              <div style={{ height: 1, background: '#f1f5f9', margin: '4px 8px' }} />
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  alert('Logging out...');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'transparent',
                  color: '#e11d48',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.2s'
                }} className="logout-item"
              >
                <span>Logout</span>
              </button>
              <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideDown {
                  from { opacity: 0; transform: translateY(-10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .dropdown-item:hover { background: #f8fafc; color: #3a2639 !important; }
                .logout-item:hover { background: #fff1f2; }
              `}} />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
