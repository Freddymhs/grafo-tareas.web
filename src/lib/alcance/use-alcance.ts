"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useEspaciosControllerFindAll } from "@/lib/api/generado/espacios/espacios";
import { useProyectosControllerListarDeEspacio } from "@/lib/api/generado/proyectos/proyectos";
import type { EspacioResponseDto, ProyectoResponseDto } from "@/lib/api/generado/modelos";
import { AVISO_ESPACIOS_NO_LEIDOS } from "@/lib/constants";
import { useHidratado } from "./use-hidratado";
import { leerAlcance, paramsDeAlcance, resolverAlcance } from "./alcance";
import type { Alcance, AlcanceResuelto, ParamsDeAlcance } from "./alcance";

export interface AlcanceActivo {
  alcance: Alcance;
  espacio?: EspacioResponseDto;
  proyecto?: ProyectoResponseDto;
  aviso?: string;
  params: ParamsDeAlcance;
  cargando: boolean;
  conMetodo: boolean;
}

const SIN_ESPACIO = "";

export function useAlcance(): AlcanceActivo {
  const searchParams = useSearchParams();
  const pedido = useMemo(() => leerAlcance(searchParams), [searchParams]);
  const espacios = useEspaciosControllerFindAll();
  const proyectos = useProyectosControllerListarDeEspacio(
    pedido.espacioId ?? SIN_ESPACIO,
    undefined,
    {
      query: { enabled: Boolean(pedido.espacioId) },
    },
  );

  const hidratado = useHidratado();
  const espaciosVistos = hidratado ? espacios.data : undefined;
  const proyectosVistos = hidratado ? proyectos.data : undefined;
  const cargando = Boolean(pedido.espacioId) && (!hidratado || espacios.isPending);
  const sinLeer = Boolean(pedido.espacioId) && hidratado && espacios.isError;
  const resuelto = useMemo<AlcanceResuelto>(() => {
    if (cargando) return { alcance: pedido };
    if (sinLeer) return { alcance: {}, aviso: AVISO_ESPACIOS_NO_LEIDOS };
    return resolverAlcance(pedido, espaciosVistos ?? [], proyectosVistos);
  }, [cargando, sinLeer, pedido, espaciosVistos, proyectosVistos]);

  const { espacioId, proyectoId } = resuelto.alcance;
  const params = useMemo(() => paramsDeAlcance({ espacioId, proyectoId }), [espacioId, proyectoId]);
  const { espacio, proyecto, aviso } = resuelto;
  const conMetodo = !cargando && (!espacioId || Boolean(espacio?.metodo));

  return { alcance: resuelto.alcance, espacio, proyecto, aviso, params, cargando, conMetodo };
}
