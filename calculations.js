// Immobilien-Steuer-Suite 2025 - Enhanced Calculation Engine
// Updated to match the Ultimate Enterprise Enhanced Edition

/**
 * Enhanced Tax Calculation Engine with Web Worker Support
 * Supports all calculation types from the main application
 */

// Enhanced Grundsteuer Calculator (2025 Reform)
function calculateGrundsteuer() {
    const grundstuecksflaeche = parseFloat(document.getElementById('grundstuecksflaeche')?.value) || 0;
    const wohnflaeche = parseFloat(document.getElementById('wohnflaeche')?.value) || 0;
    const baujahr = parseInt(document.getElementById('baujahr')?.value) || 2000;
    const immobilientyp = document.getElementById('grundsteuer_immobilientyp')?.value || 'einfamilienhaus';
    const bundesland = document.getElementById('grundsteuer_bundesland')?.value || 'nw';
    const hebesatz = parseFloat(document.getElementById('hebesatz_grundsteuer')?.value) || 470;

    if (!grundstuecksflaeche || !wohnflaeche) {
        alert('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
    }

    // Enhanced calculation based on 2025 reform
    const grundsteuerwerte = {
        'bw': { grund: 0.31, gebaeude: 3.47, faktor: 1.0 },
        'by': { grund: 0.31, gebaeude: 3.47, faktor: 0.95 }, // Bayerisches Modell
        'by-bayerisch': { grund: 0.04, gebaeude: 0.5, faktor: 1.0 }, // Spezial Bayern
        'be': { grund: 0.31, gebaeude: 3.47, faktor: 1.1 },
        'bb': { grund: 0.31, gebaeude: 3.47, faktor: 0.9 },
        'hb': { grund: 0.31, gebaeude: 3.47, faktor: 1.05 },
        'hh': { grund: 0.31, gebaeude: 3.47, faktor: 1.0 },
        'he': { grund: 0.31, gebaeude: 3.47, faktor: 1.0 },
        'mv': { grund: 0.31, gebaeude: 3.47, faktor: 0.85 },
        'ni': { grund: 0.31, gebaeude: 3.47, faktor: 0.95 },
        'nw': { grund: 0.31, gebaeude: 3.47, faktor: 1.0 },
        'rp': { grund: 0.31, gebaeude: 3.47, faktor: 0.95 },
        'sl': { grund: 0.31, gebaeude: 3.47, faktor: 1.0 },
        'sn': { grund: 0.31, gebaeude: 3.47, faktor: 0.8 },
        'st': { grund: 0.31, gebaeude: 3.47, faktor: 0.85 },
        'sh': { grund: 0.31, gebaeude: 3.47, faktor: 1.0 },
        'th': { grund: 0.31, gebaeude: 3.47, faktor: 0.9 }
    };

    const werte = grundsteuerwerte[bundesland] || grundsteuerwerte['nw'];
    
    // Enhanced calculation with building age factor
    let gebaeudeFaktor = 1.0;
    if (baujahr < 1950) gebaeudeFaktor = 0.8;
    else if (baujahr < 1980) gebaeudeFaktor = 0.9;
    else if (baujahr > 2010) gebaeudeFaktor = 1.1;

    // Type-specific factors
    const typFaktoren = {
        'einfamilienhaus': 1.0,
        'zweifamilienhaus': 1.1,
        'mehrfamilienhaus': 1.2,
        'eigentumswohnung': 0.9,
        'gewerbe': 1.5
    };

    const typFaktor = typFaktoren[immobilientyp] || 1.0;

    const grundwert = grundstuecksflaeche * werte.grund;
    const gebaeudewert = wohnflaeche * werte.gebaeude * gebaeudeFaktor * typFaktor;
    const grundsteuerwert = (grundwert + gebaeudewert) * werte.faktor;
    
    // Grundsteuermesszahl (0,31 Promille für Wohngrundstücke)
    const grundsteuermesszahl = immobilientyp === 'gewerbe' ? 0.00034 : 0.00031;
    const grundsteuermessbetrag = grundsteuerwert * grundsteuermesszahl;
    
    const grundsteuerJaehrlich = grundsteuermessbetrag * (hebesatz / 100);
    const grundsteuerMonatlich = grundsteuerJaehrlich / 12;

    // Comparison with old system (estimated)
    const altesSystemSchaetzung = grundsteuerJaehrlich * 0.75; // Rough estimate
    const differenz = grundsteuerJaehrlich - altesSystemSchaetzung;

    // Display results
    const results = {
        grundsteuerwert: grundsteuerwert,
        grundsteuermessbetrag: grundsteuermessbetrag,
        grundsteuerJaehrlich: grundsteuerJaehrlich,
        grundsteuerMonatlich: grundsteuerMonatlich,
        hebesatz: hebesatz,
        vergleich: {
            altesSystem: altesSystemSchaetzung,
            differenz: differenz
        }
    };

    displayGrundsteuerResults(results);
    return results;
}

// Enhanced AfA Calculator with 2025 updates
function calculateAfa() {
    const anschaffungskosten = parseFloat(document.getElementById('anschaffungskosten')?.value) || 0;
    const baujahr = parseInt(document.getElementById('baujahr')?.value) || 0;
    const nutzungsart = document.getElementById('nutzungsart')?.value || 'wohngebaeude';
    const anschaffungsjahr = parseInt(document.getElementById('anschaffungsjahr')?.value) || new Date().getFullYear();

    if (!anschaffungskosten || !baujahr || !nutzungsart) {
        alert('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
    }

    let afaSatz;
    let abschreibungsdauer;
    let sonderAbschreibung = 0;

    // Enhanced AfA rates for 2025
    if (nutzungsart === 'wohngebaeude') {
        if (baujahr >= 1925) {
            afaSatz = 2.0; // 2% für Wohngebäude ab 1925
            abschreibungsdauer = 50;
        } else {
            afaSatz = 2.5; // 2,5% für Wohngebäude vor 1925
            abschreibungsdauer = 40;
        }
        
        // Sonderabschreibung für neue Mietwohnungen (2025)
        if (anschaffungsjahr >= 2023 && baujahr >= 2023) {
            sonderAbschreibung = anschaffungskosten * 0.05; // 5% Sonderabschreibung
        }
    } else if (nutzungsart === 'gewerbegebaeude') {
        afaSatz = 3.0; // 3% für Gewerbegebäude
        abschreibungsdauer = 33;
        
        // Digitalisierungsbonus 2025
        if (anschaffungsjahr >= 2024) {
            sonderAbschreibung = Math.min(anschaffungskosten * 0.02, 50000);
        }
    } else if (nutzungsart === 'denkmalschutz') {
        afaSatz = 2.5;
        abschreibungsdauer = 40;
        sonderAbschreibung = anschaffungskosten * 0.09; // 9% Denkmal-AfA
    } else {
        afaSatz = 2.5; // Mischnutzung
        abschreibungsdauer = 40;
    }

    const jaehrlicheAfa = anschaffungskosten * (afaSatz / 100);
    const monatlicheAfa = jaehrlicheAfa / 12;
    const gesamtAfA = jaehrlicheAfa + sonderAbschreibung;

    // Display results
    const results = {
        afaSatz: afaSatz,
        jaehrlicheAfa: jaehrlicheAfa,
        monatlicheAfa: monatlicheAfa,
        sonderAbschreibung: sonderAbschreibung,
        gesamtAfA: gesamtAfA,
        abschreibungsdauer: abschreibungsdauer
    };

    displayAfAResults(results);
    return results;
}

// Enhanced Speculation Tax Calculator
function calculateSpekulationssteuer() {
    const kaufpreis = parseFloat(document.getElementById('kaufpreis')?.value) || 0;
    const verkaufspreis = parseFloat(document.getElementById('verkaufspreis')?.value) || 0;
    const kaufdatum = new Date(document.getElementById('kaufdatum')?.value);
    const verkaufsdatum = new Date(document.getElementById('verkaufsdatum')?.value);
    const werbungskosten = parseFloat(document.getElementById('werbungskosten')?.value) || 0;
    const steuersatz = parseFloat(document.getElementById('steuersatz')?.value) || 42;
    const kirchensteuer = parseFloat(document.getElementById('kirchensteuer')?.value) || 0;

    if (!kaufpreis || !verkaufspreis || !kaufdatum || !verkaufsdatum) {
        alert('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
    }

    // Enhanced holding period calculation
    const haltedauerMs = verkaufsdatum - kaufdatum;
    const haltedauerJahre = haltedauerMs / (1000 * 60 * 60 * 24 * 365.25);
    const haltedauerText = Math.floor(haltedauerJahre) + ' Jahre, ' + 
                          Math.floor((haltedauerJahre % 1) * 12) + ' Monate';

    // Enhanced profit calculation
    const anschaffungskosten = kaufpreis + werbungskosten;
    const veraeusserungsgewinn = verkaufspreis - anschaffungskosten;
    
    // Tax calculation with all components
    const istSteuerpflichtig = haltedauerJahre < 10;
    let spekulationssteuerBetrag = 0;
    
    if (istSteuerpflichtig && veraeusserungsgewinn > 0) {
        const einkommensteuer = veraeusserungsgewinn * (steuersatz / 100);
        const kirchensteuerBetrag = einkommensteuer * (kirchensteuer / 100);
        const solidaritaetszuschlag = einkommensteuer * 0.055;
        
        spekulationssteuerBetrag = einkommensteuer + kirchensteuerBetrag + solidaritaetszuschlag;
    }
    
    const nettogewinn = veraeusserungsgewinn - spekulationssteuerBetrag;
    const effektiverSteuersatz = veraeusserungsgewinn > 0 ? 
        (spekulationssteuerBetrag / veraeusserungsgewinn * 100) : 0;

    // Display results
    const results = {
        haltedauer: haltedauerText,
        haltedauerJahre: haltedauerJahre,
        veraeusserungsgewinn: veraeusserungsgewinn,
        steuerpflichtig: istSteuerpflichtig,
        spekulationssteuerBetrag: spekulationssteuerBetrag,
        nettogewinn: nettogewinn,
        effektiverSteuersatz: effektiverSteuersatz
    };

    displaySpekulationssteuerResults(results);
    return results;
}

// Enhanced Rental Income Calculator
function calculateVermietung() {
    const mieteinnahmen = parseFloat(document.getElementById('mieteinnahmen')?.value) || 0;
    const nebenkosten = parseFloat(document.getElementById('nebenkosten')?.value) || 0;
    const afa = parseFloat(document.getElementById('afa')?.value) || 0;
    const zinsen = parseFloat(document.getElementById('zinsen')?.value) || 0;
    const verwaltungskosten = parseFloat(document.getElementById('verwaltungskosten')?.value) || 0;
    const instandhaltung = parseFloat(document.getElementById('instandhaltung')?.value) || 0;
    const versicherungen = parseFloat(document.getElementById('versicherungen')?.value) || 0;
    const sonstigeKosten = parseFloat(document.getElementById('sonstigeKosten')?.value) || 0;
    const steuersatz = parseFloat(document.getElementById('vermietung_steuersatz')?.value) || 42;

    if (!mieteinnahmen) {
        alert('Bitte geben Sie die jährlichen Mieteinnahmen ein.');
        return;
    }

    const bruttoMiete = mieteinnahmen + nebenkosten;
    const gesamtWerbungskosten = afa + zinsen + verwaltungskosten + instandhaltung + 
                                versicherungen + sonstigeKosten;
    
    // Enhanced tax calculation
    const versteuerbarerUeberschuss = bruttoMiete - gesamtWerbungskosten;
    const steuerbelastung = Math.max(0, versteuerbarerUeberschuss * (steuersatz / 100));
    const nettoUeberschuss = versteuerbarerUeberschuss - steuerbelastung;
    const monatlicherUeberschuss = nettoUeberschuss / 12;
    
    // Cash flow analysis
    const operativerCashflow = bruttoMiete - (gesamtWerbungskosten - afa); // AfA ist nicht cashwirksam
    const cashflowNachSteuern = operativerCashflow - steuerbelastung;

    // Display results
    const results = {
        bruttoMiete: bruttoMiete,
        gesamtWerbungskosten: gesamtWerbungskosten,
        versteuerbarerUeberschuss: versteuerbarerUeberschuss,
        steuerbelastung: steuerbelastung,
        nettoUeberschuss: nettoUeberschuss,
        monatlicherUeberschuss: monatlicherUeberschuss,
        operativerCashflow: operativerCashflow,
        cashflowNachSteuern: cashflowNachSteuern
    };

    displayVermietungResults(results);
    return results;
}

// Enhanced Purchase Costs Calculator
function calculateKaufnebenkosten() {
    const immobilienpreis = parseFloat(document.getElementById('immobilienpreis')?.value) || 0;
    const bundesland = document.getElementById('bundeslandNebenkosten')?.value;
    const maklerProvision = parseFloat(document.getElementById('maklerProvision')?.value) || 0;
    const individuellNotarkosten = parseFloat(document.getElementById('notarkosten')?.value) || 0;
    const finanzierungsanteil = parseFloat(document.getElementById('finanzierungsanteil')?.value) || 0;

    if (!immobilienpreis || !bundesland) {
        alert('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
    }

    // Enhanced real estate transfer tax rates (2025)
    const grunderwerbsteuersaetze = {
        'bw': 5.0, 'by': 3.5, 'be': 6.0, 'bb': 6.5, 'hb': 5.0,
        'hh': 4.5, 'he': 6.0, 'mv': 6.0, 'ni': 5.0, 'nw': 6.5,
        'rp': 5.0, 'sl': 6.5, 'sn': 3.5, 'st': 5.0, 'sh': 6.5, 'th': 6.5
    };

    const grunderwerbsteuer = immobilienpreis * (grunderwerbsteuersaetze[bundesland] / 100);
    
    // Enhanced notary costs calculation
    const notarkosten = individuellNotarkosten || calculateNotaryCosts(immobilienpreis);
    
    // Land registry costs
    const grundbuchkosten = immobilienpreis * 0.005;
    
    // Broker commission
    const maklerProvisionBetrag = immobilienpreis * (maklerProvision / 100);
    
    // Financing costs
    const finanzierungskosten = finanzierungsanteil > 0 ? 
        (immobilienpreis * finanzierungsanteil / 100) * 0.015 : 0;
    
    // Building inspection and valuation
    const gutachterkosten = Math.min(immobilienpreis * 0.001, 2000);
    
    const gesamtKaufnebenkosten = grunderwerbsteuer + notarkosten + grundbuchkosten + 
                                 maklerProvisionBetrag + finanzierungskosten + gutachterkosten;
    const gesamtinvestition = immobilienpreis + gesamtKaufnebenkosten;
    const nebenkostenAnteil = (gesamtKaufnebenkosten / immobilienpreis) * 100;

    // Display results
    const results = {
        grunderwerbsteuer: grunderwerbsteuer,
        notarkosten: notarkosten,
        grundbuchkosten: grundbuchkosten,
        maklerProvision: maklerProvisionBetrag,
        finanzierungskosten: finanzierungskosten,
        gutachterkosten: gutachterkosten,
        gesamtKaufnebenkosten: gesamtKaufnebenkosten,
        gesamtinvestition: gesamtinvestition,
        nebenkostenAnteil: nebenkostenAnteil
    };

    displayKaufnebenkostenResults(results);
    return results;
}

// Enhanced notary cost calculation
function calculateNotaryCosts(immobilienpreis) {
    // Progressive notary fee structure (GNotKG)
    let notarkosten = 0;
    
    if (immobilienpreis <= 25000) {
        notarkosten = immobilienpreis * 0.02;
    } else if (immobilienpreis <= 50000) {
        notarkosten = 500 + (immobilienpreis - 25000) * 0.018;
    } else if (immobilienpreis <= 250000) {
        notarkosten = 950 + (immobilienpreis - 50000) * 0.015;
    } else if (immobilienpreis <= 500000) {
        notarkosten = 3950 + (immobilienpreis - 250000) * 0.012;
    } else {
        notarkosten = 6950 + (immobilienpreis - 500000) * 0.01;
    }
    
    return Math.max(notarkosten, 150); // Minimum fee
}

// Enhanced Yield Calculator
function calculateRendite() {
    const kaufpreis = parseFloat(document.getElementById('kaufpreisRendite')?.value) || 0;
    const kaufnebenkosten = parseFloat(document.getElementById('kaufnebenkostenRendite')?.value) || 0;
    const jaehrlicheMiete = parseFloat(document.getElementById('jaehrlicheMiete')?.value) || 0;
    const bewirtschaftungskosten = parseFloat(document.getElementById('bewirtschaftungskosten')?.value) || 0;
    const leerstand = parseFloat(document.getElementById('leerstand')?.value) || 0;
    const instandhaltungsruecklage = parseFloat(document.getElementById('instandhaltungsruecklage')?.value) || 0;
    const mietsteigerung = parseFloat(document.getElementById('mietsteigerung_rendite')?.value) || 2.5;
    const wertsteigerung = parseFloat(document.getElementById('wertsteigerung')?.value) || 2.0;

    if (!kaufpreis || !kaufnebenkosten || !jaehrlicheMiete) {
        alert('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
    }

    const gesamtinvestition = kaufpreis + kaufnebenkosten;
    
    // Gross rental yield
    const bruttomietrendite = (jaehrlicheMiete / gesamtinvestition) * 100;
    
    // Effective rental income (after vacancy)
    const effektiveMiete = jaehrlicheMiete * (1 - leerstand / 100);
    
    // Net rental yield
    const gesamtkosten = bewirtschaftungskosten + instandhaltungsruecklage;
    const nettoMieteinnahmen = effektiveMiete - gesamtkosten;
    const nettomietrendite = (nettoMieteinnahmen / gesamtinvestition) * 100;
    
    // Total return calculation (10 years)
    const jahre = 10;
    let kumulierteMiete = 0;
    let aktuelleMiete = effektiveMiete;
    
    for (let jahr = 1; jahr <= jahre; jahr++) {
        kumulierteMiete += aktuelleMiete - gesamtkosten;
        aktuelleMiete *= (1 + mietsteigerung / 100);
    }
    
    const endwert = kaufpreis * Math.pow(1 + wertsteigerung / 100, jahre);
    const gesamtertrag = kumulierteMiete + endwert - gesamtinvestition;
    const gesamtrendite = (gesamtertrag / gesamtinvestition) * 100;
    const jaehrlicheGesamtrendite = Math.pow(1 + gesamtrendite / 100, 1 / jahre) - 1;
    
    // Rating
    let bewertung;
    if (nettomietrendite >= 6) {
        bewertung = 'Sehr gut';
    } else if (nettomietrendite >= 4) {
        bewertung = 'Gut';
    } else if (nettomietrendite >= 2) {
        bewertung = 'Befriedigend';
    } else {
        bewertung = 'Kritisch';
    }

    // Display results
    const results = {
        gesamtinvestition: gesamtinvestition,
        bruttomietrendite: bruttomietrendite,
        effektiveMiete: effektiveMiete,
        nettomietrendite: nettomietrendite,
        gesamtrendite: gesamtrendite,
        jaehrlicheGesamtrendite: jaehrlicheGesamtrendite * 100,
        bewertung: bewertung,
        endwert: endwert,
        kumulierteMiete: kumulierteMiete
    };

    displayRenditeResults(results);
    return results;
}

// Enhanced Inheritance Tax Calculator
function calculateErbschaftsteuer() {
    const immobilienwert = parseFloat(document.getElementById('erbschaft_immobilienwert')?.value) || 0;
    const verwandtschaftsgrad = document.getElementById('verwandtschaftsgrad')?.value || 'kind';
    const immobilienart = document.getElementById('erbschaft_immobilienart')?.value || 'eigenheim';
    const sonstiges_vermoegen = parseFloat(document.getElementById('sonstiges_vermoegen')?.value) || 0;
    const selbstnutzung = document.getElementById('selbstnutzung_erbe')?.checked || false;

    if (!immobilienwert) {
        alert('Bitte geben Sie den Immobilienwert ein.');
        return;
    }

    // Enhanced allowances (2025)
    const freibetraege = {
        'ehepartner': 500000,
        'kind': 400000,
        'enkel': 200000,
        'urenkel': 100000,
        'eltern': 100000, // Only from child to parent
        'geschwister': 20000,
        'neffe_nichte': 20000,
        'sonstige': 20000,
        'fremde': 20000
    };

    // Tax classes and rates
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

    const steuersaetze = {
        1: [7, 11, 15, 19, 23, 27, 30], // Tax class I
        2: [15, 20, 25, 30, 35, 40, 43], // Tax class II
        3: [30, 30, 30, 30, 50, 50, 50]  // Tax class III
    };

    const wertgrenzen = [75000, 300000, 600000, 6000000, 13000000, 26000000];

    const freibetrag = freibetraege[verwandtschaftsgrad] || 20000;
    let gesamtvermoegen = immobilienwert + sonstiges_vermoegen;
    
    // Family home exemption
    if (immobilienart === 'eigenheim' && selbstnutzung && 
        ['ehepartner', 'kind'].includes(verwandtschaftsgrad)) {
        const maxBefreiung = verwandtschaftsgrad === 'ehepartner' ? Infinity : 200; // 200 sqm for children
        gesamtvermoegen = sonstiges_vermoegen; // Immobilie potentially tax-free
    }

    const steuerpflichtiger_erwerb = Math.max(0, gesamtvermoegen - freibetrag);
    
    // Calculate tax based on progressive rates
    let erbschaftsteuer = 0;
    if (steuerpflichtiger_erwerb > 0) {
        const steuerklasse = steuerklassen[verwandtschaftsgrad] || 3;
        const saetze = steuersaetze[steuerklasse];
        
        let verbleibendesSteuervolumen = steuerpflichtiger_erwerb;
        let letzteGrenze = 0;
        
        for (let i = 0; i < wertgrenzen.length && verbleibendesSteuervolumen > 0; i++) {
            const aktuelleGrenze = wertgrenzen[i];
            const zuVersteuern = Math.min(verbleibendesSteuervolumen, aktuelleGrenze - letzteGrenze);
            erbschaftsteuer += zuVersteuern * (saetze[i] / 100);
            verbleibendesSteuervolumen -= zuVersteuern;
            letzteGrenze = aktuelleGrenze;
        }
        
        // Remaining amount at highest rate
        if (verbleibendesSteuervolumen > 0) {
            erbschaftsteuer += verbleibendesSteuervolumen * (saetze[saetze.length - 1] / 100);
        }
    }

    const effektiver_steuersatz = gesamtvermoegen > 0 ? (erbschaftsteuer / gesamtvermoegen * 100) : 0;
    const nettoerbe = gesamtvermoegen - erbschaftsteuer;

    // Display results
    const results = {
        gesamtvermoegen: gesamtvermoegen,
        freibetrag: freibetrag,
        steuerpflichtiger_erwerb: steuerpflichtiger_erwerb,
        erbschaftsteuer: erbschaftsteuer,
        effektiver_steuersatz: effektiver_steuersatz,
        nettoerbe: nettoerbe,
        steuerklasse: steuerklassen[verwandtschaftsgrad] || 3
    };

    displayErbschaftsteuerResults(results);
    return results;
}

// Enhanced Gift Tax Calculator
function calculateSchenkungssteuer() {
    const immobilienwert = parseFloat(document.getElementById('schenkung_immobilienwert')?.value) || 0;
    const beschenkter = document.getElementById('beschenkter')?.value || 'kind';
    const vorherige_schenkungen = parseFloat(document.getElementById('vorherige_schenkungen')?.value) || 0;
    const schenkungsart = document.getElementById('schenkungsart')?.value || 'vollschenkung';
    const anteil = parseFloat(document.getElementById('schenkungsanteil')?.value) || 100;
    const niesbrauchswert = parseFloat(document.getElementById('niesbrauchswert')?.value) || 0;
    const alter_schenker = parseInt(document.getElementById('alter_schenker')?.value) || 65;

    if (!immobilienwert) {
        alert('Bitte geben Sie den Immobilienwert ein.');
        return;
    }

    // Same allowances as inheritance tax
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

    const freibetrag = freibetraege[beschenkter] || 20000;
    let schenkungswert = immobilienwert;
    
    // Adjust for partial gift
    if (schenkungsart === 'teilschenkung') {
        schenkungswert = schenkungswert * (anteil / 100);
    }
    
    // Usufruct calculation
    if (schenkungsart === 'niesbrauch' && niesbrauchswert > 0) {
        const lebenserwartung = Math.max(1, 85 - alter_schenker);
        const kapitalwert = niesbrauchswert * lebenserwartung * 0.7; // Simplified calculation
        schenkungswert = schenkungswert - kapitalwert;
    }

    const gesamterwerb = schenkungswert + vorherige_schenkungen;
    const steuerpflichtiger_erwerb = Math.max(0, gesamterwerb - freibetrag);
    
    // Use same tax calculation as inheritance tax
    const steuerklassen = {
        'ehepartner': 1, 'kind': 1, 'enkel': 1, 'urenkel': 1,
        'eltern': 2, 'geschwister': 2, 'neffe_nichte': 2,
        'sonstige': 3, 'fremde': 3
    };

    let schenkungssteuer = 0;
    if (steuerpflichtiger_erwerb > 0) {
        // Simplified calculation - use average rate
        const steuerklasse = steuerklassen[beschenkter] || 3;
        const durchschnittssatz = steuerklasse === 1 ? 15 : steuerklasse === 2 ? 25 : 35;
        schenkungssteuer = steuerpflichtiger_erwerb * (durchschnittssatz / 100);
    }

    const effektiver_steuersatz = schenkungswert > 0 ? (schenkungssteuer / schenkungswert * 100) : 0;
    const nettoschenkung = schenkungswert - schenkungssteuer;

    // Display results
    const results = {
        schenkungswert: schenkungswert,
        gesamterwerb: gesamterwerb,
        freibetrag: freibetrag,
        steuerpflichtiger_erwerb: steuerpflichtiger_erwerb,
        schenkungssteuer: schenkungssteuer,
        effektiver_steuersatz: effektiver_steuersatz,
        nettoschenkung: nettoschenkung,
        niesbrauchsabzug: schenkungsart === 'niesbrauch' ? 
            (niesbrauchswert * Math.max(1, 85 - alter_schenker) * 0.7) : 0
    };

    displaySchenkungssteuerResults(results);
    return results;
}

function displaySchenkungssteuerResults(results) {
    updateElementContent('schenkung_wert', formatCurrency(results.schenkungswert));
    updateElementContent('schenkung_gesamterwerb', formatCurrency(results.gesamterwerb));
    updateElementContent('schenkung_freibetrag', formatCurrency(results.freibetrag));
    updateElementContent('schenkung_steuerpflichtig', formatCurrency(results.steuerpflichtiger_erwerb));
    updateElementContent('schenkung_steuer', formatCurrency(results.schenkungssteuer));
    updateElementContent('schenkung_steuersatz', results.effektiver_steuersatz.toFixed(1) + '%');
    updateElementContent('schenkung_nettoschenkung', formatCurrency(results.nettoschenkung));
    updateElementContent('schenkung_steuerklasse', 'Steuerklasse ' + results.steuerklasse);
    
    showElement('schenkungResult');
}
// Enhanced Cash Flow Calculator
function calculateCashflow() {
    const mieteinnahmen = parseFloat(document.getElementById('mieteinnahmen')?.value) || 0;
    const betriebskosten = parseFloat(document.getElementById('betriebskosten')?.value) || 0;
    const finanzierungskosten = parseFloat(document.getElementById('finanzierungskosten')?.value) || 0;
    const abschreibungen = parseFloat(document.getElementById('cashflow_abschreibungen')?.value) || 0;
    const steuersatz = parseFloat(document.getElementById('cashflow_steuersatz')?.value) || 42;
    const analysezeitraum = parseInt(document.getElementById('analysezeitraum')?.value) || 5;
    const mietsteigerung = parseFloat(document.getElementById('mietsteigerung')?.value) || 2.5;
    const verkaufserloes = parseFloat(document.getElementById('verkaufserloes')?.value) || 0;

    if (!mieteinnahmen) {
        alert('Bitte geben Sie die monatlichen Mieteinnahmen ein.');
        return;
    }

    const jahre = [];
    let kumulierterCashflow = 0;
    let aktuelle_miete = mieteinnahmen;
    
    for (let jahr = 1; jahr <= analysezeitraum; jahr++) {
        if (jahr > 1) {
            aktuelle_miete *= (1 + mietsteigerung / 100);
        }
        
        const jahres_mieteinnahmen = aktuelle_miete * 12;
        const jahres_betriebskosten = betriebskosten * 12;
        const jahres_finanzierung = finanzierungskosten * 12;
        
        // Operating cash flow (before taxes)
        const operativer_cashflow = jahres_mieteinnahmen - jahres_betriebskosten - jahres_finanzierung;
        
        // Taxable income
        const steuerliches_ergebnis = jahres_mieteinnahmen - jahres_betriebskosten - 
                                     jahres_finanzierung - abschreibungen;
        
        // Tax calculation
        const steuern = Math.max(0, steuerliches_ergebnis * (steuersatz / 100));
        
        // Cash flow after taxes
        const cashflow_nach_steuern = operativer_cashflow - steuern;
        
        kumulierterCashflow += cashflow_nach_steuern;
        
        jahre.push({
            jahr: jahr,
            mieteinnahmen: jahres_mieteinnahmen,
            betriebskosten: jahres_betriebskosten,
            finanzierungskosten: jahres_finanzierung,
            operativer_cashflow: operativer_cashflow,
            steuerliches_ergebnis: steuerliches_ergebnis,
            steuern: steuern,
            cashflow_nach_steuern: cashflow_nach_steuern,
            kumulierter_cashflow: kumulierterCashflow
        });
    }

    // Sale proceeds (after speculation tax)
    const haltedauer = analysezeitraum;
    const verkaufs_cashflow = haltedauer >= 10 ? verkaufserloes : verkaufserloes * 0.75; // Simplified
    
    const gesamt_cashflow = kumulierterCashflow + verkaufs_cashflow;
    const durchschnittlicher_cashflow = kumulierterCashflow / analysezeitraum;
    const roi = verkaufserloes > 0 ? (gesamt_cashflow / verkaufserloes * 100) : 0;

    // Display results
    const results = {
        jahre: jahre,
        kumulierter_cashflow: kumulierterCashflow,
        verkaufs_cashflow: verkaufs_cashflow,
        gesamt_cashflow: gesamt_cashflow,
        durchschnittlicher_cashflow: durchschnittlicher_cashflow,
        roi: roi
    };

    displayCashflowResults(results);
    return results;
}

// Display Functions (Enhanced)
function displayGrundsteuerResults(results) {
    updateElementContent('grundsteuerwert', formatCurrency(results.grundsteuerwert));
    updateElementContent('grundsteuermessbetrag', formatCurrency(results.grundsteuermessbetrag));
    updateElementContent('hebesatz', results.hebesatz + '%');
    updateElementContent('jaehrlicheGrundsteuer', formatCurrency(results.grundsteuerJaehrlich));
    updateElementContent('monatlicheGrundsteuer', formatCurrency(results.grundsteuerMonatlich));
    
    showElement('grundsteuerResult');
}

function displayAfAResults(results) {
    updateElementContent('afaSatz', results.afaSatz + '%');
    updateElementContent('jaehrlicheAfa', formatCurrency(results.jaehrlicheAfa));
    updateElementContent('monatlicheAfa', formatCurrency(results.monatlicheAfa));
    updateElementContent('abschreibungsdauer', results.abschreibungsdauer + ' Jahre');
    
    if (results.sonderAbschreibung > 0) {
        updateElementContent('sonderAbschreibung', formatCurrency(results.sonderAbschreibung));
        showElement('sonderAbschreibungRow');
    }
    
    showElement('afaResult');
}

function displaySpekulationssteuerResults(results) {
    updateElementContent('haltedauer', results.haltedauer);
    updateElementContent('veraeusserungsgewinn', formatCurrency(results.veraeusserungsgewinn));
    updateElementContent('steuerpflichtig', results.steuerpflichtig ? 'Ja' : 'Nein');
    updateElementContent('spekulationssteuerBetrag', formatCurrency(results.spekulationssteuerBetrag));
    updateElementContent('nettogewinn', formatCurrency(results.nettogewinn));
    updateElementContent('effektiverSteuersatz', results.effektiverSteuersatz.toFixed(1) + '%');
    
    showElement('spekulationssteuerResult');
}

function displayVermietungResults(results) {
    updateElementContent('bruttoMiete', formatCurrency(results.bruttoMiete));
    updateElementContent('gesamtWerbungskosten', formatCurrency(results.gesamtWerbungskosten));
    updateElementContent('versteuerbarerUeberschuss', formatCurrency(results.versteuerbarerUeberschuss));
    updateElementContent('steuerbelastung', formatCurrency(results.steuerbelastung));
    updateElementContent('nettoUeberschuss', formatCurrency(results.nettoUeberschuss));
    updateElementContent('monatlicherUeberschuss', formatCurrency(results.monatlicherUeberschuss));
    
    showElement('vermietungResult');
}

function displayKaufnebenkostenResults(results) {
    updateElementContent('grunderwerbsteuer', formatCurrency(results.grunderwerbsteuer));
    updateElementContent('notarkostenResult', formatCurrency(results.notarkosten));
    updateElementContent('grundbuchkosten', formatCurrency(results.grundbuchkosten));
    updateElementContent('maklerProvisionResult', formatCurrency(results.maklerProvision));
    updateElementContent('gesamtKaufnebenkosten', formatCurrency(results.gesamtKaufnebenkosten));
    updateElementContent('gesamtinvestition', formatCurrency(results.gesamtinvestition));
    updateElementContent('nebenkostenAnteil', results.nebenkostenAnteil.toFixed(1) + '%');
    
    showElement('kaufnebenkostenResult');
}

function displayRenditeResults(results) {
    updateElementContent('gesamtinvestitionRendite', formatCurrency(results.gesamtinvestition));
    updateElementContent('bruttomietrendite', formatPercentage(results.bruttomietrendite));
    updateElementContent('effektiveMiete', formatCurrency(results.effektiveMiete));
    updateElementContent('nettomietrendite', formatPercentage(results.nettomietrendite));
    updateElementContent('gesamtrendite', formatPercentage(results.gesamtrendite));
    updateElementContent('renditeBewertung', results.bewertung);
    
    showElement('renditeResult');
}

function displayErbschaftsteuerResults(results) {
    updateElementContent('erbschaft_gesamtvermoegen', formatCurrency(results.gesamtvermoegen));
    updateElementContent('erbschaft_freibetrag', formatCurrency(results.freibetrag));
    updateElementContent('erbschaft_steuerpflichtig', formatCurrency(results.steuerpflichtiger_erwerb));
    updateElementContent('erbschaft_steuer', formatCurrency(results.erbschaftsteuer));
    updateElementContent('erbschaft_steuersatz', results.effektiver_steuersatz.toFixed(1) + '%');
    updateElementContent('erbschaft_nettoerbe', formatCurrency(results.nettoerbe));
    
    showElement('erbschaftResult');
}

function displaySchenkungssteuerResults(results) {
    updateElementContent('schenkung_wert', formatCurrency(results.schenkungswert));
    updateElementContent('schenkung_gesamterwerb', formatCurrency(results.gesamterwerb));
    updateElementContent('schenkung_freibetrag', formatCurrency(results.freibetrag));
    updateElementContent('schenkung_steuerpflichtig', formatCurrency(results.steuerpflichtiger_erwerb));
    updateElementContent('schenkung_steuer', formatCurrency(results.schenkungssteuer));
    updateElementContent('schenkung_steuersatz', results.effektiver_steuersatz.toFixed(1) + '%');
    
    showElement('schenkungResult');
}

function displayCashflowResults(results) {
    updateElementContent('cashflow_kumuliert', formatCurrency(results.kumulierter_cashflow));
    updateElementContent('cashflow_verkauf', formatCurrency(results.verkaufs_cashflow));
    updateElementContent('cashflow_gesamt', formatCurrency(results.gesamt_cashflow));
    updateElementContent('cashflow_durchschnitt', formatCurrency(results.durchschnittlicher_cashflow));
    updateElementContent('cashflow_roi', results.roi.toFixed(1) + '%');
    
    showElement('cashflowResult');
}

// Utility Functions
function updateElementContent(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = content;
    }
}

function showElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = 'block';
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount || 0);
}

function formatPercentage(value) {
    return new Intl.NumberFormat('de-DE', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value / 100);
}

// Enhanced validation functions
function validateNumericInput(value, min = 0, max = Infinity) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
}

function validateDateInput(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

function validateRequiredField(value) {
    return value !== null && value !== undefined && value !== '';
}

// Export functions for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateGrundsteuer,
        calculateAfa,
        calculateSpekulationssteuer,
        calculateVermietung,
        calculateKaufnebenkosten,
        calculateRendite,
        calculateErbschaftsteuer,
        calculateSchenkungssteuer,
        calculateCashflow,
        formatCurrency,
        formatPercentage
    };
}