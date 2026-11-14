import { test, expect, type Page } from "@playwright/test";
import { sobre } from "./api-simulada";

// La API simulada (en CI no hay): dos espacios, uno con método de trabajo y dos proyectos, y otro sin método y con uno
// solo. Se prueba lo que decide la web (FASE 24 y 26): las pestañas, que la URL lleve el alcance y que un espacio sin
// método no ofrezca El día ni Ramas.
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
const PROYECTOS_SIGSA = [
  {
    id: "p-general",
    espacioId: "e-sigsa",
    nombre: "General",
    color: null,
    orden: 1,
    archivado: false,
  },
  { id: "p-sag", espacioId: "e-sigsa", nombre: "SAG", color: null, orden: 0, archivado: false },
];
const PROYECTOS_MAQ = [
  { id: "p-maq", espacioId: "e-maq", nombre: "General", color: null, orden: 0, archivado: false },
];

const simularApi = (page: Page) =>
  page.route("**/api/v1/**", (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname.endsWith("/espacios")) return sobre(route, ESPACIOS);
    if (pathname.endsWith("/espacios/e-sigsa/proyectos")) return sobre(route, PROYECTOS_SIGSA);
    if (pathname.endsWith("/espacios/e-maq/proyectos")) return sobre(route, PROYECTOS_MAQ);
    if (pathname.endsWith("/nodos")) return sobre(route, { data: [], total: 0 });
    if (pathname.endsWith("/roles")) return sobre(route, { defecto: "", roles: [] });
    return sobre(route, []);
  });

test("solo espacios arriba (sin «Todo»), el primero al entrar, y la fila de proyectos solo con dos o más", async ({
  page,
}) => {
  await simularApi(page);

  await page.goto("/");
  const espacios = page.getByRole("tablist", { name: "Espacios" });
  await expect(espacios.getByRole("link")).toHaveText(["SIGSA", "Mis máquinas"]);
  await expect(espacios.getByRole("link", { name: "SIGSA" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  const proyectos = page.getByRole("tablist", { name: "Proyectos" });
  await expect(proyectos.getByRole("link")).toHaveText(["SAG", "General"]);
  await expect(proyectos.getByRole("link", { name: "SAG" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  const menu = page.getByRole("navigation");
  await expect(menu.getByRole("link", { name: "El día" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Ramas" })).toBeVisible();

  await proyectos.getByRole("link", { name: "General" }).click();
  await expect(page).toHaveURL(/\?espacio=e-sigsa&proyecto=p-general$/);

  await espacios.getByRole("link", { name: "Mis máquinas" }).click();
  await expect(page).toHaveURL(/\?espacio=e-maq$/);
  await expect(menu.getByRole("link", { name: "Hoy puedo" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "El día" })).toHaveCount(0);
  await expect(menu.getByRole("link", { name: "Ramas" })).toHaveCount(0);
  await expect(proyectos).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Nuevo proyecto" })).toBeVisible();
});

test("un espacio que ya no existe cae al primero con un aviso", async ({ page }) => {
  await simularApi(page);

  await page.goto("/?espacio=borrado");
  await expect(page.getByText("Ese espacio ya no existe")).toBeVisible();
  await expect(
    page.getByRole("tablist", { name: "Espacios" }).getByRole("link", { name: "SIGSA" }),
  ).toHaveAttribute("aria-current", "page");
});
