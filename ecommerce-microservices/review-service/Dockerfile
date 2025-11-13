# -------------------------------
# Dockerfile for review-service
# -------------------------------
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (to use layer cache)
COPY package*.json ./

# ✅ Install Nest CLI globally so "nest start" works
RUN npm install -g @nestjs/cli

# Install project dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose port (optional, for debugging)
ENV PORT=3000
EXPOSE 3000

# Run in development mode with watch
CMD ["npm", "run", "start:dev"]
