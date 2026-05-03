import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ClientProviders } from "./providers";
import { HydrationSafe } from "./hydration-safe";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#e94560",
};

export const metadata: Metadata = {
  title: "StayClose — Maintain Meaningful Connections",
  description:
    "StayClose helps you maintain meaningful connections with the people you care about. One friend per day, one reach-out at a time.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192" },
      { url: "/icons/icon-512x512.png", sizes: "512x512" },
    ],
    apple: [{ url: "/icons/icon-192x192.png", sizes: "192x192" }],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClientProviders>
          <HydrationSafe>{children}</HydrationSafe>
        </ClientProviders>
      </body>
    </html>
  );
}
