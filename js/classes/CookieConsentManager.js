// GDPR Cookie Consent Banner
class CookieConsentManager {
    constructor() {
        this.consentGiven = false;
        this.showBanner();
    }

    showBanner() {
        // Only show if consent not already given
        const existingConsent = this.getSafeLocalStorage('cookie_consent');
        if (existingConsent) {
            try {
                const consent = JSON.parse(existingConsent);
                window.cookieConsent = consent;
                if (consent.analytics) {
                    this.initializeAnalytics();
                }
                return;
            } catch (error) {
                console.warn('Invalid consent data in localStorage');
                this.clearSavedConsent();
            }
        }

        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1rem 2rem;
            z-index: 10000;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1rem;
        `;

        banner.innerHTML = `
            <div style="flex: 1; min-width: 300px;">
                <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem;">Cookie-Einstellungen</h3>
                <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">
                    Wir verwenden Cookies für Analytics und zur Verbesserung der Benutzererfahrung. 
                    Sie können Ihre Präferenzen jederzeit anpassen.
                </p>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button id="accept-all-cookies" style="background: white; color: #667eea; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer;">
                    Alle akzeptieren
                </button>
                <button id="accept-necessary-cookies" style="background: transparent; color: white; border: 2px solid white; padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer;">
                    Nur notwendige
                </button>
                <button id="customize-cookies" style="background: transparent; color: white; border: 1px solid rgba(255,255,255,0.5); padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.8rem; cursor: pointer;">
                    Anpassen
                </button>
            </div>
        `;

        document.body.appendChild(banner);

        // Event listeners
        document.getElementById('accept-all-cookies').onclick = () => this.acceptAll();
        document.getElementById('accept-necessary-cookies').onclick = () => this.acceptNecessary();
        document.getElementById('customize-cookies').onclick = () => this.showCustomizeModal();
    }

    acceptAll() {
        window.cookieConsent = {
            analytics: true,
            marketing: true,
            functional: true
        };
        this.saveConsent();
        this.initializeAnalytics();
        this.removeBanner();
    }

    acceptNecessary() {
        window.cookieConsent = {
            analytics: false,
            marketing: false,
            functional: true
        };
        this.saveConsent();
        this.removeBanner();
    }

    showCustomizeModal() {
        // Implementation for detailed cookie preferences
        this.acceptNecessary(); // Fallback for now
    }

    saveConsent() {
        try {
            this.setSafeLocalStorage('cookie_consent', JSON.stringify(window.cookieConsent));
            this.setSafeLocalStorage('cookie_consent_date', new Date().toISOString());
        } catch (error) {
            console.warn('Could not save cookie consent to localStorage');
        }
    }

    clearSavedConsent() {
        try {
            localStorage.removeItem('cookie_consent');
            localStorage.removeItem('cookie_consent_date');
        } catch (error) {
            console.warn('Could not clear consent from localStorage');
        }
    }

    getSafeLocalStorage(key) {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.warn('localStorage not available');
            return null;
        }
    }

    setSafeLocalStorage(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            console.warn('Could not save to localStorage');
        }
    }

    initializeAnalytics() {
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted',
                'ad_storage': window.cookieConsent.marketing ? 'granted' : 'denied'
            });
        }
    }

    removeBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.style.transform = 'translateY(100%)';
            setTimeout(() => banner.remove(), 300);
        }
    }
}