'use client';

import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * A wrapper around useUser that handles the case where Clerk is not configured.
 * This prevents the "useUser can only be used within the <ClerkProvider />" error.
 */
export function useSafeUser() {
    const [isClerkAvailable, setIsClerkAvailable] = useState<boolean | null>(null);

    useEffect(() => {
        // Check if Clerk is globally available (injected by ClerkProvider)
        // Clerk adds various things to window, but the most reliable way 
        // to check for the Provider without crashing is checking for the existence 
        // of the Publishable Key in the environment or the __clerk_js_version
        const hasKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
        setIsClerkAvailable(hasKey);
    }, []);

    // We still can't call useUser() unconditionally if we want to avoid the crash
    // in environments where ClerkProvider is physically missing.

    // However, in our RootLayout, we conditionally render ClerkProvider.
    // If we don't render ClerkProvider, useUser() WILL throw.

    // So we use a "dummy" return if the key is missing.
    if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        return {
            isSignedIn: false,
            user: null,
            isLoaded: true,
            isClerkDisabled: true
        };
    }

    // If we are here, we assume ClerkProvider is present (based on RootLayout logic)
    // But we still wrap it in a try-catch just in case of weird race conditions
    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const clerk = useUser();
        return { ...clerk, isClerkDisabled: false };
    } catch (e) {
        return {
            isSignedIn: false,
            user: null,
            isLoaded: true,
            isClerkDisabled: true
        };
    }
}
