# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.9] - 2026 - Verfeinerungen nach Steuerrecht-Audit

### 🐛 Bugfixes
- **Cashflow**: Soli (mit Freigrenze) und Kirchensteuer werden jetzt auf
  laufende Mieteinnahmen + Veräußerungsgewinn angewendet (vorher nur
  blanke ESt). § 23 EStG ersetzt den pauschalen 10 %-Abzug beim
  geplanten Verkauf; ROI ist jetzt auf Anschaffungskosten bezogen.
- **Schenkung**: Wohnrecht (§ 1093 BGB) implementiert (war zuvor still
  als Vollschenkung behandelt). Vervielfältiger Anlage 9a BewG aus
  Lookup-Tabelle statt Pauschalformel.
- **Sidebar**: das beschnittene `<span class="nav-badge">AI</span>` an
  der Verkaufssteuer-Navigation entfernt (Konsistenz mit der
  Sprachversachlichung "Strukturanalyse").
- **Verkaufssteuer-Modul**: "KI-Algorithmus"-Marketingsprache an
  mehreren Stellen durch "Strukturanalyse" ersetzt (Progress-Modal,
  Ergebnis-Heading, Buttons). Strategie-Modul behält "KI-Gesamtstrategie"
  bewusst mit Heuristik-Disclaimer.

### 🆕 Neue Features
- **Wertermittlungs-Helfer für Erbschaft & Schenkung** mit drei Tabs
  (Vergleichswert §183, Ertragswert §§184-188, Sachwert §§189-191 BewG).
  Jeder Rechner schreibt den ermittelten Grundbesitzwert direkt in das
  Ziel-Input und zeigt eine Klartext-Rechnung als Audit-Trail.
- **Vergleichs-PDF** generiert jetzt einen echten landscape A4 PDF mit
  Side-by-side-Tabelle und Top-3-Strukturen je Szenario (vorher reiner
  Toast-Stub).
- **PDF-Export** ist section-aware (eigenes Layout für Verkauf,
  Grundsteuer, Erbschaft, Schenkung, Cashflow, Strategie) mit On-Demand-
  Recompute bei Cache-Miss.
- **Beispiel-Button** ist section-aware - lädt je nach aktiver Sektion
  die passenden Beispieldaten (vorher immer nur Verkauf).
- **Vergleichs-Modal** populiert Beste Option / Nettogewinn-Spalten nach
  "Alle Szenarien berechnen" (vorher leerer Stub).
- **System Status-Panel** in der Sidebar zeigt jetzt echte Runtime-
  Werte (Worker/Main-Thread, Cache-Hit-Rate, Fehleranzahl, Version).
- **Toast-System** hat eine Obergrenze von 4 sichtbaren Toasts mit
  De-Duplizierung; Container ist `pointer-events: none` so dass die
  leere Ecke keine Klicks blockt.
- **Mobile**: Form-Grid-Items haben `min-width: 0` damit Inputs in
  schmalen Containern nicht überlaufen.
- **Dark-Mode-Toggle**: First-Load-Toast nicht mehr weiß-auf-weiß; das
  ⚠️-Emoji aus dem PDF-Empty-Path entfernt (rendert in jsPDF-Helvetica
  als "Ø<ßà" Mojibake).

### 📊 Holding-Strukturen weiter präzisiert
- VV GmbH & Co. KG: Hinweis dass 10-J-Frist § 23 EStG transparent auf
  Gesellschafterebene greift (Zebragesellschaft).
- Share Deal: falsche "Mindestens 10 % Beteiligung"-Aussage entfernt -
  diese Schwelle gilt nur für Dividenden (§ 8b Abs. 4 KStG), nicht für
  Veräußerungsgewinne nach Abs. 2.
- Cross-Border (LU/NL): Faktor von 0,45/0,50 auf 0,85 angehoben -
  deutsches Grundvermögen unterliegt weiterhin der Beschränkten
  Steuerpflicht (§ 49 EStG); Pillar Two zementiert 15 % seit 2024.
- Familienstiftung: 15 % KSt + 5,5 % Soli auf laufende Erträge explizit
  ausgewiesen; Erbersatzsteuer-Paragraphen konkret zitiert.

## [4.0.8] - 2026 - Steuerrecht-Audit & Korrekturen

### 🐛 Kritische Bugfixes
- **`js/classes/TaxCalculationEngine.js`**: Syntaktisch zerstörter `try`-Block
  (kein `catch`, verwaiste Statements) korrigiert - Datei war nicht ladbar.
- **Worker-Timeout-Leak (index.html)**: `workerCallbacks.delete(callback.timeoutId)`
  durch `clearTimeout(callback.timeoutId)` ersetzt - Timer wurden nie gelöscht.
- **Methoden-Override-Bug (index.html)**: Top-Level-Code inmitten von
  `setupEventListenersInternal()` entfernt, der `app.validateFormData` überschrieben
  und Validierung deaktiviert hatte.
- **Grundsteuermesszahl-Bug**: In `GrundsteuerCalculator` wurde feste 0,31‰
  hartcodiert - jetzt 0,31‰ Wohnen / 0,34‰ Nichtwohnen je nach Immobilientyp.

### 📊 Steuerrecht-Korrekturen 2026
- **Grunderwerbsteuer-Sätze 2026 aktualisiert**:
  - Hamburg: 4,5% → **5,5%** (gültig seit 1.1.2023)
  - Sachsen: 3,5% → **5,5%** (gültig seit 1.1.2023)
  - Thüringen: 6,5% → **5,0%** (gültig seit 1.1.2024)
- **Erbschaft-/Schenkungsteuer (§ 19 ErbStG)**: Statt fehlerhafter marginaler
  Progression jetzt korrekter Stufentarif (voller Satz auf gesamten Erwerb)
  mit Härteausgleich gemäß § 19 Abs. 3 ErbStG.
- **Familienheim-Regelung (§ 13 Abs. 1 Nr. 4b/4c ErbStG)**:
  - Ehepartner: volle Befreiung bei Eigennutzung
  - Kinder: 200 m²-Grenze bei Selbstnutzung berücksichtigt (anteilig darüber)
- **§ 13d ErbStG**: 10 % Abschlag für zu Wohnzwecken vermietete Immobilien
  nun korrekt an Immobilienart="vermietung" gekoppelt.
- **Steuerklassen § 15 ErbStG**: Eltern bei Erbschaft Stkl. I (statt II);
  bei Schenkung weiterhin Stkl. II.
- **Spekulationssteuer (§ 23 EStG)** in `app.js`:
  - Fixed 15%-Pauschalsatz entfernt - jetzt persönlicher Grenzsteuersatz + Soli + Kirchensteuer
  - 3-Jahres-Regel der Eigennutzungs-Befreiung statt fehlerhafter 5J/50%-Regel
- **Solidaritätszuschlag-Freigrenze**: Soli wird nicht mehr unbedingt mit 5,5%
  addiert, sondern Freigrenze ~19.950 € und Milderungszone bis ~33.912 €
  (Einzelveranlagung) berücksichtigt.
- **AfA (§ 7 EStG)**:
  - Neu: 3 % lineare AfA / 33 Jahre für Wohngebäude mit Fertigstellung ab 2023
    (Wachstumschancengesetz, § 7 Abs. 4 Nr. 2 EStG)
  - § 7b EStG-Sonderabschreibung korrigiert: 5 % p.a. über 4 Jahre statt einmalig
    (Geltungsbereich 2023-2026)
  - § 7i EStG Denkmal-AfA: 9 % Jahre 1-8 + 7 % Jahre 9-12 explizit modelliert

### 🏛️ Holding-Strukturen aktualisiert
- **VV GmbH & Co. KG**: Irreführender Hinweis "BFH 2025: Gewerbesteuerfrei"
  ersetzt durch korrekten Bezug auf § 9 Nr. 1 S. 2 GewStG (erweiterte Kürzung)
  inkl. Ausschließlichkeitsgebot-Warnung.
- **Share Deal (GmbH)**: Falsche Aussagen korrigiert:
  - "40% steuerfreier Gewinn" → korrekt **95 %** steuerfrei (§ 8b Abs. 2 KStG, 5 % NA-BA)
  - "Keine Grunderwerbsteuer" → korrekter Warnhinweis auf § 1 Abs. 2b GrEStG
    (GrESt-Auslösung bereits ab 90 % Anteilsübergang in 10 Jahren, seit 1.7.2021)
- **Cross-Border Strukturen**: Hinweise auf Pillar Two (15 % Mindestbesteuerung seit 2024),
  ATAD und Substanzanforderungen ergänzt.
- **Familienstiftung**: Erbersatzsteuer alle 30 Jahre (§ 1 Abs. 1 Nr. 4 ErbStG) ergänzt.

### 🏛️ Grundsteuer-Modelle (Länder-Modelle korrekt unterschieden)
- **Bundesmodell** (BB, BE, HB, MV, NW, RP, SL, ST, SH, TH): Bodenrichtwert +
  Ertragswert × 0,31‰ Wohnen / 0,34‰ Nichtwohnen.
- **Bayern**: reines Flächenmodell (0,04 €/m² Grund, 0,50 €/m² Gebäude, 70 % Wohnen).
- **Baden-Württemberg**: modifiziertes Bodenwertmodell (Gebäude irrelevant, 0,91‰).
- **Hamburg**: Wohnlagenmodell. **Hessen**: Flächen-Faktor. **Niedersachsen**: Flächen-Lage.
- Vorher: alle Länder fälschlich mit bayerischen Äquivalenzzahlen × Bodenrichtwert × Pauschalbau-€/m² (Mehrfach-Anwendung).

### 🔧 Nießbrauch-Kapitalwert
- Vereinfachte Berechnung an § 14 BewG angenähert: Jahreswert × Vervielfältiger
  mit Cap auf Steuerwert / 18,6 (§ 16 BewG).

## [4.0.0] - 2025-01-XX - Ultimate Enterprise Enhanced Edition

### 🚀 Hinzugefügt
- **Vollständige UI-Neuentwicklung** mit modernem Design
- **KI-gestützte Steueroptimierung** mit Machine Learning Algorithmen
- **Multi-Szenario Vergleichssystem** (bis zu 3 parallele Szenarien)
- **Real-time Berechnungen** mit Web Workers
- **Enhanced PDF-Export** mit professionellen Berichten
- **Plugin-Architektur** für modulare Erweiterungen
- **Google Analytics 4 Integration** mit GDPR-Compliance
- **Undo/Redo Funktionalität** mit State Management
- **Keyboard Shortcuts** für Power-User
- **Toast Notification System**
- **Modal Dialog System**
- **Progress Indicators** für lange Berechnungen
- **Dark Mode Support**
- **Accessibility Features** (WCAG 2.1 AA)
- **Performance Monitoring**
- **Error Handling & Logging**
- **Cookie Consent Management**
- **Responsive Design** für alle Geräte

### 📊 Neue Steuermodule
- **Grundsteuer 2025** (Reform-konform)
- **Erbschaftsteuer-Planung** mit aktuellen Freibeträgen
- **Schenkungssteuer-Optimierung** mit 10-Jahres-Zyklen
- **Cash-Flow Analyse** mit Liquiditätsplanung
- **KI-Gesamtstrategie** für Portfolio-Optimierung

### 🔌 Plugin-System
- **Bundesland-Analyzer**: Steuervergleich nach Bundesländern
- **Inflations-Rechner**: Automatische Inflationsbereinigung
- **KI-Optimierer**: Machine Learning Vorhersagen
- **International Tax**: Cross-Border Strukturen

### 🏗️ Technische Verbesserungen
- **Web Worker Integration** für Background-Berechnungen
- **Enhanced Caching System**
- **Modular Calculator Architecture**
- **CSS Custom Properties** für Theming
- **Progressive Web App** Features
- **Service Worker** für Offline-Funktionalität
- **Enhanced Security** mit CSP Headers

### 🎨 UI/UX Verbesserungen
- **Glassmorphism Design** mit Backdrop-Filter
- **Smooth Animations** und Micro-Interactions
- **Enhanced Form Validation** mit Real-time Feedback
- **Improved Navigation** mit Breadcrumbs
- **Better Typography** und Spacing
- **Color System** mit CSS Variables
- **Enhanced Buttons** mit Hover-Effekte

### ♿ Accessibility
- **Screen Reader Support**
- **Keyboard Navigation**
- **High Contrast Mode**
- **Focus Management**
- **ARIA Labels** und Descriptions
- **Skip Links**
- **Reduced Motion Support**

### 📱 Responsive Design
- **Mobile-First Approach**
- **Tablet Optimization**
- **Desktop Enhancement**
- **Touch-Friendly Controls**
- **Adaptive Layouts**

### 🔒 Sicherheit & Datenschutz
- **GDPR-konforme Analytics**
- **Cookie Consent Banner**
- **Local Data Storage**
- **No Server Communication**
- **Client-side Processing**
- **Data Encryption**

### 🚀 Performance
- **Lazy Loading**
- **Code Splitting**
- **Image Optimization**
- **Caching Strategies**
- **Bundle Size Optimization**
- **Core Web Vitals Optimization**

### 🔧 Entwickler-Features
- **Enhanced Error Handling**
- **Debug Mode**
- **Performance Profiling**
- **Memory Management**
- **API Documentation**
- **Code Comments**

### 📈 Analytics & Monitoring
- **User Journey Tracking**
- **Performance Metrics**
- **Error Reporting**
- **Feature Usage Analytics**
- **Conversion Tracking**
- **A/B Testing Support**

### 🌍 Internationalisierung
- **Multi-Language Preparation**
- **Currency Support**
- **Date Format Localization**
- **Number Format Localization**

## [3.0.0] - 2024-12-XX - Premium Edition

### Hinzugefügt
- Grundlegende Steuerberechnungen
- Einfache PDF-Export Funktionalität
- Basis-Responsive Design
- Grundlegende Validierung

### Geändert
- Verbesserte Berechnungsgenauigkeit
- Aktualisierte Steuersätze für 2025

### Behoben
- Verschiedene Berechnungsfehler
- Browser-Kompatibilitätsprobleme

## [2.0.0] - 2024-11-XX - Standard Edition

### Hinzugefügt
- Multi-Calculator System
- Basis-Benutzeroberfläche
- Einfache Ergebnisanzeige

### Geändert
- Überarbeitete Berechnungslogik
- Verbesserte Benutzerführung

## [1.0.0] - 2024-10-XX - Initial Release

### Hinzugefügt
- Grundlegende Spekulationssteuer-Berechnung
- Einfache HTML-Oberfläche
- Basis-Funktionalität

---

## Geplante Features (Roadmap)

### [4.1.0] - Q2 2025
- [ ] Mobile App (React Native)
- [ ] Erweiterte KI-Features
- [ ] Blockchain-Integration
- [ ] API für Drittanbieter

### [4.2.0] - Q3 2025
- [ ] Multi-Language Support
- [ ] Advanced Analytics Dashboard
- [ ] Team Collaboration Features
- [ ] Cloud Synchronization

### [5.0.0] - Q4 2025
- [ ] Enterprise SSO Integration
- [ ] Advanced Reporting Suite
- [ ] Audit Trail Functionality
- [ ] White-Label Solutions

---

## Mitwirkende

- **Entwicklungsteam**: Ultimate Enterprise Tax Suite Team
- **Steuerberatung**: Fachliche Beratung durch Steuerexperten
- **UI/UX Design**: Moderne Benutzeroberfläche und Benutzererfahrung
- **QA Testing**: Umfassende Qualitätssicherung
- **Accessibility**: Barrierefreiheit und Inklusion

## Support

Für Fragen, Feedback oder Support:
- **Email**: support@immobilien-steuer-suite.de
- **Website**: https://immobilien-steuer-suite.de
- **Issues**: https://github.com/immobilien-steuer-suite/enhanced/issues

---

**Legende:**
- 🚀 Neue Features
- 📊 Berechnungsmodule
- 🔌 Plugins
- 🏗️ Technische Verbesserungen
- 🎨 UI/UX
- ♿ Accessibility
- 📱 Responsive Design
- 🔒 Sicherheit
- 🚀 Performance
- 🔧 Entwickler-Features
- 📈 Analytics
- 🌍 Internationalisierung