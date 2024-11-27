FROM node:20-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
WORKDIR /app

COPY *.json pnpm-lock.yaml ./
RUN apt-get update
RUN apt-get --assume-yes install python3
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch --prod --lockfile
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --prod --lockfile
COPY . .
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm add -g nx
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm add -w @angular-devkit/core@17.3.10

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm run build
 
# Stage 1, for copying the compiled app from the previous step and making it ready for production with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
ENV NODE_ENV=production

EXPOSE 8080

