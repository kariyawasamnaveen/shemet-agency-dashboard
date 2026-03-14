'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function JoinContent() {
    const searchParams = useSearchParams();
    const agencyId = searchParams.get('agencyId');
    const role = searchParams.get('role') || 'host'; // host or agent
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (agencyId) {
            // Store for attribution when they eventually open the app or register
            localStorage.setItem('shemet_referral_agencyId', agencyId);
            localStorage.setItem('shemet_referral_role', role);
            setSaved(true);
        }
    }, [agencyId, role]);

    const isHost = role === 'host';

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            color: '#fff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px 20px',
            textAlign: 'center'
        }}>
            {/* Logo */}
            <div style={{
                width: 100,
                height: 100,
                background: '#fff',
                borderRadius: '50%',
                padding: 10,
                marginBottom: 30,
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
            }}>
                <img src="/shemet-logo.png" alt="Shemet" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>

            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, letterSpacing: '-1px' }}>
                Join Shemet as a {isHost ? 'Host' : 'Agent'}
            </h1>

            <p style={{ fontSize: 18, opacity: 0.9, maxWidth: 500, lineHeight: 1.6, marginBottom: 40 }}>
                {isHost
                    ? "Start your live streaming career today! Earn diamonds, gain fans, and build your community with Shemet."
                    : "Grow your network and earn massive commissions by managing the world's best live streaming talent."}
            </p>

            {agencyId && (
                <div style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    padding: '16px 24px',
                    borderRadius: 16,
                    border: '1px solid rgba(255,255,255,0.2)',
                    marginBottom: 40
                }}>
                    <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>Invited by Agency ID</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#fbbf24' }}>{agencyId}</div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 300 }}>
                <a
                    href="https://play.google.com/store/apps/details?id=com.dating.live.app"
                    style={{
                        background: '#fff',
                        color: '#1e1b4b',
                        padding: '16px',
                        borderRadius: 12,
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    <span>Download on Play Store</span>
                </a>

                <a
                    href="https://apps.apple.com/app/shemet"
                    style={{
                        background: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        padding: '16px',
                        borderRadius: 12,
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        border: '1px solid rgba(255,255,255,0.3)'
                    }}
                >
                    <span>Download on App Store</span>
                </a>
            </div>

            <div style={{ marginTop: 60, fontSize: 14, opacity: 0.6 }}>
                Already have the app? <br />
                Open it and use Invitation ID <strong>{agencyId}</strong> during registration.
            </div>

            {saved && (
                <div style={{
                    position: 'fixed',
                    bottom: 20,
                    background: '#10b981',
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: 30,
                    fontSize: 13,
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                    Referral attribution saved!
                </div>
            )}
        </div>
    );
}

export default function JoinPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <JoinContent />
        </Suspense>
    );
}
