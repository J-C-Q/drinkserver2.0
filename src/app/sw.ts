/// <reference lib="webworker" />
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { CacheFirst, ExpirationPlugin, Serwist, StaleWhileRevalidate } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const STATIC_CACHES = ["next-static", "next-image", "static-assets"];

// Only user-independent assets are cached. Pages, React Server Component
// payloads, server actions and /api responses always go to the network, so a
// device never serves one user's data to someone else.
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      // Build output is content-hashed and never changes.
      matcher: ({ sameOrigin, url }) => sameOrigin && url.pathname.startsWith("/_next/static/"),
      handler: new CacheFirst({
        cacheName: "next-static",
        plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 })],
      }),
    },
    {
      matcher: ({ sameOrigin, url }) => sameOrigin && url.pathname === "/_next/image",
      handler: new StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 })],
      }),
    },
    {
      // Public images, fonts and stylesheets such as /drinkImages/*.
      matcher: ({ sameOrigin, url, request }) =>
        sameOrigin &&
        !url.pathname.startsWith("/api/") &&
        ["image", "font", "style"].includes(request.destination),
      handler: new StaleWhileRevalidate({
        cacheName: "static-assets",
        plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 })],
      }),
    },
  ],
});

// The previous next-pwa worker cached pages and API responses (caches such as
// "others", "apis" and "next-data"). Delete every cache this worker does not
// own so that content is gone once the new worker takes over.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => !name.startsWith("serwist-") && !STATIC_CACHES.includes(name))
          .map((name) => caches.delete(name)),
      ),
    ),
  );
});

serwist.addEventListeners();
