import { test, expect, type Route } from "@playwright/test";

// La API simulada (en CI no hay): dos roles, una tarea de cada uno y una FASE. Se prueba lo que decide la web —
// las pestañas, las columnas de cada rol y que pide `?rol=` a la API—; qué nodo es de qué rol lo decide la API.
const ROLES = {
  defecto: "producto",
  roles: [
    {
      clave: "producto",
      nombre: "Producto",
      para: "Features",
      columnas: ["ENTENDIMIENTO", "EN CODIGO"],
    },
    {
      clave: "calidad",
      nombre: "Calidad",
      para: "Refactor",
      columnas: ["ENTENDIMIENTO", "AMARRAR 🧰"],
    },
  ],
};
const ETAPAS = ["ENTENDIMIENTO", "EN CODIGO", "AMARRAR 🧰"];
const nodo = (id: string, tipo: string, etapa: string | null, etiquetas: string[]) => ({
  id,
  tipo,
  titulo: id,
  estado: "ABIERTO",
  color: null,
  etapa,
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
const NODOS = [
  nodo("feature", "TAREA", "EN CODIGO", []),
  nodo("refactor", "TAREA", "AMARRAR 🧰", ["calidad"]),
  nodo("FASE 8", "FASE", "ENTENDIMIENTO", ["producto"]),
];
const DE_CALIDAD = new Set(["refactor"]);

const sobre = (route: Route, data: unknown) =>
  route.fulfill({ json: { statusCode: 200, data, meta: {} } });

test("el tablero tiene una pestaña por rol y cada una muestra sus columnas y sus nodos", async ({
  page,
}) => {
  const pedidosConRol: string[] = [];
  await page.route("**/api/v1/roles", (route) => sobre(route, ROLES));
  await page.route("**/api/v1/etapas", (route) => sobre(route, ETAPAS));
  await page.route("**/api/v1/nodos?**", (route) => {
    const url = new URL(route.request().url());
    const tipo = url.searchParams.get("tipo");
    const rol = url.searchParams.get("rol");
    if (rol) pedidosConRol.push(rol);
    const delRol = NODOS.filter(({ id }) =>
      rol === null ? true : rol === "calidad" ? DE_CALIDAD.has(id) : !DE_CALIDAD.has(id),
    );
    const data = delRol.filter((n) => n.tipo === tipo);
    return sobre(route, { data, total: data.length });
  });

  await page.goto("/");
  const rol = page.getByRole("navigation", { name: "Rol" });
  await expect(rol.getByRole("button")).toHaveText(["Todo", "Producto", "Calidad"]);
  const columnas = page.locator("section h2 > span:first-child");
  // «Todo»: la Entrada y las etapas con algo adentro (la FASE también está).
  await expect(columnas).toHaveText(["Entrada", "ENTENDIMIENTO", "EN CODIGO", "AMARRAR 🧰"]);
  await expect(page.getByRole("link", { name: /^FASE FASE 8\b/ })).toBeVisible();

  await rol.getByRole("button", { name: "Calidad" }).click();
  await expect(columnas).toHaveText(["Entrada", "ENTENDIMIENTO", "AMARRAR 🧰"]);
  await expect(page.getByRole("link", { name: /^refactor\b/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /^feature\b/ })).toHaveCount(0);
  expect(pedidosConRol).toContain("calidad");
});
