FROM node:20-alpine

WORKDIR /app

# Copy package.json trước
COPY package*.json ./

# Cài đặt dependency (sẽ bao gồm kafkajs)
RUN npm install

# Copy toàn bộ source code
COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start:dev"]
