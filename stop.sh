#!/bin/bash

# Цвета для красивого вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SERVER_IP="109.73.192.193"

echo -e "${YELLOW}Остановка Meta Trader App на сервере ${SERVER_IP}...${NC}"

# Проверка наличия Docker и Docker Compose
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Ошибка: Docker или Docker Compose не установлены.${NC}"
    exit 1
fi

# Создаем директорию для резервных копий логов
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Сохраняем текущие логи контейнеров перед остановкой
echo -e "${YELLOW}Сохранение логов перед остановкой...${NC}"
docker-compose logs backend > "$BACKUP_DIR/backend_logs.txt"
docker-compose logs frontend > "$BACKUP_DIR/frontend_logs.txt"
docker-compose logs mongo > "$BACKUP_DIR/mongo_logs.txt"
echo -e "${GREEN}Логи сохранены в директории ${BACKUP_DIR}${NC}"

# Остановка и удаление контейнеров
echo -e "${YELLOW}Остановка контейнеров...${NC}"
docker-compose down

echo -e "${GREEN}Все контейнеры остановлены.${NC}"

# Спрашиваем о полной очистке (включая тома)
read -p "Хотите удалить все данные (включая БД и кеш)? (y/n): " answer
if [ "$answer" == "y" ] || [ "$answer" == "Y" ]; then
    echo -e "${RED}Удаление всех томов и данных...${NC}"
    
    # Сначала сохраняем данные из кеша, если нужно
    echo -e "${YELLOW}Создание резервной копии кеша...${NC}"
    if [ -d "./backend/cache" ]; then
        tar -czf "$BACKUP_DIR/cache_backup.tar.gz" ./backend/cache
        echo -e "${GREEN}Резервная копия кеша создана в ${BACKUP_DIR}/cache_backup.tar.gz${NC}"
    fi
    
    # Удаляем контейнеры и тома
    docker-compose down -v
    
    # Очистка неиспользуемых томов и сетей
    echo -e "${YELLOW}Очистка неиспользуемых Docker ресурсов...${NC}"
    docker volume prune -f
    docker network prune -f
    
    echo -e "${GREEN}Все данные удалены.${NC}"
else
    echo -e "${GREEN}Данные сохранены.${NC}"
    
    # Спрашиваем о очистке образов
    read -p "Хотите удалить образы Docker для освобождения места? (y/n): " clean_images
    if [ "$clean_images" == "y" ] || [ "$clean_images" == "Y" ]; then
        echo -e "${YELLOW}Удаление образов Docker...${NC}"
        docker rmi $(docker images -q meta_trader_*)
        echo -e "${GREEN}Образы удалены.${NC}"
    fi
fi

echo -e "${YELLOW}Для запуска используйте: ${GREEN}./start.sh${NC}" 