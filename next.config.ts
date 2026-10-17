import { spawnSync } from "node:child_process";
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const RUTA_OFFLINE = "/~offline";

// El plugin de webpack no ve las rutas prerenderizadas: la página offline se precachea a mano, versionada por commit.
const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
  crypto.randomUUID();

// Serwist clásico (plugin de webpack): el build va con `next build --webpack` (package.json). Con Turbopack
// harían falta `@serwist/cli` + modo configurator; pendiente de decidir con Freddy. En dev no hay service worker.
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  additionalPrecacheEntries: [{ url: RUTA_OFFLINE, revision }],
});

const nextConfig: NextConfig = {
  // Dos lockfiles en el padre (vr usa npm): sin esto Next adivina la raíz del workspace y avisa en cada build.
  turbopack: { root: __dirname },
  outputFileTracingRoot: __dirname,
};

export default withSerwist(nextConfig);
