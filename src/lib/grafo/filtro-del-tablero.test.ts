import { describe, expect, it } from "vitest";
import { UpdateNodoDtoCara } from "@/lib/api/generado/modelos";
import { LIMITE_TABLERO, OCULTAR_NOTAS, ROL_TODO } from "@/lib/constants";
import { filtroDelTablero } from "./filtro-del-tablero";

const FILTRO_DE_ANTES = {
  estado: "ABIERTO",
  notas: OCULTAR_NOTAS,
  limit: LIMITE_TABLERO,
  cara: UpdateNodoDtoCara.REAL,
};

describe("filtroDelTablero — el filtro que armaba tablero.tsx, más el alcance (FASE 24)", () => {
  it("sin alcance, sin texto, sin HU y sin rol es el filtro de antes de la FASE", () => {
    expect(filtroDelTablero({ params: {} })).toEqual(FILTRO_DE_ANTES);
  });

  it("«todo» como rol no agrega rol", () => {
    expect(filtroDelTablero({ params: {}, rol: ROL_TODO })).toEqual(FILTRO_DE_ANTES);
  });

  it("con proyecto lo suma a los campos de siempre", () => {
    expect(filtroDelTablero({ params: { proyecto: "p1" } })).toEqual({
      ...FILTRO_DE_ANTES,
      proyecto: "p1",
    });
  });

  it("con espacio lo suma", () => {
    expect(filtroDelTablero({ params: { espacio: "e1" } })).toEqual({
      ...FILTRO_DE_ANTES,
      espacio: "e1",
    });
  });

  it("la HU y el rol viajan junto al alcance", () => {
    expect(filtroDelTablero({ params: { proyecto: "p1" }, libro: "hu-1", rol: "backend" })).toEqual(
      { ...FILTRO_DE_ANTES, proyecto: "p1", libro: "hu-1", rol: "backend" },
    );
  });

  it("buscando, la consulta va sin alcance y lleva el texto (D4)", () => {
    const filtro = filtroDelTablero({ params: { proyecto: "p1", espacio: "e1" }, q: "login" });
    expect(filtro).toEqual({ ...FILTRO_DE_ANTES, q: "login" });
    expect(filtro).not.toHaveProperty("proyecto");
    expect(filtro).not.toHaveProperty("espacio");
  });
});
