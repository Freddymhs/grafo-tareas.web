"use client";

import { useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { useEtapasControllerLista } from "@/lib/api/generado/etapas/etapas";
import { useNodosControllerFindAll } from "@/lib/api/generado/nodos/nodos";
import { useRolesControllerLista } from "@/lib/api/generado/roles/roles";
import type { NodosControllerFindAllParams } from "@/lib/api/generado/modelos";
import { CrearNodo } from "@/components/crear-nodo";
import { TarjetaNodo } from "@/components/tarjeta-nodo";
import { columnasDelTablero } from "@/lib/grafo/columnas-tablero";
import {
  API_URL,
  LIMITE_TABLERO,
  NOMBRE_ROL_TODO,
  OCULTAR_NOTAS,
  ROL_TODO,
  TIPOS_TABLERO,
} from "@/lib/constants";

const [TAREA, FASE] = TIPOS_TABLERO;

/**
 * El tablero de Freddy: tareas y FASE abiertas, una columna por etapa. «Todo» junta todos los roles (columnas de
 * GET /etapas con algo adentro); el tablero de un rol muestra sus columnas de GET /roles y solo sus nodos (?rol=,
 * lo decide la API).
 */
export function Tablero() {
  const [rolElegido, elegirRol] = useState<string>(ROL_TODO);
  const etapas = useEtapasControllerLista();
  const roles = useRolesControllerLista();
  const filtro: NodosControllerFindAllParams = {
    estado: "ABIERTO",
    notas: OCULTAR_NOTAS,
    limit: LIMITE_TABLERO,
    ...(rolElegido === ROL_TODO ? {} : { rol: rolElegido }),
  };
  // Al cambiar de rol se queda el tablero anterior hasta que llega el nuevo: sin parpadeo de «Cargando».
  const mantener = { query: { placeholderData: keepPreviousData } };
  const tareas = useNodosControllerFindAll({ ...filtro, tipo: TAREA }, mantener);
  const fases = useNodosControllerFindAll({ ...filtro, tipo: FASE }, mantener);
  const consultas = [etapas, roles, tareas, fases];

  if (consultas.some((consulta) => consulta.isPending))
    return <p className="text-gray-500">Cargando el tablero…</p>;
  if (!etapas.isSuccess || !roles.isSuccess || !tareas.isSuccess || !fases.isSuccess)
    return <p className="text-red-600">No se pudo leer la API. ¿Está arriba en {API_URL}?</p>;

  const rol = roles.data.roles.find(({ clave }) => clave === rolElegido);
  const nodos = [...fases.data.data, ...tareas.data.data];
  const columnas = rol
    ? columnasDelTablero(nodos, rol.columnas, false)
    : columnasDelTablero(nodos, etapas.data, true);
  const opciones = [
    { clave: ROL_TODO, nombre: NOMBRE_ROL_TODO },
    ...roles.data.roles.map(({ clave, nombre }) => ({ clave, nombre })),
  ];

  return (
    <div>
      {roles.data.roles.length > 0 ? (
        <nav aria-label="Rol" className="mb-3 flex flex-wrap gap-1.5">
          {opciones.map(({ clave, nombre }) => (
            <button
              key={clave}
              type="button"
              aria-pressed={clave === rolElegido}
              onClick={() => elegirRol(clave)}
              className={`rounded-full px-3 py-1 text-sm ${
                clave === rolElegido ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {nombre}
            </button>
          ))}
        </nav>
      ) : null}
      {rol ? <p className="mb-3 text-sm text-gray-500">{rol.para}</p> : null}
      <CrearNodo etapas={etapas.data} />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columnas.map(({ nombre, nodos: tarjetas }) => (
          <section key={nombre} className="w-72 shrink-0 rounded-xl bg-gray-50 p-3">
            <h2 className="mb-3 flex items-baseline justify-between text-sm font-semibold text-gray-700">
              <span>{nombre}</span>
              <span className="text-xs font-normal text-gray-400">{tarjetas.length}</span>
            </h2>
            <div className="space-y-2">
              {tarjetas.map((nodo) => (
                <TarjetaNodo key={nodo.id} nodo={nodo} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
