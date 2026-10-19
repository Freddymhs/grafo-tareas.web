import { CreateConexionDtoTipo, type CreateConexionDto } from "@/lib/api/generado/modelos";

/**
 * Un bloqueante se crea desde lo que frena, en una sola acción (Freddy, 2026-10-19: «las cosas que voy a usar día a día
 * van a ser bastante repetitivas»). Así nunca nace sin dueño: una duda suelta cae en «Sin HU» y no se ve donde se trabaja.
 * La duda va en la cara de lo que frena, y la VR la muestra ahí (la API la ubica por su PERTENECE_A). Puro.
 */
const PREFIJO = "Para ";

/** «Para <persona>: <pregunta>», como las demás dudas del grafo; si ya lo trae, va tal cual. */
export function tituloDelBloqueante(pregunta: string, persona: string): string {
  const yaDiceAQuien = pregunta.startsWith(PREFIJO);
  return yaDiceAQuien ? pregunta : `${PREFIJO}${persona}: ${pregunta}`;
}

/** La duda espera a la persona, pertenece a lo que frena (su dueño) y eso queda bloqueado por ella. */
export function conexionesDelBloqueante(
  dudaId: string,
  frenadoId: string,
  personaId: string,
): CreateConexionDto[] {
  return [
    { origenId: dudaId, destinoId: personaId, tipo: CreateConexionDtoTipo.ESPERA_RESPUESTA_DE },
    { origenId: dudaId, destinoId: frenadoId, tipo: CreateConexionDtoTipo.PERTENECE_A },
    { origenId: frenadoId, destinoId: dudaId, tipo: CreateConexionDtoTipo.BLOQUEADA_POR },
  ];
}
