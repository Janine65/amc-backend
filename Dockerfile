FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

FROM base AS deps
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --prod
 
FROM base AS build
 
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install
COPY . .
RUN pnpm run build:swc
 
FROM base
 
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

COPY package.json /app/dist
ENV NODE_ENV=production
EXPOSE 8000
CMD ["node", "./dist/src/server.js"]