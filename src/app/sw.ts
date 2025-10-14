import { defaultCache } from "@serwist/next/worker";
import { type PrecacheEntry, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    cleanupOutdatedCaches: true,
    concurrency: 20,
  },
  runtimeCaching: defaultCache,
});

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
      }),
    ),
  );
});

serwist.addEventListeners();