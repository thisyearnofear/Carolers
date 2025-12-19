import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ClerkProvider } from '@clerk/clerk-react';
import { router } from "./router";
import "./index.css";
import { OnboardingWrapper } from './components/Onboarding';
import { useCelebration } from './components/Celebration';

// CLEAN: Centralized environment configuration
const clerkPK = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPK) {
  throw new Error("Missing Clerk Publishable Key");
}

// ENHANCEMENT FIRST: Set up celebration context
const { CelebrationContainer } = useCelebration();

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={clerkPK}>
    <OnboardingWrapper>
      <RouterProvider router={router} />
      <CelebrationContainer />
    </OnboardingWrapper>
  </ClerkProvider>
);
