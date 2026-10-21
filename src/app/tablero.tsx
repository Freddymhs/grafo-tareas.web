"use client";

import { useDeferredValue, useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import {
  useDerivadoControllerPaginas,
  useDerivadoControllerPlan,
} from "@/lib/api/generado/derivado/derivado";
import { useEtapasControllerLista } from "@/lib/api/generado/etapas/etapas";
import { useNodosControllerFindAll } from "@/lib/api/generado/nodos/nodos";
import { useRolesControllerLista } from "@/lib/api/generado/roles/roles";
import { UpdateNodoDtoCara, type NodosControllerFindAllParams } from "@/lib/api/generado/modelos";
import { CrearNodo } from "@/components/crear-nodo";
import { TarjetaMovible } from "@/components/tarjeta-movible";
import { TarjetaNodo } from "@/components/tarjeta-nodo";
import { columnasDelTablero } from "@/lib/grafo/columnas-tablero";
import { gruposDeEtapas } from "@/lib/grafo/grupos-de-etapas";
import { textoDeBusqueda } from "@/lib/grafo/busqueda";
import { librosDe, NOMBRE_TODAS, TODAS, type Libro } from "@/lib/grafo/libros";
import { CARAS, NOMBRE_CARA } from "@/lib/grafo/mover-cara";
import {
  API_URL,
  ESTILO_CAMPO,
  LARGO_MAXIMO_BUSQUEDA,
  LIMITE_TABLERO,
  NOMBRE_ROL_TODO,
  OCULTAR_NOTAS,
  ROL_TODO,
  TIPOS_TABLERO,
} from "@/lib/constants";

const [TAREA, FASE] = TIPOS_TABLERO;
/** Al cambiar de rol o de HU se queda el tablero anterior hasta que llega el nuevo: sin parpadeo de «Cargando». */
const MANTENER = { query: { placeholderData: keepPreviousData } };
const ESTILO_COLUMNA =
  "flex max-h-[calc(100dvh-12rem)] w-64 shrink-0 flex-col rounded-xl bg-gray-50 p-3";

/** Una fila de botones excluyentes (la cara, la HU, el rol): el elegido, oscuro. */
function Pildoras({
  etiqueta,
  opciones,
  elegida,
  elegir,
}: {
  readonly etiqueta: string;
  readonly opciones: readonly { readonly clave: string; readonly nombre: string }[];
  readonly elegida: string;
  readonly elegir: (clave: string) => void;
}) {
  return (
    <nav aria-label={etiqueta} className="mb-3 flex flex-wrap gap-1.5">
      {opciones.map(({ clave, nombre }) => (
        <button
          key={clave}
          type="button"
          aria-pressed={clave === elegida}
          onClick={() => elegir(clave)}
          className={`rounded-full px-3 py-1 text-sm ${
            clave === elegida ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"
          }`}
        >
          {nombre}
        </button>
      ))}
    </nav>
  );
}

/**
 * El tablero de Freddy. Arriba, la cara (FASE 17): el Trabajo (lo real, una columna por etapa) o el Plan (el Draft, una
 * columna por carril en orden de ronda, como el tablero del reparto); y la HU, como las pestañas de la VR. Clic derecho
 * en una tarjeta la mueve a la otra cara. Qué hay en cada HU y en cada carril lo decide la API.
 */
export function Tablero() {
  const [cara, elegirCara] = useState<UpdateNodoDtoCara>(UpdateNodoDtoCara.REAL);
  const [libroElegido, elegirLibro] = useState<string>(TODAS);
  const paginas = useDerivadoControllerPaginas();
  const enPlan = cara === UpdateNodoDtoCara.PLAN;
  const libros = librosDe(paginas.data ?? [], cara);
  // Una HU elegida en una cara puede no tener la otra (la 19565 no tiene plan): se vuelve a «Todas».
  const elegido = libros.find(({ libro }) => libro === libroElegido);

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
      <Pildoras
        etiqueta="HU"
        opciones={[
          { clave: TODAS, nombre: NOMBRE_TODAS },
          ...libros.map(({ libro: clave, nombre }) => ({ clave, nombre })),
        ]}
        elegida={elegido?.libro ?? TODAS}
        elegir={elegirLibro}
      />
      {enPlan ? <TableroPlan libro={elegido?.libro} /> : <TableroTrabajo libro={elegido} />}
    </div>
  );
}

/**
 * El trabajo: tareas y FASE abiertas, una columna por etapa; por rol (?rol=), por HU (?libro=) y por texto (?q=, título
 * y descripción), lo decide la API. El buscador busca dentro de la HU y el rol elegidos (Freddy, 21-10: «para encontrar
 * tarjetas más fácilmente»).
 */
function TableroTrabajo({ libro }: { readonly libro: Libro | undefined }) {
  const [rolElegido, elegirRol] = useState<string>(ROL_TODO);
  const [escrito, escribir] = useState("");
  // Mientras se escribe, el tablero de antes sigue a la vista: la consulta va con el texto diferido.
  const buscado = textoDeBusqueda(useDeferredValue(escrito));
  const etapas = useEtapasControllerLista();
  const roles = useRolesControllerLista();
  const filtro: NodosControllerFindAllParams = {
    estado: "ABIERTO",
    notas: OCULTAR_NOTAS,
    limit: LIMITE_TABLERO,
    cara: UpdateNodoDtoCara.REAL,
    ...(libro ? { libro: libro.libro } : {}),
    ...(rolElegido === ROL_TODO ? {} : { rol: rolElegido }),
    ...(buscado ? { q: buscado } : {}),
  };
  const tareas = useNodosControllerFindAll({ ...filtro, tipo: TAREA }, MANTENER);
  const fases = useNodosControllerFindAll({ ...filtro, tipo: FASE }, MANTENER);
  const consultas = [etapas, roles, tareas, fases];

  if (consultas.some((consulta) => consulta.isPending))
    return <p className="text-gray-500">Cargando el tablero…</p>;
  if (!etapas.isSuccess || !roles.isSuccess || !tareas.isSuccess || !fases.isSuccess)
    return <p className="text-red-600">No se pudo leer la API. ¿Está arriba en {API_URL}?</p>;

  const rol = roles.data.roles.find(({ clave }) => clave === rolElegido);
  const nodos = [...fases.data.data, ...tareas.data.data];
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
    <>
      {roles.data.roles.length > 0 ? (
        <Pildoras etiqueta="Rol" opciones={opciones} elegida={rolElegido} elegir={elegirRol} />
      ) : null}
      {rol ? <p className="mb-3 text-sm text-gray-500">{rol.para}</p> : null}
      <input
        type="search"
        value={escrito}
        onChange={(evento) => escribir(evento.target.value)}
        placeholder="Buscar tarjetas…"
        aria-label="Buscar tarjetas"
        maxLength={LARGO_MAXIMO_BUSQUEDA}
        className={`${ESTILO_CAMPO} mb-2 w-full`}
      />
      {buscado ? (
        <p className="mb-3 text-sm text-gray-500">
          {nodos.length === 0
            ? `Nada abierto con «${buscado}». Lo cerrado no está en el tablero.`
            : `${nodos.length} con «${buscado}» en el título o la descripción.`}
        </p>
      ) : null}
      <CrearNodo
        grupos={gruposDeEtapas(etapas.data, roles.data.roles, rol?.clave ?? null)}
        libro={libro}
      />
      {/* El tablero entra en la pantalla: cada columna mide lo que tiene (items-start) y hace su propio scroll. */}
      <div className="flex items-start gap-3 overflow-x-auto pb-4">
        {columnas.map(({ nombre, que, nodos: tarjetas }) => (
          <section key={nombre} className={ESTILO_COLUMNA}>
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
    </>
  );
}

/** El plan (el Draft): una columna por carril, sus piezas en orden de ronda (GET /derivado/plan). */
function TableroPlan({ libro }: { readonly libro: string | undefined }) {
  const plan = useDerivadoControllerPlan(libro ? { libro } : undefined, MANTENER);

  if (plan.isPending) return <p className="text-gray-500">Cargando el plan…</p>;
  if (!plan.isSuccess)
    return <p className="text-red-600">No se pudo leer la API. ¿Está arriba en {API_URL}?</p>;
  if (plan.data.length === 0)
    return <p className="text-gray-500">Esta HU no tiene nada en el plan.</p>;

  return (
    <>
      <p className="mb-3 text-sm text-gray-500">
        El Draft: cada carril es una zona de código (dos personas no se pisan); las piezas, en orden
        de ronda (1️⃣ cimiento, 2️⃣ paralelo, 3️⃣ cruce). Clic derecho en una tarjeta → «Mover a
        Trabajo» cuando la tomas.
      </p>
      <div className="flex items-start gap-3 overflow-x-auto pb-4">
        {plan.data.map(({ id, titulo, color, nodos }) => (
          <section
            key={id ?? titulo}
            className={`${ESTILO_COLUMNA} border-t-4`}
            style={color ? { borderTopColor: color } : undefined}
          >
            <h2 className="flex items-baseline justify-between text-sm font-semibold text-gray-700">
              <span>{titulo}</span>
              <span className="text-xs font-normal text-gray-400">{nodos.length}</span>
            </h2>
            <div className="mt-3 min-h-0 space-y-2 overflow-y-auto">
              {nodos.map((nodo) => (
                <TarjetaMovible key={nodo.id} nodo={nodo} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
