import { clerkMiddleware } from '@clerk/nextjs/server';

// Next.js 16 proxy replacement for deprecated middleware.ts
// Mirrors previous behavior: apply Clerk middleware to all routes except static/image/favicon
export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
