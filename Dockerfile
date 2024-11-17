FROM node:16-slim AS base
 
FROM base AS deps
 
RUN corepack enable
RUN npm install -g pnpm@latest-8 --force
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --prod
 
FROM base AS build
 
RUN corepack enable
RUN npm install -g pnpm@latest-8 --force
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install
COPY . .
RUN pnpm build:swc
 
FROM base
 
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

COPY package.json /app/dist
ENV NODE_ENV=production

CMD ["node", "./dist/src/server.js"]