import { defineConfig, devices } from "@playwright/test";

// La web vive en el 3001: el 3000 es la API (CORS_ORIGINS la espera ahí). PW_CHANNEL=chrome usa el Chrome del
// sistema cuando los navegadores de Playwright no están (p. ej. una terminal snap con otro HOME).
const PUERTO_WEB = 3001;
const BASE_URL = `http://localhost:${PUERTO_WEB}`;
const canal = process.env["PW_CHANNEL"];

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 2 : 0,
  workers: process.env["CI"] ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    // Sin service worker: si no, el SW de la PWA atiende los fetch a la API y page.route() no los ve.
    serviceWorkers: "block",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], ...(canal ? { channel: canal } : {}) },
    },
  ],
  webServer: {
    command: process.env["CI"] ? `pnpm start -p ${PUERTO_WEB}` : `pnpm dev -p ${PUERTO_WEB}`,
    url: BASE_URL,
    reuseExistingServer: !process.env["CI"],
    timeout: 60_000,
  },
});
