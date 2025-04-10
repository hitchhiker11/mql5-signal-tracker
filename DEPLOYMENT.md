# Meta Trader App Deployment Guide

This document provides detailed instructions for deploying the Meta Trader application in various environments. Follow these instructions to get your application up and running quickly and reliably.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Configuration Options](#configuration-options)
4. [Deployment Scenarios](#deployment-scenarios)
5. [Manual Setup](#manual-setup)
6. [Maintenance](#maintenance)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have the following:

- **Docker** and **Docker Compose** (v1.29.0 or later)
- For Windows: Docker Desktop with WSL2 backend
- For Linux: Docker Engine and Docker Compose
- Minimum 2GB RAM and 2 CPU cores for the host machine
- Open ports: 80 (HTTP), 3001 (API), and optionally 5432 (PostgreSQL)

## Quick Start

### Full Deployment (Frontend + Backend + Database)

For a complete deployment with a single command:

```bash
# Unix/Linux/macOS:
chmod +x start.sh
./start.sh [SERVER_IP]

# Windows PowerShell:
.\start.ps1 [-ServerIP "your-server-ip"]
```

This will:
1. Set up environment variables based on .env.example
2. Build and start all Docker containers
3. Initialize the database
4. Create the default admin user

### Backend-Only Deployment

If you want to deploy only the backend services (API + Database):

```bash
chmod +x start-backend-only.sh
./start-backend-only.sh [SERVER_IP]
```

## Configuration Options

### Environment Variables

The deployment uses these key environment variables:

| Variable | Purpose | Default |
|----------|---------|---------|
| SERVER_IP | External IP/hostname | 109.73.192.193 |
| DB_USER | PostgreSQL username | meta_trader_user |
| DB_PASSWORD | PostgreSQL password | meta_trader_password |
| DB_NAME | PostgreSQL database | meta_trader_db |
| JWT_SECRET | Secret for JWT tokens | your_jwt_secret_key_here |
| ADMIN_DEFAULT_PASSWORD | Default admin password | admin123 |

You can customize these by:
1. Editing `.env.example` before first deployment
2. Editing `.env` after initial deployment
3. Passing as environment variables: `DB_PASSWORD=secure123 ./start.sh`

### Resource Limits

Resource limits are configured in `docker-compose.override.yml`:

- Backend: 0.75 CPU, 512MB RAM
- Frontend: 0.25 CPU, 128MB RAM
- PostgreSQL: 0.5 CPU, 1GB RAM

Adjust these values based on your server capabilities.

## Deployment Scenarios

### Production Deployment

For production, we recommend:

1. Using a reverse proxy (e.g., Nginx, Traefik) for SSL termination
2. Setting strong passwords in `.env`
3. Using Docker secrets for sensitive information
4. Regular database backups

Example setup with custom domain:

```bash
# Set server domain
export SERVER_IP=metatrader.yourdomain.com
export JWT_SECRET=$(openssl rand -hex 32)
export DB_PASSWORD=$(openssl rand -hex 16)
export ADMIN_DEFAULT_PASSWORD=$(openssl rand -base64 12)

# Deploy
./start.sh
```

### Development Environment

For local development:

```bash
# Set for localhost
export SERVER_IP=localhost
export NODE_ENV=development

# Deploy with override for development
./start.sh
```

### Separate Frontend Hosting

If you want to host the frontend separately (e.g., on Vercel, Netlify):

1. Deploy backend only: `./start-backend-only.sh`
2. In your frontend deployment, set `VITE_API_URL=http://your-api-server:3001`

## Manual Setup

If you prefer to set up components manually:

### Backend Setup

```bash
cd backend
npm install
npm run start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev  # Development
npm run build  # Production build
```

### Database Setup

For a manual PostgreSQL setup:

```bash
# Create database and user
psql -U postgres
CREATE USER meta_trader_user WITH PASSWORD 'meta_trader_password';
CREATE DATABASE meta_trader_db;
GRANT ALL PRIVILEGES ON DATABASE meta_trader_db TO meta_trader_user;

# Import schema
psql -U meta_trader_user -d meta_trader_db -f database/schema.sql
```

## Maintenance

### Stopping Services

To stop all services and create backups:

```bash
./stop.sh
```

This will:
1. Create backups of logs and database
2. Gracefully shut down all containers

### Updates

To update to the latest version:

1. Pull the latest code: `git pull`
2. Rebuild and restart: `./start.sh`

### Backups

Backups are automatically created when stopping the application. To manually backup:

```bash
# Create backup directory
mkdir -p ./backups/manual-$(date +%Y-%m-%d_%H-%M-%S)

# Backup database
docker-compose exec postgres pg_dump -U meta_trader_user -d meta_trader_db > ./backups/manual-$(date +%Y-%m-%d_%H-%M-%S)/db_backup.sql
```

## Troubleshooting

### Common Issues

#### Connection Refused to API

1. Check if containers are running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify API is listening on 0.0.0.0: `docker-compose exec backend netstat -tuln`

#### Database Connection Issues

1. Check PostgreSQL is running: `docker-compose ps postgres`
2. Verify database credentials in `.env` match what's in `docker-compose.yml`
3. Check database logs: `docker-compose logs postgres`

#### Frontend Not Loading

1. Check Nginx logs: `docker-compose logs frontend`
2. Verify API_URL is correctly set in build args
3. Check browser console for CORS errors

### Getting Support

If you encounter issues not covered here:

1. Check container logs: `docker-compose logs`
2. Check application logs in `./backend/logs/`
3. Open an issue on the project repository with detailed information 