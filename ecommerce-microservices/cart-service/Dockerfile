# -----------------------------
# Stage 1: Base
# -----------------------------
FROM node:20-alpine

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy package.json trước để cài dependencies
COPY package*.json ./

# Cài dependencies
RUN npm install --legacy-peer-deps

# Expose cổng nếu cần (Nest thường là 3000, nhưng microservice có thể không cần)
EXPOSE 3001

# Lệnh chạy cho môi trường dev
CMD ["npm", "run", "start:dev"]
