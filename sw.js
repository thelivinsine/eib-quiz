// Rollback kill switch for the May 28 PWA service worker.
// The May 9 app did not use a service worker, so unregister this worker and
// clear EIB caches for returning visitors who loaded the PWA build.
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith('eib-quiz'))
        .map(key => caches.delete(key))
    );

    await self.registration.unregister();

    const clientsList = await self.clients.matchAll({ type: 'window' });
    await Promise.all(clientsList.map(client => client.navigate(client.url)));
  })());
});
