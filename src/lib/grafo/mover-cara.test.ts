import { describe, expect, it } from "vitest";
import { UpdateNodoDtoCara } from "@/lib/api/generado/modelos";
import { CARAS, motivoMover, otraCara, textoMover } from "./mover-cara";

const { REAL, PLAN } = UpdateNodoDtoCara;

describe("mover de cara (FASE 17): el «Mover a» del Draft al Trabajo", () => {
  it("cada cara lleva a la otra, ida y vuelta", () => {
    expect(otraCara(PLAN)).toBe(REAL);
    expect(otraCara(REAL)).toBe(PLAN);
  });

  it("el botón dice a dónde va la tarjeta, no dónde está", () => {
    expect(textoMover(PLAN)).toBe("Mover a Trabajo");
    expect(textoMover(REAL)).toBe("Mover al Plan");
  });

  it("la bitácora guarda de dónde a dónde", () => {
    expect(motivoMover(PLAN)).toBe("Movida desde la web: Plan → Trabajo");
  });

  it("el tablero abre en el trabajo", () => {
    expect(CARAS[0]).toBe(REAL);
  });
});
