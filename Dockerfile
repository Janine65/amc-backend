# --- Stage 1: Build ---
FROM node:22-bookworm AS builder
WORKDIR /usr/src/app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
# .env wird zur Build-Zeit für `prisma migrate deploy` gebraucht.
# Sie wird via --mount=type=secret eingehängt und liegt NICHT im Layer.
RUN --mount=type=secret,id=dotenv,target=/usr/src/app/.env.prod \
    pnpm run db:deploy && pnpm run build

# --- Stage 2: Runtime ---
FROM node:22-bookworm AS runtime
WORKDIR /usr/src/app
ENV NODE_ENV=production
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# node_modules (inkl. generiertem Prisma Client) aus dem Builder übernehmen
COPY --from=builder /usr/src/app/node_modules ./node_modules
# Dev-Dependencies entfernen, Prisma Client bleibt erhalten
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm prune --prod
# nur das kompilierte Ergebnis aus Stage 1 übernehmen:
COPY --from=builder /usr/src/app/dist ./dist
# KEIN COPY der .env! Wird zur Laufzeit eingehängt.
USER node
EXPOSE 3001
CMD ["node", "dist/src/main.js"]