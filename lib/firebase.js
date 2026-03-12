import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
// Extracted from google-services.json
const firebaseConfig = {
    apiKey: "AIzaSyAzXH0KH0UzjOt2AERgaX4SVNS6OGWygCY",
    authDomain: "dating-live-app-477af.firebaseapp.com",
    projectId: "dating-live-app-477af",
    storageBucket: "dating-live-app-477af.firebasestorage.app",
    messagingSenderId: "351905956852",
    appId: "1:351905956852:web:pending_id" // Web App ID is optional for Auth/Firestore usually
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, app };
