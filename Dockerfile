FROM node:18-alpine AS build
ENV NODE_ENV=production

# set working directory
WORKDIR /usr/local/app

COPY ./ /usr/local/app/
RUN rm -f package-lock.json
RUN rm -fr /usr/local/app/dist
# install package.json (o sea las dependencies)
RUN npm install

# start app
RUN npm run build

# Stage 1, for copying the compiled app from the previous step and making it ready for production with Nginx
FROM nginx:alpine
COPY --from=build /usr/local/app/dist/amc-interna /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

