'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAgency } from '../../context/AgencyContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

const defaultGifts = [
  // Classic
  { id: 'cucumber', name: 'Cucumber', priceDiamonds: 1, category: 'Classic', emoji: '🥒', isActive: true },
  { id: 'strawberry', name: 'Strawberry', priceDiamonds: 1, category: 'Classic', emoji: '🍓', isActive: true },
  { id: 'rose', name: 'Rose', priceDiamonds: 1, category: 'Classic', emoji: '🌹', isActive: true },
  { id: 'heart', name: 'Heart', priceDiamonds: 5, category: 'Classic', emoji: '❤️', isActive: true },
  { id: 'mic', name: 'Mic', priceDiamonds: 9, category: 'Classic', emoji: '🎤', isActive: true },
  { id: 'flower', name: 'Flower', priceDiamonds: 15, category: 'Classic', emoji: '🌸', isActive: true },
  { id: 'chocolate', name: 'Choco', priceDiamonds: 29, category: 'Classic', emoji: '🍫', isActive: true },
  { id: 'kiss', name: 'Kiss', priceDiamonds: 49, category: 'Classic', emoji: '💋', isActive: true },
  { id: 'bear', name: 'Bear', priceDiamonds: 79, category: 'Classic', emoji: '🧸', isActive: true },
  { id: 'doughnut', name: 'Doughnut', priceDiamonds: 99, category: 'Classic', emoji: '🍩', isActive: true },
  // Popular
  { id: 'ring', name: 'Ring', priceDiamonds: 199, category: 'Popular', emoji: '💍', isActive: true },
  { id: 'sunglasses', name: 'Sunnies', priceDiamonds: 299, category: 'Popular', emoji: '👓', isActive: true },
  { id: 'crown_legacy', name: 'Crown', priceDiamonds: 399, category: 'Popular', emoji: '👑', isActive: true },
  { id: 'diamond_ring', name: 'Dia. Ring', priceDiamonds: 499, category: 'Popular', emoji: '💍', isActive: true },
  { id: 'handbag', name: 'Handbag', priceDiamonds: 699, category: 'Popular', emoji: '👜', isActive: true },
  { id: 'car_classic', name: 'Car', priceDiamonds: 899, category: 'Popular', emoji: '🏎️', isActive: true },
  { id: 'jewel_crown', name: 'Royal Crown', priceDiamonds: 999, category: 'Popular', emoji: '👑', isActive: true },
  { id: 'balloons', name: 'Balloons', priceDiamonds: 1299, category: 'Popular', emoji: '🎈', isActive: true },
  { id: 'fireworks', name: 'Fireworks', priceDiamonds: 1999, category: 'Popular', emoji: '🎆', isActive: true },
  // Luxury
  { id: 'motorcycle', name: 'Motorcycle', priceDiamonds: 2999, category: 'Luxury', emoji: '🛵', isActive: true },
  { id: 'rocket_legacy', name: 'Rocket', priceDiamonds: 4999, category: 'Luxury', emoji: '🚀', isActive: true },
  { id: 'sports_car', name: 'Sports Car', priceDiamonds: 6999, category: 'Luxury', emoji: '🏎️', isActive: true },
  { id: 'yacht_luxury', name: 'Yacht', priceDiamonds: 9999, category: 'Luxury', emoji: '🛥️', isActive: true },
  { id: 'carousel', name: 'Carousel', priceDiamonds: 14999, category: 'Luxury', emoji: '🎠', isActive: true },
  { id: 'dragon_legacy', name: 'Dragon', priceDiamonds: 19999, category: 'Luxury', emoji: '🐲', isActive: true },
  { id: 'private_jet', name: 'Pvt Jet', priceDiamonds: 29999, category: 'Luxury', emoji: '✈️', isActive: true },
  // Exclusive
  { id: 'jet_legacy', name: 'Super Jet', priceDiamonds: 49999, category: 'Exclusive', emoji: '✈️', isActive: true },
  { id: 'castle', name: 'Castle', priceDiamonds: 79999, category: 'Exclusive', emoji: '🏰', isActive: true },
  { id: 'yacht_super', name: 'Super Yacht', priceDiamonds: 99999, category: 'Exclusive', emoji: '🛥️', isActive: true },
  { id: 'rocket_space', name: 'Space Rocket', priceDiamonds: 149999, category: 'Exclusive', emoji: '🚀', isActive: true },
  { id: 'island_legacy', name: 'Island', priceDiamonds: 199999, category: 'Exclusive', emoji: '🏝️', isActive: true },
  { id: 'golden_dragon', name: 'Gold Dragon', priceDiamonds: 299999, category: 'Exclusive', emoji: '🐉', isActive: true },
  { id: 'phoenix', name: 'Phoenix', priceDiamonds: 499999, category: 'Exclusive', emoji: '🦅', isActive: true },
  { id: 'planet_legacy', name: 'Planet', priceDiamonds: 999999, category: 'Exclusive', emoji: '🪐', isActive: true },
];

export default function GiftsManagementPage() {
  const { agent, loading: authLoading } = useAgency();
  const router = useRouter();
  const isSuperAdmin = agent?.email === 'hknskariyawasamnaveen@gmail.com';

  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    if (!authLoading && !isSuperAdmin) {
      router.push('/');
    }
  }, [isSuperAdmin, authLoading, router]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchGifts();
    }
  }, [isSuperAdmin]);

  const fetchGifts = async () => {
    if (!isSuperAdmin) return;
    setLoading(true);
    try {
      const gQuery = await getDocs(collection(db, 'gifts'));
      const list = gQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGifts(list);
    } catch (error) {
      console.error('Error fetching gifts:', error);
    }
    setLoading(false);
  };

  const handleSeedGifts = async () => {
    if (!window.confirm("This will upload all 34 Chamet-style gifts to the Database. Continue?")) return;
    setSeeding(true);
    try {
      const batch = writeBatch(db);
      defaultGifts.forEach((gift) => {
        const docRef = doc(db, 'gifts', gift.id);
        batch.set(docRef, gift, { merge: true });
      });
      await batch.commit();
      alert("Gifts successfully populated!");
      fetchGifts();
    } catch (e) {
      alert("Error seeding gifts: " + e.message);
    }
    setSeeding(false);
  };

  const toggleGiftStatus = async (giftId, currentStatus) => {
    try {
      await setDoc(doc(db, 'gifts', giftId), { isActive: !currentStatus }, { merge: true });
      fetchGifts();
    } catch (e) {
      alert('Error updating status');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Gifts Catalog</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0' }}>Manage virtual gifts, prices, and categories.</p>
        </div>
        <div>
          {gifts.length === 0 && !loading && (
            <button
              onClick={handleSeedGifts}
              disabled={seeding}
              style={{
                backgroundColor: '#10b981', color: 'white', padding: '10px 16px', borderRadius: '8px', 
                border: 'none', cursor: 'pointer', fontWeight: 'bold', marginRight: '12px'
              }}
            >
              {seeding ? 'Seeding...' : 'Populate Standard Gifts'}
            </button>
          )}
          <button style={{
            backgroundColor: '#4f46e5', color: 'white', padding: '10px 16px', borderRadius: '8px', 
            border: 'none', cursor: 'pointer', fontWeight: 'bold'
          }}>
            + Add Custom Gift
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading catalog...</p>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: '#f9fafb', fontSize: '13px', color: '#4b5563', textTransform: 'uppercase' }}>
              <tr>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>Icon</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>Name / ID</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>Category</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>Price (💎)</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {gifts.sort((a,b) => a.priceDiamonds - b.priceDiamonds).map((gift) => (
                <tr key={gift.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontSize: '24px' }}>
                    {gift.iconUrl ? <img src={gift.iconUrl} alt="icon" style={{width: 32, height: 32}} /> : gift.emoji}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500, color: '#111827' }}>{gift.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{gift.id}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', 
                      fontWeight: 600, color: '#4b5563' 
                    }}>
                      {gift.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#d97706' }}>
                    {gift.priceDiamonds?.toLocaleString()} 💎
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button 
                      onClick={() => toggleGiftStatus(gift.id, gift.isActive)}
                      style={{
                        padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
                        backgroundColor: gift.isActive ? '#d1fae5' : '#fee2e2',
                        color: gift.isActive ? '#065f46' : '#991b1b',
                      }}
                    >
                      {gift.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button style={{ color: '#4f46e5', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer' }}>Edit</button>
                  </td>
                </tr>
              ))}
              {gifts.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                    No gifts found. Click "Populate Standard Gifts" to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
