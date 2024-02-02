FROM guergeiro/pnpm:18-8 AS build
#FROM node:18-slim AS build
ENV NODE_ENV=production

# set working directory
WORKDIR /usr/local/app

COPY package.json pnpm-lock.yaml /usr/local/app/
# install package.json (o sea las dependencies)
# RUN pnpm fetch --prod
RUN pnpm install --frozen-lockfile 

COPY ./ /usr/local/app/

# start app
#RUN pnpm run build --output-path=dist

# Stage 1, for copying the compiled app from the previous step and making it ready for production with Nginx
FROM nginx:alpine
COPY --from=build /usr/local/app/dist/amc-interna /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

