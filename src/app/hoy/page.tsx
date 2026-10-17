import { HoyPuedo } from "./hoy-puedo";

export default function HoyPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Hoy puedo…</h1>
      <p className="mb-4 text-sm text-gray-500">
        Lo abierto que nada bloquea. Lo calcula la API; acá solo se muestra.
      </p>
      <HoyPuedo />
    </div>
  );
}
