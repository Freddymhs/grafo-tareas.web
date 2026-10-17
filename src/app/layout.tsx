import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Providers } from "@/components/providers";
import { APP_NAME } from "@/lib/constants";
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
          </nav>
          <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
