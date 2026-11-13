import { SerwistProvider } from "@serwist/next/react";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import type { ReactNode } from "react";
import { MenuPrincipal } from "@/components/menu-principal";
import { PestanasAlcance } from "@/components/pestanas-alcance";
import { Providers } from "@/components/providers";
import { APP_NAME, COLOR_TEMA } from "@/lib/constants";
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
            <Suspense>
              <MenuPrincipal />
              <PestanasAlcance />
            </Suspense>
            <main className="mx-auto max-w-7xl px-6 py-8">
              <Suspense>{children}</Suspense>
            </main>
          </Providers>
        </SerwistProvider>
      </body>
    </html>
  );
}
