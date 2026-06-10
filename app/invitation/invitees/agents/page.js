'use client'

import { useState, useEffect } from 'react'
import { useAgency } from '../../../../lib/hooks'
import { db } from '../../../../lib/firebase'
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs } from 'firebase/firestore'

export default function AgentsListPage() {
    const { agency } = useAgency()
    const [agents, setAgents] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddAgentModal, setShowAddAgentModal] = useState(false)
    const [addAgentForm, setAddAgentForm] = useState({ id: '', contact: '' })
    const [requestSent, setRequestSent] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState('agreed') // 'agreed' or 'record'

    const brandPlum = '#3a2639'
    const brandPlumLight = '#7d537b'

    // Fetch real sub-agents from Firestore
    useEffect(() => {
        if (!agency?.agencyId || activeTab !== 'agreed') return;

        console.log("Fetching sub-agents for master agent:", agency.agencyId);

        const q = query(
            collection(db, "users"),
            where("isAgent", "==", true),
            where("parentAgencyId", "==", agency.agencyId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const agentList = snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name || 'No Name',
                phone: doc.data().phoneNumber || '-',
                email: doc.data().email || '-',
                hostsInvited: doc.data().hostsInvitedCount || 0,
                agentsInvited: doc.data().agentsInvitedCount || 0,
                bindTime: doc.data().bindTime?.toDate()?.toLocaleString() || '-',
                registerTime: doc.data().createdAt?.toDate()?.toLocaleString() || '-',
                ...doc.data()
            }));
            setAgents(agentList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching sub-agents:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [agency, activeTab]);

    const [invitations, setInvitations] = useState([])
    const [invitationsLoading, setInvitationsLoading] = useState(false)

    // Fetch agent invitations
    useEffect(() => {
        if (!agency?.agencyId || activeTab !== 'record') return;

        setInvitationsLoading(true);
        console.log("Fetching invitations for agency:", agency.agencyId);

        const q = query(
            collection(db, "agent_invitations"),
            where("inviterAgencyId", "==", agency.agencyId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const inviteList = snapshot.docs.map(doc => ({
                id: doc.id,
                targetUserId: doc.data().targetUserId || '-',
                status: doc.data().status || 'pending',
                createdAt: doc.data().createdAt?.toDate()?.toLocaleString() || '-',
                updatedAt: doc.data().updatedAt?.toDate()?.toLocaleString() || '-',
                ...doc.data()
            }));
            setInvitations(inviteList);
            setInvitationsLoading(false);
        }, (error) => {
            console.error("Error fetching agent invitations:", error);
            setInvitationsLoading(false);
        });

        return () => unsubscribe();
    }, [agency, activeTab]);

    const handleAddAgent = async (e) => {
        e.preventDefault()
        if (!agency?.agencyId) {
            alert("Error: Agency profile not fully loaded.");
            return;
        }

        setRequestSent(true)

        try {
            // Check if user exists (by UID or shemetId)
            const userQuery = query(collection(db, "users"), where("uid", "==", addAgentForm.id));
            const userSnap = await getDocs(userQuery);

            let targetUser = null;
            if (!userSnap.empty) {
                targetUser = { id: userSnap.docs[0].id, ...userSnap.docs[0].data() };
            } else {
                const idQuery = query(collection(db, "users"), where("shemetId", "==", addAgentForm.id));
                const idSnap = await getDocs(idQuery);
                if (!idSnap.empty) {
                    targetUser = { id: idSnap.docs[0].id, ...idSnap.docs[0].data() };
                }
            }

            if (!targetUser) {
                alert("User not found! Please check the Shemet ID.");
                setRequestSent(false);
                return;
            }

            // Create agent invitation
            await addDoc(collection(db, "agent_invitations"), {
                targetUserId: targetUser.id,
                inviterAgencyId: agency.agencyId,
                inviterName: agency.name || 'Your Agency',
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            setShowAddAgentModal(false)
            setRequestSent(false)
            setAddAgentForm({ id: '', contact: '' })
            alert('Invitation sent! The user will need to accept it in the Shemet App to become your sub-agent.')
        } catch (error) {
            console.error("Error adding agent:", error);
            alert("Failed to send invitation. Please try again.");
            setRequestSent(false);
        }
    }

    const displayData = activeTab === 'agreed' ? agents : invitations;
    const filteredData = displayData.filter(item => {
        const search = searchTerm.toLowerCase();
        if (activeTab === 'agreed') {
            return (item.name || '').toLowerCase().includes(search) || (item.id || '').includes(search);
        } else {
            return (item.targetUserId || '').includes(search) || (item.status || '').toLowerCase().includes(search);
        }
    });

    return (
        <main style={{ background: '#f0f2f5', minHeight: '100vh', padding: '16px 24px' }}>
            {/* Add Agent Modal */}
            {showAddAgentModal && (
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
                            onClick={() => setShowAddAgentModal(false)}
                            style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8' }}
                        >✕</button>

                        <h2 style={{ fontSize: 20, fontWeight: 700, color: brandPlum, marginBottom: 8 }}>Add Sub-Agent</h2>
                        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Send an invitation to a user to become your sub-agent.</p>

                        <form onSubmit={handleAddAgent}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Shemet ID or UID</label>
                                <input
                                    type="text"
                                    required
                                    value={addAgentForm.id}
                                    onChange={(e) => setAddAgentForm({ ...addAgentForm, id: e.target.value })}
                                    placeholder="Enter user ID"
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
                                    boxShadow: '0 4px 12px rgba(58,38,57,0.2)'
                                }}
                            >
                                {requestSent ? 'Sending...' : 'Send Invitation'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Breadcrumbs */}
            <nav style={{ fontSize: 13, color: '#666', marginBottom: 16, display: 'flex', gap: 8 }}>
                <span>My Invitation</span>
                <span>/</span>
                <span>Invitee List</span>
                <span>/</span>
                <span style={{ color: '#111' }}>Agents List</span>
            </nav>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', margin: 0 }}>Agents List</h1>
                <button
                    onClick={() => setShowAddAgentModal(true)}
                    style={{
                        background: brandPlum,
                        color: '#fff',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(58,38,57,0.2)'
                    }}
                >
                    + Add Sub-Agent
                </button>
            </div>

            <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
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
                        Agents List
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

                <div style={{ padding: '24px 32px' }}>
                    {/* Search Header */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                        <input
                            type="text"
                            placeholder={activeTab === 'agreed' ? "Search by name or ID..." : "Search by User ID..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: 240,
                                padding: '10px 12px',
                                border: '1px solid #e5e7eb',
                                borderRadius: 4,
                                fontSize: 13,
                            }}
                        />
                    </div>

                    {/* Data Table */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #f0f2f5' }}>
                                    {activeTab === 'agreed' ? (
                                        <>
                                            <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>ID</th>
                                            <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Agent Name</th>
                                            <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Phone</th>
                                            <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Email</th>
                                            <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Hosts Invited</th>
                                            <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Agents Invited</th>
                                            <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Bind Time</th>
                                            <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Register Time</th>
                                        </>
                                    ) : (
                                        <>
                                            <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Target User ID</th>
                                            <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Status</th>
                                            <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Sent Time</th>
                                            <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Last Updated</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {(activeTab === 'agreed' ? loading : invitationsLoading) ? (
                                    <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading...</td></tr>
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ padding: '80px 0', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                                <span style={{ fontSize: 14, color: '#94a3b8' }}>No records found</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map(item => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                                            {activeTab === 'agreed' ? (
                                                <>
                                                    <td style={{ padding: '16px', fontSize: 13, color: brandPlumLight, fontWeight: 500 }}>{item.uid || item.id}</td>
                                                    <td style={{ padding: '16px', fontSize: 13, color: '#333' }}>{item.name}</td>
                                                    <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{item.phone}</td>
                                                    <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{item.email}</td>
                                                    <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{item.hostsInvited}</td>
                                                    <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{item.agentsInvited}</td>
                                                    <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{item.bindTime}</td>
                                                    <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{item.registerTime}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td style={{ padding: '16px', fontSize: 13, color: brandPlumLight, fontWeight: 500 }}>{item.targetUserId}</td>
                                                    <td style={{ padding: '16px' }}>
                                                        <span style={{
                                                            padding: '4px 10px',
                                                            borderRadius: 20,
                                                            fontSize: 12,
                                                            fontWeight: 600,
                                                            textTransform: 'capitalize',
                                                            background: item.status === 'pending' ? '#fffbeb' : item.status === 'accepted' ? '#f0fdf4' : '#fef2f2',
                                                            color: item.status === 'pending' ? '#b45309' : item.status === 'accepted' ? '#15803d' : '#b91c1c'
                                                        }}>{item.status}</span>
                                                    </td>
                                                    <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{item.createdAt}</td>
                                                    <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{item.updatedAt}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    )
}
