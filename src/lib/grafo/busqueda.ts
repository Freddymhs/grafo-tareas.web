import { LARGO_MINIMO_BUSQUEDA } from "@/lib/constants";

/**
 * Lo que un buscador le manda a la API como `q` (título y descripción, sin distinguir mayúsculas): sin los espacios de
 * los bordes y desde 2 letras. Con menos, `null`: todavía no se busca. La usan el tablero y el «conectar» del detalle.
 */
export function textoDeBusqueda(escrito: string): string | null {
  const limpio = escrito.trim();
  return limpio.length >= LARGO_MINIMO_BUSQUEDA ? limpio : null;
}

/**
 * Buscando, el tablero trae también las dudas abiertas: lo buscado puede ser una (Freddy, 21-10: «reportar issues de la
 * plantilla Adonis… por Teams» era una duda y el tablero solo pedía tareas y FASE). Sin búsqueda, el de siempre.
 */
export const buscaDudas = (buscado: string | null) => buscado !== null;
