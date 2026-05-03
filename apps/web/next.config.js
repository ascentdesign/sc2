/** @type {import('next').NextConfig} */
const nextConfig = {
  // Convex runs on its own dev server; no API routes needed in Next.js
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  transpilePackages: ["@stayclose/ui", "@stayclose/types"],
};

module.exports = nextConfig;
