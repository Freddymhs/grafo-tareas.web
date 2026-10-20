import { describe, it, expect } from "vitest";
import type { RolResponseDto } from "@/lib/api/generado/modelos";
import { GRUPO_TABLERO, gruposDeEtapas } from "./grupos-de-etapas";

const rol = (clave: string, nombre: string, columnas: readonly string[]): RolResponseDto => ({
  clave,
  nombre,
  para: "",
  columnas: [...columnas],
  etapas: [],
});

const PRODUCTO = rol("producto", "Producto", ["ENTENDIMIENTO", "EN CODIGO", "APROBADO"]);
const CALIDAD = rol("calidad", "Calidad", ["ENTENDIMIENTO", "AMARRAR 🧰", "APROBADO"]);
const ROLES = [PRODUCTO, CALIDAD];
// GET /etapas: las del tablero heredadas de Todoist y después las de los roles, todas en un solo nivel.
const ETAPAS = [
  "ENTENDIMIENTO",
  "EN CODIGO",
  "❓ DUDAS EN ESPERA",
  "AMARRAR 🧰",
  "APROBADO",
  "TRÁMITES DE CIERRE",
];

describe("gruposDeEtapas", () => {
  it("en «Todo»: un grupo por rol, con su nombre, y al final las del tablero que no son de ningún rol", () => {
    expect(gruposDeEtapas(ETAPAS, ROLES, null)).toEqual([
      { titulo: "Producto", columnas: ["ENTENDIMIENTO", "EN CODIGO", "APROBADO"] },
      { titulo: "Calidad", columnas: ["ENTENDIMIENTO", "AMARRAR 🧰", "APROBADO"] },
      { titulo: GRUPO_TABLERO, columnas: ["❓ DUDAS EN ESPERA", "TRÁMITES DE CIERRE"] },
    ]);
  });

  it("con un rol elegido: solo sus columnas, en su orden", () => {
    expect(gruposDeEtapas(ETAPAS, ROLES, "calidad")).toEqual([
      { titulo: "Calidad", columnas: ["ENTENDIMIENTO", "AMARRAR 🧰", "APROBADO"] },
    ]);
  });

  it("sin roles en el catálogo: todo va al grupo del tablero, como antes", () => {
    expect(gruposDeEtapas(ETAPAS, [], null)).toEqual([{ titulo: GRUPO_TABLERO, columnas: ETAPAS }]);
  });

  it("un rol elegido que no existe se trata como «Todo»", () => {
    expect(gruposDeEtapas(ETAPAS, ROLES, "no-existe")).toHaveLength(3);
  });
});
