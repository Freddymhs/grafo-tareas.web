import { describe, expect, it } from "vitest";
import { UpdateNodoDtoEstado } from "@/lib/api/generado/modelos";
import { ETIQUETA_ESPERA, esEsperaAbierta, etiquetasAlEsperar, etiquetasSinEspera } from "./espera";

const { ABIERTO, CERRADO } = UpdateNodoDtoEstado;

describe("espera — lo ya pedido que espera a otro (Freddy, 2026-10-19: «ahora me falta que él me lo destrabe»)", () => {
  it("está esperando mientras siga abierta y lleve la etiqueta del complemento", () => {
    expect(esEsperaAbierta({ estado: ABIERTO, etiquetas: [ETIQUETA_ESPERA] })).toBe(true);
    expect(esEsperaAbierta({ estado: CERRADO, etiquetas: [ETIQUETA_ESPERA] })).toBe(false);
    expect(esEsperaAbierta({ estado: ABIERTO, etiquetas: ["complemento:duda-negocio"] })).toBe(
      false,
    );
  });

  it("al pasar a esperar reemplaza el complemento que tenía (la API lee uno solo) y deja las demás etiquetas", () => {
    expect(etiquetasAlEsperar(["complemento:duda-negocio", "bloqueo"])).toEqual([
      "bloqueo",
      ETIQUETA_ESPERA,
    ]);
    expect(etiquetasAlEsperar([])).toEqual([ETIQUETA_ESPERA]);
  });

  it("si se marcó por error, vuelve a ser una duda sin la marca de espera", () => {
    expect(etiquetasSinEspera(["bloqueo", ETIQUETA_ESPERA])).toEqual(["bloqueo"]);
  });
});
