"use client";

import { TipoConexion } from "@/lib/constants";
import { useState } from "react";
import type { FormEvent } from "react";
import { useConexionesControllerCreate } from "@/lib/api/generado/conexiones/conexiones";
import { useNodosControllerCreate } from "@/lib/api/generado/nodos/nodos";
import { useProyectosControllerListarDeEspacio } from "@/lib/api/generado/proyectos/proyectos";
import { useTiposControllerListarNodo } from "@/lib/api/generado/tipos/tipos";
import { useInvalidarGrafo } from "@/lib/api/invalidar-grafo";
import { destinoDeCreacion } from "@/lib/alcance";
import { useAlcance } from "@/lib/alcance/use-alcance";
import type { GrupoDeEtapas } from "@/lib/grafo/grupos-de-etapas";
import type { Libro } from "@/lib/grafo/libros";
import { SelectorEtapa } from "@/components/selector-etapa";
import {
  ESTILO_BOTON,
  ESTILO_CAMPO,
  ETAPA_ENTRADA,
  PRIORIDADES,
  TIPOS_NODO,
  TIPO_NODO_POR_DEFECTO,
} from "@/lib/constants";

const SIN_PRIORIDAD = "";
const SIN_ESPACIO = "";

/**
 * Alta rápida como la de Todoist: título, tipo, columna y prioridad; lo demás se edita en el detalle. Tipo, columna y
 * prioridad aparecen recién al escribir: en el teléfono el formulario entero ocupaba media pantalla (FASE 11). Parado en
 * una HU, lo nuevo nace perteneciendo a ella: sin eso desaparecía del tablero filtrado (Freddy, 19-10). Las columnas
 * vienen agrupadas por rol, y con un rol elegido arriba, solo las suyas (Freddy, 20-10).
 */
export function CrearNodo({
  grupos,
  libro,
}: {
  readonly grupos: readonly GrupoDeEtapas[];
  readonly libro: Libro | undefined;
}) {
  const [titulo, setTitulo] = useState("");
  const [tipoElegido, setTipo] = useState<string>(TIPO_NODO_POR_DEFECTO);
  const [etapa, setEtapa] = useState(ETAPA_ENTRADA);
  const [prioridad, setPrioridad] = useState(SIN_PRIORIDAD);
  const invalidar = useInvalidarGrafo();
  const { alcance, conMetodo } = useAlcance();
  const { espacioId } = alcance;
  const tiposDelEspacio = useTiposControllerListarNodo(espacioId ?? SIN_ESPACIO, {
    query: { enabled: Boolean(espacioId) },
  });
  const proyectosDelEspacio = useProyectosControllerListarDeEspacio(
    espacioId ?? SIN_ESPACIO,
    undefined,
    {
      query: { enabled: Boolean(espacioId) },
    },
  );
  const tipos = espacioId ? (tiposDelEspacio.data ?? []).map(({ nombre }) => nombre) : TIPOS_NODO;
  const tipo = tipos.includes(tipoElegido) ? tipoElegido : (tipos[0] ?? TIPO_NODO_POR_DEFECTO);
  const historiaId = conMetodo ? (libro?.historiaId ?? null) : null;
  const enUnaHu = historiaId !== null;
  const colgar = useConexionesControllerCreate({ mutation: { onSuccess: invalidar } });
  const crear = useNodosControllerCreate({
    mutation: {
      onSuccess: ({ id }) => {
        setTitulo("");
        if (enUnaHu) {
          colgar.mutate({
            data: { origenId: id, destinoId: historiaId, tipo: TipoConexion.PERTENECE_A },
          });
        }
        return invalidar();
      },
    },
  });

  const escribiendo = titulo.trim().length > 0;
  // Al cambiar de rol, la columna elegida puede no ser del rol nuevo: entonces vuelve a «Sin columna».
  const etapaVigente = grupos.some(({ columnas }) => columnas.includes(etapa))
    ? etapa
    : ETAPA_ENTRADA;

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const tituloLimpio = titulo.trim();
    if (tituloLimpio.length === 0) return;
    crear.mutate({
      data: {
        tipo,
        titulo: tituloLimpio,
        ...destinoDeCreacion(alcance, proyectosDelEspacio.data),
        etapa: etapaVigente === ETAPA_ENTRADA ? undefined : etapaVigente,
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
            onChange={(evento) => setTipo(evento.target.value)}
            aria-label="Tipo"
            className={ESTILO_CAMPO}
          >
            {tipos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <SelectorEtapa grupos={grupos} valor={etapaVigente} cambiar={setEtapa} />
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
