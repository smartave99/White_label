import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const requestHeaders = new Headers(request.headers);
    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    // Security Headers
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

    // Basic Path Protection (Server-Side)
    // Note: Since we use client-side Firebase Auth, we cannot easily verify the user token here without
    // setting a session cookie. This is a fallback that redirects if NO session cookies exist at all,
    // but for now we rely on the client-side AdminLayout protector for the main auth gate.
    // We can expand this to check for '__session' if we implement session cookies later.

    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Placeholder for future server-side token verification
        // const session = request.cookies.get('__session');
        // if (!session) return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    return response;
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
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
