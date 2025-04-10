/**
 * Этот файл предоставляет для обратной совместимости класс MQL5Parser,
 * который переадресовывает все вызовы к новому MQL5Service.
 */

import MQL5Service from './services/mql5/index.js';

/**
 * @class MQL5Parser - обертка для обратной совместимости с новым MQL5Service
 */
export class MQL5Parser {
    constructor(options = {}) {
        console.log('MQL5Parser: Инициализация (обертка для обратной совместимости)');
        // Создаем экземпляр нового MQL5Service
        this.service = new MQL5Service(options);
    }

    /**
     * Метод для обратной совместимости, переадресовывает вызов к getSignalData
     * @param {string} url - URL сигнала
     * @returns {Promise<Object>} - Данные сигнала
     */
    async parseSignal(url) {
        console.log(`MQL5Parser: Вызов parseSignal для ${url} (перенаправлен на MQL5Service)`);
        return this.service.getSignalData(url);
    }

    /**
     * Метод для обратной совместимости
     * @param {string} url - URL для проверки
     * @returns {Promise<boolean>} - Валидность URL
     */
    async validateSignalUrl(url) {
        console.log(`MQL5Parser: Проверка URL ${url}`);
        // Проверка URL через регулярное выражение
        const urlPattern = /^https:\/\/www\.mql5\.com\/[a-z]{2}\/signals\/\d+$/;
        if (!urlPattern.test(url)) {
            console.error(`Invalid signal URL format: ${url}`);
            throw new Error('Invalid signal URL format');
        }
        console.log('Signal URL is valid');
        return true;
    }
}

// Экспортируем класс для обратной совместимости
export default MQL5Parser;