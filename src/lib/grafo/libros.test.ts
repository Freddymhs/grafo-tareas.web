import { describe, expect, it } from "vitest";
import { UpdateNodoDtoCara, type PaginaDto } from "@/lib/api/generado/modelos";
import { librosDe } from "./libros";

const { REAL, PLAN } = UpdateNodoDtoCara;
const pagina = (libro: string, cara: UpdateNodoDtoCara, titulo: string): PaginaDto => ({
  id: cara === PLAN ? `${libro}:plan` : libro,
  libro,
  cara,
  titulo,
  historiaId: libro === "sin-hu" ? null : libro,
  nodos: [],
  abiertas: 0,
});

const paginas = [
  pagina("hu-1", REAL, "HU 19565 · Registrar Toma de Muestras"),
  pagina("hu-2", REAL, "HU 20379 · Ver Dashboard"),
  pagina("hu-2", PLAN, "HU 20379 · Ver Dashboard"),
  pagina("sin-hu", REAL, "Sin HU"),
];

describe("librosDe — los botones de HU del tablero (FASE 17)", () => {
  it("en el Trabajo, cada HU una vez, en el orden de las páginas, con su número", () => {
    expect(librosDe(paginas, REAL)).toEqual([
      { libro: "hu-1", nombre: "HU 19565" },
      { libro: "hu-2", nombre: "HU 20379" },
      { libro: "sin-hu", nombre: "Sin HU" },
    ]);
  });

  it("en el Plan, solo las HU que tienen plan", () => {
    expect(librosDe(paginas, PLAN)).toEqual([{ libro: "hu-2", nombre: "HU 20379" }]);
  });
});
