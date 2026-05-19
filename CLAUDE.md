# CLAUDE.md — Working notes for the Immobilien-Steuer-Suite (Stand 2026, v4.0.8-enhanced)

This file is for future agent sessions. It captures the load-bearing facts
about this repository so you do not re-discover them from scratch.

## What this app is

A single-page web application for German real-estate tax planning. It is a
static site: no backend, all calculations run in the browser (or in a Web
Worker spawned from an inline script). PDF generation uses jsPDF loaded
from a CDN with fallbacks. Charting uses Chart.js (3.9.1).

There is no build step. `index.html` is opened directly or served with
`http-server` (`npm run dev`).

Six modules drive the user-facing functionality:

1. **Verkaufssteuer** (`section=verkauf`) — speculation tax, holding-structure
   comparison (Privatverkauf, VV GmbH & Co. KG, Familienpool, Share Deal,
   Cross-Border, Familienstiftung). This is the only module with three
   parallel scenarios (`scenario1`/`scenario2`/`scenario3`).
2. **Grundsteuer** — länderspezifische Grundsteuer-Reform-Berechnung.
3. **Erbschaft**, **Schenkung** — Stufentarif nach § 19 ErbStG mit Härteausgleich.
4. **Cashflow**, **Strategie** — multi-year analysis and KI strategy stub.

## Repository layout (the only files that matter)

```
index.html                                ← THE app. Inline CSS + inline JS.
                                            Contains the calculators that
                                            actually run. ~8 600 lines.
app.js                                    ← Small standalone calculator
                                            (calcGrundsteuer, calcVerkaufssteuer,
                                            calcErbschaftsteuer, calcSchenkungssteuer).
                                            Wired up via "form-grundsteuer"
                                            etc. — NOT the same code path as
                                            index.html. Used by an older HTML
                                            page that lives outside this repo,
                                            but still kept in sync.
calculations.js, calculations.html,
calculations                              ← Older standalone "Premium Edition"
                                            view. The bare `calculations` file
                                            is HTML despite the extension-less
                                            name. Year labels are kept in sync.
js/worker-script.js                       ← Duplicate of the inline web-worker
                                            in index.html. Kept in sync as a
                                            module-style fallback.
js/classes/*.js                           ← Older modular versions of the
                                            inline classes (TaxCalculation-
                                            Engine, UltimateImmobilienSuite-
                                            Enhanced, EnhancedPDFExporter,
                                            ApplicationState, …). They are
                                            NOT imported by index.html — the
                                            inline copies in index.html are
                                            authoritative.
package.json                              ← v4.0.8. Only http-server, eslint
                                            and prettier as dev deps.
README.md                                 ← User-facing project doc.
CHANGELOG.md                              ← Versioned changes.
CLAUDE.md                                 ← This file.
```

If you change a calculation, the **only file that ships to users is
`index.html`**. The duplicates in `js/classes/` and `js/worker-script.js`
are nice-to-have copies — keep them roughly aligned but do not chase parity
at the cost of correctness in `index.html`.

## Architecture in `index.html`

The single inline `<script>` (between the worker script tag and the closing
`</script>`) defines, in order:

- `GoogleAnalyticsTracker` (no-op until cookie consent given)
- `CookieConsentManager` (banner; persists to `localStorage.cookie_consent`)
- `EnhancedErrorHandler` (window-level error capture)
- `EnhancedPDFExporter` (lazy-loads jsPDF from 3 CDN fallbacks)
- `ApplicationState` (undo/redo stack of form snapshots)
- `TaxCalculationEngine` (dispatcher to 5 calculator subclasses)
- Calculator subclasses: `VerkaufsteuerCalculator`, `GrundsteuerCalculator`,
  `ErbschaftsteuerCalculator`, `SchenkungsteuerCalculator`,
  `CashflowCalculator` — all extend `BaseCalculator`
- `UltimateImmobilienSuiteEnhanced` — main app class
- Global `toggleDarkMode()` + IIFE that initialises the theme from
  `localStorage.dark-mode-preference` || OS preference
- `const app = new UltimateImmobilienSuiteEnhanced();` at the bottom
  exposes `window.app`

Verkaufssteuer is special — it does **not** call the calculator engine.
It collects form data via `collectFormData()` and dispatches to a Web Worker
(built from a `<script id="worker-script" type="text/plain">` blob) which
runs `EnhancedTaxCalculatorWorker` and returns a structure ranking. Falls
back to main-thread `calculateMainThread()` if no Worker.

## Theme system (Dark / Light mode)

There is no separate stylesheet for dark mode and the OS preference does
**not** drive the active theme. The flow is:

1. Inline `<style>` defines the light theme.
2. `body.dark-mode <selector>` rules later in the same `<style>` override
   to dark colours.
3. **Do not re-add `@media (prefers-color-scheme: dark) { ... }` blocks.**
   They were previously in place with `!important`, which made the user's
   manual toggle ineffective for OS-dark users. They are intentionally
   neutralised with `@media not all { ... }`. If you need OS-preference
   behaviour, do it in JS (the bottom of the inline script already reads
   `window.matchMedia('(prefers-color-scheme: dark)')` on first load).
4. The toggle button is `#dark-mode-toggle-btn` in the header, calling
   `window.toggleDarkMode()`. Choice persists in
   `localStorage.dark-mode-preference`.

**Specificity gotcha**: `body.dark-mode .app-container *:not(input):not(select):not(button):not(.btn)` is `(0,3,4)` and runs late in the file. Any rule that needs to win against it at equal `!important` must reach `(0,4,X)` or higher — see the toast override `body.dark-mode .toast-container .toast.toast *` which chains `.toast.toast` to reach `(0,4,1)`.

## Scenario / section persistence

- Verkaufssteuer uses `app.scenarios` (Map of `scenario1`/`scenario2`/`scenario3`).
  Inputs in `scenario2-content` are prefixed `s2_`; `scenario3-content` is `s3_`.
  `collectFormData()` strips the prefix; `populateForm()` re-applies it.
- All other sections use `app.sectionData.{erbschaft, schenkung, ...}`.
- `restoreVerkaufData()` repopulates **all three** scenarios on section
  re-entry (do not regress this — the previous behaviour silently dropped
  scenario 2/3 data).
- The global input handler invokes `saveCurrentSectionData()` on every
  edit so the 30-second auto-save does not persist stale data while the
  user is typing.

## Calculation rules that must stay right (2026)

These were the bugs the audit fixed. If you touch them, keep the invariants:

### Spekulationssteuer (§ 23 EStG)

- Steuerfrei nach 10 Jahren Haltedauer.
- Eigennutzungsbefreiung: 3-Jahres-Regel (Verkaufsjahr + die zwei
  vorangegangenen Jahre). **Not** 5 years with 50 % reduction.
- Steuer = persönlicher Grenzsteuersatz × Veräußerungsgewinn + Soli + Kirchensteuer.
  **Not** a 15 % flat rate.

### Solidaritätszuschlag (Stand 2026)

- 5,5 % auf Einkommensteuer **mit Freigrenze ~19.950 €** (Einzelveranlagung).
- Milderungszone bis ~33.912 €.
- Implemented as a linear ramp in `calculateSpeculationTax`. Do not
  unconditionally add 5,5 % Soli.

### Erbschaft- / Schenkungsteuer (§§ 13, 13d, 15, 19 ErbStG)

- Tarif nach § 19 ErbStG: **Stufentarif** — the bracket rate applies to
  the **full** `steuerpflichtiger_erwerb`, not marginally. Härteausgleich
  per § 19 Abs. 3 ErbStG caps the bracket-step penalty at 50 % (75 % for
  Erwerbe > 6 Mio €) of the amount above the previous bracket.
- Helper: `ErbschaftsteuerCalculator.prototype._calcProgressiveErbschaftsteuer`.
  `SchenkungsteuerCalculator` calls it via `.call(this, ...)`.
- Familienheim § 13 Abs. 1 Nr. 4b/4c:
  - Ehepartner: voll steuerfrei bei Selbstnutzung.
  - Kinder: bis 200 m² Wohnfläche steuerfrei, anteilig darüber.
- § 13d ErbStG 10 % Abschlag: nur für `immobilienart === 'vermietung'`.
- Steuerklassen § 15 ErbStG: **Eltern sind Stkl. I bei Erbschaft, Stkl. II
  bei Schenkung** — must differ between calculators.
- Freibeträge unverändert seit 2009: 500 k / 400 k / 200 k / 100 k / 20 k.

### Grunderwerbsteuer (Stand 2026)

| Land | % | Land | % |
|---|---|---|---|
| BY, SN-A | 3,5 / 5,0 | HH | **5,5** (seit 1.1.2023) |
| BW, HB, NI, RP, ST | 5,0 | SN | **5,5** (seit 1.1.2023) |
| BE, HE, MV | 6,0 | TH | **5,0** (seit 1.1.2024) |
| BB, NW, SL, SH | 6,5 | | |

### Grundsteuer (Reform seit 1.1.2025)

`GrundsteuerCalculator.performCalculation` switches on Bundesland and uses
a different model per state:

- **Bundesmodell** (BB, BE, HB, MV, NW, RP, SL, ST, SH, TH): Bodenwert +
  pauschalierter Gebäudeertragswert × Messzahl 0,31 ‰ Wohnen / 0,34 ‰ Nicht-Wohnen.
- **Bayern**: reines Flächenmodell, Äquivalenzzahlen 0,04 € Grund / 0,50 €
  Gebäude, Messzahl 70 % Wohnen / 100 % Gewerbe.
- **Baden-Württemberg**: Bodenwertmodell — Fläche × Bodenrichtwert ×
  0,91 ‰ Wohnen / 1,3 ‰ sonst (Gebäude irrelevant).
- **Hamburg**: Wohnlagenmodell (Flächenmodell-Variante).
- **Hessen**: Flächen-Faktor-Verfahren (Faktor aus Bodenrichtwert).
- **Niedersachsen**: Flächen-Lage-Modell.

Do not collapse these back into a single calculation — they produce
materially different results.

### AfA (§ 7 EStG)

- Wohngebäude Bauantrag/Vertrag ≥ 2023: **3 % / 33 Jahre** (§ 7 Abs. 4 Nr. 2).
- Wohngebäude 1925-2022: 2 % / 50 Jahre.
- Wohngebäude < 1925: 2,5 % / 40 Jahre.
- Gewerbe: 3 % / 33 Jahre.
- § 7b Sonderabschreibung: **5 % p.a. über 4 Jahre** (nicht einmalig),
  Bauantrag 2023-2026.
- § 7i Denkmal-AfA: 9 % Jahre 1-8 + 7 % Jahre 9-12 auf Sanierungskosten.

### Holding-Strukturen

- VV GmbH & Co. KG: erweiterte Gewerbesteuer-Kürzung § 9 Nr. 1 S. 2 GewStG
  (Ausschließlichkeitsgebot beachten). Do **not** label this as
  "BFH 2025 gewerbesteuerfrei".
- Share Deal: § 8b Abs. 2 KStG → **95 % steuerfrei** (5 % NA-BA).
  **Not** 40 %. § 1 Abs. 2b GrEStG löst GrESt ab 90 % Anteilskauf in
  10 Jahren aus (seit 1.7.2021).
- Cross-Border: Pillar Two (15 % Mindestbesteuerung seit 2024), ATAD
  Substanzanforderungen — always warn about these in advantage/disadvantage
  text.
- Familienstiftung: 30 % Erbersatzsteuer alle 30 Jahre.

## Mobile / responsive gotchas

- CSS Grid items default to `min-width: auto` which resolves to the child's
  min-content. For `<input>` that is the placeholder text — easily 300 px+.
  All form grids must keep `.form-grid > *, .form-group { min-width: 0; }`
  and inputs must have `width: 100%; max-width: 100%; min-width: 0`.
- `.scenario-tabs` is a horizontal scroll container at ≤ 768 px. The
  "+ Szenario hinzufügen" button must **not** have `margin-left: auto`
  on mobile — it gets pushed off the visible scroll area.
- Toasts: capped at 4 visible, FIFO eviction, identical messages
  de-duplicated. Container is `pointer-events: none` so the empty
  corner does not block clicks on the page.

## Workflow

- **Default branch**: `main`.
- **Working branch**: `claude/fix-german-tax-2026-NqPOt` (designated by
  the task harness). Always commit and push here.
- **PRs**: open as **draft** against `main` for each round of changes.
  PRs in this repo tend to be merged within ~1 minute of opening, so any
  follow-up commits land on a branch with a closed/merged PR. **Always
  open a new draft PR** after pushing follow-up commits — there is no
  way to "re-open" a merged PR with new commits.
- **No `gh` CLI**: only the GitHub MCP tools (`mcp__github__*`) are
  available. Use `mcp__github__create_pull_request` (always with
  `draft: true`).
- **CI**: `Analyze (javascript-typescript)` (CodeQL) is the only check.
  It takes a few minutes; failures are usually false positives or
  reflect newly introduced JS. Investigate before fixing.
- **Commit style**: short subject (< 70 chars), detailed body, footer
  line `https://claude.ai/code/session_…`. Match the style of recent
  commits.

## Visual audit harness (optional but recommended)

Playwright with the system Chromium at
`/opt/pw-browsers/chromium-1194/chrome-linux/chrome` produces useful
screenshots. See the earlier sessions' `/tmp/audit/audit.js` as a model:
3 viewports × 2 themes × 6 sections, plus a DOM probe for horizontal
overflow. The probe's "low-contrast on .btn-*" warnings are false
positives — buttons use gradient backgrounds that `getComputedStyle`
reports as `transparent`.

## Things to avoid

- Re-introducing `@media (prefers-color-scheme: dark)` blocks (breaks the toggle).
- Adding `var(–foo)` with U+2013 EN DASH or `[type=“…”]` with curly
  quotes — those silently invalidate CSS rules. Always use plain ASCII
  `--` and `"…"` in CSS.
- Pushing the merged-PR's branch and assuming the new commits show up on
  GitHub — they need a new PR.
- Unconditionally adding 5,5 % Soli (must respect the Freigrenze).
- "Cleaning up" the per-state Grundsteuer models into one calculation.
- Changing the version in only one place — there are seven (see
  `package.json`, `README.md`, `CHANGELOG.md`, `index.html` three spots,
  `js/classes/EnhancedPDFExporter.js`, `js/classes/UltimateImmobilienSuiteEnhanced.js`,
  `js/worker-script.js`).
