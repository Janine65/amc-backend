FROM node:20-slim AS build
 
RUN corepack enable
WORKDIR /usr/local/app
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch --frozen-lockfile
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build --output-path=dist
 
# Stage 1, for copying the compiled app from the previous step and making it ready for production with Nginx
FROM nginx:alpine
COPY --from=build /usr/local/app/dist /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

