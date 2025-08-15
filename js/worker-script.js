// Enhanced Tax Calculator Web Worker with Error Handling
class EnhancedTaxCalculatorWorker {
    constructor() {
        this.cache = new Map();
        this.calculationHistory = [];
        this.version = '4.0.0-enhanced';
    }

    calculate(data) {
        try {
            const startTime = performance.now();
            const cacheKey = this.generateCacheKey(data);
            
            if (this.cache.has(cacheKey)) {
                const cachedResult = this.cache.get(cacheKey);
                return {
                    ...cachedResult,
                    cacheHit: true,
                    calculationTime: 0
                };
            }

            const results = this.performCalculation(data);
            const calculationTime = performance.now() - startTime;
            
            const finalResults = {
                ...results,
                cacheHit: false,
                calculationTime: Math.round(calculationTime),
                timestamp: new Date().toISOString(),
                version: this.version
            };

            this.cache.set(cacheKey, finalResults);
            this.limitCacheSize();
            
            this.calculationHistory.push({
                data,
                results: finalResults,
                timestamp: finalResults.timestamp
            });

            return finalResults;
        } catch (error) {
            throw new Error(`Calculation failed: ${error.message}`);
        }
    }

    generateCacheKey(data) {
        return JSON.stringify(data, Object.keys(data).sort());
    }

    limitCacheSize() {
        if (this.cache.size > 100) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }

    performCalculation(data) {
        this.validateInput(data);
        
        const anschaffungskosten = (data.kaufpreis || 0) + (data.nebenkosten_kauf || 0) + (data.modernisierung || 0);
        const grossProfit = (data.verkaufspreis || 0) - (data.nebenkosten_verkauf || 0) - anschaffungskosten;
        
        if (grossProfit <= 0) {
            return { 
                grossProfit, 
                structures: [],
                message: 'Kein steuerpflichtiger Gewinn vorhanden'
            };
        }

        const structures = this.calculateStructures(grossProfit, data);
        
        return {
            grossProfit,
            structures,
            maxNetProfit: structures.length > 0 ? structures[0].netProfit : 0,
            totalSavings: structures.length > 1 ? structures[0].netProfit - structures[structures.length - 1].netProfit : 0,
            recommendation: this.generateRecommendation(structures, data)
        };
    }

    validateInput(data) {
        const required = ['kaufpreis', 'verkaufspreis', 'haltedauer'];
        const missing = required.filter(field => !data[field] && data[field] !== 0);
        
        if (missing.length > 0) {
            throw new Error(`Required fields missing: ${missing.join(', ')}`);
        }

        if (data.kaufpreis < 0 || data.verkaufspreis < 0) {
            throw new Error('Preise müssen positiv sein');
        }

        if (data.haltedauer < 0 || data.haltedauer > 100) {
            throw new Error('Haltedauer muss zwischen 0 und 100 Jahren liegen');
        }
    }

    calculateStructures(grossProfit, data) {
        const baseTax = this.calculateSpeculationTax(grossProfit, data.haltedauer, data.steuersatz, data.kirchensteuer);
        const structures = [];

        const structureConfigs = [
            { name: 'Privatverkauf', factor: 1.0, minProfit: 0, complexity: 'niedrig' },
            { name: 'VV GmbH & Co. KG (BFH 2025)', factor: 0.85, minProfit: 0, complexity: 'mittel' },
            { name: 'Familienpool (GbR)', factor: 0.75, minProfit: 50000, complexity: 'mittel' },
            { name: 'Share Deal (GmbH)', factor: 0.60, minProfit: 100000, complexity: 'hoch' },
            { name: 'Cross-Border Holding (Luxemburg)', factor: 0.45, minProfit: 500000, complexity: 'sehr hoch' },
            { name: 'Cross-Border Struktur (Niederlande)', factor: 0.50, minProfit: 500000, complexity: 'sehr hoch' },
            { name: 'Familienstiftung', factor: 0.35, minProfit: 1000000, complexity: 'sehr hoch' },
            { name: 'Stiftung & Co. KG', factor: 0.40, minProfit: 1000000, complexity: 'sehr hoch' }
        ];

        for (const config of structureConfigs) {
            if (grossProfit >= config.minProfit) {
                const tax = baseTax * config.factor;
                const netProfit = grossProfit - tax;
                
                structures.push({
                    name: config.name,
                    grossProfit,
                    tax,
                    netProfit,
                    taxRate: grossProfit > 0 ? (tax / grossProfit * 100) : 0,
                    complexity: config.complexity,
                    advantages: this.getAdvantages(config.name),
                    disadvantages: this.getDisadvantages(config.name),
                    recommendation: this.getRecommendation(config.name, data),
                    implementationTime: this.getImplementationTime(config.complexity),
                    costs: this.getImplementationCosts(config.complexity, grossProfit),
                    isBest: false
                });
            }
        }

        structures.sort((a, b) => b.netProfit - a.netProfit);
        if (structures.length > 0) {
            structures[0].isBest = true;
        }

        return structures;
    }

    calculateSpeculationTax(profit, holdingPeriod, taxRate, churchTax) {
        if (holdingPeriod >= 10) return 0;
        
        const incomeTax = profit * ((taxRate || 42) / 100);
        const churchTaxAmount = incomeTax * ((churchTax || 0) / 100);
        const solidarityTax = incomeTax * 0.055;
        
        return incomeTax + churchTaxAmount + solidarityTax;
    }

    getAdvantages(structureName) {
        const advantages = {
            'Privatverkauf': ['Steuerfrei nach 10 Jahren', 'Einfachste Abwicklung', 'Keine Gründungskosten', 'Sofort umsetzbar'],
            'VV GmbH & Co. KG (BFH 2025)': ['BFH 2025: Gewerbesteuerfrei!', 'Haftungsbeschränkung', 'Flexibilität bei Gesellschafterwechsel', 'Steuerliche Transparenz'],
            'Familienpool (GbR)': ['Steuerverteilung auf Familie', 'Progression brechen', 'Transparente Besteuerung', 'Einfache Verwaltung'],
            'Share Deal (GmbH)': ['40% steuerfreier Gewinn (§8b KStG)', 'Keine Grunderwerbsteuer', 'Planungssicherheit', 'Professionelle Struktur'],
            'Cross-Border Holding (Luxemburg)': ['EU-Holding-Richtlinie', 'Internationale Steueroptimierung', 'Niedrige Substanzsteuer', 'EU-weit anerkannt'],
            'Cross-Border Struktur (Niederlande)': ['Doppelbesteuerungsabkommen', 'EU-konform', 'Steuerliche Transparenz', 'Niedrige Körperschaftsteuer'],
            'Familienstiftung': ['Generationenübergreifend', 'Vermögensschutz', 'Erbschaftsteueroptimierung', 'Langfristige Planung'],
            'Stiftung & Co. KG': ['Flexible Gewinnverteilung', 'Haftungsbeschränkung', 'Steueroptimierung', 'Professionelle Verwaltung']
        };
        return advantages[structureName] || [];
    }

    getDisadvantages(structureName) {
        const disadvantages = {
            'Privatverkauf': ['Spekulationssteuer unter 10 Jahren', 'Keine Optimierungsmöglichkeiten', 'Volle Steuerlast'],
            'VV GmbH & Co. KG (BFH 2025)': ['Komplexere Struktur', 'Gründungskosten 5.000-15.000€', 'Laufende Verwaltung', 'Gesellschaftsvertrag nötig'],
            'Familienpool (GbR)': ['Mehrere Gesellschafter nötig', 'Gesellschaftsvertrag erforderlich', 'Einstimmigkeit bei Entscheidungen'],
            'Share Deal (GmbH)': ['Mindestens 5% Beteiligung', 'GmbH-Gründung erforderlich', 'Komplexe Struktur', 'Hohe Verwaltungskosten'],
            'Cross-Border Holding (Luxemburg)': ['Hohe Beratungskosten 50.000-100.000€', 'Komplexe Struktur', 'Substanzanforderungen', 'Compliance-Aufwand'],
            'Cross-Border Struktur (Niederlande)': ['Internationale Struktur', 'Compliance-Aufwand', 'Beratungsintensiv', 'Währungsrisiko'],
            'Familienstiftung': ['Hohe Gründungskosten 100.000-300.000€', 'Komplexe Verwaltung', 'Bindungswirkung', 'Langfristige Festlegung'],
            'Stiftung & Co. KG': ['Sehr komplex', 'Hohe Kosten 150.000€+', 'Verwaltungsaufwand', 'Regulatorische Anforderungen']
        };
        return disadvantages[structureName] || [];
    }

    getRecommendation(structureName, data) {
        if (data.haltedauer >= 10) return 'Optimal bei steuerfreiem Verkauf - sofort umsetzbar';
        if (structureName.includes('Cross-Border')) return 'Für internationale Großinvestoren - professionelle Beratung erforderlich';
        if (structureName.includes('Stiftung')) return 'Für sehr hohe Vermögen - langfristige Familienplanung';
        if (structureName.includes('Share Deal')) return 'Sehr gut für größere Gewinne - mittelfristige Umsetzung';
        if (structureName.includes('Familienpool')) return 'Optimal für Familien - schnell umsetzbar';
        if (structureName.includes('VV GmbH')) return 'Ausgezeichnet nach BFH-Urteil 2025 - sehr empfehlenswert';
        return 'Empfehlenswert nach individueller Prüfung';
    }

    getImplementationTime(complexity) {
        const timeframes = {
            'niedrig': '1-2 Wochen',
            'mittel': '1-3 Monate',
            'hoch': '3-6 Monate',
            'sehr hoch': '6-12 Monate'
        };
        return timeframes[complexity] || 'Unbestimmt';
    }

    getImplementationCosts(complexity, grossProfit) {
        const baseCosts = {
            'niedrig': 1000,
            'mittel': 10000,
            'hoch': 30000,
            'sehr hoch': 100000
        };
        
        const base = baseCosts[complexity] || 0;
        const percentage = grossProfit > 1000000 ? 0.02 : 0.01;
        
        return Math.max(base, grossProfit * percentage);
    }

    generateRecommendation(structures, data) {
        if (structures.length === 0) {
            return 'Keine Optimierung möglich bei diesem Gewinn.';
        }

        const best = structures[0];
        const savings = structures.length > 1 ? best.netProfit - structures[structures.length - 1].netProfit : 0;
        
        let recommendation = `Empfehlung: ${best.name} bietet mit ${this.formatCurrency(best.netProfit)} den höchsten Nettogewinn.`;
        
        if (savings > 0) {
            recommendation += ` Ersparnis: ${this.formatCurrency(savings)} gegenüber ungünstigster Option.`;
        }

        if (data.haltedauer >= 10) {
            recommendation += ' Da die 10-Jahres-Frist erfüllt ist, ist der Verkauf bereits steuerfrei!';
        }

        return recommendation;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    }

    getCacheStats() {
        return {
            size: this.cache.size,
            calculations: this.calculationHistory.length,
            hitRate: this.calculationHistory.filter(c => c.results.cacheHit).length / Math.max(1, this.calculationHistory.length)
        };
    }
}

const calculator = new EnhancedTaxCalculatorWorker();

self.onmessage = function(e) {
    const { id, data, type } = e.data;
    try {
        let result;
        
        switch(type) {
            case 'calculate':
                result = calculator.calculate(data);
                break;
            case 'getCacheStats':
                result = calculator.getCacheStats();
                break;
            default:
                result = calculator.calculate(data);
        }
        
        self.postMessage({ id, result, success: true });
    } catch (error) {
        self.postMessage({ 
            id, 
            error: {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            }, 
            success: false 
        });
    }
};