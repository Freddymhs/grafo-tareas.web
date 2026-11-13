"use client";

import type { TipoConexion } from "@/lib/constants";
import Link from "next/link";
import { useState } from "react";
import {
  useConexionesControllerCreate,
  useConexionesControllerFindAll,
  useConexionesControllerRemove,
} from "@/lib/api/generado/conexiones/conexiones";
import {
  useNodosControllerFindAll,
  useNodosControllerFindOne,
} from "@/lib/api/generado/nodos/nodos";
import { useInvalidarGrafo } from "@/lib/api/invalidar-grafo";
import { rotuloFantasma } from "@/lib/alcance";
import type { Directorio } from "@/lib/alcance";
import { useDirectorio } from "@/lib/alcance/use-directorio";
import { describirConexion } from "@/lib/grafo/describir-conexion";
import { textoDeBusqueda } from "@/lib/grafo/busqueda";
import {
  LIMITE_BUSQUEDA,
  TEXTO_CONEXION,
  TIPO_CONEXION_POR_DEFECTO,
  ESTILO_BOTON,
  ESTILO_CAMPO,
} from "@/lib/constants";

const TIPOS_CONEXION = Object.keys(TEXTO_CONEXION) as TipoConexion[];

/**
 * La conexión solo trae ids: el título del otro extremo se pide aparte (la caché de la query lo repite gratis). Si ese
 * extremo es de otro proyecto que el del detalle, va atenuado con el nombre de su proyecto (D8, FASE 24).
 */
function NombreNodo({
  id,
  proyectoDeReferenciaId,
  directorio,
}: {
  id: string;
  proyectoDeReferenciaId: string | undefined;
  directorio: Directorio;
}) {
  const nodo = useNodosControllerFindOne(id);
  const rotulo = nodo.data
    ? rotuloFantasma(nodo.data.proyectoId, proyectoDeReferenciaId, directorio)
    : null;
  return (
    <span className={rotulo ? "opacity-50" : undefined}>
      <Link href={`/nodos/${id}`} className="font-medium underline-offset-2 hover:underline">
        {nodo.data?.titulo ?? id}
      </Link>
      {rotulo ? <span className="ml-1 text-xs text-gray-500">({rotulo})</span> : null}
    </span>
  );
}

function ListaConexiones({ id }: { id: string }) {
  const referencia = useNodosControllerFindOne(id);
  const directorio = useDirectorio();
  const nombre = (otroId: string) => (
    <NombreNodo
      id={otroId}
      proyectoDeReferenciaId={referencia.data?.proyectoId}
      directorio={directorio}
    />
  );
  const conexiones = useConexionesControllerFindAll({ nodoId: id });
  const invalidar = useInvalidarGrafo();
  const quitar = useConexionesControllerRemove({ mutation: { onSuccess: invalidar } });

  if (conexiones.isPending) return <p className="text-sm text-gray-500">Cargando conexiones…</p>;
  if (conexiones.isError)
    return <p className="text-sm text-red-600">No se pudieron leer las conexiones.</p>;
  if (conexiones.data.length === 0) return <p className="text-sm text-gray-500">Sin conexiones.</p>;

  return (
    <ul className="space-y-1 text-sm">
      {conexiones.data.map((conexion) => {
        const descrita = describirConexion(conexion, id);
        return (
          <li key={descrita.id} className="flex items-center gap-2">
            {descrita.esOrigen ? (
              <span>
                este <em>{descrita.texto}</em> {nombre(descrita.otroId)}
              </span>
            ) : (
              <span>
                {nombre(descrita.otroId)} <em>{descrita.texto}</em> este
              </span>
            )}
            <button
              type="button"
              onClick={() => quitar.mutate({ id: descrita.id })}
              disabled={quitar.isPending}
              aria-label="Quitar conexión"
              className="text-xs text-gray-400 hover:text-red-600"
            >
              ✕
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** Conectar desde este nodo: "este [tipo] [el que busques]". Para la otra dirección se abre el otro nodo. */
function ConectarNodo({ origenId }: { origenId: string }) {
  const [tipo, setTipo] = useState<TipoConexion>(TIPO_CONEXION_POR_DEFECTO);
  const [q, setQ] = useState("");
  const invalidar = useInvalidarGrafo();
  const buscado = textoDeBusqueda(q);
  const busquedaActiva = buscado !== null;
  const candidatos = useNodosControllerFindAll(
    { q: buscado ?? "", limit: LIMITE_BUSQUEDA },
    { query: { enabled: busquedaActiva } },
  );
  const conectar = useConexionesControllerCreate({
    mutation: {
      onSuccess: () => {
        setQ("");
        return invalidar();
      },
    },
  });
  const resultados = (candidatos.data?.data ?? []).filter((nodo) => nodo.id !== origenId);

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span>este</span>
        <select
          value={tipo}
          onChange={(evento) => setTipo(evento.target.value as TipoConexion)}
          aria-label="Tipo de conexión"
          className={ESTILO_CAMPO}
        >
          {TIPOS_CONEXION.map((t) => (
            <option key={t} value={t}>
              {TEXTO_CONEXION[t]}
            </option>
          ))}
        </select>
        <input
          value={q}
          onChange={(evento) => setQ(evento.target.value)}
          placeholder="buscar nodo…"
          aria-label="Buscar nodo para conectar"
          className={`${ESTILO_CAMPO} min-w-56 flex-1`}
        />
      </div>
      {busquedaActiva && resultados.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {resultados.map((nodo) => (
            <li key={nodo.id}>
              <button
                type="button"
                disabled={conectar.isPending}
                onClick={() => conectar.mutate({ data: { origenId, destinoId: nodo.id, tipo } })}
                className={`${ESTILO_BOTON} bg-gray-100 text-gray-900`}
              >
                {nodo.tipo} · {nodo.titulo}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {busquedaActiva && candidatos.isSuccess && resultados.length === 0 ? (
        <p className="text-xs text-gray-500">Nada con ese texto.</p>
      ) : null}
      {conectar.isError ? <p className="text-sm text-red-600">{conectar.error.message}</p> : null}
    </div>
  );
}

export function ConexionesNodo({ id }: { id: string }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-gray-700">Conexiones</h2>
      <ListaConexiones id={id} />
      <ConectarNodo origenId={id} />
    </section>
  );
}
