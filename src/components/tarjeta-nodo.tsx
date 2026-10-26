import Link from "next/link";
import type { NodoResponseDto, NodoResumenDto, PelotitaDto } from "@/lib/api/generado/modelos";
import { ESTADO_AVANCE, partesDeAvance, type EstadoAvance } from "@/lib/grafo/avance";
import { tituloConMarca } from "@/lib/grafo/cierre";
import { PRIORIDAD_VISIBLE_MAXIMA, TIPOS_TABLERO } from "@/lib/constants";

type Nodo = NodoResumenDto | NodoResponseDto;

const tieneDescripcion = (nodo: Nodo): nodo is NodoResponseDto => "descripcion" in nodo;
const [, FASE] = TIPOS_TABLERO;

const COLOR_AVANCE: Record<EstadoAvance, string> = {
  [ESTADO_AVANCE.hecho]: "text-green-700",
  [ESTADO_AVANCE.falta]: "text-red-700",
  [ESTADO_AVANCE.noAplica]: "text-gray-400",
};

/** La primera línea de la descripción de una FASE es su avance (la deja `importar:fases`, FASE 11). */
function Avance({ linea }: { linea: string }) {
  const partes = partesDeAvance(linea);
  return (
    <p className="mt-1.5 text-xs leading-relaxed">
      {partes.map(({ texto, estado }, i) => (
        <span key={texto} className={COLOR_AVANCE[estado]}>
          {i > 0 ? <span className="text-gray-300"> · </span> : null}
          {texto}
        </span>
      ))}
    </p>
  );
}

/**
 * Una tarjeta del tablero, de «hoy puedo», de las ramas. Dos mundos que se distinguen a la vista (Freddy, FASE 11):
 * una FASE (una entrega con su task) va con borde índigo, su nombre y su avance como en fases.html; una tarea suelta,
 * con su título, prioridad, etiquetas y fecha.
 */
export function TarjetaNodo({
  nodo,
  pelotitas = [],
}: {
  nodo: Nodo;
  /** Solo en el Plan: su carril y los otros carriles que espera; las calcula la API (`GET /derivado/plan`). */
  pelotitas?: readonly PelotitaDto[];
}) {
  const cerrado = nodo.estado === "CERRADO";
  const esFase = nodo.tipo === FASE;
  const lineaDeAvance =
    esFase && tieneDescripcion(nodo) ? (nodo.descripcion?.split("\n")[0] ?? "") : "";
  const prioridadVisible =
    nodo.prioridad != null && nodo.prioridad <= PRIORIDAD_VISIBLE_MAXIMA ? nodo.prioridad : null;

  return (
    <Link
      href={`/nodos/${nodo.id}`}
      className={`block rounded-lg border bg-white p-3 text-sm transition-colors hover:border-gray-400 ${
        esFase ? "border-gray-200 border-l-4 border-l-indigo-400" : "border-gray-200"
      } ${cerrado ? "opacity-50 line-through" : ""}`}
    >
      <p
        className={`text-gray-900 [overflow-wrap:anywhere] ${esFase ? "font-semibold" : "font-medium"}`}
      >
        {pelotitas.map(({ carril, color }) => (
          <span
            key={carril}
            title={carril}
            aria-label={carril}
            className="mr-1 inline-block size-2.5 rounded-full align-baseline"
            style={{ backgroundColor: color }}
          />
        ))}
        {tituloConMarca(nodo)}
      </p>
      {lineaDeAvance ? <Avance linea={lineaDeAvance} /> : null}
      {!esFase && (prioridadVisible || nodo.etiquetas.length > 0 || nodo.vence) ? (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
          {prioridadVisible ? (
            <span className="rounded bg-red-100 px-1.5 py-0.5 font-semibold text-red-700">
              p{prioridadVisible}
            </span>
          ) : null}
          {nodo.etiquetas.map((etiqueta) => (
            <span key={etiqueta} className="rounded bg-gray-100 px-1.5 py-0.5">
              {etiqueta}
            </span>
          ))}
          {nodo.vence ? <span>vence {nodo.vence.slice(0, 10)}</span> : null}
        </div>
      ) : null}
    </Link>
  );
}
