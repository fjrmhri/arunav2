// ============================================================
// FCM UTILITIES — arunav2
// Mengelola FCM token: request, simpan, ambil.
// Semua fungsi aman dipanggil tanpa Firebase dikonfigurasi.
// ============================================================

import type { Messaging } from "firebase/messaging";
import { getFirebaseApp, isFcmConfigured } from "@/lib/firebase-app";

const FCM_TOKEN_KEY   = "arunav2_fcm_token";
const VAPID_KEY       = process.env.NEXT_PUBLIC_FCM_VAPID_KEY ?? "";

let _messagingInstance: Messaging | null = null;

async function getMessagingInstance(): Promise<Messaging | null> {
  if (!isFcmConfigured() || typeof window === "undefined") return null;
  if (_messagingInstance) return _messagingInstance;

  const app = await getFirebaseApp();
  if (!app) return null;

  try {
    const { getMessaging } = await import("firebase/messaging");
    _messagingInstance = getMessaging(app);
    return _messagingInstance;
  } catch (err) {
    console.warn("[FCM] getMessaging gagal:", err);
    return null;
  }
}

/**
 * Minta FCM token menggunakan service worker yang sudah terdaftar (sw.js).
 * Menyimpan token ke localStorage jika berhasil.
 * @returns token string atau null jika tidak bisa
 */
export async function requestFcmToken(): Promise<string | null> {
  if (!VAPID_KEY || !VAPID_KEY.startsWith("B")) {
    console.warn("[FCM] VAPID key belum diisi di .env.local");
    return null;
  }
  if (!isFcmConfigured()) return null;
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;

  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    const { getToken } = await import("firebase/messaging");

    // Gunakan sw.js yang sudah terdaftar — tidak buat SW baru
    const swReg = await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (token) {
      storeFcmToken(token);
      console.log("[FCM] Token berhasil didapat dan disimpan.");
    }

    return token ?? null;
  } catch (err) {
    console.warn("[FCM] requestFcmToken gagal:", err);
    return null;
  }
}

/** Simpan FCM token ke localStorage. */
export function storeFcmToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(FCM_TOKEN_KEY, token);
}

/** Ambil FCM token yang tersimpan. Null jika belum ada. */
export function getStoredFcmToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(FCM_TOKEN_KEY);
}

/**
 * Pasang handler untuk pesan FCM saat aplikasi di foreground.
 * No-op jika Firebase tidak dikonfigurasi.
 */
export async function setupForegroundMessageHandler(
  onMsg: (payload: unknown) => void,
): Promise<void> {
  const messaging = await getMessagingInstance();
  if (!messaging) return;

  const { onMessage } = await import("firebase/messaging");
  onMessage(messaging, onMsg);
}
