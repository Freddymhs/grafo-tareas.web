import type { ProyectoResponseDto } from "@/lib/api/generado/modelos";
import { NOMBRE_PROYECTO_GENERAL } from "@/lib/constants";
import type { Alcance } from "./alcance";

export interface DestinoDeCreacion {
  proyectoId?: string;
}

/** Sin espacio no se manda proyecto (la API usa el de por defecto, como hoy); sin el General a la vista tampoco: no se inventa. */
export function destinoDeCreacion(
  { espacioId, proyectoId }: Alcance,
  proyectosDelEspacio: ProyectoResponseDto[] | undefined,
): DestinoDeCreacion {
  if (!espacioId) return {};
  if (proyectoId) return { proyectoId };
  const general = proyectosDelEspacio?.find(({ nombre }) => nombre === NOMBRE_PROYECTO_GENERAL);
  return general ? { proyectoId: general.id } : {};
}
