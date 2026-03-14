'use client'

import { useState, useEffect } from 'react'
import { db } from '../../lib/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { useAgency } from '../../lib/hooks'
import StreamCard from '../components/StreamCard'
const MOCK_STREAMS = [
  {
    id: '1',
    hostName: 'Naveen Singh',
    hostId: 'host1',
    viewers: 2543,
    quality: 'HD',
    duration: 5340,
    diamondsEarned: 15000,
    status: 'live',
    startedAt: Date.now() - 5340000,
  },
  {
    id: '2',
    hostName: 'Priya Sharma',
    hostId: 'host2',
    viewers: 1234,
    quality: 'SD',
    duration: 2100,
    diamondsEarned: 6000,
    status: 'live',
    startedAt: Date.now() - 2100000,
  },
  {
    id: '3',
    hostName: 'Anjali Verma',
    hostId: 'host3',
    viewers: 5678,
    quality: 'HD',
    duration: 8900,
    diamondsEarned: 25000,
    status: 'live',
    startedAt: Date.now() - 8900000,
  },
]

export default function LiveStreamsPage() {
  const { agency } = useAgency()
  const [streams, setStreams] = useState([])
  const [hostsMap, setHostsMap] = useState({})
  const [filter, setFilter] = useState('live')
  const [selectedStream, setSelectedStream] = useState(null)
  const [loading, setLoading] = useState(true)

  // 1. Fetch agency hosts to use as a lookup/filter
  useEffect(() => {
    if (!agency?.agencyId) return;

    const hostsQuery = query(
      collection(db, "users"),
      where("isHost", "==", true),
      where("agencyId", "==", agency.agencyId)
    );

    const unsubscribe = onSnapshot(hostsQuery, (snapshot) => {
      const hMap = {};
      snapshot.docs.forEach(doc => {
        hMap[doc.id] = doc.data().name || 'No Name';
      });
      setHostsMap(hMap);
    });

    return () => unsubscribe();
  }, [agency]);

  // 2. Listen to real live streams
  useEffect(() => {
    if (Object.keys(hostsMap).length === 0) {
      if (!loading) setLoading(false);
      return;
    }

    setLoading(true)
    const streamsQuery = query(collection(db, "live_streams"));

    const unsubscribe = onSnapshot(streamsQuery, (snapshot) => {
      const list = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          hostName: hostsMap[doc.data().hostId] || 'Unknown Host',
          duration: doc.data().startedAt ? Math.floor((Date.now() - doc.data().startedAt.toDate().getTime()) / 1000) : 0
        }))
        // Filter by agency hosts
        .filter(s => hostsMap[s.hostId]);

      setStreams(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [hostsMap]);

  const filteredStreams = streams.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const handleStopStream = (streamId) => {
    if (confirm('Are you sure you want to stop this stream?')) {
      // In production, this would call a Cloud Function or update the stream status
      alert('Functionality to stop streams via dashboard requires specific permissions.')
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 8 }}>Live Streams</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>Monitor and control active streams</p>
      </header>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {['all', 'live', 'ended', 'scheduled'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: 6,
              background: filter === status ? '#7c3aed' : '#e5e7eb',
              color: filter === status ? '#fff' : '#1f2937',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              textTransform: 'capitalize',
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>Loading streams...</div>
      ) : (
        <>
          {filteredStreams.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>
              No {filter} streams found
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 24,
              }}
            >
              {filteredStreams.map(stream => (
                <StreamCard
                  key={stream.id}
                  stream={stream}
                  onStop={handleStopStream}
                  onSelect={setSelectedStream}
                />
              ))}
            </div>
          )}

          {/* Selected Stream Details */}
          {selectedStream && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}
              onClick={() => setSelectedStream(null)}
            >
              <div
                style={{
                  background: '#fff',
                  borderRadius: 8,
                  padding: 24,
                  maxWidth: 500,
                  width: '90%',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 style={{ margin: 0, marginBottom: 16 }}>Stream Details</h2>

                <div style={{ marginBottom: 12 }}>
                  <strong>Host:</strong> {selectedStream.hostName}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Viewers:</strong> {selectedStream.viewers.toLocaleString()}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Quality:</strong> {selectedStream.quality}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <strong>Duration:</strong> {Math.floor(selectedStream.duration / 60)}m {selectedStream.duration % 60}s
                </div>
                <div style={{ marginBottom: 24 }}>
                  <strong>Diamonds Earned:</strong> {selectedStream.diamondsEarned.toLocaleString()}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => setSelectedStream(null)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: '#e5e7eb',
                      color: '#1f2937',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleStopStream(selectedStream.id)
                      setSelectedStream(null)
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Stop Stream
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  )
}
