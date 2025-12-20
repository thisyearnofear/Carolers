import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/events(.*)',
  '/api/events(.*)',
  '/api/messages(.*)',
  '/api/contributions(.*)',
  '/api/carols(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect specific routes
  if (isProtectedRoute(request)) {
    await auth().protect();
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Block suspicious RSC-related paths
  const url = request.nextUrl;
  const suspiciousPatterns = [
    '__rsc',
    'server-components',
    'react-server',
    'rsc-payload',
  ];

  if (suspiciousPatterns.some(pattern => url.pathname.includes(pattern))) {
    console.warn(`Blocked suspicious RSC request: ${url.pathname}`);
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Validate Content-Type for POST requests
  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      return new NextResponse('Invalid Content-Type', { status: 415 });
    }
  }

  return response;
}, { debug: process.env.NODE_ENV === 'development' });

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
