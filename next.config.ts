import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dos lockfiles en el padre (vr usa npm): sin esto Next adivina la raíz del workspace y avisa en cada build.
  turbopack: { root: __dirname },};

export default nextConfig;
