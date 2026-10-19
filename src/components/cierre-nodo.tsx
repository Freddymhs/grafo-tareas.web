"use client";

import { CreateNodoDtoTipo } from "@/lib/api/generado/modelos";
import { usePulidoControllerCambiosDe } from "@/lib/api/generado/pulido/pulido";
import { cierreDe } from "@/lib/grafo/cierre";

/** Cómo se cerró un nodo: la fecha y el motivo de su bitácora. Una duda dice «Contestada»: su motivo es la respuesta. */
export function CierreNodo({ id, tipo }: { readonly id: string; readonly tipo: string }) {
  const bitacora = usePulidoControllerCambiosDe(id);
  if (!bitacora.isSuccess) return null;
  const cierre = cierreDe(bitacora.data);
  if (!cierre) return null;
  const como = tipo === CreateNodoDtoTipo.DUDA ? "Contestada" : "Cerrada";

  return (
    <section className="rounded-xl border border-green-200 bg-green-50 p-4">
      <h2 className="mb-1 text-sm font-semibold text-green-800">
        {como} el {cierre.fecha}
      </h2>
      {cierre.motivo ? (
        <p className="text-sm text-green-900 [overflow-wrap:anywhere]">{cierre.motivo}</p>
      ) : null}
    </section>
  );
}
