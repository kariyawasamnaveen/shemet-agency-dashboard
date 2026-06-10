const admin = require('firebase-admin');

try {
    admin.initializeApp({
        projectId: "dating-live-app-477af"
    });
} catch (e) {
    console.error("Firebase Admin initialization failed:", e.message);
    process.exit(1);
}

const db = admin.firestore();

async function verifyAgents() {
    console.log("🔍 Verifying Agents...");

    try {
        const snapshot = await db.collection('users')
            .where('isAgent', '==', true)
            .get();

        const agents = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name || 'No Name',
            agencyId: doc.data().agencyId || 'MISSING'
        }));

        console.table(agents);

        const missing = agents.filter(a => a.agencyId === 'MISSING').length;
        if (missing === 0) {
            console.log("✅ All agents have a valid agencyId!");
        } else {
            console.log(`⚠️ ${missing} agents are still missing agencyId.`);
        }

    } catch (error) {
        console.error("❌ Verification failed:", error);
    }
}

verifyAgents();
