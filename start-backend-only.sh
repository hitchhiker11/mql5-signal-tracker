#!/bin/bash

# Цвета для красивого вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SERVER_IP="109.73.192.193"

echo -e "${YELLOW}Запуск только бэкенда Meta Trader App на сервере ${SERVER_IP}...${NC}"

# Проверка наличия необходимых привилегий
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Для корректной работы Docker может потребоваться запустить скрипт с sudo.${NC}"
    read -p "Продолжить без sudo? (y/n): " answer
    if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
        echo -e "${YELLOW}Перезапустите скрипт с sudo: sudo ./start-backend-only.sh${NC}"
        exit 1
    fi
fi

# Проверка наличия Docker и Docker Compose
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker не установлен. Установите Docker и повторите попытку.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose не установлен. Установите Docker Compose и повторите попытку.${NC}"
    exit 1
fi

# Проверка наличия .env файлов и создание их из примеров, если не существуют
if [ ! -f ./backend/.env ]; then
    echo -e "${YELLOW}Файл backend/.env не найден. Создание из примера...${NC}"
    cp ./backend/.env.example ./backend/.env
    echo -e "${GREEN}Создан backend/.env из примера.${NC}"
    
    # Заменим localhost на IP сервера
    sed -i "s/localhost:80/${SERVER_IP}/g" ./backend/.env
    echo -e "${YELLOW}URL в backend/.env обновлен на ${SERVER_IP}${NC}"
fi

# Установка правильных разрешений для директорий
echo -e "${YELLOW}Настройка разрешений для директорий...${NC}"
if [ -d "./backend/cache" ]; then
    chmod -R 777 ./backend/cache
    echo -e "${GREEN}Установлены разрешения 777 для ./backend/cache${NC}"
fi

if [ -d "./backend/logs" ]; then
    chmod -R 777 ./backend/logs
    echo -e "${GREEN}Установлены разрешения 777 для ./backend/logs${NC}"
fi

# Создание сети Docker, если она не существует
if ! docker network inspect meta_trader_network &> /dev/null; then
    echo -e "${YELLOW}Создание Docker сети meta_trader_network...${NC}"
    docker network create meta_trader_network
    echo -e "${GREEN}Сеть meta_trader_network создана.${NC}"
fi

# Остановка контейнеров, если они уже запущены
echo -e "${YELLOW}Остановка существующих контейнеров (если есть)...${NC}"
docker-compose -f docker-compose.backend-only.yml down

# Сборка и запуск Docker-композиции
echo -e "${YELLOW}Сборка и запуск бэкенд-контейнеров...${NC}"
docker-compose -f docker-compose.backend-only.yml build --no-cache
docker-compose -f docker-compose.backend-only.yml up -d

# Проверка статуса контейнеров
echo -e "${YELLOW}Проверка статуса контейнеров...${NC}"
docker-compose -f docker-compose.backend-only.yml ps

echo -e "${GREEN}Meta Trader App (только бэкенд) запущен!${NC}"
echo -e "${YELLOW}Бэкенд API доступен по адресу: ${GREEN}http://${SERVER_IP}:3001${NC}"
echo -e "\n${YELLOW}Для остановки используйте: ${RED}docker-compose -f docker-compose.backend-only.yml down${NC}" 