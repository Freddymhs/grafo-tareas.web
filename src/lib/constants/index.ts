export const APP_NAME = "grafo-tareas";

/** La API del grafo (grafo-tareas.api). En producción, la URL por Tailscale. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const STALE_TIME_MS = 60_000;

/** El tablero y las ramas piden todo lo abierto de una vez: hoy son ~100 tareas, el tope de la API es 500. */
export const LIMITE_TABLERO = 500;

/** La columna de lo que no tiene etapa: en Todoist, las 42 tareas "sin sección" son la bandeja de entrada. */
export const ETAPA_ENTRADA = "Entrada";

/** Prioridad 1 y 2 son las que Freddy usa (p1 12, p2 33 de 134); 3 y 4 no se muestran. */
export const PRIORIDAD_VISIBLE_MAXIMA = 2;

export const NAVEGACION = [
  { href: "/", titulo: "Tablero" },
  { href: "/hoy", titulo: "Hoy puedo" },
  { href: "/bloqueos", titulo: "Bloqueos" },
  { href: "/ramas", titulo: "Ramas" },
] as const;
