const admin = require('firebase-admin');

// 1. Initialize Firebase Admin
// Make sure you have the environment variable GOOGLE_APPLICATION_CREDENTIALS set
// or it will try to use the default credentials if you are on a logged-in machine.
try {
    admin.initializeApp({
        projectId: "dating-live-app-477af"
    });
} catch (e) {
    console.error("Firebase Admin initialization failed:", e.message);
    process.exit(1);
}

const db = admin.firestore();

async function migrateAgents() {
    console.log("🔍 Starting migration for agents missing agencyId...");

    try {
        const snapshot = await db.collection('users')
            .where('isAgent', '==', true)
            .get();

        if (snapshot.empty) {
            console.log("✅ No agents found.");
            return;
        }

        let migratedCount = 0;
        let skippedCount = 0;

        for (const userDoc of snapshot.docs) {
            const data = userDoc.data();

            // Check if agencyId already exists
            if (data.agencyId) {
                skippedCount++;
                continue;
            }

            // Generate unique agencyId
            const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
            const agencyId = `SH${randomPart}`;

            console.log(`🛠️ Assigning ${agencyId} to ${data.name || data.phoneNumber || userDoc.id}`);

            await userDoc.ref.update({
                agencyId: agencyId,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            migratedCount++;
        }

        console.log("\n--- Migration Summary ---");
        console.log(`✅ Successfully migrated: ${migratedCount}`);
        console.log(`⏩ Skipped (already had ID): ${skippedCount}`);
        console.log("-------------------------\n");

    } catch (error) {
        console.error("❌ Migration failed:", error);
    }
}

migrateAgents();
