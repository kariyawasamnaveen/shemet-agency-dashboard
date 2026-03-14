'use client';
import { useState } from 'react';
import { auth } from '../../../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const brandPlum = '#3a2639';
    const brandPlumHover = '#4e344d';

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('A password reset link has been sent to your email. Please check your inbox (and spam folder).');
        } catch (err) {
            console.error("Reset Error:", err);
            if (err.code === 'auth/user-not-found') {
                setError('No user found with this email address.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Please enter a valid email address.');
            } else {
                setError('Failed to send reset email. Please try again later.');
            }
        } finally {
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
        }}>
            {/* Simple Back Button */}
            <Link href="/login" style={{
                position: 'absolute',
                top: 32,
                left: 32,
                color: '#64748b',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 600,
                fontSize: 14,
            }}>
                ← Back to Login
            </Link>

            <div style={{
                width: '100%',
                maxWidth: 440,
                background: 'white',
                borderRadius: 24,
                padding: '48px 40px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
            }}>
                <img src="/shemet-logo.png" alt="Shemet" style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 20 }} />
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>Reset Password</h1>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 32 }}>
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: 12, borderRadius: 8, fontSize: 13 }}>{error}</div>}
                    {message && <div style={{ color: '#16a34a', backgroundColor: '#f0fdf4', padding: 12, borderRadius: 8, fontSize: 13 }}>{message}</div>}

                    <div style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="hknskariyawasamnaveen@gmail.com"
                            required
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                border: '1px solid #e2e8f0',
                                borderRadius: 12,
                                fontSize: 15,
                                outline: 'none'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            backgroundColor: brandPlum,
                            color: 'white',
                            border: 'none',
                            padding: '14px',
                            borderRadius: 12,
                            fontWeight: 700,
                            fontSize: 16,
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
            </div>
        </div>
    );
}
