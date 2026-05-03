"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import Script from "next/script";
import { ReactNode } from "react";

// Initialize with a dummy URL if not set (for build time, will be replaced at runtime)
const convexUrl =
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://dummy.convex.cloud";
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isValidClerkKey = clerkKey && clerkKey.startsWith("pk_");

const convex = new ConvexReactClient(convexUrl as string);

// Service Worker Script component
function ServiceWorkerScript() {
  return (
    <Script
      id="register-sw"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(
                function(registration) {
                  console.log('[SW] Service Worker registered:', registration.scope);
                },
                function(err) {
                  console.log('[SW] Service Worker registration failed:', err);
                }
              );
            });
          }
        `,
      }}
    />
  );
}

// Simple wrapper for local dev without Clerk
function SimpleProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ServiceWorkerScript />
    </>
  );
}

export function ClientProviders({ children }: { children: ReactNode }) {
  // If no valid Clerk key, run without authentication (for local dev)
  if (!isValidClerkKey) {
    console.warn(
      "[StayClose] Running without Clerk authentication (local dev mode)",
    );
    return <SimpleProviders>{children}</SimpleProviders>;
  }

  return (
    <ClerkProvider publishableKey={clerkKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
        <ServiceWorkerScript />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
