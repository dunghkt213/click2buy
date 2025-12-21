# ------------ BUILD STAGE --------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install     # <-- phải cài đầy đủ devDeps để build

COPY . .
RUN npm run build   # <-- build NestJS ra dist/


# ------------ PRODUCTION STAGE --------------
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm install --production   # <-- chỉ install deps cần khi chạy

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main.js"]
