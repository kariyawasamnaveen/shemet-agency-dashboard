import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                }),
                projectId: process.env.FIREBASE_PROJECT_ID || "dating-live-app-477af"
            });
        } else {
            // Fallback for build time or environments using Application Default Credentials
            admin.initializeApp({
                projectId: "dating-live-app-477af"
            });
        }
    } catch (error) {
        console.error('Firebase Admin Initialization Error:', error.stack);
    }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
