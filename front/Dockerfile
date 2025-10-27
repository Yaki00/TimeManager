FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; else npm install --legacy-peer-deps; fi
COPY . .
EXPOSE 5173
CMD ["sh","-lc","exec npm run dev -- --host 0.0.0.0 --port 5173"]

