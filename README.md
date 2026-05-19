# Immobilien-Steuer-Suite 2026 - Ultimate Enterprise Enhanced Edition

> **Stand 2026 (v4.0.8-enhanced)** — Steuerrecht-Audit durchgeführt: Grunderwerbsteuersätze
> aktualisiert (HH/SN 5,5 %, TH 5,0 %), Erbschaft-/Schenkungsteuer auf den
> korrekten Stufentarif mit Härteausgleich (§ 19 ErbStG) umgestellt,
> § 13 Familienheim & § 13d Vermietabschlag korrekt implementiert,
> Spekulationssteuer mit persönlichem Grenzsteuersatz + Soli-Freigrenze
> + 3-Jahres-Eigennutzungsregel, Grundsteuer länderspezifische Modelle
> (Bundesmodell, Bayern, BW, HH, HE, NI), AfA 3 % für Wohnneubauten ab 2023
> (§ 7 Abs. 4 Nr. 2 EStG) und § 7b Sonderabschreibung über 4 Jahre.
> Siehe [CHANGELOG.md](CHANGELOG.md) für Details.

## 🏠 Überblick

Die **Ultimate Enterprise Enhanced Edition** der Immobilien-Steuer-Suite 2026 ist eine hochmoderne, KI-gestützte Webanwendung zur Optimierung von Immobiliensteuern. Mit fortschrittlichen Features wie Real-time-Berechnungen, Multi-Szenario-Vergleichen und umfassender Analytics bietet sie professionelle Steueroptimierung auf Enterprise-Niveau.

## ✨ Hauptfeatures

### 🤖 KI-Optimierte Berechnungen
- **Real-time Steuerberechnung** mit Web Workers
- **Intelligente Strukturoptimierung** für maximale Steuerersparnis
- **Machine Learning Algorithmen** für Vorhersagen
- **Automatische Validierung** mit Echtzeit-Feedback

### 📊 Multi-Szenario Analyse
- **Bis zu 3 parallele Szenarien** vergleichen
- **Dynamische Szenario-Verwaltung**
- **Interaktive Vergleichstabellen**
- **Optimierungsempfehlungen** pro Szenario

### 📈 Umfassende Steuermodule
1. **Verkaufssteuer-Optimierung** (Hauptmodul)
   - Spekulationssteuer nach § 23 EStG (Grenzsteuersatz + Soli-Freigrenze + Kirchensteuer)
   - 10-Jahres-Frist & 3-Jahres-Eigennutzungsregel
   - Optimale Rechtsformen (VV GmbH & Co. KG mit erweiterter Kürzung § 9 Nr. 1 S. 2 GewStG, Share Deal mit § 8b KStG, Familienpool, Stiftung)
   - Cross-Border Strukturen mit Pillar Two / ATAD-Hinweisen

2. **Grundsteuer 2026** (Reform-konform, länderspezifisch)
   - Bundesmodell (BB, BE, HB, MV, NW, RP, SL, ST, SH, TH)
   - Bayerisches Flächenmodell, BW Bodenwertmodell, HH Wohnlagenmodell, HE Flächen-Faktor, NI Flächen-Lage
   - Grundsteuermesszahl 0,31 ‰ Wohnen / 0,34 ‰ Nichtwohnen
   - Hebesatz-Berechnung

3. **Erbschaftsteuer-Planung (§§ 13, 15, 19 ErbStG)**
   - Korrekter Stufentarif mit Härteausgleich (§ 19 Abs. 3)
   - Familienheim-Befreiung Ehepartner (§ 13 Abs. 1 Nr. 4b) und Kinder bis 200 m² (Nr. 4c)
   - § 13d ErbStG 10 %-Abschlag für zu Wohnzwecken vermietete Immobilien
   - Steuerklassen I–III, alle aktuellen Freibeträge

4. **Schenkungssteuer-Optimierung**
   - 10-Jahres-Freibeträge
   - Nießbrauch-Kapitalwert nach § 14 BewG (Jahreswert-Cap 1/18,6 nach § 16 BewG)
   - Teilschenkungen
   - Stufenweise Übertragung

5. **Cash-Flow Analyse**
   - Liquiditätsplanung
   - Steuerauswirkungen
   - ROI-Berechnung
   - Reinvestitionsstrategien

6. **KI-Gesamtstrategie**
   - Portfolio-Analyse
   - Langfristplanung
   - Internationale Strukturen
   - Risikobewertung

### 🔧 Enterprise Features
- **PDF-Export** mit professionellen Berichten
- **Plugin-Architektur** für Erweiterungen
- **Undo/Redo Funktionalität**
- **Keyboard Shortcuts** für Power-User
- **Performance Monitoring**
- **Error Handling & Logging**
- **GDPR-konforme Analytics**

### 🎨 Moderne Benutzeroberfläche
- **Responsive Design** für alle Geräte
- **Dark/Light Mode Toggle** im Header — OS-Preference bei erstem Aufruf, persistente Nutzerwahl (`localStorage`)
- **Accessibility Features** (WCAG 2.1)
- **Toast Notifications**
- **Modal System**
- **Progress Indicators**
- **Real-time Validation**
- **Tab-Switch-Persistenz**: Eingaben (inkl. aller drei Verkaufs-Szenarien) bleiben beim Wechsel zwischen Steuermodulen erhalten und werden alle 30 s automatisch gespeichert

## 🚀 Installation & Setup

### Voraussetzungen
- Node.js >= 16.0.0
- npm >= 8.0.0
- Moderner Webbrowser (Chrome, Firefox, Safari, Edge)

### Schnellstart
```bash
# Repository klonen
git clone https://github.com/immobilien-steuer-suite/enhanced.git
cd enhanced

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die Anwendung ist dann unter `http://localhost:3000` verfügbar.

### Produktions-Build
```bash
# Für Produktion optimieren
npm run build

# Server starten
npm start
```

## 📖 Verwendung

### Grundlegende Bedienung
1. **Szenario auswählen** oder neues erstellen
2. **Immobiliendaten eingeben** (Kaufpreis, Verkaufspreis, etc.)
3. **Real-time Berechnung** aktivieren für sofortige Ergebnisse
4. **Erweiterte Optionen** für detaillierte Analyse
5. **PDF-Bericht exportieren** für Dokumentation

### Keyboard Shortcuts
- `Ctrl + Enter`: Berechnung starten
- `Ctrl + E`: Beispieldaten laden
- `Ctrl + P`: PDF exportieren
- `Ctrl + S`: Daten speichern
- `Ctrl + Z/Y`: Rückgängig/Wiederholen
- `Ctrl + M`: Multi-Szenario Vergleich
- `F1`: Hilfe anzeigen

### Plugin-System
Die Suite unterstützt verschiedene Plugins:
- **🗺️ Bundesland-Analyzer**: Steuervergleich nach Bundesländern
- **📊 Inflations-Rechner**: Inflationsbereinigung
- **🤖 KI-Optimierer**: Machine Learning Vorhersagen
- **🌍 International Tax**: Cross-Border Optimierung

## 🏗️ Architektur

### Frontend
- **Vanilla JavaScript** mit ES6+ Features
- **Web Workers** für Background-Berechnungen
- **CSS Grid & Flexbox** für responsive Layouts
- **CSS Custom Properties** für Theming
- **Progressive Web App** Features

### Berechnungsengine
- **Modulare Architektur** mit separaten Calculators
- **Caching System** für Performance
- **Validation Layer** für Datensicherheit
- **Error Handling** mit detailliertem Logging

### Analytics & Monitoring
- **Google Analytics 4** Integration
- **Performance Monitoring**
- **Error Tracking**
- **User Journey Analytics**
- **GDPR-konforme Cookie-Verwaltung**

## 🔒 Datenschutz & Sicherheit

- **GDPR-konform**: Vollständige DSGVO-Compliance
- **Cookie Consent**: Granulare Einstellungen
- **Lokale Datenspeicherung**: Keine Server-Übertragung
- **Sichere Berechnungen**: Client-side Processing
- **Accessibility**: WCAG 2.1 AA konform

## 📊 Unterstützte Berechnungen

### Steuerarten
- ✅ Spekulationssteuer (§ 23 EStG) — 10-Jahres-Frist + 3-Jahres-Eigennutzung
- ✅ Grundsteuer (Reform seit 1.1.2025, alle Ländermodelle)
- ✅ Erbschaftsteuer — Stufentarif § 19 ErbStG mit Härteausgleich
- ✅ Schenkungssteuer (10-Jahres-Freibeträge, Nießbrauch § 14 BewG)
- ✅ Einkommensteuer (Vermietung & Verpachtung)
- ✅ Gewerbesteuer (gewerbliche Strukturen)
- ✅ AfA (§ 7 EStG) — inkl. 3 % für Neubauten ab 2023, § 7b Sonderabschreibung (5 % × 4 Jahre), § 7i Denkmal-AfA

### Grunderwerbsteuer-Sätze (Stand 2026)
| Land | Satz | Land | Satz |
| --- | --- | --- | --- |
| Bayern, Sachsen-Anhalt | 3,5 % / 5,0 % | Sachsen | **5,5 %** (seit 1.1.2023) |
| Baden-Württemberg, Bremen, Niedersachsen, Rheinland-Pfalz, Sachsen-Anhalt, **Thüringen** | 5,0 % | Hamburg | **5,5 %** (seit 1.1.2023) |
| Berlin, Hessen, MV | 6,0 % | Brandenburg, NRW, Saarland, Schleswig-Holstein | 6,5 % |

### Optimierungsstrukturen
- 🏠 **Privatverkauf** (§ 23 EStG)
- 🏢 **VV GmbH & Co. KG** mit erweiterter Gewerbesteuer-Kürzung (§ 9 Nr. 1 S. 2 GewStG)
- 👨‍👩‍👧‍👦 **Familienpool (GbR)**
- 📈 **Share Deal (GmbH)** — § 8b KStG (95 % steuerfrei), inkl. § 1 Abs. 2b GrEStG-Warnhinweis (90 %/10 J.)
- 🌍 **Cross-Border Holdings** — mit Pillar Two und ATAD-Hinweisen
- 🏛️ **Familienstiftungen** — inkl. Erbersatzsteuer alle 30 Jahre
- ⚖️ **Stiftung & Co. KG**

### Bundesländer
Alle 16 deutschen Bundesländer mit spezifischen:
- Grunderwerbsteuersätzen (2026 aktualisiert)
- Hebesätzen
- Notarkosten
- Grundsteuermodellen

## 🔄 Updates & Wartung

### Version 4.0.8 — Steuerrecht-Audit 2026
- 🛠️ Kritische Bugfixes: zerstörter `try`-Block in `TaxCalculationEngine.js`, Worker-Timer-Leak, fehlerhafte Methoden-Überschreibung
- 📊 Steuerrecht 2026: Grunderwerbsteuer aktualisiert (HH/SN 5,5 %, TH 5,0 %)
- ⚖️ Erbschaft-/Schenkungsteuer: korrekter Stufentarif mit Härteausgleich (§ 19 Abs. 3 ErbStG)
- 🏠 Familienheim § 13: Ehepartner / Kinder 200 m²-Regel; § 13d Vermietabschlag
- 💰 Spekulationssteuer: persönlicher Grenzsteuersatz statt Pauschal-15 %, Soli-Freigrenze, 3-Jahres-Eigennutzungsregel
- 🏛️ Grundsteuer: länderspezifische Modelle (Bundesmodell, Bayern, BW, HH, HE, NI)
- 📉 AfA: 3 % für Wohnneubauten ab 2023 (§ 7 Abs. 4 Nr. 2 EStG), § 7b 5 % × 4 Jahre, § 7i Denkmal-AfA
- 🏢 Share Deal: § 8b KStG 95 % korrekt, § 1 Abs. 2b GrEStG-Warnung (90 %/10 J. seit 1.7.2021)
- 🌍 Cross-Border: Pillar Two (15 % Mindestbesteuerung seit 2024) und ATAD-Hinweise
- 🌙 Dark/Light-Mode-Toggle im Header; CSS-Bugs in Theme-Regeln behoben
- 💾 Tab-Switch-Persistenz für alle drei Verkaufs-Szenarien

### Version 4.0.0 - Ultimate Enterprise Enhanced
- ✨ Vollständige Neuentwicklung der UI
- 🤖 KI-Integration für Optimierungsempfehlungen
- 📊 Multi-Szenario Vergleichsystem
- 📄 Erweiterte PDF-Export Funktionalität
- 🔌 Plugin-Architektur
- 📈 Real-time Analytics
- ♿ Verbesserte Accessibility
- 🌙 Dark Mode Support

### Roadmap
- [ ] Mobile App (React Native)
- [ ] API für Drittanbieter
- [ ] Erweiterte KI-Features
- [ ] Blockchain-Integration
- [ ] Multi-Language Support

## 🤝 Beitragen

Wir freuen uns über Beiträge zur Verbesserung der Suite:

1. Fork des Repositories
2. Feature Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request erstellen

## 📝 Lizenz

Dieses Projekt steht unter der ISC Lizenz. Siehe `LICENSE` Datei für Details.

## 📞 Support & Kontakt

- **Website**: https://immobilien-steuer-suite.de
- **Email**: support@immobilien-steuer-suite.de
- **Issues**: https://github.com/immobilien-steuer-suite/enhanced/issues
- **Dokumentation**: https://docs.immobilien-steuer-suite.de

## 🙏 Danksagungen

- **Steuerberater-Community** für fachliche Beratung
- **Open Source Community** für verwendete Libraries
- **Beta-Tester** für wertvolles Feedback
- **Accessibility-Experten** für Barrierefreiheit

---

**© 2026 Immobilien-Steuer-Suite - Ultimate Enterprise Enhanced Edition**

*Professionelle Steueroptimierung für das digitale Zeitalter*

> ⚠️ **Haftungsausschluss:** Die Berechnungen sind Schätzungen auf Basis vereinfachter
> Modelle und ersetzen keine steuerliche Beratung. Für verbindliche Aussagen kontaktieren
> Sie bitte einen Steuerberater oder das zuständige Finanzamt.