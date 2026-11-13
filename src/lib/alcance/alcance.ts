import type { EspacioResponseDto, ProyectoResponseDto } from "@/lib/api/generado/modelos";
import {
  AVISO_ESPACIO_INEXISTENTE,
  AVISO_PROYECTO_INEXISTENTE,
  MIN_PROYECTOS_CON_FILA,
  PARAM_ESPACIO,
  PARAM_PROYECTO,
} from "@/lib/constants";

export interface Alcance {
  espacioId?: string;
  proyectoId?: string;
}

export interface ParamsDeAlcance {
  proyecto?: string;
  espacio?: string;
}

export interface AlcanceResuelto {
  alcance: Alcance;
  espacio?: EspacioResponseDto;
  proyecto?: ProyectoResponseDto;
  aviso?: string;
}

export function leerAlcance(params: URLSearchParams): Alcance {
  const espacioId = params.get(PARAM_ESPACIO) || undefined;
  if (!espacioId) return {};
  const proyectoId = params.get(PARAM_PROYECTO) || undefined;
  return proyectoId ? { espacioId, proyectoId } : { espacioId };
}

export function paramsDeAlcance({ espacioId, proyectoId }: Alcance): ParamsDeAlcance {
  if (proyectoId) return { proyecto: proyectoId };
  if (espacioId) return { espacio: espacioId };
  return {};
}

export function hrefConAlcance(ruta: string, { espacioId, proyectoId }: Alcance): string {
  const query = new URLSearchParams();
  if (espacioId) query.set(PARAM_ESPACIO, espacioId);
  if (espacioId && proyectoId) query.set(PARAM_PROYECTO, proyectoId);
  const texto = query.toString();
  return texto ? `${ruta}?${texto}` : ruta;
}

export function ordenarPestanas<T extends { orden: number; archivado: boolean }>(items: T[]): T[] {
  return items.filter(({ archivado }) => !archivado).sort((a, b) => a.orden - b.orden);
}

/** Los proyectos de la fila (FASE 26, D2): los vigentes por orden si son dos o más; si no, ninguno (se ve el espacio entero). */
export function proyectosConFila<T extends { orden: number; archivado: boolean }>(
  proyectos: T[],
): T[] {
  const vigentes = ordenarPestanas(proyectos);
  return vigentes.length >= MIN_PROYECTOS_CON_FILA ? vigentes : [];
}

export interface EspacioResuelto {
  espacio?: EspacioResponseDto;
  aviso?: string;
}

/**
 * El espacio que se ve (FASE 26, D1): el pedido si existe; si no se pidió, el primero por orden; si ya no existe
 * (archivado, borrado o de otra base), el primero con aviso. Ninguno solo sin espacios.
 */
export function resolverEspacio(
  espacioId: string | undefined,
  espacios: EspacioResponseDto[],
): EspacioResuelto {
  const vigentes = ordenarPestanas(espacios);
  const [primero] = vigentes;
  if (!espacioId) return { espacio: primero };
  const pedido = vigentes.find(({ id }) => id === espacioId);
  if (pedido) return { espacio: pedido };
  return { espacio: primero, aviso: AVISO_ESPACIO_INEXISTENTE };
}

/**
 * El alcance que se ve (FASE 26, D1 y D2). `proyectos` son los del espacio resuelto (`undefined` si no se pudieron
 * leer). Sin fila de proyectos (0 o 1 vigente) se ve el espacio entero; con fila, el proyecto pedido o, si no se pidió o
 * ya no existe, el primero (con aviso si no existe).
 */
export function resolverAlcance(
  pedido: Alcance,
  espacios: EspacioResponseDto[],
  proyectos: ProyectoResponseDto[] | undefined,
): AlcanceResuelto {
  const { espacio, aviso } = resolverEspacio(pedido.espacioId, espacios);
  if (!espacio) return { alcance: {} };
  const espacioId = espacio.id;
  const proyectoPedido = espacioId === pedido.espacioId ? pedido.proyectoId : undefined;
  if (proyectos === undefined) {
    const alcance = proyectoPedido ? { espacioId, proyectoId: proyectoPedido } : { espacioId };
    return { alcance, espacio, aviso };
  }

  const conFila = proyectosConFila(proyectos);
  const elegido = conFila.find(({ id }) => id === proyectoPedido);
  const proyecto = elegido ?? conFila[0];
  if (!proyecto) return { alcance: { espacioId }, espacio, aviso };
  const noExiste = Boolean(proyectoPedido) && !elegido;
  return {
    alcance: { espacioId, proyectoId: proyecto.id },
    espacio,
    proyecto,
    aviso: noExiste ? AVISO_PROYECTO_INEXISTENTE : aviso,
  };
}
