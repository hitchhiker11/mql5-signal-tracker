/**
 * Конфигурация по умолчанию для сервиса MQL5
 * 
 * Содержит все настройки для компонентов сервиса MQL5.
 */

const defaultConfig = {
    /**
     * Режим парсинга по умолчанию
     * - 'fast': Быстрый режим без JavaScript и минимумом данных
     * - 'normal': Средний режим с базовыми скриптами и основными данными
     * - 'advanced': Полный режим с JavaScript и всеми данными
     */
    parsingMode: 'advanced',
    
    /**
     * Настройки HTTP-запросов
     */
    httpRequest: {
        timeout: 30000, // 30 секунд
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Referer': 'https://www.mql5.com/'
        },
        cookies: '_fz_uniq=6402022292596581225; _fz_fvdt=1739272501; cookie_accept=1; lang=ru;',
        maxRedirects: 5,
        decompress: true
    },
    
    /**
     * Настройки управления ресурсами
     */
    resourceManagement: {
        /**
         * Разрешенные скрипты (используется в режимах normal и advanced)
         */
        allowedScripts: [
            // Скрипты для отображения графиков
            '/js/signals/all.js',
            '/js/signals/svg-chart.js',
            '/js/signals/common.js',
            // Библиотеки
            '/js/vendor',
            '/js/jquery'
        ],
        
        /**
         * Разрешенные стили (используется в режимах normal и advanced)
         */
        allowedStyles: [
            '/css/core.css',
            '/css/signals.css',
            '/css/all.css'
        ],
        
        /**
         * Блокировать внешние ресурсы (не с домена mql5.com)
         */
        blockExternalResources: true,
        
        /**
         * Использовать заглушки вместо блокировки
         * - При true: ресурсы будут заменены заглушками
         * - При false: ресурсы будут полностью заблокированы
         */
        useStubs: true
    },
    
    /**
     * Настройки очистки HTML
     */
    htmlCleaning: {
        /**
         * Режим работы HTMLCleaner
         * - 'clean': Удаление ненужных элементов
         * - 'extract': Извлечение только нужных элементов
         */
        mode: 'extract',
        
        /**
         * Селекторы элементов для удаления (режим 'clean')
         */
        removeSelectors: [
            // Ненужные блоки
            'iframe', 
            '.footer', 
            '.advertising',
            '.header-panel',
            '#popup-notification-container',
            '#popup-notification-container-lg',
            '.global-message',
            '.login-panel',
            '.menu-panel',
            '.breadcrumbs',
            '.sidebar',
            'script:not([data-keep])',
            // Элементы, замедляющие загрузку
            'img:not(.signal-avatar)',
            '.lazy-load',
            '.comments-panel',
            '.social-panel'
        ],
        
        /**
         * Селекторы элементов для сохранения (режим 'extract')
         */
        keepSelectors: [
            // Основная информация о сигнале (из старого кода)
            '.s-line-card__title',
            '.s-line-card__author',
            '.s-indicators__item_risk',
            '.s-list-info__item',
            '.s-list-info__label',
            '.s-list-info__value',
            
            // Статистика (из старого кода)
            '.s-data-columns__item',
            '.s-data-columns__label',
            '.s-data-columns__value',
            
            // История торговли (из старого кода)
            '#signalInfoTable',
            '#signalInfoTable tbody tr',
            
            // Распределение (из старого кода)
            '.signals-chart-dist',
            '.signals-chart-dist tbody tr',
            '.col-symbol',
            '.col-buy-sell',
            '.bar div',
            
            // Другие сигналы автора (из старого кода)
            '#authorsSignals',
            '.s-other-signal',
            '.s-other-signal__name',
            
            // Дополнительные селекторы
            '.col-price',
            '.price-value',
            '.s-indicators__item-wrapper_subscribers',
            '.col-subscribers',
            '.col-growth',
            '.s-val--positive',
            '.s-val--negative',
            '.col-drawdown',
            '.col-weeks',
            '.signal-page-desc',
            '.tags .tag',
            '.broker .item a span',
            '.s-line-card__header a',
            
            // Графики и SVG
            '.chart-container', 
            '#growth_chart',
            '#balance_chart',
            '#equity_chart',
            '.svg-chart',
            '.mini-chart',
            '#avatar_chart',
            
            // JavaScript-данные
            'script[data-keep]'
        ],
        
        /**
         * Сохранять скрипты
         */
        preserveScripts: true,
        
        /**
         * Сохранять стили
         */
        preserveStyles: false,
        
        /**
         * Автоматический переход в режим 'clean' при ошибке в режиме 'extract'
         */
        fallbackToClean: true
    },
    
    /**
     * Настройки парсинга
     */
    parsing: {
        /**
         * Таймаут ожидания загрузки скриптов (мс)
         */
        scriptTimeout: 5000,
        
        /**
         * Подробное логирование процесса парсинга
         */
        verboseLogging: true,
        
        /**
         * Включить проверку целостности данных после парсинга
         */
        validateResults: true
    },
    
    /**
     * Настройки кеширования
     */
    cache: {
        /**
         * Включить кеширование
         */
        enabled: true,
        
        /**
         * Время жизни кеша в секундах (1 час)
         */
        ttl: 3600
    },
    
    /**
     * Настройки логирования
     */
    logger: {
        /**
         * Уровень логирования:
         * - ERROR: Только ошибки
         * - WARN: Ошибки и предупреждения
         * - INFO: Информационные сообщения (по умолчанию)
         * - DEBUG: Подробное логирование
         */
        level: 'DEBUG',
        
        /**
         * Формат логирования
         * - 'simple': Простой текстовый формат
         * - 'json': JSON формат для парсинга
         */
        format: 'simple'
    }
};

export default defaultConfig; 