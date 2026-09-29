// Parkable Progressive Web App Service Worker
const CACHE_NAME = 'parkable-cache-v3';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const scope = (self.registration && self.registration.scope) || '/';
      const precacheUrls = [
        scope,
        new URL('manifest.json', scope).href,
        new URL('icons/icon-192.png', scope).href,
        new URL('icons/icon-512.png', scope).href,
        new URL('icons/apple-touch-icon.png', scope).href,
      ];

      // Cache all available resources without failing the entire installation if one resource is missing
      await Promise.all(
        precacheUrls.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response && response.ok) {
              await cache.put(url, response);
            }
          } catch (err) {
            console.warn('PWA Precache item skip:', url, err);
          }
        })
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only process standard GET HTTP requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  // Let auth callbacks, Google Sign-In, and Supabase queries pass directly through network
  if (
    event.request.url.includes('/api/auth') || 
    event.request.url.includes('supabase.co') ||
    event.request.url.includes('accounts.google.com')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Stale-while-revalidate for faster subsequent loads
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          event.request.url.startsWith(self.location.origin) &&
          !event.request.url.includes('_next/webpack-hmr')
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          const scope = (self.registration && self.registration.scope) || '/';
          return caches.match(scope) || caches.match('/');
        }
      });
    })
  );
});
