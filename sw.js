const CACHE_NAME = 'baby-tracker-cache-v3'; // 🔔 Change this when you update your files

const ASSETS_TO_CACHE = [
  '/baby-tracker/index.html',
  '/baby-tracker/milk-tracker.html',
  '/baby-tracker/vit-med-tracker.html',
  '/baby-tracker/style.css',
  '/baby-tracker/milk-tracker.js',
  '/baby-tracker/vit-med-tracker.js',
  '/baby-tracker/manifest.json',
  '/baby-tracker/imgs/icon-192.png',
  '/baby-tracker/imgs/icon-512.png',
];

// Install event: cache assets
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Force the new service worker to activate immediately
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event: serve from cache first, then network
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
