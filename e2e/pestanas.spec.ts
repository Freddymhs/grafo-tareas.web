import { test, expect, type Route } from "@playwright/test";

// La API simulada (en CI no hay): dos espacios, uno con método de trabajo y otro sin. Se prueba lo que decide la web:
// las pestañas, que la URL lleve el alcance y que un espacio sin método no ofrezca El día ni Ramas.
const ESPACIOS = [
  {
    id: "e-sigsa",
    nombre: "SIGSA",
    color: null,
    orden: 0,
    archivado: false,
    metodo: "trabajo-hu",
    etapas: [],
  },
  {
    id: "e-maq",
    nombre: "Mis máquinas",
    color: null,
    orden: 1,
    archivado: false,
    metodo: null,
    etapas: ["Pendiente"],
  },
];
const PROYECTOS = [
  { id: "p-tp", espacioId: "e-maq", nombre: "ThinkPad", color: null, orden: 0, archivado: false },
];

const sobre = (route: Route, data: unknown) =>
  route.fulfill({ json: { statusCode: 200, data, meta: {} } });

test("los espacios son pestañas, la URL lleva el alcance y un espacio sin método oculta El día y Ramas", async ({
  page,
}) => {
  await page.route("**/api/v1/**", (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname.endsWith("/espacios")) return sobre(route, ESPACIOS);
    if (pathname.endsWith("/espacios/e-maq/proyectos")) return sobre(route, PROYECTOS);
    if (pathname.endsWith("/nodos")) return sobre(route, { data: [], total: 0 });
    if (pathname.endsWith("/roles")) return sobre(route, { defecto: "", roles: [] });
    return sobre(route, []);
  });

  await page.goto("/");
  const espacios = page.getByRole("tablist", { name: "Espacios" });
  await expect(espacios.getByRole("link")).toHaveText(["SIGSA", "Mis máquinas", "Todo"]);
  const menu = page.getByRole("navigation");
  await expect(menu.getByRole("link", { name: "El día" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Ramas" })).toBeVisible();

  await espacios.getByRole("link", { name: "Mis máquinas" }).click();
  await expect(page).toHaveURL(/\?espacio=e-maq$/);
  await expect(menu.getByRole("link", { name: "Hoy puedo" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "El día" })).toHaveCount(0);
  await expect(menu.getByRole("link", { name: "Ramas" })).toHaveCount(0);

  const proyectos = page.getByRole("tablist", { name: "Proyectos" });
  await expect(proyectos.getByRole("link")).toHaveText(["Todo el espacio", "ThinkPad"]);
  await proyectos.getByRole("link", { name: "ThinkPad" }).click();
  await expect(page).toHaveURL(/\?espacio=e-maq&proyecto=p-tp$/);

  await espacios.getByRole("link", { name: "SIGSA" }).click();
  await expect(menu.getByRole("link", { name: "El día" })).toBeVisible();
});

test("un espacio que ya no existe cae a Todo con un aviso", async ({ page }) => {
  await page.route("**/api/v1/**", (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname.endsWith("/espacios")) return sobre(route, ESPACIOS);
    if (pathname.endsWith("/nodos")) return sobre(route, { data: [], total: 0 });
    if (pathname.endsWith("/roles")) return sobre(route, { defecto: "", roles: [] });
    return sobre(route, []);
  });

  await page.goto("/?espacio=borrado");
  await expect(page.getByText("Ese espacio ya no existe")).toBeVisible();
  await expect(
    page.getByRole("tablist", { name: "Espacios" }).getByRole("link", { name: "Todo" }),
  ).toHaveAttribute("aria-current", "page");
});
