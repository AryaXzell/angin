// sw.js — Angin service worker
// Strategy: cache-first for the app shell (HTML/CSS/JS/icons) so repeat visits and
// offline use are instant; network-first with cache fallback for weather API calls
// so data stays fresh when online but the app still works offline with last-known data.

const CACHE_VERSION = 'angin-v1';
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const API_CACHE = `${CACHE_VERSION}-api`;

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/css/base.css',
  '/css/utilities.css',
  '/css/components.css',
  '/js/main.js',
  '/js/state.js',
  '/js/i18n.js',
  '/js/utils.js',
  '/js/dom.js',
  '/js/render.js',
  '/js/network.js',
  '/js/network-status.js',
  '/js/weather.js',
  '/js/weatherAlerts.js',
  '/js/background.js',
  '/js/toast.js',
  '/js/navigation.js',
  '/js/search.js',
  '/js/savedCities.js',
  '/js/settings.js',
  '/js/geolocation.js',
  '/js/pullToRefresh.js',
  '/js/share.js',
  '/js/pwa-install.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

const API_HOSTS = [
  'api.open-meteo.com',
  'air-quality-api.open-meteo.com',
  'geocoding-api.open-meteo.com',
  'api.bigdatacloud.net',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('angin-') && k !== SHELL_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;

  // API calls — network first, fall back to cache when offline
  if (API_HOSTS.includes(url.hostname)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Same-origin app shell — cache first, refresh in background
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(event.request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    // stale-while-revalidate: refresh the cache quietly for next time
    fetch(request).then((res) => {
      if (res && res.ok) caches.open(SHELL_CACHE).then((c) => c.put(request, res));
    }).catch(() => {});
    return cached;
  }
  try {
    const res = await fetch(request);
    if (res && res.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    // Last resort for navigations: serve the app shell so the SPA can still boot
    if (request.mode === 'navigate') {
      const fallback = await caches.match('/index.html');
      if (fallback) return fallback;
    }
    throw new Error('offline and not cached');
  }
}

async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (res && res.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw new Error('offline and not cached');
  }
}
