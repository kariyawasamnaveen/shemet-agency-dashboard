'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAgency } from '../../context/AgencyContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, orderBy } from 'firebase/firestore';

export default function TopupApprovalsPage() {
  const { agent, loading: authLoading } = useAgency();
  const router = useRouter();
  const isSuperAdmin = agent?.email === 'hknskariyawasamnaveen@gmail.com';

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      router.push('/');
    }
  }, [isSuperAdmin, authLoading, router]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchRequests();
    }
  }, [isSuperAdmin]);

  const fetchRequests = async () => {
    if (!isSuperAdmin) return;
    setLoading(true);
    try {
      const pendingQuery = query(
        collection(db, 'topup_requests'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(pendingQuery);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(list);
    } catch (error) {
      console.error('Error fetching topup requests:', error);
    }
    setLoading(false);
  };

  const handleAction = async (request, action) => {
    if (!window.confirm(`Are you sure you want to ${action.toUpperCase()} this request for ${request.diamonds} diamonds?`)) return;
    setProcessingId(request.id);
    
    try {
      // 1. Update request status
      const requestRef = doc(db, 'topup_requests', request.id);
      await setDoc(requestRef, { status: action, updatedAt: new Date() }, { merge: true });

      // 2. If approved, add diamonds to user
      if (action === 'approved') {
        // Getting user's current doc to update diamonds safely
        const userRef = doc(db, 'users', request.userId);
        // Note: Ideally this is done via a Cloud Function or runTransaction to prevent race conditions.
        // Doing a quick client-side merge for the dashboard.
        const { increment } = await import('firebase/firestore');
        await setDoc(userRef, { 
          diamonds: increment(request.diamonds),
          totalDiamondsPurchased: increment(request.diamonds) 
        }, { merge: true });

        // Create transaction record
        await setDoc(doc(db, 'coin_transactions', `manual_${request.id}`), {
          userId: request.userId,
          type: 'purchase',
          amount: request.diamonds,
          price: request.price,
          currency: 'LKR',
          status: 'completed',
          paymentMethod: 'manual_transfer',
          transactionId: request.id,
          timestamp: new Date()
        });
      }

      alert(`Request successfully ${action}!`);
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error(error);
      alert('Error processing request: ' + error.message);
    }
    setProcessingId(null);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Manual Top-Up Approvals</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0' }}>Review and approve user bank transfer receipts.</p>
        </div>
        <button onClick={fetchRequests} style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading pending requests...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {requests.map((req) => (
            <div key={req.id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#111827' }}>{req.diamonds?.toLocaleString()} 💎</span>
                <span style={{ fontWeight: 600, color: '#059669' }}>Rs {req.price}</span>
              </div>
              
              <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '16px' }}>
                <p style={{ margin: '4px 0' }}><strong>User ID:</strong> <span style={{ fontFamily: 'monospace' }}>{req.userId}</span></p>
                <p style={{ margin: '4px 0' }}><strong>Method:</strong> {req.paymentMethodName || 'Bank Transfer'}</p>
                <p style={{ margin: '4px 0' }}><strong>Date:</strong> {req.createdAt?.toDate().toLocaleString()}</p>
              </div>

              {req.receiptImageUrl ? (
                <div style={{ marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  <a href={req.receiptImageUrl} target="_blank" rel="noopener noreferrer">
                    <img src={req.receiptImageUrl} alt="Receipt" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                  </a>
                  <div style={{ padding: '8px', fontSize: '12px', textAlign: 'center', color: '#6b7280', background: '#f9fafb' }}>
                    Click image to view full receipt
                  </div>
                </div>
              ) : (
                <div style={{ width: '100%', height: '160px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', borderRadius: '8px' }}>
                  <span style={{ color: '#9ca3af' }}>No receipt attached</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleAction(req, 'rejected')}
                  disabled={processingId === req.id}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ef4444', background: 'white', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleAction(req, 'approved')}
                  disabled={processingId === req.id}
                  style={{ flex: 2, padding: '10px', borderRadius: '8px', border: 'none', background: '#10b981', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                >
                  {processingId === req.id ? 'Processing...' : 'Approve & Add 💎'}
                </button>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px', color: '#6b7280' }}>
              No pending top-up requests! 👏
            </div>
          )}
        </div>
      )}
    </div>
  );
}
