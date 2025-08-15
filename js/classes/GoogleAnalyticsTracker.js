// Enhanced Google Analytics Tracker
class GoogleAnalyticsTracker {
    constructor() {
        this.isInitialized = false;
        this.sessionStartTime = Date.now();
        this.pageLoadTime = performance.timing ? 
            performance.timing.loadEventEnd - performance.timing.navigationStart : 0;
        this.userSegment = this.determineUserSegment();
        this.setupEngagementTracking();
        this.setupPerformanceTracking();
    }

    init() {
        if (typeof gtag !== 'undefined' && window.cookieConsent.analytics) {
            this.isInitialized = true;
            this.trackPageLoad();
            this.trackUserSegment();
            console.log('✅ Google Analytics tracking initialized');
        }
    }

    // Core Event Tracking
    trackEvent(eventName, parameters = {}) {
        if (!this.isInitialized || typeof gtag === 'undefined') return;

        const enrichedParams = {
            ...parameters,
            user_segment: this.userSegment,
            session_duration: this.getSessionDuration(),
            page_load_time: this.pageLoadTime,
            timestamp: new Date().toISOString()
        };

        gtag('event', eventName, enrichedParams);
        console.log(`📊 Analytics Event: ${eventName}`, enrichedParams);
    }

    // Tax Calculation Tracking
    trackCalculation(calculationType, inputData, results) {
        this.trackEvent('tax_calculation', {
            event_category: 'Tax Calculations',
            calculation_type: calculationType,
            input_value: inputData.verkaufspreis || inputData.immobilienwert || 0,
            calculation_complexity: this.getCalculationComplexity(inputData),
            result_count: results?.structures?.length || 0,
            max_savings: results?.totalSavings || 0,
            calculation_time: results?.calculationTime || 0,
            cache_hit: results?.cacheHit || false
        });

        // Track specific calculation milestones
        if (inputData.verkaufspreis > 1000000) {
            this.trackEvent('high_value_calculation', {
                event_category: 'Premium Usage',
                value: inputData.verkaufspreis
            });
        }
    }

    // User Journey Tracking
    trackUserJourney(step, action, details = {}) {
        this.trackEvent('user_journey', {
            event_category: 'User Journey',
            journey_step: step,
            journey_action: action,
            ...details
        });
    }

    // Feature Usage Tracking
    trackFeatureUsage(feature, action, value = null) {
        this.trackEvent('feature_usage', {
            event_category: 'Feature Interaction',
            feature_name: feature,
            feature_action: action,
            feature_value: value,
            user_segment: this.userSegment
        });
    }

    // PDF Export Tracking
    trackPDFExport(success, calculationType, dataSize) {
        this.trackEvent('pdf_export', {
            event_category: 'Document Generation',
            export_success: success,
            calculation_type: calculationType,
            data_size: dataSize,
            export_timestamp: new Date().toISOString()
        });

        if (success) {
            // Track as conversion
            this.trackConversion('pdf_generated', 1);
        }
    }

    // Error Tracking
    trackError(errorType, errorMessage, errorContext = {}) {
        this.trackEvent('error_occurred', {
            event_category: 'Errors',
            error_type: errorType,
            error_message: errorMessage.substring(0, 150), // Limit length
            error_context: JSON.stringify(errorContext).substring(0, 500),
            user_agent: navigator.userAgent.substring(0, 100)
        });
    }

    // Performance Tracking
    trackPerformance(metricName, value, context = {}) {
        this.trackEvent('performance_metric', {
            event_category: 'Performance',
            metric_name: metricName,
            metric_value: value,
            ...context
        });
    }

    // Conversion Tracking
    trackConversion(conversionType, value = 1) {
        this.trackEvent('conversion', {
            event_category: 'Conversions',
            conversion_type: conversionType,
            value: value,
            user_segment: this.userSegment
        });
    }

    // Plugin Usage Tracking
    trackPluginUsage(pluginName, action) {
        this.trackEvent('plugin_interaction', {
            event_category: 'Plugins',
            plugin_name: pluginName,
            plugin_action: action,
            user_segment: this.userSegment
        });
    }

    // Engagement Tracking
    setupEngagementTracking() {
        let maxScrollDepth = 0;
        let totalTimeOnPage = 0;
        let lastActiveTime = Date.now();

        // Scroll depth tracking
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            maxScrollDepth = Math.max(maxScrollDepth, scrollPercent);
        });

        // Time on page tracking
        setInterval(() => {
            if (document.hasFocus()) {
                totalTimeOnPage += 1000;
                lastActiveTime = Date.now();
            }
        }, 1000);

        // Page unload tracking
        window.addEventListener('beforeunload', () => {
            this.trackEngagement(totalTimeOnPage, maxScrollDepth);
        });

        // Periodic engagement tracking (every 30 seconds)
        setInterval(() => {
            if (Date.now() - lastActiveTime < 5000) { // Active in last 5 seconds
                this.trackEngagement(totalTimeOnPage, maxScrollDepth);
            }
        }, 30000);
    }

    trackEngagement(timeOnPage, scrollDepth) {
        this.trackEvent('user_engagement', {
            event_category: 'Engagement',
            engagement_time_msec: timeOnPage,
            scroll_depth: scrollDepth,
            session_duration: this.getSessionDuration()
        });
    }

    // Advanced User Segmentation
    determineUserSegment() {
        const userAgent = navigator.userAgent;
        const screenWidth = window.screen.width;
        const language = navigator.language;
        
        let segment = 'standard_user';

        // Device-based segmentation
        if (screenWidth < 768) segment = 'mobile_user';
        else if (screenWidth > 1920) segment = 'desktop_power_user';

        // Professional vs Personal use detection
        if (userAgent.includes('Chrome') && screenWidth > 1440) {
            segment = 'professional_user';
        }

        // International users
        if (!language.startsWith('de')) {
            segment = 'international_user';
        }

        return segment;
    }

    // Performance Monitoring
    setupPerformanceTracking() {
        // Core Web Vitals
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint (LCP)
            new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.trackPerformance('LCP', entry.startTime, {
                        element: entry.element?.tagName || 'unknown'
                    });
                }
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay (FID)
            new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.trackPerformance('FID', entry.processingStart - entry.startTime);
                }
            }).observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift (CLS)
            new PerformanceObserver((list) => {
                let clsValue = 0;
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                if (clsValue > 0) {
                    this.trackPerformance('CLS', clsValue);
                }
            }).observe({ entryTypes: ['layout-shift'] });
        }

        // Custom performance metrics
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    this.trackPerformance('DOM_Load', perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart);
                    this.trackPerformance('Page_Load', perfData.loadEventEnd - perfData.loadEventStart);
                    this.trackPerformance('DNS_Lookup', perfData.domainLookupEnd - perfData.domainLookupStart);
                }
            }, 1000);
        });
    }

    // Helper Methods
    getSessionDuration() {
        return Math.round((Date.now() - this.sessionStartTime) / 1000);
    }

    getCalculationComplexity(inputData) {
        let complexity = 'basic';
        const keys = Object.keys(inputData);
        
        if (keys.length > 8) complexity = 'advanced';
        if (inputData.verkaufspreis > 1000000) complexity = 'high_value';
        if (inputData.international) complexity = 'international';
        
        return complexity;
    }

    // Premium Feature Tracking
    trackPremiumFeatureUsage(featureName, featureValue) {
        this.trackEvent('premium_feature_usage', {
            event_category: 'Premium Features',
            item_name: featureName,
            value: featureValue,
            currency: 'EUR'
        });
    }

    // Funnel Tracking
    trackFunnelStep(funnelName, stepNumber, stepName, completed = false) {
        this.trackEvent('funnel_step', {
            event_category: 'Conversion Funnel',
            funnel_name: funnelName,
            funnel_step: stepNumber,
            step_name: stepName,
            step_completed: completed
        });
    }

    // Page/Section Tracking
    trackPageView(pageName, pageCategory) {
        if (this.isInitialized) {
            gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: pageName,
                page_location: window.location.href,
                content_group1: pageCategory
            });
        }
    }

    trackPageLoad() {
        this.trackEvent('page_load_complete', {
            event_category: 'Page Performance',
            page_load_time: this.pageLoadTime,
            user_segment: this.userSegment
        });
    }

    trackUserSegment() {
        this.trackEvent('user_segment_identified', {
            event_category: 'User Segmentation',
            segment: this.userSegment,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language
        });
    }
}