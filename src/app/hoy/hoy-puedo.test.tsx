import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { AVISO_ESPACIOS_NO_LEIDOS } from "@/lib/constants";
import { HoyPuedo } from "./hoy-puedo";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

const mocks = vi.hoisted(() => ({ alcance: vi.fn(), hoy: vi.fn() }));

vi.mock("@/lib/alcance/use-alcance", () => ({ useAlcance: mocks.alcance }));
vi.mock("@/lib/api/generado/derivado/derivado", () => ({
  useDerivadoControllerHoyPuedo: mocks.hoy,
}));
vi.mock("@/components/tarjeta-nodo", () => ({ TarjetaNodo: () => null }));

describe("HoyPuedo sin poder leer los espacios", () => {
  it("avisa y no pide nada: sin alcance la API devolvería todos los espacios mezclados", () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    mocks.alcance.mockReturnValue({ params: {}, cargando: false, fallo: true });
    mocks.hoy.mockReturnValue({ isPending: true, isError: false, data: undefined });
    const contenedor = document.createElement("div");
    act(() => createRoot(contenedor).render(<HoyPuedo />));
    expect(contenedor.textContent).toBe(AVISO_ESPACIOS_NO_LEIDOS);
    expect(mocks.hoy).toHaveBeenCalledWith({}, { query: { enabled: false } });
  });
});
