import { describe, it, expect } from "vitest";
import { textoDeBusqueda } from "./busqueda";

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
