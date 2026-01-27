# Multi-Design-System Pipeline Configuration Guide

> Configuration reference for `pipeline.config.js` - the single source of truth for all pipeline settings.

---

## Table of Contents

- [File Structure Overview](#file-structure-overview)
- [Figma Dependencies](#figma-dependencies)
- [Setup for a New Design System](#setup-for-a-new-design-system)
- [Extending Modes and Brands](#extending-modes-and-brands)
- [Architecture Invariants](#architecture-invariants)
- [Configuration Reference](#configuration-reference)
  - [Validation Flow](#validation-flow)
  - [Validation Configuration](#validation-configuration)
- [Icon Pipeline Configuration](#icon-pipeline-configuration)
- [Quick Reference](#quick-reference)

---

## File Structure Overview

The configuration file is divided into three sections:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          pipeline.config.js                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────┐                                               │
│   │  ✅ rawConfig           │  ← EDIT THIS SECTION                          │
│   │                         │    All user-configurable values               │
│   │  - identity             │    (name, copyright, URLs)                    │
│   │  - brands               │    (brand definitions with axes)              │
│   │  - modes                │    (color, density, breakpoints)              │
│   │  - figma                │    (collection IDs, input file)               │
│   │  - css                  │    (fontSizeUnit, dataAttributes)             │
│   │  - platforms            │    (iOS/Android settings)                     │
│   │  - paths                │    (input/output directories)                 │
│   │  - packages             │    (npm/Maven package names)                  │
│   │  - stencil              │    (Web Components config)                    │
│   │  - icons                │    (icon pipeline settings)                   │
│   │  - deployment           │    (Storybook base path)                      │
│   │  - validation           │    (strict mode, warnings)                    │
│   └────────────┬────────────┘                                               │
│                │                                                            │
│                ▼ auto-derives                                               │
│   ┌─────────────────────────┐                                               │
│   │  ❌ derived             │  ← DO NOT EDIT                                │
│   │                         │    Auto-computed from rawConfig               │
│   │  - allBrands            │    Arrays, lookups, defaults                  │
│   │  - colorBrands          │    Stay in sync automatically                 │
│   │  - contentBrands        │                                               │
│   │  - colorModes           │                                               │
│   │  - densityModes         │                                               │
│   │  - breakpoints          │                                               │
│   │  - *ModeIds             │                                               │
│   │  - *DisplayNames        │                                               │
│   │  - iosIconEnumName      │    (icon enum names derived from shortName)   │
│   │  - iconObjectName       │                                               │
│   │  - androidIconPackage   │                                               │
│   └────────────┬────────────┘                                               │
│                │                                                            │
│                ▼ uses                                                       │
│   ┌─────────────────────────┐                                               │
│   │  ❌ Runtime functions   │  ← DO NOT EDIT                                │
│   │                         │    Figma validation functions                 │
│   │  - deriveColorBrands()  │    Used by preprocess.js                      │
│   │  - deriveContentBrands()│                                               │
│   │  - hasBrandColorMapping()                                               │
│   └─────────────────────────┘                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Figma Dependencies

This pipeline requires a specific Figma Variable structure. Changes in Figma require corresponding updates in the config.

### Required Figma Collections

| Collection | Layer | Purpose |
|------------|-------|---------|
| `_FontPrimitive` | 0 | Font families, weights |
| `_ColorPrimitive` | 0 | Color palette (hex values) |
| `_SpacePrimitive` | 0 | Spacing scale (px values) |
| `_SizePrimitive` | 0 | Size scale (px values) |
| `Density` | 1 | Spacing variants per density mode |
| `BrandTokenMapping` | 1 | Brand sizing/typography mapping |
| `BrandColorMapping` | 1 | Brand color mapping (optional per brand) |
| `BreakpointMode` | 2 | Responsive breakpoint tokens |
| `ColorMode` | 2 | Light/dark semantic tokens |
| `Component/*` | 3 | Component-specific tokens |

### Figma → Config Mapping

| Figma Change | Config Update Required |
|--------------|------------------------|
| Renamed collection | `figma.collections.{COLLECTION_ID}` |
| Renamed mode (e.g., "Light") | `modes.color.{mode}.figmaId` |
| Renamed brand (e.g., "BILD") | `brands.{key}.figmaName` |
| Added new brand | `brands.{newKey}` + `axes` property |
| Added new breakpoint | `modes.breakpoints.{bp}` + `minWidth` |
| Added new density mode | `modes.density.{mode}` + `figmaId` |
| Changed collection IDs | `figma.collections` (after recreate) |

> **Note:** Collection IDs are **stable** unless you delete and recreate the collection in Figma. Mode IDs change when modes are reordered.

### Finding Figma IDs

1. **Collection ID:** Open Figma → Variables panel → Click collection name → Copy ID from URL or settings
2. **Mode ID:** In the CodeBridge export JSON, search for the mode name to find its ID (format: `"123:4"`)

---

## Setup for a New Design System

Follow these steps to adapt the pipeline for your design system:

### Step 1: Identity (required)

Update your system's identity in `rawConfig.identity`:

```javascript
identity: {
  name: 'My Design System',           // Display name in headers
  shortName: 'myds',                  // Used in paths, CSS prefixes
  copyright: 'My Company Inc.',       // License headers
  repositoryUrl: 'https://github.com/org/repo',
},
```

### Step 2: Figma Export (required)

1. Export from Figma using the **CodeBridge Plugin**
2. Place the JSON file in `paths.tokensInput` directory
3. Update the filename:

```javascript
figma: {
  inputFile: 'my-design-system-raw-data.json',
  // ...
},
```

### Step 3: Collection IDs (required)

Copy each collection ID from Figma and update:

```javascript
figma: {
  collections: {
    FONT_PRIMITIVE: 'VariableCollectionId:xxx:xxx',
    COLOR_PRIMITIVE: 'VariableCollectionId:xxx:xxx',
    // ... all collection IDs
  },
},
```

### Step 4: Brands (required)

Define each brand with its Figma mode name and supported axes:

```javascript
brands: {
  mybrand: {
    figmaName: 'MyBrand',           // Exact name in Figma (case-sensitive)
    isDefault: true,                // One brand must be default
    axes: ['color', 'content'],     // Which axes this brand supports
  },
  secondbrand: {
    figmaName: 'SecondBrand',
    axes: ['color', 'content'],
  },
},
```

### Step 5: Modes (required)

Update mode IDs to match your Figma file:

```javascript
modes: {
  color: {
    light: { figmaId: 'xxx:x', isDefault: true },
    dark: { figmaId: 'xxx:x' },
  },
  density: {
    default: { figmaId: 'xxx:x', isDefault: true },
    dense: { figmaId: 'xxx:x' },
    spacious: { figmaId: 'xxx:x' },
  },
  breakpoints: {
    xs: { figmaId: 'xxx:x', minWidth: 320, isBase: true },
    sm: { figmaId: 'xxx:x', minWidth: 390 },
    md: { figmaId: 'xxx:x', minWidth: 600 },
    lg: { figmaId: 'xxx:x', minWidth: 1024 },
  },
},
```

### Step 6: Paths (adjust if needed)

Update output directories if using a different structure:

```javascript
paths: {
  tokensInput: 'packages/tokens/src/',
  tokensIntermediate: 'packages/tokens/.tokens/',
  tokensDist: 'packages/tokens/dist/',
  iosOutput: 'packages/tokens-ios/Sources/MyDesignTokens/',
  androidOutput: 'packages/tokens-android/src/main/kotlin/com/mycompany/designsystem/',
  componentsSrc: 'packages/components/core/src',
},
```

### Step 7: Packages (adjust if needed)

Update package names for your organization:

```javascript
packages: {
  tokens: '@mycompany/design-system-tokens',
  components: '@mycompany/design-system-components',
  react: '@mycompany/design-system-react',
  vue: '@mycompany/design-system-vue',
},
```

---

## Extending Modes and Brands

### Adding a New Brand (Full Brand with Own Colors)

A full brand has its own colors AND sizing/typography.

**1. In Figma:**
- Add mode to `BrandColorMapping` collection
- Add mode to `BrandTokenMapping` collection

**2. In config:**

```javascript
brands: {
  // ... existing brands
  newbrand: {
    figmaName: 'NewBrand',           // Exact Figma mode name
    axes: ['color', 'content'],      // Supports both axes
  },
},
```

**3. Run build** - pipeline auto-generates all outputs

### Adding a Content-Only Brand (Inherits Colors)

A content-only brand has its own sizing/typography but inherits colors from another brand.

**1. In Figma:**
- Add mode to `BrandTokenMapping` **ONLY** (not BrandColorMapping)

**2. In config:**

```javascript
brands: {
  // ... existing brands
  specialcontent: {
    figmaName: 'SpecialContent',
    axes: ['content'],               // Content only - inherits colors
  },
},
```

**Usage in HTML:**
```html
<!-- Uses BILD colors with SpecialContent sizing -->
<div data-color-brand="bild" data-content-brand="specialcontent">
```

### Adding a New Color Mode (e.g., High Contrast)

**1. In Figma:**
- Add mode to `ColorMode` collection

**2. In config:**

```javascript
modes: {
  color: {
    light: { figmaId: '588:0', isDefault: true },
    dark: { figmaId: '592:1' },
    highcontrast: { figmaId: '123:4' },    // New mode
  },
},
```

### Adding a New Density Mode

**1. In Figma:**
- Add mode to `Density` collection

**2. In config:**

```javascript
modes: {
  density: {
    default: { figmaId: '5695:2', isDefault: true },
    dense: { figmaId: '5695:1' },
    spacious: { figmaId: '5695:3' },
    compact: { figmaId: '123:5' },          // New mode
  },
},
```

### Adding a New Breakpoint

**1. In Figma:**
- Add mode to `BreakpointMode` collection

**2. In config:**

```javascript
modes: {
  breakpoints: {
    xs: { figmaId: '7017:0', minWidth: 320, isBase: true },
    sm: { figmaId: '16706:1', minWidth: 390 },
    md: { figmaId: '7015:1', minWidth: 600 },
    lg: { figmaId: '7015:2', minWidth: 1024 },
    xl: { figmaId: '123:6', minWidth: 1440 },   // New breakpoint
  },
},
```

**3. Update native platform mappings:**

```javascript
platforms: {
  ios: {
    sizeClasses: {
      compact: 'sm',
      regular: 'lg',    // Consider mapping to 'xl' if appropriate
    },
  },
  android: {
    sizeClasses: {
      compact: 'sm',
      medium: 'md',
      expanded: 'xl',   // Map to new breakpoint
    },
  },
},
```

---

## Architecture Invariants

These are **NOT configurable** - they are enforced by the pipeline:

| Invariant | Description |
|-----------|-------------|
| **4-Layer Hierarchy** | Primitives → Mapping → Semantic → Components |
| **Dual-Axis Architecture** | ColorBrand (colors/effects) is separate from ContentBrand (sizing/typography) |
| **Shadow DOM Support** | `:host()` selectors always generated for CSS |
| **Brand-Independent Effects** | Effects/shadows only vary by light/dark mode, not by brand |
| **Brand-Independent Density** | Spacing variants are shared across all brands |
| **CSS lineHeight** | Always unitless ratio (CSS best practice) |
| **CSS var() Chains** | References use `var(--token, fallback)` pattern |
| **Mobile-First** | @media queries use `min-width` (smallest = base) |
| **Native Size Classes** | iOS uses 2 classes (compact/regular), Android uses 3 (Compact/Medium/Expanded) |

---

## Configuration Reference

### Naming Constraints

⚠️ **Brand and mode keys must NOT contain hyphens (`-`).**

Use camelCase or single words:
- ✅ `sportbild`, `myBrand`, `highcontrast`
- ❌ `sport-bild`, `my-brand`, `high-contrast`

**Reason:** Keys become CSS custom property segments where hyphens are used as delimiters, making parsing ambiguous.

### Dual-Axis Architecture

The design system uses **two independent axes** for brand selection:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DUAL-AXIS ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ColorBrand axis (data-color-brand)                                         │
│  ├── Controls: colors, effects, shadows                                     │
│  ├── Figma collection: BrandColorMapping                                    │
│  └── Options: brands with axes: ['color', ...]                              │
│                                                                             │
│  ContentBrand axis (data-content-brand)                                     │
│  ├── Controls: sizing, typography, spacing                                  │
│  ├── Figma collection: BrandTokenMapping                                    │
│  └── Options: brands with axes: ['content', ...]                            │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  This enables combinations like:                                            │
│                                                                             │
│    data-color-brand="bild" + data-content-brand="bild"                      │
│    → Standard BILD styling                                                  │
│                                                                             │
│    data-color-brand="bild" + data-content-brand="advertorial"               │
│    → Advertorial content with BILD red colors                               │
│                                                                             │
│    data-color-brand="sportbild" + data-content-brand="advertorial"          │
│    → Advertorial content with SportBILD blue colors                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Validation Flow

The pipeline performs **bidirectional validation** between config and Figma data:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BIDIRECTIONAL VALIDATION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CONFIG → FIGMA (Critical Errors)                                           │
│  ─────────────────────────────────────────────────────────────────────────  │
│  These cause build to ABORT in strict mode:                                 │
│                                                                             │
│  • Brand axes mismatch                                                      │
│    Config: axes: ['color', 'content']                                       │
│    Figma: Brand not found in BrandColorMapping → ERROR                      │
│                                                                             │
│  • Collection ID not found                                                  │
│    Config: BRAND_COLOR_MAPPING: 'VariableCollectionId:xxx'                  │
│    Figma: Collection doesn't exist → ERROR                                  │
│                                                                             │
│  • Mode ID not found                                                        │
│    Config: light: { figmaId: '588:0' }                                      │
│    Figma: Mode ID not in ColorMode collection → ERROR                       │
│                                                                             │
│  FIGMA → CONFIG (Warnings)                                                  │
│  ─────────────────────────────────────────────────────────────────────────  │
│  These are logged as warnings (never abort):                                │
│                                                                             │
│  • Unknown Figma mode                                                       │
│    Figma: BrandColorMapping has mode 'NewBrand'                             │
│    Config: No brand with figmaName: 'NewBrand' → WARNING                    │
│    Effect: Mode is IGNORED during build                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Validation Configuration

```javascript
validation: {
  /**
   * Strict mode - abort build on critical Config ↔ Figma mismatches.
   * Auto-enabled when CI environment variable is set.
   *
   * Recommended:
   * - Local development: false (allows incremental work)
   * - CI/CD pipeline: true (prevents broken deployments)
   */
  strict: process.env.CI === 'true',

  /**
   * Warn about Figma modes not defined in config.
   * Always a warning, never an error (even in strict mode).
   */
  warnUnknownFigmaModes: true,
},
```

### Validation Error Examples

**Error: Brand axis mismatch**
```
❌ Brand 'newbrand' has axes: ['color'] but 'NewBrand' not found in BrandColorMapping.
   Available modes: BILD, SportBILD
   Fix: Either add 'NewBrand' mode to BrandColorMapping in Figma, or remove 'color' from axes.
```

**Error: Mode ID not found**
```
❌ Color mode 'dark' has figmaId '999:0' not found in ColorMode collection.
   Available mode IDs: 588:0 (Light), 592:1 (Dark)
   Fix: Update figmaId in config to match Figma.
```

**Warning: Unknown Figma mode**
```
⚠️ Figma BrandColorMapping has mode 'TestBrand' not defined in config.
   This mode will be IGNORED during build.
   Fix: Add a brand with figmaName: 'TestBrand' and axes: ['color', ...] to config.
```

### Strict Mode Behavior

| Scenario | strict: false | strict: true (CI) |
|----------|---------------|-------------------|
| Critical error (axes mismatch) | ⚠️ Warning, build continues | ❌ Build aborted |
| Critical error (ID not found) | ⚠️ Warning, build continues | ❌ Build aborted |
| Unknown Figma mode | ⚠️ Warning | ⚠️ Warning |
| No errors | ✅ Build succeeds | ✅ Build succeeds |

---

## Icon Pipeline Configuration

The icon pipeline follows the same **single-source-of-truth** principle as tokens. All settings are in `rawConfig.icons`.

### Configuration Options

```javascript
icons: {
  /** Master switch - set to false to skip icon builds entirely */
  enabled: true,

  /** Default icon size in dp/pt (used as default prop value) */
  defaultSize: 24,

  /** Prefix removed from source SVG files (icon-add.svg → add) */
  sourceFilePrefix: 'icon-',

  /** Size presets available on all platforms */
  sizePresets: {
    xs: 16,
    sm: 20,
    md: 24,  // Should match defaultSize
    lg: 32,
    xl: 48,
  },

  /** Platform-specific settings */
  platforms: {
    svg: { enabled: true },
    react: {
      enabled: true,
      componentPrefix: 'Icon',  // add → IconAdd
    },
    android: { enabled: true },
    ios: { enabled: true },
  },
},
```

### Derived Values

These values are **automatically computed** from `identity.shortName`:

| Derived Property | Formula | Example (shortName: `'bild'`) |
|------------------|---------|-------------------------------|
| `iosIconEnumName` | `{ShortName}Icon` | `'BildIcon'` |
| `iconObjectName` | `{ShortName}Icons` | `'BildIcons'` |
| `androidIconPackage` | `de.{shortName}.design.icons` | `'de.bild.design.icons'` |
| `iconAssetAuthor` | `{shortName}-design-system-icons` | `'bild-design-system-icons'` |

### Usage in Build Scripts

All icon generation scripts read from `pipeline.config.js`:

```javascript
// Example: scripts/icons/generate-ios.js
const pipelineConfig = require('../../build-config/pipeline.config.js');

const enumName = pipelineConfig.iosIconEnumName;        // 'BildIcon'
const defaultSize = pipelineConfig.icons.defaultSize;  // 24
const sizePresets = pipelineConfig.icons.sizePresets;  // { xs: 16, ... }
```

### Adapting for Another Design System

To use the icon pipeline for a different design system:

```javascript
// pipeline.config.js
identity: {
  shortName: 'acme',  // → AcmeIcon, AcmeIcons, de.acme.design.icons
},
icons: {
  enabled: true,
  defaultSize: 20,               // Different default
  sourceFilePrefix: 'icon-',     // Same convention
  sizePresets: {
    sm: 16,
    md: 20,
    lg: 28,
  },
  platforms: {
    svg: { enabled: true },
    react: {
      enabled: true,
      componentPrefix: 'Acme',   // add → AcmeAdd
    },
    android: { enabled: true },
    ios: { enabled: false },     // Disable iOS if not needed
  },
},
```

### Icon-Related Build Commands

| Command | Description |
|---------|-------------|
| `npm run build:icons` | Build all enabled platforms |
| `npm run build:icons:svg` | SVG optimization only |
| `npm run build:icons:react` | React components only |
| `npm run build:icons:android` | Android Vector Drawables only |
| `npm run build:icons:ios` | iOS Asset Catalog only |

### Icon Output Locations

| Platform | Output Path |
|----------|-------------|
| SVG | `packages/icons/svg/dist/` |
| React | `packages/icons/react/dist/` |
| Android | `packages/icons/android/src/main/` |
| iOS | `packages/icons/ios/Sources/BildIcons/` |

---

## Quick Reference

### Commonly Used Paths

| Config Path | Description |
|-------------|-------------|
| `identity.name` | System display name |
| `brands.{key}.figmaName` | Figma mode name for brand |
| `brands.{key}.axes` | `['color']`, `['content']`, or `['color', 'content']` |
| `modes.color.{mode}.figmaId` | Figma mode ID for color mode |
| `modes.breakpoints.{bp}.minWidth` | CSS min-width for breakpoint |
| `figma.collections.{COLLECTION}` | Figma collection ID |
| `css.fontSizeUnit` | `'px'` or `'rem'` |
| `platforms.ios.enabled` | Enable/disable iOS output |
| `platforms.android.enabled` | Enable/disable Android output |
| `icons.enabled` | Enable/disable icon pipeline |
| `icons.defaultSize` | Default icon size (dp/pt) |
| `icons.sizePresets` | Size preset map (xs, sm, md, lg, xl) |
| `icons.platforms.{platform}.enabled` | Enable/disable specific icon platform |
| `validation.strict` | Abort build on critical errors |
| `validation.warnUnknownFigmaModes` | Warn about unconfigured Figma modes |

### Build Commands

```bash
npm run build:tokens      # Build all token outputs
npm run preprocess        # Only run Figma → Style Dictionary conversion
npm run build:storybook   # Build Storybook (includes tokens)
```

### Output Locations

| Platform | Output Path |
|----------|-------------|
| CSS | `packages/tokens/dist/css/` |
| JSON | `packages/tokens/dist/json/` |
| iOS | `packages/tokens-ios/Sources/BildDesignTokens/` |
| Android | `packages/tokens-android/src/main/kotlin/com/bild/designsystem/` |
