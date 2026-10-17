import type { NodoResponseDto } from "@/lib/api/generado/modelos";
import { ETAPA_ENTRADA, ETAPA_OTRAS } from "@/lib/constants";

export interface Columna {
  readonly nombre: string;
  readonly nodos: readonly NodoResponseDto[];
}

/**
 * Reparte los nodos en las columnas dadas, en ese orden, con la Entrada primero (lo que no tiene etapa).
 * Lo que está en una etapa que no es de estas columnas va a «Otras etapas» (solo si hay algo).
 * `soloConNodos`: la vista «Todo» esconde las columnas vacías salvo la Entrada; la de un rol muestra su flujo entero.
 */
export function columnasDelTablero(
  nodos: readonly NodoResponseDto[],
  columnas: readonly string[],
  soloConNodos: boolean,
): readonly Columna[] {
  const nombres = [ETAPA_ENTRADA, ...columnas];
  const conocidas = new Set(nombres);
  const columnaDe = (nodo: NodoResponseDto) => {
    const etapa = nodo.etapa ?? ETAPA_ENTRADA;
    return conocidas.has(etapa) ? etapa : ETAPA_OTRAS;
  };
  const armadas = [...nombres, ETAPA_OTRAS].map((nombre) => ({
    nombre,
    nodos: nodos.filter((nodo) => columnaDe(nodo) === nombre),
  }));
  return armadas.filter(({ nombre, nodos: deLaColumna }) => {
    const vacia = deLaColumna.length === 0;
    if (nombre === ETAPA_OTRAS) return !vacia;
    if (nombre === ETAPA_ENTRADA) return true;
    return !(soloConNodos && vacia);
  });
}
