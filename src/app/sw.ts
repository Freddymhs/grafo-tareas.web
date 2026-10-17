/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { ExpirationPlugin, NetworkFirst, Serwist } from "serwist";
import {
  API_URL,
  ENTRADAS_CACHE_API,
  NOMBRE_CACHE_API,
  RUTA_OFFLINE,
  SEGUNDOS_ESPERA_RED,
} from "@/lib/constants";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const origenApi = new URL(API_URL).origin;

/** Offline de lectura (FASE 4 tarea 4): los GET a la API van a la red y, si no hay, a lo último leído. Las mutaciones no se cachean. */
const lecturasDeLaApi = {
  matcher: ({ url, request }: { url: URL; request: Request }) =>
    url.origin === origenApi && request.method === "GET",
  handler: new NetworkFirst({
    cacheName: NOMBRE_CACHE_API,
    networkTimeoutSeconds: SEGUNDOS_ESPERA_RED,
    plugins: [new ExpirationPlugin({ maxEntries: ENTRADAS_CACHE_API })],
  }),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [lecturasDeLaApi, ...defaultCache],
  fallbacks: {
    entries: [
      {
        url: RUTA_OFFLINE,
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
