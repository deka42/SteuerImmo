// Ultimate Immobilien Suite Enhanced - Main Application Class
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
        this.sectionData = {};
        this.cachedElements = new Map();
        this.eventListenersCleanup = new Set();
        this.isDarkMode = false;
        
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
            this.detectDarkModePreference();
            
            this.gaTracker.init();
            this.loadSectionContent('verkauf');
            
            this.showToast('🚀 Ultimate Enterprise Suite Enhanced geladen', 'success');
            this.updatePerformanceIndicator('Ready');
            
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

    // Dark Mode Support
    detectDarkModePreference() {
        const savedPreference = localStorage.getItem('dark-mode-preference');
        const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        this.isDarkMode = savedPreference ? savedPreference === 'true' : systemPreference;
        
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        }
        
        this.updateDarkModeToggle();
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        
        localStorage.setItem('dark-mode-preference', this.isDarkMode.toString());
        this.updateDarkModeToggle();
        
        this.showToast(`🌙 ${this.isDarkMode ? 'Dark Mode aktiviert' : 'Light Mode aktiviert'}`, 'info');
        
        this.gaTracker.trackFeatureUsage('dark_mode', this.isDarkMode ? 'enabled' : 'disabled');
    }

    updateDarkModeToggle() {
        const toggle = document.querySelector('.dark-mode-toggle');
        if (toggle) {
            toggle.textContent = this.isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
        }
    }

    // Enhanced form data collection with better error handling
    collectFormData() {
        const data = {};
        const prefix = this.getScenarioPrefix(this.currentScenario);
        const contentSelector = `#${this.currentScenario}-content`;
        const inputs = document.querySelectorAll(`${contentSelector} .form-input, ${contentSelector} .form-select`);
        
        inputs.forEach(input => {
            let fieldName = input.id;
            if (prefix && fieldName.startsWith(prefix)) {
                fieldName = fieldName.substring(prefix.length);
            }
            
            if (input.type === 'number') {
                data[fieldName] = parseFloat(input.value) || 0;
            } else if (input.type === 'checkbox') {
                data[fieldName] = input.checked;
            } else {
                data[fieldName] = input.value || '';
            }
        });

        return data;
    }

    // Enhanced form population
    populateForm(data) {
        const prefix = this.getScenarioPrefix(this.currentScenario);
        
        Object.keys(data).forEach(key => {
            const elementId = prefix + key;
            const element = document.getElementById(elementId);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = data[key];
                } else {
                    element.value = data[key];
                }
                
                if (!this.isRestoringState) {
                    this.validateField(element);
                }
            }
        });
    }

    // Enhanced reset methods
    resetGrundsteuerForm() {
        const inputs = document.querySelectorAll('#grundstuecksflaeche, #wohnflaeche, #baujahr, #grundsteuer_immobilientyp, #grundsteuer_bundesland, #hebesatz_grundsteuer');
        
        inputs.forEach(input => {
            if (input.type === 'number') {
                input.value = '';
            } else if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
            }
            input.classList.remove('valid', 'invalid');
        });

        document.getElementById('grundsteuer-results').innerHTML = '';
        this.sectionData.grundsteuer = {};
        this.showToast('🔄 Grundsteuer-Formular zurückgesetzt', 'info');
    }

    resetErbschaftForm() {
        const inputs = document.querySelectorAll('#erbschaft_immobilienwert, #verwandtschaftsgrad, #erbschaft_immobilienart, #sonstiges_vermoegen, #selbstnutzung_erbe, #lebzeitige_uebertragung');
        
        inputs.forEach(input => {
            if (input.type === 'number') {
                input.value = '';
            } else if (input.type === 'checkbox') {
                input.checked = false;
            } else if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
            }
            input.classList.remove('valid', 'invalid');
        });

        document.getElementById('erbschaft-results').innerHTML = '';
        this.sectionData.erbschaft = {};
        this.sectionData.erbschaftResults = null;
        this.showToast('🔄 Erbschaftsteuer-Formular zurückgesetzt', 'info');
    }

    resetSchenkungForm() {
        const inputs = document.querySelectorAll('#schenkung_immobilienwert, #beschenkter, #vorherige_schenkungen, #schenkungsart, #schenkungsanteil, #niesbrauchswert, #alter_schenker, #schenkungsstrategie');
        
        inputs.forEach(input => {
            if (input.type === 'number') {
                input.value = '';
            } else if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
            }
            input.classList.remove('valid', 'invalid');
        });

        document.getElementById('schenkung-results').innerHTML = '';
        this.sectionData.schenkung = {};
        this.showToast('🔄 Schenkungssteuer-Formular zurückgesetzt', 'info');
    }

    resetCashflowForm() {
        const inputs = document.querySelectorAll('#mieteinnahmen, #betriebskosten, #finanzierungskosten, #cashflow_abschreibungen, #cashflow_steuersatz, #analysezeitraum, #mietsteigerung, #verkaufserloes, #reinvestition');
        
        inputs.forEach(input => {
            if (input.type === 'number') {
                input.value = '';
            } else if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
            }
            input.classList.remove('valid', 'invalid');
        });

        document.getElementById('cashflow-results').innerHTML = '';
        this.sectionData.cashflow = {};
        this.showToast('🔄 Cash-Flow Formular zurückgesetzt', 'info');
    }

    resetStrategyForm() {
        const inputs = document.querySelectorAll('#portfolio_anzahl, #portfolio_wert, #strategisches_ziel, #planungshorizont, #familiensituation, #jahreseinkommen, #international, #risikobereitschaft');
        
        inputs.forEach(input => {
            if (input.type === 'number') {
                input.value = '';
            } else if (input.type === 'checkbox') {
                input.checked = false;
            } else if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
            }
            input.classList.remove('valid', 'invalid');
        });

        document.getElementById('strategy-results').innerHTML = '';
        this.sectionData.strategie = {};
        this.showToast('🔄 Strategie-Formular zurückgesetzt', 'info');
    }

    // Utility methods
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

    getScenarioPrefix(scenarioId) {
        switch(scenarioId) {
            case 'scenario1': return '';
            case 'scenario2': return 's2_';
            case 'scenario3': return 's3_';
            default: return '';
        }
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

    // Placeholder methods for missing functionality
    async initializeWebWorker() {
        console.log('Web Worker initialization placeholder');
    }

    setupEventListeners() {
        console.log('Setting up event listeners');
    }

    setupKeyboardShortcuts() {
        console.log('Setting up keyboard shortcuts');
    }

    setupScenarios() {
        console.log('Setting up scenarios');
    }

    setupPluginArchitecture() {
        console.log('Setting up plugin architecture');
    }

    initializeAnalytics() {
        console.log('Initializing analytics');
    }

    loadSavedData() {
        console.log('Loading saved data');
    }

    setupAutoSave() {
        console.log('Setting up auto-save');
    }

    setupPerformanceMonitoring() {
        console.log('Setting up performance monitoring');
    }

    showToast(message, type = 'info') {
        console.log(`Toast: ${message} (${type})`);
    }

    updatePerformanceIndicator(text, type = 'success') {
        console.log(`Performance: ${text} (${type})`);
    }

    showProgress(message, percentage) {
        console.log(`Progress: ${message} (${percentage}%)`);
    }

    hideProgress() {
        console.log('Hiding progress');
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UltimateImmobilienSuiteEnhanced;
}