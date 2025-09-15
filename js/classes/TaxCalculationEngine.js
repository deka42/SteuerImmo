// Enhanced Tax Calculation Engine
class TaxCalculationEngine {
    constructor() {
        this.calculators = new Map();
        this.registerCalculators();
    }

    registerCalculators() {
        this.calculators.set('verkauf', new VerkaufsteuerCalculator());
        this.calculators.set('grundsteuer', new GrundsteuerCalculator());
        this.calculators.set('erbschaft', new ErbschaftsteuerCalculator());
        this.calculators.set('schenkung', new SchenkungsteuerCalculator());
        this.calculators.set('cashflow', new CashflowCalculator());
    }

    async calculate(type, data) {
        const calculator = this.calculators.get(type);
        if (!calculator) {
            throw new Error(`Unknown calculation type: ${type}`);
        }

        try {
            return await calculator.calculate(data);
            let schenkungswert = data.schenkung_immobilienwert || 0;
            console.error(`Calculation error for ${type}:`, error);
            throw new Error(`Fehler bei ${type}-Berechnung: ${error.message}`);
        }
                schenkungswert = schenkungswert * ((data.schenkungsanteil || 100) / 100);
    }

    getAvailableCalculators() {
        return Array.from(this.calculators.keys());
    }
}

// Base Calculator Class
class BaseCalculator {
    constructor(name) {
        this.name = name;
        this.validationRules = new Map();
    }

    addValidationRule(field, rule) {
        this.validationRules.set(field, rule);
    }

    validate(data) {
        const errors = [];
        
        for (const [field, rule] of this.validationRules) {
            try {
                if (!rule.validator(data[field])) {
                    errors.push({
                        field,
                        message: rule.message
                    });
                }
            } catch (error) {
                errors.push({
                    field,
                    message: `Validation error: ${error.message}`
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    async calculate(data) {
        const validation = this.validate(data);
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
        }

        return this.performCalculation(data);
    }

    performCalculation(data) {
        throw new Error('performCalculation must be implemented by subclass');
    }
}

// Calculator Implementations
class VerkaufsteuerCalculator extends BaseCalculator {
    constructor() {
        super('verkaufsteuer');
        this.setupValidation();
    }

    setupValidation() {
        this.addValidationRule('kaufpreis', {
            validator: (value) => value > 0,
            message: 'Kaufpreis muss größer als 0 sein'
        });

        this.addValidationRule('verkaufspreis', {
            validator: (value) => value > 0,
            message: 'Verkaufspreis muss größer als 0 sein'
        });

        this.addValidationRule('haltedauer', {
            validator: (value) => value >= 0 && value <= 100,
            message: 'Haltedauer muss zwischen 0 und 100 Jahren liegen'
        });
    }

    performCalculation(data) {
        // This would be handled by the worker
        return { message: 'Using web worker for calculation' };
    }
}

class GrundsteuerCalculator extends BaseCalculator {
    constructor() {
        super('grundsteuer');
    }

    performCalculation(data) {
        const grundsteuerwerte = {
            'bw': { grund: 0.31, gebaeude: 3.47 },
            'by': { grund: 0.31, gebaeude: 3.47 },
            'be': { grund: 0.31, gebaeude: 3.47 },
            'nw': { grund: 0.31, gebaeude: 3.47 }
        };

        const werte = grundsteuerwerte[data.bundesland] || grundsteuerwerte['nw'];
        const grundwert = (data.grundstuecksflaeche || 0) * werte.grund;
        const gebaeudewert = (data.wohnflaeche || 0) * werte.gebaeude;
        const grundsteuerwert = grundwert + gebaeudewert;
        const grundsteuermessbetrag = grundsteuerwert * 0.31 / 1000;
        const grundsteuerJaehrlich = grundsteuermessbetrag * ((data.hebesatz || 470) / 100);
        const grundsteuerMonatlich = grundsteuerJaehrlich / 12;

        return {
            grundsteuerwert,
            grundsteuermessbetrag,
            grundsteuerJaehrlich,
            grundsteuerMonatlich,
            hebesatz: data.hebesatz || 470,
            vergleich: {
                altesSystem: grundsteuerJaehrlich * 0.8,
                differenz: grundsteuerJaehrlich - (grundsteuerJaehrlich * 0.8)
            }
        };
    }
}

class ErbschaftsteuerCalculator extends BaseCalculator {
    constructor() {
        super('erbschaftsteuer');
    }

    performCalculation(data) {
        const freibetraege = {
            'ehepartner': 500000,
            'kind': 400000,
            'enkel': 200000,
            'eltern': 100000,
            'geschwister': 20000,
            'neffe_nichte': 20000,
            'sonstige': 20000,
            'fremde': 20000
        };

        const freibetrag = freibetraege[data.verwandtschaftsgrad] || 20000;
        let gesamtvermoegen = (data.immobilienwert || 0) + (data.sonstiges_vermoegen || 0);
        
        if (data.immobilienart === 'eigenheim' && data.selbstnutzung) {
            gesamtvermoegen = (data.immobilienwert || 0) * 0.9 + (data.sonstiges_vermoegen || 0);
        }

        const steuerpflichtiger_erwerb = Math.max(0, gesamtvermoegen - freibetrag);
        const erbschaftsteuer = steuerpflichtiger_erwerb * 0.15; // Vereinfacht

        return {
            gesamtvermoegen,
            freibetrag,
            steuerpflichtiger_erwerb,
            erbschaftsteuer,
            effektiver_steuersatz: gesamtvermoegen > 0 ? (erbschaftsteuer / gesamtvermoegen * 100) : 0
        };
    }
}

class SchenkungsteuerCalculator extends BaseCalculator {
    constructor() {
        super('schenkungssteuer');
        this.setupValidation();
    }

    setupValidation() {
        this.addValidationRule('immobilienwert', {
            validator: (value) => value > 0,
            message: 'Immobilienwert muss größer als 0 sein'
        });

        this.addValidationRule('beschenkter', {
            validator: (value) => value && value.length > 0,
            message: 'Beschenkter muss ausgewählt werden'
        });
    }

    performCalculation(data) {
        const freibetraege = {
            'ehepartner': 500000,
            'kind': 400000,
            'enkel': 200000,
            'urenkel': 100000,
            'eltern': 20000,
            'geschwister': 20000,
            'neffe_nichte': 20000,
            'sonstige': 20000,
            'fremde': 20000
        };

        // Tax classes for different relationships
        const steuerklassen = {
            'ehepartner': 1,
            'kind': 1,
            'enkel': 1,
            'urenkel': 1,
            'eltern': 2,
            'geschwister': 2,
            'neffe_nichte': 2,
            'sonstige': 3,
            'fremde': 3
        };

        // Progressive tax rates by tax class
        const steuersaetze = {
            1: [7, 11, 15, 19, 23, 27, 30], // Tax class I
            2: [15, 20, 25, 30, 35, 40, 43], // Tax class II
            3: [30, 30, 30, 30, 50, 50, 50]  // Tax class III
        };

        const wertgrenzen = [75000, 300000, 600000, 6000000, 13000000, 26000000];

        const freibetrag = freibetraege[data.beschenkter] || 20000;
        let schenkungswert = data.immobilienwert || 0;
        
        // Handle different types of gifts
        if (data.schenkungsart === 'teilschenkung') {
            schenkungswert = schenkungswert * ((data.anteil || 100) / 100);
        }
        
        // Calculate usufruct value reduction
        if (data.schenkungsart === 'niesbrauch' && data.niesbrauchswert > 0 && data.alter_schenker) {
            const lebenserwartung = Math.max(1, 85 - data.alter_schenker);
            const kapitalwert = data.niesbrauchswert * lebenserwartung * 0.7; // Simplified calculation
            schenkungswert = Math.max(0, schenkungswert - kapitalwert);
        }

        const gesamterwerb = schenkungswert + (data.vorherige_schenkungen || 0);
        const steuerpflichtiger_erwerb = Math.max(0, gesamterwerb - freibetrag);
        
        // Calculate progressive tax
        let schenkungssteuer = 0;
        if (steuerpflichtiger_erwerb > 0) {
            const steuerklasse = steuerklassen[data.beschenkter] || 3;
            const saetze = steuersaetze[steuerklasse];
            
            let verbleibendesSteuervolumen = steuerpflichtiger_erwerb;
            let letzteGrenze = 0;
            
            for (let i = 0; i < wertgrenzen.length && verbleibendesSteuervolumen > 0; i++) {
                const aktuelleGrenze = wertgrenzen[i];
                const zuVersteuern = Math.min(verbleibendesSteuervolumen, aktuelleGrenze - letzteGrenze);
                schenkungssteuer += zuVersteuern * (saetze[i] / 100);
                verbleibendesSteuervolumen -= zuVersteuern;
                letzteGrenze = aktuelleGrenze;
            }
            
            // Remaining amount at highest rate
            if (verbleibendesSteuervolumen > 0) {
                schenkungssteuer += verbleibendesSteuervolumen * (saetze[saetze.length - 1] / 100);
            }
        }

        const nettoschenkung = schenkungswert - schenkungssteuer;
        const steuerklasse = steuerklassen[data.beschenkter] || 3;

        return {
            schenkungswert,
            gesamterwerb,
            freibetrag,
            steuerpflichtiger_erwerb,
            schenkungssteuer,
            nettoschenkung,
            steuerklasse,
            effektiver_steuersatz: schenkungswert > 0 ? (schenkungssteuer / schenkungswert * 100) : 0
        };
    }
}

class CashflowCalculator extends BaseCalculator {
    constructor() {
        super('cashflow');
    }

    performCalculation(data) {
        const jahre = [];
        let kumulierterCashflow = 0;
        let aktuelle_miete = data.mieteinnahmen || 0;
        const analysezeitraum = data.analysezeitraum || 5;
        
        for (let jahr = 1; jahr <= analysezeitraum; jahr++) {
            if (jahr > 1) {
                aktuelle_miete *= (1 + (data.mietsteigerung || 2.5) / 100);
            }
            
            const jahres_mieteinnahmen = aktuelle_miete * 12;
            const jahres_betriebskosten = (data.betriebskosten || 0) * 12;
            const jahres_finanzierung = (data.finanzierungskosten || 0) * 12;
            const netto_einkommen = jahres_mieteinnahmen - jahres_betriebskosten - jahres_finanzierung;
            const steuerliches_ergebnis = netto_einkommen - (data.abschreibungen || 0);
            const steuern = Math.max(0, steuerliches_ergebnis * ((data.steuersatz || 42) / 100));
            const cashflow_nach_steuern = netto_einkommen - steuern;
            
            kumulierterCashflow += cashflow_nach_steuern;
            
            jahre.push({
                jahr,
                mieteinnahmen: jahres_mieteinnahmen,
                betriebskosten: jahres_betriebskosten,
                finanzierungskosten: jahres_finanzierung,
                netto_einkommen,
                cashflow_nach_steuern,
                kumulierter_cashflow: kumulierterCashflow
            });
        }

        const verkaufs_cashflow = (data.verkaufserloes || 0) * 0.9; // Nach Steuern
        const gesamt_cashflow = kumulierterCashflow + verkaufs_cashflow;

        return {
            jahre,
            kumulierter_cashflow: kumulierterCashflow,
            verkaufs_cashflow,
            gesamt_cashflow,
            durchschnittlicher_cashflow: kumulierterCashflow / analysezeitraum,
            roi: data.verkaufserloes > 0 ? (gesamt_cashflow / data.verkaufserloes * 100) : 0
        };
    }
}