# FROM node:lts-alpine
FROM guergeiro/pnpm:20-8
ENV NODE_ENV=production

WORKDIR /usr/src
RUN pnpm --version
COPY ["package.json", "pnpm-lock.yaml", "./"]

RUN pnpm install --force
COPY . .

EXPOSE 2700
RUN chown -R node /usr/src
USER node
CMD ["node", "server.js"]
