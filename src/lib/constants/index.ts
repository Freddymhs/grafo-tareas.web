export const APP_NAME = "grafo-tareas";

/** La API del grafo (grafo-tareas.api). En producción, la URL por Tailscale. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const STALE_TIME_MS = 60_000;
