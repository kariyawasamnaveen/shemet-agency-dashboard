'use client'
import { useState, useEffect } from 'react';
import { useAgency } from '../../lib/hooks';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function MyProfilePage() {
    const { agency, loading } = useAgency();
    const [parentAgency, setParentAgency] = useState(null);
    const [parentLoading, setParentLoading] = useState(false);

    const brandPlum = '#3a2639'
    const brandPlumLight = '#7d537b'

    useEffect(() => {
        const fetchParent = async () => {
            if (agency?.parentAgencyId) {
                setParentLoading(true);
                try {
                    const snap = await getDoc(doc(db, "users", agency.parentAgencyId));
                    if (snap.exists()) {
                        setParentAgency(snap.data());
                    }
                } catch (err) {
                    console.error("Error fetching parent agent:", err);
                } finally {
                    setParentLoading(false);
                }
            }
        };
        fetchParent();
    }, [agency?.parentAgencyId]);

    if (loading) {
        return <div style={{ padding: 40, textAlign: 'center' }}>Loading your profile...</div>;
    }

    if (!agency) {
        return <div style={{ padding: 40, textAlign: 'center' }}>Please log in to view your profile.</div>;
    }

    return (
        <main style={{ background: '#f0f2f5', minHeight: '100vh', padding: '16px 16px' }}>
            <div style={{ width: '100%' }}>
                <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginBottom: 24 }}>My Profile</h1>

                {/* 1. My info Card */}
                <section style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: brandPlumLight, marginBottom: 24 }}>My info</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px 48px', marginBottom: 32 }}>
                        <div>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Shemet Nickname</div>
                            <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 600 }}>{agency.name || 'Not set'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Agency Name</div>
                            <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 600 }}>{agency.agencyName || 'Personal Agency'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Phone Number</div>
                            <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 600 }}>{agency.phoneNumber || 'Not linked'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Numeric Agent ID</div>
                            <div style={{ fontSize: 14, color: brandPlum, fontWeight: 800 }}>{agency.id || 'Not assigned'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>System Identifier (UID)</div>
                            <div style={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>{agency.uid}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Registered At</div>
                            <div style={{ fontSize: 14, color: '#1e293b' }}>{agency.registeredAt ? new Date(agency.registeredAt).toLocaleDateString() : 'Initial Setup'}</div>
                        </div>
                    </div>

                    <button style={{
                        background: 'linear-gradient(135deg, #573955, #3a2639)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 20px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(58, 38, 57, 0.15)'
                    }}>
                        My Contact Information
                    </button>
                </section>

                {/* 2. Upper Agent Contact Card */}
                <section style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: brandPlumLight, marginBottom: 16 }}>The contact method of your upper agent</h2>

                    <div style={{ background: '#fffcf2', border: '1px solid #fef3c7', borderRadius: 8, padding: '12px 16px', marginBottom: 24 }}>
                        <p style={{ fontSize: 12, color: '#92400e', margin: 0, fontWeight: 500 }}>
                            ⚠️ *For any problem you should query your upper agent. There will be no direct response via other ways.
                        </p>
                    </div>

                    {agency.parentAgencyId ? (
                        parentLoading ? (
                            <div style={{ color: '#666', fontSize: 13 }}>Fetching recruiter info...</div>
                        ) : parentAgency ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px 48px' }}>
                                <div>
                                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Recruiter Name</div>
                                    <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 600 }}>{parentAgency.agencyName || parentAgency.name}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Phone Number</div>
                                    <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 600 }}>{parentAgency.phoneNumber}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>WhatsApp / Telegram</div>
                                    <div style={{ fontSize: 14, color: '#1e293b', fontWeight: 600 }}>Available via Phone</div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: '#ef4444', fontSize: 13 }}>Recruiter information could not be found.</div>
                        )
                    ) : (
                        <div style={{ color: '#64748b', fontSize: 13, fontStyle: 'italic' }}>You were not invited by an upper agent (Direct Agency).</div>
                    )}
                </section>
            </div>
        </main>
    )
}

