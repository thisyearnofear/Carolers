import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
// Cache bust: Sat Dec 20 13:57:11 EAT 2025
// Cache bust: Sat Dec 20 14:12:31 EAT 2025
