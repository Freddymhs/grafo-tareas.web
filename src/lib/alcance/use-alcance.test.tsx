import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { useAlcance, type AlcanceActivo } from "./use-alcance";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock("./use-hidratado", () => ({ useHidratado: () => true }));
vi.mock("@/lib/api/generado/espacios/espacios", () => ({
  useEspaciosControllerFindAll: () => ({ data: undefined, isPending: false, isError: true }),
}));
vi.mock("@/lib/api/generado/proyectos/proyectos", () => ({
  useProyectosControllerListarDeEspacio: () => ({ data: undefined, isPending: false }),
}));

describe("useAlcance sin poder leer los espacios", () => {
  it("avisa el fallo y no habilita las vistas del método, que pedirían todos los espacios mezclados", () => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const visto: { actual?: AlcanceActivo } = {};
    function Sonda() {
      visto.actual = useAlcance();
      return null;
    }
    act(() => createRoot(document.createElement("div")).render(<Sonda />));
    expect(visto.actual?.fallo).toBe(true);
    expect(visto.actual?.alcance).toEqual({});
    expect(visto.actual?.conMetodo).toBe(false);
  });
});
