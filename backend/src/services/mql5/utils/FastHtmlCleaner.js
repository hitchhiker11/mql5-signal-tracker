/**
 * FastHtmlCleaner - облегченный класс для быстрой очистки HTML
 * 
 * Оптимизированная версия HTMLCleaner для быстрой обработки HTML.
 * Использует cheerio для быстрой и эффективной очистки HTML без полной загрузки DOM.
 */

import * as cheerio from 'cheerio';


class FastHtmlCleaner {
    /**
     * Создает экземпляр FastHtmlCleaner
     * 
     * @param {Object} options - Настройки очистки
     * @param {Array<string>} [options.removeSelectors] - Селекторы элементов для удаления
     * @param {Array<string>} [options.keepSelectors] - Селекторы элементов для сохранения
     * @param {boolean} [options.removeScripts=true] - Удалять ли скрипты
     * @param {boolean} [options.removeStyles=true] - Удалять ли стили
     * @param {boolean} [options.removeComments=true] - Удалять ли комментарии
     * @param {Object} [options.logger] - Объект логгера
     */
    constructor(options = {}) {
        this.options = {
            removeSelectors: [],
            keepSelectors: [],
            removeScripts: true,
            removeStyles: true,
            removeComments: true,
            ...options
        };

        // Инициализируем логгер
        this.logger = options.logger || {
            info: () => {},
            debug: () => {},
            warn: () => {},
            error: () => {}
        };

        this.logger.info('FastHtmlCleaner: Инициализирован');
    }

    /**
     * Быстро очищает HTML удаляя ненужные элементы
     * 
     * @param {string} html - Исходный HTML
     * @returns {string} Очищенный HTML
     */
    clean(html) {
        if (!html) {
            this.logger.warn('FastHtmlCleaner: Получен пустой HTML');
            return '';
        }

        const startTime = Date.now();
        const originalSize = html.length;
        
        try {
            // Загружаем HTML в cheerio
            const $ = cheerio.load(html, {
                decodeEntities: true,
                normalizeWhitespace: false,
                xmlMode: false
            });

            // Удаляем скрипты, если указано
            if (this.options.removeScripts) {
                const scriptsCount = $('script').length;
                $('script').remove();
                this.logger.debug(`FastHtmlCleaner: Удалено ${scriptsCount} скриптов`);
            }

            // Удаляем стили, если указано
            if (this.options.removeStyles) {
                const stylesCount = $('style').length + $('link[rel="stylesheet"]').length;
                $('style, link[rel="stylesheet"]').remove();
                this.logger.debug(`FastHtmlCleaner: Удалено ${stylesCount} стилей`);
            }

            // Удаляем комментарии, если указано
            if (this.options.removeComments) {
                let commentsCount = 0;
                $('*').contents().each(function() {
                    if (this.type === 'comment') {
                        $(this).remove();
                        commentsCount++;
                    }
                });
                this.logger.debug(`FastHtmlCleaner: Удалено ${commentsCount} комментариев`);
            }

            // Удаляем элементы по селекторам
            if (this.options.removeSelectors && this.options.removeSelectors.length > 0) {
                let totalRemoved = 0;
                
                for (const selector of this.options.removeSelectors) {
                    try {
                        const count = $(selector).length;
                        $(selector).remove();
                        totalRemoved += count;
                        this.logger.debug(`FastHtmlCleaner: Удалено ${count} элементов по селектору '${selector}'`);
                    } catch (error) {
                        this.logger.error(`FastHtmlCleaner: Ошибка при удалении селектора '${selector}': ${error.message}`);
                    }
                }
                
                this.logger.debug(`FastHtmlCleaner: Всего удалено ${totalRemoved} элементов по селекторам`);
            }

            // Получаем результат
            const result = $.html();
            const processedSize = result.length;
            const reductionPercent = (100 * (originalSize - processedSize) / originalSize).toFixed(2);
            
            this.logger.info(`FastHtmlCleaner: HTML очищен. Размер уменьшен с ${originalSize} до ${processedSize} байт (${reductionPercent}% уменьшение)`);
            this.logger.info(`FastHtmlCleaner: Очистка завершена за ${Date.now() - startTime}ms`);
            
            return result;
        } catch (error) {
            this.logger.error(`FastHtmlCleaner: Ошибка при очистке HTML: ${error.message}`);
            return html; // В случае ошибки возвращаем исходный HTML
        }
    }

    /**
     * Извлекает только необходимые элементы из HTML
     * 
     * @param {string} html - Исходный HTML
     * @param {Array<string>} selectors - Селекторы элементов для извлечения
     * @returns {string} HTML с извлеченными элементами
     */
    extract(html, selectors = []) {
        if (!html) {
            this.logger.warn('FastHtmlCleaner: Получен пустой HTML');
            return '';
        }

        // Если не переданы селекторы, используем keepSelectors из настроек
        const extractSelectors = selectors.length > 0 ? selectors : this.options.keepSelectors;
        
        if (!extractSelectors || extractSelectors.length === 0) {
            this.logger.warn('FastHtmlCleaner: Не указаны селекторы для извлечения');
            return this.clean(html); // Просто очищаем HTML, если нет селекторов для извлечения
        }

        const startTime = Date.now();
        const originalSize = html.length;
        
        try {
            // Загружаем HTML в cheerio с сохранением оригинальной структуры
            const $ = cheerio.load(html, {
                decodeEntities: false,
                normalizeWhitespace: false,
                xml: {
                    normalizeWhitespace: false
                },
                withDomLvl1: true
            });
            
            // Сначала создаем новый документ, сохраняя базовую структуру
            // Копируем DOCTYPE, html, head, и создаем пустой body
            const documentStructure = `
                <!DOCTYPE html>
                <html>
                <head>
                    ${$('head').html() || ''}
                </head>
                <body>
                </body>
                </html>
            `;
            
            const newDoc = cheerio.load(documentStructure, {
                decodeEntities: false,
                normalizeWhitespace: false
            });
            
            let totalExtracted = 0;
            
            // Извлекаем элементы по селекторам и добавляем их в новый документ
            for (const selector of extractSelectors) {
                try {
                    const elements = $(selector);
                    const count = elements.length;
                    
                    if (count > 0) {
                        elements.each((i, el) => {
                            // Клонируем элемент и добавляем в новый документ
                            const clonedElement = $.html(el);
                            newDoc('body').append(clonedElement);
                        });
                        totalExtracted += count;
                        this.logger.debug(`FastHtmlCleaner: Извлечено ${count} элементов по селектору '${selector}'`);
                    } else {
                        this.logger.debug(`FastHtmlCleaner: Не найдено элементов по селектору '${selector}'`);
                    }
                } catch (error) {
                    this.logger.error(`FastHtmlCleaner: Ошибка при извлечении селектора '${selector}': ${error.message}`);
                }
            }

            // Если не удалось ничего извлечь, возвращаем очищенный HTML
            if (totalExtracted === 0) {
                this.logger.warn('FastHtmlCleaner: Не удалось извлечь ни одного элемента, возвращаем очищенный HTML');
                return this.clean(html);
            }
            
            // Сохраняем важные скрипты, если они есть
            if (!this.options.removeScripts) {
                const scripts = $('script[data-keep]');
                scripts.each((i, script) => {
                    newDoc('body').append($.html(script));
                });
                this.logger.debug(`FastHtmlCleaner: Сохранено ${scripts.length} важных скриптов`);
            }
            
            // Получаем результат
            const result = newDoc.html();
            const processedSize = result.length;
            const reductionPercent = (100 * (originalSize - processedSize) / originalSize).toFixed(2);
            
            this.logger.info(`FastHtmlCleaner: HTML обработан. Размер уменьшен с ${originalSize} до ${processedSize} байт (${reductionPercent}% уменьшение)`);
            this.logger.info(`FastHtmlCleaner: Извлечение завершено за ${Date.now() - startTime}ms`);
            
            return result;
        } catch (error) {
            this.logger.error(`FastHtmlCleaner: Ошибка при извлечении элементов из HTML: ${error.message}`);
            return this.clean(html); // В случае ошибки возвращаем очищенный HTML
        }
    }

    /**
     * Обрабатывает HTML в соответствии с настройками
     * 
     * @param {string} html - Исходный HTML
     * @param {Object} options - Опции обработки для переопределения настроек
     * @returns {string} Обработанный HTML
     */
    process(html, options = {}) {
        const mergedOptions = {
            ...this.options,
            ...options
        };

        // Определяем режим работы
        const mode = mergedOptions.mode || 'clean';
        
        if (mode === 'extract') {
            return this.extract(html, mergedOptions.keepSelectors);
        } else {
            return this.clean(html);
        }
    }
}

export default FastHtmlCleaner; 