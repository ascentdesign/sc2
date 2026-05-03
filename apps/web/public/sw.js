// StayClose Service Worker
// Provides offline support and caching for PWA functionality

const CACHE_NAME = 'stayclose-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/circle',
  '/profile',
  '/about',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).catch((err) => {
      console.error('[SW] Cache failed:', err);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API requests - let them go to network
  if (url.pathname.startsWith('/api/') ||
      url.pathname.includes('convex.') ||
      url.pathname.includes('clerk.')) {
    return;
  }

  // Skip analytics and external resources
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      // Return cached response if available
      if (cached) {
        // Revalidate in the background for freshness
        fetch(request).then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response.clone());
            });
          }
        }).catch(() => {
          // Network failed, that's okay - we have cached content
        });
        return cached;
      }

      // Otherwise fetch from network
      return fetch(request).then((response) => {
        // Don't cache if not a successful response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone and cache the response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      });
    }).catch(() => {
      // Offline fallback for navigation requests
      if (request.mode === 'navigate') {
        return caches.match('/');
      }
      return new Response('Offline', { status: 503 });
    })
  );
});

// Message event - handle client communication
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

console.log('[SW] Service worker loaded');
