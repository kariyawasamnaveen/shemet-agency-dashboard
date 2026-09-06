'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import ShemetLoader from '../components/ShemetLoader';

export default function BootstrapPage() {
    const [user, setUser] = useState(null);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [docData, setDocData] = useState(null);

    const brandPink = '#ff1493';
    const brandPlum = '#3a2639';

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (u) {
                const snap = await getDoc(doc(db, "users", u.uid));
                if (snap.exists()) {
                    setDocData(snap.data());
                } else {
                    setDocData(null);
                }
            }
            setPageLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const fixPrivileges = async () => {
        if (!user) {
            setStatus('Error: Authentication required.');
            return;
        }
        setLoading(true);
        setStatus('Reconfiguring Security Nodes...');
        try {
            const dataToSet = {
                uid: user.uid,
                email: user.email,
                name: docData?.name || "Premium Agent",
                isAgent: true,
                createdAt: docData?.createdAt || new Date().toISOString(),
                agencyId: user.uid
            };

            await setDoc(doc(db, "users", user.uid), dataToSet, { merge: true });

            // Re-verify
            const snap = await getDoc(doc(db, "users", user.uid));
            if (snap.exists() && snap.data().isAgent === true) {
                setStatus('✅ NODE REPAIRED! Agent privileges enabled. Access granted.');
                setDocData(snap.data());
            } else {
                setStatus('❌ NODE CONFLICT: Firestore write failed. Verify rules.');
            }
        } catch (error) {
            console.error(error);
            setStatus(`❌ CRITICAL ERROR: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        setLoading(true);
        await signOut(auth);
        setStatus('Session terminated.');
        setLoading(false);
    };

    const handleReset = async () => {
        if (!user?.email) return setStatus('❌ No email associated with current node.');
        setStatus(`Deploying reset token to ${user.email}...`);
        try {
            await sendPasswordResetEmail(auth, user.email);
            setStatus('✅ DEPLOYED! Check your secure inbox for the reset link.');
        } catch (error) {
            setStatus(`❌ DEPLOYMENT FAILED: ${error.message}`);
        }
    };

    if (pageLoading) return <ShemetLoader />;

    return (
        <div style={{
            minHeight: '100vh',
            background: '#020617',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: 'Inter, system-ui, sans-serif',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {loading && <ShemetLoader />}

            {/* Matrix Background Effects */}
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(255, 20, 147, 0.05) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(58, 38, 57, 0.1) 0%, transparent 70%)', filter: 'blur(100px)', zIndex: 0 }} />

            <div style={{
                position: 'relative',
                zIndex: 1,
                width: '100%',
                maxWidth: '560px',
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                padding: '48px',
                borderRadius: '32px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ width: '64px', height: '64px', background: brandPlum, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: '12px', border: '1px solid rgba(255, 20, 147, 0.3)' }}>
                        <img src="/shemet-logo.png" alt="S" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.03em', margin: 0 }}>Nuclear Access Repair</h1>
                        <p style={{ fontSize: '14px', color: '#94a3b8', margin: '4px 0 0 0', fontWeight: '600' }}>Emergency Core Privilege Overrider</p>
                    </div>
                </div>

                <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '24px', borderRadius: '20px', marginBottom: '32px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ fontSize: '11px', color: brandPink, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>Terminal Status</div>
                    {user ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: '#64748b', fontWeight: '600' }}>IDENTITY</span>
                                <span style={{ color: '#fff', fontWeight: '700' }}>{user.email || 'Phone User'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: '#64748b', fontWeight: '600' }}>NODE ID</span>
                                <code style={{ color: '#fbbf24', fontSize: '12px' }}>{user.uid.slice(0, 12)}...</code>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                <span style={{ color: '#64748b', fontWeight: '600' }}>PRIVILEGES</span>
                                {docData?.isAgent ? (
                                    <span style={{ color: '#4ade80', fontWeight: '800' }}>✅ AGENT LEVEL</span>
                                ) : (
                                    <span style={{ color: '#f87171', fontWeight: '800' }}>❌ RESTRICTED</span>
                                )}
                            </div>
                            <button onClick={handleSignOut} style={{ alignSelf: 'flex-start', background: 'transparent', border: '1px solid rgba(248, 113, 113, 0.3)', color: '#f87171', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', marginTop: '8px' }}>DISCONNECT</button>
                        </div>
                    ) : (
                        <div style={{ color: '#f87171', fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>NO ACTIVE SESSION DETECTED</div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <button
                        onClick={fixPrivileges}
                        disabled={loading || !user}
                        style={{
                            background: `linear-gradient(to right, ${brandPink}, #db2777)`,
                            color: 'white',
                            padding: '18px',
                            borderRadius: '16px',
                            fontWeight: '900',
                            fontSize: '16px',
                            cursor: (loading || !user) ? 'not-allowed' : 'pointer',
                            border: 'none',
                            boxShadow: '0 0 20px rgba(255, 20, 147, 0.3)',
                            letterSpacing: '1px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? 'EXECUTING...' : '🚀 REPAIR ALL ACCESS NODES'}
                    </button>

                    <button
                        onClick={handleReset}
                        disabled={!user}
                        style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8', padding: '14px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}
                    >
                        Send Reset Token to Registered Node
                    </button>
                </div>

                {status && (
                    <div style={{
                        marginTop: '32px',
                        padding: '16px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '12px',
                        borderLeft: `4px solid ${status.includes('✅') ? '#4ade80' : brandPink}`,
                        color: status.includes('✅') ? '#4ade80' : '#fff',
                        fontSize: '13px',
                        fontWeight: '600',
                        fontFamily: 'monospace'
                    }}>
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
}
