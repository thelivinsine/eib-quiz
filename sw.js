// EIB Quiz service worker — offline support.
//
// Safe by design (avoids the May-28 "stuck on a stale build" bug):
//  - HTML navigations and questions.json use NETWORK-FIRST, so a published
//    update always wins when online; cache is only the offline fallback.
//  - Static assets (icons, images, fonts) use cache-first / stale-while-revalidate.
//  - The cache is versioned; activate deletes every other cache (including the
//    old `eib-quiz*` caches from the May-28 PWA), then claims clients.
//  Bump CACHE when shipping changes that must invalidate cached static assets.

const CACHE = 'eib-cache-2026-09-21-mode-card-meta';

const PRECACHE = [
  './',
  './index.html',
  './questions.json',
  './favicon.svg',
  './manifest.json',
  './img/icons/icon-192.png',
  './img/icons/icon-512.png',
];

// CacheStorage is not guaranteed to work. It throws under blocked site data, in
// some private windows, on a corrupted profile and when the origin is out of quota
// - observed for real as "Failed to execute 'open' on 'CacheStorage': Unexpected
// internal error." with 10GB of quota free and IndexedDB healthy. Every call below
// goes through these, because an unhandled rejection in install kills the whole
// REGISTRATION (no worker at all, so no network-first either) and one in a fetch
// handler fails the request outright. No cache means no offline; it must not mean
// no app.
async function safeOpen() {
  try { return await caches.open(CACHE); } catch (e) { return null; }
}
async function safeMatch(req) {
  try { return await caches.match(req); } catch (e) { return undefined; }
}
async function safePut(req, res) {
  const c = await safeOpen();
  if (!c) return;
  try { await c.put(req, res); } catch (e) {}
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await safeOpen();
    if (cache) {
      // `cache: 'reload'` on every precache entry: addAll() consults the HTTP
      // cache by default, so a fresh install could seed itself from the very
      // stale copies it exists to replace.
      try {
        await cache.addAll(PRECACHE.map(u => new Request(u, { cache: 'reload' })));
      } catch (e) {} // tolerate any missing asset
    }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    } catch (e) {} // a failed sweep must not stop the worker taking over
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
        // `cache: 'reload'` is what makes this network-FIRST rather than
        // browser-HTTP-cache-first. GitHub Pages serves index.html with
        // max-age=600, and a plain fetch(req) is answered out of that cache
        // without touching the network — the worker then stored the stale copy
        // as the offline fallback. Measured on the live site: the CDN had the
        // new build, `fetch(url, {cache:'reload'})` got it, and the same URL
        // through the worker returned the old one. Ten minutes of "the deploy
        // did not ship", and a reload did not help because the reload hit the
        // same HTTP cache.
        const res = await fetch(req, { cache: 'reload' });
        // Only cache real successes — otherwise a 404/500 becomes the offline fallback.
        // Through safePut, so a broken CacheStorage cannot turn a GOOD network
        // response into a failed navigation. Through waitUntil rather than await, so
        // the write is kept alive past this handler WITHOUT the navigation waiting on
        // it: safePut can no longer reject, so awaiting bought nothing but the cost of
        // a disk write on every navigation - on exactly the slow, contended profiles
        // safePut exists for.
        if (res.ok) event.waitUntil(safePut(req, res.clone()));
        return res;
      } catch (e) {
        const cached = await safeMatch(req);
        return cached || (await safeMatch('./index.html')) || Response.error();
      }
    })());
    return;
  }

  // Cache-first with background refresh (stale-while-revalidate) for static assets.
  event.respondWith((async () => {
    const cached = await safeMatch(req);
    const fetchPromise = fetch(req).then(res => {
      if (res && res.status === 200 && (url.origin === self.location.origin ||
          url.origin.includes('gstatic') || url.origin.includes('googleapis'))) {
        safePut(req, res.clone());
      }
      return res;
    }).catch(() => cached);
    return cached || fetchPromise;
  })());
});
