"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { conexionesControllerCreate } from "@/lib/api/generado/conexiones/conexiones";
import { nodosControllerCreate, useNodosControllerFindAll } from "@/lib/api/generado/nodos/nodos";
import {
  CreateNodoDtoTipo,
  NodosControllerFindAllTipo,
  type CreateNodoDtoCara,
} from "@/lib/api/generado/modelos";
import { useInvalidarGrafo } from "@/lib/api/invalidar-grafo";
import { conexionesDelBloqueante, tituloDelBloqueante } from "@/lib/grafo/bloqueante";
import { ETIQUETA_ESPERA } from "@/lib/grafo/espera";
import { ESTILO_BOTON, ESTILO_CAMPO, LIMITE_TABLERO } from "@/lib/constants";

/** Un bloqueante es urgente hasta que se contesta, como el `pendiente bloqueo` del adaptador. */
const PRIORIDAD_BLOQUEANTE = 1;
const SIN_PERSONA = "";

interface Bloqueante {
  readonly pregunta: string;
  readonly personaId: string;
  readonly personaNombre: string;
  /** Ya se le pidió: queda esperando a que entregue o valide (`lib/grafo/espera.ts`). */
  readonly yaPedido: boolean;
}

/**
 * «Agregar bloqueante» en el detalle: la pregunta y a quién espera, en una acción. La duda nace siendo de este nodo y
 * frenándolo (`lib/grafo/bloqueante.ts`); antes eran un alta y tres conexiones a mano, y una duda sin dueño se perdía.
 */
export function AgregarBloqueante({
  id,
  cara,
}: {
  readonly id: string;
  readonly cara: CreateNodoDtoCara;
}) {
  const [pregunta, setPregunta] = useState("");
  const [personaId, setPersonaId] = useState(SIN_PERSONA);
  const [yaPedido, setYaPedido] = useState(false);
  const invalidar = useInvalidarGrafo();
  const personas = useNodosControllerFindAll({
    tipo: NodosControllerFindAllTipo.PERSONA,
    estado: "ABIERTO",
    limit: LIMITE_TABLERO,
  });
  const agregar = useMutation({
    mutationFn: async ({
      pregunta: texto,
      personaId: aQuien,
      personaNombre,
      yaPedido: esperando,
    }: Bloqueante) => {
      const duda = await nodosControllerCreate({
        tipo: CreateNodoDtoTipo.DUDA,
        titulo: tituloDelBloqueante(texto, personaNombre),
        cara,
        prioridad: PRIORIDAD_BLOQUEANTE,
        ...(esperando ? { etiquetas: [ETIQUETA_ESPERA] } : {}),
      });
      const conexiones = conexionesDelBloqueante(duda.id, id, aQuien);
      await Promise.all(conexiones.map((conexion) => conexionesControllerCreate(conexion)));
    },
    onSuccess: () => {
      setPregunta("");
      setYaPedido(false);
      return invalidar();
    },
  });

  const lista = [...(personas.data?.data ?? [])].sort((a, b) => a.titulo.localeCompare(b.titulo));
  const persona = lista.find((p) => p.id === personaId);
  const listo = pregunta.trim().length > 0 && persona !== undefined;

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!persona) return;
    agregar.mutate({
      pregunta: pregunta.trim(),
      personaId: persona.id,
      personaNombre: persona.titulo,
      yaPedido,
    });
  };

  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-gray-700">Agregar bloqueante</h2>
      <form onSubmit={enviar} className="flex flex-wrap items-center gap-2 text-sm">
        <input
          value={pregunta}
          onChange={(evento) => setPregunta(evento.target.value)}
          placeholder="¿Qué hay que preguntar?"
          aria-label="Pregunta"
          className={`${ESTILO_CAMPO} min-w-0 flex-1 basis-64`}
        />
        <select
          value={personaId}
          onChange={(evento) => setPersonaId(evento.target.value)}
          aria-label="A quién espera"
          className={ESTILO_CAMPO}
        >
          <option value={SIN_PERSONA}>a quién espera…</option>
          {lista.map((p) => (
            <option key={p.id} value={p.id}>
              {p.titulo}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-gray-700">
          <input
            type="checkbox"
            checked={yaPedido}
            onChange={(evento) => setYaPedido(evento.target.checked)}
          />
          Ya lo pedí: queda esperando
        </label>
        <button type="submit" disabled={!listo || agregar.isPending} className={ESTILO_BOTON}>
          Agregar
        </button>
      </form>
      {agregar.isError ? <p className="text-sm text-red-600">{agregar.error.message}</p> : null}
      <p className="mt-1 text-xs text-gray-500">
        La duda queda siendo de este nodo y lo frena hasta que se conteste. Si ya lo pediste, se ve
        con ⏳ hasta que llegue.
      </p>
    </section>
  );
}
