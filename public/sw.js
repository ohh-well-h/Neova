const CACHE_PREFIX = 'neova';
const CACHE_VERSION = 'v3';
const SHELL_CACHE = `${CACHE_PREFIX}-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-${CACHE_VERSION}`;
const CORE_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
];

async function cacheAppShell() {
  const cache = await caches.open(SHELL_CACHE);
  await cache.addAll(CORE_FILES);

  const indexResponse = await cache.match('/index.html');
  if (!indexResponse) return;
  const html = await indexResponse.text();
  const generatedFiles = Array.from(
    html.matchAll(/(?:src|href)=["'](\/(?:_expo|assets)\/[^"']+)["']/g),
    (match) => match[1],
  );
  await Promise.all(
    generatedFiles.map(async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) return;
        await cache.put(url, response.clone());
        if (!url.endsWith('.js')) return;

        const bundle = await response.text();
        const bundledAssets = Array.from(
          new Set(
            Array.from(
              bundle.matchAll(/\/(?:assets)\/[^"'`\s)]+?\.(?:gif|jpe?g|png|svg|webp|otf|ttf|woff2?)/g),
              (match) => match[0],
            ),
          ),
        );
        await Promise.all(bundledAssets.map((assetUrl) => cache.add(assetUrl).catch(() => undefined)));
      } catch {
        // A nonessential asset should not prevent the core shell from installing.
      }
    }),
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheAppShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(`${CACHE_PREFIX}-`) && key !== SHELL_CACHE && key !== RUNTIME_CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function navigationResponse(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put('/', response.clone());
    }
    return response;
  } catch {
    // The root shell is fetched without a redirect. Some static servers
    // redirect /index.html to /, and a cached redirected response cannot be
    // returned safely for a different navigation URL in Chromium.
    return (await caches.match('/')) || Response.error();
  }
}

async function staticResponse(request) {
  const shouldRefreshFromNetwork = request.destination === 'script' || request.destination === 'style';

  if (shouldRefreshFromNetwork) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        const cache = await caches.open(RUNTIME_CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      return (await caches.match(request)) || Response.error();
    }
  }

  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(navigationResponse(request));
    return;
  }

  event.respondWith(staticResponse(request));
});
