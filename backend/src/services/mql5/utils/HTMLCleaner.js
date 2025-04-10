/**
 * HTMLCleaner
 * 
 * Утилита для обработки HTML-документа - можно очищать от ненужных 
 * элементов или извлекать только нужные компоненты.
 */

import * as cheerio from 'cheerio';

export class HTMLCleaner {
    /**
     * Создает экземпляр HTMLCleaner
     * @param {Object} options - Настройки
     * @param {Array<string>} [options.removeSelectors=[]] - CSS-селекторы элементов для удаления
     * @param {Array<string>} [options.keepSelectors=[]] - CSS-селекторы элементов для сохранения
     * @param {String} [options.mode='extract'] - Режим обработки: 'clean' или 'extract'
     * @param {Boolean} [options.preserveScripts=true] - Сохранять ли скрипты, связанные с графиками
     * @param {Boolean} [options.preserveStyles=true] - Сохранять ли стили, связанные с графиками
     * @param {Boolean} [options.fallbackToClean=true] - Автоматически переключаться на режим 'clean' при ошибке
     * @param {Function} [options.logger=console.log] - Функция для логирования
     * @param {boolean} [options.verbose=true] - Подробное логирование
     */
    constructor(options = {}) {
        this.options = {
            // Селекторы для удаления (используются в режиме clean)
            removeSelectors: options.removeSelectors || [
                'iframe', 
                '.footer', 
                '.advertising',
                '.header-panel',
                '#popup-notification-container',
                '#popup-notification-container-lg',
                '.global-message',
                'script:not([src*="signals"]):not([src*="svg-chart"]):not([src*="vendor"]):not([src*="all"])'
            ],
            
            // Селекторы для сохранения (используются в режиме extract)
            keepSelectors: options.keepSelectors || [
                // Контейнеры с графиками
                '.chart-container', 
                '#growth_chart',
                '#balance_chart',
                '.svg-chart',
                
                // Данные сигнала
                '#signalInfoTable', 
                '.s-line-card', 
                '.s-list-info',
                '.s-data-columns',
                '.signals-chart-dist',
                '.s-other-signal',
                
                // Скрипты и стили для графиков
                'script[src*="signals"]',
                'script[src*="svg-chart"]',
                'script[src*="vendor"]',
                'script[src*="all"]',
                'link[href*="signals"]',
                'link[href*="svg-chart"]',
                'link[href*="core"]'
            ],
            
            // Режим обработки: 'clean' (удаление ненужного) или 'extract' (извлечение нужного)
            mode: options.mode || 'extract',
            
            // Дополнительные опции
            preserveScripts: options.preserveScripts !== undefined ? options.preserveScripts : true,
            preserveStyles: options.preserveStyles !== undefined ? options.preserveStyles : true,
            fallbackToClean: options.fallbackToClean !== undefined ? options.fallbackToClean : true,
            logger: options.logger || console.log,
            verbose: options.verbose !== undefined ? options.verbose : true
        };
    }
    
    /**
     * Обрабатывает HTML в выбранном режиме
     * @param {string} html - Исходный HTML
     * @returns {string} - Обработанный HTML
     */
    process(html) {
        if (!html) {
            this._log('No HTML to process');
            return html;
        }
        
        try {
            // Выбираем режим обработки
            if (this.options.mode === 'extract') {
                try {
                    // Пробуем режим extract
                    this._log('Attempting to process HTML in extract mode');
                    return this._extractEssentialContent(html);
                } catch (error) {
                    // Если включен автоматический переход на режим clean при ошибке
                    if (this.options.fallbackToClean) {
                        this._log(`Error in extract mode: ${error.message}. Falling back to clean mode`);
                        return this._clean(html);
                    } else {
                        // Если автоматический переход выключен, пробрасываем ошибку дальше
                        throw error;
                    }
                }
            } else {
                return this._clean(html);
            }
        } catch (error) {
            this._log(`Error processing HTML: ${error.message}`, 'error');
            // Если все методы обработки не работают, возвращаем исходный HTML
            this._log('Returning original HTML due to processing errors');
            return html;
        }
    }
    
    /**
     * Очищает HTML-документ от ненужных элементов (режим "clean")
     * @param {string} html - Исходный HTML
     * @returns {string} - Очищенный HTML
     * @private
     */
    _clean(html) {
        this._log('Cleaning HTML (remove mode)...');
        
        // Загружаем HTML в Cheerio для манипуляций
        const $ = cheerio.load(html);
        
        // Статистика для отслеживания изменений
        const stats = {
            originalSize: html.length,
            removedElements: 0
        };
        
        // Удаляем все элементы, соответствующие заданным селекторам
        this.options.removeSelectors.forEach(selector => {
            try {
                const elements = $(selector);
                if (elements && elements.length > 0) {
                    elements.remove();
                    stats.removedElements += elements.length;
                    this._log(`Removed ${elements.length} elements matching selector: ${selector}`);
                }
            } catch (error) {
                this._log(`Error removing selector ${selector}: ${error.message}`, 'warn');
            }
        });
        
        // Получаем очищенный HTML
        const cleanedHtml = $.html();
        stats.cleanedSize = cleanedHtml.length;
        stats.reduction = html.length - cleanedHtml.length;
        stats.reductionPercent = ((stats.reduction / stats.originalSize) * 100).toFixed(2);
        
        this._log(`HTML cleaning complete. Removed ${stats.removedElements} elements, reduced size by ${stats.reductionPercent}% (${stats.reduction} bytes)`);
        
        return cleanedHtml;
    }
    
    /**
     * Извлекает только необходимые элементы из HTML
     * @param {string} html - Исходный HTML
     * @returns {string} HTML с извлеченными элементами
     * @private
     */
    _extractEssentialContent(html) {
        // Замеряем время
        const startTime = performance.now();
        
        try {
            // Загружаем HTML в cheerio
            const $ = cheerio.load(html, {
                decodeEntities: false,
                normalizeWhitespace: false,
                xml: {
                    normalizeWhitespace: false
                },
                withDomLvl1: true
            });
            
            // Создаем новый документ
            const newDoc = cheerio.load('<!DOCTYPE html><html><head></head><body></body></html>', {
                decodeEntities: false,
                normalizeWhitespace: false
            });
            
            // Проверяем, установлен ли режим сохранения скриптов
            const preserveScripts = this.options.preserveScripts !== false;
            
            // Массивы для разных типов скриптов в порядке приоритета и по локации
            // Скрипты из <head>
            const headScripts = {
                mqGlobal: [],  // Скрипт инициализации mqGlobal
                finteza: [],   // Скрипт инициализации fz (Finteza)
                core: [],      // Основные библиотеки в head
                other: []      // Другие скрипты из head
            };
            
            // Скрипты из <body>
            const bodyScripts = {
                core: [],         // Основные библиотеки (vendor.js, all.js)
                inlineData: [],   // Большой инлайн-скрипт с данными графиков
                charts: [],       // Скрипты для графиков (signals.js, svg-chart.js)
                other: []         // Другие скрипты
            };
            
            // Копируем базовые метаданные и необходимые элементы head
            newDoc('head').append($('head meta[charset]').clone());
            newDoc('head').append($('head title').clone());
            newDoc('head').append($('head meta[name="viewport"]').clone());
            
            // Сохраняем все селекторы, которые нам нужны
            if (this.options.keepSelectors && this.options.keepSelectors.length > 0) {
                let totalExtracted = 0;
                
                for (const selector of this.options.keepSelectors) {
                    try {
                        const elements = $(selector);
                        const count = elements.length;
                        
                        if (count > 0) {
                            elements.each((i, el) => {
                                // Клонируем элемент
                                const clonedElement = $(el).clone();
                                
                                // Проверяем тип элемента
                                const tagName = el.tagName ? el.tagName.toLowerCase() : '';
                                
                                // Скрипты обрабатываем отдельно, если они должны быть сохранены
                                if (tagName === 'script' && preserveScripts) {
                                    // Пропускаем скрипты здесь, будем работать с ними ниже
                                    return;
                                }
                                
                                // Для других элементов - добавляем в body
                                newDoc('body').append(clonedElement);
                            });
                            
                            totalExtracted += count;
                            this._log(`Извлечено ${count} элементов по селектору '${selector}'`, 'debug');
                        } else {
                            this._log(`Не найдено элементов по селектору '${selector}'`, 'debug');
                        }
                    } catch (error) {
                        this._log(`Ошибка при извлечении селектора '${selector}': ${error.message}`, 'error');
                    }
                }
                
                this._log(`Всего извлечено ${totalExtracted} элементов по селекторам`, 'info');
            }
            
            // Находим и сортируем скрипты, сохраняя их оригинальную локацию
            if (preserveScripts) {
                this._log('Сохраняем скрипты', 'debug');
                
                // Для хранения скриптов, которые уже были обработаны
                const processedScripts = new Set();
                
                // Функция для категоризации скрипта и добавления в соответствующий массив
                const categorizeScript = (script, isInHead) => {
                    const $script = $(script);
                    const scriptContent = $script.html();
                    const scriptSrc = $script.attr('src');
                    
                    // Пропускаем пустые скрипты
                    if (!scriptContent && !scriptSrc) {
                        return false;
                    }
                    
                    // Определяем категорию скрипта
                    
                    // 1. Скрипт инициализации mqGlobal
                    if (scriptContent && scriptContent.includes('mqGlobal.AddOnReady') && 
                        scriptContent.includes('Mql5Cookie.init')) {
                        const target = isInHead ? headScripts.mqGlobal : bodyScripts.other;
                        target.push($script.clone());
                        this._log(`[Script Check] Found the mqGlobal initialization script in ${isInHead ? 'head' : 'body'}`, 'info');
                        return true;
                    }
                    
                    // 2. Скрипт инициализации Finteza (window.fz)
                    if (scriptContent && (
                        (scriptContent.includes('FintezaCoreObject') && scriptContent.includes('window.fz')) || 
                        scriptContent.includes('(window, document, "script", "/ff/core.js", "fz")') || 
                        (scriptContent.includes('fz') && scriptContent.includes('register') && scriptContent.includes('website'))
                    )) {
                        const target = isInHead ? headScripts.finteza : bodyScripts.other;
                        target.push($script.clone());
                        this._log(`[Script Check] Found the Finteza initialization script (window.fz) in ${isInHead ? 'head' : 'body'}`, 'info');
                        return true;
                    }
                    
                    // 3. Основные библиотеки
                    if (scriptSrc) {
                        if (scriptSrc.includes('/vendor.js') || 
                            scriptSrc.includes('/all.js') || 
                            scriptSrc.includes('/core.js') || 
                            scriptSrc.includes('jquery')) {
                            const target = isInHead ? headScripts.core : bodyScripts.core;
                            target.push($script.clone());
                            this._log(`[Script Check] Found core library: ${scriptSrc} in ${isInHead ? 'head' : 'body'}`, 'debug');
                            return true;
                        }
                        
                        // 4. Скрипты графиков
                        if (scriptSrc.includes('/signals.js') || 
                            scriptSrc.includes('/svg-chart.js') || 
                            scriptSrc.includes('chart')) {
                            const target = isInHead ? headScripts.other : bodyScripts.charts;
                            target.push($script.clone());
                            this._log(`[Script Check] Found chart script: ${scriptSrc} in ${isInHead ? 'head' : 'body'}`, 'debug');
                            return true;
                        }
                    }
                    
                    // 5. Большой инлайн-скрипт с данными графиков
                    if (scriptContent && (
                        scriptContent.includes('window.growthChart') || 
                        scriptContent.includes('window.balanceChart') || 
                        scriptContent.includes('window.equityChart') ||
                        scriptContent.includes('equityData') || 
                        scriptContent.includes('svgRadarChart') ||
                        scriptContent.includes('var acc=') ||
                        scriptContent.includes('window.renderMiniChart')
                    )) {
                        const target = isInHead ? headScripts.other : bodyScripts.inlineData;
                        target.push($script.clone());
                        this._log(`[Script Check] Found main inline script with chart data in ${isInHead ? 'head' : 'body'}`, 'debug');
                        return true;
                    }
                    
                    // 6. Другие скрипты
                    if (scriptContent || scriptSrc) {
                        // Добавляем атрибут для отслеживания
                        $script.attr('data-keep', 'true');
                        const target = isInHead ? headScripts.other : bodyScripts.other;
                        target.push($script.clone());
                        return true;
                    }
                    
                    return false;
                };
                
                // Сначала обработаем скрипты из <head>
                $('head script').each((i, script) => {
                    if (categorizeScript(script, true)) {
                        processedScripts.add(i);
                    }
                });
                
                // Затем обработаем скрипты из <body>
                $('body script').each((i, script) => {
                    if (categorizeScript(script, false)) {
                        processedScripts.add(i);
                    }
                });
                
                // Добавляем скрипты из <head> в новый документ, соблюдая порядок зависимостей
                
                // 1. Сначала mqGlobal (должен быть первым)
                if (headScripts.mqGlobal.length > 0) {
                    for (const script of headScripts.mqGlobal) {
                        newDoc('head').append(script);
                    }
                    this._log(`Добавлен скрипт инициализации mqGlobal в <head>`, 'debug');
                }
                
                // 2. Затем finteza (должен быть до скриптов, которые используют fz)
                if (headScripts.finteza.length > 0) {
                    for (const script of headScripts.finteza) {
                        newDoc('head').append(script);
                    }
                    this._log(`Добавлен скрипт инициализации Finteza (window.fz) в <head>`, 'debug');
                }
                
                // 3. Затем core библиотеки из head
                if (headScripts.core.length > 0) {
                    for (const script of headScripts.core) {
                        newDoc('head').append(script);
                    }
                    this._log(`Добавлено ${headScripts.core.length} основных библиотек в <head>`, 'debug');
                }
                
                // 4. Затем остальные скрипты из head
                if (headScripts.other.length > 0) {
                    for (const script of headScripts.other) {
                        newDoc('head').append(script);
                    }
                    this._log(`Добавлено ${headScripts.other.length} других скриптов в <head>`, 'debug');
                }
                
                // Добавляем скрипты из <body> в новый документ, также соблюдая порядок
                
                // 1. Сначала проверяем, есть ли в body критические скрипты mqGlobal/finteza
                // Если их нет в head, но они есть в body, то mqGlobal и finteza нужно переместить в head
                if (headScripts.mqGlobal.length === 0 && bodyScripts.mqGlobal && bodyScripts.mqGlobal.length > 0) {
                    for (const script of bodyScripts.mqGlobal) {
                        newDoc('head').append(script);
                    }
                    this._log(`Перемещен скрипт инициализации mqGlobal из <body> в <head>`, 'warn');
                    // Очищаем массив, чтобы не добавить их снова
                    bodyScripts.mqGlobal = [];
                }
                
                if (headScripts.finteza.length === 0 && bodyScripts.finteza && bodyScripts.finteza.length > 0) {
                    for (const script of bodyScripts.finteza) {
                        newDoc('head').append(script);
                    }
                    this._log(`Перемещен скрипт инициализации Finteza из <body> в <head>`, 'warn');
                    // Очищаем массив, чтобы не добавить их снова
                    bodyScripts.finteza = [];
                }
                
                // 2. Основные библиотеки в body
                if (bodyScripts.core.length > 0) {
                    for (const script of bodyScripts.core) {
                        newDoc('body').append(script);
                    }
                    this._log(`Добавлено ${bodyScripts.core.length} основных библиотек в <body>`, 'debug');
                }
                
                // 3. Инлайн-скрипты с данными графиков
                if (bodyScripts.inlineData.length > 0) {
                    for (const script of bodyScripts.inlineData) {
                        newDoc('body').append(script);
                    }
                    this._log(`Добавлено ${bodyScripts.inlineData.length} инлайн-скриптов с данными в <body>`, 'debug');
                }
                
                // 4. Скрипты графиков
                if (bodyScripts.charts.length > 0) {
                    for (const script of bodyScripts.charts) {
                        newDoc('body').append(script);
                    }
                    this._log(`Добавлено ${bodyScripts.charts.length} скриптов графиков в <body>`, 'debug');
                }
                
                // 5. Другие скрипты из body
                if (bodyScripts.other.length > 0) {
                    for (const script of bodyScripts.other) {
                        newDoc('body').append(script);
                    }
                    this._log(`Добавлено ${bodyScripts.other.length} других скриптов в <body>`, 'debug');
                }
                
                this._log(`Всего обработано ${processedScripts.size} скриптов`, 'info');
                const totalHeadScripts = headScripts.mqGlobal.length + headScripts.finteza.length + 
                                         headScripts.core.length + headScripts.other.length;
                const totalBodyScripts = bodyScripts.core.length + bodyScripts.inlineData.length + 
                                         bodyScripts.charts.length + bodyScripts.other.length;
                this._log(`Размещено ${totalHeadScripts} скриптов в <head> и ${totalBodyScripts} в <body>`, 'info');
            }
            
            // Если нужно сохранить стили
            if (this.options.preserveStyles) {
                this._log('Сохраняем стили', 'debug');
                const styles = $('link[rel="stylesheet"], style');
                styles.each((i, style) => {
                    newDoc('head').append($(style).clone());
                });
                this._log(`Сохранено ${styles.length} стилей`, 'debug');
            }
            
            // Получаем результат
            const result = newDoc.html();
            
            // Логируем время выполнения
            const execTime = performance.now() - startTime;
            this._log(`Извлечение элементов завершено за ${execTime.toFixed(2)}ms`, 'debug');
            
            return result;
        } catch (error) {
            this._log(`Ошибка при извлечении элементов: ${error.message}`, 'error');
            
            // Если опция fallbackToClean установлена, пробуем режим clean
            if (this.options.fallbackToClean) {
                this._log('Переход в режим clean из-за ошибки', 'warn');
                return this._clean(html);
            }
            
            // Иначе возвращаем исходный HTML
            return html;
        }
    }
    
    /**
     * Устанавливает режим обработки HTML
     * @param {string} mode - Режим: 'clean' или 'extract'
     */
    setMode(mode) {
        if (mode !== 'clean' && mode !== 'extract') {
            throw new Error('Invalid mode. Mode must be either "clean" or "extract"');
        }
        this.options.mode = mode;
        this._log(`HTML processing mode set to: ${mode}`);
    }
    
    /**
     * Логирует информацию, если включено логирование
     * @param {...any} args - Аргументы для логирования
     * @param {string} [level='info'] - Уровень логирования: 'info', 'warn', 'error'
     * @private
     */
    _log(message, level = 'info') {
        if (this.options.verbose && this.options.logger) {
            if (level === 'warn') {
                console.warn(`[HTMLCleaner] WARNING: ${message}`);
            } else if (level === 'error') {
                console.error(`[HTMLCleaner] ERROR: ${message}`);
            } else {
                this.options.logger(`[HTMLCleaner] ${message}`);
            }
        }
    }
}

export default HTMLCleaner;