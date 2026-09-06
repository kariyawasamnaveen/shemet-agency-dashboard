'use client'

export default function ReportPage() {
    const brandPlum = '#3a2639'

    return (
        <main style={{ background: '#f0f2f5', minHeight: '100vh', padding: '16px 24px' }}>
            {/* Breadcrumbs */}
            <nav style={{ fontSize: 13, color: '#666', marginBottom: 16, display: 'flex', gap: 8 }}>
                <span>Report</span>
                <span>/</span>
                <span style={{ color: '#111' }}>Report</span>
            </nav>

            <h1 style={{ fontSize: 20, fontWeight: 600, color: '#111', marginBottom: 24 }}>Report</h1>

            <div style={{ background: '#fff', borderRadius: 12, padding: '32px 40px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                {/* Warning Alert */}
                <div style={{
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    borderRadius: 8,
                    padding: '12px 20px',
                    marginBottom: 40,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                }}>
                    <span style={{ fontSize: 18 }}>⚠️</span>
                    <p style={{ fontSize: 14, color: '#e11d48', margin: 0, fontWeight: 500 }}>
                        If your find any fraud, pornography, etc. behaviors, you can report them here, and we will punish them.
                    </p>
                </div>

                <div style={{ maxWidth: 600 }}>
                    {/* Form Fields */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                        {/* UserID */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <label style={{ width: 140, fontSize: 14, color: '#333', fontWeight: 500, textAlign: 'right' }}>
                                <span style={{ color: 'red', marginRight: 4 }}>*</span>Report userid
                            </label>
                            <input
                                type="text"
                                placeholder="Fill in the ID of the user you want to report"
                                style={{
                                    flex: 1,
                                    padding: '10px 14px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 4,
                                    fontSize: 13,
                                    outline: 'none'
                                }}
                            />
                        </div>

                        {/* Report Type */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <label style={{ width: 140, fontSize: 14, color: '#333', fontWeight: 500, textAlign: 'right' }}>
                                <span style={{ color: 'red', marginRight: 4 }}>*</span>Report Type
                            </label>
                            <select
                                style={{
                                    flex: 1,
                                    padding: '10px 14px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 4,
                                    fontSize: 13,
                                    color: '#666',
                                    outline: 'none',
                                    background: '#fff'
                                }}
                            >
                                <option>Select</option>
                                <option>Scam for money or account</option>
                                <option>Pornography</option>
                                <option>Harassment</option>
                                <option>Other</option>
                            </select>
                        </div>

                        {/* Picture Evidence */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                            <label style={{ width: 140, fontSize: 14, color: '#333', fontWeight: 500, textAlign: 'right', marginTop: 10 }}>
                                <span style={{ color: 'red', marginRight: 4 }}>*</span>Picture Evidence
                            </label>
                            <div style={{
                                width: 100,
                                height: 100,
                                border: '1px dashed #ced4da',
                                borderRadius: 8,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                background: '#f8fafc',
                                color: '#adb5bd'
                            }}>
                                <span style={{ fontSize: 24 }}>+</span>
                                <span style={{ fontSize: 11, marginTop: 4 }}>Upload image</span>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div style={{ paddingLeft: 156, marginTop: 48 }}>
                        <button style={{
                            background: 'linear-gradient(135deg, #573955, #3a2639)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '14px 80px',
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(58, 38, 57, 0.2)'
                        }}>
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </main>
    )
}
