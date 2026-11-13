import type { NodoResponseDto, TipoNodoResponseDto } from "@/lib/api/generado/modelos";
import { NOMBRE_TIPO_OTROS } from "@/lib/constants";

export interface GrupoPorTipo {
  readonly tipo: TipoNodoResponseDto;
  readonly nodos: NodoResponseDto[];
}

export function agruparPorTipo(
  nodos: readonly NodoResponseDto[],
  tipos: readonly TipoNodoResponseDto[],
): GrupoPorTipo[] {
  const nombresConocidos = new Set(tipos.map(({ nombre }) => nombre));
  const grupos = tipos.map((tipo) => ({
    tipo,
    nodos: nodos.filter(({ tipo: nombre }) => nombre === tipo.nombre),
  }));
  const sueltos = nodos.filter(({ tipo }) => !nombresConocidos.has(tipo));
  const otros: GrupoPorTipo = {
    tipo: {
      id: NOMBRE_TIPO_OTROS,
      espacioId: "",
      nombre: NOMBRE_TIPO_OTROS,
      tieneCiclo: false,
      accionable: false,
    },
    nodos: sueltos,
  };
  return [...grupos, otros].filter(({ nodos: deGrupo }) => deGrupo.length > 0);
}
