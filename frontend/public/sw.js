/* Service worker PKKMB: cache aset statis (offline-friendly) + notifikasi push. */
const CACHE = "pkkmb-v2";
const ASSETS = ["/", "/jadwal", "/atribut", "/faq", "/brand/icon-192.png", "/brand/logo-pkkmb-mark.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);
  // Jangan pernah cache API/data pribadi
  if (request.method !== "GET" || url.pathname.startsWith("/api/") || url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/admin") || url.pathname.startsWith("/mentor")) return;
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/brand/") || url.pathname.startsWith("/images/")) {
    e.respondWith(caches.match(request).then((hit) => hit || fetch(request).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(request, copy)); return res; })));
    return;
  }
  if (request.mode === "navigate") {
    e.respondWith(fetch(request).catch(() => caches.match(request).then((hit) => hit || caches.match("/"))));
  }
});

self.addEventListener("push", (e) => {
  const data = e.data ? e.data.json() : { title: "PKKMB Tel-U", body: "Ada pengumuman baru." };
  e.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: "/brand/icon-192.png", badge: "/brand/icon-192.png", data: { url: data.url || "/dashboard" } }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.openWindow(e.notification.data?.url || "/dashboard"));
});
