import { describe, it, expect } from "vitest";
import { partesDeAvance } from "./avance";

describe("partesDeAvance", () => {
  it("como fases.html: lo hecho en verde, lo que falta en rojo, lo que no aplica en gris", () => {
    const partes = partesDeAvance(
      "entender ✓ · amarrar 15/15 · cambiar 3/7 · colección — · PR ✗ · falta URL commit, Evidencias",
    );
    expect(partes.map(({ texto, estado }) => [texto, estado])).toEqual([
      ["entender ✓", "hecho"],
      ["amarrar 15/15", "hecho"],
      ["cambiar 3/7", "falta"],
      ["colección —", "noAplica"],
      ["PR ✗", "falta"],
      ["falta URL commit, Evidencias", "falta"],
    ]);
  });

  it("una línea vacía no da partes", () => {
    expect(partesDeAvance("")).toEqual([]);
  });
});
