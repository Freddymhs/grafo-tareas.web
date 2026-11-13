"use client";

import Link from "next/link";
import { useAlcance } from "@/lib/alcance/use-alcance";
import { hrefConAlcance } from "@/lib/alcance";
import { APP_NAME, NAVEGACION } from "@/lib/constants";

export function MenuPrincipal() {
  const { alcance, conMetodo } = useAlcance();
  const visibles = NAVEGACION.filter(({ requiereMetodo }) => conMetodo || !requiereMetodo);

  return (
    <nav className="border-b border-gray-200 px-6 py-3 flex items-center gap-6 text-sm">
      <Link href={hrefConAlcance("/", alcance)} className="font-semibold text-gray-900">
        {APP_NAME}
      </Link>
      {visibles.map(({ href, titulo }) => (
        <Link
          key={href}
          href={hrefConAlcance(href, alcance)}
          className="text-gray-500 hover:text-gray-900"
        >
          {titulo}
        </Link>
      ))}
    </nav>
  );
}
