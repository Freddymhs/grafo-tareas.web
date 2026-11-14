import { test, expect } from "@playwright/test";
import { simularEspacioConMetodo, sobre } from "./api-simulada";

// La API simulada (en CI no hay): tres tarjetas en curso, una frenada, un trámite. Se prueba lo que decide la web —
// el aviso de más de dos a la vez y el texto que copia el botón—; qué está en curso lo decide la API.
const nodo = (id: string, titulo: string) => ({
  id,
  tipo: "TAREA",
  titulo,
  estado: "ABIERTO",
  color: null,
  etapa: null,
  etiquetas: [],
  prioridad: null,
  vence: null,
});
const DIA = {
  desde: "2026-10-16T12:00:00.000Z",
  limiteEnCurso: 2,
  terminado: [nodo("a", "FASE 30 husky")],
  enCurso: [
    { nodo: nodo("b", "FASE 34"), etapa: "EN CODIGO", bloqueado: false },
    { nodo: nodo("c", "FASE 35"), etapa: "TESTEADO", bloqueado: true },
    { nodo: nodo("d", "FASE 37"), etapa: "AMARRAR 🧰", bloqueado: false },
  ],
  detenido: [{ nodo: nodo("c", "FASE 35"), por: [nodo("e", "¿feriados?")] }],
  paraDecir: [],
  tramites: [nodo("f", "FASE 22: falta URL commit")],
};

test("El día avisa con más de dos en curso y copia el parte armado de los datos", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await simularEspacioConMetodo(page);
  await page.route("**/api/v1/derivado/dia*", (route) => sobre(route, DIA));

  await page.goto("/dia");
  await expect(page.getByRole("alert").filter({ hasText: "en curso" })).toContainText(
    "Hay 3 tarjetas en curso y el acuerdo es 2",
  );
  await expect(page.getByRole("heading", { name: "Trámites de cierre (1)" })).toBeVisible();

  await page.getByRole("button", { name: "Copiar el parte" }).click();
  await expect(page.getByText("Copiado")).toBeVisible();
  const copiado = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiado).toContain("Terminé:\n- FASE 30 husky");
  expect(copiado).toContain("- FASE 35 (TESTEADO, frenada)");
  expect(copiado).toContain("Detenido:\n- FASE 35 — espera: ¿feriados?");
});
