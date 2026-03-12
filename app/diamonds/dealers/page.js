'use client'

export default function DealersManagementPage() {
    return (
        <main style={{ background: '#f0f2f5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ maxWidth: 800, textAlign: 'center', background: '#fff', padding: '60px 40px', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: 18, color: '#333', lineHeight: '1.6', fontWeight: 500, margin: 0 }}>
                    The Diamond Seller application is accessible if you meet the commission ratio requirement. Otherwise please increase your commission ratio first.
                </p>
                <p style={{ fontSize: 18, color: '#333', lineHeight: '1.6', fontWeight: 500, marginTop: 12 }}>
                    This is the <span style={{ color: '#3a2639', fontWeight: 700 }}>ONLY</span> entrance for diamonds seller application. Please be careful and don't trust other methods.
                </p>
            </div>
        </main>
    )
}
