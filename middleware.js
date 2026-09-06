import { NextResponse } from 'next/server';

// These paths require the user to have valid agency/admin credentials
const protectedPaths = ['/dashboard', '/admin', '/economy', '/users'];

export function middleware(request) {
    const { pathname } = request.nextUrl;
    
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path)) || pathname === '/';
    const isAuthPage = pathname.startsWith('/login') || pathname === '/register';

    if (!isProtectedPath && !isAuthPage) {
        return NextResponse.next();
    }

    const sessionCookie = request.cookies.get('__session');

    if (!sessionCookie && isProtectedPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (sessionCookie) {
        try {
            const session = JSON.parse(sessionCookie.value);
            
            // If logged in, redirect away from auth pages to dashboard
            if (isAuthPage) {
                return NextResponse.redirect(new URL('/', request.url));
            }

            // Check admin paths
            const isAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/economy') || pathname.startsWith('/users');
            if (isAdminPath && !session.hasAdminPrivs) {
                console.error(`[MIDDLEWARE] SECURITY BREACH: Non-admin ${session.email} attempted to access ${pathname}. Blocking.`);
                return NextResponse.redirect(new URL('/', request.url));
            }

            // Must be agent or admin to access dashboard
            if (!session.isAgent && !session.hasAdminPrivs) {
                return NextResponse.redirect(new URL('/login', request.url));
            }

        } catch (err) {
            // Invalid session cookie
            console.error('[MIDDLEWARE] Invalid session cookie:', err);
            if (isProtectedPath) {
                const response = NextResponse.redirect(new URL('/login', request.url));
                response.cookies.delete('__session');
                return response;
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|shemet-logo.png|.*\\.png$).*)',
    ],
};
