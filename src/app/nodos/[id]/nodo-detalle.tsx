"use client";

import {
  useDerivadoControllerBloqueado,
  useDerivadoControllerLibera,
} from "@/lib/api/generado/derivado/derivado";
import { useEtapasControllerLista } from "@/lib/api/generado/etapas/etapas";
import {
  useNodosControllerFindOne,
  useNodosControllerUpdate,
} from "@/lib/api/generado/nodos/nodos";
import { CreateNodoDtoTipo, UpdateNodoDtoEstado } from "@/lib/api/generado/modelos";
import { useInvalidarGrafo } from "@/lib/api/invalidar-grafo";
import { AgregarBloqueante } from "@/components/agregar-bloqueante";
import { CierreNodo } from "@/components/cierre-nodo";
import { ComplementosNodo } from "@/components/complementos-nodo";
import { ConexionesNodo } from "@/components/conexiones-nodo";
import { BotonMoverCara } from "@/components/mover-cara";
import { Descripcion } from "@/components/descripcion";
import { TarjetaNodo } from "@/components/tarjeta-nodo";
import { ESTILO_BOTON, ESTILO_CAMPO, ETAPA_ENTRADA, TIPOS_TABLERO } from "@/lib/constants";
import { tituloConMarca } from "@/lib/grafo/cierre";

const [, FASE] = TIPOS_TABLERO;

export function NodoDetalle({ id }: { id: string }) {
  const nodo = useNodosControllerFindOne(id);
  const bloqueado = useDerivadoControllerBloqueado(id);
  const libera = useDerivadoControllerLibera(id);
  const etapas = useEtapasControllerLista();
  const invalidar = useInvalidarGrafo();
  const actualizar = useNodosControllerUpdate({ mutation: { onSuccess: invalidar } });

  if (nodo.isPending) return <p className="text-gray-500">Cargando…</p>;
  if (nodo.isError) return <p className="text-red-600">No existe ese nodo o la API no responde.</p>;
  const n = nodo.data;
  const cerrado = n.estado === UpdateNodoDtoEstado.CERRADO;
  // D10: la FASE se mueve tildando su FASE_n.md (el hook y `importar:fases`); acá solo se ve y se conecta.
  const soloLectura = n.tipo === FASE;
  // Una duda o una persona no se frenan con otra duda: el bloqueante se agrega desde el trabajo que frena.
  const puedeTenerBloqueante =
    n.tipo !== CreateNodoDtoTipo.DUDA && n.tipo !== CreateNodoDtoTipo.PERSONA;
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
        <h1 className="mt-1 text-2xl font-bold [overflow-wrap:anywhere]">{tituloConMarca(n)}</h1>
        {n.etiquetas.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-gray-600">
            {n.etiquetas.map((etiqueta) => (
              <span key={etiqueta} className="rounded bg-gray-100 px-1.5 py-0.5">
                {etiqueta}
              </span>
            ))}
          </div>
        ) : null}
        {soloLectura ? (
          <p className="mt-3 text-sm text-gray-500">
            Una FASE se mueve tildando su FASE_n.md: el hook la mueve acá y `importar:fases` la
            corrige.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={n.etapa ?? ETAPA_ENTRADA}
              onChange={(evento) =>
                actualizar.mutate({
                  id,
                  data: {
                    etapa: evento.target.value === ETAPA_ENTRADA ? null : evento.target.value,
                  },
                })
              }
              disabled={actualizar.isPending || !etapas.isSuccess}
              aria-label="Etapa"
              className={ESTILO_CAMPO}
            >
              {[ETAPA_ENTRADA, ...(etapas.data ?? [])].map((etapa) => (
                <option key={etapa} value={etapa}>
                  {etapa}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={actualizar.isPending}
              onClick={() =>
                actualizar.mutate({
                  id,
                  data: {
                    estado: cerrado ? UpdateNodoDtoEstado.ABIERTO : UpdateNodoDtoEstado.CERRADO,
                  },
                })
              }
              className={ESTILO_BOTON}
            >
              {cerrado ? "Reabrir" : "Cerrar"}
            </button>
            <BotonMoverCara id={id} cara={n.cara} className={ESTILO_BOTON} />
            {actualizar.isError ? (
              <p className="text-sm text-red-600">{actualizar.error.message}</p>
            ) : null}
          </div>
        )}
      </header>

      {cerrado ? <CierreNodo id={id} tipo={n.tipo} /> : null}

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
          <Descripcion texto={n.descripcion} />
        </section>
      ) : null}

      <ComplementosNodo id={id} />

      {puedeTenerBloqueante ? <AgregarBloqueante id={id} cara={n.cara} /> : null}

      <ConexionesNodo id={id} />

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
