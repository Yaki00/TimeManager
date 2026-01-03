FROM node:20-slim AS base

RUN apt-get update -y \
  && apt-get install -y openssl libssl3 ca-certificates bash \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=development
ENV NPM_CONFIG_PRODUCTION=false

COPY package*.json ./
COPY prisma ./prisma

# Installation des dépendances : npm ci si lock file existe, sinon npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

FROM base AS dev
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm","run","dev"]


FROM base AS test
ENV NODE_ENV=test
CMD ["npm","run","test"]

FROM base AS production
ENV NODE_ENV=production
# Générer Prisma Client pour la production
RUN npx prisma generate --schema=prisma/schema.prisma
EXPOSE 3000
CMD ["npm","start"]