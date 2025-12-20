import './globals.css';
import type { Metadata } from 'next';
import { Berkshire_Swash, Lato } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { QueryProvider } from '@/providers/query-provider';
import { Toaster } from './components/ui/toaster';

const displayFont = Berkshire_Swash({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display'
});

const sansFont = Lato({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-sans'
});

import { Navbar } from './components/navbar';

export const metadata: Metadata = {
  title: 'Carolers | Join the Festive Chorus 🎄',
  description: 'Connect with caroling groups, vote on your favorite festive songs, and celebrate the season together.',
  icons: {
    icon: '/favicon.svg',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${displayFont.variable} ${sansFont.variable}`}>
        <body className="font-sans antialiased">
          <QueryProvider>
            <Navbar />
            <main className="pt-16 min-h-screen">
              {children}
            </main>
            <Toaster />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}