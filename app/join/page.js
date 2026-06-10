'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function JoinContent() {
    const searchParams = useSearchParams();
    const agencyId = searchParams.get('agencyId');
    const role = searchParams.get('role') || 'host';
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (agencyId) {
            localStorage.setItem('shemet_referral_agencyId', agencyId);
            localStorage.setItem('shemet_referral_role', role);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    }, [agencyId, role]);

    const isHost = role === 'host';
    const brandPlum = '#1a1018';
    const accentGold = '#f59e0b';

    return (
        <div style={{
            height: '100vh',
            background: `radial-gradient(circle at 50% 50%, #3a2639 0%, ${brandPlum} 100%)`,
            color: '#fff',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated Background Blobs */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'rgba(245, 158, 11, 0.05)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'rgba(58, 38, 57, 0.5)', filter: 'blur(120px)', borderRadius: '50%', zIndex: 0 }} />

            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 460 }}>
                {/* Logo Section - Matching Dashboard Header Style */}
                <div style={{
                    width: 64,
                    height: 64,
                    background: '#3b2739',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    padding: 6,
                    border: '2px solid #e5e7eb',
                    margin: '0 auto 24px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                }}>
                    <img
                        src="/shemet-logo.png"
                        alt="Shemet Logo"
                        style={{ width: 44, height: 44, objectFit: 'contain' }}
                    />
                </div>

                <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: 12, letterSpacing: '-1px', background: 'linear-gradient(to bottom, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Join Shemet as a <span style={{ color: accentGold, WebkitTextFillColor: accentGold }}>{isHost ? 'Host' : 'Agent'}</span>
                </h1>

                <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.5, marginBottom: 32, fontWeight: 500 }}>
                    {isHost
                        ? "Start your live streaming career today! Earn diamonds, gain fans, and build your community."
                        : "Grow your network and earn commissions by managing the world's best live talent."}
                </p>

                {agencyId && (
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(10px)',
                        padding: '12px 24px',
                        borderRadius: 16,
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        marginBottom: 32,
                        display: 'inline-block'
                    }}>
                        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Invited by Agency</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: accentGold }}>{agencyId}</div>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
                    {isHost ? (
                        <>
                            <a
                                href="https://play.google.com/store/apps/details?id=com.dating.live.app"
                                style={{
                                    background: '#fff',
                                    color: brandPlum,
                                    padding: '16px',
                                    borderRadius: 12,
                                    textDecoration: 'none',
                                    fontWeight: 800,
                                    fontSize: 15,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 10,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                }}
                            >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d7/Google_Play_Store_badge_EN.svg" alt="Play Store" style={{ height: 24 }} />
                                <span>Get it on Play Store</span>
                            </a>

                            <a
                                href="https://apps.apple.com/app/shemet"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: '#fff',
                                    padding: '16px',
                                    borderRadius: 12,
                                    textDecoration: 'none',
                                    fontWeight: 800,
                                    fontSize: 15,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 10,
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                            >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" style={{ height: 24, filter: 'invert(1)' }} />
                                <span>Get it on App Store</span>
                            </a>
                        </>
                    ) : (
                        <a
                            href={`/register?agencyId=${agencyId}`}
                            style={{
                                background: `linear-gradient(135deg, ${accentGold}, #d97706)`,
                                color: brandPlum,
                                padding: '18px',
                                borderRadius: 12,
                                textDecoration: 'none',
                                fontWeight: 800,
                                fontSize: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10,
                                boxShadow: `0 10px 20px rgba(245, 158, 11, 0.15)`,
                            }}
                        >
                            <span>Become an Agency Partner</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </a>
                    )}
                </div>

                <div style={{ marginTop: 40, fontSize: 13, color: '#64748b', fontWeight: 500, lineHeight: 1.5 }}>
                    Already have the app? <br />
                    Use ID <span style={{ color: '#fff', fontWeight: 700 }}>{agencyId}</span> during registration.
                </div>
            </div>

            {/* Success Toast */}
            {saved && (
                <div style={{
                    position: 'fixed',
                    bottom: 32,
                    background: 'rgba(16, 185, 129, 0.9)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: 100,
                    fontSize: 14,
                    fontWeight: 700,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    animation: 'slideUp 0.3s ease-out',
                    border: '1px solid rgba(255,255,255,0.1)',
                    zIndex: 1000
                }}>
                    <style dangerouslySetInnerHTML={{ __html: '@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }' }} />
                    ✨ Referral attribution secured
                </div>
            )}
        </div>
    );
}

export default function JoinPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#1a1018', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading...</div>}>
            <JoinContent />
        </Suspense>
    );
}
