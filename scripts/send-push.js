#!/usr/bin/env node
// ============================================================
// SEND FCM PUSH — arunav2
// Kirim push notification ke satu FCM token.
//
// PRASYARAT:
//   npm install firebase-admin   (install terpisah, bukan bagian package.json)
//   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
//
// PENGGUNAAN:
//   node scripts/send-push.js <FCM_TOKEN> [judul] [isi]
//
// MENDAPATKAN SERVICE ACCOUNT KEY:
//   Firebase Console > Project Settings > Service Accounts > Generate new private key
//
// MENDAPATKAN FCM TOKEN USER:
//   Token disimpan di localStorage key "arunav2_fcm_token"
//   Bisa diambil dari browser DevTools > Application > Local Storage
// ============================================================

const admin = require("firebase-admin");

const [, , fcmToken, title = "arunav2", body = "Notifikasi baru dari arunav2"] =
  process.argv;

if (!fcmToken) {
  console.error(
    "Usage: node scripts/send-push.js <FCM_TOKEN> [judul] [isi]\n" +
    "Pastikan GOOGLE_APPLICATION_CREDENTIALS sudah di-set."
  );
  process.exit(1);
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.warn(
    "[WARN] GOOGLE_APPLICATION_CREDENTIALS tidak ditemukan.\n" +
    "Set environment variable ke path service account JSON Anda."
  );
}

if (!admin.apps.length) {
  admin.initializeApp();
}

async function kirimPush() {
  /** @type {import('firebase-admin/messaging').Message} */
  const message = {
    token: fcmToken,
    notification: { title, body },
    webpush: {
      notification: {
        icon:  "/icon-192.png",
        badge: "/icon-192.png",
        actions: [{ action: "open_tracker", title: "Buka Tracker" }],
      },
      fcmOptions: { link: "/" },
    },
  };

  const response = await admin.messaging().send(message);
  console.log("✅ Push terkirim:", response);
}

kirimPush().catch((err) => {
  console.error("❌ Gagal kirim push:", err.message ?? err);
  process.exit(1);
});
