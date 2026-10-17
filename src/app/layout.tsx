import { SerwistProvider } from "@serwist/next/react";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Providers } from "@/components/providers";
import { APP_NAME, COLOR_TEMA, NAVEGACION } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  applicationName: APP_NAME,
  description: "Tareas como grafo: hoy puedo, bloqueos, ramas",
  appleWebApp: { capable: true, statusBarStyle: "default", title: APP_NAME },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: COLOR_TEMA,
};

const SIN_SERVICE_WORKER_EN_DEV = process.env.NODE_ENV === "development";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <SerwistProvider swUrl="/sw.js" disable={SIN_SERVICE_WORKER_EN_DEV}>
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
        </SerwistProvider>
      </body>
    </html>
  );
}
