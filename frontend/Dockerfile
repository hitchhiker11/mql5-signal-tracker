# Этап сборки
FROM node:18-alpine AS build

# Создание рабочей директории
WORKDIR /app

# Копирование файлов зависимостей
COPY package*.json ./

# Установка зависимостей с флагом --legacy-peer-deps для обхода конфликта версий
RUN npm install --legacy-peer-deps

# Копирование исходного кода
COPY . .

# Настройка переменных окружения для сборки
ARG VITE_API_URL=http://backend:3001
ENV VITE_API_URL=${VITE_API_URL}

# Сборка приложения
RUN npm run build

# Этап раздачи
FROM nginx:alpine

# Копирование результатов сборки в директорию Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Копирование конфигурации Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Порт, который будет прослушивать Nginx
EXPOSE 80

# Запуск Nginx с поддержкой переменных окружения и перезапуском при сбоях
CMD ["nginx", "-g", "daemon off;"] 