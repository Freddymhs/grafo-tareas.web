import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { useDatosHidratados } from "./use-hidratado";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

const ESPACIOS = ["Prueba FASE 24", "SIGSA"];
const cache: { datos: string[] | undefined } = { datos: undefined };

function Pestanas({ datos }: { readonly datos: string[] | undefined }) {
  return (
    <ul>
      {(datos ?? []).map((nombre) => (
        <li key={nombre}>{nombre}</li>
      ))}
      <li>Todo</li>
    </ul>
  );
}

const SinCuidado = () => <Pestanas datos={cache.datos} />;
const Cuidada = () => <Pestanas datos={useDatosHidratados(cache.datos)} />;

async function hidratar(Componente: () => React.JSX.Element) {
  cache.datos = undefined;
  const contenedor = document.createElement("div");
  contenedor.innerHTML = renderToString(<Componente />);
  cache.datos = ESPACIOS;
  const errores: string[] = [];
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  await act(async () => {
    hydrateRoot(contenedor, <Componente />, {
      onRecoverableError: (error) => errores.push(String(error)),
    });
  });
  return { errores, texto: contenedor.textContent };
}

describe("useDatosHidratados — la primera pasada del cliente coincide con el HTML del servidor (FASE 24)", () => {
  it("sin el cuidado, datos que ya están en la caché al hidratar rompen la hidratación (el chequeo puede fallar)", async () => {
    const { errores } = await hidratar(SinCuidado);
    expect(errores.length).toBeGreaterThan(0);
  });

  it("con el cuidado, no hay error de hidratación y los datos aparecen enseguida", async () => {
    const { errores, texto } = await hidratar(Cuidada);
    expect(errores).toEqual([]);
    expect(texto).toBe("Prueba FASE 24SIGSATodo");
  });
});
