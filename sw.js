self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('baby-tracker-cache').then((cache) => {
      return cache.addAll([
        '/baby-tracker/index.html',
        '/baby-tracker/milk-tracker.html',
        '/baby-tracker/vit-med-tracker.html',
        '/baby-tracker/style.css',
        '/baby-tracker/milk-tracker.js',
        '/baby-tracker/vit-med-tracker.js',
        '/baby-tracker/manifest.json',
        '/baby-tracker/imgs/icon-192.png',
        '/baby-tracker/imgs/icon-512.png',
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
