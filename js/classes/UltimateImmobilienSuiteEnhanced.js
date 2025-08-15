// Main Application Class - Part 1 (Core functionality)
class UltimateImmobilienSuiteEnhanced {
    constructor() {
        this.version = '4.0.0-enhanced';
        this.scenarios = new Map();
        this.currentScenario = 'scenario1';
        this.realtimeEnabled = true;
        this.calculationTimeout = null;
        this.worker = null;
        this.workerMessageId = 0;
        this.workerCallbacks = new Map();
        this.cache = new Map();
        this.analytics = {
            calculations: 0,
            cacheHits: 0,
            errors: 0,
            startTime: Date.now()
        };
        this.plugins = new Map();
        this.keyboardShortcuts = new Map();
        this.chart = null;
        this.isRestoringState = false;
        this.sectionData = {}; // Store data for each section
        this.cachedElements = new Map(); // Cache frequently accessed DOM elements
        this.eventListenersCleanup = new Set(); // Track event listeners for cleanup
        
        // Enhanced components
        this.errorHandler = new EnhancedErrorHandler();
        this.pdfExporter = new EnhancedPDFExporter();
        this.appState = new ApplicationState();
        this.calculationEngine = new TaxCalculationEngine();
        
        // Google Analytics Integration
        this.gaTracker = new GoogleAnalyticsTracker();
        this.cookieManager = new CookieConsentManager();
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Ultimate Enterprise Suite Enhanced...');
        
        try {
            // Track app initialization
            this.gaTracker.trackUserJourney('app_start', 'initialization_started');
            
            await this.initializeWebWorker();
            this.setupEventListeners();
            this.setupKeyboardShortcuts();
            this.setupScenarios();
            this.setupPluginArchitecture();
            this.initializeAnalytics();
            this.loadSavedData();
            this.setupAutoSave();
            this.setupPerformanceMonitoring();
            
            // Initialize Google Analytics
            this.gaTracker.init();
            
            // Load initial content
            this.loadSectionContent('verkauf');
            
            this.showToast('🚀 Ultimate Enterprise Suite Enhanced geladen', 'success');
            this.updatePerformanceIndicator('Ready');
            
            // Track successful initialization
            this.gaTracker.trackUserJourney('app_start', 'initialization_completed', {
                version: this.version,
                load_time: Date.now() - this.analytics.startTime
            });
            
            console.log('✅ Ultimate Suite Enhanced initialized successfully');
        } catch (error) {
            console.error('❌ Initialization error:', error);
            this.errorHandler.logError(error);
            this.gaTracker.trackError('initialization_error', error.message, { version: this.version });
            this.showToast('❌ Fehler beim Laden: ' + error.message, 'danger');
            this.updatePerformanceIndicator('Error', 'error');
        }
    }

    // Enhanced Web Worker Implementation
    async initializeWebWorker() {
        if (typeof Worker !== 'undefined') {
            try {
                // Load worker script from external file
                this.worker = new Worker('js/worker-script.js');
                this.worker.onmessage = (e) => {
                    const { id, result, error, success } = e.data;
                    const callback = this.workerCallbacks.get(id);
                    
                    if (callback) {
                        this.workerCallbacks.delete(callback.timeoutId); // Clear timeout
                        this.workerCallbacks.delete(id);
                        if (success) {
                            callback.resolve(result);
                        } else {
                            this.errorHandler.logError(error);
                            callback.reject(new Error(error.message));
                        }
                    }
                };
                
                this.worker.onerror = (error) => {
                    this.errorHandler.logError({
                        type: 'Web Worker Error',
                        message: error.message,
                        filename: error.filename,
                        lineno: error.lineno
                    });
                };
                
                console.log('✅ Enhanced Web Worker initialized');
            } catch (error) {
                console.warn('⚠️ Web Worker not available, using main thread');
                this.errorHandler.logError(error);
            }
        }
    }

    // Enhanced Calculation with Worker
    async calculateInWorker(data, type = 'calculate') {
        return new Promise((resolve, reject) => {
            if (!this.worker) {
                resolve(this.calculateMainThread(data));
                return;
            }

            const id = ++this.workerMessageId;
            const timeoutId = setTimeout(() => {
                if (this.workerCallbacks.has(id)) {
                    this.workerCallbacks.delete(id);
                    reject(new Error('Calculation timeout'));
                }
            }, 10000);
            
            this.workerCallbacks.set(id, { resolve, reject, timeoutId });
            
            this.worker.postMessage({ id, data, type });
        });
    }

    // Main Thread Fallback
    calculateMainThread(data) {
        try {
            const anschaffungskosten = (data.kaufpreis || 0) + (data.nebenkosten_kauf || 0) + (data.modernisierung || 0);
            const grossProfit = (data.verkaufspreis || 0) - (data.nebenkosten_verkauf || 0) - anschaffungskosten;
            
            if (grossProfit <= 0) {
                return { grossProfit, structures: [] };
            }

            const structures = [];
            const baseTax = this.calculateSpeculationTax(grossProfit, data.haltedauer, data.steuersatz, data.kirchensteuer);

            const structureConfigs = [
                { name: 'Privatverkauf', factor: 1.0, minProfit: 0 },
                { name: 'VV GmbH & Co. KG (BFH 2025)', factor: 0.85, minProfit: 0 },
                { name: 'Familienpool (GbR)', factor: 0.75, minProfit: 50000 },
                { name: 'Share Deal (GmbH)', factor: 0.60, minProfit: 100000 },
                { name: 'Cross-Border Holding', factor: 0.45, minProfit: 500000 },
                { name: 'Familienstiftung', factor: 0.35, minProfit: 1000000 }
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
                        advantages: this.getAdvantages(config.name),
                        isBest: false
                    });
                }
            }

            structures.sort((a, b) => b.netProfit - a.netProfit);
            if (structures.length > 0) {
                structures[0].isBest = true;
            }

            return {
                grossProfit,
                structures,
                maxNetProfit: structures.length > 0 ? structures[0].netProfit : 0,
                totalSavings: structures.length > 1 ? structures[0].netProfit - structures[structures.length - 1].netProfit : 0
            };
        } catch (error) {
            this.errorHandler.logError(error);
            throw error;
        }
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
            'Privatverkauf': ['Steuerfrei nach 10 Jahren', 'Einfachste Abwicklung'],
            'VV GmbH & Co. KG (BFH 2025)': ['BFH 2025: Gewerbesteuerfrei!', 'Haftungsbeschränkung'],
            'Familienpool (GbR)': ['Steuerverteilung auf Familie', 'Progression brechen'],
            'Share Deal (GmbH)': ['40% steuerfreier Gewinn (§8b KStG)', 'Keine Grunderwerbsteuer'],
            'Cross-Border Holding': ['Internationale Steueroptimierung', 'EU-Richtlinien nutzen'],
            'Familienstiftung': ['Generationenübergreifend', 'Maximale Steueroptimierung']
        };
        return advantages[structureName] || [];
    }

    // Utility Methods
    formatCurrency(amount) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getCachedElement(id) {
        if (!this.cachedElements.has(id)) {
            this.cachedElements.set(id, document.getElementById(id));
        }
        return this.cachedElements.get(id);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    get debouncedCalculate() {
        if (!this._debouncedCalculate) {
            this._debouncedCalculate = this.debounce(() => {
                if (this.realtimeEnabled) {
                    this.calculateOptimal();
                }
            }, 500);
        }
        return this._debouncedCalculate;
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = toastId;
        
        const icons = {
            'success': '✅',
            'warning': '⚠️',
            'danger': '❌',
            'info': 'ℹ️'
        };

        toast.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${icons[type] || 'ℹ️'} ${message}</span>
                <button onclick="document.getElementById('${toastId}').remove()" 
                        style="background: none; border: none; font-size: 1.2rem; cursor: pointer;"
                        aria-label="Toast schließen">×</button>
            </div>
        `;

        container.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.getElementById(toastId)) {
                toast.style.animation = 'slideOutToast 0.3s ease forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    updatePerformanceIndicator(text, type = 'success') {
        const indicator = this.getCachedElement('performance-text');
        const indicatorContainer = document.querySelector('.performance-indicator');
        
        if (indicator) {
            indicator.textContent = text;
        }
        
        if (indicatorContainer) {
            indicatorContainer.className = `performance-indicator ${type}`;
        }
    }

    // Progress Management
    showProgress(message, percentage) {
        const overlay = document.getElementById('progress-overlay');
        const title = document.getElementById('progress-title');
        const text = document.getElementById('progress-text');
        const fill = document.getElementById('progress-fill');

        if (overlay && title && text && fill) {
            overlay.style.display = 'flex';
            title.textContent = 'KI-Berechnung läuft...';
            text.textContent = message;
            fill.style.width = percentage + '%';
            fill.setAttribute('aria-valuenow', percentage);
        }
    }

    hideProgress() {
        const overlay = document.getElementById('progress-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    cancelCalculation() {
        if (this.calculationTimeout) {
            clearTimeout(this.calculationTimeout);
        }
        this.hideProgress();
        this.showToast('⏹️ Berechnung abgebrochen', 'warning');
    }
}