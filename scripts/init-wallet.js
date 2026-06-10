const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function initWallet() {
    const username = 'naveen';
    console.log(`Searching for user: ${username}`);

    const snapshot = await db.collection('users').where('username', '==', username).get();
    
    if (snapshot.empty) {
        console.error('User not found!');
        return;
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    // Calculate initial wallet balance from diamonds (60% rate as discussed)
    const diamonds = userData.diamonds || 0;
    const initialBalance = (diamonds * 0.6) / 100;

    console.log(`Found user: ${userDoc.id}. Initial balance from diamonds: $${initialBalance}`);

    await userDoc.ref.update({
        walletBalanceUSD: initialBalance,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ Wallet initialized for master account.');
}

initWallet().catch(console.error);
