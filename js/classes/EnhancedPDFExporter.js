// Enhanced PDF Exporter
class EnhancedPDFExporter {
    constructor() {
        this.jsPDFLibrary = null;
        this.loadAttempts = 0;
        this.maxLoadAttempts = 3;
    }

    async ensureLibraryLoaded() {
        if (this.jsPDFLibrary) return this.jsPDFLibrary;

        const cdnSources = [
            'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
            'https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js',
            'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'
        ];

        for (const source of cdnSources) {
            try {
                await this.loadFromCDN(source);
                this.jsPDFLibrary = this.getJsPDFConstructor();
                if (this.jsPDFLibrary) {
                    console.log('✅ jsPDF loaded successfully from:', source);
                    return this.jsPDFLibrary;
                }
            } catch (error) {
                console.warn(`Failed to load jsPDF from ${source}:`, error);
                continue;
            }
        }

        throw new Error('Failed to load jsPDF library from any CDN source');
    }

    loadFromCDN(url) {
        return new Promise((resolve, reject) => {
            // Remove any existing scripts
            const existingScript = document.querySelector(`script[src="${url}"]`);
            if (existingScript) {
                existingScript.remove();
            }

            const script = document.createElement('script');
            script.src = url;
            script.onload = () => {
                setTimeout(resolve, 200);
            };
            script.onerror = () => reject(new Error(`Failed to load ${url}`));
            document.head.appendChild(script);
        });
    }

    getJsPDFConstructor() {
        if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
        if (window.jsPDF) return window.jsPDF;
        if (typeof jsPDF !== 'undefined') return jsPDF;
        return null;
    }

    async exportReport(data) {
        try {
            const jsPDFConstructor = await this.ensureLibraryLoaded();
            const doc = new jsPDFConstructor({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            await this.generatePDFContent(doc, data);
            
            const filename = `Steueroptimierung_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
            
            return { success: true, filename };
        } catch (error) {
            console.error('PDF Export failed:', error);
            throw new Error(`PDF-Export fehlgeschlagen: ${error.message}`);
        }
    }

    async generatePDFContent(doc, data) {
        try {
            this.addHeader(doc);
            this.addInputData(doc, data);
            
            if (data.results) {
                this.addResults(doc, data.results);
            }
            
            this.addFooter(doc);
            this.addWatermark(doc);
        } catch (error) {
            console.error('Error generating PDF content:', error);
            throw error;
        }
    }

    addHeader(doc) {
        // Header with logo placeholder
        doc.setFontSize(20);
        doc.setTextColor('#667eea');
        doc.text('🏠 Immobilien-Steuer-Suite 2025', 20, 30);
        
        doc.setFontSize(12);
        doc.setTextColor('#000000');
        doc.text('Ultimate Enterprise Enhanced Edition - Steueroptimierung Bericht', 20, 40);
        doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 20, 50);
        doc.text(`Version: v4.0.0-enhanced`, 150, 50);
        
        // Add separator line
        doc.setDrawColor('#667eea');
        doc.setLineWidth(0.5);
        doc.line(20, 55, 190, 55);
    }

    addInputData(doc, data) {
        let yPos = 70;
        doc.setFontSize(16);
        doc.setTextColor('#2c3e50');
        doc.text('Eingabedaten:', 20, yPos);
        yPos += 15;
        
        doc.setFontSize(10);
        doc.setTextColor('#000000');
        
        const dataPoints = [
            { label: 'Kaufpreis', value: data.kaufpreis, format: 'currency' },
            { label: 'Verkaufspreis', value: data.verkaufspreis, format: 'currency' },
            { label: 'Haltedauer', value: data.haltedauer, format: 'years' },
            { label: 'Steuersatz', value: data.steuersatz, format: 'percent' },
            { label: 'Kirchensteuer', value: data.kirchensteuer, format: 'percent' },
            { label: 'Bundesland', value: this.getBundeslandName(data.bundesland), format: 'text' }
        ];

        dataPoints.forEach(point => {
            if (point.value !== undefined && point.value !== null) {
                const formattedValue = this.formatValue(point.value, point.format);
                doc.text(`${point.label}: ${formattedValue}`, 25, yPos);
                yPos += 8;
            }
        });
    }

    addResults(doc, results) {
        let yPos = 160;
        
        // Check if we need a new page
        if (yPos > 250) {
            doc.addPage();
            yPos = 30;
        }
        
        doc.setFontSize(16);
        doc.setTextColor('#2c3e50');
        doc.text('Optimierungsergebnisse:', 20, yPos);
        yPos += 15;
        
        if (results && results.structures && results.structures.length > 0) {
            const best = results.structures[0];
            doc.setFontSize(12);
            doc.setTextColor('#11998e');
            doc.text(`BESTE OPTION: ${best.name}`, 25, yPos);
            yPos += 10;
            
            doc.setFontSize(10);
            doc.setTextColor('#000000');
            doc.text(`Nettogewinn: ${this.formatCurrency(best.netProfit)}`, 25, yPos);
            doc.text(`Steuersatz: ${best.taxRate.toFixed(1)}%`, 25, yPos + 8);
            doc.text(`Steuerbelastung: ${this.formatCurrency(best.tax)}`, 25, yPos + 16);
            
            yPos += 35;
            
            // Results table
            this.addResultsTable(doc, results.structures, yPos);
        }
    }

    addResultsTable(doc, structures, startY) {
        const headers = ['Struktur', 'Nettogewinn', 'Steuer', 'Rate'];
        const columnWidths = [60, 40, 40, 25];
        const startX = 25;
        let currentY = startY;

        // Table headers
        doc.setFontSize(9);
        doc.setTextColor('#ffffff');
        doc.setFillColor(102, 126, 234);
        doc.rect(startX, currentY - 5, columnWidths.reduce((a, b) => a + b, 0), 8, 'F');
        
        let currentX = startX;
        headers.forEach((header, index) => {
            doc.text(header, currentX + 2, currentY);
            currentX += columnWidths[index];
        });
        
        currentY += 10;

        // Table rows
        doc.setTextColor('#000000');
        structures.slice(0, 8).forEach((structure, index) => {
            if (currentY > 250) {
                doc.addPage();
                currentY = 30;
            }
            
            // Alternate row colors
            if (index % 2 === 0) {
                doc.setFillColor(248, 249, 250);
                doc.rect(startX, currentY - 4, columnWidths.reduce((a, b) => a + b, 0), 8, 'F');
            }
            
            currentX = startX;
            const rowData = [
                structure.name.substring(0, 25),
                this.formatCurrency(structure.netProfit),
                this.formatCurrency(structure.tax),
                `${structure.taxRate.toFixed(1)}%`
            ];
            
            rowData.forEach((data, colIndex) => {
                doc.text(data, currentX + 2, currentY);
                currentX += columnWidths[colIndex];
            });
            
            currentY += 8;
        });
    }

    addFooter(doc) {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor('#6c757d');
            
            // Footer line
            doc.setDrawColor('#e9ecef');
            doc.line(20, 280, 190, 280);
            
            doc.text(`Seite ${i} von ${pageCount}`, 20, 285);
            doc.text('Immobilien-Steuer-Suite 2025 Ultimate Enterprise Enhanced', 90, 285);
            doc.text(`Erstellt: ${new Date().toLocaleString('de-DE')}`, 20, 290);
        }
    }

    addWatermark(doc) {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(40);
            doc.setTextColor(240, 240, 240);
            doc.text('STEUER-SUITE', 105, 150, { angle: 45, align: 'center' });
        }
    }

    formatValue(value, format) {
        switch (format) {
            case 'currency':
                return this.formatCurrency(value);
            case 'percent':
                return `${value}%`;
            case 'years':
                return `${value} Jahre`;
            default:
                return value.toString();
        }
    }

    getBundeslandName(code) {
        const names = {
            'bw': 'Baden-Württemberg',
            'by': 'Bayern',
            'be': 'Berlin',
            'bb': 'Brandenburg',
            'hb': 'Bremen',
            'hh': 'Hamburg',
            'he': 'Hessen',
            'mv': 'Mecklenburg-Vorpommern',
            'ni': 'Niedersachsen',
            'nw': 'Nordrhein-Westfalen',
            'rp': 'Rheinland-Pfalz',
            'sl': 'Saarland',
            'sn': 'Sachsen',
            'st': 'Sachsen-Anhalt',
            'sh': 'Schleswig-Holstein',
            'th': 'Thüringen'
        };
        return names[code] || code;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    }
}