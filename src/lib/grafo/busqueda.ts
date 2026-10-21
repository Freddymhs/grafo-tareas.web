import { LARGO_MINIMO_BUSQUEDA } from "@/lib/constants";

/**
 * Lo que un buscador le manda a la API como `q` (título y descripción, sin distinguir mayúsculas): sin los espacios de
 * los bordes y desde 2 letras. Con menos, `null`: todavía no se busca. La usan el tablero y el «conectar» del detalle.
 */
export function textoDeBusqueda(escrito: string): string | null {
  const limpio = escrito.trim();
  return limpio.length >= LARGO_MINIMO_BUSQUEDA ? limpio : null;
}
