import type { EspacioResponseDto, ProyectoResponseDto } from "@/lib/api/generado/modelos";
import { NOMBRE_OTRO_PROYECTO, SUFIJO_ARCHIVADO } from "@/lib/constants";

export interface EntradaDirectorio {
  proyecto: string;
  espacio: string;
  espacioId: string;
  archivado: boolean;
}

export type Directorio = Map<string, EntradaDirectorio>;

const SEPARADOR_ROTULO = " · ";

export function armarDirectorio(
  espacios: EspacioResponseDto[],
  proyectosPorEspacio: Record<string, ProyectoResponseDto[]>,
): Directorio {
  const directorio: Directorio = new Map();
  for (const espacio of espacios) {
    for (const proyecto of proyectosPorEspacio[espacio.id] ?? []) {
      directorio.set(proyecto.id, {
        proyecto: proyecto.nombre,
        espacio: espacio.nombre,
        espacioId: espacio.id,
        archivado: proyecto.archivado || espacio.archivado,
      });
    }
  }
  return directorio;
}

export function rotuloFantasma(
  proyectoId: string,
  proyectoDeReferenciaId: string | undefined,
  directorio: Directorio,
): string | null {
  if (!proyectoDeReferenciaId || proyectoId === proyectoDeReferenciaId) return null;
  const entrada = directorio.get(proyectoId);
  if (!entrada) return NOMBRE_OTRO_PROYECTO;
  const partes = [
    entrada.proyecto,
    entrada.espacio,
    ...(entrada.archivado ? [SUFIJO_ARCHIVADO] : []),
  ];
  return partes.join(SEPARADOR_ROTULO);
}
