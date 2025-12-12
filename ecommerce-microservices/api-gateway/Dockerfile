# --- BUILD STAGE ---
    FROM node:20-alpine AS builder
    WORKDIR /app
    
    # Copy package files
    COPY package*.json ./
    RUN npm install
    
    # Copy only gateway source!
    COPY . .
    
    RUN npm run build
    
    
    # --- PRODUCTION STAGE ---
    FROM node:20-alpine AS production
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install --only=production
    
    COPY --from=builder /app/dist ./dist
    
    CMD ["node", "dist/main.js"]
    