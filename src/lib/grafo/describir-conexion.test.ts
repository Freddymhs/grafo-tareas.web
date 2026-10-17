import { describe, it, expect } from "vitest";
import type { ConexionResponseDto } from "@/lib/api/generado/modelos";
import { describirConexion } from "./describir-conexion";

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
