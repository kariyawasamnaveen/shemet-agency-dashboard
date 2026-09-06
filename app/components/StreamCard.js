'use client'

export default function StreamCard({ stream, onStop, onSelect }) {
  const getQualityColor = (quality) => {
    switch (quality) {
      case 'HD': return '#059669'
      case 'SD': return '#0891b2'
      case 'Low': return '#ea580c'
      default: return '#6b7280'
    }
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Thumbnail */}
      <div
        style={{
          height: 180,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 48,
          position: 'relative',
        }}
      >
        📹
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: getQualityColor(stream.quality),
            color: '#fff',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {stream.quality}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          {stream.hostName}
        </h3>

        <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 12, color: '#6b7280' }}>
          <div>👥 {stream.viewers.toLocaleString()} viewers</div>
          <div>⏱️ {Math.floor(stream.duration / 60)}m {stream.duration % 60}s</div>
        </div>

        <div
          style={{
            background: '#f3f4f6',
            padding: 8,
            borderRadius: 6,
            marginBottom: 12,
            fontSize: 13,
            color: '#1f2937',
          }}
        >
          💎 {stream.diamondsEarned.toLocaleString()} earned
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onSelect(stream)}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Details
          </button>
          <button
            onClick={() => onStop(stream.id)}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  )
}
