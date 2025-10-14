# Multi-stage build for Longwave Simplified

# Stage 1: Build client
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Setup server
FROM node:18-alpine AS production
WORKDIR /app

# Copy server files
COPY server/package*.json ./
RUN npm ci --production

COPY server/ ./
COPY shared/ ./shared/

# Copy built client files
COPY --from=client-builder /app/client/dist ./public

# Create directory for database
RUN mkdir -p /app/data

# Expose port
EXPOSE 3001

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV DATABASE_PATH=/app/data/longwave.db

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "index.js"]
