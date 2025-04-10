#!/bin/bash

# Meta Trader App Deployment Script
# This script automates the deployment of the Meta Trader application

# Stop on any error
set -e

# Default IP address (can be overridden by passing argument)
SERVER_IP=${1:-"109.73.192.193"}
echo "🚀 Deploying Meta Trader App to server IP: ${SERVER_IP}"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    # Replace the SERVER_IP in the .env file
    sed -i "s/SERVER_IP=.*/SERVER_IP=${SERVER_IP}/" .env
    echo "✅ .env file created"
else
    echo "📋 Using existing .env file"
fi

# Load environment variables
set -a
source .env
set +a

echo "🔍 Checking for Docker..."
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker or Docker Compose not found. Please install Docker and Docker Compose first."
    exit 1
fi

echo "🧹 Cleaning up old containers if needed..."
docker-compose down --remove-orphans || true

echo "🔄 Pulling latest images..."
docker-compose pull || true

echo "🏗️ Building containers..."
docker-compose build --no-cache

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

echo "🔍 Checking service health..."
# Check if the containers are running
if docker-compose ps | grep -q "meta_trader_backend.*Up"; then
    echo "✅ Backend service is running"
else
    echo "❌ Backend service failed to start"
    docker-compose logs backend
    exit 1
fi

if docker-compose ps | grep -q "meta_trader_frontend.*Up"; then
    echo "✅ Frontend service is running"
else
    echo "❌ Frontend service failed to start"
    docker-compose logs frontend
    exit 1
fi

if docker-compose ps | grep -q "meta_trader_postgres.*Up"; then
    echo "✅ PostgreSQL service is running"
else
    echo "❌ PostgreSQL service failed to start"
    docker-compose logs postgres
    exit 1
fi

echo "🔍 Checking API health..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health | grep -q "200"; then
    echo "✅ API is healthy"
else
    echo "⚠️ API health check failed"
    docker-compose logs backend
fi

echo "
🎉 Meta Trader App deployed successfully! 🎉
📊 Access your application:
   - Frontend: http://${SERVER_IP}
   - API: http://${SERVER_IP}:3001
   - Database: PostgreSQL available on port 5432 (internal access only)

📝 Default admin credentials:
   - Email: admin@example.com
   - Password: ${ADMIN_DEFAULT_PASSWORD:-admin123}

⚙️ Management commands:
   - View logs: docker-compose logs
   - Stop services: ./stop.sh
   - Restart: ./start.sh
" 