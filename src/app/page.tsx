import { APP_NAME } from "@/lib/constants";

// Home (RSC). Las vistas reales —hoy puedo, tablero por etapa, bloqueos, ramas— llegan en la tarea 2 de la FASE 4,
// una vez medido cómo usa Freddy sus proyectos de Todoist. Esta página solo confirma que la app y la API hablan.
export default function HomePage() {
  return (
    <header className="mb-12">
      <h1 className="text-4xl font-bold mb-3">{APP_NAME}</h1>
      <p className="text-gray-500 text-lg max-w-2xl">
        Tu trabajo como grafo: lo que puedes hacer hoy, qué está bloqueado y qué se libera si
        alguien contesta.
      </p>
    </header>
  );
}
