class EnhancedErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 50;
        this.setupGlobalHandlers();
    }

    setupGlobalHandlers() {
        window.addEventListener('error', (event) => {
            this.logError({
                type: 'JavaScript Error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: new Date().toISOString()
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'Unhandled Promise Rejection',
                message: event.reason?.message || event.reason,
                stack: event.reason?.stack,
                timestamp: new Date().toISOString()
            });
        });
    }

    logError(error) {
        this.errorLog.push(error);
        
        // Limit log size
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog.shift();
        }
        
        console.error('Application Error:', error);
        this.updateErrorDisplay();
        this.reportToAnalytics(error);
    }

    updateErrorDisplay() {
        const errorLogElement = document.getElementById('error-log');
        const errorRateElement = document.getElementById('error-rate-status');
        
        if (errorLogElement) {
            if (this.errorLog.length === 0) {
                errorLogElement.innerHTML = '<div style="color: var(--success-solid);">✅ Keine Fehler</div>';
            } else {
                const recentErrors = this.errorLog.slice(-5);
                errorLogElement.innerHTML = recentErrors.map(error => 
                    `<div style="color: var(--danger-solid); margin-bottom: 0.25rem;">
                        <strong>${this.escapeHtml(error.type)}:</strong> ${this.escapeHtml(error.message.substring(0, 50))}...
                        <small style="display: block; color: #6c757d;">${new Date(error.timestamp).toLocaleTimeString()}</small>
                    </div>`
                ).join('');
            }
        }
        
        if (errorRateElement) {
            const errorRate = this.errorLog.length > 0 ? `${this.errorLog.length} Fehler` : '0%';
            errorRateElement.textContent = errorRate;
            errorRateElement.style.color = this.errorLog.length > 0 ? 'var(--danger-solid)' : 'var(--success-solid)';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    reportToAnalytics(error) {
        // Send to analytics service if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: error.message,
                fatal: false
            });
        }
    }

    getErrorSummary() {
        return {
            total: this.errorLog.length,
            byType: this.errorLog.reduce((acc, error) => {
                acc[error.type] = (acc[error.type] || 0) + 1;
                return acc;
            }, {}),
            recent: this.errorLog.slice(-10)
        };
    }

    clearErrors() {
        this.errorLog = [];
        this.updateErrorDisplay();
    }
}