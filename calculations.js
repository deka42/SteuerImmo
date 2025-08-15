// Immobilien-Steuer-Suite 2025 - Berechnungslogik

// Grundsteuer-Rechner
function calculateGrundsteuer() {
    const grundstueckswert = parseFloat(document.getElementById('grundstueckswert').value) || 0;
    const gebaeudewert = parseFloat(document.getElementById('gebaeudewert').value) || 0;
    const bundesland = document.getElementById('bundesland').value;
    const wohnflaeche = parseFloat(document.getElementById('wohnflaeche').value) || 0;
    const grundstuecksflaeche = parseFloat(document.getElementById('grundstuecksflaeche').value) || 0;

    if (!grundstueckswert || !gebaeudewert || !bundesland || !wohnflaeche || !grundstuecksflaeche) {
        alert('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
    }

    // Grundsteuerwert berechnen
    const grundsteuerwert = grundstueckswert + gebaeudewert;
    
    // Grundsteuermesszahl (vereinfacht)
    const grundsteuermesszahl = 0.00031; // 0,31 Promille für Wohngrundstücke
    const grundsteuermessbetrag = grundsteuerwert * grundsteuermesszahl;
    
    // Hebesätze nach Bundesland (Durchschnittswerte)
    const hebesaetze = {
        'bw': 380, 'by': 535, 'be': 810, 'bb': 350, 'hb': 635,
        'hh': 540, 'he': 460, 'mv': 340, 'ni': 480, 'nw': 440,
        'rp': 390, 'sl': 480, 'sn': 420, 'st': 350, 'sh': 380, 'th': 450
    };
    
    const hebesatz = hebesaetze[bundesland] || 400;
    const jaehrlicheGrundsteuer = grundsteuermessbetrag * hebesatz / 100;
    const monatlicheGrundsteuer = jaehrlicheGrundsteuer / 12;

    // Ergebnisse anzeigen
    document.getElementById('grundsteuerwert').textContent = formatCurrency(grundsteuerwert);
    document.getElementById('grundsteuermessbetrag').textContent = formatCurrency(grundsteuermessbetrag);
    document.getElementById('hebesatz').textContent = hebesatz + '%';
    document.getElementById('jaehrlicheGrundsteuer').textContent = formatCurrency(jaehrlicheGrundsteuer);
    document.getElementById('monatlicheGrundsteuer').textContent = formatCurrency(monatlicheGrundsteuer);
    
    document.getElementById('grundsteuerResult').style.display = 'block';
}

// AfA-Rechner
function calculateAfa() {
    const anschaffungskosten = parseFloat(document.getElementById('anschaffungskosten').value) || 0;
    const baujahr = parseInt(document.getElementById('baujahr').value) || 0;
    const nutzungsart = document.getElementById('nutzungsart').value;
    const anschaffungsjahr = parseInt(document.getElementById('anschaffungsjahr').value) || 0;

    if (!anschaffungskosten || !baujahr || !nutzungsart || !anschaffungsjahr) {
        alert('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
    }

    let afaSatz;
    let abschreibungsdauer;

    // AfA-Sätze bestimmen
    if (nutzungsart === 'wohngebaeude') {
        if (baujahr >= 1925) {
            afaSatz = 2.0; // 2% für Wohngebäude ab 1925
            abschreibungsdauer = 50;
        } else {
            afaSatz = 2.5; // 2,5% für Wohngebäude vor 1925
            abschreibungsdauer = 40;
        }
    } else if (nutzungsart === 'gewerbegebaeude') {
        afaSatz = 3.0; // 3% für Gewerbegebäude
        abschreibungsdauer = 33;
    } else {
        afaSatz = 2.5; // Mischnutzung
        abschreibungsdauer = 40;
    }

    const jaehrlicheAfa = anschaffungskosten * (afaSatz / 100);
    const monatlicheAfa = jaehrlicheAfa / 12;

    // Ergebnisse anzeigen
    document.getElementById('afaSatz').textContent = afaSatz + '%';
    document.getElementById('jaehrlicheAfa').textContent = formatCurrency(jaehrlicheAfa);
    document.getElementById('monatlicheAfa').textContent = formatCurrency(monatlicheAfa);
    document.getElementById('abschreibungsdauer').textContent = abschreibungsdauer + ' Jahre';
    
    document.getElementById('afaResult').style.display = 'block';
}

// Spekulationssteuer-Rechner
function calculateSpekulationssteuer() {
    const kaufpreis = parseFloat(document.getElementById('kaufpreis').value) || 0;
    const verkaufspreis = parseFloat(document.getElementById('verkaufspreis').value) || 0;
    const kaufdatum = new Date(document.getElementById('kaufdatum').value);
    const verkaufsdatum = new Date(document.getElementById('verkaufsdatum').value);
    const werbungskosten = parseFloat(document.getElementById('werbungskosten').value) || 0;
    const steuersatz = parseFloat(document.getElementById('steuersatz').value) || 0;

    if (!kaufpreis || !verkaufspreis || !kaufdatum || !verkaufsdatum || !steuersatz) {
        alert('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
    }

    // Haltedauer berechnen
    const haltedauerMs = verkaufsdatum - kaufdatum;
    const haltedauerJahre = haltedauerMs / (1000 * 60 * 60 * 24 * 365.25);
    const haltedauerText = Math.floor(haltedauerJahre) + ' Jahre, ' + 
                          Math.floor((haltedauerJahre % 1) * 12) + ' Monate';

    // Veräußerungsgewinn
    const veraeusserungsgewinn = verkaufspreis - kaufpreis - werbungskosten;
    
    // Spekulationssteuerpflicht prüfen
    const istSteuerpflichtig = haltedauerJahre < 10;
    const spekulationssteuerBetrag = istSteuerpflichtig ? 
        Math.max(0, veraeusserungsgewinn * (steuersatz / 100)) : 0;
    
    const nettogewinn = veraeusserungsgewinn - spekulationssteuerBetrag;

    // Ergebnisse anzeigen
    document.getElementById('haltedauer').textContent = haltedauerText;
    document.getElementById('veraeusserungsgewinn').textContent = formatCurrency(veraeusserungsgewinn);
    document.getElementById('steuerpflichtig').textContent = istSteuerpflichtig ? 'Ja' : 'Nein';
    document.getElementById('spekulationssteuerBetrag').textContent = formatCurrency(spekulationssteuerBetrag);
    document.getElementById('nettogewinn').textContent = formatCurrency(nettogewinn);
    
    document.getElementById('spekulationssteuerResult').style.display = 'block';
}

// Vermietung & Verpachtung
function calculateVermietung() {
    const mieteinnahmen = parseFloat(document.getElementById('mieteinnahmen').value) || 0;
    const nebenkosten = parseFloat(document.getElementById('nebenkosten').value) || 0;
    const afa = parseFloat(document.getElementById('afa').value) || 0;
    const zinsen = parseFloat(document.getElementById('zinsen').value) || 0;
    const verwaltungskosten = parseFloat(document.getElementById('verwaltungskosten').value) || 0;
    const instandhaltung = parseFloat(document.getElementById('instandhaltung').value) || 0;
    const versicherungen = parseFloat(document.getElementById('versicherungen').value) || 0;
    const sonstigeKosten = parseFloat(document.getElementById('sonstigeKosten').value) || 0;

    if (!mieteinnahmen) {
        alert('Bitte geben Sie die jährlichen Mieteinnahmen ein.');
        return;
    }

    const bruttoMiete = mieteinnahmen + nebenkosten;
    const gesamtWerbungskosten = afa + zinsen + verwaltungskosten + instandhaltung + 
                                versicherungen + sonstigeKosten;
    const versteuerbarerUeberschuss = bruttoMiete - gesamtWerbungskosten;
    const monatlicherUeberschuss = versteuerbarerUeberschuss / 12;

    // Ergebnisse anzeigen
    document.getElementById('bruttoMiete').textContent = formatCurrency(bruttoMiete);
    document.getElementById('gesamtWerbungskosten').textContent = formatCurrency(gesamtWerbungskosten);
    document.getElementById('versteuerbarerUeberschuss').textContent = formatCurrency(versteuerbarerUeberschuss);
    document.getElementById('monatlicherUeberschuss').textContent = formatCurrency(monatlicherUeberschuss);
    
    document.getElementById('vermietungResult').style.display = 'block';
}

// Kaufnebenkosten-Rechner
function calculateKaufnebenkosten() {
    const immobilienpreis = parseFloat(document.getElementById('immobilienpreis').value) || 0;
    const bundesland = document.getElementById('bundeslandNebenkosten').value;
    const maklerProvision = parseFloat(document.getElementById('maklerProvision').value) || 0;
    const individuellNotarkosten = parseFloat(document.getElementById('notarkosten').value) || 0;

    if (!immobilienpreis || !bundesland) {
        alert('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
    }

    // Grunderwerbsteuersätze nach Bundesland
    const grunderwerbsteuersaetze = {
        'bw': 5.0, 'by': 3.5, 'be': 6.0, 'bb': 6.5, 'hb': 5.0,
        'hh': 4.5, 'he': 6.0, 'mv': 6.0, 'ni': 5.0, 'nw': 6.5,
        'rp': 5.0, 'sl': 6.5, 'sn': 3.5, 'st': 5.0, 'sh': 6.5, 'th': 6.5
    };

    const grunderwerbsteuer = immobilienpreis * (grunderwerbsteuersaetze[bundesland] / 100);
    
    // Notarkosten (ca. 1,5% des Kaufpreises)
    const notarkosten = individuellNotarkosten || (immobilienpreis * 0.015);
    
    // Grundbuchkosten (ca. 0,5% des Kaufpreises)
    const grundbuchkosten = immobilienpreis * 0.005;
    
    // Maklerprovision
    const maklerProvisionBetrag = immobilienpreis * (maklerProvision / 100);
    
    const gesamtKaufnebenkosten = grunderwerbsteuer + notarkosten + grundbuchkosten + maklerProvisionBetrag;
    const gesamtinvestition = immobilienpreis + gesamtKaufnebenkosten;

    // Ergebnisse anzeigen
    document.getElementById('grunderwerbsteuer').textContent = formatCurrency(grunderwerbsteuer);
    document.getElementById('notarkostenResult').textContent = formatCurrency(notarkosten);
    document.getElementById('grundbuchkosten').textContent = formatCurrency(grundbuchkosten);
    document.getElementById('maklerProvisionResult').textContent = formatCurrency(maklerProvisionBetrag);
    document.getElementById('gesamtKaufnebenkosten').textContent = formatCurrency(gesamtKaufnebenkosten);
    document.getElementById('gesamtinvestition').textContent = formatCurrency(gesamtinvestition);
    
    document.getElementById('kaufnebenkostenResult').style.display = 'block';
}

// Rendite-Rechner
function calculateRendite() {
    const kaufpreis = parseFloat(document.getElementById('kaufpreisRendite').value) || 0;
    const kaufnebenkosten = parseFloat(document.getElementById('kaufnebenkostenRendite').value) || 0;
    const jaehrlicheMiete = parseFloat(document.getElementById('jaehrlicheMiete').value) || 0;
    const bewirtschaftungskosten = parseFloat(document.getElementById('bewirtschaftungskosten').value) || 0;
    const leerstand = parseFloat(document.getElementById('leerstand').value) || 0;
    const instandhaltungsruecklage = parseFloat(document.getElementById('instandhaltungsruecklage').value) || 0;

    if (!kaufpreis || !kaufnebenkosten || !jaehrlicheMiete) {
        alert('Bitte füllen Sie alle Pflichtfelder aus.');
        return;
    }

    const gesamtinvestition = kaufpreis + kaufnebenkosten;
    
    // Bruttomietrendite
    const bruttomietrendite = (jaehrlicheMiete / gesamtinvestition) * 100;
    
    // Effektive Mieteinnahmen (nach Leerstand)
    const effektiveMiete = jaehrlicheMiete * (1 - leerstand / 100);
    
    // Nettomietrendite
    const gesamtkosten = bewirtschaftungskosten + instandhaltungsruecklage;
    const nettoMieteinnahmen = effektiveMiete - gesamtkosten;
    const nettomietrendite = (nettoMieteinnahmen / gesamtinvestition) * 100;
    
    // Bewertung
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

    // Ergebnisse anzeigen
    document.getElementById('gesamtinvestitionRendite').textContent = formatCurrency(gesamtinvestition);
    document.getElementById('bruttomietrendite').textContent = formatPercentage(bruttomietrendite);
    document.getElementById('effektiveMiete').textContent = formatCurrency(effektiveMiete);
    document.getElementById('nettomietrendite').textContent = formatPercentage(nettomietrendite);
    document.getElementById('renditeBewertung').textContent = bewertung;
    
    document.getElementById('renditeResult').style.display = 'block';
}

// Hilfsfunktionen für Formatierung
function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

function formatPercentage(value) {
    return new Intl.NumberFormat('de-DE', {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value / 100);
}