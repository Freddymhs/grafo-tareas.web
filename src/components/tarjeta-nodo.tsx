import Link from "next/link";
import type { NodoResponseDto, NodoResumenDto } from "@/lib/api/generado/modelos";
import { PRIORIDAD_VISIBLE_MAXIMA, TIPOS_TABLERO } from "@/lib/constants";

type Nodo = NodoResumenDto | NodoResponseDto;

const tieneTablero = (nodo: Nodo): nodo is NodoResponseDto => "etiquetas" in nodo;
const [, FASE] = TIPOS_TABLERO;

/** Una tarea (o FASE, marcada) como tarjeta: título, etiquetas, prioridad y fecha. Es la unidad del tablero, de "hoy puedo" y de las ramas. */
export function TarjetaNodo({ nodo }: { nodo: Nodo }) {
  const cerrado = nodo.estado === "CERRADO";
  const detalle = tieneTablero(nodo) ? nodo : null;
  const prioridadVisible =
    detalle?.prioridad != null && detalle.prioridad <= PRIORIDAD_VISIBLE_MAXIMA
      ? detalle.prioridad
      : null;

  return (
    <Link
      href={`/nodos/${nodo.id}`}
      className={`block rounded-lg border border-gray-200 bg-white p-3 text-sm transition-colors hover:border-gray-400 ${
        cerrado ? "opacity-50 line-through" : ""
      }`}
    >
      <p className="font-medium text-gray-900 [overflow-wrap:anywhere]">
        {nodo.tipo === FASE ? (
          <span className="mr-1.5 rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">
            FASE
          </span>
        ) : null}{" "}
        {nodo.titulo}
      </p>
      {detalle ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
          {prioridadVisible ? (
            <span className="rounded bg-red-100 px-1.5 py-0.5 font-semibold text-red-700">
              p{prioridadVisible}
            </span>
          ) : null}
          {detalle.etiquetas.map((etiqueta) => (
            <span key={etiqueta} className="rounded bg-gray-100 px-1.5 py-0.5">
              {etiqueta}
            </span>
          ))}
          {detalle.vence ? <span>vence {detalle.vence.slice(0, 10)}</span> : null}
        </div>
      ) : null}
    </Link>
  );
}
