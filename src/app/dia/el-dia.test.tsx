import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AVISO_COPIAR_FALLO } from "@/lib/constants";
import { ElDia } from "./el-dia";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

const mocks = vi.hoisted(() => ({ alcance: vi.fn(), dia: vi.fn() }));

vi.mock("@/lib/alcance/use-alcance", () => ({ useAlcance: mocks.alcance }));
vi.mock("@/lib/api/generado/derivado/derivado", () => ({ useDerivadoControllerDia: mocks.dia }));
vi.mock("@/lib/grafo/parte", () => ({ armarParte: () => "parte", pasaDelLimite: () => false }));
vi.mock("@/components/tarjeta-nodo", () => ({ TarjetaNodo: () => null }));

const DIA_VACIO = {
  enCurso: [],
  detenido: [],
  paraDecir: [],
  terminado: [],
  tramites: [],
  limiteEnCurso: 3,
};

function montarYCopiar(writeText: (texto: string) => Promise<void>) {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  mocks.alcance.mockReturnValue({
    alcance: {},
    conMetodo: true,
    cargando: false,
    fallo: false,
  });
  mocks.dia.mockReturnValue({ isPending: false, isError: false, data: DIA_VACIO });
  const contenedor = document.createElement("div");
  act(() => createRoot(contenedor).render(<ElDia />));
  const boton = contenedor.querySelector("button");
  return { contenedor, copiar: () => act(async () => boton?.click()) };
}

afterEach(() => vi.restoreAllMocks());

describe("ElDia: copiar el parte", () => {
  it("avisa si el portapapeles falla", async () => {
    const { contenedor, copiar } = montarYCopiar(() => Promise.reject(new Error("denegado")));
    await copiar();
    expect(contenedor.textContent).toContain(AVISO_COPIAR_FALLO);
    expect(contenedor.textContent).not.toContain("Copiado");
  });

  it("avisa «Copiado» y no el error cuando sale", async () => {
    const { contenedor, copiar } = montarYCopiar(() => Promise.resolve());
    await copiar();
    expect(contenedor.textContent).toContain("Copiado");
    expect(contenedor.textContent).not.toContain(AVISO_COPIAR_FALLO);
  });
});
