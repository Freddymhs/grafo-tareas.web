# template-nextjs-tanstack — Elevator Pitch

## ENGLISH

**Context:**
Every modern web app hits the same seam: data lives on the server (fast, SEO-friendly), but interaction lives on the client (reactive, real-time). Most solutions pick one side and pay the price — pure SSR locks you out of client-side cache; pure CSR gives every user a loading spinner on every page load. This template solves that seam, and documents exactly how.

**The Decision:**
Next.js 16 App Router + TanStack Query v5, wired together with `prefetchQuery` + `HydrationBoundary`. Server Components run the query and pre-populate the cache; `dehydrate()` serializes it; the client's `useQuery` inherits it — already populated, no fetch, no flash. The trade-off vs. full SSR: the client cache stays alive for refetching, polling, and mutation-driven invalidation. The trade-off vs. full CSR: the first paint is instant and crawlable. This is the React 19 + Next.js 16 rendering model done explicitly, not accidentally.

**One Real Challenge:**
After a `useMutation` creates or deletes a post, the stale list in cache needs to refetch. The naive fix — invalidate everything — breaks pagination and detail caches. The solution: a `postKeys` factory builds hierarchical, typed cache keys (`all → lists → list(params) → detail(id)`), so `invalidateQueries({ queryKey: postKeys.lists() })` surgically invalidates only list variants. No manual cache juggling. This pattern is tested — `query-keys.test.ts` verifies that distinct param shapes produce distinct keys and that hierarchy is respected.

**Why It's Production-Ready:**
1. **Zod at every boundary** — all API responses are parsed through schemas at fetch time. A contract violation throws before stale data reaches the component tree.
2. **41 tests across two layers** — 27 unit tests (Vitest) covering schemas, store, query-key factory, and utils; 14 E2E tests (Playwright) covering SSR hydration, table interactions, and full CRUD API contracts.
3. **6-stage CI pipeline** — lint → type-check → build → unit → Playwright install → E2E. No merge reaches `main` without a green build on all six gates.

**The Insight:**
Server and client don't need to negotiate about what data to load — the server runs the query first and hands the result to the client already cached. That single architectural decision eliminates the loading flash, preserves full reactivity, and makes the SSR/CSR boundary invisible to the user. The template exists to prove this pattern works end-to-end and give teams a copy they can clone without having to re-derive it.

---

## ESPAÑOL

**Contexto:**
Toda aplicación web moderna choca con la misma costura: los datos viven en el servidor (rápido, indexable), pero la interacción vive en el cliente (reactiva, en tiempo real). La mayoría de los equipos elige un lado y paga el precio — SSR puro te deja sin caché de cliente; CSR puro le da a cada usuario un spinner en cada carga de página. Este template resuelve esa costura y documenta exactamente cómo hacerlo.

**La Decisión:**
Next.js 16 App Router + TanStack Query v5, conectados con `prefetchQuery` + `HydrationBoundary`. Los Server Components ejecutan la query y pre-populan el caché; `dehydrate()` lo serializa; el `useQuery` del cliente lo hereda — ya poblado, sin fetch adicional, sin flash de carga. El trade-off frente a SSR puro: el caché del cliente permanece vivo para refetch, polling e invalidación por mutaciones. El trade-off frente a CSR puro: el primer render es instantáneo e indexable. Este es el modelo de rendering de React 19 + Next.js 16 hecho de forma explícita, no accidental.

**Un Problema Real:**
Después de un `useMutation` que crea o elimina un post, la lista en caché queda obsoleta. La solución naïve — invalidar todo — rompe caché de paginación y detalle. La solución real: un factory `postKeys` construye claves de caché jerárquicas y tipadas (`all → lists → list(params) → detail(id)`), de modo que `invalidateQueries({ queryKey: postKeys.lists() })` invalida quirúrgicamente solo las variantes de lista. Sin gestión manual de caché. El patrón está testeado — `query-keys.test.ts` verifica que distintos parámetros producen claves distintas y que la jerarquía se respeta.

**Por Qué Está Listo para Producción:**
1. **Zod en cada boundary** — todas las respuestas de API se parsean contra esquemas en el momento del fetch. Una violación de contrato lanza excepción antes de que datos incorrectos lleguen al árbol de componentes.
2. **41 tests en dos capas** — 27 unitarios (Vitest) cubriendo schemas, store, factory de query-keys y utils; 14 E2E (Playwright) cubriendo hidratación SSR, interacciones de tabla y contratos CRUD completos de la API.
3. **Pipeline CI de 6 etapas** — lint → type-check → build → unit → instalación de Playwright → E2E. Ningún merge llega a `main` sin un build verde en las seis etapas.

**El Insight:**
El servidor y el cliente no necesitan negociar qué datos cargar — el servidor ejecuta la query primero y le entrega el resultado al cliente ya en caché. Esa única decisión arquitectónica elimina el flash de carga, preserva la reactividad completa y hace que el boundary SSR/CSR sea invisible para el usuario. El template existe para demostrar que este patrón funciona de punta a punta y darle a los equipos una base que pueden clonar sin tener que re-derivarla.
