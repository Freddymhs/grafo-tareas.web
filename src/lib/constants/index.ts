import {
  CreateConexionDtoTipo,
  CreateNodoDtoTipo,
  NodosControllerFindAllNotas,
} from "@/lib/api/generado/modelos";

export const APP_NAME = "grafo-tareas";

/** La API del grafo (grafo-tareas.api). En producción, la URL por Tailscale. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const STALE_TIME_MS = 60_000;

/** El tablero y las ramas piden todo lo abierto de una vez: hoy son ~100 tareas, el tope de la API es 500. */
export const LIMITE_TABLERO = 500;

/**
 * La columna de lo que no tiene etapa (en Todoist, las tareas "sin sección"). Se llamó «Entrada» y después «Sin etapa», y
 * las dos confundían (Freddy, FASE 11 y 2026-10-18): dice qué son y qué hacer con ellas.
 */
export const ETAPA_ENTRADA = "Sin columna";
export const QUE_SIN_ETAPA =
  "notas, preguntas y capturas sueltas: en Todoist no tienen sección. Movela a una columna o colgala de su PBI";
export const QUE_OTRAS_ETAPAS = "en una columna de otro rol";

/** El tablero por rol (FASE 8): «Todo» junta a todos; en el de un rol, lo que está en una etapa ajena va a «Otras etapas». */
export const ROL_TODO = "todo";
export const NOMBRE_ROL_TODO = "Todo";
export const ETAPA_OTRAS = "Otras etapas";
/** El tablero muestra tareas y FASE; las FASE se ven pero se mueven desde su FASE_n.md (D10). */
export const TIPOS_TABLERO = [CreateNodoDtoTipo.TAREA, CreateNodoDtoTipo.FASE] as const;
/** Complementos (FASE 9): una DUDA se escala o se decide; un DAILY_ITEM («para decir») pide su ritual. */
export const NODO_DUDA = CreateNodoDtoTipo.DUDA;
export const NODO_PARA_RITUAL = CreateNodoDtoTipo.DAILY_ITEM;
/** El tablero oculta los complementos que son notas (dolor, apunte, decisión…): se ven en su PBI. */
export const OCULTAR_NOTAS = NodosControllerFindAllNotas.ocultar;

/** Prioridad 1 y 2 son las que Freddy usa (p1 12, p2 33 de 134); 3 y 4 no se muestran. */
export const PRIORIDAD_VISIBLE_MAXIMA = 2;

export const NAVEGACION = [
  { href: "/", titulo: "Tablero" },
  { href: "/dia", titulo: "El día" },
  { href: "/hoy", titulo: "Hoy puedo" },
  { href: "/bloqueos", titulo: "Bloqueos" },
  { href: "/ramas", titulo: "Ramas" },
] as const;

/** Los tipos del dominio vienen del OpenAPI (una sola fuente); la TAREA es lo que se crea a diario. */
export const TIPOS_NODO = Object.values(CreateNodoDtoTipo);
export const TIPO_NODO_POR_DEFECTO = CreateNodoDtoTipo.TAREA;
export const PRIORIDADES = [1, 2, 3, 4] as const;

/** Cómo se lee cada conexión, siempre desde el origen: "X depende de Y". */
export const TEXTO_CONEXION: Record<CreateConexionDtoTipo, string> = {
  DEPENDE_DE: "depende de",
  ESPERA_RESPUESTA_DE: "espera respuesta de",
  BLOQUEADA_POR: "bloqueada por",
  PERTENECE_A: "pertenece a",
  EN_DAILY_DE: "en el daily de",
};
export const TIPO_CONEXION_POR_DEFECTO = CreateConexionDtoTipo.DEPENDE_DE;

/** Buscador para conectar: desde 2 letras, hasta 20 resultados. */
export const LARGO_MINIMO_BUSQUEDA = 2;
export const LIMITE_BUSQUEDA = 20;

/** Cuánto se muestra «Copiado» después de copiar el parte. */
export const MS_AVISO_COPIADO = 2000;

/** PWA: color de la barra del sistema y nombre de la caché del service worker para las lecturas de la API. */
export const COLOR_TEMA = "#111827";
export const COLOR_FONDO = "#ffffff";
export const NOMBRE_CACHE_API = "api-grafo";
/** Si la API no contesta en este tiempo, se sirve lo último leído (offline de lectura). */
export const SEGUNDOS_ESPERA_RED = 3;
export const ENTRADAS_CACHE_API = 200;
export const RUTA_OFFLINE = "/~offline";

/** Los controles de formulario de la app: un campo y un botón primario, iguales en todas las vistas. */
export const ESTILO_CAMPO = "rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm";
export const ESTILO_BOTON =
  "rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50";
