"use client";

import { useDerivadoControllerHoyPuedo } from "@/lib/api/generado/derivado/derivado";
import { TarjetaNodo } from "@/components/tarjeta-nodo";

export function HoyPuedo() {
  const hoy = useDerivadoControllerHoyPuedo();

  if (hoy.isPending) return <p className="text-gray-500">Calculando…</p>;
  if (hoy.isError) return <p className="text-red-600">No se pudo leer la API.</p>;
  if (hoy.data.length === 0) return <p className="text-gray-500">Nada libre: todo espera algo.</p>;

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {hoy.data.map((nodo) => (
        <TarjetaNodo key={nodo.id} nodo={nodo} />
      ))}
    </div>
  );
}
