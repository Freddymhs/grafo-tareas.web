import { Tablero } from "./tablero";

// La home es el tablero: es lo que Freddy abre primero en Todoist (las secciones de TRABAJO). RSC que monta el
// componente cliente; los datos se piden en el navegador, así no hay nada que hidratar de más.
export default function HomePage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Tablero</h1>
      <Tablero />
    </div>
  );
}
