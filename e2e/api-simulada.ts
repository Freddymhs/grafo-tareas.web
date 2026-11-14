import type { Page, Route } from "@playwright/test";

// Piezas de la API simulada que comparten los e2e (en CI no hay API).

const HTTP_OK = 200;

/** Responde con el sobre de la API: `{ statusCode, data, meta }`. */
export const sobre = (route: Route, data: unknown, status = HTTP_OK) =>
  route.fulfill({ status, json: { statusCode: status, data, meta: {} } });

export const ESPACIO_CON_METODO = {
  id: "e-sigsa",
  nombre: "SIGSA",
  color: null,
  orden: 0,
  archivado: false,
  metodo: "trabajo-hu",
  etapas: [],
};

/**
 * Toda vista con alcance espera a saber qué espacio se ve (FASE 26): sin `GET /espacios` se queda en «Cargando…».
 * Simula un solo espacio, con método y sin proyectos.
 */
export const simularEspacioConMetodo = async (page: Page) => {
  await page.route("**/api/v1/espacios", (route) => sobre(route, [ESPACIO_CON_METODO]));
  await page.route("**/api/v1/espacios/*/proyectos", (route) => sobre(route, []));
};
