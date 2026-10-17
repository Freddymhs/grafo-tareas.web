"use client";

import { useEtapasControllerLista } from "@/lib/api/generado/etapas/etapas";
import { useNodosControllerFindAll } from "@/lib/api/generado/nodos/nodos";
import type { NodoResponseDto } from "@/lib/api/generado/modelos";
import { CrearNodo } from "@/components/crear-nodo";
import { TarjetaNodo } from "@/components/tarjeta-nodo";
import { API_URL, ETAPA_ENTRADA, LIMITE_TABLERO } from "@/lib/constants";

function agruparPorEtapa(
  nodos: readonly NodoResponseDto[],
): ReadonlyMap<string, NodoResponseDto[]> {
  const grupos = new Map<string, NodoResponseDto[]>();
  nodos.forEach((nodo) => {
    const clave = nodo.etapa ?? ETAPA_ENTRADA;
    grupos.set(clave, [...(grupos.get(clave) ?? []), nodo]);
  });
  return grupos;
}

/** El tablero de Freddy: una columna por etapa (las de GET /etapas, en orden) más la Entrada, con las tareas abiertas. */
export function Tablero() {
  const etapas = useEtapasControllerLista();
  const abiertas = useNodosControllerFindAll({
    tipo: "TAREA",
    estado: "ABIERTO",
    limit: LIMITE_TABLERO,
  });

  if (etapas.isPending || abiertas.isPending)
    return <p className="text-gray-500">Cargando el tablero…</p>;
  if (etapas.isError || abiertas.isError)
    return <p className="text-red-600">No se pudo leer la API. ¿Está arriba en {API_URL}?</p>;

  const columnas = [ETAPA_ENTRADA, ...etapas.data];
  const porEtapa = agruparPorEtapa(abiertas.data.data);

  return (
    <div>
      <CrearNodo etapas={etapas.data} />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columnas.map((etapa) => {
          const tarjetas = porEtapa.get(etapa) ?? [];
          return (
            <section key={etapa} className="w-72 shrink-0 rounded-xl bg-gray-50 p-3">
              <h2 className="mb-3 flex items-baseline justify-between text-sm font-semibold text-gray-700">
                <span>{etapa}</span>
                <span className="text-xs font-normal text-gray-400">{tarjetas.length}</span>
              </h2>
              <div className="space-y-2">
                {tarjetas.map((nodo) => (
                  <TarjetaNodo key={nodo.id} nodo={nodo} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
