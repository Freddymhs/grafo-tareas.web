import type { PaginaDto, UpdateNodoDtoCara } from "@/lib/api/generado/modelos";

export interface Libro {
  /** El libro de GET /derivado/paginas: el id de la HU, o «sin-hu». Es lo que va en `?libro=`. */
  readonly libro: string;
  readonly nombre: string;
}

/** «Todas» no es un libro: sin `?libro=` la API devuelve todo. */
export const TODAS = "todas";
export const NOMBRE_TODAS = "Todas";

/** «HU 19565 · Registrar Toma…» → «HU 19565»: el botón lleva el número, como la pestaña de la VR. */
const corto = (titulo: string) => titulo.split(" · ")[0] ?? titulo;

/**
 * Las HU para filtrar el tablero (FASE 17), en el orden de las páginas de la VR y una vez cada una. Qué hay en cada
 * una lo decide la API; acá solo se arma la lista de botones. En el Plan, solo las HU que tienen plan.
 */
export function librosDe(paginas: readonly PaginaDto[], cara: UpdateNodoDtoCara): readonly Libro[] {
  const conLaCara = new Set(paginas.filter((p) => p.cara === cara).map(({ libro }) => libro));
  const vistos = new Set<string>();
  const libros: Libro[] = [];
  for (const { libro, titulo } of paginas) {
    const repetido = vistos.has(libro);
    if (repetido || !conLaCara.has(libro)) continue;
    vistos.add(libro);
    libros.push({ libro, nombre: corto(titulo) });
  }
  return libros;
}
