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

    const brandPlum = '#3a2639'
    const brandPlumLight = '#7d537b'

    // Fetch real sub-agents from Firestore
    useEffect(() => {
        if (!agency?.agencyId) return;

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
    }, [agency]);

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
            alert('Invitation sent! The user will need to accept it to become your sub-agent.')
        } catch (error) {
            console.error("Error adding agent:", error);
            alert("Failed to send invitation. Please try again.");
            setRequestSent(false);
        }
    }

    const filteredAgents = agents.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.id.includes(searchTerm)
    );

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

            <div style={{ background: '#fff', borderRadius: 12, padding: '24px 32px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                {/* Search Header */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                    <input
                        type="text"
                        placeholder="Search by name or ID..."
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
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>ID</th>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Agent Name</th>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Phone</th>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Email</th>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Hosts Invited</th>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Agents Invited</th>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Bind Time</th>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Register Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Loading agents...</td></tr>
                            ) : filteredAgents.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ padding: '80px 0', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontSize: 14, color: '#94a3b8' }}>No agents found</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAgents.map(agent => (
                                    <tr key={agent.id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                                        <td style={{ padding: '16px', fontSize: 13, color: brandPlumLight, fontWeight: 500 }}>{agent.id}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#333' }}>{agent.name}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{agent.phone}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{agent.email}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{agent.hostsInvited}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{agent.agentsInvited}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{agent.bindTime}</td>
                                        <td style={{ padding: '16px', fontSize: 13, color: '#666' }}>{agent.registerTime}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    )
}
