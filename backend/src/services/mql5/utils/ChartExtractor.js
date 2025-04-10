/**
 * ChartExtractor
 * 
 * Утилита для извлечения данных графиков из MQL5.
 * Работает как с SVG-элементами, так и с JavaScript-переменными,
 * содержащими данные графиков.
 */

/**
 * @class ChartExtractor
 */
export class ChartExtractor {
    /**
     * Создает экземпляр ChartExtractor
     * @param {Object} options - Настройки для экстрактора
     * @param {Function} [options.logger=console.log] - Функция для логирования
     * @param {boolean} [options.verbose=false] - Подробное логирование
     */
    constructor(options = {}) {
        this.options = {
            logger: options.logger || console.log,
            verbose: options.verbose || false
        };
    }
    
    /**
     * Извлекает данные графиков из JavaScript
     * 
     * @param {JSDOM} dom - DOM-документ 
     * @param {Object} context - Контекст выполнения
     * @returns {Object} Извлеченные данные графиков
     */
    extractFromJS(dom, context = {}) {
        this._log('Извлечение данных графиков из JavaScript...');
        
        // Инициализируем объект для хранения данных графиков
        const chartData = {
            svg: [],
            functions: {},
            rawData: [],
            balanceChart: null,
            growthChart: null,
            equityChart: null,
            chartFunctions: {} // Для хранения найденных функций
        };
        
        try {
            const window = dom.window;
            
            // 1. Прямой поиск известных переменных с данными (массивами)
            const potentialDataVars = [
                'BalanceChartData', 'balanceChartData',
                'ReturnChartData', 'returnChartData', 'growthChartData', 'GrowthChartData',
                'EquityChartData', 'equityChartData',
                'chartData', // Общее имя
                'equityData', // Данные для equityChart
                'acc', // Объект с аккаунтом для графиков
                'res' // Объект с ресурсами для графиков
            ];

            for (const varName of potentialDataVars) {
                if (window[varName]) {
                    // Проверяем формат данных
                    if (Array.isArray(window[varName])) {
                        this._log(`Found potential data array in global variable: ${varName} (length: ${window[varName].length})`);
                        // Проверяем формат данных (массив объектов {x,y} или массив массивов)
                        if (window[varName].length > 0) {
                             const firstItem = window[varName][0];
                             if ((typeof firstItem === 'object' && firstItem !== null && 'x' in firstItem && 'y' in firstItem) ||
                                 (Array.isArray(firstItem) && firstItem.length >= 2)) {
                                 
                                this._log(`Variable ${varName} seems to contain valid chart points. Storing.`);
                                chartData.rawData.push({ 
                                    name: varName, 
                                    data: this._safelySerialize(window[varName]) 
                                });
                                // Присваиваем соответствующему полю, если имя совпадает
                                if (varName.toLowerCase().includes('balance')) chartData.balanceChart = chartData.rawData[chartData.rawData.length-1].data;
                                if (varName.toLowerCase().includes('growth') || varName.toLowerCase().includes('return')) chartData.growthChart = chartData.rawData[chartData.rawData.length-1].data;
                                if (varName.toLowerCase().includes('equity')) chartData.equityChart = chartData.rawData[chartData.rawData.length-1].data;
                             } else {
                                 this._log(`Variable ${varName} is an array, but format doesn't match expected chart data. Skipping storing raw data.`);
                             }
                        } else {
                             this._log(`Variable ${varName} is an empty array. Skipping.`);
                        }
                    } else if (typeof window[varName] === 'object' && window[varName] !== null) {
                        this._log(`Found potential data object in global variable: ${varName}`);
                        chartData.rawData.push({ 
                            name: varName, 
                            data: this._safelySerialize(window[varName]) 
                        });
                    }
                }
            }
            
            // 2. Поиск функций графиков
            const chartFunctions = [
                'growthChart', 'balanceChart', 'equityChart', 
                'renderChart', 'renderMiniChart', 'svgRadarChart'
            ];
            
            for (const fnName of chartFunctions) {
                if (typeof window[fnName] === 'function') {
                    this._log(`Found chart function: ${fnName}`);
                    chartData.chartFunctions[fnName] = true;
                    
                    // Если для функции были найдены вызовы, сохраним их
                    if (context.functionCalls && context.functionCalls[fnName]) {
                        this._log(`Found ${context.functionCalls[fnName].length} calls to ${fnName}`);
                        chartData.functions[fnName] = context.functionCalls[fnName];
                    }
                }
            }
            
            // 3. Проверка window.MQL5
            if (window.MQL5 && typeof window.MQL5 === 'object') {
                this._log('Found window.MQL5 object, checking for chart data');
                
                // Инспектируем MQL5 объект, ищем массивы данных
                const inspectMQL5 = (obj, path = 'MQL5') => {
                    if (!obj || typeof obj !== 'object') return;
                    
                    // Проверяем свойства объекта
                    for (const key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            const value = obj[key];
                            const currentPath = `${path}.${key}`;
                            
                            // Если это массив, проверяем, может ли он быть данными графика
                            if (Array.isArray(value) && value.length > 0) {
                                const firstItem = value[0];
                                
                                // Проверяем формат: массив объектов {x,y} или массив массивов [x,y,...]
                                if ((typeof firstItem === 'object' && firstItem !== null && 'x' in firstItem && 'y' in firstItem) ||
                                    (Array.isArray(firstItem) && firstItem.length >= 2)) {
                                    
                                    this._log(`Found potential chart data array in ${currentPath}, length: ${value.length}`);
                                    chartData.rawData.push({
                                        name: currentPath,
                                        data: this._safelySerialize(value)
                                    });
                                    
                                    // Пытаемся определить тип графика по имени
                                    if (key.toLowerCase().includes('balance')) {
                                        chartData.balanceChart = chartData.rawData[chartData.rawData.length-1].data;
                                    } else if (key.toLowerCase().includes('growth') || key.toLowerCase().includes('return')) {
                                        chartData.growthChart = chartData.rawData[chartData.rawData.length-1].data;
                                    } else if (key.toLowerCase().includes('equity')) {
                                        chartData.equityChart = chartData.rawData[chartData.rawData.length-1].data;
                                    }
                                }
                            }
                            
                            // Рекурсивно проверяем вложенные объекты
                            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                                inspectMQL5(value, currentPath);
                            }
                        }
                    }
                };
                
                inspectMQL5(window.MQL5);
            }
            
            // 4. Проверяем аргументы функций графиков путем перехвата вызовов
            // Если у нас есть данные из вызовов функций, которые мы нашли внутри страницы
            if (window.growthChart && chartData.chartFunctions.growthChart && !chartData.growthChart) {
                this._log('No growthChart data found yet, trying to inject tracker');
                const originalFn = window.growthChart;
                window.growthChart = function(element, account, resources, options, data) {
                    console.log('Intercepted growthChart call with data:', data);
                    chartData.growthChart = data;
                    return originalFn(element, account, resources, options, data);
                };
            }
            
            if (window.balanceChart && chartData.chartFunctions.balanceChart && !chartData.balanceChart) {
                this._log('No balanceChart data found yet, trying to inject tracker');
                const originalFn = window.balanceChart;
                window.balanceChart = function(element, account, resources, options, data) {
                    console.log('Intercepted balanceChart call with data:', data);
                    chartData.balanceChart = data;
                    return originalFn(element, account, resources, options, data);
                };
            }
            
            if (window.equityChart && chartData.chartFunctions.equityChart && !chartData.equityChart) {
                this._log('No equityChart data found yet, trying to inject tracker');
                const originalFn = window.equityChart;
                window.equityChart = function(element, account, resources, options, data) {
                    console.log('Intercepted equityChart call with data:', data);
                    chartData.equityChart = data;
                    return originalFn(element, account, resources, options, data);
                };
            }
            
            // 5. Изучаем аргументы для последних вызовов функций графиков в console.log
            if (!chartData.balanceChart && !chartData.growthChart && !chartData.equityChart && dom.window.console && dom.window.console._history) {
                this._log('Checking console logs for chart function calls');
                const logs = dom.window.console._history || [];
                
                for (const log of logs) {
                    if (log && log.arguments && log.arguments.length > 0) {
                        const message = log.arguments[0];
                        
                        if (typeof message === 'string') {
                            // Ищем логи, связанные с нашими графиками
                            if (message.includes('chart rendered')) {
                                this._log(`Found chart render log: ${message}`);
                                
                                // Пытаемся извлечь данные из аргументов
                                if (log.arguments.length > 1 && Array.isArray(log.arguments[1])) {
                                    const data = log.arguments[1];
                                    
                                    if (message.includes('Growth chart') || message.includes('growth chart')) {
                                        this._log('Found growth chart data in console log');
                                        chartData.growthChart = this._safelySerialize(data);
                                    } else if (message.includes('Balance chart') || message.includes('balance chart')) {
                                        this._log('Found balance chart data in console log');
                                        chartData.balanceChart = this._safelySerialize(data);
                                    } else if (message.includes('Equity chart') || message.includes('equity chart')) {
                                        this._log('Found equity chart data in console log');
                                        chartData.equityChart = this._safelySerialize(data);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // Проверяем, нашли ли мы какие-то данные
            if (chartData.rawData.length > 0 || chartData.balanceChart || chartData.growthChart || chartData.equityChart) {
                this._log(`Successfully extracted chart data from JavaScript: ${chartData.rawData.length} data arrays, ${Object.keys(chartData.chartFunctions).length} chart functions`);
                
                if (chartData.balanceChart) this._log('Balance chart data: Found');
                if (chartData.growthChart) this._log('Growth chart data: Found');
                if (chartData.equityChart) this._log('Equity chart data: Found');
            } else {
                this._log('No chart data extracted from JavaScript');
            }
            
            return chartData;
        } catch (error) {
            this._log(`Error extracting chart data from JavaScript: ${error.message}`);
            this._log(error.stack);
            return chartData;
        }
    }
    
    /**
     * Извлекает данные из SVG-элементов графиков
     * @param {JSDOM} dom - Экземпляр JSDOM с загруженной страницей
     * @returns {Array} - Данные SVG-элементов
     */
    extractFromSVG(dom) {
        this._log('Starting extraction of SVG chart data');
        
        try {
            const svgElements = dom.window.document.querySelectorAll('svg');
            this._log(`Found ${svgElements.length} SVG elements`);
            
            const svgData = [];
            
            svgElements.forEach((svg, index) => {
                this._log(`Processing SVG #${index}, id: ${svg.id || 'no-id'}`);
                
                // Базовые свойства SVG
                const svgObject = {
                    id: svg.id || `svg-${index}`,
                    viewBox: svg.getAttribute('viewBox'),
                    width: svg.getAttribute('width'),
                    height: svg.getAttribute('height'),
                    className: svg.getAttribute('class'),
                    parentClass: svg.parentElement?.getAttribute('class') || 'none'
                };
                
                // Определяем, является ли это графиком
                const isChartSvg = this._isChartSVG(svg, svgObject);
                this._log(`SVG #${index} is ${isChartSvg ? '' : 'not '}identified as a chart SVG`);
                
                if (isChartSvg) {
                    // Извлекаем элементы графика
                    svgObject.elements = this._extractSVGElements(svg);
                    
                    // Извлекаем точки данных из путей
                    svgObject.dataPoints = this._extractPathDataPoints(svg);
                }
                
                svgData.push(svgObject);
            });
            
            return svgData;
        } catch (error) {
            this._log(`Error extracting SVG data: ${error.message}`);
            return [];
        }
    }
    
    /**
     * Определяет, является ли SVG-элемент графиком
     * @param {SVGElement} svg - SVG-элемент для проверки
     * @param {Object} svgObject - Объект с данными SVG
     * @returns {boolean} - true, если SVG является графиком
     * @private
     */
    _isChartSVG(svg, svgObject) {
        // Проверяем по классам и атрибутам
        return svg.classList.contains('svg-chart__chart-block__chart') || 
               svg.parentElement?.classList.contains('chart-container') ||
               svg.classList.contains('chart') ||
               svgObject.className?.includes('chart') ||
               svgObject.parentClass?.includes('chart') ||
               svg.id?.includes('chart') ||
               !!svg.querySelector('.chart-line') ||
               !!svg.querySelector('[class*="chart"]');
    }
    
    /**
     * Извлекает элементы SVG-графика (пути, круги, прямоугольники и тексты)
     * @param {SVGElement} svg - SVG-элемент графика
     * @returns {Object} - Объект с элементами графика
     * @private
     */
    _extractSVGElements(svg) {
        const elements = {
            paths: [],
            circles: [],
            rects: [],
            texts: []
        };
        
        // Извлекаем пути (линии графика)
        const pathElements = svg.querySelectorAll('path');
        this._log(`Found ${pathElements.length} path elements`);
        
        pathElements.forEach((path, index) => {
            const pathData = {
                index,
                d: path.getAttribute('d'),
                stroke: path.getAttribute('stroke'),
                strokeWidth: path.getAttribute('stroke-width'),
                fill: path.getAttribute('fill'),
                class: path.getAttribute('class')
            };
            elements.paths.push(pathData);
        });
        
        // Извлекаем круги (точки данных)
        const circleElements = svg.querySelectorAll('circle');
        this._log(`Found ${circleElements.length} circle elements`);
        
        circleElements.forEach((circle, index) => {
            const circleData = {
                index,
                cx: circle.getAttribute('cx'),
                cy: circle.getAttribute('cy'),
                r: circle.getAttribute('r'),
                fill: circle.getAttribute('fill'),
                stroke: circle.getAttribute('stroke'),
                class: circle.getAttribute('class')
            };
            elements.circles.push(circleData);
        });
        
        // Извлекаем прямоугольники (столбцы гистограмм)
        const rectElements = svg.querySelectorAll('rect');
        this._log(`Found ${rectElements.length} rect elements`);
        
        rectElements.forEach((rect, index) => {
            const rectData = {
                index,
                x: rect.getAttribute('x'),
                y: rect.getAttribute('y'),
                width: rect.getAttribute('width'),
                height: rect.getAttribute('height'),
                fill: rect.getAttribute('fill'),
                class: rect.getAttribute('class')
            };
            elements.rects.push(rectData);
        });
        
        // Извлекаем тексты (метки, значения)
        const textElements = svg.querySelectorAll('text');
        this._log(`Found ${textElements.length} text elements`);
        
        textElements.forEach((text, index) => {
            const textData = {
                index,
                x: text.getAttribute('x'),
                y: text.getAttribute('y'),
                content: text.textContent,
                class: text.getAttribute('class')
            };
            elements.texts.push(textData);
        });
        
        return elements;
    }
    
    /**
     * Извлекает точки данных из путей SVG
     * @param {SVGElement} svg - SVG-элемент графика
     * @returns {Array} - Массив путей с точками данных
     * @private
     */
    _extractPathDataPoints(svg) {
        const dataPoints = [];
        const paths = svg.querySelectorAll('path');
        
        paths.forEach((path, index) => {
            const d = path.getAttribute('d');
            if (!d) return;
            
            const stroke = path.getAttribute('stroke');
            const className = path.getAttribute('class');
            
            // Определяем, является ли путь линией данных
            const isDataLine = (className && (
                className.includes('line') || 
                className.includes('chart') || 
                className.includes('data')
            )) || stroke !== 'none';
            
            if (isDataLine) {
                const points = this._parseSVGPath(d);
                if (points.length > 0) {
                    dataPoints.push({
                        index,
                        stroke,
                        class: className,
                        points
                    });
                }
            }
        });
        
        return dataPoints;
    }
    
    /**
     * Парсит SVG-путь в массив точек
     * @param {string} pathData - Данные пути (атрибут d)
     * @returns {Array} - Массив точек {x, y, command}
     * @private
     */
    _parseSVGPath(pathData) {
        try {
            const points = [];
            const commands = pathData.match(/[MLHVCSQTAZmlhvcsqtaz][^MLHVCSQTAZmlhvcsqtaz]*/g) || [];
            
            let currentX = 0;
            let currentY = 0;
            
            commands.forEach(cmd => {
                const type = cmd[0];
                const args = cmd.substring(1).trim().split(/[\s,]+/).map(parseFloat);
                
                switch (type) {
                    case 'M': // Absolute moveto
                        for (let i = 0; i < args.length; i += 2) {
                            currentX = args[i];
                            currentY = args[i + 1];
                            points.push({ x: currentX, y: currentY, command: 'M' });
                        }
                        break;
                    
                    case 'm': // Relative moveto
                        for (let i = 0; i < args.length; i += 2) {
                            currentX += args[i];
                            currentY += args[i + 1];
                            points.push({ x: currentX, y: currentY, command: 'm' });
                        }
                        break;
                    
                    case 'L': // Absolute lineto
                        for (let i = 0; i < args.length; i += 2) {
                            currentX = args[i];
                            currentY = args[i + 1];
                            points.push({ x: currentX, y: currentY, command: 'L' });
                        }
                        break;
                    
                    case 'l': // Relative lineto
                        for (let i = 0; i < args.length; i += 2) {
                            currentX += args[i];
                            currentY += args[i + 1];
                            points.push({ x: currentX, y: currentY, command: 'l' });
                        }
                        break;
                    
                    case 'H': // Absolute horizontal lineto
                        args.forEach(x => {
                            currentX = x;
                            points.push({ x: currentX, y: currentY, command: 'H' });
                        });
                        break;
                    
                    case 'h': // Relative horizontal lineto
                        args.forEach(x => {
                            currentX += x;
                            points.push({ x: currentX, y: currentY, command: 'h' });
                        });
                        break;
                    
                    case 'V': // Absolute vertical lineto
                        args.forEach(y => {
                            currentY = y;
                            points.push({ x: currentX, y: currentY, command: 'V' });
                        });
                        break;
                    
                    case 'v': // Relative vertical lineto
                        args.forEach(y => {
                            currentY += y;
                            points.push({ x: currentX, y: currentY, command: 'v' });
                        });
                        break;
                    
                    // Примечание: более сложные команды пути требуют дополнительного парсинга
                    // (например, кривые Безье)
                }
            });
            
            return points;
        } catch (error) {
            this._log(`Error parsing SVG path: ${error.message}`);
            return [];
        }
    }
    
    /**
     * Инъекцирует код для отслеживания вызовов MQL5ChartAPI.addChart
     * @param {JSDOM} dom - Экземпляр JSDOM
     * @private
     */
    _injectChartAPITracker(dom) {
        try {
            if (dom.window.MQL5ChartAPI && dom.window.MQL5ChartAPI.addChart) {
                this._log('Injecting chart API tracker');
                
                // Создаем массив для хранения вызовов
                dom.window.capturedChartCalls = [];
                
                // Сохраняем оригинальную функцию
                const originalAddChart = dom.window.MQL5ChartAPI.addChart;
                
                // Заменяем функцию на прокси
                dom.window.MQL5ChartAPI.addChart = function(containerId, chartData, chartType) {
                    // Сохраняем параметры вызова
                    dom.window.capturedChartCalls.push({
                        containerId,
                        chartData,
                        chartType,
                        timestamp: new Date().toISOString()
                    });
                    
                    // Вызываем оригинальную функцию
                    return originalAddChart.call(this, containerId, chartData, chartType);
                };
            }
        } catch (error) {
            this._log(`Error injecting chart API tracker: ${error.message}`);
        }
    }
    
    /**
     * Инъекцирует код для извлечения данных графиков
     * @param {JSDOM} dom - Экземпляр JSDOM
     * @param {Object} context - Дополнительный контекст
     * @private
     */
    _injectDataExtractor(dom, context) {
        try {
            // Используем код из signals.js для извлечения данных
            if (typeof dom.window.BalanceChartData !== 'undefined' &&
                typeof dom.window.ChartsBalanceProfits !== 'undefined') {
                
                this._log('Injecting balance chart extractor');
                
                // Создаем функцию для извлечения данных графика баланса
                dom.window.extractBalanceChartData = function() {
                    const result = {
                        balanceData: [],
                        profitsData: [],
                        stopsData: []
                    };
                    
                    if (typeof window.BalanceChartData !== 'undefined') {
                        // Формируем точки данных из массивов
                        for (let i = 0; i < window.BalanceChartData.length; i += 2) {
                            result.balanceData.push({
                                x: window.BalanceChartData[i],    // Временная метка
                                y: window.BalanceChartData[i + 1] // Значение баланса
                            });
                        }
                    }
                    
                    if (typeof window.ChartsBalanceProfits !== 'undefined' && 
                        typeof window.ChartsBalanceTimestamps !== 'undefined' &&
                        typeof window.BalanceChartStops !== 'undefined') {
                        
                        // Формируем точки прибылей/убытков
                        for (let i = 0; i < window.ChartsBalanceProfits.length; i++) {
                            result.profitsData.push({
                                timestamp: window.ChartsBalanceTimestamps[i],
                                balanceStop: window.BalanceChartStops[i],
                                profit: window.ChartsBalanceProfits[i],
                                date: new Date(window.ChartsBalanceTimestamps[i] * 1000).toISOString()
                            });
                        }
                    }
                    
                    return result;
                };
                
                // Вызываем функцию и сохраняем результат
                dom.window.extractedBalanceChartData = dom.window.extractBalanceChartData();
            }
            
            // Аналогично для графика роста (Return Chart)
            if (typeof dom.window.ReturnChartData !== 'undefined' &&
                typeof dom.window.ReturnChartIndex !== 'undefined') {
                
                this._log('Injecting growth chart extractor');
                
                // Создаем функцию для извлечения данных графика роста
                dom.window.extractGrowthChartData = function() {
                    const result = {
                        returnData: [],
                        indexData: {}
                    };
                    
                    if (typeof window.ReturnChartData !== 'undefined') {
                        // Формируем точки данных из массивов
                        for (let i = 0; i < window.ReturnChartData.length; i += 2) {
                            result.returnData.push({
                                x: window.ReturnChartData[i],    // Временная метка
                                y: window.ReturnChartData[i + 1] // Значение роста
                            });
                        }
                    }
                    
                    if (typeof window.ReturnChartIndex !== 'undefined') {
                        result.indexData = { ...window.ReturnChartIndex };
                    }
                    
                    return result;
                };
                
                // Вызываем функцию и сохраняем результат
                dom.window.extractedGrowthChartData = dom.window.extractGrowthChartData();
            }
        } catch (error) {
            this._log(`Error injecting data extractor: ${error.message}`);
        }
    }
    
    /**
     * Безопасно сериализует объект в JSON
     * @param {*} obj - Объект для сериализации
     * @returns {*} - Сериализованный объект или сообщение об ошибке
     * @private
     */
    _safelySerialize(obj) {
        try {
            return JSON.parse(JSON.stringify(obj, (key, value) => {
                // Обработка функций (преобразуем в строку)
                if (typeof value === 'function') {
                    return value.toString();
                }
                // Обработка объектов DOM (исключаем)
                if (value && typeof value === 'object' && value.nodeName) {
                    return `[DOM Node: ${value.nodeName}]`;
                }
                return value;
            }));
        } catch (error) {
            return { error: `Serialization failed: ${error.message}` };
        }
    }
    
    /**
     * Логирует информацию, если включено подробное логирование
     * @param {...any} args - Аргументы для логирования
     * @private
     */
    _log(...args) {
        if (this.options.verbose && this.options.logger) {
            this.options.logger(...args);
        }
    }
}

export default ChartExtractor; 