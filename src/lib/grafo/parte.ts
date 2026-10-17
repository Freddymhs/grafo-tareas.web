import type { DiaResponseDto } from "@/lib/api/generado/modelos";

const SIN_NADA = "- (nada)";

const lista = (lineas: readonly string[]) => (lineas.length > 0 ? lineas : [SIN_NADA]);

/**
 * El parte del día como texto para pegar (WhatsApp, Teams…): terminé / en curso / detenido, y lo que hay para decir.
 * Es lo que pidió Fabián antes de la daily (evaluación 1). Puro: los datos son los de GET /derivado/dia.
 */
export function armarParte({ terminado, enCurso, detenido, paraDecir }: DiaResponseDto): string {
  const bloques = [
    ["Terminé:", ...lista(terminado.map(({ titulo }) => `- ${titulo}`))],
    [
      "En curso:",
      ...lista(
        enCurso.map(({ nodo, etapa, bloqueado }) =>
          bloqueado ? `- ${nodo.titulo} (${etapa}, frenada)` : `- ${nodo.titulo} (${etapa})`,
        ),
      ),
    ],
    [
      "Detenido:",
      ...lista(
        detenido.map(
          ({ nodo, por }) =>
            `- ${nodo.titulo} — espera: ${por.map(({ titulo }) => titulo).join(", ")}`,
        ),
      ),
    ],
  ];
  const decir = paraDecir.map(({ nodo, ritual }) => `- ${nodo.titulo} (${ritual})`);
  const conDecir = decir.length > 0 ? [...bloques, ["Para decir:", ...decir]] : bloques;
  return conDecir.map((bloque) => bloque.join("\n")).join("\n\n");
}

/** Más tarjetas en curso que el límite acordado (C11: dos a la vez). */
export const pasaDelLimite = ({ enCurso, limiteEnCurso }: DiaResponseDto) =>
  enCurso.length > limiteEnCurso;
