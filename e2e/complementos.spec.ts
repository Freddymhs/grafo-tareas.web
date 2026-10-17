import { test, expect, type Route } from "@playwright/test";

// La API simulada (en CI no hay): un PBI con una duda colgada. Se prueba lo que decide la web — mostrar lo que
// cuelga con el nombre del catálogo, pedir el ritual solo para «para decir» y mandar el cuerpo correcto.
const PBI = "11111111-1111-4111-8111-111111111111";
const nodo = (id: string, tipo: string, titulo: string, etiquetas: string[] = []) => ({
  id,
  tipo,
  titulo,
  estado: "ABIERTO",
  color: null,
  etapa: null,
  etiquetas,
  prioridad: null,
  vence: null,
  descripcion: null,
  externoOrigen: null,
  externoId: null,
  posX: null,
  posY: null,
  posZ: null,
  createdAt: "2026-10-17T00:00:00.000Z",
  updatedAt: "2026-10-17T00:00:00.000Z",
});
const CATALOGO = [
  {
    clave: "duda-negocio",
    nombre: "Duda de negocio",
    nodo: "DUDA",
    accionable: true,
    escalera: "negocio",
  },
  {
    clave: "para-decir",
    nombre: "Para decir",
    nodo: "DAILY_ITEM",
    accionable: true,
    escalera: null,
  },
];
const DUDA = {
  ...nodo("22222222-2222-4222-8222-222222222222", "DUDA", "¿Tiene que quedar aprobada?", [
    "complemento:duda-negocio",
  ]),
  complemento: "duda-negocio",
};

const sobre = (route: Route, data: unknown, status = 200) =>
  route.fulfill({ status, json: { statusCode: status, data, meta: {} } });

test("el detalle muestra lo que cuelga y cuelga «para decir» con su ritual", async ({ page }) => {
  const enviados: unknown[] = [];
  await page.route("**/api/v1/**", (route) => {
    const url = new URL(route.request().url());
    const ruta = url.pathname.replace("/api/v1", "");
    if (ruta === "/roles")
      return sobre(route, { defecto: null, roles: [], complementos: CATALOGO });
    if (ruta === "/area")
      return sobre(route, { escaleras: [], rituales: [{ clave: "daily", nombre: "Daily" }] });
    if (ruta === "/etapas") return sobre(route, []);
    if (ruta === `/nodos/${PBI}`) return sobre(route, nodo(PBI, "HISTORIA", "PBI 25699"));
    if (ruta === `/nodos/${PBI}/bloqueado`) return sobre(route, { bloqueado: true, por: [DUDA] });
    if (ruta === `/nodos/${PBI}/libera`) return sobre(route, { directos: [], cadena: [] });
    if (ruta === `/nodos/${PBI}/complementos` && route.request().method() === "POST") {
      enviados.push(route.request().postDataJSON());
      return sobre(route, DUDA, 201);
    }
    if (ruta === `/nodos/${PBI}/complementos`) return sobre(route, [DUDA]);
    return sobre(route, []);
  });

  await page.goto(`/nodos/${PBI}`);
  const seccion = page.locator("section", {
    has: page.getByRole("heading", { name: "Complementos", exact: true }),
  });
  await expect(seccion.getByRole("listitem").getByText("Duda de negocio")).toBeVisible();
  await expect(seccion.getByRole("button", { name: "Escalar" })).toBeVisible();
  await expect(page.getByLabel("Ritual")).toHaveCount(0);

  await page.getByLabel("Tipo de complemento").selectOption({ label: "Para decir" });
  await expect(page.getByLabel("Ritual")).toBeVisible();
  await page.getByLabel("Título del complemento").fill("avisar del feriado");
  await page.getByRole("button", { name: "Colgar" }).click();
  await expect
    .poll(() => enviados)
    .toEqual([{ tipo: "para-decir", titulo: "avisar del feriado", ritual: "daily" }]);
});
