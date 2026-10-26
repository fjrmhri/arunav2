"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    // Minta storage persisten agar data localStorage tidak dihapus otomatis
    // saat ruang penyimpanan HP menipis.
    if (navigator.storage?.persist) {
      void navigator.storage.persisted().then((persisted) => {
        if (!persisted) void navigator.storage.persist();
      });
    }

    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    void (async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (error) {
        console.error("Service worker registration failed:", error);
      }
    })();
  }, []);

  return null;
}
