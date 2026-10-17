import Link from "next/link";

/** Lo que muestra el service worker cuando no hay red ni copia de la página pedida. */
export default function OfflinePage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Sin conexión</h1>
      <p className="text-gray-500">Esta página no está guardada. Lo ya visto sigue disponible.</p>
      <Link href="/" className="text-sm text-blue-500 hover:underline">
        Ir al tablero
      </Link>
    </div>
  );
}
