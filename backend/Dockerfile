FROM node:20.11.0-alpine

# Install global dependencies and build tools
RUN apk add --no-cache postgresql-client wget

# Install PM2 globally for production process management
RUN npm install -g pm2

# Create working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# First install pg package which is missing but used in code
RUN npm install pg

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Create directories for cache with proper permissions
RUN mkdir -p /app/cache/mql5 && chmod -R 777 /app/cache
RUN mkdir -p /app/logs && chmod -R 777 /app/logs

# Port that will be exposed
EXPOSE 3001

# Healthcheck to ensure application is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --spider -q http://localhost:3001/api/health || exit 1

# Start application with PM2 for automatic restart on failure
CMD ["pm2-runtime", "src/server.js", "--name", "meta_trader_backend"] 