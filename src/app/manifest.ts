import type { MetadataRoute } from "next";
import { APP_NAME, COLOR_FONDO, COLOR_TEMA } from "@/lib/constants";

/** Next lo sirve en /manifest.webmanifest y lo enlaza solo desde el layout. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_NAME,
    description: "Tareas como grafo: hoy puedo, bloqueos, ramas",
    lang: "es",
    start_url: "/",
    display: "standalone",
    background_color: COLOR_FONDO,
    theme_color: COLOR_TEMA,
    icons: [
      { src: "/iconos/icono-192.png", sizes: "192x192", type: "image/png" },
      { src: "/iconos/icono-512.png", sizes: "512x512", type: "image/png" },
      { src: "/iconos/icono-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
