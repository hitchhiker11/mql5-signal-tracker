# Build stage
FROM node:18-alpine AS build

# Create working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build application with environment variables
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy build from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Install wget for healthcheck
RUN apk add --no-cache wget

# Expose port
EXPOSE 80

# Healthcheck to ensure Nginx is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --spider -q http://localhost:80 || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

FROM node:20.11.0-alpine

# Создание директории приложения
WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Установка wget для healthcheck
RUN apk add --no-cache wget

# Копирование кода приложения
COPY . .

# Создание директорий для кэша и логов с правильными разрешениями
RUN mkdir -p cache logs && chmod -R 777 cache logs

# Открытие порта для Express
EXPOSE 3001

# Запуск приложения
CMD ["node", "src/server.js"] 