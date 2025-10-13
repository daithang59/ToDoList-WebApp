# Multi-stage build for production optimization
FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache wget curl

# Dependencies stage
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build stage  
FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
# Add any build steps here if needed (like TypeScript compilation)

# Production stage
FROM base AS production
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy production dependencies
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --from=build --chown=nodejs:nodejs /app/src ./src
COPY --from=build --chown=nodejs:nodejs /app/package*.json ./

# Security: Remove package manager
RUN rm -rf /usr/local/lib/node_modules/npm

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Start application
CMD ["node", "src/index.js"]
