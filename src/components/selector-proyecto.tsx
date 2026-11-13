"use client";

import { useNodosControllerUpdate } from "@/lib/api/generado/nodos/nodos";
import { useProyectosControllerListarDeEspacio } from "@/lib/api/generado/proyectos/proyectos";
import { useInvalidarGrafo } from "@/lib/api/invalidar-grafo";
import { ordenarPestanas } from "@/lib/alcance";
import { useDirectorio } from "@/lib/alcance/use-directorio";
import { ESTILO_CAMPO } from "@/lib/constants";

const SIN_ESPACIO = "";

/** Mueve un nodo a otro proyecto de SU espacio (D7): a otro espacio no se ofrece, la API da 409 si el tipo no existe allá. */
export function SelectorProyecto({
  id,
  proyectoId,
}: {
  readonly id: string;
  readonly proyectoId: string;
}) {
  const directorio = useDirectorio();
  const espacioId = directorio.get(proyectoId)?.espacioId;
  const proyectos = useProyectosControllerListarDeEspacio(espacioId ?? SIN_ESPACIO, undefined, {
    query: { enabled: Boolean(espacioId) },
  });
  const invalidar = useInvalidarGrafo();
  const mover = useNodosControllerUpdate({ mutation: { onSuccess: invalidar } });

  const opciones = ordenarPestanas(proyectos.data ?? []);
  if (!espacioId || opciones.length === 0) return null;

  return (
    <label className="flex items-center gap-2 text-sm text-gray-600">
      Proyecto
      <select
        value={proyectoId}
        onChange={(evento) => mover.mutate({ id, data: { proyectoId: evento.target.value } })}
        disabled={mover.isPending}
        aria-label="Proyecto"
        className={ESTILO_CAMPO}
      >
        {opciones.map(({ id: opcionId, nombre }) => (
          <option key={opcionId} value={opcionId}>
            {nombre}
          </option>
        ))}
      </select>
      {mover.isError ? <span className="text-red-600">{mover.error.message}</span> : null}
    </label>
  );
}
