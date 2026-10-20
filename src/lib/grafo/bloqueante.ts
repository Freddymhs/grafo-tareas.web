import type { ComplementoDeCatalogoDto } from "@/lib/api/generado/modelos";
import { NODO_DUDA } from "@/lib/constants";

/**
 * Un bloqueante se crea desde lo que frena, en una sola llamada (Freddy, 2026-10-19: «las cosas que voy a usar día a día
 * van a ser bastante repetitivas»): `POST /nodos/:id/complementos` con su persona. La API lo cuelga de su dueño, lo deja
 * frenándolo y esperando a la persona en un solo commit, en la cara del dueño: nunca nace sin dueño ni a medias. Puro.
 */
const PREFIJO = "Para ";

/** «Para <persona>: <pregunta>», como las demás dudas del grafo; si ya lo trae, va tal cual. */
export function tituloDelBloqueante(pregunta: string, persona: string): string {
  const yaDiceAQuien = pregunta.startsWith(PREFIJO);
  return yaDiceAQuien ? pregunta : `${PREFIJO}${persona}: ${pregunta}`;
}

/** Lo que se puede colgar como bloqueante: los complementos que nacen como DUDA (frenan), en el orden del catálogo. */
export function tiposDeBloqueante(
  catalogo: readonly ComplementoDeCatalogoDto[],
): ComplementoDeCatalogoDto[] {
  return catalogo.filter(({ nodo }) => nodo === NODO_DUDA);
}
