FROM node:20-alpine

WORKDIR /app

# Copy package.json trước
COPY package*.json ./

# Cài đặt dependency (sẽ bao gồm kafkajs)
RUN npm install

COPY . .

COPY google-service-account.json /app/google-service-account.json


EXPOSE 3000
CMD ["npm", "run", "start:dev"]
