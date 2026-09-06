const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
// Note: This requires a service account key. 
// For this environment, we can assume the user has initialized firebase or we can try to use application default credentials.
try {
    admin.initializeApp({
        projectId: "dating-live-app-477af"
    });
} catch (e) {
    console.error("Firebase Admin initialization failed. Make sure you are logged in via firebase-tools or have a service account.");
    process.exit(1);
}

const db = admin.firestore();

async function promoteToAgent(email) {
    if (!email) {
        console.error("Please provide an email address.");
        return;
    }

    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        const uid = userRecord.uid;

        const userRef = db.collection('users').doc(uid);
        const userDoc = await userRef.get();

        const agencyId = `agency_${uid.substring(0, 5)}_${Date.now().toString().slice(-4)}`;

        const updateData = {
            isAgent: true,
            agencyId: agencyId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (!userDoc.exists) {
            console.log(`User document for ${email} does not exist. Creating new one...`);
            await userRef.set({
                uid,
                email,
                name: userRecord.displayName || 'Agent',
                ...updateData
            });
        } else {
            console.log(`Updating existing user document for ${email}...`);
            await userRef.update(updateData);
        }

        console.log(`✅ Success! User ${email} is now an Agent.`);
        console.log(`🔑 Assigned Agency ID: ${agencyId}`);
    } catch (error) {
        console.error("Error promoting user:", error.message);
    }
}

const targetEmail = process.argv[2];
promoteToAgent(targetEmail);
