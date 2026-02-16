# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ .
RUN npm run build

# Stage 3: Production Runner
FROM node:20-alpine
WORKDIR /app

# Copy backend build and dependencies
COPY --from=backend-builder /app/server/dist ./server/dist
COPY --from=backend-builder /app/server/package*.json ./server/
COPY --from=backend-builder /app/server/node_modules ./server/node_modules

# Copy frontend build to a public directory for the backend to serve
COPY --from=frontend-builder /app/dist ./public

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Start the backend server
CMD ["node", "server/dist/index.js"]
