import { UpdateNodoDtoCara, type UpdateNodoDtoCara as Cara } from "@/lib/api/generado/modelos";

/**
 * Las dos caras de cada HU (FASE 17): el Trabajo (lo real) y el Plan (el Draft). Mover una tarjeta de cara es el
 * «Mover a» de Todoist: la pieza del plan que se toma pasa al trabajo. La API lo guarda en la bitácora y el importador
 * no la devuelve. Puro.
 */
export const NOMBRE_CARA: Readonly<Record<Cara, string>> = {
  [UpdateNodoDtoCara.REAL]: "Trabajo",
  [UpdateNodoDtoCara.PLAN]: "Plan",
};

/** Las caras en el orden del selector del tablero: el trabajo va primero. */
export const CARAS = [UpdateNodoDtoCara.REAL, UpdateNodoDtoCara.PLAN] as const;

export function otraCara(cara: Cara): Cara {
  return cara === UpdateNodoDtoCara.REAL ? UpdateNodoDtoCara.PLAN : UpdateNodoDtoCara.REAL;
}

/** «Mover a Trabajo» / «Mover al Plan»: lo que dice el botón para una tarjeta que está en `cara`. */
export function textoMover(cara: Cara): string {
  const destino = otraCara(cara);
  return destino === UpdateNodoDtoCara.REAL ? "Mover a Trabajo" : "Mover al Plan";
}

/** Lo que queda en la bitácora: de dónde a dónde y desde dónde se movió. */
export function motivoMover(cara: Cara): string {
  return `Movida desde la web: ${NOMBRE_CARA[cara]} → ${NOMBRE_CARA[otraCara(cara)]}`;
}
