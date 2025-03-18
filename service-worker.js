const cacheName = 'slope-cache-v1';

const staticAssets = [
  '/',
  '/index.html',
  '/no-internet.html', // Ensure this is cached
  // Add other static assets here, like stylesheets or scripts
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      console.log('Caching static assets...');
      return cache.addAll(staticAssets);
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (!navigator.onLine && event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/no-internet.html').then((response) => {
        if (response) {
          console.log('Serving no-internet.html from cache');
          return response;
        } else {
          console.error('No cached no-internet.html found');
          return fetch(event.request); // This should not happen if properly cached
        }
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((networkResponse) => {
          caches.open(cacheName).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        });
      })
    );
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== cacheName).map((name) => caches.delete(name))
      );
    })
  );
});
