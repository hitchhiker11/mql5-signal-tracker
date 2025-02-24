import * as cheerio from 'cheerio';
import axios from 'axios';

export class MQL5Parser {
    constructor() {
        this.baseUrl = 'https://www.mql5.com';
        this.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1'
        };
    }

    async parseSignal(url) {
        try {
            const response = await axios.get(url, {
                headers: this.headers,
                timeout: 30000,
                maxRedirects: 5
            });
            
            const $ = cheerio.load(response.data);

            const generalInfo = this.parseGeneralInfo($);
            const statistics = this.parseStatistics($);
            const tradeHistory = this.parseTradeHistory($);
            const distribution = this.parseDistribution($);
            const authorSignals = this.parseAuthorSignals($);

            const data = {
                generalInfo,
                statistics,
                tradeHistory,
                distribution,
                authorSignals,
                url,
                lastUpdate: new Date().toISOString()
            };

            return data;
        } catch (error) {
            console.error('Error parsing signal:', error);
            throw new Error('Failed to parse signal data');
        }
    }

    parseGeneralInfo($) {
        return {
            signalName: $('.signal-header__name').text().trim(),
            author: $('.signal-header__author a').text().trim(),
            reliability: $('.signal-header__reliability').text().trim(),
            subscribers: parseInt($('.signal-header__subscribers span').text().trim().replace(/\D/g, '')) || 0,
            price: parseFloat($('.signal-header__price').text().trim().replace(/[^\d.]/g, '')) || 0
        };
    }

    parseStatistics($) {
        return {
            deposits: parseFloat($('.signal-header__deposits').text().trim().replace(/[^\d.]/g, '')) || 0,
            profit: parseFloat($('.signal-header__profit').text().trim().replace(/[^\d.]/g, '')) || 0,
            trades: parseInt($('.signal-header__trades').text().trim().replace(/\D/g, '')) || 0,
            weeks: parseInt($('.signal-header__weeks').text().trim().replace(/\D/g, '')) || 0
        };
    }

    parseTradeHistory($) {
        const trades = [];
        $('.signal-trading__history tbody tr').each((_, row) => {
            const trade = {};
            $(row).find('td').each((index, cell) => {
                const value = $(cell).text().trim();
                switch(index) {
                    case 0: trade.time = value; break;
                    case 1: trade.type = value; break;
                    case 2: trade.symbol = value; break;
                    case 3: trade.volume = parseFloat(value) || 0; break;
                    case 4: trade.price = parseFloat(value) || 0; break;
                    case 5: trade.profit = parseFloat(value) || 0; break;
                }
            });
            if (Object.keys(trade).length > 0) {
                trades.push(trade);
            }
        });
        return trades;
    }

    parseDistribution($) {
        const distribution = [];
        $('.signal-trading__distribution .distribution__item').each((_, el) => {
            distribution.push({
                symbol: $(el).find('.distribution__symbol').text().trim(),
                percentage: parseFloat($(el).find('.distribution__value').text().trim()) || 0
            });
        });
        return distribution;
    }

    parseAuthorSignals($) {
        const signals = [];
        $('.signal-author__signals .signal-card').each((_, el) => {
            signals.push({
                name: $(el).find('.signal-card__name').text().trim(),
                url: this.baseUrl + $(el).find('a').attr('href'),
                subscribers: parseInt($(el).find('.signal-card__subscribers').text().trim().replace(/\D/g, '')) || 0
            });
        });
        return signals;
    }

    async validateSignalUrl(url) {
        const urlPattern = /^https:\/\/www\.mql5\.com\/[a-z]{2}\/signals\/\d+$/;
        if (!urlPattern.test(url)) {
            throw new Error('Invalid signal URL format');
        }
        return true;
    }
}

export default MQL5Parser;