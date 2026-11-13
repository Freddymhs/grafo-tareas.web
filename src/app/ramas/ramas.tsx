"use client";

import { useState } from "react";
import { useRamasControllerFindAll } from "@/lib/api/generado/ramas/ramas";
import { useNodosControllerFindAll } from "@/lib/api/generado/nodos/nodos";
import { TarjetaNodo } from "@/components/tarjeta-nodo";
import { useAlcance } from "@/lib/alcance/use-alcance";
import { AVISO_SIN_METODO, LIMITE_TABLERO } from "@/lib/constants";

const COLOR_SIN_DEFINIR = "#94a3b8";

function MiembrosDeRama({ ramaId }: { ramaId: string }) {
  const miembros = useNodosControllerFindAll({ rama: ramaId, limit: LIMITE_TABLERO });
  if (miembros.isPending) return <p className="text-gray-500">Cargando la rama…</p>;
  if (miembros.isError) return <p className="text-red-600">No se pudo leer la rama.</p>;
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {miembros.data.data.map((nodo) => (
        <TarjetaNodo key={nodo.id} nodo={nodo} />
      ))}
    </div>
  );
}

export function Ramas() {
  const { conMetodo, cargando } = useAlcance();
  const ramas = useRamasControllerFindAll({ query: { enabled: conMetodo } });
  const [seleccionada, setSeleccionada] = useState<string | null>(null);

  if (cargando) return <p className="text-gray-500">Cargando…</p>;
  if (!conMetodo) return <p className="text-gray-500">{AVISO_SIN_METODO}</p>;
  if (ramas.isPending) return <p className="text-gray-500">Cargando…</p>;
  if (ramas.isError) return <p className="text-red-600">No se pudo leer la API.</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {ramas.data.map((rama) => {
          const activa = rama.id === seleccionada;
          return (
            <button
              key={rama.id}
              type="button"
              onClick={() => setSeleccionada(activa ? null : rama.id)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                activa ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white"
              }`}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: rama.color ?? COLOR_SIN_DEFINIR }}
              />
              {rama.titulo}
              <span className={activa ? "text-gray-300" : "text-gray-400"}>{rama.miembros}</span>
            </button>
          );
        })}
      </div>
      {seleccionada ? <MiembrosDeRama ramaId={seleccionada} /> : null}
    </div>
  );
}
