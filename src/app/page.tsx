import Link from "next/link";

const FEATURES = [
  {
    href: "/posts",
    title: "Posts — SSR prefetch + useQuery",
    description:
      "Server Component prefetches data → HydrationBoundary → Client Component consumes cache with no loading flash. Demonstrates cache invalidation via useMutation.",
    color: "bg-blue-500",
  },
  {
    href: "/posts/create",
    title: "Create Post — useMutation",
    description:
      "useMutation posts to the API, then invalidateQueries forces the list to refetch automatically.",
    color: "bg-green-500",
  },
  {
    href: "/table",
    title: "Table — TanStack Table",
    description:
      "useReactTable with client-side sorting, global filter, and pagination. Data fetched via useQuery.",
    color: "bg-purple-500",
  },
  {
    href: "/api/posts",
    title: "API — /api/posts",
    description:
      "REST API built with Next.js Route Handlers. GET list, POST, GET/:id, PUT, DELETE.",
    color: "bg-orange-500",
  },
] as const;

// React Server Component — rendered on the server
export default function HomePage() {
  return (
    <div>
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-3">Next.js + TanStack Template</h1>
        <p className="text-gray-500 text-lg max-w-2xl">
          Production-ready starter combining Next.js App Router with TanStack Query for intelligent
          server-state management and TanStack Table for powerful data grids.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
        {FEATURES.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="block p-5 rounded-xl border border-gray-200 hover:border-gray-400 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className={`w-3 h-3 rounded-full ${f.color}`} />
              <h2 className="font-semibold">{f.title}</h2>
            </div>
            <p className="text-gray-500 text-sm">{f.description}</p>
          </Link>
        ))}
      </section>

      <section className="bg-gray-50 rounded-xl p-6 text-sm space-y-2 text-gray-600">
        <p className="font-semibold text-gray-900">Key patterns</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <code className="bg-white px-1 rounded">QueryClientProvider</code> wraps the app in{" "}
            <code className="bg-white px-1 rounded">components/providers.tsx</code>
          </li>
          <li>
            <code className="bg-white px-1 rounded">postKeys</code> factory centralizes all query
            keys in <code className="bg-white px-1 rounded">lib/query-keys.ts</code>
          </li>
          <li>
            <code className="bg-white px-1 rounded">HydrationBoundary</code> transfers server
            prefetch into the client cache
          </li>
          <li>
            <code className="bg-white px-1 rounded">invalidateQueries</code> after mutation triggers
            automatic background refetch
          </li>
          <li>
            <code className="bg-white px-1 rounded">ReactQueryDevtools</code> available in dev mode
            (bottom-right corner)
          </li>
        </ul>
      </section>
    </div>
  );
}
