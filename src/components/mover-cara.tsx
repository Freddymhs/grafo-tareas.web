"use client";

import { useNodosControllerUpdate } from "@/lib/api/generado/nodos/nodos";
import type { UpdateNodoDtoCara } from "@/lib/api/generado/modelos";
import { useInvalidarGrafo } from "@/lib/api/invalidar-grafo";
import { motivoMover, otraCara, textoMover } from "@/lib/grafo/mover-cara";

/** Mueve una tarjeta a la otra cara de su HU (FASE 17) y refresca el grafo. Lo usan el menú de la tarjeta y su detalle. */
export function useMoverCara(id: string, cara: UpdateNodoDtoCara) {
  const invalidar = useInvalidarGrafo();
  const actualizar = useNodosControllerUpdate({ mutation: { onSuccess: invalidar } });
  return {
    texto: textoMover(cara),
    moviendo: actualizar.isPending,
    error: actualizar.isError ? actualizar.error.message : null,
    mover: () =>
      actualizar.mutate({ id, data: { cara: otraCara(cara), motivo: motivoMover(cara) } }),
  };
}

/** El botón del detalle: en el teléfono no hay clic derecho. */
export function BotonMoverCara({
  id,
  cara,
  className,
}: {
  readonly id: string;
  readonly cara: UpdateNodoDtoCara;
  readonly className: string;
}) {
  const { texto, moviendo, error, mover } = useMoverCara(id, cara);
  return (
    <>
      <button type="button" disabled={moviendo} onClick={mover} className={className}>
        {texto}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </>
  );
}
