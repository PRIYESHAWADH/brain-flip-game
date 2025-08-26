const CACHE_NAME = 'brain-flip-v2';
const OFFLINE_URL = '/offline.html';
const DBConfig = {
  name: 'brain-flip-store',
  version: 1,
  stores: {
    scores: { keyPath: 'id', autoIncrement: true }
  }
};

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/images/icons/icon-192x192.svg',
  '/images/icons/icon-512x512.svg'
];

const PRECACHE_ASSETS = {
  'app': {
    name: CACHE_NAME,
    urls: STATIC_ASSETS
  },
  'audio': {
    name: 'brain-flip-audio-v2',
    urls: [
      '/audio/audio-manifest.json',
      '/audio/ui/click.mp3',
      '/audio/ui/hover.mp3',
      '/audio/game/success.mp3',
      '/audio/game/failure.mp3',
      '/audio/game/level-up.mp3'
    ]
  }
};

// IndexedDB setup
let db;

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DBConfig.name, DBConfig.version);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('scores')) {
        db.createObjectStore('scores', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

// Install event - precache all static assets
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cachePromises = Object.values(PRECACHE_ASSETS).map(async ({ name, urls }) => {
      const cache = await caches.open(name);
      return cache.addAll(urls);
    });

    try {
      await Promise.all(cachePromises);
      await self.skipWaiting();
    } catch (error) {
      console.error('Cache installation failed:', error);
    }
  })());
});

// Activate event - clean up old caches & claim clients
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Clean up old caches
    const validCacheNames = Object.values(PRECACHE_ASSETS).map(({ name }) => name);
    const cacheKeys = await caches.keys();
    const deletions = cacheKeys
      .filter(key => !validCacheNames.includes(key))
      .map(key => caches.delete(key));

    try {
      await Promise.all(deletions);
      await clients.claim();
      // Initialize IndexedDB
      db = await openDB();
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  })());
});

// Fetch event - with network-first strategy for API calls
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Special handling for navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) return preloadResponse;

        return await fetch(event.request);
      } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        return cache.match(OFFLINE_URL);
      }
    })());
    return;
  }

  // Cache-first strategy for audio files
  if (url.pathname.startsWith('/audio/')) {
    event.respondWith((async () => {
      const cache = await caches.open(PRECACHE_ASSETS.audio.name);
      const cachedResponse = await cache.match(event.request);
      
      if (cachedResponse) return cachedResponse;

      try {
        const networkResponse = await fetch(event.request);
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      } catch (error) {
        return new Response(null, { 
          status: 404, 
          statusText: 'Audio file not available offline'
        });
      }
    })());
    return;
  }

  // Network-first strategy for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        // If offline, queue for background sync
        if (event.request.method === 'POST') {
          await queuePostRequest(event.request.clone());
        }
        return new Response(JSON.stringify({ 
          error: 'Network request failed', 
          offline: true 
        }), { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    })());
    return;
  }

  // Cache-first for static assets
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(event.request);
    
    if (cachedResponse) return cachedResponse;

    try {
      const networkResponse = await fetch(event.request);
      if (networkResponse.ok) {
        cache.put(event.request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      return new Response(null, { 
        status: 404, 
        statusText: 'Resource not available offline'
      });
    }
  })());
});

// Background Sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-scores') {
    event.waitUntil(syncPendingScores());
  }
});

// Push Notifications
self.addEventListener('push', event => {
  if (!event.data) return;

  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification('Brain Flip', {
      body: data.message,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: { url: data.url },
      actions: [
        { action: 'open', title: 'Open Game' },
        { action: 'close', title: 'Dismiss' }
      ]
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Message Handling
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// IndexedDB Operations
async function queuePostRequest(request) {
  const data = await request.json();
  const store = db.transaction('scores', 'readwrite').objectStore('scores');
  await store.add({
    ...data,
    url: request.url,
    timestamp: Date.now()
  });
}

async function syncPendingScores() {
  const store = db.transaction('scores', 'readwrite').objectStore('scores');
  const pendingScores = await store.getAll();

  for (const score of pendingScores) {
    try {
      const response = await fetch(score.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(score)
      });

      if (response.ok) {
        await store.delete(score.id);
      }
    } catch (error) {
      console.error('Score sync failed:', error);
      throw error; // Retry on next sync
    }
  }
}
