import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Descripcion } from "./descripcion";

const html = (texto: string) => renderToStaticMarkup(<Descripcion texto={texto} />);

describe("Descripcion", () => {
  it("renderiza el Markdown de Todoist: títulos, listas, enlaces y tablas", () => {
    const salida = html(
      "# Contexto\n\n- uno\n- dos\n\n[PR](https://x.test)\n\n| a | b |\n|---|---|\n| 1 | 2 |",
    );
    expect(salida).toContain(">Contexto</h3>");
    expect(salida.match(/<li>/g)).toHaveLength(2);
    expect(salida).toContain('href="https://x.test" target="_blank" rel="noreferrer"');
    expect(salida).toContain("<table");
  });

  it("no ejecuta HTML crudo de la descripción", () => {
    const salida = html('<img src=x onerror="alert(1)"> hola');
    expect(salida).not.toContain("<img");
    expect(salida).toContain("hola");
  });
});
