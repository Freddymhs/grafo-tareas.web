import {
  ConexionResponseDtoTipo,
  type CarrilDto,
  type ConexionResponseDto,
} from "@/lib/api/generado/modelos";

/**
 * Las pelotitas de una tarjeta del Plan, como en el viejo Draft de Todoist (Freddy, 2026-10-26): la primera es el color
 * de su carril (la línea paralela) y las demás, una por cada OTRO carril que espera por sus DEPENDE_DE. El orden lo da
 * el emoji de la ronda. Solo cuenta lo que sigue en el plan: depender de una pieza cerrada ya no frena. Puro.
 */
export interface Pelotita {
  readonly carril: string;
  readonly color: string;
}

export function pelotitasDelPlan(
  carriles: readonly CarrilDto[],
  conexiones: readonly ConexionResponseDto[],
): ReadonlyMap<string, readonly Pelotita[]> {
  const carrilDe = new Map(
    carriles.flatMap((carril) => carril.nodos.map(({ id }) => [id, carril] as const)),
  );
  const pelotitaDe = ({ titulo, color }: CarrilDto): Pelotita | null =>
    color ? { carril: titulo, color } : null;

  const pelotitas = new Map<string, Pelotita[]>();
  carrilDe.forEach((carril, id) => {
    const propia = pelotitaDe(carril);
    pelotitas.set(id, propia ? [propia] : []);
  });

  conexiones
    .filter(({ tipo }) => tipo === ConexionResponseDtoTipo.DEPENDE_DE)
    .forEach(({ origenId, destinoId }) => {
      const propio = carrilDe.get(origenId);
      const ajeno = carrilDe.get(destinoId);
      if (!propio || !ajeno || ajeno === propio) return;
      const pelotita = pelotitaDe(ajeno);
      const yaEsta = pelotitas.get(origenId)?.some(({ carril }) => carril === ajeno.titulo);
      if (pelotita && !yaEsta) pelotitas.get(origenId)?.push(pelotita);
    });

  return pelotitas;
}
