import { UpdateNodoDtoCara, type NodosControllerFindAllParams } from "@/lib/api/generado/modelos";
import type { ParamsDeAlcance } from "@/lib/alcance";
import { LIMITE_TABLERO, OCULTAR_NOTAS, ROL_TODO } from "@/lib/constants";

export interface EntradaDelFiltro {
  readonly params: ParamsDeAlcance;
  readonly q?: string | null;
  readonly libro?: string;
  readonly rol?: string;
}

/** Buscando, la consulta cruza espacios: el alcance no viaja (spec §2.6: «sé que existe pero no me acuerdo dónde»). */
export function filtroDelTablero({
  params,
  q,
  libro,
  rol,
}: EntradaDelFiltro): NodosControllerFindAllParams {
  return {
    estado: "ABIERTO",
    notas: OCULTAR_NOTAS,
    limit: LIMITE_TABLERO,
    cara: UpdateNodoDtoCara.REAL,
    ...(q ? {} : params),
    ...(libro ? { libro } : {}),
    ...(rol && rol !== ROL_TODO ? { rol } : {}),
    ...(q ? { q } : {}),
  };
}
