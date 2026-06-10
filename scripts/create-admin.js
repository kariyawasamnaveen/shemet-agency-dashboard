const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: "dating-live-app-477af"
    });
} catch (e) {
    console.error("Failed to initialize Firebase Admin:", e);
    process.exit(1);
}

const db = admin.firestore();

async function createAdmin() {
    const email = "admin@shemet.com";
    const password = "password123";

    try {
        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(email);
            console.log("User already exists. Updating password...");
            await admin.auth().updateUser(userRecord.uid, { password });
        } catch (e) {
            if (e.code === 'auth/user-not-found') {
                userRecord = await admin.auth().createUser({
                    email,
                    password,
                    displayName: "Super Admin",
                });
                console.log("User created successfully!");
            } else {
                throw e;
            }
        }

        const uid = userRecord.uid;
        const agencyId = `admin_${uid.substring(0, 5)}_${Date.now().toString().slice(-4)}`;

        const userRef = db.collection('users').doc(uid);
        
        await userRef.set({
            uid,
            email,
            name: 'Super Admin',
            isAgent: true,
            isAdmin: true,
            agencyId: agencyId,
            role: 'agent',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`✅ Success! Admin account created.`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (error) {
        console.error("Error creating Admin:", error.message);
    }
}

createAdmin();
