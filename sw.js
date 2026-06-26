// EIB Quiz service worker — offline support.
//
// Safe by design (avoids the May-28 "stuck on a stale build" bug):
//  - HTML navigations and questions.json use NETWORK-FIRST, so a published
//    update always wins when online; cache is only the offline fallback.
//  - Static assets (icons, images, fonts) use cache-first / stale-while-revalidate.
//  - The cache is versioned; activate deletes every other cache (including the
//    old `eib-quiz*` caches from the May-28 PWA), then claims clients.
//  Bump CACHE when shipping changes that must invalidate cached static assets.

const CACHE = 'eib-cache-2026-06-26c';

const PRECACHE = [
  './',
  './index.html',
  './questions.json',
  './favicon.svg',
  './manifest.json',
  './img/icons/icon-192.png',
  './img/icons/icon-512.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE).catch(() => {})) // tolerate any missing asset
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

function isHTML(req) {
  return req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const networkFirst = isHTML(req) || url.pathname.endsWith('/questions.json');

  if (networkFirst) {
    // Network-first: fresh content wins online; cache is the offline fallback.
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put(req, res.clone());
        return res;
      } catch (e) {
        const cached = await caches.match(req);
        return cached || caches.match('./index.html');
      }
    })());
    return;
  }

  // Cache-first with background refresh (stale-while-revalidate) for static assets.
  event.respondWith((async () => {
    const cached = await caches.match(req);
    const fetchPromise = fetch(req).then(res => {
      if (res && res.status === 200 && (url.origin === self.location.origin ||
          url.origin.includes('gstatic') || url.origin.includes('googleapis'))) {
        caches.open(CACHE).then(c => c.put(req, res.clone()));
      }
      return res;
    }).catch(() => cached);
    return cached || fetchPromise;
  })());
});
