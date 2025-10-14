// A unique name for our cache
const CACHE_NAME = "offline-page-cache-v1";
// The URL of the page to show when offline
const OFFLINE_URL = "offline";

// 1. Installation: Cache the offline page
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Install");
  // waitUntil() ensures the service worker doesn't install until the code inside has successfully completed.
  event.waitUntil(
    (async () => {
      // Open a cache.
      const cache = await caches.open(CACHE_NAME);
      // Add the offline URL to the cache.
      // We use add() which fetches and caches the file.
      console.log("[ServiceWorker] Caching offline page");
      // You'll need to create an 'offline' file for this to work.
      await cache.add(OFFLINE_URL);
    })()
  );

  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
});

// 2. Activation: Clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activate");
  event.waitUntil(
    (async () => {
      // This allows the service worker to take control of the page without a reload.
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }

      // Clean up old caches that are not our current CACHE_NAME
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[ServiceWorker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })()
  );

  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();
});

// 3. Fetch: Intercept network requests
self.addEventListener("fetch", (event) => {
  // We only want to intercept navigation requests (i.e., for HTML pages)
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // First, try to use the network.
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // If the network fails, it means we are offline.
          console.log(
            "[ServiceWorker] Fetch failed; returning offline page instead.",
            error
          );

          // Get the offline page from the cache.
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse;
        }
      })()
    );
  }
  // For non-navigation requests, just let them pass through.
});
