# template-nextjs-tanstack

Next.js 16 + TanStack Query v5 + TanStack Table v8. Patrón híbrido RSC → SSR prefetch → CSR con caché inteligente.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| React | React 19 |
| TypeScript | Strict mode |
| CSS | TailwindCSS 4 |
| Server state | TanStack Query v5 |
| DevTools | React Query Devtools |
| Tablas | TanStack Table v8 |
| Validación | Zod |
| Testing unitario | Vitest + happy-dom |
| Testing e2e | Playwright (Chromium) |
| CI | GitHub Actions |

## Quick Start

```bash
pnpm install
pnpm dev
```

App en `http://localhost:3000`.

## Arquitectura de rendering

```
Server Component (RSC)
  └─ queryClient.prefetchQuery()   ← datos en el server
  └─ <HydrationBoundary state={dehydrate(queryClient)}>
       └─ <ClientComponent />      ← "use client"
            └─ useQuery()          ← caché poblado, sin loading flash
                                   ← refetch, invalidación, polling
```

## Rutas

| Ruta | Rendering | Patrón |
|---|---|---|
| `/` | RSC | Home — explica el template |
| `/posts` | SSR prefetch → CSR | `prefetchQuery` + `HydrationBoundary` + `useQuery` |
| `/posts/[id]` | SSR prefetch → CSR | Detalle con delete via `useMutation` |
| `/posts/create` | CSR | `useMutation` + `invalidateQueries` → refetch automático |
| `/table` | CSR | `useReactTable` con sort, filter, pagination |
| `/api/posts` | API Route | GET list paginado + POST |
| `/api/posts/[id]` | API Route | GET + PUT + DELETE |

## Scripts

| Script | Descripción |
|---|---|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` | Build producción |
| `pnpm start` | Servidor producción |
| `pnpm lint` | ESLint |
| `pnpm type-check` | TypeScript |
| `pnpm test:run` | Tests unitarios |
| `pnpm test:e2e` | Tests e2e (Playwright) |

## Estructura

```
src/
  app/
    layout.tsx              # Wraps <Providers>
    page.tsx                # Home RSC
    posts/
      page.tsx              # Server: prefetchQuery + HydrationBoundary
      posts-list.tsx        # Client: useQuery (usa caché del server)
      create/page.tsx       # Client: useMutation + invalidateQueries
      [id]/
        page.tsx            # Server: prefetchQuery detail
        post-detail.tsx     # Client: useQuery + delete mutation
    table/page.tsx          # Client: useQuery + useReactTable
    api/posts/
      route.ts              # GET list + POST
      [id]/route.ts         # GET + PUT + DELETE
  components/
    providers.tsx           # QueryClientProvider + DevTools
    query-boundary.tsx      # Suspense + ErrorBoundary reutilizable
  lib/
    query-keys.ts           # postKeys factory centralizado
    api/posts.ts            # fetch functions con Zod parse
    schemas/post.ts         # Zod schemas + tipos exportados
    store/posts.ts          # In-memory store (solo dev/template)
    constants/index.ts
    utils/index.ts
```

## Patrones clave

### Query key factory
```typescript
// lib/query-keys.ts
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (params) => [...postKeys.lists(), params] as const,
  detail: (id) => [...postKeys.details(), id] as const,
};
```

### SSR prefetch + HydrationBoundary
```typescript
// Server Component
const queryClient = new QueryClient();
await queryClient.prefetchQuery({ queryKey: postKeys.list({}), queryFn: fetchPosts });
return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <PostsList /> {/* ya tiene datos — sin loading flash */}
  </HydrationBoundary>
);
```

### useMutation + invalidación
```typescript
const mutation = useMutation({
  mutationFn: createPost,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: postKeys.lists() }),
});
```

---

## Verificación

Todo lo siguiente está comprobado y funcionando al 100%.

### Calidad de código
| Check | Comando |
|---|---|
| Lint | `pnpm lint` |
| Tipado estricto | `pnpm type-check` |
| Build (Turbopack) | `pnpm build` |

### Tests unitarios (27/27)
```bash
pnpm test:run
```
| Suite | Cubre |
|---|---|
| `query-keys.test.ts` (5) | Factory: all, lists(), list(params), detail(id), keys distintos |
| `schemas/post.test.ts` (8) | Post válido, uuid inválido, title faltante, lista response, total negativo, CreateInput válido/inválido |
| `store/posts.test.ts` (9) | findAll paginado, create+findById, update (preserva campos), delete, 404s |
| `utils/index.test.ts` (5) | cn() join/falsy/vacío, formatDate() formato y no vacío |

### Tests e2e (14/14)
```bash
pnpm build && pnpm test:e2e
```
| Suite | Cubre |
|---|---|
| `posts.spec.ts` (4) | Sin spinner en carga (SSR prefetch), items visibles, navegación a detalle, crear post → redirect + caché invalidado |
| `table.spec.ts` (4) | Tabla renderiza, filtro auto-contenido (autor único), sort ASC/DESC en columna, paginación next/prev |
| `api.spec.ts` (6) | GET list paginado, POST 201, POST 422 inválido, GET by id, GET 404, DELETE 204 |

### Runtime verificado en navegador
| Ruta / Flujo | Resultado |
|---|---|
| `GET /` | Home RSC con 4 feature cards, sin errores de consola |
| `GET /posts` | Lista sin loading flash (SSR prefetch + HydrationBoundary), 20 total |
| `GET /posts/:id` | Detalle con título, autor, fecha y botón Delete |
| `DELETE /posts/:id` | Redirige a lista, count baja de 20 → 19, Post eliminado desaparece |
| `POST /posts/create` | Form → POST → redirect a detalle → lista refetches (invalidateQueries), nuevo post al tope |
| `GET /table` | Tabla 20 rows / 4 páginas, sort ↑↓ por columna, filter, paginación next/prev |
| `GET /api/posts` | JSON paginado correcto |
| ReactQueryDevtools | Panel abre, muestra queries con estado Fresh/Inactive/Stale, tab Mutations |

### CI (GitHub Actions)
`pnpm install` → `pnpm lint` → `pnpm type-check` → `pnpm build` → `pnpm test:run` → `playwright install chromium` → `pnpm test:e2e`

### Pipeline de commits (local)
`git commit` → husky → lint-staged → `eslint --fix` + `prettier --write`

### Gaps conocidos
- **Sin Docker**: deploy habitual es Vercel
- **Sin auth**: se agrega por proyecto
- **In-memory store**: los datos se pierden al reiniciar el server — reemplazar con DB real por proyecto
- **TanStack Table + React Compiler**: `useReactTable` no es memoizable por React Compiler (warning suprimido con eslint-disable). Comportamiento esperado — TanStack Table v8 no es compatible con React Compiler
- **E2e en CI requiere `pnpm build` previo**: el webServer usa `pnpm start` en CI
