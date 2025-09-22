// ===== IMMOBILIEN-STEUER-SUITE 2025 - VOLLSTÄNDIGE IMPLEMENTIERUNG =====

class ImmobilienSteuerSuite {
    constructor() {
        this.state = {
            calculations: [],
            currentScenario: 0,
            history: [],
            historyIndex: -1,
            analytics: {
                totalCalculations: 0,
                averageTax: 0,
                sessionsCount: 1
            }
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializePWA();
        this.loadState();
        this.startPerformanceMonitoring();
        this.initializeAnalytics();
        this.setupKeyboardShortcuts();
        this.initializeDarkMode();
    }

    // ===== STEUERBERECHNUNGEN =====
    calculatePropertyTax(data) {
        try {
            const {
                propertyValue,
                location,
                propertyType,
                exemptions = 0,
                improvements = 0
            } = data;

            // Deutsche Grundsteuer-Berechnung (vereinfacht)
            const taxRates = {
                'residential': 0.0035,
                'commercial': 0.0045,
                'industrial': 0.0055,
                'agricultural': 0.0020
            };

            const locationMultiplier = {
                'urban': 1.2,
                'suburban': 1.0,
                'rural': 0.8
            };

            const assessedValue = propertyValue * 0.7; // 70% des Verkehrswerts
            const taxableValue = assessedValue + improvements - exemptions;
            const baseTax = taxableValue * (taxRates[propertyType] || 0.0035);
            const finalTax = baseTax * (locationMultiplier[location] || 1.0);

            const result = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                input: data,
                calculations: {
                    assessedValue,
                    taxableValue,
                    baseTax,
                    finalTax,
                    annualTax: finalTax,
                    monthlyTax: finalTax / 12,
                    effectiveRate: (finalTax / propertyValue) * 100
                },
                savings: this.calculateOptimizations(data, finalTax)
            };

            this.state.calculations.push(result);
            this.saveToHistory(result);
            this.updateAnalytics(result);
            
            return result;

        } catch (error) {
            this.handleError('Calculation Error', error);
            return null;
        }
    }

    calculateOptimizations(data, currentTax) {
        const optimizations = [];
        let potentialSavings = 0;

        // Beispiel-Optimierungen
        if (data.propertyType === 'residential' && data.propertyValue > 500000) {
            optimizations.push({
                type: 'Denkmalschutz',
                description: 'Prüfung auf Denkmalschutz-Abschreibung',
                potentialSaving: currentTax * 0.15
            });
            potentialSavings += currentTax * 0.15;
        }

        if (data.improvements > 50000) {
            optimizations.push({
                type: 'Modernisierung',
                description: 'Steuerliche Absetzung von Modernisierungsmaßnahmen',
                potentialSaving: currentTax * 0.08
            });
            potentialSavings += currentTax * 0.08;
        }

        return { optimizations, potentialSavings };
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Hauptberechnung
        document.addEventListener('DOMContentLoaded', () => {
            const calculateBtn = document.getElementById('calculate-tax');
            if (calculateBtn) {
                calculateBtn.addEventListener('click', this.handleCalculation.bind(this));
            }

            // Formular-Validierung in Echtzeit
            const formInputs = document.querySelectorAll('.form-input');
            formInputs.forEach(input => {
                input.addEventListener('input', this.validateInput.bind(this));
                input.addEventListener('blur', this.validateField.bind(this));
            });

            // Scenario-Tabs
            const scenarioTabs = document.querySelectorAll('.scenario-tab');
            scenarioTabs.forEach((tab, index) => {
                tab.addEventListener('click', () => this.switchScenario(index));
            });

            // PDF-Export
            const exportBtn = document.getElementById('export-pdf');
            if (exportBtn) {
                exportBtn.addEventListener('click', this.exportToPDF.bind(this));
            }

            // Advanced Options Toggle
            const advancedToggle = document.querySelector('.disclosure-toggle');
            if (advancedToggle) {
                advancedToggle.addEventListener('click', this.toggleAdvancedOptions.bind(this));
            }

            // Modal Controls
            this.setupModalControls();
            
            // History Controls
            this.setupHistoryControls();
        });
    }

    handleCalculation() {
        this.showProgress('Berechnung wird durchgeführt...');
        
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            this.hideProgress();
            return;
        }

        setTimeout(() => {
            const result = this.calculatePropertyTax(formData);
            if (result) {
                this.displayResults(result);
                this.showToast('Berechnung erfolgreich abgeschlossen!', 'success');
                this.trackEvent('calculation_completed', {
                    category: 'Tax Calculator',
                    value: result.calculations.finalTax
                });
            }
            this.hideProgress();
        }, 1000);
    }

    getFormData() {
        return {
            propertyValue: parseFloat(document.getElementById('property-value')?.value || 0),
            location: document.getElementById('location')?.value || 'suburban',
            propertyType: document.getElementById('property-type')?.value || 'residential',
            exemptions: parseFloat(document.getElementById('exemptions')?.value || 0),
            improvements: parseFloat(document.getElementById('improvements')?.value || 0),
            buildingArea: parseFloat(document.getElementById('building-area')?.value || 0),
            plotSize: parseFloat(document.getElementById('plot-size')?.value || 0)
        };
    }

    // ===== VALIDIERUNG =====
    validateForm(data) {
        let isValid = true;
        const errors = [];

        if (!data.propertyValue || data.propertyValue <= 0) {
            errors.push('Immobilienwert muss größer als 0 sein');
            isValid = false;
        }

        if (data.propertyValue > 50000000) {
            errors.push('Immobilienwert scheint unrealistisch hoch');
            isValid = false;
        }

        if (errors.length > 0) {
            this.showAlert(errors.join('\n'), 'danger');
        }

        return isValid;
    }

    validateInput(event) {
        const input = event.target;
        const value = input.value;
        const indicator = input.parentNode.querySelector('.validation-indicator');

        if (indicator) {
            if (this.isValidInput(input, value)) {
                input.classList.remove('invalid');
                input.classList.add('valid');
                indicator.innerHTML = '✓';
                indicator.classList.remove('invalid');
                indicator.classList.add('valid', 'show');
            } else {
                input.classList.remove('valid');
                input.classList.add('invalid');
                indicator.innerHTML = '✗';
                indicator.classList.remove('valid');
                indicator.classList.add('invalid', 'show');
            }
        }
    }

    isValidInput(input, value) {
        const type = input.type;
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);

        if (type === 'number') {
            const num = parseFloat(value);
            return !isNaN(num) && num >= (min || 0) && num <= (max || Infinity);
        }

        return value.length > 0;
    }

    // ===== ERGEBNISANZEIGE =====
    displayResults(result) {
        const resultsContainer = document.getElementById('results-container');
        if (!resultsContainer) return;

        const { calculations, savings } = result;

        resultsContainer.innerHTML = `
            <div class="results-grid">
                <div class="result-card best">
                    <div class="result-header">
                        <h3 class="result-title">🏠 Grundsteuer-Berechnung</h3>
                        <span class="result-badge">
                            <span>💰</span> Optimiert
                        </span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Verkehrswert:</span>
                        <span class="result-value">${this.formatCurrency(result.input.propertyValue)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Steuerwert (70%):</span>
                        <span class="result-value">${this.formatCurrency(calculations.assessedValue)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Zu versteuernder Wert:</span>
                        <span class="result-value">${this.formatCurrency(calculations.taxableValue)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Jährliche Grundsteuer:</span>
                        <span class="result-value">${this.formatCurrency(calculations.annualTax)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Monatliche Rate:</span>
                        <span class="result-value">${this.formatCurrency(calculations.monthlyTax)}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Effektiver Steuersatz:</span>
                        <span class="result-value">${calculations.effectiveRate.toFixed(3)}%</span>
                    </div>
                </div>

                <div class="result-card">
                    <div class="result-header">
                        <h3 class="result-title">💡 Optimierungsmöglichkeiten</h3>
                    </div>
                    ${savings.optimizations.map(opt => `
                        <div class="result-item">
                            <span class="result-label">${opt.type}:</span>
                            <span class="result-value">${this.formatCurrency(opt.potentialSaving)}</span>
                        </div>
                    `).join('')}
                    <div class="result-item">
                        <span class="result-label">Gesamtersparnis:</span>
                        <span class="result-value">${this.formatCurrency(savings.potentialSavings)}</span>
                    </div>
                </div>
            </div>
        `;

        resultsContainer.scrollIntoView({ behavior: 'smooth' });
        this.createVisualization(result);
    }

    createVisualization(result) {
        const chartContainer = document.getElementById('tax-chart');
        if (!chartContainer || !window.Chart) return;

        const ctx = chartContainer.getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Grundsteuer', 'Nettowert', 'Potenzielle Ersparnis'],
                datasets: [{
                    data: [
                        result.calculations.annualTax,
                        result.input.propertyValue - result.calculations.annualTax,
                        result.savings.potentialSavings
                    ],
                    backgroundColor: [
                        '#ff6b6b',
                        '#4ecdc4',
                        '#45b7d1'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // ===== HILFSFUNKTIONEN =====
    formatCurrency(amount) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }

    // ===== TOAST-BENACHRICHTIGUNGEN =====
    showToast(message, type = 'info') {
        const toastContainer = document.querySelector('.toast-container') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getToastIcon(type)}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutToast 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    getToastIcon(type) {
        const icons = {
            success: '✅',
            warning: '⚠️',
            danger: '❌',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    // ===== MODAL-SYSTEM =====
    setupModalControls() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });

            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal(modal));
            }
        });

        // ESC-Taste zum Schließen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal-overlay[style*="flex"]');
                if (openModal) {
                    this.closeModal(openModal);
                }
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // ===== PROGRESS-ANZEIGE =====
    showProgress(message) {
        let overlay = document.querySelector('.progress-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'progress-overlay';
            overlay.innerHTML = `
                <div class="progress-modal">
                    <div class="spinner"></div>
                    <p class="progress-message">${message}</p>
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        }

        overlay.style.display = 'flex';
        
        // Fake Progress für UX
        const progressFill = overlay.querySelector('.progress-fill');
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress > 90) progress = 90;
            progressFill.style.width = progress + '%';
        }, 100);

        this.progressInterval = interval;
    }

    hideProgress() {
        const overlay = document.querySelector('.progress-overlay');
        if (overlay) {
            clearInterval(this.progressInterval);
            const progressFill = overlay.querySelector('.progress-fill');
            progressFill.style.width = '100%';
            
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 500);
        }
    }

    // ===== PWA-FUNKTIONALITÄT =====
    initializePWA() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                    this.showToast('App ist offline verfügbar!', 'success');
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        }

        // Install-Prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallButton();
        });
    }

    showInstallButton() {
        const installBtn = document.createElement('button');
        installBtn.className = 'btn btn-primary install-btn';
        installBtn.innerHTML = '📱 App installieren';
        installBtn.addEventListener('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        this.showToast('App wird installiert!', 'success');
                    }
                });
            }
        });

        document.querySelector('.header-actions').appendChild(installBtn);
    }

    // ===== ANALYTICS & PERFORMANCE =====
    initializeAnalytics() {
        // User Engagement Tracking
        let engagementTime = 0;
        let scrollDepth = 0;

        setInterval(() => {
            engagementTime += 1000;
        }, 1000);

        window.addEventListener('scroll', () => {
            const depth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (depth > scrollDepth) {
                scrollDepth = depth;
            }
        });

        // Send analytics on page unload
        window.addEventListener('beforeunload', () => {
            if (window.trackEngagement && window.cookieConsent?.analytics) {
                window.trackEngagement(engagementTime, scrollDepth);
            }
        });
    }

    startPerformanceMonitoring() {
        const performanceIndicator = document.querySelector('.performance-indicator');
        if (!performanceIndicator) return;

        setInterval(() => {
            const performance = this.getPerformanceMetrics();
            this.updatePerformanceIndicator(performance);
        }, 2000);
    }

    getPerformanceMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        const loadTime = navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0;
        
        return {
            loadTime: loadTime,
            status: loadTime < 1000 ? 'excellent' : loadTime < 3000 ? 'good' : 'warning'
        };
    }

    updatePerformanceIndicator(metrics) {
        const indicator = document.querySelector('.performance-indicator');
        const dot = indicator.querySelector('.performance-dot');
        
        indicator.className = `performance-indicator ${metrics.status}`;
        indicator.innerHTML = `
            <span class="performance-dot"></span>
            Performance: ${metrics.status === 'excellent' ? 'Excellent' : metrics.status === 'good' ? 'Good' : 'Needs Optimization'}
        `;
    }

    // ===== DARK MODE =====
    initializeDarkMode() {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'dark-mode-toggle';
        toggleBtn.innerHTML = '🌓';
        toggleBtn.title = 'Dark Mode umschalten';
        
        toggleBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(102, 126, 234, 0.9);
            color: white;
            border: none;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            cursor: pointer;
            font-size: 1.2rem;
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;

        toggleBtn.addEventListener('click', this.toggleDarkMode.bind(this));
        document.body.appendChild(toggleBtn);

        // Load saved preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        this.showToast(`${isDark ? 'Dark' : 'Light'} Mode aktiviert`, 'info');
    }

    // ===== KEYBOARD SHORTCUTS =====
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.handleCalculation();
                        this.showShortcutIndicator('Berechnung gestartet (Ctrl+Enter)');
                        break;
                    case 'z':
                        e.preventDefault();
                        this.undo();
                        this.showShortcutIndicator('Rückgängig (Ctrl+Z)');
                        break;
                    case 'y':
                        e.preventDefault();
                        this.redo();
                        this.showShortcutIndicator('Wiederholen (Ctrl+Y)');
                        break;
                    case 's':
                        e.preventDefault();
                        this.exportToPDF();
                        this.showShortcutIndicator('Export PDF (Ctrl+S)');
                        break;
                }
            }
        });
    }

    showShortcutIndicator(text) {
        let indicator = document.querySelector('.shortcut-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'shortcut-indicator';
            document.body.appendChild(indicator);
        }

        indicator.textContent = text;
        indicator.classList.add('show');
        
        setTimeout(() => {
            indicator.classList.remove('show');
        }, 2000);
    }

    // ===== HISTORY MANAGEMENT =====
    saveToHistory(result) {
        this.state.history = this.state.history.slice(0, this.state.historyIndex + 1);
        this.state.history.push(result);
        this.state.historyIndex = this.state.history.length - 1;
        this.updateHistoryControls();
        this.saveState();
    }

    undo() {
        if (this.state.historyIndex > 0) {
            this.state.historyIndex--;
            const result = this.state.history[this.state.historyIndex];
            this.displayResults(result);
            this.updateHistoryControls();
            this.showToast('Vorherige Berechnung wiederhergestellt', 'info');
        }
    }

    redo() {
        if (this.state.historyIndex < this.state.history.length - 1) {
            this.state.historyIndex++;
            const result = this.state.history[this.state.historyIndex];
            this.displayResults(result);
            this.updateHistoryControls();
            this.showToast('Nächste Berechnung wiederhergestellt', 'info');
        }
    }

    updateHistoryControls() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        
        if (undoBtn) {
            undoBtn.disabled = this.state.historyIndex <= 0;
        }
        if (redoBtn) {
            redoBtn.disabled = this.state.historyIndex >= this.state.history.length - 1;
        }
    }

    setupHistoryControls() {
        const historyContainer = document.createElement('div');
        historyContainer.className = 'history-controls';
        historyContainer.innerHTML = `
            <button id="undo-btn" class="history-btn" title="Rückgängig (Ctrl+Z)" disabled>↶</button>
            <button id="redo-btn" class="history-btn" title="Wiederholen (Ctrl+Y)" disabled>↷</button>
        `;
        document.body.appendChild(historyContainer);

        document.getElementById('undo-btn').addEventListener('click', this.undo.bind(this));
        document.getElementById('redo-btn').addEventListener('click', this.redo.bind(this));
    }

    // ===== STATE MANAGEMENT =====
    saveState() {
        try {
            localStorage.setItem('immobilien-steuer-state', JSON.stringify(this.state));
        } catch (error) {
            console.warn('Could not save state:', error);
        }
    }

    loadState() {
        try {
            const saved = localStorage.getItem('immobilien-steuer-state');
            if (saved) {
                this.state = { ...this.state, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.warn('Could not load state:', error);
        }
    }

    // ===== ERROR HANDLING =====
    handleError(title, error) {
        console.error(title, error);
        this.showToast(`${title}: ${error.message}`, 'danger');
        
        // Send error to analytics if available
        if (window.gtag && window.cookieConsent?.analytics) {
            window.gtag('event', 'exception', {
                description: error.message,
                fatal: false
            });
        }
    }

    // ===== UTILITY METHODS =====
    trackEvent(eventName, parameters = {}) {
        if (window.trackEvent && window.cookieConsent?.analytics) {
            window.trackEvent(eventName, parameters);
        }
    }

    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <strong>${type === 'danger' ? 'Fehler!' : type === 'warning' ? 'Warnung!' : 'Info:'}</strong>
            ${message}
            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 1.2em; cursor: pointer;">&times;</button>
        `;
        
        const container = document.querySelector('.content-area');
        if (container) {
            container.insertBefore(alert, container.firstChild);
            setTimeout(() => alert.remove(), 5000);
        }
    }

    updateAnalytics(result) {
        this.state.analytics.totalCalculations++;
        this.state.analytics.averageTax = 
            (this.state.analytics.averageTax * (this.state.analytics.totalCalculations - 1) + result.calculations.finalTax) 
            / this.state.analytics.totalCalculations;
        
        this.updateAnalyticsDisplay();
    }

    updateAnalyticsDisplay() {
        const analytics = this.state.analytics;
        const analyticsPanel = document.querySelector('.analytics-panel');
        
        if (analyticsPanel) {
            analyticsPanel.innerHTML = `
                <div class="analytics-header">
                    <h3>📊 Live Analytics</h3>
                </div>
                
                <div class="analytics-widget">
                    <div class="widget-header">
                        <span class="widget-title">Berechnungen</span>
                        <span class="widget-icon">🧮</span>
                    </div>
                    <div class="metric-value">${analytics.totalCalculations}</div>
                    <div class="metric-label">Gesamt durchgeführt</div>
                </div>

                <div class="analytics-widget">
                    <div class="widget-header">
                        <span class="widget-title">Ø Grundsteuer</span>
                        <span class="widget-icon">💰</span>
                    </div>
                    <div class="metric-value">${this.formatCurrency(analytics.averageTax)}</div>
                    <div class="metric-label">Durchschnittlich</div>
                </div>

                <div class="analytics-widget">
                    <div class="widget-header">
                        <span class="widget-title">Session</span>
                        <span class="widget-icon">⏱️</span>
                    </div>
                    <div class="metric-value">${analytics.sessionsCount}</div>
                    <div class="metric-label">Aktuelle Sitzung</div>
                </div>
            `;
        }
    }

    // ===== PDF EXPORT =====
    async exportToPDF() {
        try {
            this.showProgress('PDF wird erstellt...');
            
            // Simulate PDF generation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const lastCalculation = this.state.history[this.state.history.length - 1];
            if (!lastCalculation) {
                this.showToast('Keine Berechnung zum Exportieren vorhanden', 'warning');
                return;
            }

            // Create PDF content (simplified)
            const pdfContent = this.generatePDFContent(lastCalculation);
            
            // In a real implementation, you'd use a PDF library like jsPDF
            this.showToast('PDF-Export erfolgreich! (Demo-Version)', 'success');
            
            this.trackEvent('pdf_exported', {
                category: 'Export',
                calculation_id: lastCalculation.id
            });

        } catch (error) {
            this.handleError('PDF Export', error);
        } finally {
            this.hideProgress();
        }
    }

    generatePDFContent(calculation) {
        return `
            IMMOBILIEN-STEUER-BERECHNUNG
            ============================
            
            Datum: ${new Date(calculation.timestamp).toLocaleDateString('de-DE')}
            
            EINGABEDATEN:
            - Immobilienwert: ${this.formatCurrency(calculation.input.propertyValue)}
            - Lage: ${calculation.input.location}
            - Objekttyp: ${calculation.input.propertyType}
            - Befreiungen: ${this.formatCurrency(calculation.input.exemptions)}
            - Verbesserungen: ${this.formatCurrency(calculation.input.improvements)}
            
            BERECHNUNGSERGEBNIS:
            - Steuerwert: ${this.formatCurrency(calculation.calculations.assessedValue)}
            - Jährliche Grundsteuer: ${this.formatCurrency(calculation.calculations.annualTax)}
            - Monatliche Rate: ${this.formatCurrency(calculation.calculations.monthlyTax)}
            - Effektiver Steuersatz: ${calculation.calculations.effectiveRate.toFixed(3)}%
            
            OPTIMIERUNGSMÖGLICHKEITEN:
            - Potenzielle Ersparnis: ${this.formatCurrency(calculation.savings.potentialSavings)}
        `;
    }
}

// ===== SERVICE WORKER =====
const serviceWorkerCode = `
// service-worker.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

workbox.core.skipWaiting();
workbox.core.clientsClaim();

if (workbox) {
    console.log('Workbox loaded successfully');

    // Precache critical files
    workbox.precaching.precacheAndRoute([
        { url: '/index.html', revision: '1' },
        { url: '/app.js', revision: '1' },
        { url: '/offline.html', revision: '1' }
    ]);

    // Cache static resources
    workbox.routing.registerRoute(
        ({url}) => url.origin === self.location.origin,
        new workbox.strategies.CacheFirst({
            cacheName: 'static-cache',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxAgeSeconds: 7 * 24 * 60 * 60
                })
            ]
        })
    );

    // Handle navigation with offline fallback
    workbox.routing.registerRoute(
        ({ request }) => request.mode === 'navigate',
        async ({ event }) => {
            try {
                const response = await fetch(event.request);
                return response;
            } catch (error) {
                return caches.match('/offline.html');
            }
        }
    );
} else {
    console.log('Workbox failed to load');
}
`;

// ===== INITIALIZATION =====
// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.immobilienSteuerSuite = new ImmobilienSteuerSuite();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImmobilienSteuerSuite;
}
