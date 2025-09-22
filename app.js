// Immobilien-Steuer-Suite 2025 Kernlogik
class ImmobilienSteuerSuite {
    constructor() {
        this.init();
    }

    init() {
        document.getElementById('calculate-tax').addEventListener('click', () => this.handleCalculation());
        document.getElementById('export-pdf').addEventListener('click', () => this.exportToPDF());
    }

    handleCalculation() {
        const data = this.getFormData();
        if (!this.validateForm(data)) return;

        const result = this.calculatePropertyTax(data);
        this.displayResults(result);
        this.createChart(result);
    }

    getFormData() {
        return {
            propertyValue: parseFloat(document.getElementById('property-value').value),
            location: document.getElementById('location').value,
            propertyType: document.getElementById('property-type').value,
            exemptions: parseFloat(document.getElementById('exemptions').value) || 0,
            improvements: parseFloat(document.getElementById('improvements').value) || 0,
            buildingArea: parseFloat(document.getElementById('building-area').value) || 0,
            plotSize: parseFloat(document.getElementById('plot-size').value) || 0,
        };
    }

    validateForm(data) {
        if (isNaN(data.propertyValue) || data.propertyValue <= 0) {
            alert('Bitte geben Sie einen gültigen Immobilienwert größer 0 ein.');
            return false;
        }
        return true;
    }

    calculatePropertyTax(data) {
        const taxRates = {
            residential: 0.0035,
            commercial: 0.0045,
            industrial: 0.0055,
            agricultural: 0.0020,
        };
        const locationMultiplier = {
            urban: 1.2,
            suburban: 1.0,
            rural: 0.8,
        };

        const assessedValue = data.propertyValue * 0.7;
        const taxableValue = assessedValue + data.improvements - data.exemptions;
        const baseTax = taxableValue * (taxRates[data.propertyType] || 0.0035);
        const finalTax = baseTax * (locationMultiplier[data.location] || 1.0);

        const savings = finalTax * 0.1; // Beispielhafte 10% Ersparnis

        return {
            input: data,
            calculations: {
                assessedValue,
                taxableValue,
                baseTax,
                finalTax,
                annualTax: finalTax,
                monthlyTax: finalTax / 12,
                effectiveRate: (finalTax / data.propertyValue) * 100,
            },
            savings,
        };
    }

    displayResults(result) {
        const container = document.getElementById('results-container');
        container.innerHTML = `
            <div class="results-grid">
                <div class="result-card">
                    <h3 class="result-title">Berechnungsergebnis</h3>
                    <div class="result-item"><span>Verkehrswert:</span><span>${this.formatCurrency(result.input.propertyValue)}</span></div>
                    <div class="result-item"><span>Steuerwert (70%):</span><span>${this.formatCurrency(result.calculations.assessedValue)}</span></div>
                    <div class="result-item"><span>Zu versteuernder Wert:</span><span>${this.formatCurrency(result.calculations.taxableValue)}</span></div>
                    <div class="result-item"><span>Jährliche Grundsteuer:</span><span>${this.formatCurrency(result.calculations.annualTax)}</span></div>
                    <div class="result-item"><span>Monatliche Rate:</span><span>${this.formatCurrency(result.calculations.monthlyTax)}</span></div>
                    <div class="result-item"><span>Effektiver Steuersatz:</span><span>${result.calculations.effectiveRate.toFixed(2)}%</span></div>
                </div>
                <div class="result-card">
                    <h3 class="result-title">Optimierung</h3>
                    <div class="result-item"><span>Potenzielle Ersparnis:</span><span>${this.formatCurrency(result.savings)}</span></div>
                </div>
            </div>
        `;
    }

    createChart(result) {
        const ctx = document.getElementById('tax-chart').getContext('2d');
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }
        this.chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Grundsteuer', 'Nettowert', 'Ersparnis'],
                datasets: [{
                    data: [
                        result.calculations.annualTax,
                        result.input.propertyValue - result.calculations.annualTax,
                        result.savings
                    ],
                    backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1']
                }]
            },
            options: {
                responsive: true,
                plugins: {legend: {position: 'bottom' }}
            }
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }

    exportToPDF() {
        alert('PDF Export wird noch implementiert.');
    }
}

// Initialisierung beim Laden der Webseite
document.addEventListener('DOMContentLoaded', () => {
    window.immobilienSteuerApp = new ImmobilienSteuerSuite();
});
