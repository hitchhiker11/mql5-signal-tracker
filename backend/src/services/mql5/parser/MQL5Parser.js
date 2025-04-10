/**
 * MQL5Parser
 * 
 * Основной класс для парсинга сигналов с сайта MQL5.
 * Использует JSDOM для рендеринга страницы и извлечения данных.
 */

import { JSDOM, VirtualConsole } from 'jsdom';
import axios from 'axios';
import { setTimeout } from 'timers/promises';
import * as cheerio from 'cheerio';

// Импортируем утилиты и компоненты
import { SelectiveResourceLoader } from '../resources/SelectiveResourceLoader.js';
import { HTMLCleaner } from '../utils/HTMLCleaner.js';
import { ChartExtractor } from '../utils/ChartExtractor.js';
import { createLogger, LogLevel } from '../utils/Logger.js';

/**
 * @class MQL5Parser
 */
export class MQL5Parser {
    /**
     * Создает экземпляр парсера
     * @param {Object} config - Конфигурация парсера
     */
    constructor(config = {}) {
        // Инициализируем логгер
        this.logger = createLogger({
            prefix: config.logger?.prefix || 'MQL5Parser',
            level: config.logger?.level !== undefined ? config.logger.level : LogLevel.INFO,
            transport: config.logger?.transport,
            timestamp: config.logger?.timestamp !== undefined ? config.logger.timestamp : true,
            colorize: config.logger?.colorize !== undefined ? config.logger.colorize : true
        });
        
        // Сохраняем конфигурацию
        this.config = config;
        
        // Инициализируем HTTP-клиент
        this.http = {
            baseUrl: config.http?.baseUrl || 'https://www.mql5.com',
            headers: config.http?.headers || {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br'
            },
            timeout: config.http?.timeout || 30000,
            maxRedirects: config.http?.maxRedirects || 5
        };
        
        // Инициализируем виртуальную консоль для JSDOM
        this.virtualConsole = new VirtualConsole();
        
        // Перенаправляем все основные методы консоли в наш логгер
        this.virtualConsole.on('error', (message, ...optionalParams) => this.logger.error('JSDOM Console Error:', message, ...optionalParams));
        this.virtualConsole.on('warn', (message, ...optionalParams) => this.logger.warn('JSDOM Console Warn:', message, ...optionalParams));
        this.virtualConsole.on('info', (message, ...optionalParams) => this.logger.info('JSDOM Console Info:', message, ...optionalParams));
        this.virtualConsole.on('log', (message, ...optionalParams) => this.logger.debug('JSDOM Console Log:', message, ...optionalParams));
        this.virtualConsole.on('debug', (message, ...optionalParams) => this.logger.debug('JSDOM Console Debug:', message, ...optionalParams));
        this.virtualConsole.on('dir', (obj, options) => this.logger.debug('JSDOM Console Dir:', obj, options));
        this.virtualConsole.on('assert', (assertion, message, ...optionalParams) => { 
            if (!assertion) {
                this.logger.error('JSDOM Console Assert Failed:', message, ...optionalParams);
            }
        });
        this.virtualConsole.on('count', (label) => this.logger.debug('JSDOM Console Count:', label));
        this.virtualConsole.on('countReset', (label) => this.logger.debug('JSDOM Console CountReset:', label));
        this.virtualConsole.on('table', (tabularData, properties) => this.logger.debug('JSDOM Console Table:', tabularData, properties));
        this.virtualConsole.on('time', (label) => this.logger.debug('JSDOM Console Time:', label));
        this.virtualConsole.on('timeEnd', (label) => this.logger.debug('JSDOM Console TimeEnd:', label));
        this.virtualConsole.on('timeLog', (label, ...data) => this.logger.debug('JSDOM Console TimeLog:', label, ...data));
        this.virtualConsole.on('trace', (message, ...optionalParams) => this.logger.debug('JSDOM Console Trace:', message, ...optionalParams));
        this.virtualConsole.on('clear', () => this.logger.debug('JSDOM Console Clear called'));
        this.virtualConsole.on('group', (...label) => this.logger.debug('JSDOM Console Group:', ...label));
        this.virtualConsole.on('groupCollapsed', (...label) => this.logger.debug('JSDOM Console GroupCollapsed:', ...label));
        this.virtualConsole.on('groupEnd', () => this.logger.debug('JSDOM Console GroupEnd'));

        // Отдельно слушаем событие jsdomError для перехвата внутренних ошибок JSDOM
        this.virtualConsole.on("jsdomError", e => { 
            this.logger.error("JSDOM Internal Error:", e.message, e.detail, e.stack);
        });
        
        // Инициализируем загрузчик ресурсов
        this.resourceLoader = new SelectiveResourceLoader({
            allowedScripts: config.resources?.allowedScripts || [
                /svg-chart.*\.js/,
                /signals.*\.js/,
                /vendor.*\.js/,
                /all.*\.js/
            ],
            allowedStyles: config.resources?.allowedStyles || [
                /svg-chart.*\.css/,
                /core.*\.css/,
                /signals.*\.css/,
                /all.*\.css/
            ],
            blockExternalResources: config.resources?.blockExternalResources !== undefined ? 
                config.resources.blockExternalResources : true,
            logResources: config.resources?.logResources !== undefined ? 
                config.resources.logResources : true,
            logger: (message) => this.logger.debug(message)
        });
        
        // Инициализируем очиститель HTML
        this.htmlCleaner = new HTMLCleaner({
            mode: config.htmlCleaning?.mode || 'extract',
            removeSelectors: config.htmlCleaning?.removeSelectors,
            keepSelectors: config.htmlCleaning?.keepSelectors,
            preserveScripts: config.htmlCleaning?.preserveScripts !== undefined ? 
                config.htmlCleaning.preserveScripts : true,
            preserveStyles: config.htmlCleaning?.preserveStyles !== undefined ? 
                config.htmlCleaning.preserveStyles : true,
            fallbackToClean: config.htmlCleaning?.fallbackToClean !== undefined ?
                config.htmlCleaning.fallbackToClean : true,
            logger: (message) => this.logger.debug(message),
            verbose: config.parsing?.verboseLogging !== undefined ? 
                config.parsing.verboseLogging : true
        });
        
        // Инициализируем экстрактор графиков
        this.chartExtractor = new ChartExtractor({
            logger: (message) => this.logger.debug(message),
            verbose: config.parsing?.verboseLogging || false
        });
        
        // Настройки JSDOM
        this.jsdomOptions = {
            runScripts: config.jsdom?.runScripts || 'dangerously',
            resources: this.resourceLoader,
            pretendToBeVisual: config.jsdom?.pretendToBeVisual !== undefined ? 
                config.jsdom.pretendToBeVisual : true,
            virtualConsole: this.virtualConsole,
            includeNodeLocations: config.jsdom?.includeNodeLocations !== undefined ? 
                config.jsdom.includeNodeLocations : true
        };
        
        // Настройки парсинга
        this.parsingOptions = {
            scriptWaitTimeout: config.parsing?.scriptWaitTimeout || 5000,
            deferredScriptWaitTimeout: config.parsing?.deferredScriptWaitTimeout || 2000,
            verboseLogging: config.parsing?.verboseLogging || false
        };
        
        this.logger.info('MQL5Parser initialized');
    }
    
    /**
     * Парсит сигнал по указанному URL
     * @param {string} url - URL сигнала для парсинга
     * @returns {Promise<Object>} - Данные сигнала
     */
    async parseSignal(url) {
        this.logger.info(`Starting to parse signal from URL: ${url}`);
        
        try {
            this.logger.debug('Validating signal URL...');
            // Валидируем URL
            await this.validateSignalUrl(url);
            this.logger.debug('Signal URL validation successful.');
            
            // Получаем HTML-страницу
            const html = await this._fetchPage(url);
            
            if (!html || html.trim() === '') {
                throw new Error('Empty HTML received from URL: ' + url);
            }
            
            // Используем метод process вместо clean
            let processedHtml;
            try {
                processedHtml = this.htmlCleaner.process(html);
                this.logger.debug(`HTML processed: original size ${html.length}, processed size ${processedHtml.length} bytes (${((html.length - processedHtml.length) / html.length * 100).toFixed(2)}% reduction)`);
            } catch (error) {
                this.logger.error(`Error processing HTML: ${error.message}`);
                // Если не удалось обработать HTML, используем оригинальный HTML
                this.logger.warn('Using original HTML due to processing error');
                processedHtml = html;
            }
            
            // Создаем JSDOM и рендерим страницу
            this.logger.debug('Attempting to render page with JSDOM...');
            const dom = await this._renderPage(processedHtml, url);
            this.logger.debug('JSDOM rendering process finished (or timed out).');
            
            // Создаем Cheerio для парсинга статичного контента
            const $ = cheerio.load(processedHtml);
            this.logger.debug('Cheerio instance created for parsing static content');
            
            // Парсим данные
            this.logger.info('Beginning data extraction from page');
            
            // Парсим общую информацию
            const generalInfo = this._parseGeneralInfo($, dom);
            
            // Парсим статистику
            const statistics = this._parseStatistics($, dom);
            
            // Парсим историю торговли
            const tradeHistory = this._parseTradeHistory($, dom);
            
            // Парсим распределение
            const distribution = this._parseDistribution($, dom);
            
            // Парсим сигналы автора
            const authorSignals = this._parseAuthorSignals($, dom);
            
            // Извлекаем данные графиков из JavaScript
            this.logger.debug('Attempting to extract JS chart data...');
            const jsChartData = this.chartExtractor.extractFromJS(dom);
            this.logger.debug('JS chart data extraction completed.');
            
            // Извлекаем данные из SVG-элементов
            const svgData = this.chartExtractor.extractFromSVG(dom);
            this.logger.debug('SVG chart data extraction completed.');
            
            // Формируем итоговые данные
            const data = {
                generalInfo,
                statistics,
                tradeHistory,
                distribution,
                authorSignals,
                charts: {
                    js: jsChartData,
                    svg: svgData
                },
                url,
                lastUpdate: new Date().toISOString()
            };
            
            // Освобождаем ресурсы JSDOM
            this.logger.debug('Cleaning up JSDOM resources');
            dom.window.close();
            
            this.logger.info('Signal parsing completed successfully');
            return data;
        } catch (error) {
            this.logger.error(`Error parsing signal: ${error.message}`);
            this.logger.error(`Stack trace: ${error.stack}`);
            
            throw new Error(`Failed to parse signal data: ${error.message}`);
        }
    }
    
    /**
     * Загружает HTML-страницу по указанному URL
     * @param {string} url - URL страницы
     * @returns {Promise<string>} - HTML-страницы
     * @private
     */
    async _fetchPage(url) {
        this.logger.debug('Making HTTP request to fetch the page content');
        
        try {
            const response = await axios.get(url, {
                headers: this.http.headers,
                timeout: this.http.timeout,
                maxRedirects: this.http.maxRedirects
            });
            
            this.logger.debug(`Page content fetched successfully, content length: ${response.data.length}`);
            return response.data;
        } catch (error) {
            this.logger.error(`HTTP request failed: ${error.message}`);
            throw new Error(`Failed to fetch page: ${error.message}`);
        }
    }
    
    /**
     * Рендерит страницу с помощью JSDOM и ждет загрузки скриптов
     * @param {string} html - HTML-страницы
     * @param {string} url - URL страницы (для разрешения относительных путей)
     * @returns {Promise<JSDOM>} - Экземпляр JSDOM с загруженной страницей
     * @private
     */
    async _renderPage(html, url) {
        this.logger.debug('Creating JSDOM instance with script execution enabled');
        let dom = null; // Объявляем dom здесь

        try {
            // Создаем JSDOM с настройками
            dom = new JSDOM(html, {
                ...this.jsdomOptions,
                url // Для разрешения относительных путей
            });

            // Добавляем MutationObserver для отслеживания добавления SVG-элементов
            this._setupMutationObserver(dom);

            // Определяем общий таймаут для рендеринга
            const totalTimeout = this.parsingOptions.scriptWaitTimeout || 10000; // 10 секунд по умолчанию
            this.logger.debug(`Setting total JSDOM rendering timeout to ${totalTimeout}ms`);

            // Ждем загрузки и выполнения скриптов с таймаутом
            this.logger.debug('Waiting for DOM content and scripts (with timeout)...');
            await Promise.race([
                (async () => {
                    await this._waitForContentLoaded(dom);
                    this.logger.debug('Initial DOM content loaded. Adding extra delay for SVG rendering...');
                    await setTimeout(this.parsingOptions.deferredScriptWaitTimeout || 2000); // Используем deferred таймаут для доп. задержки
                    this.logger.debug('Extra delay finished.');
                })(),
                setTimeout(totalTimeout).then(() => {
                    this.logger.warn(`JSDOM rendering timed out after ${totalTimeout}ms`);
                    throw new Error(`JSDOM rendering timed out after ${totalTimeout}ms`);
                })
            ]);
            this.logger.debug('Finished waiting for scripts (or timed out).');

            // Проверяем наличие контейнеров графиков и SVG-элементов
            this._logPageState(dom);

            return dom;
        } catch (error) {
            this.logger.error(`Error during JSDOM rendering: ${error.message}`);
            // Важно: Закрыть окно JSDOM, если оно было создано, даже при ошибке
            if (dom && dom.window) {
                this.logger.debug('Closing JSDOM window due to rendering error.');
                dom.window.close();
            }
            throw error; // Пробрасываем ошибку дальше
        }
    }
    
    /**
     * Настраивает MutationObserver для отслеживания изменений в DOM
     * @param {JSDOM} dom - Экземпляр JSDOM
     * @private
     */
    _setupMutationObserver(dom) {
        dom.window.document.addEventListener('DOMContentLoaded', () => {
            this.logger.debug('JSDOM DOM content loaded event fired');
            
            // Создаем MutationObserver
            const observer = new dom.window.MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeName === 'svg' || 
                                (node.querySelector && node.querySelector('svg'))) {
                                this.logger.debug('SVG element detected in DOM mutations');
                                
                                // Выводим информацию о добавленном SVG
                                if (node.nodeName === 'svg') {
                                    this.logger.debug('SVG element added:', {
                                        id: node.id,
                                        class: node.getAttribute('class'),
                                        width: node.getAttribute('width'),
                                        height: node.getAttribute('height')
                                    });
                                }
                            }
                        });
                    }
                }
            });
            
            // Начинаем наблюдение за изменениями в DOM
            observer.observe(dom.window.document.body, { 
                childList: true, 
                subtree: true,
                attributes: true,
                attributeFilter: ['d', 'points', 'viewBox']
            });
            
            this.logger.debug('MutationObserver installed to track SVG changes');
        });
    }
    
    /**
     * Ожидает загрузки DOM и выполнения скриптов
     * @param {JSDOM} dom - Экземпляр JSDOM
     * @returns {Promise<void>}
     * @private
     */
    async _waitForContentLoaded(dom) {
        this.logger.debug(`Starting to wait for JSDOM document readyState: ${dom.window.document.readyState}`);
        
        return new Promise((resolve, reject) => { // Добавляем reject
            const timeoutHandle = setTimeout(() => { // Таймаут на ожидание load
                reject(new Error('Timeout waiting for JSDOM window load event'));
            }, this.parsingOptions.scriptWaitTimeout || 10000); // Используем общий таймаут

            if (dom.window.document.readyState === 'complete') {
                this.logger.debug('Document already in complete state');
                clearTimeout(timeoutHandle);
                resolve();
            } else {
                this.logger.debug('Adding event listener for load event');
                const loadHandler = () => {
                    clearTimeout(timeoutHandle);
                    this.logger.debug('Window load event fired');
                    
                    // Проверяем наличие отложенных скриптов (это можно оставить без доп. таймаута здесь)
                    const checkDeferredScripts = () => {
                        const scripts = Array.from(dom.window.document.querySelectorAll('script[defer]'));
                        this.logger.debug(`Checking ${scripts.length} deferred scripts`);
                        
                        // Ищем скрипт графиков
                        const chartScripts = scripts.filter(script => 
                            script.src && (
                                script.src.includes('svg-chart') || 
                                script.src.includes('signals')
                            )
                        );
                        
                        if (chartScripts.length > 0) {
                            this.logger.debug(`Found ${chartScripts.length} chart-related deferred scripts`);
                            chartScripts.forEach((script, index) => {
                                this.logger.debug(`Chart script #${index}: ${script.src}`);
                            });
                        }
                        
                        // Завершаем ожидание после события load
                        resolve(); 
                    };
                    
                    checkDeferredScripts();
                };
                dom.window.addEventListener('load', loadHandler);

                // Обработчик ошибок загрузки ресурсов в JSDOM (дополнительно)
                dom.window.addEventListener('error', (event) => {
                     if (event.target.tagName === 'SCRIPT') {
                        this.logger.error(`Failed to load script: ${event.target.src}`);
                        // Можно решить, прерывать ли процесс при ошибке загрузки скрипта
                        // clearTimeout(timeoutHandle);
                        // reject(new Error(`Failed to load script: ${event.target.src}`));
                    }
                });
            }
        });
    }
    
    /**
     * Логирует текущее состояние страницы (контейнеры графиков, SVG-элементы)
     * @param {JSDOM} dom - Экземпляр JSDOM
     * @private
     */
    _logPageState(dom) {
        // Проверяем наличие контейнеров графиков
        const chartContainers = dom.window.document.querySelectorAll('.chart-container, .svg-chart');
        this.logger.debug(`Found ${chartContainers.length} chart containers`);
        
        // Проверяем наличие SVG-элементов
        const svgElements = dom.window.document.querySelectorAll('svg');
        this.logger.debug(`Found ${svgElements.length} SVG elements after script execution`);
        
        // Проверяем наличие скриптов графиков
        const scripts = dom.window.document.querySelectorAll('script');
        const chartScripts = Array.from(scripts).filter(script => 
            script.src && (
                script.src.includes('svg-chart') || 
                script.src.includes('signals')
            )
        );
        
        this.logger.debug(`Found ${chartScripts.length} loaded chart scripts`);
    }
    
    /**
     * Парсит общую информацию о сигнале
     * @param {CheerioStatic} $ - Экземпляр Cheerio
     * @param {JSDOM} dom - Экземпляр JSDOM
     * @returns {Object} - Общая информация о сигнале
     * @private
     */
    _parseGeneralInfo($, dom) {
        this.logger.debug('Parsing general information');
        const info = {};
        
        $('.s-list-info__item').each((_, element) => {
            const label = $(element).find('.s-list-info__label').text().trim();
            const value = $(element).find('.s-list-info__value').text().trim();
            info[label] = value;
            this.logger.debug(`General info: ${label} = ${value}`);
        });
        
        info.signalName = $('.s-line-card__title').text().trim();
        info.author = $('.s-line-card__author').text().trim();
        info.reliability = $('.s-indicators__item_risk').text().trim();
        
        this.logger.debug(`Signal name: ${info.signalName}`);
        this.logger.debug(`Author: ${info.author}`);
        this.logger.debug(`Reliability: ${info.reliability}`);
        
        return info;
    }
    
    /**
     * Парсит статистику сигнала
     * @param {CheerioStatic} $ - Экземпляр Cheerio
     * @param {JSDOM} dom - Экземпляр JSDOM
     * @returns {Object} - Статистика сигнала
     * @private
     */
    _parseStatistics($, dom) {
        this.logger.debug('Parsing statistics');
        const stats = {};
        
        $('.s-data-columns__item').each((_, element) => {
            const label = $(element).find('.s-data-columns__label').text().trim();
            const value = $(element).find('.s-data-columns__value').text().trim();
            stats[label] = value;
            this.logger.debug(`Statistic: ${label} = ${value}`);
        });
        
        return stats;
    }
    
    /**
     * Парсит историю торговли
     * @param {CheerioStatic} $ - Экземпляр Cheerio
     * @param {JSDOM} dom - Экземпляр JSDOM
     * @returns {Array} - История торговли
     * @private
     */
    _parseTradeHistory($, dom) {
        this.logger.debug('Parsing trade history');
        const trades = [];
        
        $('#signalInfoTable tbody tr:not(.signalDataHidden):not(.summary)').each((_, row) => {
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
            trades.push(trade);
            this.logger.debug(`Trade: ${JSON.stringify(trade)}`);
        });
        
        this.logger.debug(`Total trades parsed: ${trades.length}`);
        return trades;
    }
    
    /**
     * Парсит распределение сигнала
     * @param {CheerioStatic} $ - Экземпляр Cheerio
     * @param {JSDOM} dom - Экземпляр JSDOM
     * @returns {Array} - Распределение сигнала
     * @private
     */
    _parseDistribution($, dom) {
        this.logger.debug('Parsing distribution');
        const distribution = [];
        
        $('.signals-chart-dist tbody tr').each((_, row) => {
            const item = {
                symbol: $(row).find('.col-symbol').text().trim(),
                value: $(row).find('.col-buy-sell').text().trim(),
                percentage: $(row).find('.bar div').attr('style')?.match(/width:\s*([\d.]+)%/)?.[1] || '0'
            };
            distribution.push(item);
            this.logger.debug(`Distribution item: ${JSON.stringify(item)}`);
        });
        
        this.logger.debug(`Total distribution items parsed: ${distribution.length}`);
        return distribution;
    }
    
    /**
     * Парсит другие сигналы автора
     * @param {CheerioStatic} $ - Экземпляр Cheerio
     * @param {JSDOM} dom - Экземпляр JSDOM
     * @returns {Array} - Другие сигналы автора
     * @private
     */
    _parseAuthorSignals($, dom) {
        this.logger.debug('Parsing author signals');
        const signals = [];
        
        $('#authorsSignals .s-other-signal').each((_, element) => {
            const signal = {
                name: $(element).find('.s-other-signal__name').text().trim(),
                url: $(element).attr('href')
            };
            signals.push(signal);
            this.logger.debug(`Author signal: ${JSON.stringify(signal)}`);
        });
        
        this.logger.debug(`Total author signals parsed: ${signals.length}`);
        return signals;
    }
    
    /**
     * Валидирует URL сигнала
     * @param {string} url - URL для валидации
     * @returns {Promise<boolean>} - true, если URL валиден
     * @throws {Error} - если URL невалиден
     */
    async validateSignalUrl(url) {
        this.logger.debug(`Validating signal URL: ${url}`);
        
        // Проверяем формат URL
        const urlPattern = /^https:\/\/www\.mql5\.com\/[a-z]{2}\/signals\/\d+$/;
        if (!urlPattern.test(url)) {
            this.logger.error(`Invalid signal URL format: ${url}`);
            throw new Error('Invalid signal URL format');
        }
        
        this.logger.debug('Signal URL is valid');
        return true;
    }
}

export default MQL5Parser; 