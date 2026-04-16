// ============================================================
// FIREBASE APP INIT — arunav2
// Lazy-init: hanya aktif jika env vars Firebase diisi.
// ============================================================

import type { FirebaseApp } from "firebase/app";

export const firebaseClientConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY            ?? "",
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN        ?? "",
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID         ?? "",
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID             ?? "",
} as const;

/** True jika semua env vars Firebase sudah diisi (bukan placeholder). */
export function isFcmConfigured(): boolean {
  const { apiKey, messagingSenderId, projectId } = firebaseClientConfig;
  return !!(
    apiKey &&
    apiKey !== "your_api_key_here" &&
    !apiKey.startsWith("YOUR_") &&
    messagingSenderId &&
    projectId
  );
}

let _cachedApp: FirebaseApp | null = null;

/** Mengembalikan Firebase App instance (singleton). Null jika tidak dikonfigurasi. */
export async function getFirebaseApp(): Promise<FirebaseApp | null> {
  if (!isFcmConfigured()) return null;
  if (_cachedApp) return _cachedApp;

  try {
    const { initializeApp, getApps, getApp } = await import("firebase/app");
    _cachedApp = getApps().length > 0 ? getApp() : initializeApp(firebaseClientConfig);
    return _cachedApp;
  } catch (err) {
    console.warn("[Firebase] initializeApp gagal:", err);
    return null;
  }
}
