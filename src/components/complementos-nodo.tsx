"use client";

import Link from "next/link";
import { useState } from "react";
import { useAreaControllerTodo } from "@/lib/api/generado/area/area";
import {
  useComplementosControllerCrear,
  useComplementosControllerDecidir,
  useComplementosControllerDeUnNodo,
  useComplementosControllerEscalar,
} from "@/lib/api/generado/complementos/complementos";
import type { ComplementoDeCatalogoDto, ComplementoResponseDto } from "@/lib/api/generado/modelos";
import { useRolesControllerLista } from "@/lib/api/generado/roles/roles";
import { useInvalidarGrafo } from "@/lib/api/invalidar-grafo";
import { ESTILO_BOTON, ESTILO_CAMPO, NODO_DUDA, NODO_PARA_RITUAL } from "@/lib/constants";

/** Una duda abierta se escala (al siguiente de la escalera del área) o se decide (quién contestó y dónde quedó). */
function AccionesDuda({ duda }: { duda: ComplementoResponseDto }) {
  const [decidiendo, setDecidiendo] = useState(false);
  const [quien, setQuien] = useState("");
  const [donde, setDonde] = useState("");
  const [texto, setTexto] = useState("");
  const invalidar = useInvalidarGrafo();
  const escalar = useComplementosControllerEscalar({ mutation: { onSuccess: invalidar } });
  const decidir = useComplementosControllerDecidir({
    mutation: {
      onSuccess: () => {
        setDecidiendo(false);
        invalidar();
      },
    },
  });
  const completa = [quien, donde, texto].every((campo) => campo.trim().length > 0);
  const error = escalar.error ?? decidir.error;

  return (
    <div className="mt-1 space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => escalar.mutate({ id: duda.id, data: {} })}
          disabled={escalar.isPending}
          className="text-xs font-medium text-indigo-700 hover:underline"
        >
          Escalar
        </button>
        <button
          type="button"
          onClick={() => setDecidiendo(!decidiendo)}
          className="text-xs font-medium text-green-700 hover:underline"
        >
          Decidir
        </button>
      </div>
      {decidiendo ? (
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(evento) => {
            evento.preventDefault();
            decidir.mutate({ id: duda.id, data: { quien, donde, texto } });
          }}
        >
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="La respuesta"
            aria-label="Respuesta"
            className={`${ESTILO_CAMPO} flex-1`}
          />
          <input
            value={quien}
            onChange={(e) => setQuien(e.target.value)}
            placeholder="Quién contestó"
            aria-label="Quién contestó"
            className={ESTILO_CAMPO}
          />
          <input
            value={donde}
            onChange={(e) => setDonde(e.target.value)}
            placeholder="Dónde quedó"
            aria-label="Dónde quedó"
            className={ESTILO_CAMPO}
          />
          <button type="submit" disabled={!completa || decidir.isPending} className={ESTILO_BOTON}>
            Guardar decisión
          </button>
        </form>
      ) : null}
      {error ? <p className="text-xs text-red-600">{error.message}</p> : null}
    </div>
  );
}

function ColgarComplemento({
  padreId,
  catalogo,
}: {
  padreId: string;
  catalogo: readonly ComplementoDeCatalogoDto[];
}) {
  const [tipo, setTipo] = useState(catalogo[0]?.clave ?? "");
  const [titulo, setTitulo] = useState("");
  const [ritual, setRitual] = useState("");
  const area = useAreaControllerTodo();
  const invalidar = useInvalidarGrafo();
  const crear = useComplementosControllerCrear({
    mutation: {
      onSuccess: () => {
        setTitulo("");
        invalidar();
      },
    },
  });
  const elegido = catalogo.find(({ clave }) => clave === tipo);
  const pideRitual = elegido?.nodo === NODO_PARA_RITUAL;
  const rituales = area.data?.rituales ?? [];
  const ritualElegido = ritual || rituales[0]?.clave || "";
  const listo = titulo.trim().length > 0 && (!pideRitual || ritualElegido !== "");

  return (
    <form
      className="flex flex-wrap gap-2"
      onSubmit={(evento) => {
        evento.preventDefault();
        crear.mutate({
          id: padreId,
          data: { tipo, titulo: titulo.trim(), ...(pideRitual ? { ritual: ritualElegido } : {}) },
        });
      }}
    >
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        aria-label="Tipo de complemento"
        className={ESTILO_CAMPO}
      >
        {catalogo.map(({ clave, nombre }) => (
          <option key={clave} value={clave}>
            {nombre}
          </option>
        ))}
      </select>
      {pideRitual ? (
        <select
          value={ritualElegido}
          onChange={(e) => setRitual(e.target.value)}
          aria-label="Ritual"
          className={ESTILO_CAMPO}
        >
          {rituales.map(({ clave, nombre }) => (
            <option key={clave} value={clave}>
              {nombre}
            </option>
          ))}
        </select>
      ) : null}
      <input
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Qué es…"
        aria-label="Título del complemento"
        className={`${ESTILO_CAMPO} flex-1`}
      />
      <button type="submit" disabled={!listo || crear.isPending} className={ESTILO_BOTON}>
        Colgar
      </button>
      {crear.isError ? <p className="w-full text-xs text-red-600">{crear.error.message}</p> : null}
    </form>
  );
}

/** Lo que cuelga de este nodo (C11, FASE 9): dudas, decisiones, apuntes, cosas para decir… y colgar uno nuevo. */
export function ComplementosNodo({ id }: { id: string }) {
  const roles = useRolesControllerLista();
  const complementos = useComplementosControllerDeUnNodo(id);
  const catalogo = roles.data?.complementos ?? [];
  if (catalogo.length === 0) return null;
  const nombreDe = new Map(catalogo.map(({ clave, nombre }) => [clave, nombre]));
  const lista = complementos.data ?? [];

  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-gray-700">Complementos</h2>
      {lista.length === 0 ? (
        <p className="mb-2 text-sm text-gray-500">Nada colgado todavía.</p>
      ) : null}
      <ul className="mb-3 space-y-2 text-sm">
        {lista.map((complemento) => {
          const abierta = complemento.tipo === NODO_DUDA && complemento.estado === "ABIERTO";
          return (
            <li key={complemento.id} className="rounded-lg border border-gray-200 p-2">
              <span className="mr-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800">
                {nombreDe.get(complemento.complemento) ?? complemento.complemento}
              </span>{" "}
              <Link
                href={`/nodos/${complemento.id}`}
                className={`font-medium hover:underline ${complemento.estado === "CERRADO" ? "line-through opacity-60" : ""}`}
              >
                {complemento.titulo}
              </Link>
              {abierta ? <AccionesDuda duda={complemento} /> : null}
            </li>
          );
        })}
      </ul>
      <ColgarComplemento padreId={id} catalogo={catalogo} />
    </section>
  );
}
