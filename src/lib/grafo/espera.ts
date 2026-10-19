import { UpdateNodoDtoEstado } from "@/lib/api/generado/modelos";

/**
 * Lo ya pedido que espera a que otro entregue o valide (Freddy, 2026-10-19: «la acción de pedirle… ya la hice. Ahora me
 * falta que él… me entregue la información»). Es el complemento `espera` de roles.yaml: una DUDA que frena lo que
 * cuelga, se lee con ⏳ mientras no llega y, cuando llega, se cierra con lo que llegó como motivo. Puro.
 */
export const ETIQUETA_ESPERA = "complemento:espera";
export const MARCA_ESPERA = "⏳";

const PREFIJO_COMPLEMENTO = "complemento:";

export function esEsperaAbierta({
  estado,
  etiquetas,
}: {
  readonly estado: string;
  readonly etiquetas?: readonly string[];
}): boolean {
  return estado === UpdateNodoDtoEstado.ABIERTO && (etiquetas ?? []).includes(ETIQUETA_ESPERA);
}

/** Una duda ya pedida pasa a esperar: su complemento cambia a `espera` (la API lee uno solo) y lo demás queda. */
export function etiquetasAlEsperar(etiquetas: readonly string[]): string[] {
  const sinComplemento = etiquetas.filter((etiqueta) => !etiqueta.startsWith(PREFIJO_COMPLEMENTO));
  return [...sinComplemento, ETIQUETA_ESPERA];
}

/** Marcada por error: vuelve a ser una duda abierta, sin la espera. */
export function etiquetasSinEspera(etiquetas: readonly string[]): string[] {
  return etiquetas.filter((etiqueta) => etiqueta !== ETIQUETA_ESPERA);
}
