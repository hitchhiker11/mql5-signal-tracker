FROM node:18-alpine

# Установка глобальных зависимостей
RUN npm install -g pm2

# Создание рабочей директории
WORKDIR /app

# Копирование файлов зависимостей
COPY package*.json ./

# Установка зависимостей
RUN npm install --production

# Копирование остальных файлов приложения
COPY . .

# Создание директории для кеша и установка правильных разрешений
RUN mkdir -p /app/cache/mql5 && chmod -R 777 /app/cache

# Порт, который будет прослушивать приложение
EXPOSE 3001

# Запуск через PM2 для автоматического перезапуска при падении
CMD ["pm2-runtime", "src/server.js", "--name", "meta_trader_backend"] 