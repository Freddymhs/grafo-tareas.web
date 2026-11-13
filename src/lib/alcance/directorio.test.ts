import { describe, expect, it } from "vitest";
import type { EspacioResponseDto, ProyectoResponseDto } from "@/lib/api/generado/modelos";
import { NOMBRE_OTRO_PROYECTO } from "@/lib/constants";
import { armarDirectorio, rotuloFantasma } from "./directorio";

const espacio = (id: string, nombre: string, archivado = false): EspacioResponseDto => ({
  id,
  nombre,
  orden: 0,
  archivado,
  etapas: [],
});
const proyecto = (
  id: string,
  espacioId: string,
  nombre: string,
  archivado = false,
): ProyectoResponseDto => ({
  id,
  espacioId,
  nombre,
  orden: 0,
  archivado,
});

const SIGSA = espacio("e-sigsa", "SIGSA");
const MAQUINAS = espacio("e-maq", "Mis máquinas");
const VIEJO = espacio("e-viejo", "Core", true);
const SAG = proyecto("p-sag", SIGSA.id, "SAG");
const THINKPAD = proyecto("p-tp", MAQUINAS.id, "ThinkPad");
const MAC_ARCHIVADO = proyecto("p-mac", MAQUINAS.id, "Mac Mini", true);
const DEL_ESPACIO_VIEJO = proyecto("p-core", VIEJO.id, "Backend");

const directorio = armarDirectorio([SIGSA, MAQUINAS, VIEJO], {
  [SIGSA.id]: [SAG],
  [MAQUINAS.id]: [THINKPAD, MAC_ARCHIVADO],
  [VIEJO.id]: [DEL_ESPACIO_VIEJO],
});

describe("armarDirectorio — proyectoId → su proyecto y su espacio (D8)", () => {
  it("un proyecto activo de un espacio activo no está archivado", () => {
    expect(directorio.get("p-sag")).toEqual({
      proyecto: "SAG",
      espacio: "SIGSA",
      espacioId: "e-sigsa",
      archivado: false,
    });
  });

  it("un proyecto archivado marca archivado", () => {
    expect(directorio.get("p-mac")?.archivado).toBe(true);
  });

  it("un proyecto de un espacio archivado marca archivado", () => {
    expect(directorio.get("p-core")?.archivado).toBe(true);
  });

  it("un espacio sin lista de proyectos no rompe", () => {
    expect(armarDirectorio([SIGSA], {}).size).toBe(0);
  });
});

describe("rotuloFantasma — de qué proyecto viene un nodo atenuado", () => {
  it("el proyecto de referencia no es fantasma", () => {
    expect(rotuloFantasma("p-sag", "p-sag", directorio)).toBeNull();
  });

  it("sin proyecto de referencia nada es fantasma", () => {
    expect(rotuloFantasma("p-sag", undefined, directorio)).toBeNull();
  });

  it("otro proyecto: «proyecto · espacio»", () => {
    expect(rotuloFantasma("p-tp", "p-sag", directorio)).toBe("ThinkPad · Mis máquinas");
  });

  it("archivado suma el sufijo", () => {
    expect(rotuloFantasma("p-mac", "p-sag", directorio)).toBe(
      "Mac Mini · Mis máquinas · archivado",
    );
  });

  it("un id desconocido es «otro proyecto»", () => {
    expect(rotuloFantasma("p-nadie", "p-sag", directorio)).toBe(NOMBRE_OTRO_PROYECTO);
  });
});
