import type { RolResponseDto } from "@/lib/api/generado/modelos";

/** El grupo de las columnas que no son de ningún rol: las que el tablero heredó de Todoist (DUDAS EN ESPERA, Precheck…). */
export const GRUPO_TABLERO = "Tablero";

export interface GrupoDeEtapas {
  readonly titulo: string;
  readonly columnas: readonly string[];
}

/**
 * Las columnas para un selector, agrupadas por su padre, el rol (Freddy, 20-10: «un grupo de etiquetas corresponde a un
 * padre»). Con un rol elegido, solo las suyas. En «Todo», un grupo por rol y al final las del tablero que ningún rol
 * declara. Una columna que comparten varios roles (ENTENDIMIENTO, APROBADO) aparece en cada uno: es la misma etapa.
 */
export function gruposDeEtapas(
  etapas: readonly string[],
  roles: readonly RolResponseDto[],
  rolElegido: string | null,
): readonly GrupoDeEtapas[] {
  const elegido = roles.find(({ clave }) => clave === rolElegido);
  if (elegido) return [{ titulo: elegido.nombre, columnas: elegido.columnas }];

  const deRoles = roles.map(({ nombre, columnas }) => ({ titulo: nombre, columnas }));
  const declaradas = new Set(roles.flatMap(({ columnas }) => columnas));
  const delTablero = etapas.filter((etapa) => !declaradas.has(etapa));
  const sinRol = delTablero.length > 0 ? [{ titulo: GRUPO_TABLERO, columnas: delTablero }] : [];
  return [...deRoles, ...sinRol];
}
