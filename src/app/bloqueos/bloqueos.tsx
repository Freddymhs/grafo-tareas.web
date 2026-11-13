"use client";

import { useDerivadoControllerLibera } from "@/lib/api/generado/derivado/derivado";
import { useNodosControllerFindAll } from "@/lib/api/generado/nodos/nodos";
import type { NodoResponseDto } from "@/lib/api/generado/modelos";
import { TarjetaNodo } from "@/components/tarjeta-nodo";
import { useAlcance } from "@/lib/alcance/use-alcance";
import { LIMITE_TABLERO } from "@/lib/constants";

/** "Si X contesta, se liberan N": la API calcula `libera` para cada persona y duda abierta. */
function Bloqueador({ nodo }: { nodo: NodoResponseDto }) {
  const libera = useDerivadoControllerLibera(nodo.id);
  const directos = libera.data?.directos ?? [];
  const cadena = libera.data?.cadena ?? [];
  const total = directos.length + cadena.length;

  return (
    <section className="rounded-xl border border-gray-200 p-4">
      <h2 className="font-semibold">
        {nodo.tipo === "PERSONA" ? "👤" : "❓"} {nodo.titulo}
        <span className="ml-2 text-sm font-normal text-gray-500">
          {libera.isPending
            ? "calculando…"
            : total === 0
              ? "no frena nada hoy"
              : `si contesta se liberan ${total}`}
        </span>
      </h2>
      {total > 0 ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[...directos, ...cadena].map((liberado) => (
            <TarjetaNodo key={liberado.id} nodo={liberado} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function Bloqueos() {
  const { params } = useAlcance();
  const personas = useNodosControllerFindAll({
    ...params,
    tipo: "PERSONA",
    estado: "ABIERTO",
    limit: LIMITE_TABLERO,
  });
  const dudas = useNodosControllerFindAll({
    ...params,
    tipo: "DUDA",
    estado: "ABIERTO",
    limit: LIMITE_TABLERO,
  });

  if (personas.isPending || dudas.isPending) return <p className="text-gray-500">Cargando…</p>;
  if (personas.isError || dudas.isError)
    return <p className="text-red-600">No se pudo leer la API.</p>;

  const bloqueadores = [...personas.data.data, ...dudas.data.data];
  if (bloqueadores.length === 0) return <p className="text-gray-500">Nadie bloquea nada.</p>;

  return (
    <div className="space-y-4">
      {bloqueadores.map((nodo) => (
        <Bloqueador key={nodo.id} nodo={nodo} />
      ))}
    </div>
  );
}
