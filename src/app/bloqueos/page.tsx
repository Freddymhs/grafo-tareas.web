import { Bloqueos } from "./bloqueos";

export default function BloqueosPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Bloqueos</h1>
      <p className="mb-4 text-sm text-gray-500">
        Quién tiene algo esperando, y qué se libera si contesta.
      </p>
      <Bloqueos />
    </div>
  );
}
