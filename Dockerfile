FROM node:alpine AS build
ENV NODE_ENV=production

# set working directory
WORKDIR /dist

# install package.json (o sea las dependencies)
COPY package.json /dist/package.json
RUN npm install

# add .bin to $PATH
ENV PATH /dist/node_modules/.bin:$PATH

# add app
COPY . .

# start app
RUN npm run build --configuration=production

# Stage 1, for copying the compiled app from the previous step and making it ready for production with Nginx
FROM nginx:alpine
COPY --from=build /dist/dist/amc-interna /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200

