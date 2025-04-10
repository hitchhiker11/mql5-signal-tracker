/**
 * Logger
 * 
 * Класс для логирования в сервисе парсинга MQL5.
 * Обеспечивает единый формат логирования и возможность фильтрации уровней логов.
 */

/**
 * Уровни логирования
 * @enum {number}
 */
export const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    SILENT: 4 // Отключает все логи
};

/**
 * @class Logger
 */
export class Logger {
    /**
     * Создает экземпляр логгера
     * @param {Object} options - Настройки логгера
     * @param {string} [options.prefix='MQL5Parser'] - Префикс для всех логов
     * @param {LogLevel} [options.level=LogLevel.INFO] - Минимальный уровень логирования
     * @param {Function} [options.transport=console.log] - Функция для транспорта логов
     * @param {boolean} [options.timestamp=true] - Добавлять ли временную метку
     * @param {boolean} [options.colorize=true] - Использовать ли цветное логирование в консоли
     */
    constructor(options = {}) {
        this.options = {
            prefix: options.prefix || 'MQL5Parser',
            level: options.level !== undefined ? options.level : LogLevel.INFO,
            transport: options.transport || console.log,
            timestamp: options.timestamp !== undefined ? options.timestamp : true,
            colorize: options.colorize !== undefined ? options.colorize : true
        };
        
        // Создаем транспорты для разных уровней логирования
        this.transports = {
            [LogLevel.DEBUG]: options.transport || console.log,
            [LogLevel.INFO]: options.transport || console.log,
            [LogLevel.WARN]: options.transport || console.warn || console.log,
            [LogLevel.ERROR]: options.transport || console.error || console.log
        };
        
        // Цвета для разных уровней логирования (ANSI escape sequences)
        this.colors = {
            [LogLevel.DEBUG]: '\x1b[36m', // Cyan
            [LogLevel.INFO]: '\x1b[32m',  // Green
            [LogLevel.WARN]: '\x1b[33m',  // Yellow
            [LogLevel.ERROR]: '\x1b[31m', // Red
            reset: '\x1b[0m'              // Reset
        };
    }
    
    /**
     * Логирует сообщение с уровнем DEBUG
     * @param {...any} args - Аргументы для логирования
     */
    debug(...args) {
        this._log(LogLevel.DEBUG, ...args);
    }
    
    /**
     * Логирует сообщение с уровнем INFO
     * @param {...any} args - Аргументы для логирования
     */
    info(...args) {
        this._log(LogLevel.INFO, ...args);
    }
    
    /**
     * Логирует сообщение с уровнем WARN
     * @param {...any} args - Аргументы для логирования
     */
    warn(...args) {
        this._log(LogLevel.WARN, ...args);
    }
    
    /**
     * Логирует сообщение с уровнем ERROR
     * @param {...any} args - Аргументы для логирования
     */
    error(...args) {
        this._log(LogLevel.ERROR, ...args);
    }
    
    /**
     * Устанавливает уровень логирования
     * @param {LogLevel} level - Новый уровень логирования
     */
    setLevel(level) {
        this.options.level = level;
    }
    
    /**
     * Включает/отключает временные метки
     * @param {boolean} enable - Включить или отключить
     */
    setTimestamp(enable) {
        this.options.timestamp = enable;
    }
    
    /**
     * Включает/отключает цветное логирование
     * @param {boolean} enable - Включить или отключить
     */
    setColorize(enable) {
        this.options.colorize = enable;
    }
    
    /**
     * Внутренний метод для логирования
     * @param {LogLevel} level - Уровень логирования
     * @param {...any} args - Аргументы для логирования
     * @private
     */
    _log(level, ...args) {
        // Пропускаем, если уровень логирования ниже установленного
        if (level < this.options.level) {
            return;
        }
        
        // Формируем префикс сообщения
        let prefix = this.options.prefix;
        
        // Добавляем временную метку, если требуется
        if (this.options.timestamp) {
            const now = new Date();
            const timeStr = now.toISOString();
            prefix = `[${timeStr}] ${prefix}`;
        }
        
        // Добавляем уровень логирования
        const levelName = Object.keys(LogLevel).find(key => LogLevel[key] === level) || 'UNKNOWN';
        prefix = `${prefix} [${levelName}]`;
        
        // Добавляем цвет, если требуется
        if (this.options.colorize && this.transports[level] === console.log) {
            prefix = `${this.colors[level]}${prefix}${this.colors.reset}`;
        }
        
        // Логируем сообщение через соответствующий транспорт
        const transport = this.transports[level];
        transport(`${prefix}:`, ...args);
    }
}

/**
 * Создает настроенный экземпляр логгера
 * @param {Object} options - Настройки логгера
 * @returns {Logger} - Экземпляр логгера
 */
export function createLogger(options = {}) {
    return new Logger(options);
}

export default createLogger; 