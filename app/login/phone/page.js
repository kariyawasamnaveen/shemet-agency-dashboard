'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth, db, app } from '@/lib/firebase';
import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
    signInWithEmailAndPassword,
    getAuth
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getSyntheticEmail } from '../../../lib/auth-util';
import ShemetLoader from '../../components/ShemetLoader';
import { COUNTRIES } from '@/lib/constants/countries';

export default function PhoneLoginPage() {
    const [countryCode, setCountryCode] = useState('+94');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loginMode, setLoginMode] = useState('password'); // 'password' or 'code'
    const [verificationCode, setVerificationCode] = useState('');
    const [timer, setTimer] = useState(0);
    const [error, setError] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);

    const recaptchaContainerRef = useRef(null);
    const recaptchaVerifierRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        setPageLoading(false);
        return () => {
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null;
            }
        };
    }, []);

    const initRecaptcha = () => {
        if (!recaptchaVerifierRef.current && recaptchaContainerRef.current) {
            try {
                // Get the auth instance explicitly from the app instance for consistency
                const authInstance = getAuth(app);
                
                // Safety guard: Ensure auth instance is available
                if (!authInstance) {
                    throw new Error("Auth instance not found");
                }

                // LEGACY FIX: Ensure auth.settings exists to avoid the 'appVerificationDisabledForTesting' error
                if (!authInstance.settings) {
                    console.warn("Auth settings not found, initializing fallback...");
                    try {
                        authInstance.settings = { appVerificationDisabledForTesting: false };
                    } catch (e) {
                        console.error("Failed to inject auth settings fallback", e);
                    }
                }

                recaptchaVerifierRef.current = new RecaptchaVerifier(authInstance, recaptchaContainerRef.current, {
                    'size': 'invisible',
                    'callback': (response) => {
                        console.log("Recaptcha solved");
                    },
                    'expired-callback': () => {
                        console.log("Recaptcha expired");
                        if (recaptchaVerifierRef.current) {
                            recaptchaVerifierRef.current.clear();
                            recaptchaVerifierRef.current = null;
                        }
                    }
                });
            } catch (err) {
                console.error("Recaptcha error", err);
                setError("Security system failed to start: " + err.message + ". Please refresh.");
            }
        }
        return recaptchaVerifierRef.current;
    };

    const checkAgentStatus = async (uid, email) => {
        if (email === 'hknskariyawasamnaveen@gmail.com') return true;
        const userDoc = await getDoc(doc(db, "users", uid));
        return userDoc.exists() && userDoc.data().isAgent === true;
    };

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        const fullPhone = `${countryCode}${phone.replace(/\D/g, '')}`;

        try {
            if (loginMode === 'password') {
                const syntheticEmail = getSyntheticEmail(fullPhone);
                const userCredential = await signInWithEmailAndPassword(auth, syntheticEmail, password);
                const isApproved = await checkAgentStatus(userCredential.user.uid, userCredential.user.email);
                if (isApproved) {
                    router.push('/');
                } else {
                    setError('Access Denied: Your account does not have Agency privileges.');
                    setLoading(false);
                }
            } else {
                if (!confirmationResult) {
                    setError('Please send the verification code first.');
                    setLoading(false);
                    return;
                }
                const userCredential = await confirmationResult.confirm(verificationCode);
                const isApproved = await checkAgentStatus(userCredential.user.uid, userCredential.user.email);
                if (isApproved) {
                    router.push('/');
                } else {
                    setError('Access Denied: Agency privileges required.');
                    setLoading(false);
                }
            }
        } catch (err) {
            console.error("Login Error:", err);
            if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                setError('Invalid phone number or password.');
            } else if (err.code === 'auth/invalid-verification-code') {
                setError('The verification code is incorrect.');
            } else {
                setError(err.message || 'Authentication failed.');
            }
            setLoading(false);
        }
    };

    const handleSendCode = async () => {
        if (!phone) {
            setError('Please enter your phone number.');
            return;
        }
        setError('');
        setLoading(true);
        
        const appVerifier = initRecaptcha();
        if (!appVerifier) {
            setLoading(false);
            return;
        }

        const fullPhone = `${countryCode}${phone.replace(/\D/g, '')}`;
        try {
            const result = await signInWithPhoneNumber(getAuth(app), fullPhone, appVerifier);
            setConfirmationResult(result);
            setTimer(60);
            const interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            setLoading(false);
        } catch (err) {
            console.error("SMS Error:", err);
            setError('Failed to send SMS. ' + err.message);
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null;
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
            
            {/* Hidden Recaptcha Anchor */}
            <div ref={recaptchaContainerRef}></div>

            {/* Premium Circles */}
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
            }} className="animate-fade-in">
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
                    <h1 style={{ fontSize: 32, fontWeight: 900, color: '#3a2639', letterSpacing: '-0.02em', margin: 0 }}>Agent Login</h1>
                    <p style={{ fontSize: 14, color: '#64748b', marginTop: 8, fontWeight: 600 }}>Mobile access for Shemet partners</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {error && (
                        <div style={{ backgroundColor: '#fef2f2', color: '#e11d48', fontSize: 13, padding: '12px 16px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(225, 29, 72, 0.1)', fontWeight: 600 }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginLeft: 4 }}>Phone Number</label>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ position: 'relative', width: 90 }}>
                                <select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '13px',
                                        background: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '14px',
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: '#3a2639',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        appearance: 'none',
                                        textAlign: 'center'
                                    }}
                                >
                                    {COUNTRIES.map((c) => (
                                        <option key={c.name} value={c.code}>
                                            {c.flag} {c.code}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter mobile number"
                                required
                                style={{
                                    flex: 1,
                                    padding: '13px 16px',
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '14px',
                                    fontSize: 15,
                                    fontWeight: 600,
                                    outline: 'none',
                                    color: '#3a2639',
                                    transition: 'border-color 0.2s'
                                }}
                                className="focus-brand"
                            />
                        </div>
                    </div>

                    {loginMode === 'password' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginLeft: 4 }}>Access Password</label>
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
                                        color: '#3a2639',
                                    }}
                                    className="focus-brand"
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
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginLeft: 4 }}>OTP Verification Code</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="Enter code"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '13px 90px 13px 16px',
                                        background: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '14px',
                                        fontSize: 15,
                                        fontWeight: 800,
                                        outline: 'none',
                                        color: '#ff1493',
                                        letterSpacing: '0.2em'
                                    }}
                                    className="focus-brand"
                                />
                                <button
                                    type="button"
                                    onClick={handleSendCode}
                                    disabled={timer > 0 || !phone || loading}
                                    style={{
                                        position: 'absolute',
                                        right: 12,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: timer > 0 ? '#94a3b8' : '#fff',
                                        background: timer > 0 ? '#f1f5f9' : '#3a2639',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '10px',
                                        fontSize: 12,
                                        fontWeight: 800,
                                        cursor: (timer > 0 || !phone) ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {timer > 0 ? `${timer}s` : 'Send OTP'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div style={{ textAlign: 'right', marginTop: -4 }}>
                        <span
                            onClick={() => {
                                setLoginMode(loginMode === 'password' ? 'code' : 'password');
                                setError('');
                            }}
                            style={{ fontSize: 13, color: '#ff1493', fontWeight: 800, cursor: 'pointer' }}
                        >
                            {loginMode === 'password' ? 'Verify with SMS Code' : 'Back to Password Login'}
                        </span>
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
                        className="hover-lift"
                    >
                        {loading ? 'Securing Session...' : (loginMode === 'password' ? 'Sign In Now' : 'Verify & Enter')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <Link href="/login" style={{ fontSize: 14, color: '#64748b', textDecoration: 'none', fontWeight: 700 }} className="hover-lift">
                        Login with Email
                    </Link>

                    <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>
                        New Agency?{' '}
                        <Link href="/register" style={{ color: '#ff1493', fontWeight: 800, textDecoration: 'none' }}>
                            Join Shemet Network
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

