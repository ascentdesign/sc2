import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StayClose — Maintain Meaningful Connections",
    short_name: "StayClose",
    description: "One friend per day, one reach-out at a time. StayClose helps you nurture the relationships that matter most.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#e94560",
    orientation: "portrait",
    scope: "/",
    id: "/",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Today's Friend",
        short_name: "Today",
        description: "View who needs your attention today",
        url: "/dashboard",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Your Circle",
        short_name: "Circle",
        description: "View all your friends",
        url: "/circle",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Add Friend",
        short_name: "Add",
        description: "Add a new friend to your circle",
        url: "/friends/new",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
    categories: ["lifestyle", "social", "productivity"],
    lang: "en",
    dir: "ltr",
  };
}
