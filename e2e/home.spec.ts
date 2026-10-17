import { test, expect } from "@playwright/test";

test("la home es el tablero y lleva el nombre de la app en la barra", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Tablero" })).toBeVisible();
  await expect(
    page.getByRole("navigation").getByRole("link", { name: "grafo-tareas" }),
  ).toBeVisible();
});
