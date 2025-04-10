# Meta Trader App Deployment Script (PowerShell version)
# This script automates the deployment of the Meta Trader application on Windows

# Default IP address (can be overridden by passing argument)
param (
    [string]$ServerIP = "109.73.192.193"
)
Write-Host "🚀 Deploying Meta Trader App to server IP: $ServerIP" -ForegroundColor Cyan

# Create .env file if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    # Replace the SERVER_IP in the .env file
    (Get-Content .env) -replace "SERVER_IP=.*", "SERVER_IP=$ServerIP" | Set-Content .env
    Write-Host "✅ .env file created" -ForegroundColor Green
} else {
    Write-Host "📋 Using existing .env file" -ForegroundColor Green
}

# Load environment variables from .env
$envContent = Get-Content .env
foreach ($line in $envContent) {
    if (-not [string]::IsNullOrWhiteSpace($line) -and -not $line.StartsWith("#")) {
        $key, $value = $line -split '=', 2
        if (-not [string]::IsNullOrWhiteSpace($key)) {
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

Write-Host "🔍 Checking for Docker..." -ForegroundColor Yellow
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker not found. Please install Docker Desktop for Windows first." -ForegroundColor Red
    exit 1
}

Write-Host "🧹 Cleaning up old containers if needed..." -ForegroundColor Yellow
docker-compose down --remove-orphans

Write-Host "🔄 Pulling latest images..." -ForegroundColor Yellow
docker-compose pull

Write-Host "🏗️ Building containers..." -ForegroundColor Yellow
docker-compose build --no-cache

Write-Host "🚀 Starting services..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "🔍 Checking service health..." -ForegroundColor Yellow
# Check if the containers are running
$backendRunning = docker-compose ps | Select-String "meta_trader_backend.*Up"
if ($backendRunning) {
    Write-Host "✅ Backend service is running" -ForegroundColor Green
} else {
    Write-Host "❌ Backend service failed to start" -ForegroundColor Red
    docker-compose logs backend
    exit 1
}

$frontendRunning = docker-compose ps | Select-String "meta_trader_frontend.*Up"
if ($frontendRunning) {
    Write-Host "✅ Frontend service is running" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend service failed to start" -ForegroundColor Red
    docker-compose logs frontend
    exit 1
}

$postgresRunning = docker-compose ps | Select-String "meta_trader_postgres.*Up"
if ($postgresRunning) {
    Write-Host "✅ PostgreSQL service is running" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL service failed to start" -ForegroundColor Red
    docker-compose logs postgres
    exit 1
}

Write-Host "🔍 Checking API health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API is healthy" -ForegroundColor Green
    } else {
        Write-Host "⚠️ API health check failed with status code $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ API health check failed: $_" -ForegroundColor Yellow
    docker-compose logs backend
}

$adminPassword = [Environment]::GetEnvironmentVariable("ADMIN_DEFAULT_PASSWORD") 
if (-not $adminPassword) { $adminPassword = "admin123" }

Write-Host @"

🎉 Meta Trader App deployed successfully! 🎉
📊 Access your application:
   - Frontend: http://$ServerIP
   - API: http://$ServerIP:3001
   - Database: PostgreSQL available on port 5432 (internal access only)

📝 Default admin credentials:
   - Email: admin@example.com
   - Password: $adminPassword

⚙️ Management commands:
   - View logs: docker-compose logs
   - Stop services: docker-compose down
   - Restart: .\start.ps1
"@ -ForegroundColor Cyan
