import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request) {
    try {
        const body = await request.json();
        const { idToken } = body;

        if (!idToken) {
            return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
        }

        // 1. Verify the ID token securely server-side
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const email = decodedToken.email;

        // 2. Fetch the actual user document from Firestore securely
        const userDoc = await adminDb.collection('users').doc(uid).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        // 3. Determine permissions based on verified server data
        const isSuperAdmin = email === 'hknskariyawasamnaveen@gmail.com';
        const hasAdminPrivs = isSuperAdmin || userData.isAdmin === true;
        const isAgent = userData.isAgent === true;

        if (!isAgent && !isSuperAdmin) {
            return NextResponse.json({ error: 'Access denied: not an agent' }, { status: 403 });
        }

        // 4. Create the session payload
        const sessionPayload = JSON.stringify({ 
            uid, 
            email, 
            role: userData.role || 'agent', 
            isSuperAdmin, 
            isAdmin: userData.isAdmin || false, 
            isAgent, 
            hasAdminPrivs 
        });

        const response = NextResponse.json({ success: true }, { status: 200 });

        response.cookies.set('__session', sessionPayload, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Session Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true }, { status: 200 });
    response.cookies.delete('__session');
    return response;
}
