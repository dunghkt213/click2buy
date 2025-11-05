# ==========================
# 1. Base image (Node 18)
# ==========================
FROM node:18

# ==========================
# 2. Set working directory
# ==========================
WORKDIR /app

# ==========================
# 3. Copy package.json trước
#  -> tận dụng cache Docker
# ==========================
COPY package*.json ./

# ==========================
# 4. Cài dependencies
# ==========================
RUN npm install

# ==========================
# 5. Copy toàn bộ source code
# ==========================
COPY . .

# ==========================
# 6. Build NestJS (nếu chạy production)
# ==========================
RUN npm run build

# ==========================
# 7. Expose port
# ==========================
EXPOSE 3000

# ==========================
# 8. Start command
# ==========================
CMD ["npm", "run", "start:prod"]
