# Pipeline Dynamism Analysis

> Analyse der Token- und Icon-Pipeline bezüglich Konfigurierbarkeit und Wiederverwendbarkeit für andere Design-Systeme.

## Executive Summary

| Pipeline | Status | Konfigurationsnutzung |
|----------|--------|----------------------|
| **Icon-Pipeline** | ✅ Vollständig dynamisch | Verwendet `pipeline.config.js` durchgängig |
| **Token-Pipeline** | ✅ Vollständig dynamisch | Verwendet `pipeline.config.js` durchgängig |

Beide Pipelines sind nun vollständig auf die zentrale `pipeline.config.js` umgestellt.
Um das Design-System für ein anderes Projekt zu verwenden, muss nur diese Datei angepasst werden.

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

---

## 2. Token-Pipeline: Vollständig Dynamisch ✅

### Dateien mit korrekter Konfigurationsnutzung

| Datei | Verwendet pipeline.config.js |
|-------|------------------------------|
| `scripts/tokens/preprocess.js` | ✅ Ja |
| `scripts/tokens/build.js` | ✅ Ja |
| `scripts/tokens/bundles.js` | ✅ Ja |
| `scripts/tokens/release-notes.js` | ✅ Ja |
| `build-config/tokens/style-dictionary.config.js` | ✅ Ja |

### Konfigurierbare Werte (aus pipeline.config.js)

- ✅ Brand-Namen (ColorBrands, ContentBrands)
- ✅ Default-Brand für Fallbacks
- ✅ Mode-ID Mappings (Figma → Pipeline)
- ✅ Collection IDs (Figma Variable Collections)
- ✅ Breakpoints (xs, sm, md, lg mit minWidth)
- ✅ Color Modes (light, dark)
- ✅ Density Modes (default, dense, spacious)
- ✅ Android Package-Name (`com.bild.designsystem`)
- ✅ iOS Module-Name (`BildDesignTokens`)
- ✅ Output-Pfade (CSS, iOS, Android)
- ✅ Platform-Toggles (CSS, SCSS, JS, iOS, Android enabled/disabled)
- ✅ CSS font-size unit (px/rem)
- ✅ CSS data-attributes (data-color-brand, data-content-brand, etc.)
- ✅ iOS SizeClass Mapping
- ✅ Android WindowSizeClass Mapping

---

## 3. pipeline.config.js: Zentrale Konfiguration

Die Config-Datei enthält alle systemspezifischen Werte:

```javascript
module.exports = {
  identity: { name, shortName, copyright, author, license, ... },
  source: {
    inputFile: 'bild-design-system-raw-data.json',
    inputDir: 'packages/tokens/src/',
    outputDir: 'packages/tokens/.tokens/',
    collections: { FONT_PRIMITIVE, COLOR_PRIMITIVE, ... },
    pathConventions: { componentPrefix: 'Component/' },
  },
  modes: {
    brands: {
      color: { '18212:0': 'bild', '18212:1': 'sportbild' },
      content: { '18038:0': 'bild', '18094:0': 'sportbild', '18094:1': 'advertorial' },
      default: 'bild',  // Fallback-Brand
    },
    colorModes: { '588:0': 'light', '592:1': 'dark' },
    densityModes: { '5695:2': 'default', '5695:1': 'dense', '5695:3': 'spacious' },
    breakpoints: {
      '7017:0': { key: 'xs', minWidth: 320, deviceName: 'Mobile (default)' },
      // ...
    },
  },
  platforms: {
    css: { enabled: true, fontSizeUnit: 'px', dataAttributes: { ... } },
    scss: { enabled: false },
    js: { enabled: false },
    ios: { enabled: true, moduleName: 'BildDesignTokens', sizeClasses: { ... } },
    android: { enabled: true, packageName: 'com.bild.designsystem', sizeClasses: { ... } },
  },
  output: { distDir: 'packages/tokens/dist/', showDescriptions: { ... } },
  packages: { tokens: { npm: '@marioschmidt/design-system-tokens' }, ... },
  stencil: { namespace: 'bds', devServerPort: 3333 },
  components: { prefix: 'ds-', srcDir: '...' },
  deployment: { storybookBasePath: '/bild-design-system/' },
  icons: { naming: { prefix: 'Bild', ... }, sizing: { ... }, platforms: { ... } },
};
```

---

## 4. Migrierte Änderungen (Commit c1e59528)

### 4.1 preprocess.js

- ✅ Config Import hinzugefügt
- ✅ `BRANDS` aus `config.modes.brands.content` abgeleitet
- ✅ `COLLECTION_IDS` aus `config.source.collections`
- ✅ `COMPONENT_PREFIX` aus `config.source.pathConventions.componentPrefix`
- ✅ Breakpoint-Density-Matrix Brand-Liste dynamisch

### 4.2 build.js

- ✅ Config Import hinzugefügt
- ✅ `COLOR_BRANDS`, `CONTENT_BRANDS`, `BRANDS` aus Config
- ✅ `DEFAULT_BRAND` aus `config.modes.brands.default`
- ✅ `BREAKPOINTS`, `COLOR_MODES`, `DENSITY_MODES` aus Config
- ✅ Platform-Toggles (`COMPOSE_ENABLED`, `SWIFTUI_ENABLED`, etc.)
- ✅ iOS/Android SizeClass Mappings
- ✅ Android Package-Name via `androidPkg()` Hilfsfunktion
- ✅ Alle Fallback-Pfade verwenden `DEFAULT_BRAND`
- ✅ iOS Interface-Pfade mit dynamischem PascalCase Brand-Prefix
- ✅ JS Output (createTheme, exports) vollständig dynamisch
- ✅ TypeScript-Typen dynamisch generiert
- ✅ React ThemeProvider mit dynamischen Breakpoint-Werten
- ✅ Content-Only Brand Themes (Advertorial, etc.) dynamisch iteriert

### 4.3 bundles.js

- ✅ Config Import hinzugefügt
- ✅ `BRANDS`, `COLOR_BRANDS`, `CONTENT_BRANDS` aus Config
- ✅ `DIST_DIR` aus `config.output.distDir`

### 4.4 style-dictionary.config.js

- ✅ Config Import hinzugefügt
- ✅ `FONT_SIZE_UNIT` aus `config.platforms.css.fontSizeUnit`
- ✅ `DATA_ATTR` aus `config.platforms.css.dataAttributes`

### 4.5 release-notes.js

- ✅ Config Import hinzugefügt
- ✅ `KNOWN_BRANDS` aus Config (COLOR + CONTENT Brands)
- ✅ `KNOWN_MODES` aus `config.modes.colorModes`
- ✅ `KNOWN_BREAKPOINTS` aus `config.modes.breakpoints`

---

## 5. Checkliste für Neues Design-System ✅

Um das Design-System für ein anderes Projekt zu verwenden, muss nur `pipeline.config.js` angepasst werden:

- [ ] `identity.name` - Design-System Name
- [ ] `identity.shortName` - Kurzname für Pfade
- [ ] `identity.copyright` - Copyright-Inhaber
- [ ] `source.inputFile` - Figma Export Dateiname
- [ ] `source.collections.*` - Figma Collection IDs
- [ ] `modes.brands.color` - Figma Mode IDs → Color Brand Keys
- [ ] `modes.brands.content` - Figma Mode IDs → Content Brand Keys
- [ ] `modes.brands.default` - Default Brand für Fallbacks
- [ ] `modes.colorModes` - Light/Dark Mode IDs
- [ ] `modes.densityModes` - Density Mode IDs
- [ ] `modes.breakpoints` - Breakpoint Mode IDs + minWidth + deviceName
- [ ] `platforms.android.packageName` - Kotlin Package
- [ ] `platforms.ios.moduleName` - Swift Package Name
- [ ] `packages.*` - npm/Maven/SPM Package-Namen
- [ ] `icons.naming.prefix` - Icon Prefix (PascalCase)
- [ ] Figma Export JSON ersetzen

---

## 6. Vergleich: Icon vs. Token Pipeline

| Aspekt | Icon-Pipeline | Token-Pipeline |
|--------|---------------|----------------|
| Config Import | ✅ Alle Dateien | ✅ Alle Dateien |
| Brand-Namen | ✅ Aus Config | ✅ Aus Config |
| Package-Namen | ✅ Aus Config | ✅ Aus Config |
| Pfade | ✅ Aus Config | ✅ Aus Config |
| Mode-IDs | N/A | ✅ Aus Config |
| Wiederverwendbar | ✅ Ja | ✅ Ja |

---

## 7. Fazit

Beide Pipelines sind nun **vollständig dynamisch** und können für andere Design-Systeme wiederverwendet werden.

**Architektur-Invarianten** (nicht konfigurierbar):
- 4-Layer Hierarchy (Primitives → Mapping → Semantic → Components)
- Dual-Axis Architecture (ColorBrand + ContentBrand)
- Shadow DOM Support (:host() Selectors)
- Effects sind brand-independent (nur light/dark)
- Density ist brand-independent
- Typography Composite Structure
- var() Reference Chains mit conditional Fallbacks
- @media Queries für responsive Breakpoints

Diese Invarianten sind in der Architektur verankert und werden in `pipeline.config.js` dokumentiert (Kommentare).

---

*Analyse erstellt am: 2026-01-26*
*Branch: claude/analyze-design-system-ZWWUG*
*Migration abgeschlossen: Commits 494a22b1, 9eb7b066, c1e59528*
