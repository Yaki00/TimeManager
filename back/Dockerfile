FROM node:20-slim

RUN apt-get update -y \
  && apt-get install -y openssl libssl3 ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .

EXPOSE 5555

CMD ["npm", "run", "studio"]
