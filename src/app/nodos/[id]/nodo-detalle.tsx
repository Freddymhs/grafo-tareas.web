"use client";

import Link from "next/link";
import { useConexionesControllerFindAll } from "@/lib/api/generado/conexiones/conexiones";
import {
  useDerivadoControllerBloqueado,
  useDerivadoControllerLibera,
} from "@/lib/api/generado/derivado/derivado";
import { useNodosControllerFindOne } from "@/lib/api/generado/nodos/nodos";
import { TarjetaNodo } from "@/components/tarjeta-nodo";
import { ETAPA_ENTRADA } from "@/lib/constants";

/** Las subtareas de Todoist entraron como "el padre DEPENDE_DE las hijas" (D3): se listan acá como subtareas. */
function Subtareas({ id }: { id: string }) {
  const dependencias = useConexionesControllerFindAll({ nodoId: id, tipo: "DEPENDE_DE" });
  const hijas = (dependencias.data ?? []).filter((c) => c.origenId === id);
  if (hijas.length === 0) return null;
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-gray-700">Subtareas ({hijas.length})</h2>
      <ul className="list-inside list-disc space-y-1 text-sm">
        {hijas.map((c) => (
          <li key={c.id}>
            <Link href={`/nodos/${c.destinoId}`} className="underline-offset-2 hover:underline">
              {c.destinoId}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function NodoDetalle({ id }: { id: string }) {
  const nodo = useNodosControllerFindOne(id);
  const bloqueado = useDerivadoControllerBloqueado(id);
  const libera = useDerivadoControllerLibera(id);

  if (nodo.isPending) return <p className="text-gray-500">Cargando…</p>;
  if (nodo.isError) return <p className="text-red-600">No existe ese nodo o la API no responde.</p>;
  const n = nodo.data;
  const porQue = bloqueado.data?.por ?? [];
  const liberados = [...(libera.data?.directos ?? []), ...(libera.data?.cadena ?? [])];

  return (
    <article className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wide text-gray-400">
          {n.tipo} · {n.estado} · {n.etapa ?? ETAPA_ENTRADA}
          {n.prioridad ? ` · p${n.prioridad}` : ""}
          {n.vence ? ` · vence ${n.vence.slice(0, 10)}` : ""}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{n.titulo}</h1>
        {n.etiquetas.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-gray-600">
            {n.etiquetas.map((etiqueta) => (
              <span key={etiqueta} className="rounded bg-gray-100 px-1.5 py-0.5">
                {etiqueta}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      {bloqueado.data?.bloqueado ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h2 className="mb-2 text-sm font-semibold text-red-800">Bloqueado por</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {porQue.map((b) => (
              <TarjetaNodo key={b.id} nodo={b} />
            ))}
          </div>
        </section>
      ) : bloqueado.data ? (
        <p className="text-sm text-green-700">Libre: nada lo bloquea.</p>
      ) : null}

      {n.descripcion ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Descripción</h2>
          <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-sans text-sm leading-relaxed text-gray-800">
            {n.descripcion}
          </pre>
        </section>
      ) : null}

      <Subtareas id={id} />

      {liberados.length > 0 ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">
            Si se cierra, se liberan {liberados.length}
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {liberados.map((l) => (
              <TarjetaNodo key={l.id} nodo={l} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
