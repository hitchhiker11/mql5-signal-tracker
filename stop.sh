#!/bin/bash

# Meta Trader App Shutdown Script
# This script stops the application and creates backups of important data

# Default IP address (can be overridden by passing argument)
SERVER_IP=${1:-"109.73.192.193"}
echo "🛑 Stopping Meta Trader App on server IP: ${SERVER_IP}"

# Load environment variables if .env exists
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# Create backup directory if it doesn't exist
BACKUP_DIR="./backups/$(date +%Y-%m-%d_%H-%M-%S)"
mkdir -p $BACKUP_DIR
echo "📦 Creating backup in $BACKUP_DIR"

# Backup logs if they exist
if [ -d "./backend/logs" ]; then
    echo "📄 Backing up logs..."
    mkdir -p $BACKUP_DIR/logs
    cp -r ./backend/logs/* $BACKUP_DIR/logs/ 2>/dev/null || echo "⚠️ No logs to backup"
fi

# Create database backup
echo "💾 Creating database backup..."
if docker-compose ps | grep -q "meta_trader_postgres.*Up"; then
    docker-compose exec postgres pg_dump -U ${DB_USER:-meta_trader_user} -d ${DB_NAME:-meta_trader_db} > $BACKUP_DIR/db_backup.sql
    echo "✅ Database backup created in $BACKUP_DIR/db_backup.sql"
else
    echo "⚠️ PostgreSQL container is not running, skipping database backup"
fi

# Stop containers
echo "🛑 Stopping containers..."
docker-compose down

echo "
✅ Meta Trader App has been stopped successfully!

📦 Backup created at: $BACKUP_DIR
💾 To restore the database from backup:
   cat $BACKUP_DIR/db_backup.sql | docker-compose exec -T postgres psql -U ${DB_USER:-meta_trader_user} -d ${DB_NAME:-meta_trader_db}

🚀 To restart the application:
   ./start.sh
" 