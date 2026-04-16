// ============================================================
// SERVICE WORKER — arunav2
// v2: tambah Firebase Cloud Messaging untuk background push
// ============================================================

// ── Firebase Messaging (opsional, gagal gracefully jika tidak dikonfigurasi) ──
let _fcmReady = false;
try {
  importScripts(
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js",
  );
  importScripts(
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js",
  );
  importScripts("/firebase-sw-config.js");

  const _cfg = self.FIREBASE_SW_CONFIG;
  if (_cfg && _cfg.apiKey && !_cfg.apiKey.startsWith("YOUR_")) {
    if (!firebase.apps.length) {
      firebase.initializeApp(_cfg);
    }
    const _messaging = firebase.messaging();

    _messaging.onBackgroundMessage((payload) => {
      const title = payload.notification?.title ?? "arunav2";
      const body = payload.notification?.body ?? "";
      const icon = payload.notification?.icon ?? "/icon-192.png";
      const urlData = payload.data?.url ?? "/";

      self.registration.showNotification(title, {
        body,
        icon,
        badge: "/icon-192.png",
        tag: payload.collapseKey ?? "fcm-push",
        data: { url: urlData, ...payload.data },
        // @ts-ignore
        actions: [{ action: "open_tracker", title: "Buka Tracker" }],
      });
    });

    _fcmReady = true;
    console.log("[SW] Firebase Messaging aktif (background push siap).");
  }
} catch (err) {
  console.warn("[SW] Firebase Messaging tidak tersedia:", err);
}

// ── Cache config (bumped ke v2 untuk force-update) ──────────
const STATIC_CACHE = "arunav2-static-v2";
const PAGE_CACHE = "arunav2-pages-v2";
const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

// ── Install ──────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

// ── Activate ─────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== PAGE_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ── Fetch ────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(PAGE_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          return cachedPage || caches.match("/");
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (!response.ok) return response;

        const copy = response.clone();
        caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
        return response;
      });
    }),
  );
});

// ── Notification click ───────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    event.action === "open_tracker"
      ? "/tracker"
      : event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});
