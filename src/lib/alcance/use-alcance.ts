"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useEspaciosControllerFindAll } from "@/lib/api/generado/espacios/espacios";
import { useProyectosControllerListarDeEspacio } from "@/lib/api/generado/proyectos/proyectos";
import type { EspacioResponseDto, ProyectoResponseDto } from "@/lib/api/generado/modelos";
import { AVISO_ESPACIOS_NO_LEIDOS } from "@/lib/constants";
import { useHidratado } from "./use-hidratado";
import { leerAlcance, paramsDeAlcance, resolverAlcance, resolverEspacio } from "./alcance";
import type { Alcance, AlcanceResuelto, ParamsDeAlcance } from "./alcance";

export interface AlcanceActivo {
  alcance: Alcance;
  espacio?: EspacioResponseDto;
  proyecto?: ProyectoResponseDto;
  aviso?: string;
  params: ParamsDeAlcance;
  cargando: boolean;
  /** No se pudieron leer los espacios: sin ellos no hay alcance, y las vistas lo dicen en vez de mostrar todo mezclado. */
  fallo: boolean;
  conMetodo: boolean;
}

const SIN_ESPACIO = "";

/**
 * El alcance que se ve (FASE 24 y 26): el de la URL contra lo que la API tiene. Nunca es «todo»: sin espacio en la URL se
 * ve el primero, y con fila de proyectos, su primer proyecto. `cargando` mientras no se saben los espacios y los
 * proyectos del que se ve: hasta entonces no se resuelve nada (sin consultas con un alcance a medias ni avisos falsos).
 */
export function useAlcance(): AlcanceActivo {
  const searchParams = useSearchParams();
  const pedido = useMemo(() => leerAlcance(searchParams), [searchParams]);
  const espacios = useEspaciosControllerFindAll();
  const hidratado = useHidratado();
  const espaciosVistos = hidratado ? espacios.data : undefined;
  const espacioVisto = resolverEspacio(pedido.espacioId, espaciosVistos ?? []).espacio?.id;
  const proyectos = useProyectosControllerListarDeEspacio(espacioVisto ?? SIN_ESPACIO, undefined, {
    query: { enabled: Boolean(espacioVisto) },
  });
  const proyectosVistos = hidratado ? proyectos.data : undefined;

  const cargando =
    !hidratado || espacios.isPending || (Boolean(espacioVisto) && proyectos.isPending);
  const sinLeer = hidratado && espacios.isError;
  const resuelto = useMemo<AlcanceResuelto>(() => {
    if (sinLeer) return { alcance: {}, aviso: AVISO_ESPACIOS_NO_LEIDOS };
    if (cargando) return { alcance: pedido };
    return resolverAlcance(pedido, espaciosVistos ?? [], proyectosVistos);
  }, [cargando, sinLeer, pedido, espaciosVistos, proyectosVistos]);

  const { espacioId, proyectoId } = resuelto.alcance;
  const params = useMemo(() => paramsDeAlcance({ espacioId, proyectoId }), [espacioId, proyectoId]);
  const { espacio, proyecto, aviso } = resuelto;
  const conMetodo = !cargando && !sinLeer && (!espacioId || Boolean(espacio?.metodo));

  return {
    alcance: resuelto.alcance,
    espacio,
    proyecto,
    aviso,
    params,
    cargando,
    fallo: sinLeer,
    conMetodo,
  };
}
