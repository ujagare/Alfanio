const CACHE_NAME = 'alfanio-cache-v5';
const STATIC_CACHE = 'static-cache-v5';
const DYNAMIC_CACHE = 'dynamic-cache-v5';
const ASSETS_CACHE = 'assets-cache-v5';
const FONT_CACHE = 'font-cache-v5';
const IMAGE_CACHE = 'image-cache-v5';
const API_CACHE = 'api-cache-v5';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/assets/index.css',
  '/assets/index.js',
  '/assets/vendor/lenis/lenis.min.js',
  '/assets/vendor/lenis/lenis.css',
  '/brochure.pdf',
  '/Alfanio.pdf',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/product-schema.json',
  '/assets/Alfanio.png',
  '/assets/logo.png'
];

// Font files to cache
const FONT_ASSETS = [
  /\.(?:woff|woff2|ttf|otf)$/
];

// Image files to cache
const IMAGE_ASSETS = [
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/
];

// Assets that should be cached when used
const CACHE_ON_DEMAND = [
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  /\.(?:js|css)$/,
  /\.(?:woff|woff2|ttf|otf)$/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// Background sync event handler
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncForms());
  }
});

// Function to sync forms
async function syncForms() {
  try {
    // Open IndexedDB
    const dbName = 'alfanio-form-sync';
    const storeName = 'pending-submissions';

    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);
      request.onerror = reject;
      request.onsuccess = (event) => resolve(event.target.result);
    });

    // Get all pending submissions
    const submissions = await new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onerror = reject;
      request.onsuccess = (event) => resolve(event.target.result);
    });

    // Process each submission
    for (const submission of submissions) {
      try {
        let endpoint;

        // Determine the endpoint based on form type
        if (submission.formType === 'contact') {
          endpoint = '/api/contact';
        } else if (submission.formType === 'brochure') {
          endpoint = '/api/contact/brochure';
        } else {
          continue; // Skip unknown form types
        }

        // Send the form data
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submission.formData)
        });

        if (response.ok) {
          // Remove the submission from IndexedDB
          const transaction = db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          await new Promise((resolve, reject) => {
            const request = store.delete(submission.id);
            request.onerror = reject;
            request.onsuccess = resolve;
          });

          console.log(`Successfully synced submission ${submission.id}`);
        } else {
          console.error(`Failed to sync submission ${submission.id}:`, await response.text());
        }
      } catch (error) {
        console.error(`Error processing submission ${submission.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in syncForms:', error);
  }
}

// Fetch event handler with improved strategies
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests with network-first strategy
  if (event.request.url.includes('/api/')) {
    // Only cache GET requests, pass through other methods
    if (event.request.method !== 'GET') {
      return;
    }

    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response for caching
          const responseToCache = response.clone();
          caches.open(API_CACHE)
            .then(cache => {
              // Cache successful API responses for offline use
              if (response.status === 200) {
                // Set a cache expiration time (24 hours)
                const headers = new Headers(responseToCache.headers);
                headers.append('sw-fetched-on', new Date().toISOString());

                // Create a new response with the added headers
                const cachedResponse = new Response(responseToCache.body, {
                  status: responseToCache.status,
                  statusText: responseToCache.statusText,
                  headers: headers
                });

                cache.put(event.request, cachedResponse);

                // Clean up old API cache entries
                cache.keys().then(keys => {
                  keys.forEach(key => {
                    cache.match(key).then(response => {
                      if (response) {
                        const fetchedOn = response.headers.get('sw-fetched-on');
                        if (fetchedOn) {
                          const fetchDate = new Date(fetchedOn);
                          const expirationDate = new Date(fetchDate.getTime() + (24 * 60 * 60 * 1000)); // 24 hours

                          if (expirationDate < new Date()) {
                            cache.delete(key);
                          }
                        }
                      }
                    });
                  });
                });
              }
            });
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              // Check if the cached response has expired
              const fetchedOn = cachedResponse.headers.get('sw-fetched-on');
              if (fetchedOn) {
                const fetchDate = new Date(fetchedOn);
                const expirationDate = new Date(fetchDate.getTime() + (24 * 60 * 60 * 1000)); // 24 hours

                if (expirationDate < new Date()) {
                  // Expired response, remove from cache
                  caches.open(API_CACHE).then(cache => cache.delete(event.request));
                  return new Response(JSON.stringify({ error: 'Offline data expired' }), {
                    headers: { 'Content-Type': 'application/json' }
                  });
                }
              }
              return cachedResponse;
            }

            return new Response(JSON.stringify({ error: 'You are offline and no cached data is available' }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Handle font files with cache-first strategy (long expiry)
  const isFont = FONT_ASSETS.some(pattern => pattern.test(event.request.url));
  if (isFont) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then(response => {
              if (!response || response.status !== 200) {
                return response;
              }
              const responseToCache = response.clone();
              caches.open(FONT_CACHE)
                .then(cache => cache.put(event.request, responseToCache));
              return response;
            });
        })
    );
    return;
  }

  // Handle image files with cache-first strategy
  const isImage = IMAGE_ASSETS.some(pattern => pattern.test(event.request.url));
  if (isImage) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Return cached response and update cache in background
            fetch(event.request)
              .then(response => {
                if (response.status === 200) {
                  caches.open(IMAGE_CACHE)
                    .then(cache => cache.put(event.request, response));
                }
              })
              .catch(() => {/* Ignore network errors */});
            return cachedResponse;
          }

          // If not in cache, fetch from network and cache
          return fetch(event.request)
            .then(response => {
              if (!response || response.status !== 200) {
                return response;
              }
              const responseToCache = response.clone();
              caches.open(IMAGE_CACHE)
                .then(cache => cache.put(event.request, responseToCache));
              return response;
            });
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  const isAsset = CACHE_ON_DEMAND.some(pattern => pattern.test(event.request.url));
  if (isAsset) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Return cached response and update cache in background
            fetch(event.request)
              .then(response => {
                if (response.status === 200) {
                  caches.open(ASSETS_CACHE)
                    .then(cache => cache.put(event.request, response));
                }
              })
              .catch(() => {/* Ignore network errors */});
            return cachedResponse;
          }

          // If not in cache, fetch from network and cache
          return fetch(event.request)
            .then(response => {
              if (!response || response.status !== 200) {
                return response;
              }
              const responseToCache = response.clone();
              caches.open(ASSETS_CACHE)
                .then(cache => cache.put(event.request, responseToCache));
              return response;
            });
        })
    );
    return;
  }

  // For HTML pages and other resources, use network-first strategy
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(STATIC_CACHE)
            .then(cache => cache.put(event.request, responseToCache));
        }
        return response;
      })
      .catch(() => {
        // If network fails, try to get from cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If the request is for an HTML page, return the offline page
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/offline.html');
            }
            return new Response('Network error', { status: 408, headers: { 'Content-Type': 'text/plain' } });
          });
      })
  );
});
