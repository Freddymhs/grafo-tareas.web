"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useConexionesControllerCreate } from "@/lib/api/generado/conexiones/conexiones";
import { useNodosControllerCreate } from "@/lib/api/generado/nodos/nodos";
import { CreateConexionDtoTipo, type CreateNodoDtoTipo } from "@/lib/api/generado/modelos";
import { useInvalidarGrafo } from "@/lib/api/invalidar-grafo";
import type { Libro } from "@/lib/grafo/libros";
import {
  ESTILO_BOTON,
  ESTILO_CAMPO,
  ETAPA_ENTRADA,
  PRIORIDADES,
  TIPOS_NODO,
  TIPO_NODO_POR_DEFECTO,
} from "@/lib/constants";

const SIN_PRIORIDAD = "";

/**
 * Alta rápida como la de Todoist: título, tipo, columna y prioridad; lo demás se edita en el detalle. Tipo, columna y
 * prioridad aparecen recién al escribir: en el teléfono el formulario entero ocupaba media pantalla (FASE 11). Parado en
 * una HU, lo nuevo nace perteneciendo a ella: sin eso desaparecía del tablero filtrado (Freddy, 19-10).
 */
export function CrearNodo({
  etapas,
  libro,
}: {
  readonly etapas: readonly string[];
  readonly libro: Libro | undefined;
}) {
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<CreateNodoDtoTipo>(TIPO_NODO_POR_DEFECTO);
  const [etapa, setEtapa] = useState(ETAPA_ENTRADA);
  const [prioridad, setPrioridad] = useState(SIN_PRIORIDAD);
  const invalidar = useInvalidarGrafo();
  const historiaId = libro?.historiaId ?? null;
  const enUnaHu = historiaId !== null;
  const colgar = useConexionesControllerCreate({ mutation: { onSuccess: invalidar } });
  const crear = useNodosControllerCreate({
    mutation: {
      onSuccess: ({ id }) => {
        setTitulo("");
        if (enUnaHu) {
          colgar.mutate({
            data: { origenId: id, destinoId: historiaId, tipo: CreateConexionDtoTipo.PERTENECE_A },
          });
        }
        return invalidar();
      },
    },
  });

  const escribiendo = titulo.trim().length > 0;

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const tituloLimpio = titulo.trim();
    if (tituloLimpio.length === 0) return;
    crear.mutate({
      data: {
        tipo,
        titulo: tituloLimpio,
        etapa: etapa === ETAPA_ENTRADA ? undefined : etapa,
        prioridad: prioridad === SIN_PRIORIDAD ? undefined : Number(prioridad),
      },
    });
  };

  return (
    <form onSubmit={enviar} className="mb-4 flex flex-wrap items-center gap-2">
      <input
        value={titulo}
        onChange={(evento) => setTitulo(evento.target.value)}
        placeholder={enUnaHu ? `Nueva tarea en ${libro?.nombre}…` : "Nueva tarea…"}
        aria-label="Título"
        className={`${ESTILO_CAMPO} min-w-0 flex-1 basis-64`}
      />
      {escribiendo ? (
        <>
          <select
            value={tipo}
            onChange={(evento) => setTipo(evento.target.value as CreateNodoDtoTipo)}
            aria-label="Tipo"
            className={ESTILO_CAMPO}
          >
            {TIPOS_NODO.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={etapa}
            onChange={(evento) => setEtapa(evento.target.value)}
            aria-label="Etapa"
            className={ESTILO_CAMPO}
          >
            {[ETAPA_ENTRADA, ...etapas].map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          <select
            value={prioridad}
            onChange={(evento) => setPrioridad(evento.target.value)}
            aria-label="Prioridad"
            className={ESTILO_CAMPO}
          >
            <option value={SIN_PRIORIDAD}>sin prioridad</option>
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>
                p{p}
              </option>
            ))}
          </select>
          <button type="submit" disabled={crear.isPending} className={ESTILO_BOTON}>
            Crear
          </button>
        </>
      ) : null}
      {crear.isError ? <p className="text-sm text-red-600">{crear.error.message}</p> : null}
      {colgar.isError ? (
        <p className="text-sm text-red-600">
          Se creó, pero no quedó en {libro?.nombre}: {colgar.error.message}. Cuélgala desde su
          detalle.
        </p>
      ) : null}
    </form>
  );
}
