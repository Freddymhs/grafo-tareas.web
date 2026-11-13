"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { useEspaciosControllerFindAll } from "@/lib/api/generado/espacios/espacios";
import { getProyectosControllerListarDeEspacioQueryOptions } from "@/lib/api/generado/proyectos/proyectos";
import type { ProyectoResponseDto } from "@/lib/api/generado/modelos";
import { armarDirectorio } from "./directorio";
import type { Directorio } from "./directorio";

const CON_ARCHIVADOS = { archivados: true };
const soloLosDatos = (resultados: { data: ProyectoResponseDto[] | undefined }[]) =>
  resultados.map(({ data }) => data);

/** Todos los proyectos de todos los espacios, también los archivados: lo que se necesita para rotular un fantasma. */
export function useDirectorio(): Directorio {
  const espacios = useEspaciosControllerFindAll(CON_ARCHIVADOS);
  const listaDeEspacios = useMemo(() => espacios.data ?? [], [espacios.data]);
  const listas = useQueries({
    queries: listaDeEspacios.map(({ id }) =>
      getProyectosControllerListarDeEspacioQueryOptions(id, CON_ARCHIVADOS),
    ),
    combine: soloLosDatos,
  });

  return useMemo(() => {
    const porEspacio: Record<string, ProyectoResponseDto[]> = {};
    listaDeEspacios.forEach(({ id }, posicion) => {
      porEspacio[id] = listas[posicion] ?? [];
    });
    return armarDirectorio(listaDeEspacios, porEspacio);
  }, [listaDeEspacios, listas]);
}
