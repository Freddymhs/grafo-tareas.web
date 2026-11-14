"use client";

import { useState } from "react";
import { useDerivadoControllerDia } from "@/lib/api/generado/derivado/derivado";
import type { NodoResumenDto } from "@/lib/api/generado/modelos";
import { TarjetaNodo } from "@/components/tarjeta-nodo";
import { useAlcance } from "@/lib/alcance/use-alcance";
import { armarParte, pasaDelLimite } from "@/lib/grafo/parte";
import {
  AVISO_ESPACIOS_NO_LEIDOS,
  AVISO_SIN_METODO,
  ESTILO_BOTON,
  MS_AVISO_COPIADO,
} from "@/lib/constants";

function Bloque({
  titulo,
  vacio,
  children,
}: {
  titulo: string;
  vacio: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-gray-700">{titulo}</h2>
      {vacio ? (
        <p className="text-sm text-gray-500">Nada.</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">{children}</div>
      )}
    </section>
  );
}

const tarjetas = (nodos: readonly NodoResumenDto[]) =>
  nodos.map((nodo) => <TarjetaNodo key={nodo.id} nodo={nodo} />);

export function ElDia() {
  const { alcance, conMetodo, cargando, fallo } = useAlcance();
  const dia = useDerivadoControllerDia(
    alcance.espacioId ? { espacio: alcance.espacioId } : undefined,
    {
      query: { enabled: conMetodo },
    },
  );
  const [copiado, setCopiado] = useState(false);

  if (cargando) return <p className="text-gray-500">Cargando…</p>;
  if (fallo) return <p className="text-red-600">{AVISO_ESPACIOS_NO_LEIDOS}</p>;
  if (!conMetodo) return <p className="text-gray-500">{AVISO_SIN_METODO}</p>;
  if (dia.isPending) return <p className="text-gray-500">Armando el día…</p>;
  if (dia.isError) return <p className="text-red-600">No se pudo leer la API.</p>;
  const datos = dia.data;
  const { enCurso, detenido, paraDecir, terminado, tramites, limiteEnCurso } = datos;

  const copiar = async () => {
    await navigator.clipboard.writeText(armarParte(datos));
    setCopiado(true);
    setTimeout(() => setCopiado(false), MS_AVISO_COPIADO);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => void copiar()} className={ESTILO_BOTON}>
          Copiar el parte
        </button>
        {copiado ? (
          <span className="text-sm text-green-700">Copiado: pegalo antes de la daily.</span>
        ) : null}
      </div>

      {pasaDelLimite(datos) ? (
        <p
          role="alert"
          className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
        >
          Hay {enCurso.length} tarjetas en curso y el acuerdo es {limiteEnCurso} a la vez: cerrá,
          devolvé a la entrada o pasá a esperar las que no estés haciendo hoy.
        </p>
      ) : null}

      <Bloque titulo={`En curso (${enCurso.length})`} vacio={enCurso.length === 0}>
        {enCurso.map(({ nodo, etapa, bloqueado }) => (
          <div key={nodo.id}>
            <TarjetaNodo nodo={nodo} />
            <p className="mt-1 text-xs text-gray-500">
              {etapa}
              {bloqueado ? <span className="ml-2 font-semibold text-red-700">frenada</span> : null}
            </p>
          </div>
        ))}
      </Bloque>

      <Bloque titulo={`Detenido (${detenido.length})`} vacio={detenido.length === 0}>
        {detenido.map(({ nodo, por }) => (
          <div key={nodo.id}>
            <TarjetaNodo nodo={nodo} />
            <p className="mt-1 text-xs text-gray-500 [overflow-wrap:anywhere]">
              espera: {por.map(({ titulo }) => titulo).join(" · ")}
            </p>
          </div>
        ))}
      </Bloque>

      <Bloque titulo={`Trámites de cierre (${tramites.length})`} vacio={tramites.length === 0}>
        {tarjetas(tramites)}
      </Bloque>

      <Bloque titulo={`Para decir (${paraDecir.length})`} vacio={paraDecir.length === 0}>
        {paraDecir.map(({ nodo, ritual }) => (
          <div key={nodo.id}>
            <TarjetaNodo nodo={nodo} />
            <p className="mt-1 text-xs text-gray-500">{ritual}</p>
          </div>
        ))}
      </Bloque>

      <Bloque titulo={`Terminé (${terminado.length})`} vacio={terminado.length === 0}>
        {tarjetas(terminado)}
      </Bloque>
    </div>
  );
}
