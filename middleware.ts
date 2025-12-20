import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// React2Shell protection middleware
const RSC_PROTECTION_HEADER = 'X-React2Shell-Protection';
const RSC_PROTECTION_VALUE = 'enabled';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add React2Shell protection header
  response.headers.set(RSC_PROTECTION_HEADER, RSC_PROTECTION_VALUE);
  
  // Additional security headers
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
    // Log the suspicious request
    console.warn(`Blocked suspicious RSC request: ${url.pathname}`);
    
    // Return 403 Forbidden
    return new NextResponse('Forbidden', { status: 403 });
  }
  
  // Validate Content-Type for POST requests
  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      // Only allow JSON content for POST requests to prevent RSC exploitation
      return new NextResponse('Invalid Content-Type', { status: 415 });
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};