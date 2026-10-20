import { describe, expect, it } from "vitest";
import type { ComplementoDeCatalogoDto } from "@/lib/api/generado/modelos";
import { tiposDeBloqueante, tituloDelBloqueante } from "./bloqueante";

describe("tituloDelBloqueante — la duda dice a quién espera, como las demás del grafo", () => {
  it("antepone «Para <persona>:» a la pregunta", () => {
    expect(tituloDelBloqueante("¿quién retoma la recepción?", "Tomás Carabantes")).toBe(
      "Para Tomás Carabantes: ¿quién retoma la recepción?",
    );
  });

  it("si la pregunta ya empieza con «Para …», no la repite", () => {
    expect(tituloDelBloqueante("Para Thomas: ¿apruebas el esquema?", "Tomás Soto")).toBe(
      "Para Thomas: ¿apruebas el esquema?",
    );
  });
});

describe("tiposDeBloqueante — lo que el catálogo deja colgar como bloqueante (Freddy, 2026-10-19)", () => {
  const catalogo = [
    { clave: "duda-negocio", nombre: "Duda de negocio", nodo: "DUDA" },
    { clave: "apunte", nombre: "Apunte de dominio", nodo: "TAREA" },
    { clave: "espera", nombre: "Esperando a otro (ya pedido)", nodo: "DUDA" },
    { clave: "para-decir", nombre: "Para decir", nodo: "DAILY_ITEM" },
  ] as ComplementoDeCatalogoDto[];

  it("solo los que nacen como DUDA, porque son los que frenan; en el orden del catálogo", () => {
    expect(tiposDeBloqueante(catalogo).map(({ clave }) => clave)).toEqual([
      "duda-negocio",
      "espera",
    ]);
  });
});
