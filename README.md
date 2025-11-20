# 🎨 BILD Design System - Token Pipeline

A comprehensive token transformation pipeline based on **Style Dictionary v4** for the BILD Design System. This pipeline transforms Figma design tokens (exported via VariableVisualizer Plugin) into consumable formats across multiple platforms, brands, and modes.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Token Architecture](#token-architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Output Structure](#output-structure)
- [Configuration](#configuration)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This token pipeline processes the multi-layer, multi-brand architecture of the BILD Design System with full support for design token aliases, modes, and brand-specific variations.

```
Figma Tokens (JSON)
         ↓
   Preprocessing (scripts/preprocess-figma-tokens.js)
   • Alias resolution with brand awareness
   • Mode ID mapping
   • Collection ID-based filtering
         ↓
   Style Dictionary v4 (scripts/build-tokens.js)
   • Custom transforms
   • Multi-platform output
   • Brand-specific builds
         ↓
  Output Files (CSS, SCSS, JS, JSON)
  • Platform-first organization
  • Brand-specific semantic tokens
  • Zero warnings, fully resolved
```

---

## ✨ Features

### Pipeline Features

✅ **Stable Collection IDs**: Uses Figma Collection IDs instead of names for robustness against renaming
✅ **Zero Warnings**: All false positives eliminated - handles `0`, `false`, `""` values correctly
✅ **Brand-Aware Alias Resolution**: Cross-collection references resolve correctly per brand
✅ **Multi-Layer Support**: Base → Mapping → Density → Semantic
✅ **Multi-Brand**: BILD, SportBILD, Advertorial
✅ **Multi-Mode**: Light/Dark, Responsive Breakpoints, Density variations
✅ **Multiple Output Formats**: CSS, SCSS, JavaScript, JSON
✅ **Hot Reload**: Watch mode for development

### Architecture Features

✅ **Platform-First Organization**: `dist/css/`, `dist/scss/`, `dist/js/`, `dist/json/`
✅ **Brand-Specific Semantic Layer**: Tokens organized by brand, then category
✅ **Recursive Index Files**: Automatic index generation at each level
✅ **Gitignored Dist**: Build artifacts excluded from version control

---

## 🏗️ Token Architecture

### Layer Structure

The Design System is organized in four layers:

#### 1️⃣ **Base Layer** - Primitive Tokens

Foundation tokens without modes (only "Value" mode).

- **`_ColorPrimitive`**: Base color palette (includes opacity values)
- **`_SpacePrimitive`**: Base spacing scale
- **`_SizePrimitive`**: Base size scale
- **`_FontPrimitive`**: Base typography

**Collections:**
- `VariableCollectionId:539:2238` → `_ColorPrimitive`
- `VariableCollectionId:2726:12077` → `_SpacePrimitive`
- `VariableCollectionId:4072:1817` → `_SizePrimitive`
- `VariableCollectionId:470:1450` → `_FontPrimitive`

**Output:**
```
dist/css/base/
  ├── primitive-color-value.css
  ├── primitive-space-value.css
  ├── primitive-size-value.css
  └── primitive-font-value.css
```

#### 2️⃣ **Mapping Layer** - Brand-Specific Tokens

Maps primitives to brand identities.

- **`BrandTokenMapping`**: Modes: BILD, SportBILD, Advertorial
- **`BrandColorMapping`**: Modes: BILD, SportBILD

**Collections:**
- `VariableCollectionId:18038:10593` → `BrandTokenMapping`
- `VariableCollectionId:18212:14495` → `BrandColorMapping`

**Output:**
```
dist/css/mapping/
  ├── brand-bild.css
  ├── brand-sportbild.css
  ├── brand-advertorial.css
  ├── brand-color-bild.css
  └── brand-color-sportbild.css
```

#### 3️⃣ **Density Layer** - Density Variations

Intermediate layer for UI density levels.

- **`Density`**: Modes: compact, default, spacious

**Collections:**
- `VariableCollectionId:5695:5841` → `Density`

**Output:**
```
dist/css/density/
  ├── density-compact.css
  ├── density-default.css
  └── density-spacious.css
```

#### 4️⃣ **Semantic Layer** - Context-Specific Tokens ⭐

**Brand-specific consumable layer** for applications. Each brand gets its own directory with resolved values.

- **`ColorMode`**: Modes: Light, Dark (brand-specific)
- **`BreakpointMode`**: Modes: XS, SM, MD, LG (brand-specific)

**Collections:**
- `VariableCollectionId:588:1979` → `ColorMode`
- `VariableCollectionId:7017:25696` → `BreakpointMode`

**Output:**
```
dist/css/semantic/
  ├── bild/
  │   ├── color/
  │   │   ├── color-bild-light.css       # BILD brand with #de0000
  │   │   └── color-bild-dark.css
  │   └── breakpoints/
  │       ├── breakpoint-bild-xs.css
  │       ├── breakpoint-bild-sm.css
  │       ├── breakpoint-bild-md.css
  │       └── breakpoint-bild-lg.css
  ├── sportbild/
  │   ├── color/
  │   │   ├── color-sportbild-light.css  # SportBILD brand with #0a264f
  │   │   └── color-sportbild-dark.css
  │   └── breakpoints/
  │       └── ...
  └── advertorial/
      ├── color/
      │   ├── color-advertorial-light.css
      │   └── color-advertorial-dark.css
      └── breakpoints/
          └── ...
```

**Key Feature:** Each brand directory contains fully resolved token values specific to that brand. Cross-collection aliases (e.g., from `ColorMode` → `BrandColorMapping`) are resolved correctly per brand during preprocessing.

---

## 📦 Installation

### Prerequisites

- Node.js >= 16.x
- npm >= 8.x

### Setup

```bash
# Install dependencies
npm install

# Or with pnpm/yarn
pnpm install
yarn install
```

---

## 🚀 Usage

### Full Build

```bash
# 1. Preprocessing: Figma JSON → Intermediate tokens
npm run preprocess

# 2. Build: Tokens → Output files
npm run build:tokens

# Or both in one step:
npm run build
```

**Build Results:**
- ✅ 30/30 builds successful
- ✅ 0 warnings
- ✅ All aliases resolved correctly
- ✅ Brand-specific values verified

### Watch Mode (Development)

```bash
# Auto-rebuild on changes
npm run watch
```

### Clean Build

```bash
# Remove all generated files
npm run clean
```

---

## 📁 Output Structure

### Platform-First Organization

```
dist/
├── manifest.json                    # Manifest of all generated files
│
├── css/                            # CSS Custom Properties
│   ├── base/
│   │   ├── index.css               # Aggregates all base tokens
│   │   ├── primitive-color-value.css
│   │   ├── primitive-color-value-global.css
│   │   └── ...
│   ├── mapping/
│   │   ├── index.css
│   │   ├── brand-bild.css
│   │   └── ...
│   ├── density/
│   │   ├── index.css
│   │   └── ...
│   └── semantic/
│       ├── bild/
│       │   ├── color/
│       │   │   ├── index.css
│       │   │   ├── color-bild-light.css
│       │   │   ├── color-bild-light-global.css
│       │   │   └── color-bild-dark.css
│       │   └── breakpoints/
│       │       ├── index.css
│       │       ├── breakpoint-bild-xs.css
│       │       └── ...
│       ├── sportbild/
│       │   └── ...
│       └── advertorial/
│           └── ...
│
├── scss/                           # SCSS Variables (same structure)
├── js/                             # JavaScript ES6 Modules (same structure)
└── json/                          # Structured JSON (same structure)
```

### File Format Variants

Each token set generates multiple variants:

| Format | Usage | Selector | Example |
|--------|-------|----------|---------|
| `.css` | Data attribute scoped | `[data-color="light"]` | Scoped contexts |
| `-global.css` | Root scoped | `:root` | Global application |
| `.scss` | SCSS variables | `$token-name` | Sass preprocessing |
| `.js` | ES6 module | `import tokens` | JavaScript apps |
| `.json` | Structured data | JSON | API/tooling |

---

## 🎨 Usage in Projects

### CSS

```css
/* Import brand-specific tokens */
@import '@bild-ds/tokens/dist/css/semantic/bild/color/color-bild-light.css';
@import '@bild-ds/tokens/dist/css/semantic/bild/breakpoints/breakpoint-bild-md.css';

/* Or use index files */
@import '@bild-ds/tokens/dist/css/semantic/bild/color/index.css';

/* Usage with data attributes */
[data-color="light"] {
  background: var(--semantic-core-core-color-primary);  /* #de0000 for BILD */
}

/* Or with global variant */
@import '@bild-ds/tokens/dist/css/semantic/bild/color/color-bild-light-global.css';

.button {
  background: var(--semantic-core-core-color-primary);
}
```

### SCSS

```scss
// Import brand-specific tokens
@import '@bild-ds/tokens/dist/scss/semantic/bild/color/color-bild-light.scss';

// Usage
.button {
  background-color: $semantic-core-core-color-primary;  // #de0000 for BILD
  padding: $semantic-spacing-spacing-md;
}
```

### JavaScript/TypeScript

```javascript
// Import brand-specific tokens
import bildColorLight from '@bild-ds/tokens/dist/js/semantic/bild/color/color-bild-light.js';
import sportbildColorLight from '@bild-ds/tokens/dist/js/semantic/sportbild/color/color-sportbild-light.js';

// BILD brand
console.log(bildColorLight['semantic-core-core-color-primary']);  // "#de0000"

// SportBILD brand
console.log(sportbildColorLight['semantic-core-core-color-primary']);  // "#0a264f"
```

### React/Styled Components

```jsx
import bildTokens from '@bild-ds/tokens/dist/js/semantic/bild/color/color-bild-light.js';

const Button = styled.button`
  background-color: ${bildTokens['semantic-core-core-color-primary']};
  color: ${bildTokens['semantic-core-core-fg-on-primary']};
`;
```

---

## ⚙️ Configuration

### Collection Configuration

Located in `scripts/build-tokens.js`:

```javascript
const COLLECTION_CONFIG = {
  'colormode': {
    layer: 'semantic',
    category: 'color',
    modes: ['light', 'dark'],
    outputPrefix: 'color',
    figmaCollectionId: 'VariableCollectionId:588:1979',  // Stable ID
    figmaCollectionName: 'ColorMode',  // For logging only
    brandSpecific: true,
    brands: ['bild', 'sportbild', 'advertorial']
  },
  // ... more collections
};
```

**Key Points:**
- Uses **stable Collection IDs** from Figma (robust against renaming)
- `brandSpecific: true` generates separate files per brand
- `modeMapping` can transform mode names (e.g., `xs-320px` → `xs`)

### Brand-Specific Collections

Located in `scripts/preprocess-figma-tokens.js`:

```javascript
const BRAND_SPECIFIC_COLLECTIONS = {
  'VariableCollectionId:588:1979': {  // ColorMode
    collectionName: 'ColorMode',
    brandSpecific: true,
    brands: ['bild', 'sportbild', 'advertorial'],
    brandCollectionIds: [
      'VariableCollectionId:18038:10593',   // BrandTokenMapping
      'VariableCollectionId:18212:14495'    // BrandColorMapping
    ]
  }
};
```

**How It Works:**
1. During preprocessing, ColorMode tokens that reference BrandColorMapping
2. Are resolved **per brand** using the correct mode ID
3. Generate separate output files: `light-bild.json`, `light-sportbild.json`, etc.

### Style Dictionary Transforms

Custom transforms in `build-config/style-dictionary.config.js`:

```javascript
StyleDictionary.registerTransform({
  name: 'attribute/cti',
  type: 'attribute',
  transformer: (token) => {
    // Custom transformation logic
  }
});
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

Located in `.github/workflows/build-tokens.yml`

**Triggers:**
- Push to `main`, `develop`, or `claude/**` branches
- Changes in `src/design-tokens/`
- Changes in `scripts/` or `build-config/`
- Manual workflow dispatch

**Build Steps:**
1. Checkout repository
2. Setup Node.js
3. Install dependencies
4. Run preprocessing
5. Run build
6. Upload artifacts

**Artifacts:**
- Name: `design-tokens-{commit-sha}`
- Retention: 30 days
- Contains: All generated files

### Manual Workflow Dispatch

**Via GitHub UI:**
1. Go to **Actions** tab
2. Select **"Build Design Tokens"**
3. Click **"Run workflow"**

**Via GitHub CLI:**
```bash
gh workflow run build-tokens.yml
```

---

## 🔧 Development

### Project Structure

```
.
├── src/
│   └── design-tokens/
│       └── BILD Design System-variables-full.json    # Figma export
│
├── scripts/
│   ├── preprocess-figma-tokens.js                    # Preprocessing
│   │   • Alias resolution with brand awareness
│   │   • Collection ID mapping
│   │   • Mode ID mapping
│   │   • Zero false positives (handles 0, false, "")
│   └── build-tokens.js                               # Build orchestration
│       • Collection configuration
│       • Brand-specific builds
│       • Index file generation
│
├── build-config/
│   └── style-dictionary.config.js                    # Custom transforms & formats
│
├── tokens/                                           # Generated (gitignored)
│   ├── colormode/
│   │   ├── light-bild.json                          # Brand-specific
│   │   ├── light-sportbild.json
│   │   └── ...
│   └── ...
│
├── dist/                                             # Generated (gitignored)
│   ├── css/
│   ├── scss/
│   ├── js/
│   └── json/
│
└── README.md
```

### Development Workflow

1. **Export from Figma**
   - Use VariableVisualizer Plugin
   - Export as `BILD Design System-variables-full.json`

2. **Place JSON**
   - Save to `src/design-tokens/`

3. **Preprocess**
   ```bash
   npm run preprocess
   ```
   - Resolves aliases per brand
   - Creates intermediate token files
   - **0 warnings expected**

4. **Build**
   ```bash
   npm run build:tokens
   ```
   - Transforms to all formats
   - **30/30 builds expected**

5. **Verify**
   ```bash
   # Check brand-specific values
   grep "core-color-primary" dist/css/semantic/*/color/*-light.css

   # Expected:
   # bild: #de0000 (BILD red)
   # sportbild: #0a264f (SportBILD dark blue)
   ```

---

## 🧪 Testing

### Build Verification

```bash
# Run full build
npm run build

# Check build statistics
# Expected: 30/30 builds successful, 0 warnings

# Verify output structure
ls -R dist/css/semantic/

# Check brand-specific values
cat dist/css/semantic/bild/color/color-bild-light.css | grep "core-color-primary"
cat dist/css/semantic/sportbild/color/color-sportbild-light.css | grep "core-color-primary"
```

### Alias Resolution Check

```bash
# Check for unresolved aliases
grep -r "UNRESOLVED" tokens/

# Expected: No results (all aliases should be resolved)
```

---

## 🆘 Troubleshooting

### Build Warnings

**Problem:** Warnings about missing values or circular references

**Solution:** This has been fixed! The pipeline now:
- Uses `value === undefined || value === null` checks (handles `0`, `false`, `""` correctly)
- Uses Variable IDs for circular reference detection (not names)
- Resolves cross-collection aliases correctly per brand

**Expected:** 0 warnings in both preprocessing and build

### Brand Values Incorrect

**Problem:** All brands have the same color values

**Solution:** This has been fixed! The pipeline now:
- Maps brand names to Mode IDs in brand collections
- Resolves aliases using the correct brand-specific mode
- Generates separate token files per brand

**Verify:**
```bash
# BILD should have #de0000
grep "core-color-primary" dist/css/semantic/bild/color/color-bild-light.css

# SportBILD should have #0a264f
grep "core-color-primary" dist/css/semantic/sportbild/color/color-sportbild-light.css
```

### Merge Conflicts with dist/

**Problem:** Git conflicts in `dist/` folder

**Solution:** This has been fixed! `dist/` is now:
- Fully gitignored
- Generated locally or in CI/CD
- Never committed to the repository

### Collection Renamed in Figma

**Problem:** Pipeline breaks after renaming collections in Figma

**Solution:** This has been fixed! The pipeline now uses:
- **Stable Collection IDs** instead of names
- IDs never change even if you rename collections
- Names are kept only for logging purposes

---

## 📊 Build Statistics

**Current Performance:**
- ✅ 30/30 builds successful
- ✅ 0 warnings
- ✅ 0 errors
- ✅ ~3s preprocessing
- ✅ ~5s build
- ✅ 178 token files generated
- ✅ All cross-collection aliases resolved
- ✅ Brand-specific values verified

---

## 🔗 Resources

- [Style Dictionary v4 Documentation](https://styledictionary.com/)
- [Figma Variables API](https://www.figma.com/plugin-docs/api/properties/figma-variables/)
- [Design Tokens Community Group](https://design-tokens.github.io/community-group/)
- [VariableVisualizer Plugin](https://www.figma.com/community/plugin/1245712093276493432)

---

## 📝 Changelog

### Latest (Current)

**✨ Features:**
- Brand-specific semantic layer structure (`dist/css/semantic/{brand}/{category}/`)
- Stable Collection ID usage (robust against Figma renaming)
- Zero false positive warnings (correct handling of falsy values)
- Cross-collection brand-aware alias resolution
- Recursive index file generation

**🐛 Bug Fixes:**
- Fixed falsy value detection (`0`, `false`, `""` now handled correctly)
- Fixed false positive circular reference warnings
- Fixed cross-collection alias resolution for brand-specific tokens
- Removed `dist/` from git tracking (now fully gitignored)

**⚡ Performance:**
- 30/30 builds successful
- 0 warnings in preprocessing
- 0 warnings in build
- All aliases fully resolved

---

**Built with ❤️ for the BILD Design System**
