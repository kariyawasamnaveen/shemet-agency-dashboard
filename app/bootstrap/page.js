'use client';
import { useState, useEffect } from 'react';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function BootstrapPage() {
    const [user, setUser] = useState(null);
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [docData, setDocData] = useState(null);

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
        });
        return () => unsubscribe();
    }, []);

    const fixPrivileges = async () => {
        if (!user) {
            setStatus('Error: You are NOT signed in. Please log in first (even if it says Access Denied).');
            return;
        }
        setLoading(true);
        setStatus('Repairing Privileges...');
        try {
            const dataToSet = {
                uid: user.uid,
                email: user.email,
                name: "Naveen (Agent)",
                isAgent: true,
                createdAt: docData?.createdAt || new Date().toISOString(),
                agencyId: user.uid
            };

            await setDoc(doc(db, "users", user.uid), dataToSet, { merge: true });

            // Re-verify
            const snap = await getDoc(doc(db, "users", user.uid));
            if (snap.exists() && snap.data().isAgent === true) {
                setStatus('✅ SUCCESS! Your account has been promoted to AGENT. You can now go to /login and it will work.');
                setDocData(snap.data());
            } else {
                setStatus('❌ ERROR: Verification failed. Firestore did not save the flag. Check console/rules.');
            }
        } catch (error) {
            console.error(error);
            setStatus(`❌ Critical Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut(auth);
        setStatus('Signed out. Please log in again to refresh your token.');
    };

    const handleReset = async () => {
        const targetEmail = "hknskariyawasamnaveen@gmail.com";
        setStatus(`Sending reset email to ${targetEmail}...`);
        try {
            await sendPasswordResetEmail(auth, targetEmail);
            setStatus('✅ Reset link sent! Check your Gmail, change password, then come back here.');
        } catch (error) {
            setStatus(`❌ Reset Error: ${error.message}`);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', padding: '40px', fontFamily: 'sans-serif' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', background: '#1e293b', padding: '40px', borderRadius: '32px', border: '1px solid #334155' }}>
                <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>Nuclear Access Repair Tool</h1>
                <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Use this to fix "Access Denied" errors instantly.</p>

                <div style={{ background: '#0f172a', padding: '20px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #334155' }}>
                    <h2 style={{ fontSize: '14px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Current Session State</h2>
                    {user ? (
                        <div>
                            <div style={{ marginBottom: '8px' }}>Signed in as: <strong style={{ color: '#38bdf8' }}>{user.email}</strong></div>
                            <div style={{ marginBottom: '8px' }}>UID: <code style={{ color: '#f59e0b' }}>{user.uid}</code></div>
                            <div style={{ marginBottom: '15px' }}>Agent Privileges: {docData?.isAgent ? <span style={{ color: '#4ade80' }}>✅ YES</span> : <span style={{ color: '#f87171' }}>❌ NO</span>}</div>
                            <button onClick={handleSignOut} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>Sign Out</button>
                        </div>
                    ) : (
                        <div style={{ color: '#f87171' }}>Not signed in. Please log in on the normal Login page first.</div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <button
                        onClick={fixPrivileges}
                        disabled={loading || !user}
                        style={{
                            background: '#e11d48',
                            color: 'white',
                            padding: '16px',
                            borderRadius: '16px',
                            fontWeight: 'bold',
                            fontSize: '18px',
                            cursor: (loading || !user) ? 'not-allowed' : 'pointer',
                            opacity: (loading || !user) ? 0.6 : 1,
                            border: 'none',
                            boxShadow: '0 4px 14px 0 rgba(225, 29, 72, 0.39)'
                        }}
                    >
                        {loading ? 'Processing...' : '🚀 FIX MY ACCESS (PROMOTE TO AGENT)'}
                    </button>

                    <button
                        onClick={handleReset}
                        style={{ background: '#38bdf820', color: '#38bdf8', padding: '12px', borderRadius: '12px', border: '1px solid #38bdf8', cursor: 'pointer' }}
                    >
                        Send Password Reset to my Gmail
                    </button>
                </div>

                {status && (
                    <div style={{
                        marginTop: '30px',
                        padding: '20px',
                        background: '#0f172a',
                        borderRadius: '16px',
                        border: '1px solid #334155',
                        color: status.includes('✅') ? '#4ade80' : '#38bdf8',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
}
