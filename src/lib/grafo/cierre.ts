import {
  CreateNodoDtoTipo,
  UpdateNodoDtoEstado,
  type CambioResponseDto,
} from "@/lib/api/generado/modelos";

/**
 * Lo resuelto no se borra: se cierra y queda en el histórico (Freddy, 2026-10-19: «si no, voy a olvidar que tenía estas
 * preguntas… y que las logré solucionar»). Una duda contestada se lee de un vistazo por su ✓ —en el texto, no una marca
 * sobre el nodo, que en la VR ya se descartó— y al abrirla dice con qué motivo se cerró. Puro.
 */
export const MARCA_CONTESTADA = "✓";

const CAMPO_ESTADO = "estado";

export interface Cierre {
  /** YYYY-MM-DD */
  readonly fecha: string;
  readonly motivo: string | null;
}

export function tituloConMarca({
  tipo,
  estado,
  titulo,
}: {
  readonly tipo: string;
  readonly estado: string;
  readonly titulo: string;
}): string {
  const contestada = tipo === CreateNodoDtoTipo.DUDA && estado === UpdateNodoDtoEstado.CERRADO;
  return contestada ? `${MARCA_CONTESTADA} ${titulo}` : titulo;
}

/** El cierre más reciente de la bitácora de un nodo (GET /nodos/:id/cambios, lo más reciente primero), o `null`. */
export function cierreDe(bitacora: readonly CambioResponseDto[]): Cierre | null {
  const cierre = bitacora.find(
    ({ campo, despues }) => campo === CAMPO_ESTADO && despues === UpdateNodoDtoEstado.CERRADO,
  );
  if (!cierre) return null;
  return { fecha: cierre.createdAt.slice(0, 10), motivo: cierre.motivo ?? null };
}
