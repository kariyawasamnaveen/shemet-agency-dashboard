const admin = require('firebase-admin');
const path = require('path');

/**
 * This script repairs Naveen's account by:
 * 1. Assigning a professional agencyId (SHNV01)
 * 2. Ensuring isAgent: true is set
 * 
 * Usage: node scripts/repair-naveen.js
 */

try {
    admin.initializeApp({
        projectId: "dating-live-app-477af"
    });
} catch (e) {
    if (e.code !== 'app/duplicate-app') {
        console.error("Firebase Admin initialization failed:", e.message);
        process.exit(1);
    }
}

const db = admin.firestore();

async function repairNaveen() {
    const targetEmail = "hknskariyawasamnaveen@gmail.com";
    console.log(`🔍 Searching for account: ${targetEmail}...`);

    try {
        const snapshot = await db.collection('users')
            .where('email', '==', targetEmail)
            .get();

        if (snapshot.empty) {
            console.log("❌ User not found with that email!");
            return;
        }

        const userDoc = snapshot.docs[0];
        const currentData = userDoc.data();
        
        // Use a professional ID instead of the long UID string
        const NEW_AGENCY_ID = "SHNV01";

        console.log(`🛠️ Repairing privileges for ${currentData.name || 'Naveen'}...`);
        console.log(`   Old agencyId: ${currentData.agencyId || 'None'}`);
        console.log(`   New agencyId: ${NEW_AGENCY_ID}`);

        await userDoc.ref.update({
            isAgent: true,
            isAdmin: true, // ENSURE ADMIN ACCESS
            agencyId: NEW_AGENCY_ID,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log("\n✅ SUCCESS! Your account has been repaired.");
        console.log("-----------------------------------------");
        console.log("You may need to Sign Out and Sign In again on the dashboard to refresh your session.");

    } catch (error) {
        console.error("❌ Repair failed:", error);
    }
}

repairNaveen();
