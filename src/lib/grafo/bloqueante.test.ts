import { describe, expect, it } from "vitest";
import { CreateConexionDtoTipo } from "@/lib/api/generado/modelos";
import { conexionesDelBloqueante, tituloDelBloqueante } from "./bloqueante";

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

describe("conexionesDelBloqueante — creado desde lo que frena, nunca sin dueño (Freddy, 2026-10-19)", () => {
  it("la duda espera a la persona, pertenece a lo que frena y eso queda bloqueado por ella", () => {
    expect(conexionesDelBloqueante("duda", "pbi", "carabantes")).toEqual([
      {
        origenId: "duda",
        destinoId: "carabantes",
        tipo: CreateConexionDtoTipo.ESPERA_RESPUESTA_DE,
      },
      { origenId: "duda", destinoId: "pbi", tipo: CreateConexionDtoTipo.PERTENECE_A },
      { origenId: "pbi", destinoId: "duda", tipo: CreateConexionDtoTipo.BLOQUEADA_POR },
    ]);
  });
});
