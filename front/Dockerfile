FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
EXPOSE 5173
CMD ["sh","-lc","npm rebuild rollup; [ -d node_modules ] && [ \"$(ls -A node_modules)\" ] || npm ci --legacy-peer-deps; exec npm run dev -- --host 0.0.0.0 --port 5173"]

