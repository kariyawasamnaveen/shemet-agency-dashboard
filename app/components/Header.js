import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import { useAgency } from '../context/AgencyContext'

export default function Header() {
  const { agent } = useAgency();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const initials = agent?.name
    ? agent.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const profileImageUrl = agent?.photos?.[0] || agent?.photoURL;

  const handleLogout = async () => {
    try {
      console.log("Header: Initiating logout...");
      setIsProfileOpen(false);
      await signOut(auth);
      console.log("Header: Sign out successful, redirecting...");
      window.location.href = '/login'; // Force a full refresh/redirect to clear state
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Failed to logout. Please try again.");
    }
  };

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
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 60,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
    }}>
      {/* Left: Logo + Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 42,
          height: 42,
          background: '#fff',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: 2,
          boxShadow: '0 4px 12px rgba(58, 38, 57, 0.12)',
          border: '1px solid rgba(58, 38, 57, 0.08)',
        }}>
          <img
            src="/shemet-logo.png"
            alt="Shemet Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#3a2639', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Shemet</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agent Hub</div>
        </div>
      </div>

      {/* Right: Icons + Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>

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
              gap: 12,
              padding: '6px 12px 6px 6px',
              borderRadius: '16px',
              background: isProfileOpen ? 'rgba(58, 38, 57, 0.05)' : 'transparent',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'all 0.3s ease'
            }}
            className="hover-lift"
          >
            <div style={{ position: 'relative' }}>
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={agent?.name || 'Profile'}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #fff',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div style={{
                width: 38,
                height: 38,
                background: 'linear-gradient(135deg, #3a2639 0%, #4e344d 100%)',
                borderRadius: '50%',
                display: (profileImageUrl ? 'none' : 'flex'),
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                border: '2px solid #fff',
                boxShadow: '0 4px 10px rgba(58, 38, 57, 0.3)'
              }}>
                {initials}
              </div>
              <div style={{
                position: 'absolute',
                bottom: -1,
                right: -1,
                width: 12,
                height: 12,
                background: '#10b981',
                border: '2px solid #fff',
                borderRadius: '50%'
              }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{agent?.name || 'Loading...'}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.02em' }}>
                {agent?.isAdmin ? 'ADMIN ACCESS' : 'AGENT ACCOUNT'}
              </div>
            </div>
          </div>

          {/* Cute Dropdown Menu */}
          {isProfileOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 12px)',
              right: 0,
              width: 220,
              background: '#fff',
              borderRadius: '20px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.05)',
              padding: '10px',
              zIndex: 1000,
              animation: 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <div style={{ padding: '4px 12px 10px', borderBottom: '1px solid #f1f5f9', marginBottom: 6 }}>
                 <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>Logged in as</div>
                 <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent?.email}</div>
              </div>

              <Link href="/my-profile" onClick={() => setIsProfileOpen(false)} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px',
                borderRadius: '12px',
                textDecoration: 'none',
                color: '#475569',
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.2s'
              }} className="dropdown-item">
                <span style={{ opacity: 0.7 }}>👤</span>
                <span>My Profile</span>
              </Link>
              
              <div style={{ height: 1, background: '#f1f5f9', margin: '6px 0' }} />
              
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'transparent',
                  color: '#e11d48',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }} className="logout-item"
              >
                <span style={{ fontSize: 16 }}>🚪</span>
                <span>Logout</span>
              </button>
              
              <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideDown {
                  from { opacity: 0; transform: translateY(-15px) scale(0.95); }
                  to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .dropdown-item:hover { background: #f8fafc; color: #3a2639 !important; transform: translateX(4px); }
                .logout-item:hover { background: #fff1f2; transform: translateX(4px); }
              `}} />
            </div>
          )}
        </div>
      </div>
    </header>

  )
}
