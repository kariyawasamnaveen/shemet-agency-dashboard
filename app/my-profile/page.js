'use client'

export default function MyProfilePage() {
    const brandPlum = '#3a2639'
    const brandPlumLight = '#7d537b'

    return (
        <main style={{ background: '#f0f2f5', minHeight: '100vh', padding: '16px 16px' }}>
            <div style={{ width: '100%' }}>
                <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginBottom: 24 }}>My Profile</h1>

                {/* 1. My info Card */}
                <section style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: brandPlumLight, marginBottom: 24 }}>My info</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px 48px', marginBottom: 32 }}>
                        <div>
                            <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Shemet Nickname: Zubi👯❤️</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Shemet ID: 24752027</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontSize: 13, color: '#666' }}>Phone Number: 923165922766</div>
                            <button style={{ background: brandPlumLight, color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>Modify</button>
                        </div>
                        <div>
                            <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Agent ID: 136063</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Agent Name: Zubi Agency</div>
                        </div>
                    </div>

                    <button style={{
                        background: 'linear-gradient(135deg, #573955, #3a2639)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '10px 20px',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(58, 38, 57, 0.2)'
                    }}>
                        My contact information
                    </button>
                </section>

                {/* 2. Upper Agent Contact Card */}
                <section style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: brandPlumLight, marginBottom: 16 }}>The contact method of your upper agent</h2>

                    {/* Warning Box */}
                    <div style={{ background: '#fff5f5', border: '1px solid #fee2e2', borderRadius: 4, padding: '10px 16px', marginBottom: 24 }}>
                        <p style={{ fontSize: 12, color: '#ef4444', margin: 0, fontWeight: 500 }}>
                            *For any problem you should query your upper agent, there will be NO response via other ways.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px 48px' }}>
                        <div>
                            <div style={{ fontSize: 13, color: '#666' }}>Phone Number: +923165922766</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 13, color: '#666' }}>WhatsApp Number: +923165922766</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 13, color: '#666' }}>Telegram Link:</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 13, color: '#666' }}>Facebook Link:</div>
                        </div>
                    </div>
                </section>

                {/* Wallet moved to My Wallet page */}
            </div>
        </main>
    )
}

