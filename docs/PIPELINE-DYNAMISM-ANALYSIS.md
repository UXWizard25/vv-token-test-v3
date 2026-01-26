# Pipeline Dynamism Analysis

> Analyse der Token- und Icon-Pipeline bezüglich Konfigurierbarkeit und Wiederverwendbarkeit für andere Design-Systeme.

## Executive Summary

| Pipeline | Status | Konfigurationsnutzung |
|----------|--------|----------------------|
| **Icon-Pipeline** | ✅ Vollständig dynamisch | Verwendet `pipeline.config.js` durchgängig |
| **Token-Pipeline** | ❌ Noch hardcodiert | Verwendet `pipeline.config.js` NICHT |

Die `pipeline.config.js` ist bereits umfangreich und gut strukturiert, wird aber von der Token-Pipeline noch nicht verwendet.

---

## 1. Icon-Pipeline: Vollständig Dynamisch ✅

### Dateien mit korrekter Konfigurationsnutzung

| Datei | Verwendet pipeline.config.js |
|-------|------------------------------|
| `scripts/icons/build-icons.js` | ✅ Ja |
| `scripts/icons/generate-react.js` | ✅ Ja |
| `scripts/icons/generate-ios.js` | ✅ Ja |
| `scripts/icons/generate-android.js` | ✅ Ja |
| `scripts/icons/generate-ios-package.js` | ✅ Ja |
| `scripts/icons/generate-android-gradle.js` | ✅ Ja |
| `scripts/icons/compile-react.js` | ✅ Ja |
| `scripts/icons/optimize-svg.js` | ✅ Ja |
| `scripts/icons/paths.js` | ✅ Ja |

### Konfigurierbare Werte (aus pipeline.config.js)

- ✅ Icon-Namens-Prefix (`Bild`)
- ✅ Size-Presets (xs, sm, md, lg, xl)
- ✅ React Component Prefix (`Icon`)
- ✅ Android Resource Prefix (`ic_`)
- ✅ iOS Rendering Intent (`template`)
- ✅ Package-Namen (npm, SPM, Maven)
- ✅ Android Gradle-Versionen

**Fazit Icon-Pipeline:** Kann sofort für andere Design-Systeme verwendet werden - nur `pipeline.config.js` anpassen.

---

## 2. Token-Pipeline: Noch Hardcodiert ❌

### Problem: pipeline.config.js wird nicht verwendet

Die Token-Pipeline-Dateien importieren `pipeline.config.js` überhaupt nicht:

```bash
# Keine Matches in Token-Skripten:
scripts/tokens/preprocess.js  → ❌ Kein Import
scripts/tokens/build.js       → ❌ Kein Import
scripts/tokens/bundles.js     → ❌ Kein Import
build-config/tokens/style-dictionary.config.js → ❌ Kein Import
```

### Hardcodierte Werte pro Datei

#### 2.1 `scripts/tokens/preprocess.js`

| Zeile | Hardcodierter Wert | Sollte aus Config kommen |
|-------|-------------------|--------------------------|
| 25-40 | `BRANDS` Mode-ID Mappings | `config.modes.brands` |
| 50-60 | `COLLECTION_IDS` | `config.source.collections` |
| 66 | `'Component/'` Prefix | `config.source.pathConventions.componentPrefix` |

#### 2.2 `scripts/tokens/build.js`

| Zeile | Hardcodierter Wert | Sollte aus Config kommen |
|-------|-------------------|--------------------------|
| 27 | `BRANDS = ['bild', 'sportbild', 'advertorial']` | `Object.values(config.modes.brands.content)` |
| 28 | `COLOR_BRANDS = ['bild', 'sportbild']` | `Object.values(config.modes.brands.color)` |
| 29 | `CONTENT_BRANDS` | `Object.values(config.modes.brands.content)` |
| 30 | `BREAKPOINTS = ['xs', 'sm', 'md', 'lg']` | `Object.values(config.modes.breakpoints).map(b => b.key)` |
| 31 | `COLOR_MODES = ['light', 'dark']` | `Object.values(config.modes.colorModes)` |
| 32 | `DENSITY_MODES` | `Object.values(config.modes.densityModes)` |
| 732+ | `com.bild.designsystem` (50+ Vorkommen) | `config.platforms.android.packageName` |

**Android Package-Referenzen (kritisch):**
```javascript
// 50+ hardcodierte Stellen wie:
const basePkg = 'com.bild.designsystem';  // Zeile 732
package com.bild.designsystem.shared      // Zeile 4892, 4936, 5001, ...
import com.bild.designsystem.brands.${brand}  // Zeile 4682-4689
```

#### 2.3 `scripts/tokens/bundles.js`

| Zeile | Hardcodierter Wert | Sollte aus Config kommen |
|-------|-------------------|--------------------------|
| 41 | `BRANDS = ['bild', 'sportbild', 'advertorial']` | Dupliziert von build.js |

#### 2.4 `build-config/tokens/style-dictionary.config.js`

| Stelle | Hardcodierter Wert | Problem |
|--------|-------------------|---------|
| ~2504-2505 | Brand-Name Formatierung (`'sportbild' → 'Sportbild'`) | String-Vergleiche |
| ~2984-2986 | Swift Enum Cases | Hardcodierte Brand-Namen |

---

## 3. pipeline.config.js: Bereits vorhandene Konfiguration

Die Config-Datei ist bereits gut strukturiert mit allen benötigten Werten:

```javascript
module.exports = {
  identity: { name, shortName, copyright, ... },
  source: {
    collections: { FONT_PRIMITIVE, COLOR_PRIMITIVE, ... },  // ✅ Vorhanden
    pathConventions: { componentPrefix: 'Component/' },      // ✅ Vorhanden
  },
  modes: {
    brands: {
      color: { '18212:0': 'bild', '18212:1': 'sportbild' },  // ✅ Vorhanden
      content: { '18038:0': 'bild', ... },                   // ✅ Vorhanden
    },
    colorModes: { '588:0': 'light', '592:1': 'dark' },       // ✅ Vorhanden
    densityModes: { ... },                                    // ✅ Vorhanden
    breakpoints: { ... },                                     // ✅ Vorhanden
  },
  platforms: {
    android: {
      packageName: 'com.bild.designsystem',  // ✅ Vorhanden, aber nicht genutzt!
      outputDir: 'packages/tokens-android/...',
    },
    ios: {
      moduleName: 'BildDesignTokens',
      outputDir: 'packages/tokens-ios/...',
    },
  },
};
```

---

## 4. Empfehlungen zur Dynamisierung

### Priorität 1: Kritisch (blockiert Wiederverwendung)

| Aufgabe | Aufwand | Impact |
|---------|---------|--------|
| **4.1** `preprocess.js` → Config importieren | Niedrig | Hoch |
| **4.2** `build.js` → Config importieren | Mittel | Hoch |
| **4.3** `bundles.js` → Config importieren | Niedrig | Mittel |
| **4.4** Android Package-Name dynamisieren | Mittel | Hoch |

### Priorität 2: Hoch (verbessert Flexibilität)

| Aufgabe | Aufwand | Impact |
|---------|---------|--------|
| **4.5** `style-dictionary.config.js` → Config nutzen | Mittel | Mittel |
| **4.6** Brand-Name Formatierung zentralisieren | Niedrig | Niedrig |

### Priorität 3: Nice-to-have

| Aufgabe | Aufwand | Impact |
|---------|---------|--------|
| **4.7** Automatische Mode-ID Discovery aus Figma JSON | Hoch | Mittel |
| **4.8** Validierung: Collection IDs existieren | Mittel | Niedrig |

---

## 5. Implementierungs-Vorschlag

### 5.1 preprocess.js Migration

```javascript
// VORHER (hardcodiert):
const COLLECTION_IDS = {
  FONT_PRIMITIVE: 'VariableCollectionId:470:1450',
  // ...
};

// NACHHER (dynamisch):
const config = require('../../build-config/tokens/pipeline.config.js');
const COLLECTION_IDS = config.source.collections;
```

### 5.2 build.js Migration

```javascript
// VORHER:
const BRANDS = ['bild', 'sportbild', 'advertorial'];
const COLOR_BRANDS = ['bild', 'sportbild'];
const basePkg = 'com.bild.designsystem';

// NACHHER:
const config = require('../build-config/tokens/pipeline.config.js');
const BRANDS = [...new Set([
  ...Object.values(config.modes.brands.color),
  ...Object.values(config.modes.brands.content)
])];
const COLOR_BRANDS = Object.values(config.modes.brands.color);
const basePkg = config.platforms.android.packageName;
```

### 5.3 Android Package-Name Substitution

```javascript
// Hilfsfunktion für Package-Namen:
function getAndroidPackage(subpackage = '') {
  const base = config.platforms.android.packageName;
  return subpackage ? `${base}.${subpackage}` : base;
}

// Verwendung:
package ${getAndroidPackage('shared')}  // statt: package com.bild.designsystem.shared
```

---

## 6. Vergleich: Icon vs. Token Pipeline

| Aspekt | Icon-Pipeline | Token-Pipeline |
|--------|---------------|----------------|
| Config Import | ✅ Alle Dateien | ❌ Keine Datei |
| Brand-Namen | ✅ Aus Config | ❌ Hardcodiert |
| Package-Namen | ✅ Aus Config | ❌ Hardcodiert |
| Pfade | ✅ Aus Config | ❌ Hardcodiert |
| Mode-IDs | N/A | ⚠️ Config vorhanden, nicht genutzt |
| Wiederverwendbar | ✅ Ja | ❌ Nein |

---

## 7. Fazit

**Icon-Pipeline:** Vorbildlich implementiert. Kann als Template für die Token-Pipeline dienen.

**Token-Pipeline:** Benötigt Refactoring. Die Konfiguration existiert bereits in `pipeline.config.js`, wird aber nicht genutzt. Die Änderungen sind überschaubar:

1. Import von `pipeline.config.js` in 3-4 Dateien hinzufügen
2. Hardcodierte Arrays durch Config-Werte ersetzen
3. Android Package-Name (~50 Stellen) durch Hilfsfunktion ersetzen

**Geschätzter Aufwand:** 2-4 Stunden für vollständige Dynamisierung.

---

## 8. Checkliste für Neues Design-System

Nach Dynamisierung sollte nur noch `pipeline.config.js` angepasst werden:

- [ ] `identity.name` - Design-System Name
- [ ] `identity.shortName` - Kurzname für Pfade
- [ ] `identity.copyright` - Copyright-Inhaber
- [ ] `source.collections.*` - Figma Collection IDs
- [ ] `modes.brands.*` - Figma Mode IDs → Brand-Keys
- [ ] `modes.colorModes` - Light/Dark Mode IDs
- [ ] `modes.densityModes` - Density Mode IDs
- [ ] `modes.breakpoints` - Breakpoint Mode IDs
- [ ] `platforms.android.packageName` - Kotlin Package
- [ ] `platforms.ios.moduleName` - Swift Package Name
- [ ] `packages.*` - npm/Maven/SPM Package-Namen
- [ ] Figma Export JSON ersetzen

---

*Analyse erstellt am: 2026-01-26*
*Branch: claude/analyze-design-system-59kP7*
