import { describe, expect, it } from "vitest";
import type { ProyectoResponseDto } from "@/lib/api/generado/modelos";
import { NOMBRE_PROYECTO_GENERAL } from "@/lib/constants";
import { destinoDeCreacion } from "./destino-de-creacion";

const proyecto = (id: string, nombre: string): ProyectoResponseDto => ({
  id,
  espacioId: "e1",
  nombre,
  orden: 0,
  archivado: false,
});
const GENERAL = proyecto("p-general", NOMBRE_PROYECTO_GENERAL);
const THINKPAD = proyecto("p-thinkpad", "ThinkPad");

describe("destinoDeCreacion — dónde nace un nodo según la pestaña (D6)", () => {
  it("con proyecto elegido, ese proyecto", () => {
    expect(
      destinoDeCreacion({ espacioId: "e1", proyectoId: "p-thinkpad" }, [GENERAL, THINKPAD]),
    ).toEqual({ proyectoId: "p-thinkpad" });
  });

  it("solo con espacio, el General de ese espacio", () => {
    expect(destinoDeCreacion({ espacioId: "e1" }, [THINKPAD, GENERAL])).toEqual({
      proyectoId: "p-general",
    });
  });

  it("sin espacio, nada: la API usa el proyecto por defecto, como hoy", () => {
    expect(destinoDeCreacion({}, [GENERAL])).toEqual({});
  });

  it("un espacio sin General en la lista no inventa un proyecto", () => {
    expect(destinoDeCreacion({ espacioId: "e1" }, [THINKPAD])).toEqual({});
  });

  it("con la lista todavía sin cargar, tampoco", () => {
    expect(destinoDeCreacion({ espacioId: "e1" }, undefined)).toEqual({});
  });
});
