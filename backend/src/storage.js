// Временное хранилище данных в памяти
class Storage {
    constructor() {
        this.signals = new Map();
    }

    saveSignal(url, data) {
        this.signals.set(url, {
            ...data,
            timestamp: new Date()
        });
    }

    getSignal(url) {
        return this.signals.get(url);
    }

    getAllSignals() {
        return Array.from(this.signals.values());
    }
}

module.exports = new Storage(); 