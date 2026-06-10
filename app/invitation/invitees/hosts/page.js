'use client'

import { useState, useEffect } from 'react'
import { useAgency } from '../../../../lib/hooks'
import { db } from '../../../../lib/firebase'
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs } from 'firebase/firestore'

export default function HostsListPage() {
    const { agency, loading: agencyLoading } = useAgency()
    const [hosts, setHosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddHostModal, setShowAddHostModal] = useState(false)
    const [addHostForm, setAddHostForm] = useState({ id: '', contact: '' })
    const [requestSent, setRequestSent] = useState(false)
    const [activeTab, setActiveTab] = useState('agreed') // 'agreed' or 'record'

    const brandPlum = '#3a2639'
    const brandPlumLight = '#7d537b'

    // Fetch real hosts from Firestore
    useEffect(() => {
        if (!agency?.agencyId) return;

        console.log("Fetching hosts for agency:", agency.agencyId);

        const q = query(
            collection(db, "users"),
            where("isHost", "==", true),
            where("agencyId", "==", agency.agencyId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const hostList = snapshot.docs.map(doc => ({
                id: doc.id,
                nickname: doc.data().name || 'No Name',
                gender: doc.data().gender || 'Unknown',
                phone: doc.data().phoneNumber || '-',
                email: doc.data().email || '-',
                charm: doc.data().level || 0,
                registerTime: doc.data().createdAt?.toDate()?.toLocaleString() || '-',
                lastActive: doc.data().lastSeen?.toDate()?.toLocaleString() || '-',
                faceStatus: doc.data().isVerified ? 'verified' : 'unverified',
                status: 'Active',
                ...doc.data()
            }));
            setHosts(hostList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching hosts:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [agency]);

    const handleAddHost = async (e) => {
        e.preventDefault()
        if (!agency?.agencyId) {
            alert("Scale Error: Agency profile not fully loaded.");
            return;
        }

        setRequestSent(true)

        try {
            let targetUser = null;
            
            // Search by Shemet ID (Numeric) or Contact (Phone/Email)
            const usersRef = collection(db, "users");
            
            // 1. Try Numeric ID
            const q1 = query(usersRef, where("id", "==", addHostForm.id));
            const snap1 = await getDocs(q1);
            
            if (!snap1.empty) {
                targetUser = { id: snap1.docs[0].id, ...snap1.docs[0].data() };
            } else {
                // 2. Try Phone/Email if provided in contact field
                const q2 = query(usersRef, where("phoneNumber", "==", addHostForm.contact));
                const snap2 = await getDocs(q2);
                if (!snap2.empty) {
                    targetUser = { id: snap2.docs[0].id, ...snap2.docs[0].data() };
                } else {
                    const q3 = query(usersRef, where("email", "==", addHostForm.contact));
                    const snap3 = await getDocs(q3);
                    if (!snap3.empty) {
                        targetUser = { id: snap3.docs[0].id, ...snap3.docs[0].data() };
                    }
                }
            }

            if (!targetUser) {
                alert("User not found! Please check the Shemet ID and Phone/Gmail.");
                setRequestSent(false);
                return;
            }

            // Gender Check: Only females can be invited as hosts
            if (targetUser.gender?.toLowerCase() === 'male') {
                alert("Only female accounts can be invited as hosts. Male accounts are not eligible.");
                setRequestSent(false);
                return;
            }

            // Check if already bound
            if (targetUser.agencyId) {
                alert("This host is already bound to an agency.");
                setRequestSent(false);
                return;
            }

            // Create host invitation
            await addDoc(collection(db, "host_invitations"), {
                targetUserId: targetUser.uid || targetUser.id,
                targetNumericId: targetUser.id || '-',
                targetUserName: targetUser.name || 'User',
                targetUserPhone: targetUser.phoneNumber || '-',
                targetUserEmail: targetUser.email || '-',
                agencyId: agency.agencyId,
                agencyName: agency.name || 'Your Agency',
                agencyPhoto: agency.photoURL || '',
                status: 'pending',
                inviteCode: Math.random().toString(36).substring(7).toUpperCase(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            setTimeout(() => {
                setShowAddHostModal(false)
                setRequestSent(false)
                setAddHostForm({ id: '', contact: '' })
                alert('Invitation sent successfully! The host can accept it in their application notifications.')
            }, 1000)
        } catch (error) {
            console.error("Error adding host:", error);
            alert("Failed to send invitation. Please try again.");
            setRequestSent(false);
        }
    }

    const [invitations, setInvitations] = useState([])
    const [invitationsLoading, setInvitationsLoading] = useState(false)

    // Fetch host invitations
    useEffect(() => {
        if (!agency?.agencyId || activeTab !== 'record') return;

        setInvitationsLoading(true);
        console.log("Fetching invitations for agency:", agency.agencyId);

        const q = query(
            collection(db, "host_invitations"),
            where("agencyId", "==", agency.agencyId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const inviteList = snapshot.docs.map(doc => ({
                id: doc.id,
                targetUserId: doc.data().targetUserId || '-',
                status: doc.data().status || 'pending',
                inviteCode: doc.data().inviteCode || '-',
                createdAt: doc.data().createdAt?.toDate()?.toLocaleString() || '-',
                updatedAt: doc.data().updatedAt?.toDate()?.toLocaleString() || '-',
                ...doc.data()
            }));
            setInvitations(inviteList);
            setInvitationsLoading(false);
        }, (error) => {
            console.error("Error fetching invitations:", error);
            setInvitationsLoading(false);
        });

        return () => unsubscribe();
    }, [agency, activeTab]);

    // Filter hosts based on search (simplified for now)
    const hostsData = activeTab === 'agreed' ? hosts : invitations;

    return (
        <main style={{ background: '#f0f2f5', minHeight: '100vh', padding: '16px 16px' }}>
            {/* Add Host Modal */}
            {showAddHostModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(2px)'
                }}>
                    <div style={{
                        background: '#fff',
                        borderRadius: 16,
                        width: '100%',
                        maxWidth: 400,
                        padding: 32,
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setShowAddHostModal(false)}
                            style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
                        >✕</button>

                        <h2 style={{ fontSize: 20, fontWeight: 700, color: brandPlum, marginBottom: 8 }}>Add New Host</h2>
                        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Enter the host details to send a binding request.</p>

                        <form onSubmit={handleAddHost}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Shemet ID</label>
                                <input
                                    type="text"
                                    required
                                    value={addHostForm.id}
                                    onChange={(e) => setAddHostForm({ ...addHostForm, id: e.target.value })}
                                    placeholder="e.g. 98700439"
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                />
                            </div>
                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Phone Number or Gmail</label>
                                <input
                                    type="text"
                                    required
                                    value={addHostForm.contact}
                                    onChange={(e) => setAddHostForm({ ...addHostForm, contact: e.target.value })}
                                    placeholder="Enter phone or email"
                                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={requestSent}
                                style={{
                                    width: '100%',
                                    background: brandPlum,
                                    color: '#fff',
                                    border: 'none',
                                    padding: '12px',
                                    borderRadius: 8,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: requestSent ? 'not-allowed' : 'pointer',
                                    opacity: requestSent ? 0.8 : 1,
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 12px rgba(58,38,57,0.2)'
                                }}
                            >
                                {requestSent ? 'Sending Request...' : 'Send Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ width: '100%' }}>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 8, display: 'flex', gap: 6 }}>
                    <span>My Invitation</span> / <span>Invitee List</span> / <span style={{ color: '#111' }}>Hosts List</span>
                </div>
                <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginBottom: 24 }}>Hosts List</h1>

                {/* Content Container */}
                <div style={{ background: '#fff', borderRadius: 12, padding: '0px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

                    {/* Tab Switcher */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #eee', padding: '0 24px' }}>
                        <button
                            onClick={() => setActiveTab('agreed')}
                            style={{
                                padding: '16px 20px',
                                background: 'none',
                                border: 'none',
                                fontSize: 14,
                                fontWeight: activeTab === 'agreed' ? 600 : 400,
                                color: activeTab === 'agreed' ? brandPlum : '#666',
                                borderBottom: activeTab === 'agreed' ? `2px solid ${brandPlum}` : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Agreed List
                        </button>
                        <button
                            onClick={() => setActiveTab('record')}
                            style={{
                                padding: '16px 20px',
                                background: 'none',
                                border: 'none',
                                fontSize: 14,
                                fontWeight: activeTab === 'record' ? 600 : 400,
                                color: activeTab === 'record' ? brandPlum : '#666',
                                borderBottom: activeTab === 'record' ? `2px solid ${brandPlum}` : 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            Invitation Record List
                        </button>
                    </div>

                    <div style={{ padding: 24 }}>
                        {/* Filters Row */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                            <input
                                type="text"
                                placeholder="ID"
                                style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, width: 150 }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: 4, padding: '0 8px', background: '#fff' }}>
                                <input type="date" style={{ border: 'none', padding: '8px 4px', fontSize: 13, outline: 'none' }} />
                                <span style={{ color: '#ccc', margin: '0 4px' }}>-</span>
                                <input type="date" style={{ border: 'none', padding: '8px 4px', fontSize: 13, outline: 'none' }} />
                            </div>
                            <select style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, color: '#666', minWidth: 180 }}>
                                <option>Inactive hosts yesterday</option>
                                <option>Active hosts yesterday</option>
                            </select>

                            <div style={{ display: 'flex', gap: 8 }}>
                                <button style={{
                                    background: brandPlum,
                                    color: '#fff',
                                    border: 'none',
                                    padding: '8px 24px',
                                    borderRadius: 4,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 6px rgba(58,38,57,0.2)'
                                }}>
                                    Search
                                </button>

                                <button
                                    onClick={() => setShowAddHostModal(true)}
                                    style={{
                                        background: '#fff',
                                        color: brandPlum,
                                        border: `1.5px solid ${brandPlum}`,
                                        padding: '8px 24px',
                                        borderRadius: 4,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    + Add Host
                                </button>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                            <span style={{ fontSize: 14, color: '#111', fontWeight: 500 }}>
                                {activeTab === 'agreed' ? 'Total of bound hosts:' : 'Total invitations sent:'} {hostsData.length}
                            </span>
                            <button style={{
                                background: '#fff',
                                color: '#666',
                                border: '1px solid #ddd',
                                padding: '6px 16px',
                                borderRadius: 4,
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: 'pointer'
                            }}>
                                Export Excel
                            </button>
                        </div>

                        {/* Table Area */}
                        <div style={{ overflowX: 'auto', border: '1px solid #f0f0f0', borderRadius: 8 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                                        {activeTab === 'agreed' ? (
                                            <>
                                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Numeric ID</th>
                                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>NickName</th>
                                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Gender</th>
                                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Phone</th>
                                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Email</th>
                                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Shemet Level</th>
                                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Poster</th>
                                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Recent Live Record</th>
                                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Register Time</th>
                                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Last Active Time</th>
                                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Face Verification Result</th>
                                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Deletion Status</th>
                                            </>
                                        ) : (
                                            <>
                                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Target User ID</th>
                                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Status</th>
                                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Invite Code</th>
                                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Sent Time</th>
                                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Last Updated</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(activeTab === 'agreed' ? loading : invitationsLoading) ? (
                                        <tr>
                                            <td colSpan="12" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                                                Loading {activeTab === 'agreed' ? 'hosts' : 'invitations'}...
                                            </td>
                                        </tr>
                                    ) : hostsData.length === 0 ? (
                                        <tr>
                                            <td colSpan="12" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                                                No {activeTab === 'agreed' ? 'hosts' : 'invitation records'} found.
                                            </td>
                                        </tr>
                                    ) : (
                                        hostsData.map((row) => (
                                            <tr key={row.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                                {activeTab === 'agreed' ? (
                                                    <>
                                                        <td style={{ padding: '16px', fontSize: 13, color: brandPlumLight, fontWeight: 700 }}>{row.id || '-'}</td>
                                                        <td style={{ padding: '16px', fontSize: 13, color: '#333' }}>{row.nickname}</td>
                                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.gender}</td>
                                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.phone}</td>
                                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.email}</td>
                                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.charm}</td>
                                                        <td style={{ padding: '16px' }}>
                                                            <div style={{ width: 44, height: 44, background: '#f5f5f5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px' }}>
                                                            <div style={{ width: 44, height: 44, background: '#f5f5f5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.registerTime}</td>
                                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.lastActive}</td>
                                                        <td style={{ padding: '16px', fontSize: 13, color: row.faceStatus === 'verified' ? '#10b981' : '#666' }}>{row.faceStatus}</td>
                                                        <td style={{ padding: '16px', fontSize: 13, color: '#10b981', fontWeight: 500 }}>{row.status}</td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td style={{ padding: '16px', fontSize: 13, color: brandPlumLight, fontWeight: 500 }}>{row.targetUserId}</td>
                                                        <td style={{ padding: '16px' }}>
                                                            <span style={{
                                                                padding: '4px 10px',
                                                                borderRadius: 20,
                                                                fontSize: 12,
                                                                fontWeight: 600,
                                                                textTransform: 'capitalize',
                                                                background: row.status === 'pending' ? '#fffbeb' : row.status === 'accepted' ? '#f0fdf4' : '#fef2f2',
                                                                color: row.status === 'pending' ? '#b45309' : row.status === 'accepted' ? '#15803d' : '#b91c1c'
                                                            }}>{row.status}</span>
                                                        </td>
                                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.inviteCode}</td>
                                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.createdAt}</td>
                                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{row.updatedAt}</td>
                                                    </>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Placeholder */}
                        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: 24, gap: 12 }}>
                            <span style={{ fontSize: 13, color: '#666' }}>Per page</span>
                            <select style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}>
                                <option>10</option>
                                <option>20</option>
                                <option>50</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
