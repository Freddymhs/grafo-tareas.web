import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import type { EspacioResponseDto } from "@/lib/api/generado/modelos";
import { useAlcance, type AlcanceActivo } from "./use-alcance";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

const consultas = vi.hoisted(() => ({ espacios: vi.fn(), proyectos: vi.fn() }));

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock("./use-hidratado", () => ({ useHidratado: () => true }));
vi.mock("@/lib/api/generado/espacios/espacios", () => ({
  useEspaciosControllerFindAll: consultas.espacios,
}));
vi.mock("@/lib/api/generado/proyectos/proyectos", () => ({
  useProyectosControllerListarDeEspacio: consultas.proyectos,
}));

const ESPACIO: EspacioResponseDto = {
  id: "e1",
  nombre: "SIGSA",
  orden: 0,
  archivado: false,
  metodo: "HU",
  etapas: [],
};

const leerAlcanceActivo = (): AlcanceActivo | undefined => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const visto: { actual?: AlcanceActivo } = {};
  function Sonda() {
    visto.actual = useAlcance();
    return null;
  }
  act(() => createRoot(document.createElement("div")).render(<Sonda />));
  return visto.actual;
};

describe("useAlcance sin poder leer los espacios", () => {
  it("avisa el fallo y no habilita las vistas del método, que pedirían todos los espacios mezclados", () => {
    consultas.espacios.mockReturnValue({ data: undefined, isPending: false, isError: true });
    consultas.proyectos.mockReturnValue({ data: undefined, isPending: false, isError: false });
    const alcance = leerAlcanceActivo();
    expect(alcance?.fallo).toBe(true);
    expect(alcance?.alcance).toEqual({});
    expect(alcance?.conMetodo).toBe(false);
  });
});

describe("useAlcance sin poder leer los proyectos del espacio visto", () => {
  it("avisa el fallo: sin la fila de proyectos se pediría todo el espacio en vez de un proyecto", () => {
    consultas.espacios.mockReturnValue({ data: [ESPACIO], isPending: false, isError: false });
    consultas.proyectos.mockReturnValue({ data: undefined, isPending: false, isError: true });
    const alcance = leerAlcanceActivo();
    expect(alcance?.fallo).toBe(true);
    expect(alcance?.alcance).toEqual({});
    expect(alcance?.conMetodo).toBe(false);
  });
});
