import type { ProyectoResponseDto } from "@/lib/api/generado/modelos";
import { ordenarPestanas } from "./alcance";
import type { Alcance } from "./alcance";

export interface DestinoDeCreacion {
  proyectoId?: string;
}

/**
 * El proyecto activo o, sin fila de proyectos, el único vigente (FASE 26, D2). Sin espacio no se manda proyecto (la API
 * usa el de por defecto); sin un único proyecto a la vista tampoco: no se inventa.
 */
export function destinoDeCreacion(
  { espacioId, proyectoId }: Alcance,
  proyectosDelEspacio: ProyectoResponseDto[] | undefined,
): DestinoDeCreacion {
  if (!espacioId) return {};
  if (proyectoId) return { proyectoId };
  const vigentes = ordenarPestanas(proyectosDelEspacio ?? []);
  const [unico] = vigentes;
  return vigentes.length === 1 && unico ? { proyectoId: unico.id } : {};
}
