import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "arunav2",
    short_name: "arunav2",
    description:
      "Tracker program kebugaran, nutrisi, puasa 36 jam, suplemen, dan skincare berbasis bukti untuk pria di iklim tropis.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Daily Tracker",
        short_name: "Tracker",
        description: "Cek dan centang task hari ini",
        url: "/tracker",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Planner",
        short_name: "Planner",
        description: "Jadwal mingguan olahraga, nutrisi, dan skincare",
        url: "/planner",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Progress",
        short_name: "Progress",
        description: "Grafik completion dan streak",
        url: "/safety",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
