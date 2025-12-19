import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ClerkProvider } from '@clerk/clerk-react';
import { router } from "./router";
import "./index.css";

// CLEAN: Centralized environment configuration
const clerkPK = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPK) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={clerkPK}>
    <RouterProvider router={router} />
  </ClerkProvider>
);
