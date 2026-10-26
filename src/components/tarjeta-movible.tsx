"use client";

import { useState } from "react";
import type { NodoResumenDto, PelotitaDto } from "@/lib/api/generado/modelos";
import { useMoverCara } from "@/components/mover-cara";
import { TarjetaNodo } from "@/components/tarjeta-nodo";

/**
 * Una tarjeta del tablero con el «Mover a» de Todoist (FASE 17): clic derecho → mover a la otra cara de su HU (del Plan
 * al Trabajo, o de vuelta). Las FASE no se mueven: son siempre trabajo real.
 */
export function TarjetaMovible({
  nodo,
  pelotitas,
}: {
  readonly nodo: NodoResumenDto;
  readonly pelotitas?: readonly PelotitaDto[];
}) {
  const [menuAbierto, abrirMenu] = useState(false);
  const { texto, moviendo, error, mover } = useMoverCara(nodo.id, nodo.cara);

  return (
    <div
      className="relative"
      onContextMenu={(evento) => {
        evento.preventDefault();
        abrirMenu(true);
      }}
    >
      <TarjetaNodo nodo={nodo} pelotitas={pelotitas} />
      {menuAbierto ? (
        <div
          role="menu"
          className="absolute right-2 top-2 z-10 flex flex-col rounded-md border border-gray-200 bg-white text-sm shadow-lg"
          onMouseLeave={() => abrirMenu(false)}
        >
          <button
            type="button"
            role="menuitem"
            disabled={moviendo}
            onClick={() => {
              mover();
              abrirMenu(false);
            }}
            className="px-3 py-2 text-left hover:bg-gray-100 disabled:opacity-50"
          >
            {texto}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => abrirMenu(false)}
            className="px-3 py-2 text-left text-gray-500 hover:bg-gray-100"
          >
            Cancelar
          </button>
        </div>
      ) : null}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
