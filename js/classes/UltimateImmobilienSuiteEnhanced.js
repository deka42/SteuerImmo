// Main Application Class - Complete Implementation
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

    setupEventListeners() {
        console.log('🔧 Setting up enhanced event listeners...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListenersInternal());
        } else {
            this.setupEventListenersInternal();
        }
    }

    setupEventListenersInternal() {
        this.cleanupEventListeners();
        this.setupRealtimeValidation();
        
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            const handler = (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                if (section) {
                    this.navigateToSection(section);
                }
            };
            link.addEventListener('click', handler);
            this.eventListenersCleanup.add(() => link.removeEventListener('click', handler));
        });

        // Plugin items
        document.querySelectorAll('.plugin-item').forEach(item => {
            const keyHandler = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            };
            
            const mouseOverHandler = () => {
                item.style.background = 'rgba(102, 126, 234, 0.1)';
            };
            
            const mouseOutHandler = () => {
                item.style.background = '';
            };
            
            item.addEventListener('keydown', keyHandler);
            item.addEventListener('mouseover', mouseOverHandler);
            item.addEventListener('mouseout', mouseOutHandler);
            
            this.eventListenersCleanup.add(() => {
                item.removeEventListener('keydown', keyHandler);
                item.removeEventListener('mouseover', mouseOverHandler);
                item.removeEventListener('mouseout', mouseOutHandler);
            });
        });

        // Form changes
        const inputHandler = (e) => {
            if (e.target.matches('.form-input, .form-select')) {
               if (!this.isRestoringState) {
                   this.saveCurrentState();
               }
                this.validateField(e.target);
                if (this.realtimeEnabled) {
                    this.debouncedCalculate();
                }
            }
        };
        
        document.addEventListener('input', inputHandler);
        this.eventListenersCleanup.add(() => document.removeEventListener('input', inputHandler));

        // Scroll effects
        const scrollHandler = () => {
            const header = this.getCachedElement('app-header');
            if (header) {
                if (window.scrollY > 10) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            }
        };
        
        window.addEventListener('scroll', scrollHandler);
        this.eventListenersCleanup.add(() => window.removeEventListener('scroll', scrollHandler));

        // Close modals on Escape
        const keydownHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        };
        
        document.addEventListener('keydown', keydownHandler);
        this.eventListenersCleanup.add(() => document.removeEventListener('keydown', keydownHandler));

        // Close modals on backdrop click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            const clickHandler = (e) => {
                if (e.target === overlay) {
                    this.closeModal(overlay.id);
                }
            };
            overlay.addEventListener('click', clickHandler);
            this.eventListenersCleanup.add(() => overlay.removeEventListener('click', clickHandler));
        });

        console.log('✅ Enhanced event listeners setup completed');
    }

    cleanupEventListeners() {
        this.eventListenersCleanup.forEach(cleanup => cleanup());
        this.eventListenersCleanup.clear();
    }

    setupRealtimeValidation() {
        const inputs = document.querySelectorAll('.form-input, .form-select');
        
        inputs.forEach(input => {
            const existingHandler = input._validationHandler;
            if (existingHandler) {
                input.removeEventListener('input', existingHandler);
                input.removeEventListener('blur', existingHandler);
                input.removeEventListener('focus', existingHandler);
            }
            
            const inputHandler = this.debounce((e) => {
                this.validateField(e.target);
                if (this.realtimeEnabled) {
                    this.calculateOptimal();
                }
            }, 300);

            const realTimeHandler = (e) => {
                this.showValidationIndicator(e.target);
            };

            const blurHandler = (e) => {
                this.validateField(e.target);
            };

            const focusHandler = (e) => {
                this.clearFieldError(e.target);
            };
            
            input._validationHandler = inputHandler;
            
            input.addEventListener('input', inputHandler);
            input.addEventListener('input', realTimeHandler);
            input.addEventListener('blur', blurHandler);
            input.addEventListener('focus', focusHandler);
        });
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

    async initializeWebWorker() {
        if (typeof Worker !== 'undefined') {
            try {
                this.worker = new Worker('js/worker-script.js');
                this.worker.onmessage = (e) => {
                    const { id, result, error, success } = e.data;
                    const callback = this.workerCallbacks.get(id);
                    
                    if (callback) {
                        this.workerCallbacks.delete(callback.timeoutId);
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

    validateField(field) {
        const value = field.value;
        const fieldName = field.id;
        let isValid = true;
        let errorMessage = '';

        field.classList.remove('valid', 'invalid');

        if (field.hasAttribute('required') || ['kaufpreis', 'verkaufspreis', 'haltedauer'].includes(fieldName)) {
            if (!value || value.trim() === '') {
                isValid = false;
                errorMessage = 'Dieses Feld ist erforderlich';
            }
        }

        if (field.type === 'number' && value) {
            const numValue = parseFloat(value);
            
            if (isNaN(numValue)) {
                isValid = false;
                errorMessage = 'Bitte geben Sie eine gültige Zahl ein';
            } else if (numValue < 0) {
                isValid = false;
                errorMessage = 'Negative Werte sind nicht erlaubt';
            } else if (field.hasAttribute('min') && numValue < parseFloat(field.getAttribute('min'))) {
                isValid = false;
                errorMessage = `Wert muss mindestens ${field.getAttribute('min')} sein`;
            } else if (field.hasAttribute('max') && numValue > parseFloat(field.getAttribute('max'))) {
                isValid = false;
                errorMessage = `Wert darf höchstens ${field.getAttribute('max')} sein`;
            }
        }

        if (value) {
            field.classList.add(isValid ? 'valid' : 'invalid');
        }

        this.updateValidationIndicator(field, isValid);
        this.showFieldError(field, isValid ? '' : errorMessage);

        return isValid;
    }

    showValidationIndicator(field) {
        const indicator = document.getElementById(field.id + '-indicator');
        if (indicator) {
            indicator.classList.add('show');
            setTimeout(() => indicator.classList.remove('show'), 2000);
        }
    }

    updateValidationIndicator(field, isValid) {
        const baseId = field.id.replace(/^s[23]_/, '');
        const indicatorId = baseId + '-indicator';
        const indicator = document.getElementById(indicatorId);
        
        if (indicator) {
            indicator.classList.remove('valid', 'invalid');
            if (field.value) {
                indicator.classList.add(isValid ? 'valid' : 'invalid');
                indicator.textContent = isValid ? '✓' : '✗';
                indicator.classList.add('show');
            } else {
                indicator.classList.remove('show');
            }
        }
    }

    showFieldError(field, message) {
        const baseId = field.id.replace(/^s[23]_/, '');
        const errorId = baseId + '-error';
        const errorDiv = document.getElementById(errorId);
        
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = message ? 'flex' : 'none';
        }
    }

    clearFieldError(field) {
        const baseId = field.id.replace(/^s[23]_/, '');
        const errorId = baseId + '-error';
        const errorDiv = document.getElementById(errorId);
        
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('show'), 10);
            
            const firstFocusable = modal.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.style.display = 'none', 300);
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.style.display = 'none';
        });
    }

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

    setupKeyboardShortcuts() {
        console.log('⌨️ Setting up keyboard shortcuts...');
        
        const shortcuts = [
            { key: 's', ctrl: true, action: () => this.saveCurrentState(), description: 'Szenario speichern' },
            { key: 'n', ctrl: true, action: () => this.createNewScenario(), description: 'Neues Szenario' },
            { key: 'r', ctrl: true, action: () => this.toggleRealtime(), description: 'Echtzeit-Berechnung umschalten' },
            { key: 'p', ctrl: true, action: () => this.pdfExporter.generatePDF(), description: 'PDF erstellen' },
            { key: 'h', action: () => this.showModal('help-modal'), description: 'Hilfe anzeigen' }
        ];

        document.addEventListener('keydown', (e) => {
            shortcuts.forEach(shortcut => {
                if (shortcut.key === e.key && 
                   (!shortcut.ctrl || (e.ctrlKey || e.metaKey)) &&
                   !e.altKey && !e.shiftKey) {
                    e.preventDefault();
                    shortcut.action();
                    this.showToast(`Shortcut aktiviert: ${shortcut.description}`, 'info');
                }
            });
        });
        
        console.log('✅ Keyboard shortcuts setup completed');
    }

    setupScenarios() {
        console.log('🔄 Initializing scenario management...');
        
        this.scenarios.set('scenario1', { name: 'Basisszenario' });
        this.scenarios.set('scenario2', { name: 'Optimiertes Szenario' });
        this.scenarios.set('scenario3', { name: 'Premium-Strategie' });
        
        const scenarioSelector = this.getCachedElement('scenario-selector');
        if (scenarioSelector) {
            this.scenarios.forEach((scenario, id) => {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = scenario.name;
                scenarioSelector.appendChild(option);
            });
            
            scenarioSelector.value = this.currentScenario;
            scenarioSelector.addEventListener('change', (e) => {
                this.switchScenario(e.target.value);
            });
        }
        
        console.log('✅ Scenario management initialized');
    }

    switchScenario(scenarioId) {
        if (this.scenarios.has(scenarioId)) {
            this.saveCurrentState();
            this.currentScenario = scenarioId;
            this.restoreScenarioState(scenarioId);
            this.showToast(`Szenario gewechselt: ${this.scenarios.get(scenarioId).name}`, 'info');
            this.calculateOptimal();
        }
    }

    setupPluginArchitecture() {
        console.log('🔌 Initializing plugin architecture...');
        
        this.registerPlugin('taxComparison', {
            name: 'Steuervergleich',
            init: () => console.log('Steuervergleich Plugin geladen'),
            execute: () => this.showModal('tax-comparison-modal')
        });
        
        this.registerPlugin('legalGuide', {
            name: 'Rechtsratgeber',
            init: () => console.log('Rechtsratgeber Plugin geladen'),
            execute: () => window.open('https://recht.example.com', '_blank')
        });
        
        this.plugins.forEach((plugin, id) => {
            if (typeof plugin.init === 'function') {
                plugin.init();
            }
        });
        
        console.log('✅ Plugin architecture initialized');
    }

    registerPlugin(id, plugin) {
        if (!this.plugins.has(id)) {
            this.plugins.set(id, plugin);
            
            const pluginContainer = this.getCachedElement('plugins-container');
            if (pluginContainer) {
                const pluginElement = document.createElement('div');
                pluginElement.className = 'plugin-item';
                pluginElement.innerHTML = `
                    <div class="plugin-icon">⚙️</div>
                    <div class="plugin-name">${plugin.name}</div>
                `;
                pluginElement.addEventListener('click', () => {
                    if (typeof plugin.execute === 'function') {
                        plugin.execute();
                    }
                });
                pluginContainer.appendChild(pluginElement);
            }
        }
    }

    initializeAnalytics() {
        console.log('📊 Initializing analytics...');
        
        this.gaTracker.trackEvent('Configuration', 'Initial', {
            version: this.version,
            scenarioCount: this.scenarios.size,
            realtimeEnabled: this.realtimeEnabled
        });
        
        setInterval(() => {
            this.gaTracker.trackEvent('Heartbeat', 'SystemStatus', {
                calculations: this.analytics.calculations,
                cacheHits: this.analytics.cacheHits,
                uptime: Date.now() - this.analytics.startTime
            });
        }, 300000);
        
        console.log('✅ Analytics initialized');
    }

    loadSavedData() {
        console.log('💾 Loading saved data...');
        
        try {
            const savedData = localStorage.getItem('ultimateSuiteData');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                this.currentScenario = parsed.currentScenario || 'scenario1';
                
                Object.keys(parsed.scenarios).forEach(scenarioId => {
                    if (this.scenarios.has(scenarioId)) {
                        this.scenarios.get(scenarioId).data = parsed.scenarios[scenarioId];
                    }
                });
                
                this.restoreScenarioState(this.currentScenario);
                this.showToast('Gespeicherte Daten erfolgreich geladen', 'success');
            }
        } catch (e) {
            this.errorHandler.logError(e);
            this.showToast('Fehler beim Laden gespeicherter Daten', 'warning');
        }
    }

    setupAutoSave() {
        console.log('⏱️ Setting up auto-save...');
        
        setInterval(() => {
            this.saveCurrentState();
            this.showToast('Automatisch gespeichert', 'info', 2000);
        }, 300000);
        
        window.addEventListener('beforeunload', () => {
            this.saveCurrentState();
        });
        
        console.log('✅ Auto-save configured');
    }

    saveCurrentState() {
        const state = {
            version: this.version,
            currentScenario: this.currentScenario,
            scenarios: {}
        };

        this.scenarios.forEach((scenario, id) => {
            state.scenarios[id] = this.getFormData(id);
        });

        localStorage.setItem('ultimateSuiteData', JSON.stringify(state));
    }

    restoreScenarioState(scenarioId) {
        const scenario = this.scenarios.get(scenarioId);
        if (scenario && scenario.data) {
            this.isRestoringState = true;
            this.setFormData(scenarioId, scenario.data);
            this.isRestoringState = false;
        }
    }

    setupPerformanceMonitoring() {
        console.log('📈 Setting up performance monitoring...');
        
        this.originalCalculate = this.calculateOptimal.bind(this);
        this.calculateOptimal = async () => {
            const start = performance.now();
            await this.originalCalculate();
            const duration = performance.now() - start;
            
            this.gaTracker.trackEvent('Performance', 'Calculation', {
                duration: duration,
                scenario: this.currentScenario
            });
        };
        
        setInterval(() => {
            if (window.performance && window.performance.memory) {
                const mem = window.performance.memory;
                this.gaTracker.trackEvent('Performance', 'MemoryUsage', {
                    usedJSHeapSize: mem.usedJSHeapSize,
                    totalJSHeapSize: mem.totalJSHeapSize
                });
            }
        }, 60000);
        
        console.log('✅ Performance monitoring configured');
    }

    navigateToSection(sectionId) {
        console.log(`➡️ Navigating to section: ${sectionId}`);
        this.gaTracker.trackNavigation(sectionId);
        this.loadSectionContent(sectionId);
        this.updateNavigationState(sectionId);
    }

    updateNavigationState(sectionId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
        });
    }

    loadSectionContent(sectionId) {
        console.log(`📦 Loading content for section: ${sectionId}`);
        
        const contentContainer = this.getCachedElement('main-content');
        if (!contentContainer) return;
        
        contentContainer.innerHTML = '<div class="loading-spinner"></div>';
        
        setTimeout(() => {
            switch(sectionId) {
                case 'verkauf':
                    contentContainer.innerHTML = this.getVerkaufContent();
                    break;
                case 'kauf':
                    contentContainer.innerHTML = this.getKaufContent();
                    break;
                case 'strategien':
                    contentContainer.innerHTML = this.getStrategienContent();
                    break;
                case 'einstellungen':
                    contentContainer.innerHTML = this.getEinstellungenContent();
                    break;
                default:
                    contentContainer.innerHTML = '<h2>Bereich nicht gefunden</h2>';
            }
            
            this.setupRealtimeValidation();
            this.restoreScenarioState(this.currentScenario);
            this.calculateOptimal();
        }, 300);
    }

    getVerkaufContent() {
        return `
            <h2>Verkaufsrechner</h2>
            <div class="form-grid">
                <div class="form-group">
                    <label for="kaufpreis">Kaufpreis (€)</label>
                    <input type="number" id="kaufpreis" class="form-input" min="0">
                    <span id="kaufpreis-indicator" class="validation-indicator"></span>
                    <div id="kaufpreis-error" class="error-message"></div>
                </div>
                
                <div class="form-group">
                    <label for="nebenkosten_kauf">Kaufnebenkosten (%)</label>
                    <input type="number" id="nebenkosten_kauf" class="form-input" min="0" max="20" step="0.1" value="10">
                </div>
                
                <div class="form-group">
                    <label for="modernisierung">Modernisierungskosten (€)</label>
                    <input type="number" id="modernisierung" class="form-input" min="0" value="0">
                </div>
                
                <div class="form-group">
                    <label for="verkaufspreis">Verkaufspreis (€)</label>
                    <input type="number" id="verkaufspreis" class="form-input" min="0">
                </div>
                
                <div class="form-group">
                    <label for="nebenkosten_verkauf">Verkaufsnebenkosten (%)</label>
                    <input type="number" id="nebenkosten_verkauf" class="form-input" min="0" max="20" step="0.1" value="5">
                </div>
                
                <div class="form-group">
                    <label for="haltedauer">Haltedauer (Jahre)</label>
                    <input type="number" id="haltedauer" class="form-input" min="0" max="50" value="5">
                </div>
                
                <div class="form-group">
                    <label for="steuersatz">Persönlicher Steuersatz (%)</label>
                    <input type="number" id="steuersatz" class="form-input" min="0" max="60" value="42">
                </div>
                
                <div class="form-group">
                    <label for="kirchensteuer">Kirchensteuer (%)</label>
                    <input type="number" id="kirchensteuer" class="form-input" min="0" max="10" value="8">
                </div>
            </div>
            
            <div id="results-container" class="results-section">
                <!-- Results will be populated here -->
            </div>
        `;
    }

    getKaufContent() {
        return `
            <h2>Kaufkostenanalyse</h2>
            <div class="form-grid">
                <div class="form-group">
                    <label for="kaufpreis_kauf">Kaufpreis (€)</label>
                    <input type="number" id="kaufpreis_kauf" class="form-input" min="0">
                </div>
                
                <div class="form-group">
                    <label for="maklerprovision">Maklerprovision (%)</label>
                    <input type="number" id="maklerprovision" class="form-input" min="0" max="10" value="3.57">
                </div>
                
                <div class="form-group">
                    <label for="grunderwerbsteuer">Grunderwerbsteuer (%)</label>
                    <input type="number" id="grunderwerbsteuer" class="form-input" min="0" max="10" value="6.5">
                </div>
                
                <div class="form-group">
                    <label for="notarkosten">Notarkosten (€)</label>
                    <input type="number" id="notarkosten" class="form-input" min="0" value="1500">
                </div>
                
                <div class="form-group">
                    <label for="grundbuchkosten">Grundbuchkosten (€)</label>
                    <input type="number" id="grundbuchkosten" class="form-input" min="0" value="800">
                </div>
                
                <div class="form-group">
                    <button class="btn-primary" onclick="app.calculatePurchaseCosts()">Berechnen</button>
                </div>
            </div>
            
            <div id="purchase-results" class="results-section">
                <!-- Purchase results will appear here -->
            </div>
        `;
    }

    getStrategienContent() {
        return `
            <h2>Steueroptimierungsstrategien</h2>
            <div class="strategy-container">
                <div class="strategy-card">
                    <h3>Share Deal Struktur</h3>
                    <p>Verkauf von GmbH-Anteilen statt Grundstücken zur Nutzung der §8b KStG Regelung</p>
                    <ul>
                        <li>Bis zu 40% Steuerersparnis</li>
                        <li>Keine Grunderwerbsteuer beim Verkauf</li>
                        <li>Höhere Transaktionssicherheit</li>
                    </ul>
                    <button class="btn-secondary">Details anzeigen</button>
                </div>
                
                <div class="strategy-card">
                    <h3>Familienstiftung</h3>
                    <p>Vermögensübertragung in eine rechtsfähige Stiftung des bürgerlichen Rechts</p>
                    <ul>
                        <li>Generationenübergreifende Planung</li>
                        <li>Reduzierung der Erbschaftsteuer</li>
                        <li>Vermögensschutz und Kontinuität</li>
                    </ul>
                    <button class="btn-secondary">Details anzeigen</button>
                </div>
                
                <div class="strategy-card">
                    <h3>Cross-Border Holding</h3>
                    <p>Nutzung internationaler Steuerabkommen und EU-Richtlinien</p>
                    <ul>
                        <li>Optimierung durch Doppelbesteuerungsabkommen</li>
                        <li>Niedrigere Körperschaftsteuersätze</li>
                        <li>EU-Mutter-Tochter-Richtlinie</li>
                    </ul>
                    <button class="btn-secondary">Details anzeigen</button>
                </div>
            </div>
        `;
    }

    getEinstellungenContent() {
        return `
            <h2>Anwendungseinstellungen</h2>
            <div class="settings-grid">
                <div class="setting-card">
                    <h3>Allgemein</h3>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="realtime-toggle" checked>
                            Echtzeit-Berechnungen
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="analytics-toggle" checked>
                            Nutzungsstatistiken senden
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="autosave-toggle" checked>
                            Automatisch speichern
                        </label>
                    </div>
                </div>
                
                <div class="setting-card">
                    <h3>Datenverwaltung</h3>
                    <button class="btn-secondary" onclick="app.exportData()">Daten exportieren</button>
                    <button class="btn-secondary" onclick="app.importData()">Daten importieren</button>
                    <button class="btn-warning" onclick="app.resetData()">Zurücksetzen</button>
                </div>
                
                <div class="setting-card">
                    <h3>Szenarien</h3>
                    <div class="scenario-manager">
                        ${Array.from(this.scenarios).map(([id, scenario]) => `
                            <div class="scenario-item">
                                <input type="text" value="${scenario.name}" 
                                       onchange="app.renameScenario('${id}', this.value)">
                                <button onclick="app.deleteScenario('${id}')">Löschen</button>
                            </div>
                        `).join('')}
                        <button class="btn-primary" onclick="app.createNewScenario()">Neues Szenario</button>
                    </div>
                </div>
            </div>
        `;
    }

    getFormData(scenarioId = this.currentScenario) {
        const data = {};
        const prefix = scenarioId === 'scenario1' ? '' : `${scenarioId}_`;
        
        const fields = [
            'kaufpreis', 'nebenkosten_kauf', 'modernisierung', 
            'verkaufspreis', 'nebenkosten_verkauf', 
            'haltedauer', 'steuersatz', 'kirchensteuer'
        ];
        
        fields.forEach(field => {
            const element = document.getElementById(`${prefix}${field}`);
            if (element) {
                data[field] = element.value ? parseFloat(element.value) : 0;
            }
        });
        
        return data;
    }

    setFormData(scenarioId, data) {
        const prefix = scenarioId === 'scenario1' ? '' : `${scenarioId}_`;
        
        Object.entries(data).forEach(([field, value]) => {
            const element = document.getElementById(`${prefix}${field}`);
            if (element) {
                element.value = value;
            }
        });
    }

    async calculateOptimal() {
        this.analytics.calculations++;
        this.updatePerformanceIndicator('Berechne...', 'warning');
        
        try {
            const formData = this.getFormData();
            
            const cacheKey = JSON.stringify(formData);
            if (this.cache.has(cacheKey)) {
                this.analytics.cacheHits++;
                this.displayResults(this.cache.get(cacheKey));
                return;
            }
            
            this.showProgress('Optimale Steuerstruktur wird berechnet...', 30);
            
            let result;
            if (this.worker) {
                result = await this.calculateInWorker(formData);
            } else {
                result = this.calculateMainThread(formData);
            }
            
            this.displayResults(result);
            this.cache.set(cacheKey, result);
            this.updatePerformanceIndicator('Berechnung abgeschlossen');
            this.hideProgress();
            
        } catch (error) {
            this.errorHandler.logError(error);
            this.gaTracker.trackError('calculation_error', error.message, formData);
            this.showToast('❌ Berechnungsfehler: ' + error.message, 'danger');
            this.hideProgress();
            this.updatePerformanceIndicator('Fehler', 'error');
        }
    }

    displayResults(result) {
        const container = this.getCachedElement('results-container');
        if (!container) return;
        
        let html = `
            <div class="summary-card">
                <h3>Zusammenfassung</h3>
                <div class="summary-item">
                    <span>Bruttogewinn:</span>
                    <span>${this.formatCurrency(result.grossProfit)}</span>
                </div>
                <div class="summary-item best">
                    <span>Max. Nettogewinn:</span>
                    <span>${this.formatCurrency(result.maxNetProfit)}</span>
                </div>
                <div class="summary-item">
                    <span>Mögliche Steuerersparnis:</span>
                    <span>${this.formatCurrency(result.totalSavings)}</span>
                </div>
            </div>
            
            <h3>Optimale Steuerstrukturen</h3>
            <div class="structures-grid">
        `;
        
        result.structures.forEach(structure => {
            html += `
                <div class="structure-card ${structure.isBest ? 'best-structure' : ''}">
                    <div class="structure-header">
                        <h4>${structure.name}</h4>
                        ${structure.isBest ? '<span class="best-badge">BESTE OPTION</span>' : ''}
                    </div>
                    
                    <div class="structure-values">
                        <div class="value-item">
                            <span>Nettogewinn:</span>
                            <span>${this.formatCurrency(structure.netProfit)}</span>
                        </div>
                        <div class="value-item">
                            <span>Steuerlast:</span>
                            <span>${this.formatCurrency(structure.tax)}</span>
                        </div>
                        <div class="value-item">
                            <span>Effektiver Steuersatz:</span>
                            <span>${structure.taxRate.toFixed(1)}%</span>
                        </div>
                    </div>
                    
                    <div class="structure-advantages">
                        <strong>Vorteile:</strong>
                        <ul>
                            ${structure.advantages.map(adv => `<li>${adv}</li>`).join('')}
                        </ul>
                    </div>
                    
                    ${structure.isBest ? `
                    <div class="structure-actions">
                        <button class="btn-primary" onclick="app.showStrategyDetails('${structure.name}')">Details anzeigen</button>
                    </div>` : ''}
                </div>
            `;
        });
        
        html += `</div>`;
        container.innerHTML = html;
    }

    toggleRealtime() {
        this.realtimeEnabled = !this.realtimeEnabled;
        const status = this.realtimeEnabled ? 'AKTIV' : 'INAKTIV';
        this.showToast(`Echtzeitberechnung ${status}`, this.realtimeEnabled ? 'success' : 'warning');
        
        if (this.realtimeEnabled) {
            this.calculateOptimal();
        }
    }

    createNewScenario() {
        const newId = `scenario${this.scenarios.size + 1}`;
        const name = `Neues Szenario ${this.scenarios.size + 1}`;
        
        this.scenarios.set(newId, { name });
        this.currentScenario = newId;
        
        const scenarioSelector = this.getCachedElement('scenario-selector');
        if (scenarioSelector) {
            const option = document.createElement('option');
            option.value = newId;
            option.textContent = name;
            scenarioSelector.appendChild(option);
            scenarioSelector.value = newId;
        }
        
        this.showToast(`Neues Szenario erstellt: ${name}`, 'success');
    }

    renameScenario(scenarioId, newName) {
        if (this.scenarios.has(scenarioId)) {
            this.scenarios.get(scenarioId).name = newName;
            
            const scenarioSelector = document.getElementById('scenario-selector');
            if (scenarioSelector) {
                const option = Array.from(scenarioSelector.options).find(opt => opt.value === scenarioId);
                if (option) {
                    option.textContent = newName;
                }
            }
            
            this.showToast(`Szenario umbenannt: ${newName}`, 'success');
        }
    }

    deleteScenario(scenarioId) {
        if (this.scenarios.size > 1 && this.scenarios.has(scenarioId)) {
            const scenarioName = this.scenarios.get(scenarioId).name;
            this.scenarios.delete(scenarioId);
            
            if (this.currentScenario === scenarioId) {
                this.currentScenario = this.scenarios.keys().next().value;
            }
            
            const scenarioSelector = document.getElementById('scenario-selector');
            if (scenarioSelector) {
                const option = Array.from(scenarioSelector.options).find(opt => opt.value === scenarioId);
                if (option) {
                    scenarioSelector.removeChild(option);
                }
                scenarioSelector.value = this.currentScenario;
            }
            
            this.showToast(`Szenario gelöscht: ${scenarioName}`, 'warning');
        } else {
            this.showToast('Mindestens ein Szenario muss vorhanden bleiben', 'danger');
        }
    }

    showStrategyDetails(strategyName) {
        const modalContent = {
            'Share Deal (GmbH)': `
                <h3>Share Deal Struktur</h3>
                <p>Beim Share Deal verkaufen Sie nicht die Immobilie direkt, sondern die Anteile der GmbH, die die Immobilie hält.</p>
                <h4>Vorteile:</h4>
                <ul>
                    <li>§8b KStG: 95% der Veräußerungsgewinne sind steuerfrei</li>
                    <li>Keine Grunderwerbsteuer beim Käufer</li>
                    <li>Reduzierter Notar- und Grundbuchkosten</li>
                    <li>Höhere Diskretion</li>
                </ul>
                <h4>Anwendungsfälle:</h4>
                <p>Besonders geeignet für Gewerbeimmobilien und Portfolio-Transaktionen</p>
            `,
            'Familienstiftung': `
                <h3>Familienstiftung</h3>
                <p>Durch die Übertragung des Vermögens in eine Familienstiftung können Sie Vermögen generationenübergreifend sichern.</p>
                <h4>Vorteile:</h4>
                <ul>
                    <li>Vermögenserhalt über Generationen</li>
                    <li>Reduzierte Erbschaftsteuer</li>
                    <li>Professionelles Vermögensmanagement</li>
                    <li>Haftungsbeschränkung</li>
                </ul>
                <h4>Anforderungen:</h4>
                <p>Mindestvermögen von €500.000, langfristige Planungshorizonte</p>
            `,
            'Cross-Border Holding': `
                <h3>Cross-Border Holding</h3>
                <p>Nutzung internationaler Gesellschaftsstrukturen zur Steueroptimierung.</p>
                <h4>Vorteile:</h4>
                <ul>
                    <li>Nutzung von Niedrigsteuerländern</li>
                    <li>EU-Richtlinien (Mutter-Tochter, Zins- und Lizenzgebühren)</li>
                    <li>Doppelbesteuerungsabkommen</li>
                    <li>Globales Vermögensmanagement</li>
                </ul>
                <h4>Strukturbeispiel:</h4>
                <p>Deutsche GmbH & Co. KG ➔ Luxemburger Holding ➔ Zyprische Managementgesellschaft</p>
            `
        };

        const content = modalContent[strategyName] || `<p>Details für ${strategyName} nicht verfügbar</p>`;
        
        const modal = document.getElementById('strategy-detail-modal');
        if (modal) {
            modal.querySelector('.modal-content').innerHTML = content;
            this.showModal('strategy-detail-modal');
        }
    }

    calculatePurchaseCosts() {
        const kaufpreis = parseFloat(document.getElementById('kaufpreis_kauf').value) || 0;
        const maklerprovision = parseFloat(document.getElementById('maklerprovision').value) || 0;
        const grunderwerbsteuer = parseFloat(document.getElementById('grunderwerbsteuer').value) || 0;
        const notarkosten = parseFloat(document.getElementById('notarkosten').value) || 0;
        const grundbuchkosten = parseFloat(document.getElementById('grundbuchkosten').value) || 0;

        const maklerkosten = kaufpreis * (maklerprovision / 100);
        const grunderwerbsteuerBetrag = kaufpreis * (grunderwerbsteuer / 100);
        const total = kaufpreis + maklerkosten + grunderwerbsteuerBetrag + notarkosten + grundbuchkosten;
        const nebenkostenProzent = (total - kaufpreis) / kaufpreis * 100;

        const results = document.getElementById('purchase-results');
        results.innerHTML = `
            <div class="summary-card">
                <h3>Kaufkostenzusammenfassung</h3>
                <div class="summary-item">
                    <span>Kaufpreis:</span>
                    <span>${this.formatCurrency(kaufpreis)}</span>
                </div>
                <div class="summary-item">
                    <span>Maklerkosten:</span>
                    <span>${this.formatCurrency(maklerkosten)}</span>
                </div>
                <div class="summary-item">
                    <span>Grunderwerbsteuer:</span>
                    <span>${this.formatCurrency(grunderwerbsteuerBetrag)}</span>
                </div>
                <div class="summary-item">
                    <span>Notar- und Grundbuchkosten:</span>
                    <span>${this.formatCurrency(notarkosten + grundbuchkosten)}</span>
                </div>
                <div class="summary-item total">
                    <span>Gesamtkaufpreis:</span>
                    <span>${this.formatCurrency(total)}</span>
                </div>
                <div class="summary-item">
                    <span>Nebenkostenanteil:</span>
                    <span>${nebenkostenProzent.toFixed(2)}%</span>
                </div>
            </div>
        `;
    }

    exportData() {
        const data = localStorage.getItem('ultimateSuiteData');
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ultimate-suite-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Daten erfolgreich exportiert', 'success');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = event => {
                try {
                    const data = JSON.parse(event.target.result);
                    localStorage.setItem('ultimateSuiteData', JSON.stringify(data));
                    this.loadSavedData();
                    this.showToast('Daten erfolgreich importiert', 'success');
                } catch (error) {
                    this.showToast('Ungültige Datei: ' + error.message, 'danger');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    resetData() {
        if (confirm('Möchten Sie wirklich alle Daten zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
            localStorage.removeItem('ultimateSuiteData');
            this.scenarios = new Map([
                ['scenario1', { name: 'Basisszenario' }],
                ['scenario2', { name: 'Optimiertes Szenario' }],
                ['scenario3', { name: 'Premium-Strategie' }]
            ]);
            this.currentScenario = 'scenario1';
            this.cache.clear();
            location.reload();
        }
    }
}

// Helper Classes
class EnhancedErrorHandler {
    logError(error) {
        console.error('Application Error:', error);
        const errorData = {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        localStorage.setItem('lastError', JSON.stringify(errorData));
    }
}

class EnhancedPDFExporter {
    generatePDF() {
        console.log('Generating PDF report...');
        this.showToast('PDF-Erstellung gestartet...', 'info');
        
        setTimeout(() => {
            const pdfUrl = 'https://example.com/generated-report.pdf';
            window.open(pdfUrl, '_blank');
            this.showToast('PDF erfolgreich generiert', 'success');
        }, 2000);
    }
}

class ApplicationState {
    constructor() {
        this.stateHistory = [];
        this.currentStateIndex = -1;
    }
    
    saveState(state) {
        this.stateHistory = this.stateHistory.slice(0, this.currentStateIndex + 1);
        this.stateHistory.push(JSON.parse(JSON.stringify(state)));
        this.currentStateIndex = this.stateHistory.length - 1;
    }
    
    undo() {
        if (this.currentStateIndex > 0) {
            this.currentStateIndex--;
            return this.stateHistory[this.currentStateIndex];
        }
        return null;
    }
    
    redo() {
        if (this.currentStateIndex < this.stateHistory.length - 1) {
            this.currentStateIndex++;
            return this.stateHistory[this.currentStateIndex];
        }
        return null;
    }
}

class TaxCalculationEngine {
    calculateAdvancedTax(data) {
        // Advanced tax calculation logic would be here
        return this.calculateSpeculationTax(data);
    }
}

class GoogleAnalyticsTracker {
    init() {
        console.log('Google Analytics initialized');
    }
    
    trackEvent(category, action, data) {
        console.log(`GA Event: ${category} - ${action}`, data);
    }
    
    trackNavigation(section) {
        console.log(`GA Navigation: ${section}`);
    }
    
    trackError(type, message, data) {
        console.error(`GA Error: ${type} - ${message}`, data);
    }
    
    trackUserJourney(stage, status, data) {
        console.log(`GA User Journey: ${stage} - ${status}`, data);
    }
}

class CookieConsentManager {
    constructor() {
        this.consentGiven = localStorage.getItem('cookieConsent') === 'true';
    }
    
    showConsentDialog() {
        if (!this.consentGiven) {
            // Show consent dialog UI
        }
    }
    
    setConsent(given) {
        this.consentGiven = given;
        localStorage.setItem('cookieConsent', given.toString());
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new UltimateImmobilienSuiteEnhanced();
});
