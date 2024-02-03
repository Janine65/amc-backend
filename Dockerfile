# FROM node:lts-alpine
FROM guergeiro/pnpm:18-8
ENV NODE_ENV=production

WORKDIR /usr/src
COPY ["package.json", "pnpm-lock.yaml", "./"]
# RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
COPY . .

EXPOSE 2700
RUN chown -R node /usr/src
USER node
CMD ["pnpm", "start"]
