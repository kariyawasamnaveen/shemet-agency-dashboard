'use client';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';
import ShemetLoader from '../../components/ShemetLoader';

export default function ResetPasswordPage() {
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const brandPlum = '#3a2639';
    const brandPink = '#ff1493';

    useEffect(() => {
        setPageLoading(false);
    }, []);

    const handleReset = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const { resolvePhoneNumber, getSyntheticEmail } = await import('../../../lib/auth-util');

            // 1. Resolve phone number from identifier (Username)
            const resolvedPhone = await resolvePhoneNumber(identifier.trim());

            if (!resolvedPhone) {
                setError('Could not find an account with that Username.');
                setLoading(false);
                return;
            }

            // 2. Generate synthetic email
            const syntheticEmail = getSyntheticEmail(resolvedPhone);

            // 3. Send reset email
            await sendPasswordResetEmail(auth, syntheticEmail);
            setMessage('Success! A password reset link has been sent to your registered email.');
        } catch (err) {
            console.error("Reset Error:", err);
            if (err.code === 'auth/user-not-found') {
                setError('No user found matching this account.');
            } else {
                setError('Failed to send reset email. Please try again later.');
            }
        } finally {
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

            <Link href="/login" style={{
                position: 'absolute',
                top: 32,
                left: 32,
                color: brandPlum,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 800,
                fontSize: 14,
                zIndex: 2,
                opacity: 0.7
            }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Back to Entry
            </Link>

            <div style={{
                zIndex: 1,
                width: '100%',
                maxWidth: 440,
                background: 'rgba(255, 255, 255, 0.82)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: 32,
                padding: '56px 40px',
                border: '1px solid rgba(255, 255, 255, 0.7)',
                boxShadow: '0 25px 50px -12px rgba(58, 38, 57, 0.12)',
                textAlign: 'center'
            }}>
                <div style={{
                    width: 72,
                    height: 72,
                    margin: '0 auto 24px',
                    padding: '4px',
                    background: '#fff',
                    borderRadius: '20px',
                    boxShadow: '0 10px 20px rgba(58, 38, 57, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img src="/shemet-logo.png" alt="Shemet" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }} />
                </div>
                
                <h1 style={{ fontSize: 32, fontWeight: 900, color: brandPlum, letterSpacing: '-0.02em', margin: '0 0 12px 0' }}>Security Reset</h1>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: '1.6', fontWeight: 600, marginBottom: 32 }}>
                    Forgotten your access key? Enter your account username and we'll secure your path back.
                </p>

                <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {error && (
                        <div style={{ backgroundColor: '#fef2f2', color: '#e11d48', fontSize: 13, padding: '12px 16px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(225, 29, 72, 0.1)', fontWeight: 700 }}>
                            {error}
                        </div>
                    )}
                    {message && (
                        <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', fontSize: 13, padding: '12px 16px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(22, 163, 74, 0.1)', fontWeight: 700 }}>
                            {message}
                        </div>
                    )}

                    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginLeft: 4 }}>Agent Username</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="Identify your account"
                            required
                            style={{
                                width: '100%',
                                padding: '14px 18px',
                                background: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '16px',
                                fontSize: 15,
                                fontWeight: 600,
                                outline: 'none',
                                color: brandPlum,
                                transition: 'all 0.2s'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: brandPlum,
                            color: 'white',
                            border: 'none',
                            padding: '16px',
                            borderRadius: '16px',
                            fontWeight: 800,
                            fontSize: 16,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            boxShadow: '0 10px 15px -3px rgba(58, 38, 57, 0.2)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? 'Processing Security...' : 'Request Access Node'}
                    </button>
                </form>

                <div style={{ marginTop: 32 }}>
                    <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
                        Remembered your details?{' '}
                        <Link href="/login" style={{ color: brandPink, fontWeight: 800, textDecoration: 'none' }}>Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
