# grafo-tareas.web

La PWA tipo lista de grafo-tareas (FASE 4): el tablero por etapa, "hoy puedo", bloqueos, ramas y el detalle de cada
nodo, contra la API del grafo (`../grafo-tareas.api`). Nació de `template-nextjs-tanstack`; la demo de la plantilla
(`posts/`, `table/`, store en memoria) se borró en la FASE 4.

Lo derivado (bloqueado, libera, hoy puedo) lo calcula la API (decisión C1): la web solo lo muestra.

## Probar

```bash
pnpm install
NEXT_PUBLIC_API_URL=http://localhost:3000 pnpm dev -p 3001   # la API corriendo en el 3000
../bin/servir-tailnet                                        # PWA y API por HTTPS del tailnet (teléfono, Quest)
pnpm api:generar                                             # regenera el cliente desde ../grafo-tareas.api/openapi.json
```

El puerto es el **3001**: el 3000 es la API, y su `CORS_ORIGINS` espera la web ahí.

## Vistas

| Ruta          | Qué muestra                                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`           | El tablero: tareas y FASE; «Todo» (etapas con algo) o un rol (`GET /roles`, sus columnas); alta rápida                                     |
| `/hoy`        | Hoy puedo: lo abierto que nada bloquea                                                                                                     |
| `/bloqueos`   | Personas y dudas abiertas, y qué se libera si contestan                                                                                    |
| `/ramas`      | Las ramas de color y sus miembros                                                                                                          |
| `/nodos/[id]` | Detalle: etapa, cerrar/reabrir (una FASE no: se mueve desde su `.md`, D10), qué lo bloquea, descripción en Markdown, conexiones y conectar |
| `/~offline`   | Lo que muestra el service worker sin red y sin copia de la página                                                                          |

## Stack

| Capa         | Tecnología                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------- |
| Framework    | Next.js 16 (App Router); `dev` con Turbopack, `build` con `--webpack` (lo pide Serwist)           |
| Server state | TanStack Query v5, hooks generados por Orval desde el OpenAPI de la API (`src/lib/api/generado/`) |
| PWA          | Serwist: precache del build y `NetworkFirst` sobre los GET a la API (offline de lectura)          |
| Markdown     | `react-markdown` + `remark-gfm`, sin HTML crudo                                                   |
| CSS          | Tailwind CSS 4                                                                                    |
| Tests        | Vitest (unit) · Playwright (e2e, `PW_CHANNEL=chrome` para usar el Chrome del sistema)             |

## Estructura

```
src/
  app/                    vistas (cada una: page.tsx RSC + componente cliente), manifest.ts, sw.ts, ~offline/
  components/             tarjeta-nodo, crear-nodo, conexiones-nodo, descripcion, providers
  lib/api/                cliente.ts (el único fetch: desenvuelve {data, meta}), generado/ (Orval), invalidar-grafo.ts
  lib/grafo/              lógica pura de presentación (describir-conexion)
  lib/constants/          SSOT de la web: API_URL, etapas, prioridades, textos de conexión, estilos, PWA
e2e/                      navegación, aviso sin API, offline y manifest (sin API real: en CI no hay)
```

## Scripts

| Script             | Qué hace                                                   |
| ------------------ | ---------------------------------------------------------- |
| `pnpm dev`         | Servidor de desarrollo (sin service worker)                |
| `pnpm build`       | Build de producción (`next build --webpack`) + `sw.js`     |
| `pnpm start`       | Servidor de producción                                     |
| `pnpm lint`        | ESLint                                                     |
| `pnpm type-check`  | TypeScript                                                 |
| `pnpm test:run`    | Vitest                                                     |
| `pnpm test:e2e`    | Playwright (levanta la web en el 3001 o reusa la que esté) |
| `pnpm api:generar` | Orval + prettier sobre lo generado                         |
