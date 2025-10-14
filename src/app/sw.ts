import { defaultCache } from "@serwist/next/worker";
import {
  type PrecacheEntry,
  Serwist,
  PrecacheFallbackPlugin,
  NetworkOnly,
} from "serwist";

declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.registerCapture(
  /^\/chat\/.*/,
  new NetworkOnly({
    plugins: [
      new PrecacheFallbackPlugin({
        fallbackUrls: ["/~offline"],
        serwist,
      }),
    ],
  })
);

const urlsToCache = ["/", "/~offline"] as const;

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all(
      urlsToCache.map((entry) => {
        console.log("Caching offline page:", entry);
        const request = serwist.handleRequest({
          request: new Request(entry),
          event,
        });
        return request;
      })
    )
  );
});

serwist.addEventListeners();
