import type { EspacioResponseDto, ProyectoResponseDto } from "@/lib/api/generado/modelos";
import {
  AVISO_ESPACIO_INEXISTENTE,
  AVISO_PROYECTO_INEXISTENTE,
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

export function resolverAlcance(
  alcance: Alcance,
  espacios: EspacioResponseDto[],
  proyectos: ProyectoResponseDto[] | undefined,
): AlcanceResuelto {
  const { espacioId, proyectoId } = alcance;
  if (!espacioId) return { alcance: {} };

  const espacio = espacios.find(({ id }) => id === espacioId);
  if (!espacio) return { alcance: {}, aviso: AVISO_ESPACIO_INEXISTENTE };
  if (!proyectoId) return { alcance: { espacioId }, espacio };
  if (proyectos === undefined) return { alcance: { espacioId, proyectoId }, espacio };

  const proyecto = proyectos.find(({ id }) => id === proyectoId);
  if (!proyecto) return { alcance: { espacioId }, espacio, aviso: AVISO_PROYECTO_INEXISTENTE };
  return { alcance: { espacioId, proyectoId }, espacio, proyecto };
}

export function ordenarPestanas<T extends { orden: number; archivado: boolean }>(items: T[]): T[] {
  return items.filter(({ archivado }) => !archivado).sort((a, b) => a.orden - b.orden);
}
