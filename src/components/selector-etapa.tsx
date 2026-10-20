"use client";

import { ESTILO_CAMPO, ETAPA_ENTRADA } from "@/lib/constants";
import type { GrupoDeEtapas } from "@/lib/grafo/grupos-de-etapas";

/**
 * El selector de columna: «Sin columna» primero y después las columnas agrupadas por su rol (`gruposDeEtapas`). Lo
 * usan el alta rápida del tablero y el detalle, para que las dos listas sean la misma.
 */
export function SelectorEtapa({
  grupos,
  valor,
  cambiar,
  deshabilitado = false,
}: {
  readonly grupos: readonly GrupoDeEtapas[];
  readonly valor: string;
  readonly cambiar: (etapa: string) => void;
  readonly deshabilitado?: boolean;
}) {
  return (
    <select
      value={valor}
      onChange={(evento) => cambiar(evento.target.value)}
      disabled={deshabilitado}
      aria-label="Etapa"
      className={ESTILO_CAMPO}
    >
      <option value={ETAPA_ENTRADA}>{ETAPA_ENTRADA}</option>
      {grupos.map(({ titulo, columnas }) => (
        <optgroup key={titulo} label={titulo}>
          {columnas.map((columna) => (
            <option key={`${titulo}-${columna}`} value={columna}>
              {columna}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
