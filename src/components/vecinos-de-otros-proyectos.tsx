"use client";

import Link from "next/link";
import { useDerivadoControllerVecinos } from "@/lib/api/generado/derivado/derivado";
import { hrefConAlcance, rotuloFantasma } from "@/lib/alcance";
import { useAlcance } from "@/lib/alcance/use-alcance";
import { useDirectorio } from "@/lib/alcance/use-directorio";

const SIN_PROYECTO = "";

/** Con un proyecto elegido, lo que está conectado con él desde otros proyectos (D8): atenuado y con el nombre del suyo. */
export function VecinosDeOtrosProyectos() {
  const { alcance } = useAlcance();
  const { proyectoId } = alcance;
  const directorio = useDirectorio();
  const vecinos = useDerivadoControllerVecinos(proyectoId ?? SIN_PROYECTO, {
    query: { enabled: Boolean(proyectoId) },
  });

  if (!proyectoId || !vecinos.data || vecinos.data.length === 0) return null;

  return (
    <section className="mt-6">
      <h2 className="mb-2 text-sm font-semibold text-gray-700">Conectado desde otros proyectos</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {vecinos.data.map((nodo) => (
          <li key={nodo.id}>
            <Link
              href={hrefConAlcance(`/nodos/${nodo.id}`, alcance)}
              className="block rounded-lg border border-gray-200 bg-white p-3 text-sm opacity-50 hover:border-gray-400"
            >
              <span>{nodo.titulo}</span>
              <span className="ml-2 text-xs text-gray-500">
                {rotuloFantasma(nodo.proyectoId, proyectoId, directorio)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
