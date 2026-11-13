"use client";

import { TipoNodo } from "@/lib/constants";
import { useState } from "react";
import type { FormEvent } from "react";
import { useComplementosControllerCrear } from "@/lib/api/generado/complementos/complementos";
import { useNodosControllerFindAll } from "@/lib/api/generado/nodos/nodos";
import { useRolesControllerLista } from "@/lib/api/generado/roles/roles";
import { useInvalidarGrafo } from "@/lib/api/invalidar-grafo";
import { tiposDeBloqueante, tituloDelBloqueante } from "@/lib/grafo/bloqueante";
import { ESTILO_BOTON, ESTILO_CAMPO, LIMITE_TABLERO } from "@/lib/constants";

/** Un bloqueante es urgente hasta que se contesta, como el `pendiente bloqueo` del adaptador. */
const PRIORIDAD_BLOQUEANTE = 1;
const SIN_PERSONA = "";

/**
 * «Agregar bloqueante» en el detalle: la pregunta, de qué tipo es y a quién espera, en una sola llamada a la API. La duda
 * nace siendo de este nodo, frenándolo y esperando a la persona (`lib/grafo/bloqueante.ts`). El tipo sale del catálogo:
 * duda de negocio, de código, o «esperando a otro» si ya se pidió (⏳).
 */
export function AgregarBloqueante({ id }: { readonly id: string }) {
  const [pregunta, setPregunta] = useState("");
  const [personaId, setPersonaId] = useState(SIN_PERSONA);
  const [tipoElegido, setTipoElegido] = useState("");
  const invalidar = useInvalidarGrafo();
  const roles = useRolesControllerLista();
  const personas = useNodosControllerFindAll({
    tipo: TipoNodo.PERSONA,
    estado: "ABIERTO",
    limit: LIMITE_TABLERO,
  });
  const agregar = useComplementosControllerCrear({
    mutation: {
      onSuccess: () => {
        setPregunta("");
        return invalidar();
      },
    },
  });

  const tipos = tiposDeBloqueante(roles.data?.complementos ?? []);
  const tipo = tipoElegido || tipos[0]?.clave || "";
  const lista = [...(personas.data?.data ?? [])].sort((a, b) => a.titulo.localeCompare(b.titulo));
  const persona = lista.find((p) => p.id === personaId);
  const listo = pregunta.trim().length > 0 && persona !== undefined && tipo !== "";

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!persona) return;
    agregar.mutate({
      id,
      data: {
        tipo,
        titulo: tituloDelBloqueante(pregunta.trim(), persona.titulo),
        personaId: persona.id,
        prioridad: PRIORIDAD_BLOQUEANTE,
      },
    });
  };

  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-gray-700">Agregar bloqueante</h2>
      <form onSubmit={enviar} className="flex flex-wrap items-center gap-2 text-sm">
        <input
          value={pregunta}
          onChange={(evento) => setPregunta(evento.target.value)}
          placeholder="¿Qué hay que preguntar o qué esperas?"
          aria-label="Pregunta"
          className={`${ESTILO_CAMPO} min-w-0 flex-1 basis-64`}
        />
        <select
          value={tipo}
          onChange={(evento) => setTipoElegido(evento.target.value)}
          aria-label="Tipo de bloqueante"
          className={ESTILO_CAMPO}
        >
          {tipos.map(({ clave, nombre }) => (
            <option key={clave} value={clave}>
              {nombre}
            </option>
          ))}
        </select>
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
        <button type="submit" disabled={!listo || agregar.isPending} className={ESTILO_BOTON}>
          Agregar
        </button>
      </form>
      {agregar.isError ? <p className="text-sm text-red-600">{agregar.error.message}</p> : null}
      <p className="mt-1 text-xs text-gray-500">
        Queda siendo de este nodo y lo frena hasta que se conteste. «Esperando a otro» es lo que ya
        pediste: se ve con ⏳ hasta que llegue.
      </p>
    </section>
  );
}
