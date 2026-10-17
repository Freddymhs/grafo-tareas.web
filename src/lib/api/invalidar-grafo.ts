"use client";

import { useQueryClient } from "@tanstack/react-query";

/** Una mutación cambia lo derivado en todo el grafo (bloqueado, libera, hoy puedo, miembros de ramas): se invalida todo, no una clave. */
export function useInvalidarGrafo() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries();
}
