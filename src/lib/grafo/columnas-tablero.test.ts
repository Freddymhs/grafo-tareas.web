import { describe, it, expect } from "vitest";
import type { NodoResponseDto } from "@/lib/api/generado/modelos";
import { ETAPA_ENTRADA, ETAPA_OTRAS } from "@/lib/constants";
import { columnasDelTablero } from "./columnas-tablero";

const nodo = (id: string, etapa: string | null): NodoResponseDto => ({
  id,
  tipo: "TAREA",
  titulo: id,
  estado: "ABIERTO",
  color: null,
  etapa,
  etiquetas: [],
  prioridad: null,
  vence: null,
  descripcion: null,
  externoOrigen: null,
  externoId: null,
  posX: null,
  posY: null,
  posZ: null,
  createdAt: "2026-10-17T00:00:00.000Z",
  updatedAt: "2026-10-17T00:00:00.000Z",
});
const resumen = (columnas: ReturnType<typeof columnasDelTablero>) =>
  columnas.map(({ nombre, nodos }) => [nombre, nodos.map(({ id }) => id)]);

describe("columnasDelTablero", () => {
  const nodos = [nodo("a", null), nodo("b", "AMARRAR 🧰"), nodo("c", "❓ DUDAS EN ESPERA")];

  it("el tablero de un rol muestra su flujo entero; lo de otra etapa va a «Otras etapas»", () => {
    expect(resumen(columnasDelTablero(nodos, ["ENTENDIMIENTO", "AMARRAR 🧰"], false))).toEqual([
      [ETAPA_ENTRADA, ["a"]],
      ["ENTENDIMIENTO", []],
      ["AMARRAR 🧰", ["b"]],
      [ETAPA_OTRAS, ["c"]],
    ]);
  });

  it("«Todo» esconde las columnas vacías, salvo la Entrada", () => {
    const sinEntrada = [nodo("b", "AMARRAR 🧰")];
    expect(resumen(columnasDelTablero(sinEntrada, ["ENTENDIMIENTO", "AMARRAR 🧰"], true))).toEqual([
      [ETAPA_ENTRADA, []],
      ["AMARRAR 🧰", ["b"]],
    ]);
  });

  it("sin nada fuera de las columnas, no hay «Otras etapas»", () => {
    const nombres = columnasDelTablero([nodo("a", null)], ["X"], false).map(({ nombre }) => nombre);
    expect(nombres).not.toContain(ETAPA_OTRAS);
  });
});
