// Initialize the Enhanced Ultimate Suite
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the main application
    const app = new UltimateImmobilienSuiteEnhanced();
    window.app = app;

    console.log('🚀 Ultimate Enterprise Immobilien-Steuer-Suite 2025 Enhanced loaded');
    console.log('📊 Features: Real-time AI, Enhanced PDF Export, Multi-Scenario, Plugin Architecture, Error Handling, Performance Monitoring');
    console.log('⌨️ Keyboard shortcuts available - Press F1 for help');
    console.log('🔧 Enhanced with all suggested improvements and enterprise features');
});

// Global utility functions
window.formatCurrency = function(amount) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount || 0);
};

window.formatPercentage = function(value) {
    return new Intl.NumberFormat('de-DE', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value / 100);
};

// Enhanced validation functions
window.validateNumericInput = function(value, min = 0, max = Infinity) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
};

window.validateDateInput = function(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

window.validateRequiredField = function(value) {
    return value !== null && value !== undefined && value !== '';
};

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Performance monitoring
window.addEventListener('load', function() {
    // Monitor performance metrics
    if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
            console.log('Page Load Performance:', {
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                totalTime: perfData.loadEventEnd - perfData.fetchStart
            });
        }
    }
});

// Error boundary for unhandled errors
window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
    if (window.app && window.app.errorHandler) {
        window.app.errorHandler.logError({
            type: 'Global JavaScript Error',
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack,
            timestamp: new Date().toISOString()
        });
    }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.app && window.app.errorHandler) {
        window.app.errorHandler.logError({
            type: 'Unhandled Promise Rejection',
            message: event.reason?.message || event.reason,
            stack: event.reason?.stack,
            timestamp: new Date().toISOString()
        });
    }
});