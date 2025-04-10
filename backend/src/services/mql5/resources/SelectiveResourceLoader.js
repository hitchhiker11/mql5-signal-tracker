/**
 * SelectiveResourceLoader
 * 
 * Расширение ResourceLoader из JSDOM для избирательной загрузки ресурсов.
 * Позволяет контролировать, какие скрипты, стили и другие ресурсы будут загружены.
 */

import { ResourceLoader } from 'jsdom';

/**
 * @class SelectiveResourceLoader
 * @extends ResourceLoader
 */
export class SelectiveResourceLoader extends ResourceLoader {
    /**
     * Создает экземпляр SelectiveResourceLoader
     * @param {Object} options - Настройки для загрузчика ресурсов
     * @param {Array<RegExp|string>} [options.allowedScripts=[]] - Список разрешенных скриптов
     * @param {Array<RegExp|string>} [options.allowedStyles=[]] - Список разрешенных стилей
     * @param {boolean} [options.blockExternalResources=false] - Блокировать внешние ресурсы
     * @param {boolean} [options.logResources=false] - Логировать загрузку ресурсов
     * @param {Function} [options.logger=console.log] - Функция для логирования
     */
    constructor(options = {}) {
        super();
        
        // Настройки по умолчанию
        this.options = {
            allowedScripts: options.allowedScripts || [],
            allowedStyles: options.allowedStyles || [],
            blockExternalResources: false,
            logResources: options.logResources || false,
            logger: options.logger || console.log
        };
        
        // Переопределяем на false, чтобы точно отключить блокировку
        this.options.blockExternalResources = false;
        
        // Инициализируем счетчики для статистики
        this.stats = {
            allowed: 0,
            blocked: 0
        };
        
        if (this.options.logResources) {
            this._log('Resource loader initialized with options:', JSON.stringify(this.options, null, 2));
        }
    }
    
    /**
     * Переопределяем метод fetch для фильтрации ресурсов
     * @param {string} url - URL ресурса для загрузки
     * @param {Object} options - Опции запроса
     * @returns {Promise<Buffer>} - Содержимое ресурса
     * @override
     */
    fetch(url, options) {
        // Проверяем, должен ли ресурс быть загружен
        const shouldLoadResource = this._shouldLoadResource(url);
        
        if (this.options.logResources) {
            if (shouldLoadResource) {
                this._log(`Loading resource: ${url}`);
                this.stats.allowed++;
            } else {
                this._log(`Blocked resource: ${url}`);
                this.stats.blocked++;
                // Возвращаем пустое содержимое для заблокированных ресурсов
                return Promise.resolve(Buffer.from(''));
            }
        }
        
        if (!shouldLoadResource) {
            // Возвращаем пустое содержимое для заблокированных ресурсов
            return Promise.resolve(Buffer.from(''));
        }
        
        // Загружаем разрешенный ресурс
        return super.fetch(url, options)
            .then(result => {
                if (this.options.logResources) {
                    this._log(`Successfully loaded resource: ${url}`);
                }
                return result;
            })
            .catch(error => {
                this._logError(`Failed to load resource: ${url}`, error.message);
                return Buffer.from(''); // Возвращаем пустое содержимое при ошибке
            });
    }
    
    /**
     * Проверяет, должен ли ресурс быть загружен на основе правил фильтрации
     * @param {string} url - URL ресурса
     * @returns {boolean} - true, если ресурс должен быть загружен
     * @private
     */
    _shouldLoadResource(url) {
        // Всегда разрешаем загрузку базовой HTML-страницы
        if (url.endsWith('.html') || url.includes('/signals/')) {
            return true;
        }
        
        // Проверяем JavaScript-файлы
        if (url.endsWith('.js') || url.includes('.js?')) {
            // Проверяем по шаблонам разрешенных скриптов
            return this._matchesAnyPattern(url, this.options.allowedScripts);
        }
        
        // Проверяем CSS-файлы
        if (url.endsWith('.css') || url.includes('.css?')) {
            // Проверяем по шаблонам разрешенных стилей
            return this._matchesAnyPattern(url, this.options.allowedStyles);
        }
        
        // Блокируем внешние ресурсы, если указано
        if (this.options.blockExternalResources) {
            // Разрешаем только ресурсы с mql5.com, если блокируем внешние
            return url.includes('mql5.com');
        }
        
        // По умолчанию разрешаем
        return true;
    }
    
    /**
     * Проверяет, соответствует ли URL любому из указанных шаблонов
     * @param {string} url - URL для проверки
     * @param {Array<RegExp|string>} patterns - Шаблоны для сравнения
     * @returns {boolean} - true, если URL соответствует любому из шаблонов
     * @private
     */
    _matchesAnyPattern(url, patterns) {
        if (!patterns || patterns.length === 0) return false;
        
        return patterns.some(pattern => {
            if (pattern instanceof RegExp) {
                return pattern.test(url);
            } else if (typeof pattern === 'string') {
                return url.includes(pattern);
            }
            return false;
        });
    }
    
    /**
     * Получает статистику загруженных/заблокированных ресурсов
     * @returns {Object} - Статистика
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * Логирует информацию, если включено логирование
     * @param {...any} args - Аргументы для логирования
     * @private
     */
    _log(...args) {
        if (this.options.logResources && this.options.logger) {
            this.options.logger(...args);
        }
    }
    
    /**
     * Логирует ошибки
     * @param {...any} args - Аргументы для логирования
     * @private
     */
    _logError(...args) {
        if (this.options.logger) {
            // Используем console.error или logger.error в зависимости от типа logger
            if (this.options.logger === console.log) {
                console.error(...args);
            } else {
                this.options.logger(...args);
            }
        }
    }
}

export default SelectiveResourceLoader; 