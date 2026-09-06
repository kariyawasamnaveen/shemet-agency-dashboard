import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Handle Polar Webhooks (e.g. order.paid)
 * Documentation: https://docs.polar.sh/webhooks
 */
export async function POST(request) {
    const payload = await request.json();
    
    // 1. Verify Webhook Signature (Recommended for production)
    // const signature = request.headers.get('x-polar-signature');
    // ... verification logic ...

    const { type, data } = payload;

    if (type === 'order.paid') {
        const { metadata, amount } = data;
        const userId = metadata?.userId;
        
        // Map Polar amount to Diamonds
        // (Roughly 1 USD = 2000 Diamonds based on your pricing logic)
        const diamondCount = Math.floor((amount / 100) * 2000); 

        if (userId) {
            try {
                // 2. Credit Diamonds to the User in Firestore
                const userRef = doc(db, 'users', userId);
                await updateDoc(userRef, {
                    diamonds: increment(diamondCount),
                });

                // 3. Log the Transaction
                await addDoc(collection(db, 'transactions'), {
                    userId: userId,
                    type: 'deposit',
                    currency: 'diamonds',
                    amount: diamondCount,
                    source: 'polar.sh',
                    polarOrderId: data.id,
                    timestamp: serverTimestamp(),
                });

                console.log(`Successfully credited ${diamondCount} diamonds to user ${userId}`);
            } catch (err) {
                console.error('Webhook Credit Error:', err);
                return NextResponse.json({ error: 'Failed to credit user' }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ received: true });
}
