'use client'

export default function ReportRecordsPage() {
    const records = [
        {
            id: 1,
            userid: '66378718',
            type: 'Scam for money or account',
            content: '-',
            images: ['/images/report1.png', '/images/report2.png'],
            time: '2025-01-18 05:37:10',
            status: 'Dismissed',
            reply: 'After verification, your report against 66378718 - Scam for money or account is invalid.\n\nDear user, thanks for your report. However, the evidence you provided is insufficient. Please submit again with more information. Thank you!\n\n- For multiple accounts reports, please report the user\'s New account and specify the user\'s Old account in the description part.\n\n- For fraud & scam reports, please share the FULL chatting history with the relevant user.'
        },
        {
            id: 2,
            userid: '66378718',
            type: 'Scam for money or account',
            content: '-',
            images: ['/images/report3.png', '/images/report4.png', '/images/report5.png', '/images/report6.png', '/images/report7.png'],
            time: '2025-01-18 22:52:23',
            status: 'Dismissed',
            reply: 'After verification, your report against 66378718 - Scam for money or account is invalid.\n\nDear user, thanks for your report. However, the evidence you provided is insufficient. Please submit again with more information. Thank you!\n\n- For multiple accounts reports, please report the user\'s New account and specify the user\'s Old account in the description part.\n\n- For fraud & scam reports, please share the FULL chatting history with the relevant user.'
        },
        {
            id: 3,
            userid: '103681240',
            type: 'Scam for money or account',
            content: '-',
            images: ['/images/report8.png', '/images/report9.png', '/images/report10.png'],
            time: '2026-03-11 06:05:28',
            status: 'Dismissed',
            reply: 'After verification, your report against 103681240 - Scam for money or account is invalid.\n\nDear user, thanks for your report. However, the evidence you provided is insufficient. Please submit again with more information. Thank you!\n\n- For multiple accounts reports, please report the user\'s New account and specify the user\'s Old account in the description part.\n\n- For fraud & scam reports, please share the FULL chatting history with the relevant user.'
        }
    ]

    return (
        <main style={{ background: '#f0f2f5', minHeight: '100vh', padding: '16px 24px' }}>
            {/* Breadcrumbs */}
            <nav style={{ fontSize: 13, color: '#666', marginBottom: 16, display: 'flex', gap: 8 }}>
                <span>Report</span>
                <span>/</span>
                <span style={{ color: '#111' }}>Report Records</span>
            </nav>

            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginBottom: 24 }}>Report Records</h1>

            <div style={{ background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                {/* Table Utility Row */}
                <div style={{ marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#94a3b8"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                    </div>
                </div>

                {/* Data Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #f0f2f5' }}>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Report Userid</th>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Report Type</th>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Report Content</th>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Picture Evidence</th>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Report time</th>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Status</th>
                                <th style={{ padding: '16px', fontSize: 12, fontWeight: 600, color: '#666' }}>Message reply</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((row) => (
                                <tr key={row.id} style={{ borderBottom: '1px solid #f0f2f5', verticalAlign: 'top' }}>
                                    <td style={{ padding: '24px 16px', fontSize: 13, color: '#333' }}>{row.userid}</td>
                                    <td style={{ padding: '24px 16px', fontSize: 13, color: '#333' }}>{row.type}</td>
                                    <td style={{ padding: '24px 16px', fontSize: 13, color: '#94a3b8' }}>{row.content}</td>
                                    <td style={{ padding: '24px 16px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 40px)', gap: 8 }}>
                                            {row.images.map((img, i) => (
                                                <div key={i} style={{ width: 40, height: 60, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: '24px 16px', fontSize: 12, color: '#666', whiteSpace: 'nowrap' }}>
                                        {row.time.split(' ')[0]}<br />{row.time.split(' ')[1]}
                                    </td>
                                    <td style={{ padding: '24px 16px', fontSize: 13, color: '#333' }}>{row.status}</td>
                                    <td style={{ padding: '24px 16px', fontSize: 12, color: '#666', lineHeight: '1.6', maxWidth: 400 }}>
                                        <div style={{ whiteSpace: 'pre-wrap' }}>{row.reply}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    )
}
