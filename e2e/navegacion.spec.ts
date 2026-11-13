import { test, expect } from "@playwright/test";

// Sin API detrás (en CI no hay): se prueba lo que la web resuelve sola — la navegación, el aviso cuando la API no
// responde, la página offline y el manifest de la PWA.
const VISTAS = [
  { href: "/", titulo: "Tablero" },
  { href: "/dia", titulo: "El día" },
  { href: "/hoy", titulo: "Hoy puedo" },
  { href: "/bloqueos", titulo: "Bloqueos" },
  { href: "/ramas", titulo: "Ramas" },
];

test("la barra lleva a cada vista y cada una tiene su título", async ({ page }) => {
  await page.goto("/");
  for (const { href, titulo } of VISTAS) {
    await page.getByRole("navigation").getByRole("link", { name: titulo }).click();
    // La barra conserva la pestaña que se ve (`?espacio=`): desde la FASE 26 siempre hay una.
    await expect(page).toHaveURL(new RegExp(`${href.replace("/", "\\/")}(\\?|$)`));
    await expect(page.getByRole("heading", { level: 1 })).toContainText(titulo);
  }
});

test("sin API, el tablero lo dice en vez de quedarse cargando", async ({ page }) => {
  await page.route("**/api/v1/**", (ruta) => ruta.abort());
  await page.goto("/");
  // TanStack Query reintenta 3 veces con espera creciente antes de dar el error: tarda más que el timeout por defecto.
  await expect(page.getByText("No se pudo leer la API")).toBeVisible({ timeout: 20_000 });
});

test("la página offline y el manifest existen", async ({ page, request }) => {
  await page.goto("/~offline");
  await expect(page.getByRole("heading", { name: "Sin conexión" })).toBeVisible();
  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  expect((await manifest.json()).display).toBe("standalone");
});
