/** Cómo se pinta cada parte del avance de una FASE (FASE 11), como en fases.html: verde, rojo o gris. */
export const ESTADO_AVANCE = { hecho: "hecho", falta: "falta", noAplica: "noAplica" } as const;
export type EstadoAvance = (typeof ESTADO_AVANCE)[keyof typeof ESTADO_AVANCE];

export interface ParteDeAvance {
  readonly texto: string;
  readonly estado: EstadoAvance;
}

const SEPARADOR = " · ";
const FRACCION = /(\d+)\/(\d+)$/;

function estadoDe(parte: string): EstadoAvance {
  if (parte.endsWith("—")) return ESTADO_AVANCE.noAplica;
  if (parte.endsWith("✗") || parte.startsWith("falta ")) return ESTADO_AVANCE.falta;
  const fraccion = parte.match(FRACCION);
  if (fraccion && fraccion[1] !== fraccion[2]) return ESTADO_AVANCE.falta;
  return ESTADO_AVANCE.hecho;
}

/**
 * La línea de avance que deja `importar:fases` («entender ✓ · amarrar 15/15 · PR ✗ · falta URL commit»), partida para
 * pintarla. Es presentación: el avance lo calcula el importador desde las casillas del .md.
 */
export function partesDeAvance(linea: string): readonly ParteDeAvance[] {
  return linea
    .split(SEPARADOR)
    .map((texto) => texto.trim())
    .filter((texto) => texto.length > 0)
    .map((texto) => ({ texto, estado: estadoDe(texto) }));
}
