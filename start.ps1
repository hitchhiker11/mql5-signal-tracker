function Stop-ProcessOnPort {
    param([int]$Port)
    $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
               Select-Object -ExpandProperty OwningProcess | 
               Get-Process
    if ($process) {
        Stop-Process -Id $process.Id -Force
        Write-Host "Process on port $Port stopped"
        Start-Sleep -Seconds 2
    }
}

# Останавливаем процессы на портах 3000 и 3001
Stop-ProcessOnPort -Port 3000
Stop-ProcessOnPort -Port 3001


# Запуск PostgreSQL (если локально)
Start-Service -Name 'postgresql'

# Применение схемы базы данных
& psql -U $env:DB_USER -d $env:DB_NAME -f database/schema.sql

# Проверяем наличие Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node is not installed"
    exit 1
}

# Установка зависимостей и запуск парсера
Write-Host "Starting parser..."
Set-Location -Path ".\backend"
# npm install
Start-Process npm -ArgumentList "start" -NoNewWindow

# Ждем немного, чтобы парсер успел запуститься
Start-Sleep -Seconds 5

# Установка зависимостей и запуск фронтенда
Write-Host "Starting frontend..."
Set-Location -Path "..\mql5-frontend"
# npm install
npm run dev
