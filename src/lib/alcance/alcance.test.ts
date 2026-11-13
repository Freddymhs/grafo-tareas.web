import { describe, expect, it } from "vitest";
import type { EspacioResponseDto, ProyectoResponseDto } from "@/lib/api/generado/modelos";
import {
  hrefConAlcance,
  leerAlcance,
  ordenarPestanas,
  paramsDeAlcance,
  resolverAlcance,
} from "./alcance";

const SIGSA: EspacioResponseDto = {
  id: "e-sigsa",
  nombre: "SIGSA",
  orden: 0,
  archivado: false,
  metodo: "trabajo-hu",
  etapas: [],
};
const SAG: ProyectoResponseDto = {
  id: "p-sag",
  espacioId: SIGSA.id,
  nombre: "SAG",
  orden: 0,
  archivado: false,
};

describe("leerAlcance — el alcance viaja en la URL (D1)", () => {
  it("lee espacio y proyecto", () => {
    expect(leerAlcance(new URLSearchParams("espacio=e1&proyecto=p1"))).toEqual({
      espacioId: "e1",
      proyectoId: "p1",
    });
  });

  it("un proyecto sin espacio se descarta", () => {
    expect(leerAlcance(new URLSearchParams("proyecto=p1"))).toEqual({});
  });

  it("sin parámetros no hay alcance", () => {
    expect(leerAlcance(new URLSearchParams(""))).toEqual({});
  });
});

describe("paramsDeAlcance — del alcance a los parámetros de la API", () => {
  it("sin alcance no manda nada: «Todo» es el comportamiento de hoy (D5)", () => {
    expect(paramsDeAlcance({})).toEqual({});
  });

  it("con espacio manda espacio", () => {
    expect(paramsDeAlcance({ espacioId: "e1" })).toEqual({ espacio: "e1" });
  });

  it("con proyecto manda solo el proyecto", () => {
    expect(paramsDeAlcance({ espacioId: "e1", proyectoId: "p1" })).toEqual({ proyecto: "p1" });
  });
});

describe("hrefConAlcance — el menú conserva la pestaña", () => {
  it("agrega el espacio", () => {
    expect(hrefConAlcance("/hoy", { espacioId: "e1" })).toBe("/hoy?espacio=e1");
  });

  it("agrega espacio y proyecto", () => {
    expect(hrefConAlcance("/hoy", { espacioId: "e1", proyectoId: "p1" })).toBe(
      "/hoy?espacio=e1&proyecto=p1",
    );
  });

  it("sin alcance deja la ruta como está", () => {
    expect(hrefConAlcance("/hoy", {})).toBe("/hoy");
  });
});

describe("resolverAlcance — un id que ya no existe cae a «Todo» con aviso (D3)", () => {
  it("un espacio que no existe cae a Todo y avisa", () => {
    const resuelto = resolverAlcance({ espacioId: "x" }, [SIGSA], []);
    expect(resuelto.alcance).toEqual({});
    expect(resuelto.aviso).toBeDefined();
    expect(resuelto.espacio).toBeUndefined();
  });

  it("un proyecto que no existe cae a Todo el espacio y avisa", () => {
    const resuelto = resolverAlcance({ espacioId: SIGSA.id, proyectoId: "x" }, [SIGSA], [SAG]);
    expect(resuelto.alcance).toEqual({ espacioId: SIGSA.id });
    expect(resuelto.aviso).toBeDefined();
    expect(resuelto.espacio).toBe(SIGSA);
  });

  it("con los proyectos todavía cargando conserva el proyecto y no avisa", () => {
    const resuelto = resolverAlcance(
      { espacioId: SIGSA.id, proyectoId: "p-sag" },
      [SIGSA],
      undefined,
    );
    expect(resuelto.alcance).toEqual({ espacioId: SIGSA.id, proyectoId: "p-sag" });
    expect(resuelto.aviso).toBeUndefined();
  });

  it("un alcance válido se devuelve con su espacio y su proyecto, sin aviso", () => {
    const resuelto = resolverAlcance({ espacioId: SIGSA.id, proyectoId: SAG.id }, [SIGSA], [SAG]);
    expect(resuelto).toEqual({
      alcance: { espacioId: SIGSA.id, proyectoId: SAG.id },
      espacio: SIGSA,
      proyecto: SAG,
    });
  });

  it("sin alcance no hay aviso", () => {
    expect(resolverAlcance({}, [SIGSA], undefined)).toEqual({ alcance: {} });
  });
});

describe("ordenarPestanas — por `orden`, sin archivados (D2)", () => {
  it("ordena por orden y deja afuera los archivados", () => {
    const items = [
      { id: "c", orden: 2, archivado: false },
      { id: "x", orden: 0, archivado: true },
      { id: "a", orden: 0, archivado: false },
      { id: "b", orden: 1, archivado: false },
    ];
    expect(ordenarPestanas(items).map(({ id }) => id)).toEqual(["a", "b", "c"]);
  });

  it("no muta la lista que recibe", () => {
    const items = [
      { id: "b", orden: 1, archivado: false },
      { id: "a", orden: 0, archivado: false },
    ];
    ordenarPestanas(items);
    expect(items.map(({ id }) => id)).toEqual(["b", "a"]);
  });
});
