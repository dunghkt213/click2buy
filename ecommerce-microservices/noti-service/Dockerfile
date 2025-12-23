# ============================
# BUILD STAGE
# ============================
FROM node:18-alpine AS builder

WORKDIR /app

# Chỉ copy file cần thiết trước
COPY package.json package-lock.json ./

RUN npm install

# Copy toàn bộ source
COPY . .

RUN npm run build

# ============================
# PRODUCTION STAGE
# ============================
FROM node:18-alpine AS production

WORKDIR /app

COPY package.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main.js"]
