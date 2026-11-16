import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { AVISO_DUDAS_NO_LEIDAS, AVISO_PAGINAS_NO_LEIDAS, TipoNodo } from "@/lib/constants";
import { Tablero } from "./tablero";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

const mocks = vi.hoisted(() => ({ alcance: vi.fn(), paginas: vi.fn(), nodos: vi.fn() }));

const LEIDO = { isPending: false, isError: false, isSuccess: true };
const FALLIDO = { isPending: false, isError: true, isSuccess: false, data: undefined };

vi.mock("@/lib/alcance/use-alcance", () => ({ useAlcance: mocks.alcance }));
vi.mock("@/lib/api/generado/derivado/derivado", () => ({
  useDerivadoControllerPaginas: mocks.paginas,
  useDerivadoControllerPlan: vi.fn(),
}));
vi.mock("@/lib/api/generado/nodos/nodos", () => ({ useNodosControllerFindAll: mocks.nodos }));
vi.mock("@/lib/api/generado/etapas/etapas", () => ({
  useEtapasControllerLista: () => ({ ...LEIDO, data: [] }),
}));
vi.mock("@/lib/api/generado/roles/roles", () => ({
  useRolesControllerLista: () => ({ ...LEIDO, data: { roles: [] } }),
}));
vi.mock("@/components/crear-nodo", () => ({ CrearNodo: () => null }));
vi.mock("@/components/vecinos-de-otros-proyectos", () => ({ VecinosDeOtrosProyectos: () => null }));
vi.mock("@/components/tarjeta-movible", () => ({ TarjetaMovible: () => null }));
vi.mock("@/components/tarjeta-nodo", () => ({ TarjetaNodo: () => null }));
vi.mock("./tablero-simple", () => ({ TableroSimple: () => null }));

function montar() {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  mocks.alcance.mockReturnValue({
    alcance: { espacioId: "e1" },
    params: { espacio: "e1" },
    conMetodo: true,
    cargando: false,
    fallo: false,
  });
  const contenedor = document.createElement("div");
  act(() => createRoot(contenedor).render(<Tablero />));
  return contenedor;
}

function escribir(contenedor: HTMLElement, texto: string) {
  const campo = contenedor.querySelector("input");
  const asignar = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  act(() => {
    asignar?.call(campo, texto);
    campo?.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

describe("Tablero con método: consultas que fallan", () => {
  it("avisa si no se pudieron leer las HU, en vez de dejar solo «Todas»", () => {
    mocks.paginas.mockReturnValue(FALLIDO);
    mocks.nodos.mockReturnValue({ ...LEIDO, data: { data: [] } });
    expect(montar().textContent).toContain(AVISO_PAGINAS_NO_LEIDAS);
  });

  it("avisa si la búsqueda no pudo traer las dudas", () => {
    mocks.paginas.mockReturnValue({ ...LEIDO, data: [] });
    mocks.nodos.mockImplementation((params: { tipo: string }) =>
      params.tipo === TipoNodo.DUDA ? FALLIDO : { ...LEIDO, data: { data: [] } },
    );
    const contenedor = montar();
    expect(contenedor.textContent).not.toContain(AVISO_DUDAS_NO_LEIDAS);
    escribir(contenedor, "plantilla");
    expect(contenedor.textContent).toContain(AVISO_DUDAS_NO_LEIDAS);
  });

  it("no avisa nada si todo se leyó", () => {
    mocks.paginas.mockReturnValue({ ...LEIDO, data: [] });
    mocks.nodos.mockReturnValue({ ...LEIDO, data: { data: [] } });
    const { textContent } = montar();
    expect(textContent).not.toContain(AVISO_PAGINAS_NO_LEIDAS);
    expect(textContent).not.toContain(AVISO_DUDAS_NO_LEIDAS);
  });
});
