'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const brandPlum = '#3a2639'; // Correct brand plum
    const brandPlumHover = '#4e344d';
    const accentGold = '#f59e0b';

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const { doc, getDoc } = await import('firebase/firestore');
            const { db } = await import('../../lib/firebase');

            const userDoc = await getDoc(doc(db, "users", user.uid));

            if ((userDoc.exists() && userDoc.data().isAgent === true) || user.email === 'hknskariyawasamnaveen@gmail.com') {
                router.push('/');
            } else {
                setError(
                    <div>
                        Access Denied: Your account does not have Agency privileges.<br />
                        <Link href="/bootstrap" style={{ color: brandPlum, fontWeight: 'bold', textDecoration: 'underline', marginTop: '10px', display: 'inline-block' }}>
                            Click here to Repair Access
                        </Link>
                    </div>
                );
                setLoading(false);
            }
        } catch (err) {
            console.error("DEBUG: Firebase Auth Error Object:", err);
            console.error("DEBUG: Error Code:", err.code);

            if (err.code === 'auth/user-not-found') {
                setError('No account found with this email. Please run the /bootstrap setup first.');
            } else if (err.code === 'auth/wrong-password') {
                setError('Incorrect password. If you updated the bootstrap tool, run it again.');
            } else if (err.code === 'auth/invalid-login-credentials') {
                setError('Invalid credentials. (Hint: Open browser console for more details)');
            } else {
                setError('Login failed: ' + (err.message || 'Please contact administrator.'));
            }
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f1f5f9 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: '20px',
            overflow: 'hidden',
        }}>
            {/* Premium Atmospheric SVG Nodes */}
            {/* Premium Dynamic Background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                overflow: 'hidden',
                background: '#f8fafc',
            }}>
                {/* Mesh Gradient Glows */}
                <div style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-10%',
                    width: '60%',
                    height: '60%',
                    background: 'radial-gradient(circle, rgba(58, 38, 57, 0.05) 0%, rgba(255,255,255,0) 70%)',
                    filter: 'blur(80px)',
                    animation: 'pulseGlow 15s infinite alternate ease-in-out'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-10%',
                    left: '-10%',
                    width: '60%',
                    height: '60%',
                    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.03) 0%, rgba(255,255,255,0) 70%)',
                    filter: 'blur(80px)',
                    animation: 'pulseGlow 20s infinite alternate-reverse ease-in-out'
                }} />

                {/* Glassy Floating Blobs */}
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '15%',
                    width: '300px',
                    height: '300px',
                    background: 'linear-gradient(135deg, rgba(58, 38, 57, 0.03) 0%, rgba(255,255,255,0) 100%)',
                    borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                    filter: 'blur(40px)',
                    animation: 'floatBlob 25s infinite linear'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '15%',
                    right: '10%',
                    width: '400px',
                    height: '400px',
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.02) 0%, rgba(255,255,255,0) 100%)',
                    borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                    filter: 'blur(50px)',
                    animation: 'floatBlob 35s infinite linear reverse'
                }} />

                {/* Refined Geometric Node Pattern */}
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.2 }}>
                    <pattern id="dotPattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="#cbd5e1" opacity="0.3" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#dotPattern)" />

                    <g opacity="0.4">
                        <line x1="15%" y1="20%" x2="35%" y2="45%" stroke="#e2e8f0" strokeWidth="0.5" />
                        <line x1="85%" y1="15%" x2="65%" y2="40%" stroke="#e2e8f0" strokeWidth="0.5" />
                        <line x1="10%" y1="80%" x2="30%" y2="60%" stroke="#e2e8f0" strokeWidth="0.5" />
                        <line x1="90%" y1="85%" x2="70%" y2="65%" stroke="#e2e8f0" strokeWidth="0.5" />

                        <circle cx="35%" cy="45%" r="2" fill={brandPlum} opacity="0.2" />
                        <circle cx="65%" cy="40%" r="2" fill="#f59e0b" opacity="0.2" />
                        <circle cx="30%" cy="60%" r="2" fill="#f59e0b" opacity="0.2" />
                        <circle cx="70%" cy="65%" r="2" fill={brandPlum} opacity="0.2" />
                    </g>
                </svg>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes pulseGlow {
                        0% { transform: scale(1) translate(0, 0); opacity: 0.5; }
                        100% { transform: scale(1.2) translate(5%, 5%); opacity: 0.8; }
                    }
                    @keyframes floatBlob {
                        0% { transform: rotate(0deg) translate(0, 0) scale(1); }
                        33% { transform: rotate(120deg) translate(50px, -50px) scale(1.1); }
                        66% { transform: rotate(240deg) translate(-30px, 40px) scale(0.9); }
                        100% { transform: rotate(360deg) translate(0, 0) scale(1); }
                    }
                `}} />
            </div>

            <div style={{
                zIndex: 1,
                width: '100%',
                maxWidth: 420,
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: 24,
                padding: '40px 32px',
                border: '1px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 20px 40px -15px rgba(58, 38, 57, 0.1), 0 0 0 1px rgba(58, 38, 57, 0.02)',
            }}>
                {/* Logo & Header */}
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <div style={{
                        width: 90,
                        height: 90,
                        margin: '0 auto 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        border: '1px solid rgba(58, 38, 57, 0.12)',
                        padding: '4px',
                        background: '#fff',
                        boxShadow: '0 8px 16px rgba(58, 38, 57, 0.08)'
                    }}>
                        <img src="/shemet-logo.png" alt="Shemet" style={{ height: '100%', width: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    </div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>Shemet Agent</h1>
                </div>

                {/* Form Wrapper */}
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {error && (
                        <div style={{
                            backgroundColor: '#fef2f2',
                            color: '#ef4444',
                            fontSize: 13,
                            textAlign: 'center',
                            padding: '10px',
                            borderRadius: 8,
                            fontWeight: 500,
                            border: '1px solid #fee2e2'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Email Input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginLeft: 4 }}>Email or Username</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            required
                            style={{
                                width: '100%',
                                padding: '11px 14px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: 12,
                                fontSize: 15,
                                outline: 'none',
                                color: '#1e293b',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = brandPlum;
                                e.currentTarget.style.boxShadow = `0 0 0 4px ${brandPlum}10`;
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    {/* Password Input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Password</label>
                            <Link href="/login/reset-password" style={{ fontSize: 12, color: brandPlum, fontWeight: 700, textDecoration: 'none' }}>
                                Forgot?
                            </Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{
                                    width: '100%',
                                    padding: '11px 44px 11px 14px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: 12,
                                    fontSize: 15,
                                    outline: 'none',
                                    color: '#1e293b',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = brandPlum;
                                    e.currentTarget.style.boxShadow = `0 0 0 4px ${brandPlum}10`;
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                            <div
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: 14,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    {showPassword ? (
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    ) : (
                                        <>
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </>
                                    )}
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            backgroundColor: brandPlum,
                            color: '#fff',
                            border: 'none',
                            borderRadius: 12,
                            padding: '12px',
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            marginTop: 8,
                            boxShadow: `0 4px 14px 0 ${brandPlum}40`,
                        }}
                        onMouseOver={(e) => {
                            if (!loading) {
                                e.currentTarget.style.backgroundColor = brandPlumHover;
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = `0 6px 20px 0 ${brandPlum}50`;
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!loading) {
                                e.currentTarget.style.backgroundColor = brandPlum;
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = `0 4px 14px 0 ${brandPlum}40`;
                            }
                        }}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                {/* Footer Nav */}
                <div style={{ textAlign: 'center', marginTop: 32 }}>
                    <Link href="/login/phone" style={{
                        fontSize: 14,
                        color: '#64748b',
                        textDecoration: 'none',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                        Login via Phone Number
                    </Link>
                </div>
            </div>
        </div>
    );
}
