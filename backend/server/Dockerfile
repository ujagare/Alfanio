# Use Node.js Alpine as base image
FROM node:20-alpine AS builder

# Install dependencies for node-gyp and other build tools
RUN apk add --no-cache python3 make g++ curl

# Create app directory
WORKDIR /usr/src/app

# Install PM2 globally
RUN npm install pm2 -g

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p logs/pm2 public/brochures

# Remove unnecessary files
RUN rm -rf tests development.env

# Create non-root user
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

# Set ownership
RUN chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:4000/health || exit 1

# Start the server using PM2 in production mode
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]
