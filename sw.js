/* ALONE CODE STUDIO v12 — Service Worker | Offline-First | Zero Error Screens */
const CACHE = 'acs-v12';
const CORE  = [
  './', './index.html', './app.js', './style.css', './manifest.json',
  './icons/icon-16.png','./icons/icon-32.png','./icons/icon-48.png',
  './icons/icon-96.png','./icons/icon-144.png','./icons/icon-192.png',
  './icons/icon-512.png','./icons/favicon.ico',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(CORE.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  /* API calls — always network-only, never cache */
  const apiHosts = ['anthropic.com', 'emkc.org'];
  if (apiHosts.some(h => url.hostname.includes(h))) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ error: 'Offline' }), {
          status: 503, headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  /* CDN assets — Stale-While-Revalidate (serves cached instantly, refreshes in background) */
  const cdnHosts = [
    'esm.sh', 'unpkg.com', 'cdnjs.cloudflare.com',
    'fonts.googleapis.com', 'fonts.gstatic.com'
  ];
  if (cdnHosts.some(h => url.hostname.includes(h))) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(cached => {
          const fetchPromise = fetch(e.request).then(res => {
            if (res && res.status === 200) cache.put(e.request, res.clone());
            return res;
          }).catch(() => cached || new Response('', { status: 503 }));
          return cached || fetchPromise; // serve cache instantly if available
        })
      )
    );
    return;
  }

  /* App shell — cache-first, stale-while-revalidate */
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fresh = fetch(e.request).then(res => {
        if (res && res.status === 200) {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        }
        return res;
      }).catch(() => cached || new Response('Offline', { status: 503 }));
      return cached || fresh;
    })
  );
});

/* v12: Accept skipWaiting message from client */
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
