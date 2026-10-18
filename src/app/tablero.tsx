"use client";

import { useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { useEtapasControllerLista } from "@/lib/api/generado/etapas/etapas";
import { useNodosControllerFindAll } from "@/lib/api/generado/nodos/nodos";
import { useRolesControllerLista } from "@/lib/api/generado/roles/roles";
import { UpdateNodoDtoCara, type NodosControllerFindAllParams } from "@/lib/api/generado/modelos";
import { CrearNodo } from "@/components/crear-nodo";
import { TarjetaMovible } from "@/components/tarjeta-movible";
import { TarjetaNodo } from "@/components/tarjeta-nodo";
import { columnasDelTablero } from "@/lib/grafo/columnas-tablero";
import { CARAS, NOMBRE_CARA } from "@/lib/grafo/mover-cara";
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
 * lo decide la API). Arriba, la cara (FASE 17): el Trabajo o el Plan (el Draft); clic derecho en una tarjeta la mueve
 * a la otra.
 */
export function Tablero() {
  const [rolElegido, elegirRol] = useState<string>(ROL_TODO);
  const [cara, elegirCara] = useState<UpdateNodoDtoCara>(UpdateNodoDtoCara.REAL);
  const enPlan = cara === UpdateNodoDtoCara.PLAN;
  const etapas = useEtapasControllerLista();
  const roles = useRolesControllerLista();
  const filtro: NodosControllerFindAllParams = {
    estado: "ABIERTO",
    notas: OCULTAR_NOTAS,
    limit: LIMITE_TABLERO,
    cara,
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
  // El Plan se lee en el orden del reparto: el título de cada pieza empieza por su ronda (1️⃣ cimiento, 2️⃣ paralelo…).
  const tarjetasDelPlan = [...tareas.data.data].sort((a, b) => a.titulo.localeCompare(b.titulo));
  const nodos = enPlan ? tarjetasDelPlan : [...fases.data.data, ...tareas.data.data];
  // Lo que significa cada columna, de roles.yaml: «AMARRAR 🧰» sola no se recuerda (Freddy, FASE 11). En la pestaña de
  // un rol, lo que dice ese rol; en «Todo», el primero que la declara (ENTENDIMIENTO es de varios y dice distinto).
  const declaradas = (rol ? [rol] : roles.data.roles)
    .flatMap(({ etapas: deRol }) => deRol)
    .flatMap(({ columna, que }) => (que ? [[columna, que] as const] : []))
    .reverse();
  const queDe = new Map(declaradas);
  const columnas = rol
    ? columnasDelTablero(nodos, rol.columnas, false, queDe)
    : columnasDelTablero(nodos, etapas.data, true, queDe);
  const opciones = [
    { clave: ROL_TODO, nombre: NOMBRE_ROL_TODO },
    ...roles.data.roles.map(({ clave, nombre }) => ({ clave, nombre })),
  ];

  return (
    <div>
      <nav aria-label="Cara" className="mb-3 inline-flex rounded-lg bg-gray-100 p-0.5">
        {CARAS.map((opcion) => (
          <button
            key={opcion}
            type="button"
            aria-pressed={opcion === cara}
            onClick={() => elegirCara(opcion)}
            className={`rounded-md px-3 py-1 text-sm ${
              opcion === cara ? "bg-white font-semibold text-gray-900 shadow-sm" : "text-gray-600"
            }`}
          >
            {NOMBRE_CARA[opcion]}
          </button>
        ))}
      </nav>
      {enPlan ? (
        <p className="mb-3 text-sm text-gray-500">
          El Draft: lo que se intuyó que había que hacer, por ronda. Clic derecho en una tarjeta →
          «Mover a Trabajo» cuando la tomas.
        </p>
      ) : null}
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
      {/* El tablero entra en la pantalla: cada columna mide lo que tiene (items-start) y hace su propio scroll. */}
      <div className="flex items-start gap-3 overflow-x-auto pb-4">
        {columnas.map(({ nombre, que, nodos: tarjetas }) => (
          <section
            key={nombre}
            className="flex max-h-[calc(100dvh-12rem)] w-64 shrink-0 flex-col rounded-xl bg-gray-50 p-3"
          >
            <h2 className="flex items-baseline justify-between text-sm font-semibold text-gray-700">
              <span>{nombre}</span>
              <span className="text-xs font-normal text-gray-400">{tarjetas.length}</span>
            </h2>
            {que ? <p className="mt-0.5 text-xs text-gray-500">{que}</p> : null}
            <div className="mt-3 min-h-0 space-y-2 overflow-y-auto">
              {tarjetas.map((nodo) =>
                nodo.tipo === TAREA ? (
                  <TarjetaMovible key={nodo.id} nodo={nodo} />
                ) : (
                  <TarjetaNodo key={nodo.id} nodo={nodo} />
                ),
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
