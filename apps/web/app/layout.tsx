import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import Script from "next/script";
import "./globals.css";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#e94560",
};

export const metadata: Metadata = {
  title: "StayClose — Maintain Meaningful Connections",
  description: "StayClose helps you maintain meaningful connections with the people you care about. One friend per day, one reach-out at a time.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
      { url: "/icons/icon-512x512.png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
    ],
  },
  applicationName: "StayClose",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "StayClose",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://stayclose.app",
    title: "StayClose — Maintain Meaningful Connections",
    description: "One friend per day, one reach-out at a time.",
    siteName: "StayClose",
  },
  twitter: {
    card: "summary_large_image",
    title: "StayClose — Maintain Meaningful Connections",
    description: "One friend per day, one reach-out at a time.",
  },
};

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <html lang="en" dir="ltr">
          <body className="min-h-screen bg-background font-sans antialiased">
            {children}
            <ServiceWorkerScript />
          </body>
        </html>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
