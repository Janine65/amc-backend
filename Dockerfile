# --- Stage 1: Build ---
FROM node:22-bookworm-slim AS builder
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# .env wird zur Build-Zeit für `prisma migrate deploy` gebraucht.
# Sie wird via --mount=type=secret eingehängt und liegt NICHT im Layer.
RUN --mount=type=secret,id=dotenv,target=/usr/src/app/.env \
    npm run db:deploy && npm run build

# --- Stage 2: Runtime ---
FROM node:22-bookworm-slim AS runtime
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
# nur das kompilierte Ergebnis aus Stage 1 übernehmen:
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client
# KEIN COPY der .env! Wird zur Laufzeit eingehängt.
USER node
EXPOSE 3001
CMD ["node", "dist/src/main.js"]