import { describe, expect, it } from "vitest";
import type { EspacioResponseDto, ProyectoResponseDto } from "@/lib/api/generado/modelos";
import { AVISO_ESPACIO_INEXISTENTE, AVISO_PROYECTO_INEXISTENTE } from "@/lib/constants";
import {
  hrefConAlcance,
  leerAlcance,
  ordenarPestanas,
  paramsDeAlcance,
  proyectosConFila,
  resolverAlcance,
  resolverEspacio,
} from "./alcance";

const SIGSA: EspacioResponseDto = {
  id: "e-sigsa",
  nombre: "SIGSA",
  orden: 1,
  archivado: false,
  metodo: "trabajo-hu",
  etapas: [],
};
const MAQUINAS: EspacioResponseDto = {
  id: "e-maq",
  nombre: "Mis máquinas",
  orden: 0,
  archivado: false,
  metodo: null,
  etapas: [],
};
const ARCHIVADO: EspacioResponseDto = { ...MAQUINAS, id: "e-viejo", orden: -1, archivado: true };
const ESPACIOS = [SIGSA, ARCHIVADO, MAQUINAS];
const proyecto = (id: string, nombre: string, orden: number): ProyectoResponseDto => ({
  id,
  espacioId: SIGSA.id,
  nombre,
  orden,
  archivado: false,
});
const SAG = proyecto("p-sag", "SAG", 0);
const GENERAL = proyecto("p-general", "General", 1);
const DE_SIGSA = [GENERAL, SAG];

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
  it("sin alcance (no hay espacios) no manda nada", () => {
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

describe("resolverEspacio — el espacio que se ve nunca es «todo» (FASE 26, D1)", () => {
  it("sin espacio pedido, el primero vigente por orden, sin aviso", () => {
    expect(resolverEspacio(undefined, ESPACIOS)).toEqual({ espacio: MAQUINAS });
  });

  it("un espacio que no existe (archivado, borrado o de otra base) cae al primero y avisa", () => {
    expect(resolverEspacio(ARCHIVADO.id, ESPACIOS)).toEqual({
      espacio: MAQUINAS,
      aviso: AVISO_ESPACIO_INEXISTENTE,
    });
  });

  it("un espacio que existe queda, sin aviso", () => {
    expect(resolverEspacio(SIGSA.id, ESPACIOS)).toEqual({ espacio: SIGSA });
  });

  it("sin espacios, ninguno", () => {
    expect(resolverEspacio(undefined, [])).toEqual({});
  });
});

describe("proyectosConFila — la fila de proyectos solo con dos o más vigentes (FASE 26, D2)", () => {
  it("con dos o más, los vigentes por orden; un proyecto vacío cuenta igual", () => {
    expect(proyectosConFila(DE_SIGSA)).toEqual([SAG, GENERAL]);
  });

  it("con uno solo (o uno vigente y otro archivado), ninguno", () => {
    expect(proyectosConFila([GENERAL])).toEqual([]);
    expect(proyectosConFila([GENERAL, { ...SAG, archivado: true }])).toEqual([]);
    expect(proyectosConFila([])).toEqual([]);
  });
});

describe("resolverAlcance — el alcance efectivo nunca es «todo» (FASE 26, D1 y D2)", () => {
  it("sin nada pedido: el primer espacio; sin fila de proyectos, el espacio entero", () => {
    expect(resolverAlcance({}, ESPACIOS, [])).toEqual({
      alcance: { espacioId: MAQUINAS.id },
      espacio: MAQUINAS,
    });
  });

  it("con un solo proyecto (Mis máquinas) se ve el espacio entero aunque se haya pedido ese proyecto", () => {
    const general = { ...GENERAL, espacioId: MAQUINAS.id };
    expect(
      resolverAlcance({ espacioId: MAQUINAS.id, proyectoId: general.id }, ESPACIOS, [general]),
    ).toEqual({ alcance: { espacioId: MAQUINAS.id }, espacio: MAQUINAS });
  });

  it("con fila de proyectos y sin proyecto pedido, el primero por orden, sin aviso", () => {
    expect(resolverAlcance({ espacioId: SIGSA.id }, ESPACIOS, DE_SIGSA)).toEqual({
      alcance: { espacioId: SIGSA.id, proyectoId: SAG.id },
      espacio: SIGSA,
      proyecto: SAG,
    });
  });

  it("un proyecto que no existe cae al primero y avisa", () => {
    expect(resolverAlcance({ espacioId: SIGSA.id, proyectoId: "x" }, ESPACIOS, DE_SIGSA)).toEqual({
      alcance: { espacioId: SIGSA.id, proyectoId: SAG.id },
      espacio: SIGSA,
      proyecto: SAG,
      aviso: AVISO_PROYECTO_INEXISTENTE,
    });
  });

  it("un espacio que no existe cae al primero, avisa y suelta el proyecto pedido (era de otro espacio)", () => {
    expect(resolverAlcance({ espacioId: "x", proyectoId: SAG.id }, ESPACIOS, [])).toEqual({
      alcance: { espacioId: MAQUINAS.id },
      espacio: MAQUINAS,
      aviso: AVISO_ESPACIO_INEXISTENTE,
    });
  });

  it("sin la lista de proyectos conserva el proyecto pedido y no avisa", () => {
    const resuelto = resolverAlcance(
      { espacioId: SIGSA.id, proyectoId: SAG.id },
      ESPACIOS,
      undefined,
    );
    expect(resuelto.alcance).toEqual({ espacioId: SIGSA.id, proyectoId: SAG.id });
    expect(resuelto.aviso).toBeUndefined();
  });

  it("un alcance válido se devuelve con su espacio y su proyecto, sin aviso", () => {
    expect(
      resolverAlcance({ espacioId: SIGSA.id, proyectoId: GENERAL.id }, ESPACIOS, DE_SIGSA),
    ).toEqual({
      alcance: { espacioId: SIGSA.id, proyectoId: GENERAL.id },
      espacio: SIGSA,
      proyecto: GENERAL,
    });
  });

  it("sin espacios no hay alcance ni aviso", () => {
    expect(resolverAlcance({}, [], undefined)).toEqual({ alcance: {} });
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
