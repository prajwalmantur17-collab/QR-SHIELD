const CACHE_NAME = 'qrshield-v4';

// Assets safe to cache (static only)
const STATIC_ASSETS = [
  '/',
  '/index.html',
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
        .catch(() =>
          // `caches.match()` returns a Promise (always truthy), so the old `a || b` never reached the
          // fallback and respondWith() received undefined while offline. Chain them properly instead.
          caches.match('/index.html')
            .then((cached) => cached || caches.match('/'))
            .then((cached) => cached || new Response('QR Shield is offline. Please reconnect and try again.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            }))
        )
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
