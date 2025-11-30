# CLAUDE.md - BILD Design System Token Pipeline

> Context-Dokument für Claude Code Sessions. Beschreibt Architektur, Konventionen und wichtige Details.

---

## Quick Reference

```bash
# Build-Befehle
npm run build:tokens    # Vollständiger Build (preprocess + style-dictionary)
npm run build:bundles   # Nur CSS-Bundles neu generieren
npm run build           # Alles (tokens + bundles)
npm run clean           # dist/ und tokens/ löschen
```

**Source of Truth:** `src/design-tokens/bild-design-system-raw-data.json` (Figma Export)

---

## Projektübersicht

Design Token Pipeline für das BILD Design System. Transformiert Figma Variables in plattformspezifische Formate.

| Plattform | Format | Output |
|-----------|--------|--------|
| Web | CSS Custom Properties | `dist/css/` |
| Web | SCSS Variables | `dist/scss/` |
| Web | JavaScript ES6 | `dist/js/` |
| iOS | Swift Extensions | `dist/ios/` |
| Android | XML Resources | `dist/android/` |
| Flutter | Dart Classes | `dist/flutter/` |

---

## Token-Layer-Architektur (4 Ebenen)

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 4: Component Tokens                                      │
│  ─────────────────────────────────────────────────────────────  │
│  Button, Card, Teaser, Alert, InputField, etc.                  │
│  Modes: color (light/dark), density, breakpoint, typography     │
│  Referenziert → Semantic Tokens                                 │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 3: Semantic Tokens                                       │
│  ─────────────────────────────────────────────────────────────  │
│  text-color-primary, surface-color-secondary, etc.              │
│  Modes: color (light/dark), breakpoint                          │
│  Referenziert → Brand Mapping                                   │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 2: Brand Mapping                                         │
│  ─────────────────────────────────────────────────────────────  │
│  BrandColorMapping: Farb-Primitives → Brands                    │
│  BrandTokenMapping: Andere Primitives → Brands                  │
│  Modes: BILD, SportBILD, Advertorial                            │
├─────────────────────────────────────────────────────────────────┤
│  LAYER 1: Primitives (Global)                                   │
│  ─────────────────────────────────────────────────────────────  │
│  colorprimitive, spaceprimitive, sizeprimitive, fontprimitive   │
│  Absolute Werte: --bildred: #DD0000, --space2x: 16px            │
└─────────────────────────────────────────────────────────────────┘
```

### Alias-Ketten (var() Referenzen)

```css
/* Component → Semantic → Primitive */
--button-primary-bg-color: var(--core-color-primary, #DD0000);
                                ↓
--core-color-primary: var(--bildred, #DD0000);
                           ↓
--bildred: #DD0000;
```

---

## Multi-Brand & Multi-Mode System

### Brands (3)

| Brand | ID | Beschreibung |
|-------|-----|--------------|
| `bild` | BILD | Hauptmarke |
| `sportbild` | SportBILD | Sport-Marke |
| `advertorial` | Advertorial | Werbung (weniger Components) |

### Modes nach Token-Typ

| Token-Typ | Modes | CSS-Umsetzung |
|-----------|-------|---------------|
| **Color** | `light`, `dark` | `[data-theme="light/dark"]` |
| **Breakpoint** | `xs` (320px), `sm` (390px), `md` (600px), `lg` (1024px) | `@media (min-width: ...)` |
| **Density** | `compact`, `default`, `spacious` | `[data-density="..."]` |
| **Typography** | `xs`, `sm`, `md`, `lg` | `var()` Referenzen auf Breakpoint-Tokens |

### CSS Data-Attribute Pattern

```html
<html data-brand="bild" data-theme="light" data-density="default">
```

```css
/* Primitives: Global via :root */
:root {
  --bildred: #DD0000;
  --space2x: 16px;
}

/* Semantic/Component: Brand + Theme scoped */
[data-brand="bild"][data-theme="light"] {
  --text-color-primary: var(--bild015, #232629);
  --button-primary-bg-color: var(--bildred, #DD0000);
}

/* Breakpoints: Brand scoped + @media queries */
[data-brand="bild"] {
  --headline1-font-size: 48px;
}
@media (min-width: 1024px) {
  [data-brand="bild"] {
    --headline1-font-size: 64px;
  }
}

/* Density: Brand + Density scoped */
[data-brand="bild"][data-density="compact"] {
  --button-inline-space: 16px;
}

/* Effects/Typography: CSS-Klassen */
[data-brand="bild"][data-theme="light"] .shadow-soft-md {
  box-shadow: 0px 2px 16px 0px rgba(0, 0, 0, 0.03);
}

[data-brand="bild"] .headline1 {
  font-size: var(--headline1-font-size, 48px);
}
```

---

## Build Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│  src/design-tokens/bild-design-system-raw-data.json             │
│  (Figma Plugin Export, ~1MB)                                    │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  scripts/tokens/preprocess.js (~2000 LOC)                       │
│  ─────────────────────────────────────────────────────────────  │
│  • Figma JSON → Style Dictionary Format                         │
│  • Context-aware Alias Resolution (Brand × Mode)                │
│  • Component Token Extraction                                   │
│  • Typography/Effects Composite Token Processing                │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  tokens/                                                        │
│  ├── shared/ (primitives)                                       │
│  └── brands/{brand}/                                            │
│      ├── color/, density/, breakpoints/, overrides/             │
│      ├── semantic/ (effects, typography)                        │
│      └── components/{Component}/ (per-component JSONs)          │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  scripts/tokens/build.js (~1800 LOC)                            │
│  ─────────────────────────────────────────────────────────────  │
│  • Style Dictionary Orchestration                               │
│  • Platform Config Generation (7 Plattformen)                   │
│  • Responsive CSS Conversion (@media queries)                   │
│  • Typography/Effects Class Generation                          │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  build-config/tokens/style-dictionary.config.js (~2500 LOC)     │
│  ─────────────────────────────────────────────────────────────  │
│  • 15+ Custom Transforms (color, size, name, etc.)              │
│  • 22+ Custom Formats (CSS, SCSS, JS, Swift, XML, Dart)         │
│  • Custom Transform Groups per Platform                         │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  scripts/tokens/bundles.js (~560 LOC)                           │
│  ─────────────────────────────────────────────────────────────  │
│  • CSS Bundle Generation                                        │
│  • primitives.css, theme.css, tokens.css                        │
│  • Per-Component Bundles                                        │
│  • Full Brand Bundles                                           │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  dist/                                                          │
│  ├── css/, scss/, js/, json/                                    │
│  ├── ios/, android/, flutter/                                   │
│  └── manifest.json                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Dateistruktur

### Source (Input)

```
src/design-tokens/
└── bild-design-system-raw-data.json    # Figma Plugin Export
```

### Preprocessed (Intermediate)

```
tokens/
├── shared/
│   ├── colorprimitive.json
│   ├── fontprimitive.json
│   ├── sizeprimitive.json
│   └── spaceprimitive.json
└── brands/{bild|sportbild|advertorial}/
    ├── breakpoints/
    │   └── breakpoint-{xs|sm|md|lg}-*.json
    ├── color/
    │   └── colormode-{light|dark}.json
    ├── density/
    │   └── density-{compact|default|spacious}.json
    ├── overrides/
    │   ├── brandcolormapping.json
    │   └── brandtokenmapping.json
    ├── semantic/
    │   ├── effects/
    │   └── typography/
    └── components/{Component}/
        ├── {component}-color-{light|dark}.json
        ├── {component}-density-*.json
        ├── {component}-breakpoint-*.json
        ├── {component}-typography-*.json
        └── {component}-effects-*.json
```

### Build Output

```
dist/
├── css/
│   ├── shared/
│   │   └── primitives.css
│   ├── {brand}/
│   │   ├── theme.css           # Light/Dark colors + effects
│   │   ├── tokens.css          # Breakpoints + Typography + Density
│   │   └── components/
│   │       └── {component}.css
│   └── bundles/
│       └── {brand}.css         # Full bundle (~130KB)
├── scss/
├── js/
├── json/
├── ios/
├── android/
├── flutter/
└── manifest.json
```

---

## Wichtige Konstanten (preprocess.js)

### Collection IDs (Figma)

```javascript
const COLLECTION_IDS = {
  FONT_PRIMITIVE: 'VariableCollectionId:470:1450',
  COLOR_PRIMITIVE: 'VariableCollectionId:539:2238',
  SIZE_PRIMITIVE: 'VariableCollectionId:4072:1817',
  SPACE_PRIMITIVE: 'VariableCollectionId:2726:12077',
  DENSITY: 'VariableCollectionId:5695:5841',
  BRAND_TOKEN_MAPPING: 'VariableCollectionId:18038:10593',
  BRAND_COLOR_MAPPING: 'VariableCollectionId:18212:14495',
  BREAKPOINT_MODE: 'VariableCollectionId:7017:25696',
  COLOR_MODE: 'VariableCollectionId:588:1979'
};
```

### Brand Mode IDs

```javascript
const BRANDS = {
  BILD: '18038:0',
  SportBILD: '18094:0',
  Advertorial: '18094:1'
};
```

### Breakpoint Mode IDs

```javascript
const BREAKPOINTS = {
  xs: '7017:0',    // 320px
  sm: '16706:1',   // 390px
  md: '7015:1',    // 600px
  lg: '7015:2'     // 1024px
};
```

### Breakpoint Pixel Values (style-dictionary.config.js, build.js)

```javascript
const BREAKPOINT_VALUES = {
  xs: '320px',
  sm: '390px',
  md: '600px',
  lg: '1024px'
};
```

---

## Naming Conventions

### CSS Variables

```css
/* Primitives: Kurze Namen */
--bildred
--space2x
--size4x
--font-family-gotham

/* Semantic: Kategorie-basiert */
--text-color-primary
--surface-color-secondary
--border-color-high-contrast

/* Component: Component-Präfix */
--button-primary-bg-color
--card-border-radius
--teaser-title-font-size
```

### Dateinamen

```
{component}-{token-type}-{mode}.css

Beispiele:
button-color-light.css
button-color-dark.css
button-density-compact.css
button-breakpoint-responsive.css
button-typography-responsive.css
```

---

## Don'ts und Gotchas

### KRITISCH - Nicht ändern ohne Verständnis

1. **COLLECTION_IDS** (preprocess.js:44-54)
   - Figma Collection Identifier
   - Änderung bricht Alias-Resolution

2. **Mode Resolution Logik** (preprocess.js:~226-235)
   ```javascript
   // Resolvet Aliase dynamisch nach Mode-NAME, nicht ID
   const brandMode = collection.modes.find(m => m.name === context.brandName);
   ```

3. **Self-Reference Prevention** (style-dictionary.config.js:2283-2288)
   ```javascript
   // Verhindert var(--x, --x) wenn Token-Name = Alias-Name
   if (refName && refName !== uniqueName) {
     output += `var(--${refName}, ${finalValue})`;
   }
   ```

### Häufige Fehler

| Problem | Ursache | Lösung |
|---------|---------|--------|
| Leere CSS-Dateien | Collection-ID falsch | COLLECTION_IDS prüfen |
| Fehlende Aliase | Mode nicht gefunden | Figma Mode-Namen prüfen |
| Doppelte Variablen | Mehrfache Collection-Zuordnung | preprocess.js Filter prüfen |
| VS Code Highlighting | Variable beginnt mit Zahl | In Figma umbenennen |

### CSS-Spezifische Gotchas

1. **Variablennamen mit Zahlen am Anfang** werden von VS Code nicht korrekt gehighlighted:
   ```css
   --700-black-font-weight  /* ⚪ Weiß in VS Code */
   --font-weight-700-black  /* 🔵 Blau in VS Code (besser) */
   ```

2. **Typography/Effects sind CSS-Klassen**, keine Variables:
   ```css
   /* Richtig: Klasse */
   [data-brand="bild"] .headline1 { font-size: var(...); }

   /* NICHT: Variable */
   --headline1: ...;
   ```

3. **Responsive Typography** verwendet `var()` Referenzen:
   ```css
   /* Typography-Klasse referenziert Variable */
   .headline1 { font-size: var(--headline1-font-size, 48px); }

   /* Variable ändert sich via @media */
   @media (min-width: 1024px) {
     [data-brand="bild"] { --headline1-font-size: 64px; }
   }
   ```

---

## Neue Brands/Modes hinzufügen

### Neuer Brand

Änderungen in **3 Dateien**:

1. `preprocess.js` - BRANDS Object + Mode-ID
2. `build.js` - BRANDS Array
3. `bundles.js` - BRANDS Array

### Neuer Breakpoint

Änderungen in **2 Dateien**:

1. `preprocess.js` - BREAKPOINTS Object + Mode-ID
2. `build.js` / `style-dictionary.config.js` - BREAKPOINT_VALUES

---

## Format Functions (style-dictionary.config.js)

### CSS Formats

| Format | Selector | Wert-Typ | Use Case |
|--------|----------|----------|----------|
| `cssVariablesFormat` | `:root` | Direkt | Primitives |
| `cssThemedVariablesFormat` | `[data-*]` | Direkt | Theme-Switching |
| `cssVariablesWithAliasFormat` | `:root` | `var()` | Alias-Ketten |
| `cssThemedVariablesWithAliasFormat` | `[data-*]` | `var()` | Theme + Alias |
| `cssTypographyClassesFormat` | `[data-*] .class` | `var()` | Typography |
| `cssEffectClassesFormat` | `[data-*] .class` | Direkt | Effects/Shadows |

### Andere Plattformen

| Format | Plattform |
|--------|-----------|
| `scssVariablesFormat` | SCSS |
| `javascriptEs6Format` | JS ES6 |
| `iosSwiftClassFormat` | iOS Swift |
| `androidResourcesFormat` | Android XML |
| `flutterDartClassFormat` | Flutter Dart |

---

## Für AI-Assistenten

### Bei Token-Änderungen

- **Werte ändern** → In Figma (Source of Truth)
- **Output-Format ändern** → style-dictionary.config.js
- **Alias-Logik ändern** → preprocess.js
- **Bundle-Struktur ändern** → bundles.js

### Bei CSS-Problemen

1. Selector-Pattern prüfen (`[data-brand]`, `[data-theme]`, etc.)
2. `var()` Referenzen prüfen (korrekte Alias-Auflösung?)
3. @media Queries bei Breakpoint-Issues prüfen

### Typische Aufgaben

| Aufgabe | Datei(en) |
|---------|-----------|
| Neuen Token-Typ | preprocess.js, style-dictionary.config.js |
| Output-Format ändern | style-dictionary.config.js |
| Bundle-Struktur ändern | bundles.js |
| Alias-Logik ändern | preprocess.js (resolveAlias) |
| Neuen Brand | preprocess.js, build.js, bundles.js |

### Debug-Tipps

```bash
# Preprocessed Tokens inspizieren
cat tokens/brands/bild/color/colormode-light.json | jq .

# CSS Output prüfen
cat dist/css/bild/theme.css | head -100

# Bundle-Größen
ls -la dist/css/bundles/
```

---

## Architektur-Entscheidungen

### Warum @media statt data-breakpoint?

```css
/* NICHT verwendet (benötigt JS zum Switchen): */
[data-breakpoint="lg"] { ... }

/* VERWENDET (funktioniert automatisch): */
@media (min-width: 1024px) { ... }
```

### Warum var() mit Fallback?

```css
/* Immer mit Fallback für Robustheit: */
--button-bg: var(--core-color-primary, #DD0000);
```

### Warum separate Mode-Dateien?

- **Lazy Loading:** Nur light ODER dark laden
- **Caching:** Themes separat cachen
- **Debugging:** Einfacher zu inspizieren

---

## Statistiken

| Metrik | Wert |
|--------|------|
| Pipeline LOC | ~8500 |
| Format Functions | 22+ |
| Transforms | 15+ |
| Components | ~55 pro Brand |
| Output Plattformen | 7 |
| Bundle Size (BILD) | ~130 KB |
