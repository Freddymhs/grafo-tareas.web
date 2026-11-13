import { describe, it, expect } from "vitest";
import type { ConexionResponseDto } from "@/lib/api/generado/modelos";
import { describirConexion, textoDeConexion } from "./describir-conexion";

const conexion: ConexionResponseDto = {
  id: "c1",
  origenId: "padre",
  destinoId: "hija",
  tipo: "DEPENDE_DE",
  createdAt: "2026-10-17T00:00:00.000Z",
};

describe("describirConexion", () => {
  it("desde el origen: este depende del otro", () => {
    expect(describirConexion(conexion, "padre")).toEqual({
      id: "c1",
      otroId: "hija",
      esOrigen: true,
      texto: "depende de",
    });
  });

  it("desde el destino: el otro depende de este", () => {
    const descrita = describirConexion(conexion, "hija");
    expect(descrita.otroId).toBe("padre");
    expect(descrita.esOrigen).toBe(false);
  });

  it("cada tipo tiene su texto", () => {
    expect(describirConexion({ ...conexion, tipo: "BLOQUEADA_POR" }, "padre").texto).toBe(
      "bloqueada por",
    );
    expect(describirConexion({ ...conexion, tipo: "EN_DAILY_DE" }, "padre").texto).toBe(
      "en el daily de",
    );
  });
});

describe("textoDeConexion — cómo se lee cada tipo de conexión", () => {
  it("los tipos de la FASE 22 que faltaban", () => {
    expect(textoDeConexion("SE_RELACIONA_CON")).toBe("se relaciona con");
    expect(textoDeConexion("DERIVA_DE")).toBe("deriva de");
  });

  it("un tipo con texto propio conserva el suyo", () => {
    expect(textoDeConexion("EN_DAILY_DE")).toBe("en el daily de");
  });

  it("un tipo sin texto muestra su nombre en minúscula y con espacios, nunca nada", () => {
    expect(textoDeConexion("ES_PARTE_DE")).toBe("es parte de");
    expect(textoDeConexion("INSTALADA_EN")).toBe("instalada en");
  });

  it("describirConexion lo usa: un tipo nuevo no deja el verbo vacío", () => {
    expect(describirConexion({ ...conexion, tipo: "ES_PARTE_DE" }, "padre").texto).toBe(
      "es parte de",
    );
  });
});
