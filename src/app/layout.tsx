import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Providers } from "@/components/providers";
import { APP_NAME, NAVEGACION } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Tareas como grafo: hoy puedo, bloqueos, ramas",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <nav className="border-b border-gray-200 px-6 py-3 flex items-center gap-6 text-sm">
            <Link href="/" className="font-semibold text-gray-900">
              {APP_NAME}
            </Link>
            {NAVEGACION.map(({ href, titulo }) => (
              <Link key={href} href={href} className="text-gray-500 hover:text-gray-900">
                {titulo}
              </Link>
            ))}
          </nav>
          <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
