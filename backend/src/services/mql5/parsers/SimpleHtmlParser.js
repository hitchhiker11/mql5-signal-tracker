/**
 * SimpleHtmlParser - быстрый парсер HTML для режима "fast"
 * 
 * Использует cheerio для быстрого парсинга HTML без JavaScript.
 * Извлекает только базовую информацию из HTML-страницы сигнала MQL5.
 */

import * as cheerio from 'cheerio';

class SimpleHtmlParser {
    /**
     * Создает экземпляр SimpleHtmlParser
     * 
     * @param {Object} options - Настройки парсера
     * @param {Object} [options.selectors] - Селекторы для извлечения данных
     * @param {Object} [options.logger] - Объект логгера
     */
    constructor(options = {}) {
        // Настройки по умолчанию для селекторов
        this.defaultSelectors = {
            // Обновленные селекторы с учетом старого кода
            // Основная информация
            signalName: '.s-line-card__title',
            author: '.s-line-card__author',
            reliability: '.s-indicators__item_risk',
            listInfoItems: '.s-list-info__item',
            listInfoLabel: '.s-list-info__label',
            listInfoValue: '.s-list-info__value',
            
            // Статистика
            statsItems: '.s-data-columns__item',
            statsLabel: '.s-data-columns__label',
            statsValue: '.s-data-columns__value',
            
            // История торговли
            tradesTable: '#signalInfoTable tbody tr:not(.signalDataHidden):not(.summary)',
            
            // Распределение
            distributionRows: '.signals-chart-dist tbody tr',
            distributionSymbol: '.col-symbol',
            distributionValue: '.col-buy-sell',
            distributionBar: '.bar div',
            
            // Другие сигналы автора
            authorSignals: '#authorsSignals .s-other-signal',
            authorSignalName: '.s-other-signal__name',
            
            // Дополнительные селекторы для обратной совместимости
            price: '.col-price .price-value',
            subscribers: '.s-indicators__item-wrapper_subscribers span[title], .col-subscribers',
            growth: '.col-growth, .s-val--positive, .s-val--negative',
            maxDrawdown: '.col-drawdown',
            age: '.col-weeks',
            description: '.signal-page-desc',
            tags: '.tags .tag',
            broker: '.broker .item a span, .s-line-card__header a',
            tradingServers: '.text-list li[data-key="strategy"] span.value',
            
            // Графики
            profitChart: '#growth_chart',
            equityChart: '#equity_chart',
            balanceChart: '#balance_chart'
        };

        // Применяем пользовательские селекторы
        this.selectors = {
            ...this.defaultSelectors,
            ...(options.selectors || {})
        };

        // Инициализируем логгер
        this.logger = options.logger || {
            info: () => {},
            debug: () => {},
            warn: () => {},
            error: () => {}
        };

        this.logger.info('SimpleHtmlParser: Быстрый парсер HTML инициализирован');
    }

    /**
     * Извлекает текст из элемента, обрабатывая null и undefined
     * 
     * @param {Object} $element - Cheerio-элемент
     * @param {string} selector - Селектор для элемента
     * @returns {string} Извлеченный текст или пустая строка
     * @private
     */
    _extractText($, element, selector = null) {
        try {
            if (!element || element.length === 0) {
                return '';
            }
            
            // Если передан селектор, пытаемся найти подэлемент
            const targetElement = selector ? $(element).find(selector) : $(element);
            
            if (!targetElement || targetElement.length === 0) {
                return '';
            }
            
            // Получаем текст и обрабатываем его
            return $(targetElement).text().trim();
        } catch (error) {
            this.logger.error(`SimpleHtmlParser: Ошибка при извлечении текста: ${error.message}`);
            return '';
        }
    }

    /**
     * Парсит HTML-страницу и извлекает основную информацию о сигнале
     * 
     * @param {string} html - HTML-контент страницы сигнала
     * @param {string} url - URL сигнала
     * @param {Object} options - Дополнительные опции для парсинга
     * @returns {Object} Данные сигнала
     */
    async parse(html, url, options = {}) {
        this.logger.info(`SimpleHtmlParser: Начало парсинга ${url}`);
        const startTime = Date.now();
        
        try {
            // Загружаем HTML в cheerio
            const $ = cheerio.load(html, {
                decodeEntities: true,
                normalizeWhitespace: true
            });
            
            // Добавляем логирование размера HTML
            this.logger.debug(`SimpleHtmlParser: Размер HTML ${html.length} байт`);
            
            // Логируем наличие ключевых элементов для отладки
            this.logger.debug(`SimpleHtmlParser: Найдено заголовков сигнала: ${$(this.selectors.signalName).length}`);
            this.logger.debug(`SimpleHtmlParser: Найдено авторов сигнала: ${$(this.selectors.author).length}`);
            
            // Извлекаем основную информацию о сигнале (по аналогии со старым кодом)
            const generalInfo = this._parseGeneralInfo($);
            const statistics = this._parseStatistics($);
            const tradeHistory = this._parseTradeHistory($);
            const distribution = this._parseDistribution($);
            const authorSignals = this._parseAuthorSignals($);
            
            // Логируем извлеченные данные для отладки
            this.logger.debug('SimpleHtmlParser: Извлеченные данные (generalInfo):', JSON.stringify(generalInfo));
            
            // Формируем результат
            const result = {
                generalInfo,
                statistics,
                tradeHistory,
                distribution,
                authorSignals,
                meta: {
                    parsedAt: new Date().toISOString(),
                    processingTime: Date.now() - startTime,
                    parser: 'SimpleHtmlParser',
                    mode: 'fast',
                    url,
                    originalSize: html.length,
                    processedSize: html.length
                }
            };
            
            this.logger.info(`SimpleHtmlParser: Парсинг завершен за ${Date.now() - startTime}ms`);
            return result;
        } catch (error) {
            this.logger.error(`SimpleHtmlParser: Ошибка при парсинге: ${error.message}`);
            throw new Error(`Ошибка при быстром парсинге HTML: ${error.message}`);
        }
    }
    
    /**
     * Парсит общую информацию о сигнале (по аналогии со старым кодом)
     * @param {Object} $ - Cheerio-объект
     * @returns {Object} - Общая информация о сигнале
     * @private
     */
    _parseGeneralInfo($) {
        const info = {};
        
        // Извлекаем элементы списка информации
        $(this.selectors.listInfoItems).each((_, element) => {
            const label = this._extractText($, element, this.selectors.listInfoLabel);
            const value = this._extractText($, element, this.selectors.listInfoValue);
            if (label && value) {
                info[label] = value;
            }
        });

        // Добавляем основные данные
        info.signalName = this._extractText($, $(this.selectors.signalName));
        info.author = this._extractText($, $(this.selectors.author));
        info.reliability = this._extractText($, $(this.selectors.reliability));
        info.price = this._extractText($, $(this.selectors.price));
        info.subscribers = this._extractText($, $(this.selectors.subscribers));
        info.growth = this._extractText($, $(this.selectors.growth));
        info.maxDrawdown = this._extractText($, $(this.selectors.maxDrawdown));
        info.age = this._extractText($, $(this.selectors.age));
        info.description = this._extractText($, $(this.selectors.description));
        
        return info;
    }
    
    /**
     * Парсит статистику сигнала (по аналогии со старым кодом)
     * @param {Object} $ - Cheerio-объект
     * @returns {Object} - Статистика сигнала
     * @private
     */
    _parseStatistics($) {
        const stats = {};
        
        // Извлекаем статистику из колонок
        $(this.selectors.statsItems).each((_, element) => {
            const label = this._extractText($, element, this.selectors.statsLabel);
            const value = this._extractText($, element, this.selectors.statsValue);
            if (label && value) {
                stats[label] = value;
            }
        });
        
        return stats;
    }
    
    /**
     * Парсит историю торговли (по аналогии со старым кодом)
     * @param {Object} $ - Cheerio-объект
     * @returns {Array} - История торговли
     * @private
     */
    _parseTradeHistory($) {
        const trades = [];
        
        // Извлекаем данные из таблицы торговли
        $(this.selectors.tradesTable).each((_, row) => {
            const trade = {};
            $(row).find('td').each((index, cell) => {
                const value = $(cell).text().trim();
                switch(index) {
                    case 0: trade.symbol = value; break;
                    case 1: trade.time = value; break;
                    case 2: trade.type = value; break;
                    case 3: trade.volume = value; break;
                    case 4: trade.price = value; break;
                }
            });
            if (Object.keys(trade).length > 0) {
                trades.push(trade);
            }
        });
        
        return trades;
    }
    
    /**
     * Парсит распределение торговли (по аналогии со старым кодом)
     * @param {Object} $ - Cheerio-объект
     * @returns {Array} - Распределение торговли
     * @private
     */
    _parseDistribution($) {
        const distribution = [];
        
        // Извлекаем данные распределения
        $(this.selectors.distributionRows).each((_, row) => {
            const symbol = this._extractText($, row, this.selectors.distributionSymbol);
            const value = this._extractText($, row, this.selectors.distributionValue);
            let percentage = '0';
            
            // Пытаемся извлечь процент из стиля
            const barElement = $(row).find(this.selectors.distributionBar);
            if (barElement.length > 0) {
                const style = barElement.attr('style');
                if (style) {
                    const match = style.match(/width:\s*([\d.]+)%/);
                    if (match && match[1]) {
                        percentage = match[1];
                    }
                }
            }
            
            if (symbol) {
                distribution.push({
                    symbol,
                    value,
                    percentage
                });
            }
        });
        
        return distribution;
    }
    
    /**
     * Парсит другие сигналы автора (по аналогии со старым кодом)
     * @param {Object} $ - Cheerio-объект
     * @returns {Array} - Другие сигналы автора
     * @private
     */
    _parseAuthorSignals($) {
        const signals = [];
        
        // Извлекаем другие сигналы автора
        $(this.selectors.authorSignals).each((_, element) => {
            const name = this._extractText($, element, this.selectors.authorSignalName);
            const url = $(element).attr('href');
            if (name && url) {
                signals.push({
                    name,
                    url
                });
            }
        });
        
        return signals;
    }
}

export default SimpleHtmlParser; 