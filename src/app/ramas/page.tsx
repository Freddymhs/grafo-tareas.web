import { Ramas } from "./ramas";

export default function RamasPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Ramas</h1>
      <p className="mb-4 text-sm text-gray-500">
        Los círculos de color de Todoist, como entidad: cada rama y cuántos nodos tiene.
      </p>
      <Ramas />
    </div>
  );
}
