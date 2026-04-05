const CACHE = 'emergent-v5';
const STATIC = [
  '/',
  '/index.html',
  '/css/style.css',
  '/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // JS files — sempre da rede (no-cache)
  if (e.request.url.includes('/js/')) {
    e.respondWith(fetch(e.request));
    return;
  }
  // API calls — network first
  if (e.request.url.includes('tmdb.org') || e.request.url.includes('image.tmdb')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Static assets — cache first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
