FROM node:20-alpine

WORKDIR /app

# Copy package.json trước
COPY package*.json ./

# Cài đặt dependency
RUN npm install --legacy-peer-deps

EXPOSE 3006
CMD ["npm", "run", "start:dev"]

