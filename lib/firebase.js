import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAzXH0KH0UzjOt2AERgaX4SVNS6OGWygCY",
    authDomain: "dating-live-app-477af.firebaseapp.com",
    projectId: "dating-live-app-477af",
    storageBucket: "dating-live-app-477af.firebasestorage.app",
    messagingSenderId: "351905956852",
    appId: "1:351905956852:web:9835da2a1db9a4945a2fa1"
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage, app };
