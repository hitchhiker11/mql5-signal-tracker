/**
 * CacheManager - класс для управления кешированием данных MQL5
 * 
 * Предоставляет функциональность для кеширования результатов парсинга сигналов
 * и управления временем жизни кеша.
 */

import NodeCache from 'node-cache';

class CacheManager {
    /**
     * Создает экземпляр менеджера кеширования
     * 
     * @param {Object} options - Настройки кеширования
     * @param {boolean} [options.enabled=true] - Включено ли кеширование
     * @param {number} [options.ttl=3600] - Время жизни кеша в секундах (по умолчанию 1 час)
     * @param {Object} [options.logger] - Опциональный логгер для записи событий кеширования
     */
    constructor(options = {}) {
        // Настройки по умолчанию
        this.options = {
            enabled: true,
            ttl: 3600, // 1 час
            ...options
        };
        
        this.logger = options.logger || {
            info: () => {},
            debug: () => {},
            warn: () => {},
            error: () => {}
        };
        
        // Инициализируем кеш только если он включен
        if (this.options.enabled) {
            this.cache = new NodeCache({
                stdTTL: this.options.ttl,
                checkperiod: Math.min(this.options.ttl / 10, 600), // проверка каждые 10% от TTL, но не более 10 минут
                useClones: false // для экономии памяти
            });
            
            this.logger.info(`CacheManager: Кеширование включено. TTL: ${this.options.ttl} сек.`);
            
            // Отслеживаем expired события для логирования
            this.cache.on('expired', (key, value) => {
                this.logger.debug(`CacheManager: Истек срок кеша для ${key}`);
            });
        } else {
            this.logger.info('CacheManager: Кеширование отключено.');
        }
    }
    
    /**
     * Генерирует ключ для кеширования на основе URL и режима парсинга
     * 
     * @param {string} url - URL сигнала
     * @param {string} mode - Режим парсинга (fast/normal/advanced)
     * @returns {string} Ключ для кеширования
     * @private
     */
    _generateKey(url, mode) {
        // Нормализуем URL
        const normalizedUrl = url.toLowerCase().trim();
        
        // Создаем ключ из URL и режима
        return `${normalizedUrl}::${mode || 'normal'}`;
    }
    
    /**
     * Сохраняет данные в кеш
     * 
     * @param {string} url - URL сигнала
     * @param {Object} data - Данные для кеширования
     * @param {string} mode - Режим парсинга
     * @returns {boolean} Успешность сохранения
     */
    set(url, data, mode = 'normal') {
        if (!this.options.enabled || !this.cache) {
            return false;
        }
        
        try {
            const key = this._generateKey(url, mode);
            
            // Добавляем метаданные о кешировании
            const cachedData = {
                ...data,
                meta: {
                    ...(data.meta || {}),
                    cachedAt: new Date().toISOString(),
                    cacheExpires: new Date(Date.now() + this.options.ttl * 1000).toISOString()
                }
            };
            
            // Сохраняем в кеш
            const success = this.cache.set(key, cachedData);
            
            if (success) {
                const cacheSize = JSON.stringify(cachedData).length;
                this.logger.debug(`CacheManager: Кеширован ${key} (${(cacheSize / 1024).toFixed(2)} KB)`);
            } else {
                this.logger.warn(`CacheManager: Не удалось кешировать ${key}`);
            }
            
            return success;
        } catch (error) {
            this.logger.error(`CacheManager: Ошибка при кешировании ${url}: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Получает данные из кеша
     * 
     * @param {string} url - URL сигнала
     * @param {string} mode - Режим парсинга
     * @param {boolean} bypassCache - Пропустить кеш и получить свежие данные
     * @returns {Object|null} Данные из кеша или null, если не найдены
     */
    get(url, mode = 'normal', bypassCache = false) {
        if (!this.options.enabled || !this.cache || bypassCache) {
            return null;
        }
        
        try {
            const key = this._generateKey(url, mode);
            const data = this.cache.get(key);
            
            if (data) {
                this.logger.debug(`CacheManager: Использованы кешированные данные для ${key}`);
                return data;
            } else {
                this.logger.debug(`CacheManager: Кеш не найден для ${key}`);
                return null;
            }
        } catch (error) {
            this.logger.error(`CacheManager: Ошибка при получении из кеша ${url}: ${error.message}`);
            return null;
        }
    }
    
    /**
     * Удаляет данные из кеша
     * 
     * @param {string} url - URL сигнала
     * @param {string} mode - Режим парсинга
     * @returns {boolean} Успешность удаления
     */
    remove(url, mode = 'normal') {
        if (!this.options.enabled || !this.cache) {
            return false;
        }
        
        try {
            const key = this._generateKey(url, mode);
            const success = this.cache.del(key);
            
            if (success) {
                this.logger.debug(`CacheManager: Удален кеш для ${key}`);
            }
            
            return success;
        } catch (error) {
            this.logger.error(`CacheManager: Ошибка при удалении из кеша ${url}: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Очищает весь кеш
     * 
     * @returns {boolean} Успешность очистки
     */
    clear() {
        if (!this.options.enabled || !this.cache) {
            return false;
        }
        
        try {
            this.cache.flushAll();
            this.logger.info('CacheManager: Кеш полностью очищен');
            return true;
        } catch (error) {
            this.logger.error(`CacheManager: Ошибка при очистке кеша: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Получает статистику кеша
     * 
     * @returns {Object} Статистика кеша
     */
    getStats() {
        if (!this.options.enabled || !this.cache) {
            return {
                enabled: false,
                keys: 0,
                hits: 0,
                misses: 0,
                ttl: this.options.ttl
            };
        }
        
        const stats = this.cache.getStats();
        const keys = this.cache.keys();
        
        return {
            enabled: true,
            keys: keys.length,
            hits: stats.hits,
            misses: stats.misses,
            ttl: this.options.ttl,
            keysList: keys
        };
    }
}

export default CacheManager;