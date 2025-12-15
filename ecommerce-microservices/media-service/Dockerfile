# --- BUILD STAGE ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install        # <-- cần devDependencies để build

COPY . .
RUN npm run build      # <-- build ra dist/ vì có Nest CLI trong devDeps


# --- PRODUCTION STAGE ---
FROM node:20-alpine AS production
WORKDIR /app

COPY package*.json ./
RUN npm install --only=production   # <-- chỉ cài deps thật sự cần khi chạy

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main.js"]

