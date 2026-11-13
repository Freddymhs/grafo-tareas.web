"use client";

import Link from "next/link";
import { CrearNodo } from "@/components/crear-nodo";
import { useNodosControllerFindAll } from "@/lib/api/generado/nodos/nodos";
import { useTiposControllerListarNodo } from "@/lib/api/generado/tipos/tipos";
import { hrefConAlcance } from "@/lib/alcance";
import { useAlcance } from "@/lib/alcance/use-alcance";
import { agruparPorTipo } from "@/lib/grafo/agrupar-por-tipo";
import { API_URL, LIMITE_TABLERO } from "@/lib/constants";

const SIN_ESPACIO = "";

/** El tablero de un espacio sin método de trabajo (D5): sus nodos agrupados por tipo, en el orden de sus tipos. */
export function TableroSimple() {
  const { alcance, espacio, params } = useAlcance();
  const nodos = useNodosControllerFindAll({ ...params, limit: LIMITE_TABLERO });
  const tipos = useTiposControllerListarNodo(alcance.espacioId ?? SIN_ESPACIO, {
    query: { enabled: Boolean(alcance.espacioId) },
  });

  if (nodos.isPending || tipos.isPending) return <p className="text-gray-500">Cargando…</p>;
  if (!nodos.isSuccess || !tipos.isSuccess)
    return <p className="text-red-600">No se pudo leer la API. ¿Está arriba en {API_URL}?</p>;

  const grupos = agruparPorTipo(nodos.data.data, tipos.data);
  const etapasDelEspacio = [{ titulo: espacio?.nombre ?? "", columnas: espacio?.etapas ?? [] }];

  return (
    <div className="space-y-6">
      <CrearNodo grupos={etapasDelEspacio} libro={undefined} />
      {grupos.length === 0 ? <p className="text-gray-500">Todavía no hay nada acá.</p> : null}
      {grupos.map(({ tipo, nodos: deTipo }) => (
        <section key={tipo.id}>
          <h2 className="mb-2 flex items-baseline gap-2 text-sm font-semibold text-gray-700">
            <span>{tipo.nombre}</span>
            <span className="text-xs font-normal text-gray-400">{deTipo.length}</span>
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {deTipo.map((nodo) => (
              <li key={nodo.id}>
                <Link
                  href={hrefConAlcance(`/nodos/${nodo.id}`, alcance)}
                  className="flex items-baseline justify-between gap-2 rounded-lg border border-gray-200 bg-white p-3 text-sm hover:border-gray-400"
                >
                  <span>{nodo.titulo}</span>
                  {tipo.tieneCiclo && nodo.estado ? (
                    <span className="text-xs text-gray-400">{nodo.estado}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
