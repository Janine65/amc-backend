FROM node:22-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN mv .env.prod .env
RUN npm run db:deploy
RUN npm run build

RUN rm -rf src
RUN rm -rf prisma
RUN rm -f .env

CMD ["sh", "-c", "node dist/src/main.js"]