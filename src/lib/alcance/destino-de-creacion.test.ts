import { describe, expect, it } from "vitest";
import type { ProyectoResponseDto } from "@/lib/api/generado/modelos";
import { destinoDeCreacion } from "./destino-de-creacion";

const proyecto = (id: string, nombre: string, archivado = false): ProyectoResponseDto => ({
  id,
  espacioId: "e1",
  nombre,
  orden: 0,
  archivado,
});
const GENERAL = proyecto("p-general", "General");
const THINKPAD = proyecto("p-thinkpad", "ThinkPad");

describe("destinoDeCreacion — dónde nace un nodo según la pestaña (D6, FASE 26)", () => {
  it("con proyecto elegido, ese proyecto", () => {
    expect(
      destinoDeCreacion({ espacioId: "e1", proyectoId: "p-thinkpad" }, [GENERAL, THINKPAD]),
    ).toEqual({ proyectoId: "p-thinkpad" });
  });

  it("sin fila de proyectos, el único vigente, se llame como se llame", () => {
    expect(destinoDeCreacion({ espacioId: "e1" }, [THINKPAD])).toEqual({
      proyectoId: "p-thinkpad",
    });
    expect(
      destinoDeCreacion({ espacioId: "e1" }, [GENERAL, proyecto("p-viejo", "Viejo", true)]),
    ).toEqual({ proyectoId: "p-general" });
  });

  it("sin espacio, nada: la API usa el proyecto por defecto", () => {
    expect(destinoDeCreacion({}, [GENERAL])).toEqual({});
  });

  it("un espacio sin proyectos no inventa uno", () => {
    expect(destinoDeCreacion({ espacioId: "e1" }, [])).toEqual({});
  });

  it("con la lista todavía sin cargar, tampoco", () => {
    expect(destinoDeCreacion({ espacioId: "e1" }, undefined)).toEqual({});
  });
});
