const CACHE = 'mbs-mobile-cache-v1';
const ASSETS = ['./','./index.html','./manifest.json','./icons/icon-192.png','./icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k!==CACHE ? caches.delete(k) : null))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone();
      if(req.method==='GET' && new URL(req.url).origin===location.origin){
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => {
      if(req.mode==='navigate') return caches.match('./index.html');
      return new Response('Offline', {status:503});
    }))
  );
});
