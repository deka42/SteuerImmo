// Google Analytics 4 (GA4) Configuration
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

// Initialize GA4 with enhanced configuration
gtag('config', 'GA_MEASUREMENT_ID', {
    // Enhanced Measurement
    enhanced_measurement: true,
    
    // Privacy Settings (GDPR Compliant)
    anonymize_ip: true,
    allow_ad_personalization_signals: false,
    allow_google_signals: false,
    
    // Custom Configuration
    custom_map: {
        'custom_parameter_1': 'calculation_type',
        'custom_parameter_2': 'user_segment',
        'custom_parameter_3': 'feature_usage'
    },
    
    // Enhanced E-commerce for Premium Features
    send_page_view: true,
    
    // Performance Tracking
    site_speed_sample_rate: 100
});

// GDPR Consent Management
window.cookieConsent = {
    analytics: false,
    marketing: false,
    functional: true
};

// Initialize analytics only with consent
function initializeAnalytics() {
    if (window.cookieConsent.analytics) {
        gtag('consent', 'update', {
            'analytics_storage': 'granted'
        });
    }
}

// Custom Event Tracking Functions
window.trackEvent = function(eventName, parameters = {}) {
    if (window.cookieConsent.analytics) {
        gtag('event', eventName, {
            event_category: parameters.category || 'User Interaction',
            event_label: parameters.label || '',
            value: parameters.value || 0,
            custom_parameter_1: parameters.calculation_type || '',
            custom_parameter_2: parameters.user_segment || '',
            custom_parameter_3: parameters.feature_usage || '',
            ...parameters
        });
    }
};

// Enhanced E-commerce Tracking
window.trackPurchase = function(transactionId, items, value) {
    if (window.cookieConsent.analytics) {
        gtag('event', 'purchase', {
            transaction_id: transactionId,
            value: value,
            currency: 'EUR',
            items: items
        });
    }
};

// User Engagement Tracking
window.trackEngagement = function(engagementTime, scrollDepth) {
    if (window.cookieConsent.analytics) {
        gtag('event', 'user_engagement', {
            engagement_time_msec: engagementTime,
            scroll_depth: scrollDepth,
            event_category: 'Engagement'
        });
    }
};

// Load Google Analytics script
(function() {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
    document.head.appendChild(script);
})();

// Google Tag Manager (Optional for advanced tracking)
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');