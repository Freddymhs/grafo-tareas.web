import { TipoNodo } from "@/lib/constants";
import { describe, expect, it } from "vitest";
import {
  CambioResponseDtoTipo,
  UpdateNodoDtoEstado,
  type CambioResponseDto,
} from "@/lib/api/generado/modelos";
import { cierreDe, tituloConMarca } from "./cierre";
import { ETIQUETA_ESPERA } from "./espera";

const { DUDA, TAREA } = TipoNodo;
const { ABIERTO, CERRADO } = UpdateNodoDtoEstado;

const cambio = (
  campo: string,
  despues: string,
  motivo: string | null,
  createdAt: string,
): CambioResponseDto => ({
  id: createdAt,
  nodoId: "duda",
  titulo: "¿quién asigna las Unidades en QA?",
  tipo: CambioResponseDtoTipo.EDICION,
  campo,
  despues,
  motivo,
  createdAt,
});

describe("tituloConMarca — una duda contestada se ve con ✓ (Freddy, 2026-10-19)", () => {
  it("la DUDA cerrada lleva ✓ delante; abierta, o de otro tipo, va tal cual", () => {
    expect(tituloConMarca({ tipo: DUDA, estado: CERRADO, titulo: "¿quién?" })).toBe("✓ ¿quién?");
    expect(tituloConMarca({ tipo: DUDA, estado: ABIERTO, titulo: "¿quién?" })).toBe("¿quién?");
    expect(tituloConMarca({ tipo: TAREA, estado: CERRADO, titulo: "hecha" })).toBe("hecha");
  });

  it("lo ya pedido que espera a otro lleva ⏳ mientras no llegue; al cerrarse, ✓ como toda duda", () => {
    const espera = { tipo: DUDA, titulo: "la planilla", etiquetas: [ETIQUETA_ESPERA] };
    expect(tituloConMarca({ ...espera, estado: ABIERTO })).toBe("⏳ la planilla");
    expect(tituloConMarca({ ...espera, estado: CERRADO })).toBe("✓ la planilla");
  });
});

describe("cierreDe — de la bitácora (lo más reciente primero), cuándo y con qué motivo se cerró", () => {
  it("toma el cierre más reciente, aunque después haya otras ediciones", () => {
    const bitacora = [
      cambio("titulo", "otro título", "más claro", "2026-10-20T10:00:00.000Z"),
      cambio("estado", CERRADO, "Persona B: «el 1 y el 2 todavía no»", "2026-10-19T15:43:00.000Z"),
      cambio("estado", CERRADO, "un cierre anterior", "2026-10-10T09:00:00.000Z"),
    ];
    expect(cierreDe(bitacora)).toEqual({
      fecha: "2026-10-19",
      motivo: "Persona B: «el 1 y el 2 todavía no»",
    });
  });

  it("nunca cerrada a mano (la cerró un importador, sin bitácora): null", () => {
    expect(
      cierreDe([cambio("estado", ABIERTO, "reabierta", "2026-10-19T10:00:00.000Z")]),
    ).toBeNull();
    expect(cierreDe([])).toBeNull();
  });
});
