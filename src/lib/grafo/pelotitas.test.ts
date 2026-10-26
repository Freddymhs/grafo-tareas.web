import { describe, expect, it } from "vitest";
import {
  ConexionResponseDtoTipo,
  NodoResumenDtoCara,
  NodoResumenDtoEstado,
  NodoResumenDtoTipo,
  type CarrilDto,
  type ConexionResponseDto,
} from "@/lib/api/generado/modelos";
import { pelotitasDelPlan } from "./pelotitas";

const pieza = (id: string) => ({
  id,
  tipo: NodoResumenDtoTipo.TAREA,
  titulo: id,
  estado: NodoResumenDtoEstado.ABIERTO,
  cara: NodoResumenDtoCara.PLAN,
  etiquetas: [],
});
const carril = (titulo: string, color: string | null, ids: readonly string[]): CarrilDto => ({
  id: color ? titulo : null,
  titulo,
  color,
  nodos: ids.map(pieza),
});
const depende = (
  origenId: string,
  destinoId: string,
  tipo: ConexionResponseDtoTipo = ConexionResponseDtoTipo.DEPENDE_DE,
): ConexionResponseDto => ({
  id: `${origenId}-${destinoId}`,
  origenId,
  destinoId,
  tipo,
  createdAt: "",
});

// La HU 24576 del 26-10: A · Detalle (1.1), B · Revisión (2.1 → 2.2 → 2.4), C · Áreas (3.1 → 1.1).
const A = carril("A · Detalle", "#0ea5e9", ["1.1"]);
const B = carril("B · Revisión", "#14b8a6", ["2.1", "2.2", "2.4"]);
const C = carril("C · Áreas", "#eab308", ["3.1"]);
const PLAN = [A, B, C];

describe("pelotitasDelPlan — la línea de cada tarjeta y las líneas que espera (el viejo Draft de Todoist)", () => {
  it("cada tarjeta lleva primero la pelotita de su carril", () => {
    const pelotitas = pelotitasDelPlan(PLAN, []);
    expect(pelotitas.get("1.1")).toEqual([{ carril: "A · Detalle", color: "#0ea5e9" }]);
    expect(pelotitas.get("2.4")).toEqual([{ carril: "B · Revisión", color: "#14b8a6" }]);
  });

  it("suma una pelotita por cada OTRO carril del que depende; depender del propio no suma", () => {
    const pelotitas = pelotitasDelPlan(PLAN, [depende("3.1", "1.1"), depende("2.2", "2.1")]);
    expect(pelotitas.get("3.1")?.map(({ carril }) => carril)).toEqual(["C · Áreas", "A · Detalle"]);
    expect(pelotitas.get("2.2")?.map(({ carril }) => carril)).toEqual(["B · Revisión"]);
  });

  it("dos dependencias al mismo carril dan una sola pelotita", () => {
    const conDosEnA = [carril("A · Detalle", "#0ea5e9", ["1.1", "1.2"]), B];
    const pelotitas = pelotitasDelPlan(conDosEnA, [depende("2.2", "1.1"), depende("2.2", "1.2")]);
    expect(pelotitas.get("2.2")).toHaveLength(2);
  });

  it("depender de algo que ya no está en el plan (cerrado, otra HU) no frena: no suma", () => {
    expect(pelotitasDelPlan(PLAN, [depende("3.1", "pieza-cerrada")]).get("3.1")).toHaveLength(1);
  });

  it("solo cuenta DEPENDE_DE: un bloqueo o una espera no son otra línea", () => {
    const bloqueo = depende("3.1", "1.1", ConexionResponseDtoTipo.BLOQUEADA_POR);
    expect(pelotitasDelPlan(PLAN, [bloqueo]).get("3.1")).toHaveLength(1);
  });

  it("«Sin carril» no tiene color: su tarjeta no lleva pelotita propia", () => {
    const pelotitas = pelotitasDelPlan(
      [A, carril("Sin carril", null, ["x"])],
      [depende("x", "1.1")],
    );
    expect(pelotitas.get("x")).toEqual([{ carril: "A · Detalle", color: "#0ea5e9" }]);
  });
});
