const CACHE_NAME = 'qrshield-v2';

// Assets safe to cache (static only)
const STATIC_ASSETS = [
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests and skip API requests
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  // 1. Navigation / Document requests: ALWAYS Network-First
  // This guarantees users always get the latest index.html with correct asset hashes
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // 2. Hashed static assets in /assets/: Network first with cache fallback
  if (event.request.url.includes('/assets/')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // 3. Other static files (icons, manifest): Cache first with network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
