/**
 * SimpleHtmlParser
 * 
 * Легкий и быстрый парсер HTML для извлечения данных с сайта MQL5.
 * Использует Cheerio без JSDOM для эффективного парсинга статического содержимого.
 */

import * as cheerio from 'cheerio';
import { createLogger, LogLevel } from '../utils/Logger.js';

/**
 * @class SimpleHtmlParser
 */
export class SimpleHtmlParser {
    /**
     * Создает экземпляр парсера
     * @param {Object} config - Конфигурация
     */
    constructor(config = {}) {
        // Инициализируем логгер
        this.logger = createLogger({
            prefix: config.logger?.prefix || 'SimpleHtmlParser',
            level: config.logger?.level !== undefined ? config.logger.level : LogLevel.INFO,
            transport: config.logger?.transport,
            timestamp: config.logger?.timestamp !== undefined ? config.logger.timestamp : true,
            colorize: config.logger?.colorize !== undefined ? config.logger.colorize : true
        });
        
        // Селекторы для извлечения данных
        this.selectors = {
            generalInfo: {
                signalName: '.signal-header-name',
                author: '.signal-header-author',
                reliability: '.reliability-container',
                infoItems: '.signal-info-item',
                price: '.price',
                subscribers: '.subscribers',
                growth: '.growth',
                drawdown: '.drawdown',
                age: '.age',
                description: '.description'
            },
            statistics: {
                dataColumns: '.stat-item'
            },
            tradeHistory: {
                table: '.trading-result-table',
                rows: '.trading-result-table tbody tr:not(.summary)'
            },
            distribution: {
                rows: '.signals-chart-dist tbody tr'
            },
            authorSignals: {
                items: '.s-other-signal'
            }
        };
        
        this.logger.info('SimpleHtmlParser initialized');
    }
    
    /**
     * Парсит HTML-страницу сигнала
     * @param {string} html - HTML-страница
     * @param {string} url - URL страницы
     * @returns {Object} - Структурированные данные
     */
    parseSignal(html, url) {
        this.logger.info(`Начало парсинга ${url}`);
        
        if (!html) {
            throw new Error('Empty HTML provided for parsing');
        }
        
        const startTime = Date.now();
        
        try {
            // Загружаем HTML в Cheerio
            const $ = cheerio.load(html);
            this.logger.debug('HTML загружен в Cheerio');
            
            // Проверяем наличие ключевых элементов
            const signalNameElement = $(this.selectors.generalInfo.signalName);
            if (signalNameElement.length === 0) {
                this.logger.warn(`Не найден элемент с селектором ${this.selectors.generalInfo.signalName}`);
            }
            
            const authorElement = $(this.selectors.generalInfo.author);
            if (authorElement.length === 0) {
                this.logger.warn(`Не найден элемент с селектором ${this.selectors.generalInfo.author}`);
            }
            
            // Парсим общую информацию
            const generalInfo = this._parseGeneralInfo($);
            this.logger.debug(`Получена основная информация: ${JSON.stringify(generalInfo)}`);
            
            // Парсим статистику
            const statistics = this._parseStatistics($);
            
            // Парсим историю торговли
            const tradeHistory = this._parseTradeHistory($);
            
            // Парсим распределение
            const distribution = this._parseDistribution($);
            
            // Парсим сигналы автора
            const authorSignals = this._parseAuthorSignals($);
            
            // Формируем метаданные о парсинге
            const meta = {
                parsedAt: new Date().toISOString(),
                processingTime: Date.now() - startTime,
                parser: 'SimpleHtmlParser', 
                mode: 'fast',
                url,
                originalSize: html.length,
                processedSize: html.length
            };
            
            // Формируем дополнительную информацию о брокере и серверах
            const brokerInfo = generalInfo.broker || '';
            const tradingServers = generalInfo.tradingServers || '';
            const tags = this._extractTags($);
            
            // Формируем итоговые данные
            const data = {
                generalInfo,
                statistics,
                tradeHistory,
                distribution,
                authorSignals,
                charts: {
                    available: this._checkChartsAvailability($)
                },
                broker: brokerInfo,
                tradingServers,
                tags,
                meta
            };
            
            this.logger.info(`Парсинг завершен за ${meta.processingTime}ms`);
            return data;
        } catch (error) {
            this.logger.error(`Ошибка при парсинге сигнала: ${error.message}`);
            this.logger.debug(`Стек ошибки: ${error.stack}`);
            throw new Error(`Failed to parse signal data: ${error.message}`);
        }
    }
    
    /**
     * Парсит общую информацию о сигнале
     * @param {CheerioStatic} $ - Экземпляр Cheerio
     * @returns {Object} - Общая информация о сигнале
     * @private
     */
    _parseGeneralInfo($) {
        this.logger.debug('Parsing general information');
        const info = {
            signalName: '',
            author: '',
            price: '',
            subscribers: '',
            growth: '',
            maxDrawdown: '',
            age: '',
            description: ''
        };
        
        try {
            // Получаем название сигнала и автора
            info.signalName = $(this.selectors.generalInfo.signalName).text().trim();
            info.author = $(this.selectors.generalInfo.author).text().trim();
            
            // Получаем основные показатели
            info.price = $(this.selectors.generalInfo.price).text().trim();
            info.subscribers = $(this.selectors.generalInfo.subscribers).text().trim();
            info.growth = $(this.selectors.generalInfo.growth).text().trim();
            info.maxDrawdown = $(this.selectors.generalInfo.drawdown).text().trim();
            info.age = $(this.selectors.generalInfo.age).text().trim();
            info.description = $(this.selectors.generalInfo.description).text().trim();
            
            // Получаем дополнительные элементы информации
            $(this.selectors.generalInfo.infoItems).each((_, element) => {
                const label = $(element).find('.label').text().trim();
                const value = $(element).find('.value').text().trim();
                
                if (label && value) {
                    // Преобразуем метку в camelCase для использования в качестве ключа
                    const key = this._labelToCamelCase(label);
                    info[key] = value;
                }
            });
            
            this.logger.debug(`General info parsed: Signal name=${info.signalName}, Author=${info.author}`);
        } catch (error) {
            this.logger.error(`Error parsing general info: ${error.message}`);
        }
        
        return info;
    }
    
    /**
     * Парсит статистику сигнала
     * @param {CheerioStatic} $ - Экземпляр Cheerio
     * @returns {Object} - Статистика сигнала
     * @private
     */
    _parseStatistics($) {
        this.logger.debug('Parsing statistics');
        const stats = {};
        
        try {
            $(this.selectors.statistics.dataColumns).each((_, element) => {
                const label = $(element).find('.name').text().trim();
                const value = $(element).find('.value').text().trim();
                
                if (label && value) {
                    // Преобразуем метку в camelCase для использования в качестве ключа
                    const key = this._labelToCamelCase(label);
                    stats[key] = value;
                    this.logger.debug(`Parsed stat: ${label} = ${value}`);
                }
            });
            
            this.logger.debug(`Parsed ${Object.keys(stats).length} statistics items`);
        } catch (error) {
            this.logger.error(`Error parsing statistics: ${error.message}`);
        }
        
        return stats;
    }
    
    /**
     * Парсит историю торговли
     * @param {CheerioStatic} $ - Экземпляр Cheerio
     * @returns {Array} - История торговли
     * @private
     */
    _parseTradeHistory($) {
        this.logger.debug('Парсинг истории торговли');
        const trades = [];
        
        try {
            // Проверяем наличие таблицы
            const table = $(this.selectors.tradeHistory.table);
            if (table.length === 0) {
                this.logger.warn(`Таблица истории торговли не найдена (селектор: ${this.selectors.tradeHistory.table})`);
                return trades;
            }
            
            // Получаем заголовки таблицы
            const headers = [];
            table.find('thead th').each((index, th) => {
                headers.push($(th).text().trim().toLowerCase());
            });
            
            if (headers.length === 0) {
                this.logger.warn('Не найдены заголовки в таблице истории торговли');
                return trades;
            }
            
            this.logger.debug(`Найдены заголовки таблицы: ${headers.join(', ')}`);
            
            // Парсим строки таблицы
            $(this.selectors.tradeHistory.rows).each((_, row) => {
                const trade = {};
                
                $(row).find('td').each((index, cell) => {
                    if (index < headers.length) {
                        const header = this._labelToCamelCase(headers[index]);
                        trade[header] = $(cell).text().trim();
                    }
                });
                
                if (Object.keys(trade).length > 0) {
                    trades.push(trade);
                }
            });
            
            this.logger.debug(`Распарсено ${trades.length} записей истории торговли`);
        } catch (error) {
            this.logger.error(`Ошибка при парсинге истории торговли: ${error.message}`);
        }
        
        return trades;
    }
    
    /**
     * Парсит распределение сигнала
     * @param {CheerioStatic} $ - Экземпляр Cheerio
     * @returns {Array} - Распределение сигнала
     * @private
     */
    _parseDistribution($) {
        this.logger.debug('Парсинг распределения');
        const distribution = [];
        
        try {
            // Проверяем наличие таблицы
            const table = $(this.selectors.distribution.rows).closest('table');
            if (table.length === 0) {
                this.logger.warn('Таблица распределения не найдена');
                return distribution;
            }
            
            // Получаем заголовки таблицы
            const headers = [];
            table.find('thead th').each((index, th) => {
                headers.push($(th).text().trim().toLowerCase());
            });
            
            // Парсим строки таблицы
            $(this.selectors.distribution.rows).each((_, row) => {
                const item = {};
                
                $(row).find('td').each((index, cell) => {
                    if (index < headers.length) {
                        const header = this._labelToCamelCase(headers[index]);
                        item[header] = $(cell).text().trim();
                        
                        // Если ячейка содержит процентную полосу, извлекаем значение
                        if ($(cell).find('.bar div').length > 0) {
                            const style = $(cell).find('.bar div').attr('style') || '';
                            const percentMatch = style.match(/width:\s*([\d.]+)%/);
                            if (percentMatch && percentMatch[1]) {
                                item.percentage = percentMatch[1];
                            }
                        }
                    }
                });
                
                if (Object.keys(item).length > 0) {
                    distribution.push(item);
                }
            });
            
            this.logger.debug(`Распарсено ${distribution.length} элементов распределения`);
        } catch (error) {
            this.logger.error(`Ошибка при парсинге распределения: ${error.message}`);
        }
        
        return distribution;
    }
    
    /**
     * Парсит другие сигналы автора
     * @param {CheerioStatic} $ - Экземпляр Cheerio
     * @returns {Array} - Другие сигналы автора
     * @private
     */
    _parseAuthorSignals($) {
        this.logger.debug('Парсинг сигналов автора');
        const signals = [];
        
        try {
            // На новой версии сайта MQL5 сигналы автора отображаются в элементах с классом .other-author-signal или .author-signal
            $('.other-author-signal, .author-signal, .s-other-signal').each((_, element) => {
                const name = $(element).find('.name, .s-other-signal__name').text().trim();
                const url = $(element).attr('href') || '';
                
                if (name && url) {
                    signals.push({
                        name,
                        url: url.startsWith('http') ? url : `https://www.mql5.com${url}`
                    });
                }
            });
            
            this.logger.debug(`Найдено ${signals.length} других сигналов автора`);
        } catch (error) {
            this.logger.error(`Ошибка при парсинге сигналов автора: ${error.message}`);
        }
        
        return signals;
    }
    
    /**
     * Проверяет наличие графиков на странице
     * @param {CheerioStatic} $ - Экземпляр Cheerio
     * @returns {Object} - Информация о доступных графиках
     * @private
     */
    _checkChartsAvailability($) {
        this.logger.debug('Проверка доступности графиков');
        
        try {
            // Проверяем различные типы графиков
            const growthChart = $('#growth_chart, .growth-chart').length > 0;
            const balanceChart = $('#balance_chart, .balance-chart').length > 0;
            const svgCharts = $('.svg-chart, .chart-container svg').length;
            const miniCharts = $('.mini-chart').length;
            
            // Проверяем наличие контейнеров для графиков
            const chartContainers = $('.chart-container').length;
            
            this.logger.debug(`Доступность графиков: рост=${growthChart}, баланс=${balanceChart}, svg=${svgCharts}, мини=${miniCharts}, контейнеры=${chartContainers}`);
            
            return {
                growth: growthChart,
                balance: balanceChart,
                svg: svgCharts > 0,
                miniCharts: miniCharts > 0,
                count: svgCharts + miniCharts,
                containers: chartContainers
            };
        } catch (error) {
            this.logger.error(`Ошибка при проверке графиков: ${error.message}`);
            return {
                growth: false,
                balance: false,
                svg: false,
                miniCharts: false,
                count: 0,
                containers: 0
            };
        }
    }
    
    /**
     * Преобразует текстовую метку в camelCase
     * @param {string} label - Текстовая метка
     * @returns {string} - Метка в формате camelCase
     * @private
     */
    _labelToCamelCase(label) {
        // Удаляем двоеточие и пробелы в конце
        let cleaned = label.replace(/:\s*$/, '').trim();
        
        // Заменяем кириллические символы на латинские (базовая транслитерация)
        const transliteration = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
            'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
            'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
            'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
            'я': 'ya'
        };
        
        let transliterated = cleaned.toLowerCase().split('').map(char => {
            return transliteration[char] || char;
        }).join('');
        
        // Конвертируем в camelCase
        return transliterated
            .replace(/[^a-z0-9]/g, ' ') // Заменяем нелатинские символы на пробелы
            .split(' ')
            .filter(word => word.length > 0)
            .map((word, index) => {
                if (index === 0) {
                    return word;
                }
                return word[0].toUpperCase() + word.slice(1);
            })
            .join('');
    }
    
    /**
     * Извлекает теги сигнала
     * @param {CheerioStatic} $ - Экземпляр Cheerio
     * @returns {Array<string>} - Массив тегов
     * @private
     */
    _extractTags($) {
        this.logger.debug('Извлечение тегов');
        const tags = [];
        
        try {
            // На странице MQL5 теги отображаются в элементах с классом .tag
            $('.tag').each((_, element) => {
                const tag = $(element).text().trim();
                if (tag) {
                    tags.push(tag);
                }
            });
            
            this.logger.debug(`Извлечено ${tags.length} тегов`);
        } catch (error) {
            this.logger.error(`Ошибка при извлечении тегов: ${error.message}`);
        }
        
        return tags;
    }
}

export default SimpleHtmlParser; 