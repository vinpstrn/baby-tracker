self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('baby-tracker-cache').then((cache) => {
      return cache.addAll([
        '/milk-tracker.html',
        '/style.css',
        '/milk-tracker.js',
        '/imgs/icon-192.png',
        '/imgs/icon-512.png',
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
