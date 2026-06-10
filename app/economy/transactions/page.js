'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAgency } from '../../context/AgencyContext';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';

export default function TransactionsLedgerPage() {
  const { agent, loading: authLoading } = useAgency();
  const router = useRouter();
  const isSuperAdmin = agent?.email === 'hknskariyawasamnaveen@gmail.com';

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      router.push('/');
    }
  }, [isSuperAdmin, authLoading, router]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchTransactions();
    }
  }, [isSuperAdmin]);

  const fetchTransactions = async (loadMore = false) => {
    if (!isSuperAdmin) return;
    if (!loadMore) setLoading(true);
    try {
      let q = query(
        collection(db, 'gift_transactions'),
        orderBy('timestamp', 'desc'),
        limit(20)
      );

      if (loadMore && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      
      if (loadMore) {
        setTransactions([...transactions, ...list]);
      } else {
        setTransactions(list);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Gift Transactions Ledger</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0' }}>Real-time feed of all gifts sent. Monitor the 60/40 revenue split.</p>
        </div>
        <button onClick={() => fetchTransactions(false)} style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
          Refresh
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f9fafb', fontSize: '13px', color: '#4b5563', textTransform: 'uppercase' }}>
            <tr>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>Time</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>Sender ➔ Receiver</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>Gift</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Diamonds (100%)</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#059669' }}>Host Beans (60%)</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#2563eb' }}>Platform Profit (40%)</th>
            </tr>
          </thead>
          <tbody>
            {loading && transactions.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center' }}>Loading transactions...</td></tr>
            ) : transactions.map((txn) => {
              const platformProfit = (txn.diamondsDeducted || 0) - (txn.beansEarned || 0);
              
              return (
                <tr key={txn.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280' }}>
                    {txn.timestamp?.toDate().toLocaleString() || 'Just now'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px' }}>
                    <div style={{ fontFamily: 'monospace', color: '#111827' }}>{txn.senderId?.slice(0, 8)}...</div>
                    <div style={{ color: '#9ca3af', fontSize: '16px', margin: '2px 0' }}>↓</div>
                    <div style={{ fontFamily: 'monospace', color: '#111827' }}>{txn.receiverId?.slice(0, 8)}...</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500 }}>{txn.giftName || txn.giftId}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>x{txn.quantity || 1}</div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#ef4444' }}>
                    -{txn.diamondsDeducted?.toLocaleString()} 💎
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#059669', backgroundColor: '#ecfdf5' }}>
                    +{txn.beansEarned?.toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#2563eb', backgroundColor: '#eff6ff' }}>
                    +{platformProfit.toLocaleString()}
                  </td>
                </tr>
              );
            })}
            {transactions.length === 0 && !loading && (
              <tr>
                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                  No gift transactions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {transactions.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => fetchTransactions(true)} 
            style={{ padding: '8px 24px', borderRadius: '20px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}
          >
            Load More Transactions
          </button>
        </div>
      )}
    </div>
  );
}
