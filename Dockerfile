FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

CMD ["sh", "-c", "npm run db:deploy && node dist/src/main.js"]