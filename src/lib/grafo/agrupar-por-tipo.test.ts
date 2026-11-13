import { describe, expect, it } from "vitest";
import type { NodoResponseDto, TipoNodoResponseDto } from "@/lib/api/generado/modelos";
import { NOMBRE_TIPO_OTROS } from "@/lib/constants";
import { agruparPorTipo } from "./agrupar-por-tipo";

const tipo = (nombre: string): TipoNodoResponseDto => ({
  id: `t-${nombre}`,
  espacioId: "e1",
  nombre,
  tieneCiclo: false,
  accionable: false,
});
const nodo = (id: string, tipoNombre: string) => ({ id, tipo: tipoNombre }) as NodoResponseDto;

const MAQUINA = tipo("MAQUINA");
const FAMILIA = tipo("FAMILIA");
const HERRAMIENTA = tipo("HERRAMIENTA");

describe("agruparPorTipo — el tablero simple (D5)", () => {
  it("agrupa en el orden de los tipos, no en el de los nodos", () => {
    const grupos = agruparPorTipo(
      [nodo("h1", "HERRAMIENTA"), nodo("m1", "MAQUINA"), nodo("h2", "HERRAMIENTA")],
      [MAQUINA, FAMILIA, HERRAMIENTA],
    );
    expect(grupos.map(({ tipo: { nombre } }) => nombre)).toEqual(["MAQUINA", "HERRAMIENTA"]);
    expect(grupos[1]?.nodos.map(({ id }) => id)).toEqual(["h1", "h2"]);
  });

  it("omite los tipos sin nodos", () => {
    const grupos = agruparPorTipo([nodo("m1", "MAQUINA")], [MAQUINA, FAMILIA, HERRAMIENTA]);
    expect(grupos).toHaveLength(1);
  });

  it("un tipo desconocido va a un grupo final «Otros»", () => {
    const grupos = agruparPorTipo([nodo("x", "RARO"), nodo("m1", "MAQUINA")], [MAQUINA]);
    expect(grupos.map(({ tipo: { nombre } }) => nombre)).toEqual(["MAQUINA", NOMBRE_TIPO_OTROS]);
    expect(grupos[1]?.nodos.map(({ id }) => id)).toEqual(["x"]);
  });

  it("sin nodos no hay grupos", () => {
    expect(agruparPorTipo([], [MAQUINA])).toEqual([]);
  });
});
