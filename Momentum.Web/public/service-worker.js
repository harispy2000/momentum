const CACHE_NAME = 'momentum-pwa-v1';
const assetsToCache = [
  '/',
  '/index.html',
  '/assets/index-LdIC661-.css',
  '/assets/index-yUFjp8gR.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});