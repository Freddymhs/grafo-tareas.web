import { test, expect } from "@playwright/test";

test("la home carga con el nombre de la app", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "grafo-tareas" })).toBeVisible();
});
