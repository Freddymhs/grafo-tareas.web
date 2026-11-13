"use client";

import { useSyncExternalStore } from "react";

const SIN_SUSCRIPCION = () => () => undefined;
const EN_EL_CLIENTE = () => true;
const EN_EL_SERVIDOR = () => false;

/** `false` en el servidor y en la pasada de hidratación; `true` desde que React ya hidrató. */
export function useHidratado(): boolean {
  return useSyncExternalStore(SIN_SUSCRIPCION, EN_EL_CLIENTE, EN_EL_SERVIDOR);
}

/**
 * Los datos de la API se ven recién cuando React hidrató. Dentro de un `<Suspense>` la hidratación puede llegar después de
 * que otro componente ya llenó la caché de las consultas: sin esto, el cliente pinta pestañas que el HTML del servidor no
 * trae y React avisa «Hydration failed» (el «1 Issue» de Next en desarrollo).
 */
export function useDatosHidratados<T>(datos: T | undefined): T | undefined {
  return useHidratado() ? datos : undefined;
}
