import { describe, it, expect } from "vitest";
import { buscaDudas, textoDeBusqueda } from "./busqueda";

describe("buscaDudas — buscando, el tablero trae también las dudas", () => {
  it("lo buscado puede ser una duda (Freddy, 21-10: la de Teams lo era); sin búsqueda, el tablero de siempre", () => {
    expect(buscaDudas("Teams")).toBe(true);
    expect(buscaDudas(null)).toBe(false);
  });
});

describe("textoDeBusqueda — lo que el buscador le manda a la API como `q`", () => {
  it("sin espacios en los bordes", () => {
    expect(textoDeBusqueda("  Teams  ")).toBe("Teams");
  });

  it("desde 2 letras: con menos todavía no se busca", () => {
    expect(textoDeBusqueda("so")).toBe("so");
    expect(textoDeBusqueda(" s ")).toBeNull();
    expect(textoDeBusqueda("")).toBeNull();
  });
});
