'use client';
import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ShemetLoader from '../components/ShemetLoader';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const brandPlum = '#3a2639';
    const brandPink = '#ff1493';

    useEffect(() => {
        setPageLoading(false);
    }, []);

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { resolvePhoneNumber, getSyntheticEmail } = await import('../../lib/auth-util');
            const identifier = email.trim();
            const trimmedPassword = password.trim();

            let loginEmail = '';
            
            if (identifier.includes('@')) {
                loginEmail = identifier;
                console.log("!!! FLOW DEBUG !!! [LOGIN] Using direct email:", loginEmail);
            } else {
                console.log("!!! FLOW DEBUG !!! [LOGIN] Attempting resolution for:", identifier);
                const phone = await resolvePhoneNumber(identifier);
                if (!phone) {
                    console.error("!!! FLOW DEBUG !!! [LOGIN] FAILED TO RESOLVE PHONE FOR:", identifier);
                    setError('Account not found with that Username or Phone.');
                    setLoading(false);
                    return;
                }
                loginEmail = getSyntheticEmail(phone);
                console.log("!!! FLOW DEBUG !!! [LOGIN] Resolved to email:", loginEmail);
            }

            console.log("!!! FLOW DEBUG !!! [LOGIN] STEP 2 -> Login attempt with password (trimmed)...");
            const userCredential = await signInWithEmailAndPassword(auth, loginEmail, trimmedPassword);
            console.log("!!! FLOW DEBUG !!! [LOGIN] SUCCESS! Profile UID:", userCredential.user.uid);
            const user = userCredential.user;

            const { doc, getDoc } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');

            const userDoc = await getDoc(doc(db, "users", user.uid));

            if ((userDoc.exists() && userDoc.data().isAgent === true) || user.email === 'hknskariyawasamnaveen@gmail.com') {
                router.push('/');
            } else {
                setError(
                    <div className="flex flex-col gap-2">
                        <span>Access Denied: Agency privileges required.</span>
                        <Link href="/register" style={{ color: brandPink, fontWeight: '800', textDecoration: 'underline' }}>
                            Register an Agency
                        </Link>
                    </div>
                );
                setLoading(false);
            }
        } catch (err) {
            console.error("Login Error:", err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-login-credentials') {
                setError('Invalid credentials. Check your input.');
            } else {
                setError(err.message || 'Login failed.');
            }
            setLoading(false);
        }
    };

    if (pageLoading) return <ShemetLoader />;

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            padding: '24px',
            overflow: 'hidden',
        }}>
            {loading && <ShemetLoader />}
            
            {/* Premium Background Elements */}
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(255, 20, 147, 0.08) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(58, 38, 57, 0.08) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />

            <div style={{
                zIndex: 1,
                width: '100%',
                maxWidth: 420,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: 32,
                padding: '48px 40px',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 25px 50px -12px rgba(58, 38, 57, 0.15)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 84,
                        height: 84,
                        margin: '0 auto 20px',
                        padding: '4px',
                        background: '#fff',
                        borderRadius: '24px',
                        boxShadow: '0 10px 20px rgba(58, 38, 57, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <img src="/shemet-logo.png" alt="Shemet" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }} />
                    </div>
                    <h1 style={{ fontSize: 32, fontWeight: 900, color: brandPlum, letterSpacing: '-0.02em', margin: 0 }}>Agent Login</h1>
                    <p style={{ fontSize: 14, color: '#64748b', marginTop: 8, fontWeight: 600 }}>Secure access to Shemet Dashboard</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {error && (
                        <div style={{ backgroundColor: '#fef2f2', color: '#e11d48', fontSize: 13, padding: '12px 16px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(225, 29, 72, 0.1)', fontWeight: 600 }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginLeft: 4 }}>Username or Email</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your identifier"
                            required
                            style={{
                                width: '100%',
                                padding: '13px 16px',
                                background: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '14px',
                                fontSize: 15,
                                fontWeight: 600,
                                outline: 'none',
                                color: brandPlum,
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                            <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>Password</label>
                            <Link href="/login/reset-password" style={{ fontSize: 12, color: brandPink, fontWeight: 800, textDecoration: 'none' }}>
                                Forgot Password?
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
                                    padding: '13px 44px 13px 16px',
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '14px',
                                    fontSize: 15,
                                    outline: 'none',
                                    color: brandPlum,
                                }}
                            />
                            <div
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', cursor: 'pointer' }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    {showPassword ? <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path> : <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>}
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #3a2639 0%, #4e344d 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '16px',
                            padding: '16px',
                            fontSize: 16,
                            fontWeight: 800,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginTop: 10,
                            boxShadow: '0 10px 20px -10px rgba(58, 38, 57, 0.5)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? 'Authenticating...' : 'Sign In Now'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Link href="/login/phone" style={{
                        fontSize: 14,
                        color: '#64748b',
                        textDecoration: 'none',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        opacity: 0.8
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                        Login via SMS Code
                    </Link>

                    <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>
                        New Agency?{' '}
                        <Link href="/register" style={{ color: brandPink, fontWeight: 800, textDecoration: 'none' }}>
                            Join Shemet Network
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
