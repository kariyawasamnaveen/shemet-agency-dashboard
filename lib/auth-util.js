import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Maps a phone number to its corresponding synthetic email address used for Firebase Auth.
 */
export const getSyntheticEmail = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const email = `${cleanPhone}@shemet.agency`;
    console.log("!!! FLOW DEBUG !!! [AUTH_UTIL] Generated Email:", email);
    return email;
};

/**
 * Robust phone number resolution for Agency Login.
 */
export const resolvePhoneNumber = async (identifier) => {
    console.log("!!! FLOW DEBUG !!! [AUTH_UTIL] START resolving:", identifier);
    const cleaned = identifier.replace(/\D/g, '');

    // 1. If it looks like a phone number (9+ digits), try suffix matching
    if (cleaned.length >= 9) {
        const last9 = cleaned.slice(-9);
        console.log("!!! FLOW DEBUG !!! [AUTH_UTIL] Phone detected. Searching suffix:", last9);
        
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("isAgent", "==", true));
            const snap = await getDocs(q);
            console.log("!!! FLOW DEBUG !!! [AUTH_UTIL] Checking", snap.size, "registered agents...");
            
            let foundPhone = null;
            snap.forEach(doc => {
                const storedPhone = (doc.data().phoneNumber || "").replace(/\D/g, '');
                if (storedPhone && storedPhone.endsWith(last9)) {
                    foundPhone = storedPhone;
                }
            });

            if (foundPhone) {
                console.log("!!! FLOW DEBUG !!! [AUTH_UTIL] SUCCESS! Found registered phone:", foundPhone);
                return foundPhone;
            } else {
                console.warn("!!! FLOW DEBUG !!! [AUTH_UTIL] Suffix NOT FOUND in Firestore.");
            }
        } catch (err) {
            console.error("!!! FLOW DEBUG !!! [AUTH_UTIL] Firestore SEARCH ERROR:", err);
        }
    }

    // 2. Try as nickname/username
    console.log("!!! FLOW DEBUG !!! [AUTH_UTIL] Searching by exact Name:", identifier);
    const qName = query(collection(db, "users"), where("name", "==", identifier), where("isAgent", "==", true));
    const nameSnap = await getDocs(qName);
    
    if (!nameSnap.empty) {
        const data = nameSnap.docs[0].data();
        const resolved = (data.phoneNumber || "").replace(/\D/g, '');
        console.log("!!! FLOW DEBUG !!! [AUTH_UTIL] SUCCESS! Found by name. Phone:", resolved);
        return resolved;
    }

    // 3. Fallback: manual case-insensitive scan (for debug/edge cases)
    console.log("!!! FLOW DEBUG !!! [AUTH_UTIL] Trying case-insensitive manual scan...");
    const qAll = query(collection(db, "users"), where("isAgent", "==", true), limit(50));
    const allSnap = await getDocs(qAll);
    let manualMatch = null;
    allSnap.forEach(doc => {
        if (doc.data().name?.toLowerCase() === identifier.toLowerCase()) {
            manualMatch = doc.data().phoneNumber?.replace(/\D/g, '');
        }
    });

    if (manualMatch) {
        console.log("!!! FLOW DEBUG !!! [AUTH_UTIL] SUCCESS! Found via manual scan:", manualMatch);
        return manualMatch;
    }

    // 4. Final resort: just return cleaned input if it's long enough
    if (cleaned.length >= 10) {
        console.log("!!! FLOW DEBUG !!! [AUTH_UTIL] LAST RESORT: Using cleaned input:", cleaned);
        return cleaned;
    }

    console.error("!!! FLOW DEBUG !!! [AUTH_UTIL] FAILED TO RESOLVE:", identifier);
    return null;
};
