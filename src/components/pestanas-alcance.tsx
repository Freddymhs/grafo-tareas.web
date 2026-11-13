"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import {
  useEspaciosControllerCreate,
  useEspaciosControllerFindAll,
} from "@/lib/api/generado/espacios/espacios";
import {
  useProyectosControllerCreate,
  useProyectosControllerListarDeEspacio,
} from "@/lib/api/generado/proyectos/proyectos";
import type { CreateEspacioDtoPlantilla } from "@/lib/api/generado/modelos";
import { useInvalidarGrafo } from "@/lib/api/invalidar-grafo";
import { hrefConAlcance, ordenarPestanas, proyectosConFila } from "@/lib/alcance";
import type { Alcance } from "@/lib/alcance";
import { useAlcance } from "@/lib/alcance/use-alcance";
import { useDatosHidratados } from "@/lib/alcance/use-hidratado";
import {
  COLOR_PESTANA_ACTIVA,
  COLOR_PESTANA_INACTIVA,
  ESTILO_BOTON,
  ESTILO_CAMPO,
  PLANTILLAS_ESPACIO,
  PLANTILLA_POR_DEFECTO,
} from "@/lib/constants";

const ESTILO_PESTANA = "border-b-2 border-transparent px-3 py-1.5 text-sm whitespace-nowrap";
const SIN_ESPACIO = "";

function Pestana({
  href,
  texto,
  activa,
  color,
}: {
  readonly href: string;
  readonly texto: string;
  readonly activa: boolean;
  readonly color?: string | null;
}) {
  const subrayado = activa ? (color ?? COLOR_PESTANA_ACTIVA) : COLOR_PESTANA_INACTIVA;
  return (
    <Link
      href={href}
      aria-current={activa ? "page" : undefined}
      style={{ borderBottomColor: subrayado }}
      className={`${ESTILO_PESTANA} ${activa ? "font-semibold text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
    >
      {texto}
    </Link>
  );
}

function AltaDeEspacio({ alCrear }: { readonly alCrear: (espacioId: string) => void }) {
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [plantilla, setPlantilla] = useState<CreateEspacioDtoPlantilla>(PLANTILLA_POR_DEFECTO);
  const invalidar = useInvalidarGrafo();
  const crear = useEspaciosControllerCreate({
    mutation: {
      onSuccess: async ({ id }) => {
        setNombre("");
        setAbierto(false);
        await invalidar();
        alCrear(id);
      },
    },
  });

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    const limpio = nombre.trim();
    if (limpio) crear.mutate({ data: { nombre: limpio, plantilla } });
  };

  if (!abierto) {
    return (
      <button
        type="button"
        aria-label="Nuevo espacio"
        className={ESTILO_PESTANA}
        onClick={() => setAbierto(true)}
      >
        +
      </button>
    );
  }
  return (
    <form onSubmit={enviar} className="flex items-center gap-2">
      <input
        value={nombre}
        onChange={(evento) => setNombre(evento.target.value)}
        placeholder="Nombre del espacio"
        aria-label="Nombre del espacio"
        className={ESTILO_CAMPO}
        autoFocus
      />
      <select
        value={plantilla}
        onChange={(evento) => setPlantilla(evento.target.value as CreateEspacioDtoPlantilla)}
        aria-label="Plantilla"
        className={ESTILO_CAMPO}
      >
        {PLANTILLAS_ESPACIO.map((valor) => (
          <option key={valor} value={valor}>
            {valor}
          </option>
        ))}
      </select>
      <button type="submit" disabled={crear.isPending} className={ESTILO_BOTON}>
        Crear
      </button>
      {crear.isError ? <span className="text-sm text-red-600">{crear.error.message}</span> : null}
    </form>
  );
}

function AltaDeProyecto({
  espacioId,
  alCrear,
}: {
  readonly espacioId: string;
  readonly alCrear: (proyectoId: string) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const invalidar = useInvalidarGrafo();
  const crear = useProyectosControllerCreate({
    mutation: {
      onSuccess: async ({ id }) => {
        setNombre("");
        setAbierto(false);
        await invalidar();
        alCrear(id);
      },
    },
  });

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    const limpio = nombre.trim();
    if (limpio) crear.mutate({ espacioId, data: { nombre: limpio } });
  };

  if (!abierto) {
    return (
      <button
        type="button"
        aria-label="Nuevo proyecto"
        className={ESTILO_PESTANA}
        onClick={() => setAbierto(true)}
      >
        +
      </button>
    );
  }
  return (
    <form onSubmit={enviar} className="flex items-center gap-2">
      <input
        value={nombre}
        onChange={(evento) => setNombre(evento.target.value)}
        placeholder="Nombre del proyecto"
        aria-label="Nombre del proyecto"
        className={ESTILO_CAMPO}
        autoFocus
      />
      <button type="submit" disabled={crear.isPending} className={ESTILO_BOTON}>
        Crear
      </button>
      {crear.isError ? <span className="text-sm text-red-600">{crear.error.message}</span> : null}
    </form>
  );
}

/**
 * Las pestañas (FASE 24 y 26): arriba solo los espacios, y abajo los proyectos del espacio que se ve, solo si tiene dos o
 * más (con uno, el espacio entero). El «+» de proyecto queda siempre: sin él no se podría crear el segundo.
 */
export function PestanasAlcance() {
  const ruta = usePathname();
  const router = useRouter();
  const { alcance, aviso } = useAlcance();
  const { espacioId, proyectoId } = alcance;
  const espacios = useEspaciosControllerFindAll();
  const proyectos = useProyectosControllerListarDeEspacio(espacioId ?? SIN_ESPACIO, undefined, {
    query: { enabled: Boolean(espacioId) },
  });

  const ir = (destino: Alcance) => router.push(hrefConAlcance(ruta, destino));
  const espaciosVistos = useDatosHidratados(espacios.data);
  const proyectosVistos = useDatosHidratados(proyectos.data);
  const filaEspacios = ordenarPestanas(espaciosVistos ?? []);
  const filaProyectos = espacioId ? proyectosConFila(proyectosVistos ?? []) : [];
  const conFilaDeProyectos = filaProyectos.length > 0;

  return (
    <div className="border-b border-gray-200 px-6">
      <div className="flex items-center gap-1 overflow-x-auto" role="tablist" aria-label="Espacios">
        {filaEspacios.map(({ id, nombre, color }) => (
          <Pestana
            key={id}
            href={hrefConAlcance(ruta, { espacioId: id })}
            texto={nombre}
            activa={id === espacioId}
            color={color}
          />
        ))}
        <AltaDeEspacio alCrear={(id) => ir({ espacioId: id })} />
      </div>
      {espacioId ? (
        <div
          className="flex items-center gap-1 overflow-x-auto"
          role={conFilaDeProyectos ? "tablist" : undefined}
          aria-label={conFilaDeProyectos ? "Proyectos" : undefined}
        >
          {filaProyectos.map(({ id, nombre, color }) => (
            <Pestana
              key={id}
              href={hrefConAlcance(ruta, { espacioId, proyectoId: id })}
              texto={nombre}
              activa={id === proyectoId}
              color={color}
            />
          ))}
          <AltaDeProyecto
            espacioId={espacioId}
            alCrear={(id) => ir({ espacioId, proyectoId: id })}
          />
        </div>
      ) : null}
      {aviso ? <p className="py-1 text-sm text-amber-700">{aviso}</p> : null}
    </div>
  );
}
