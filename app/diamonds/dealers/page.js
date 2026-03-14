'use client'

import { useAgency } from '../../../lib/hooks'

export default function DealersManagementPage() {
    const { agency } = useAgency()
    const brandPlum = '#3a2639'

    const topUpAgents = [
        { name: 'Elite Top-up Global', region: 'Global', status: 'Authorized' },
        { name: 'Shemet Official Pay', region: 'South Asia', status: 'Authorized' },
        { name: 'MetWallet Direct', region: 'MENA', status: 'Authorized' },
    ]

    return (
        <main style={{ padding: 24, background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
            <header style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, marginBottom: 8 }}>Diamond Seller</h1>
                <p style={{ color: '#64748b', margin: 0, fontSize: 15 }}>Authorized portal for official diamond distribution.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
                {/* Main Notice */}
                <div style={{ background: '#fff', borderRadius: 16, padding: 32, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        padding: '16px 20px',
                        borderRadius: 12,
                        marginBottom: 24,
                        border: '1px solid #fde68a',
                        fontWeight: 600,
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                    }}>
                        <span style={{ fontSize: 20 }}>🚧</span>
                        Direct Dealer Enrollment is Currently: <span style={{ textTransform: 'uppercase', fontWeight: 800 }}>Coming Soon</span>
                    </div>

                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: brandPlum }}>Application Requirements</h2>
                    <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: 20 }}>
                        The Diamond Seller application is accessible if you meet the specific commission ratio and performance metrics.
                        Once eligible, your dashboard will automatically unlock the "Apply as Dealer" feature.
                    </p>

                    <div style={{ padding: '20px', background: '#f1f5f9', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
                        <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                            <strong style={{ color: brandPlum }}>Note:</strong> This is the <strong>ONLY</strong> authorized entrance for diamond dealer applications.
                            Please do not trust any external links or third-party agents claiming to offer enrollment.
                        </p>
                    </div>
                </div>

                {/* Recommended Top-up Agents */}
                <div style={{ background: brandPlum, borderRadius: 16, padding: 24, color: '#fff' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20 }}>💎</span> Recommended Top-up Agents
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {topUpAgents.map((agent, i) => (
                            <div key={i} style={{
                                background: 'rgba(255,255,255,0.08)',
                                padding: 16,
                                borderRadius: 12,
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{agent.name}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{agent.region}</span>
                                    <span style={{ fontSize: 10, background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: 10, fontWeight: 700, textTransform: 'uppercase' }}>
                                        {agent.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button style={{
                        width: '100%',
                        marginTop: 24,
                        padding: '12px',
                        background: '#fff',
                        color: brandPlum,
                        border: 'none',
                        borderRadius: 10,
                        fontWeight: 800,
                        fontSize: 13,
                        cursor: 'pointer'
                    }}>
                        Contact Official Support
                    </button>
                </div>
            </div>
        </main>
    )
}
