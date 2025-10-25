FROM node:20-slim AS base

RUN apt-get update -y \
  && apt-get install -y openssl libssl3 ca-certificates bash \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=development
ENV NPM_CONFIG_PRODUCTION=false

COPY package*.json ./
COPY prisma ./prisma
RUN mkdir -p ./scripts
COPY scripts/install-deps.sh ./scripts/

# Rendre le script exécutable et l'exécuter
RUN chmod +x ./scripts/install-deps.sh && bash ./scripts/install-deps.sh

COPY . .

FROM base AS dev
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm","run","dev"]


FROM base AS test
ENV NODE_ENV=test
CMD ["npm","run","test"]