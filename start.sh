#!/bin/bash

# Запуск PostgreSQL (если локально)
# sudo service postgresql start

# Применение схемы базы данных
psql -U $DB_USER -d $DB_NAME -f database/schema.sql

# Запуск парсера
cd mql5-parser && npm install && npm start &

# Запуск фронтенда
cd ../mql5-frontend && npm install && npm start 