FROM node:lts-alpine
ENV NODE_ENV=production

WORKDIR /usr/src
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .

EXPOSE 2700
RUN chown -R node /usr/src
USER node
CMD ["npm", "start"]
