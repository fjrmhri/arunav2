import type { Metadata, Viewport } from "next";
import { DM_Sans, Sora } from "next/font/google";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import "./globals.css";

// Self-hosted saat build oleh next/font (tanpa request ke Google saat runtime)
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });

export const metadata: Metadata = {
  title: "arunav2",
  applicationName: "arunav2",
  description: "Tracker program kebugaran, nutrisi, puasa 36 jam, dan skincare",
  manifest: "/manifest.webmanifest",
  // Aplikasi pribadi berisi data kesehatan: jangan diindeks mesin pencari
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "arunav2",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${sora.variable} ${dmSans.variable}`}>
      <body style={{ background: "var(--bg)", color: "var(--text-primary)" }}
            className="font-body antialiased min-h-screen">
        <ServiceWorkerRegister />
        <div className="relative max-w-md mx-auto min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
