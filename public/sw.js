const CACHE_NAME = 'resusci-time-v5'

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.png',
  './favicon-16x16.png',
  './favicon-32x32.png',
  './favicon-192.png',
  './favicon-512.png',
  './apple-touch-icon.png',
  './wmas-icons/favicon.png',
  './wmas-icons/favicon-16x16.png',
  './wmas-icons/favicon-32x32.png',
  './wmas-icons/favicon-192.png',
  './wmas-icons/favicon-512.png',
  './wmas-icons/apple-touch-icon.png',
  './preview-icons/favicon.png',
  './preview-icons/favicon-16x16.png',
  './preview-icons/favicon-32x32.png',
  './preview-icons/favicon-192.png',
  './preview-icons/favicon-512.png',
  './preview-icons/apple-touch-icon.png',
  './backgrounds/resusci-time-logo.png',
  './backgrounds/wmas-crest.png',
  './als-alogorhythm.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request)
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME)
          cache.put(event.request, response.clone())
        }
        return response
      } catch {
        const cached = await caches.match(event.request)
        if (cached) return cached
        if (event.request.mode === 'navigate') {
          const fallback = await caches.match('./index.html')
          if (fallback) return fallback
        }
        return Response.error()
      }
    })(),
  )
})
