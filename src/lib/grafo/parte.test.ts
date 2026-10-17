import { describe, it, expect } from "vitest";
import type { DiaResponseDto, NodoResumenDto } from "@/lib/api/generado/modelos";
import { armarParte, pasaDelLimite } from "./parte";

const nodo = (titulo: string): NodoResumenDto => ({
  id: titulo,
  tipo: "TAREA",
  titulo,
  estado: "ABIERTO",
  color: null,
  etapa: null,
  etiquetas: [],
  prioridad: null,
  vence: null,
});
const dia = (parcial: Partial<DiaResponseDto>): DiaResponseDto => ({
  desde: "2026-10-16T12:00:00.000Z",
  limiteEnCurso: 2,
  terminado: [],
  enCurso: [],
  detenido: [],
  paraDecir: [],
  tramites: [],
  ...parcial,
});

describe("armarParte", () => {
  it("terminé / en curso / detenido, en ese orden, con lo que frena a cada una", () => {
    const texto = armarParte(
      dia({
        terminado: [nodo("FASE 30 husky")],
        enCurso: [
          { nodo: nodo("FASE 34"), etapa: "EN CODIGO", bloqueado: false },
          { nodo: nodo("FASE 35"), etapa: "TESTEADO", bloqueado: true },
        ],
        detenido: [{ nodo: nodo("FASE 35"), por: [nodo("¿feriados?"), nodo("Tomás")] }],
      }),
    );
    expect(texto).toBe(
      [
        "Terminé:\n- FASE 30 husky",
        "En curso:\n- FASE 34 (EN CODIGO)\n- FASE 35 (TESTEADO, frenada)",
        "Detenido:\n- FASE 35 — espera: ¿feriados?, Tomás",
      ].join("\n\n"),
    );
  });

  it("un bloque vacío lo dice; «para decir» solo aparece si hay algo", () => {
    expect(armarParte(dia({}))).toBe(
      "Terminé:\n- (nada)\n\nEn curso:\n- (nada)\n\nDetenido:\n- (nada)",
    );
    expect(
      armarParte(dia({ paraDecir: [{ nodo: nodo("avisar del feriado"), ritual: "Daily" }] })),
    ).toContain("Para decir:\n- avisar del feriado (Daily)");
  });
});

describe("pasaDelLimite", () => {
  it("avisa con más de dos en curso, no con dos", () => {
    const en = (n: number) =>
      Array.from({ length: n }, (_, i) => ({
        nodo: nodo(`t${i}`),
        etapa: "EN CODIGO",
        bloqueado: false,
      }));
    expect(pasaDelLimite(dia({ enCurso: en(2) }))).toBe(false);
    expect(pasaDelLimite(dia({ enCurso: en(3) }))).toBe(true);
  });
});
