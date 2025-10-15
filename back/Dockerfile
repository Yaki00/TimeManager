FROM node:20-slim

RUN apt-get update -y \
  && apt-get install -y openssl libssl3 ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=development
ENV NPM_CONFIG_PRODUCTION=false

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .
EXPOSE 3000
CMD ["npm","run","dev"]
