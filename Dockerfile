FROM node:22-alpine AS base
# pnpm sale de `packageManager` (package.json): la misma versión que el CI y el desarrollo, nunca `latest`.
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS build
# Next fija las NEXT_PUBLIC_* en el build: la URL de la API viaja en la imagen. Sin ella el build falla en vez de
# caer en silencio a localhost:3000, que en el teléfono no es la API.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN test -n "$NEXT_PUBLIC_API_URL" || { echo "falta --build-arg NEXT_PUBLIC_API_URL" >&2; exit 1; }
RUN pnpm build

FROM base AS production
ENV NODE_ENV=production
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
COPY --chown=node:node package.json next.config.ts ./
# Regla global §9: el proceso nunca corre como root dentro del contenedor (`node` viene en la imagen oficial).
USER node

EXPOSE 3000
CMD ["node_modules/.bin/next", "start", "-p", "3000"]
