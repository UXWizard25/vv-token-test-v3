# 🎨 BILD Design System - Token Pipeline

A comprehensive multi-platform token transformation pipeline based on **Style Dictionary v4** for the BILD Design System. This pipeline transforms design tokens from a custom Figma plugin export into consumable formats across 7 platforms, 3 brands, and multiple modes.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Token Architecture](#token-architecture)
- [Output Structure](#output-structure)
- [Platform Usage](#platform-usage)
- [Development](#development)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This token pipeline processes the multi-layer, multi-brand architecture of the BILD Design System with full support for:
- **3 Brands**: BILD, SportBILD, Advertorial
- **7 Platforms**: CSS, SCSS, JavaScript, JSON, iOS (Swift), Android (XML), Flutter (Dart)
- **Multiple Modes**: Density (3), Breakpoints (4), Color Modes (2)
- **Composite Tokens**: Typography, Effects

```
Custom Figma Plugin Export (JSON)
         ↓
Preprocessing (scripts/preprocess-plugin-tokens.js)
• Complete alias resolution (no {Alias.Path} syntax)
• Context-aware resolution: Brand × Breakpoint × ColorMode
• Mode name matching (robust against ID changes)
• FontWeight bug fixes ("700px" → 700)
         ↓
Style Dictionary v4 (scripts/build-tokens-v2.js)
• Multi-platform output (7 formats)
• Brand-specific builds
• Composite token support (Typography, Effects)
         ↓
Output Files (dist/)
• css/, scss/, js/, json/, ios/, android/, flutter/
• shared/ (primitives) + brands/{brand}/ (brand-specific)
• 52/52 successful builds
```

---

## ✨ Features

### Pipeline Features

✅ **Complete Alias Resolution**: All `VARIABLE_ALIAS` references resolved to final values in preprocessing
✅ **7 Platform Support**: CSS, SCSS, JavaScript, JSON, iOS Swift, Android XML, Flutter Dart
✅ **Multi-Brand Architecture**: BILD, SportBILD, Advertorial with brand-specific token resolution
✅ **Composite Tokens**: Typography (12 outputs: 3 brands × 4 breakpoints), Effects (6 outputs: 3 brands × 2 color modes)
✅ **Context-Aware Resolution**: Brand × Breakpoint × ColorMode matrix processing
✅ **Advertorial Special Handling**: No color/ folder (no BrandColorMapping)
✅ **Size Class Mapping**: iOS/Android only generate compact (sm) and regular (lg) with sizeclass terminology
✅ **Zero Reference Errors**: All aliases fully resolved before Style Dictionary

### Build Statistics

- **52/52 builds successful** across all platforms
- 4 Shared Primitives (Color, Font, Size, Space)
- 30 Brand-specific Tokens (3 brands × 10 token sets)
- 12 Typography Builds (3 brands × 4 breakpoints)
- 6 Effect Builds (3 brands × 2 color modes)

---

## 📦 Installation

### Prerequisites

- Node.js >= 20.x
- npm >= 10.x

### Setup

```bash
# Clone repository
git clone https://github.com/UXWizard25/vv-token-test-v3.git
cd vv-token-test-v3

# Install dependencies
npm install

# Build tokens
npm run build
```

---

## 🚀 Quick Start

### Build Tokens

```bash
# Full build (preprocessing + build)
npm run build

# Or run steps separately:
npm run preprocess    # Custom Plugin JSON → Style Dictionary format
npm run build:tokens  # Style Dictionary → Platform outputs
```

### Watch Mode (Development)

```bash
npm run watch
```

### Clean Generated Files

```bash
npm run clean
```

---

## 🏗️ Token Architecture

### Multi-Layer Structure

The Design System is organized in four layers:

#### 1️⃣ **Shared Primitives** - Foundation Tokens

Base tokens without brand context (single mode: "Value").

**Collections:**
- `_FontPrimitive` → Font families, weights, letter spacing
- `_ColorPrimitive` → Base color palette
- `_SizePrimitive` → Base size scale
- `_SpacePrimitive` → Base spacing scale

**Output:**
```
dist/{platform}/shared/
  ├── fontprimitive.*
  ├── colorprimitive.*
  ├── sizeprimitive.*
  └── spaceprimitive.*
```

#### 2️⃣ **Brand-Specific Tokens** - Density & Overrides

Brand context tokens with multiple modes.

**Density Collection** (3 modes):
- compact, default, spacious

**Brand Overrides** (3 brands):
- BrandTokenMapping: BILD, SportBILD, Advertorial
- BrandColorMapping: BILD, SportBILD (⚠️ Advertorial has no BrandColorMapping)

**Output:**
```
dist/{platform}/brands/{brand}/
  ├── density/
  │   ├── density-compact.*
  │   ├── density-default.*
  │   └── density-spacious.*
  └── overrides/
      ├── brandtokenmapping.*
      └── brandcolormapping.*  # Only BILD & SportBILD
```

#### 3️⃣ **Semantic Tokens** - Brand × Mode Matrix

Context-specific tokens with brand and mode variations.

**BreakpointMode** (4 modes per brand):
- xs (320px), sm (390px, compact), md (600px), lg (1024px, regular)

**ColorMode** (2 modes per brand):
- light, dark

**Output:**
```
dist/{platform}/brands/{brand}/semantic/
  ├── breakpoints/
  │   ├── breakpoint-xs-320px.*
  │   ├── breakpoint-sm-390px-compact.*
  │   ├── breakpoint-md-600px.*
  │   └── breakpoint-lg-1024px-regular.*
  └── color/
      ├── colormode-light.*
      └── colormode-dark.*
```

⚠️ **Note**: Advertorial has **no color/ folder** (no BrandColorMapping collection).

#### 4️⃣ **Composite Tokens** - Typography & Effects

Structured tokens with CSS classes for ready-to-use styles.

**Typography** (4 breakpoints per brand):
- 3 brands × 4 breakpoints = **12 outputs**
- CSS: Ready-to-use classes (`.headline1`, `.body1`, etc.)
- iOS/Android: Only compact (sm) and regular (lg) with sizeclass terminology

**Effects** (2 color modes per brand):
- 3 brands × 2 color modes = **6 outputs**
- CSS: Shadow and blur effect classes
- All platforms: Effect token objects

**Output:**
```
dist/{platform}/brands/{brand}/semantic/
  ├── typography/
  │   ├── typography-xs.*
  │   ├── typography-sm.*
  │   ├── typography-md.*
  │   └── typography-lg.*
  └── effects/
      ├── effects-light.*
      └── effects-dark.*
```

**iOS/Android Size Classes:**
```
dist/ios/brands/{brand}/
  ├── sizeclass-compact/    # sm breakpoint
  │   └── Typography.swift
  └── sizeclass-regular/    # lg breakpoint
      └── Typography.swift

dist/android/brands/{brand}/
  ├── sizeclass-compact/    # sm breakpoint
  │   └── typography_styles.xml
  └── sizeclass-regular/    # lg breakpoint
      └── typography_styles.xml
```

---

## 📁 Output Structure

### Platform Overview

```
dist/
├── manifest.json                    # Build metadata
│
├── css/                            # CSS Custom Properties
│   ├── shared/                     # Primitives (no brand context)
│   └── brands/
│       ├── bild/
│       ├── sportbild/
│       └── advertorial/
│
├── scss/                           # SCSS Variables (same structure)
├── js/                             # JavaScript ES6 Modules (same structure)
├── json/                          # JSON Data (same structure)
│
├── ios/                            # Swift Classes
│   ├── shared/
│   └── brands/{brand}/
│       ├── density/
│       ├── overrides/
│       ├── semantic/
│       ├── sizeclass-compact/     # sm only
│       └── sizeclass-regular/     # lg only
│
├── android/                        # Android XML Resources
│   ├── res/values/shared/
│   └── brands/{brand}/
│       └── sizeclass-{compact|regular}/
│
└── flutter/                        # Flutter Dart Classes (same structure as CSS)
```

### Brand Directory Structure

Each brand contains:

```
brands/{brand}/
├── density/                        # 3 files (compact, default, spacious)
├── overrides/                      # 1-2 files (brandtokenmapping, brandcolormapping*)
└── semantic/
    ├── breakpoints/                # 4 files (xs, sm, md, lg)
    ├── color/                      # 2 files (light, dark) - BILD & SportBILD only
    ├── effects/                    # 2 files (light, dark)
    └── typography/                 # 4 files (xs, sm, md, lg)
```

⚠️ **Advertorial Exception**: No `color/` folder (no BrandColorMapping)

---

## 🎨 Platform Usage

### CSS

```css
/* Import brand-specific tokens */
@import '@marioschmidt/design-system-tokens/css/brands/bild/semantic/color/colormode-light.css';
@import '@marioschmidt/design-system-tokens/css/brands/bild/semantic/typography/typography-md.css';

/* Use CSS custom properties */
.button {
  background-color: var(--bild-red-bild-red);  /* #DD0000 */
  font-family: var(--font-family-bild-font-family-gotham-cond);
}

/* Use ready-made typography classes */
<h1 class="headline1">Headline</h1>
```

### SCSS

```scss
// Import brand-specific tokens
@import '@marioschmidt/design-system-tokens/scss/brands/bild/semantic/color/colormode-light';

.button {
  background-color: $bild-red-bild-red;  // #DD0000
  padding: $space-primitive-space2x;
}
```

### JavaScript/TypeScript

```javascript
// Import brand-specific tokens
import tokens from '@marioschmidt/design-system-tokens/js/brands/bild/semantic/color/colormode-light.js';

console.log(tokens.BildRedBildRed);  // "#dd0000"

// React/Styled Components
const Button = styled.button`
  background-color: ${tokens.BildRedBildRed};
`;
```

### JSON

```javascript
// Import structured token data
import tokens from '@marioschmidt/design-system-tokens/json/brands/bild/semantic/color/colormode-light.json';

console.log(tokens);
// {
//   "BildRed": {
//     "bildRed": {
//       "$type": "color",
//       "$value": "#DD0000",
//       "type": "color",
//       "value": "#DD0000"
//     }
//   }
// }
```

### iOS (Swift)

```swift
// Import brand-specific tokens
import DesignTokens

// Use color tokens
let primaryColor = Colorprimitive.bildRedBildRed  // UIColor

// Use typography (size class aware)
let typography = Typography.headline1  // Typography struct
```

### Android (XML)

```xml
<!-- Import brand-specific colors -->
<resources>
    <color name="bild_red_bild_red">#DD0000</color>
    <dimen name="space_2x">16dp</dimen>

    <!-- Typography styles (size class aware) -->
    <style name="Headline1" parent="TextAppearance.AppCompat">
        <item name="android:fontFamily">@font/gotham_condensed</item>
        <item name="android:textSize">48sp</item>
    </style>
</resources>
```

### Flutter (Dart)

```dart
// Import brand-specific tokens
import 'package:design_tokens/brands/bild/semantic/color/colormode_light.dart';

// Use color tokens
final primaryColor = Colorprimitive.bildRedBildRed;  // Color

// Use typography tokens
final headline1 = Typography.headline1;  // TypographyToken
```

---

## 🔧 Development

### Project Structure

```
.
├── src/
│   └── design-tokens/
│       └── bild-design-system-raw-data.json    # Custom Figma Plugin export
│
├── scripts/
│   ├── preprocess-plugin-tokens.js             # Preprocessing (965 lines)
│   │   • Alias resolution to final values
│   │   • Context-aware resolution (Brand × Breakpoint × ColorMode)
│   │   • Mode name matching (not ID-based)
│   │   • FontWeight bug fix ("700px" → 700)
│   │   • Advertorial special handling (no BrandColorMapping)
│   │
│   └── build-tokens-v2.js                      # Build orchestration (551 lines)
│       • Multi-platform configuration (7 formats)
│       • Brand-specific builds
│       • Composite token support (Typography, Effects)
│       • Size class mapping for iOS/Android
│
├── build-config/
│   └── style-dictionary.config.js              # Custom transforms & formats
│       • CSS typography classes format
│       • CSS effect classes format
│       • iOS Swift typography format
│       • Android typography XML format
│
├── tokens/                                     # Generated (gitignored)
│   ├── shared/                                 # Primitives (4 files)
│   └── brands/                                 # Brand-specific (3 brands)
│       ├── bild/
│       ├── sportbild/
│       └── advertorial/
│
├── dist/                                       # Generated (gitignored)
│   ├── css/, scss/, js/, json/                 # Web platforms
│   ├── ios/, android/, flutter/                # Native platforms
│   └── manifest.json                           # Build metadata
│
└── README.md
```

### Custom Figma Plugin Export

The pipeline expects a JSON export from a custom Figma plugin with the following structure:

```json
{
  "variableCollections": [
    {
      "id": "VariableCollectionId:...",
      "name": "CollectionName",
      "modes": [
        { "modeId": "mode-id", "name": "mode-name" }
      ],
      "variableIds": ["VariableID:..."]
    }
  ],
  "variables": [
    {
      "id": "VariableID:...",
      "name": "token/path/name",
      "resolvedType": "COLOR|FLOAT|STRING",
      "valuesByMode": {
        "mode-id": "#DD0000"  // Direct value
        // OR
        "mode-id": { "type": "VARIABLE_ALIAS", "id": "VariableID:..." }
      }
    }
  ]
}
```

**Export Location**: `src/design-tokens/bild-design-system-raw-data.json`

### Development Workflow

1. **Export from Figma**
   - Use custom Figma plugin
   - Export as `bild-design-system-raw-data.json`

2. **Place JSON**
   - Save to `src/design-tokens/`

3. **Preprocess**
   ```bash
   npm run preprocess
   ```
   - Resolves all aliases to final values
   - Creates intermediate token files in `tokens/`
   - Output: 68 JSON files (4 shared + 64 brand-specific)

4. **Build**
   ```bash
   npm run build:tokens
   ```
   - Transforms to all 7 platforms
   - **52/52 builds successful**
   - ⚠️ Warnings about token collisions (LetterSpacing) are expected but non-critical

5. **Verify**
   ```bash
   # Check brand-specific values
   grep "bild-red" dist/css/brands/bild/semantic/color/colormode-light.css
   grep "bild-red" dist/css/brands/sportbild/semantic/color/colormode-light.css

   # Check Advertorial has no color folder
   ls dist/css/brands/advertorial/semantic/
   # Expected: breakpoints/, effects/, typography/ (NO color/)

   # Check all platforms exist
   ls dist/
   # Expected: css/, scss/, js/, json/, ios/, android/, flutter/, manifest.json
   ```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflows

#### 1. Build Tokens (`.github/workflows/build-tokens.yml`)

**Triggers:**
- Push to `main`, `develop`, `claude/**`, `figma-tokens` branches
- Changes in `src/design-tokens/`, `scripts/`, `build-config/`
- Manual workflow dispatch

**Steps:**
1. Checkout repository
2. Setup Node.js 20
3. Install dependencies
4. Run `npm run build`
5. Commit dist/ folder to feature branches
6. Upload build artifacts (30 days retention)

**Outputs:**
- Validates build success: 52/52 builds
- Commits dist/ to branch (for PR workflows)
- Creates artifacts: `design-tokens-{sha}.zip`

#### 2. Auto PR from Figma (`.github/workflows/auto-pr-from-figma.yml`)

**Trigger:**
- Push to `figma-tokens` branch (from Figma plugin)

**Workflow:**
```
Figma Plugin Push → figma-tokens branch
         ↓
Build Tokens (52/52)
         ↓
Commit dist/ to branch
         ↓
Create/Update Pull Request
         ↓
Merge to main
         ↓
Publish to NPM (automatic)
```

**PR Format:**
- Title: "chore: update design tokens from Figma"
- Body: Build statistics, changed files, diff summary
- Auto-assigns reviewers

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

## 🧪 Testing & Verification

### Build Verification

```bash
# Run full build
npm run build

# Expected output:
# 📦 Baue Shared Primitives:
#   ✅ fontprimitive
#   ✅ colorprimitive
#   ✅ sizeprimitive
#   ✅ spaceprimitive
#
# 🏷️  Baue Brand-spezifische Tokens:
#   📦 bild: ✅ density (3 modes) ✅ breakpoints (4 modes) ✅ color (2 modes) ✅ overrides (2 collections)
#   📦 sportbild: ✅ density (3 modes) ✅ breakpoints (4 modes) ✅ color (2 modes) ✅ overrides (2 collections)
#   📦 advertorial: ✅ density (3 modes) ✅ breakpoints (4 modes) ✅ overrides (1 collection)
#
# ✍️  Baue Typography Tokens:
#   🏷️  bild: ✅ bild-xs (css, scss, js, json, flutter) ✅ bild-sm (+ ios, android) ...
#
# 🎨 Baue Effect Tokens:
#   🏷️  Brand: bild ✅ bild-light (css, scss, js, json, ios, android, flutter) ...
#
# 📊 Statistiken:
#    - Shared Primitives: 4/4
#    - Brand-spezifische Tokens: 30/30
#    - Typography Builds: 12/12
#    - Effect Builds: 6/6
#    - Builds erfolgreich: 52/52
```

### Brand-Specific Values

```bash
# BILD should use Gotham Condensed
grep "font-family-gotham-cond" dist/css/brands/bild/semantic/typography/typography-md.css

# SportBILD should use AntennaExtraCond
grep "font-family-antenna-extra-cond" dist/css/brands/sportbild/semantic/typography/typography-md.css

# BILD red: #DD0000
grep "bild-red-bild-red" dist/css/shared/colorprimitive.css
# Expected: --bild-red-bild-red: #DD0000;

# SportBILD has different brand colors
grep "sport-bild-dark-blue" dist/css/shared/colorprimitive.css
```

### Advertorial Special Case

```bash
# Advertorial should NOT have color/ folder
ls dist/css/brands/advertorial/semantic/
# Expected: breakpoints/ effects/ typography/ (NO color/)

ls dist/css/brands/bild/semantic/
# Expected: breakpoints/ color/ effects/ typography/
```

### Breakpoint Scaling

```bash
# Typography scales across breakpoints
# headline1 should scale from 48px (xs) to 100px (lg) for BILD

grep "headline1" dist/json/brands/bild/semantic/typography/typography-xs.json | grep fontSize
# Expected: 48px

grep "headline1" dist/json/brands/bild/semantic/typography/typography-lg.json | grep fontSize
# Expected: 100px
```

---

## 🆘 Troubleshooting

### ⚠️ Variable nicht gefunden: VariableID:16104:163534

**Problem:** Preprocessing warns about missing variable

**Cause:** Variable `Component/Kicker/Partner/kickerStylebookBgColor` references a deleted/renamed variable in Figma

**Impact:** Non-critical - Token gets `UNRESOLVED_` value, build continues

**Solution:** In Figma, check and re-link the `kickerStylebookBgColor` variable

### ⚠️ Token Collisions in fontprimitive/sizeprimitive/spaceprimitive

**Problem:** Style Dictionary warns about token name collisions for some platforms

**Cause:** LetterSpacing tokens have positive/negative values with similar names:
- `letterSpace-0_25` (negative) → `LetterSpace025` (JS/iOS/Flutter)
- `letterSpace0_25` (positive) → `LetterSpace025` (same!)

**Impact:** Non-critical - Last value wins, usually works fine

**Platforms Affected:**
- ❌ JavaScript, iOS, Android, Flutter, JSON (name collision)
- ✅ CSS, SCSS (no collision - hyphens preserved)

**Solution (Figma-side):**
Rename tokens in Figma:
```
letterSpace-0_25 → letterSpaceNeg0_25  (or letterSpaceMinus0_25)
letterSpace0_25  → letterSpacePos0_25  (or letterSpacePlus0_25)
```

### Build Failures

**Problem:** Build fails with "ENOENT: no such file or directory"

**Solution:**
```bash
# Make sure preprocessing ran first
npm run preprocess

# Then build
npm run build:tokens

# Or use the combined command
npm run build
```

**Problem:** "Cannot find module 'style-dictionary'"

**Solution:**
```bash
npm install
```

### Missing dist/ Folder

**Problem:** dist/ folder not visible after build

**Solution:** dist/ is gitignored. It's generated locally or in CI/CD:
```bash
npm run build
ls dist/  # Should show css/, scss/, js/, json/, ios/, android/, flutter/
```

### Wrong Platform Outputs

**Problem:** Some platforms missing files

**Solution:** Check build output for errors:
```bash
npm run build 2>&1 | grep "❌"
```

All platforms should build successfully: 52/52

---

## 📊 Technical Details

### Key Design Decisions

1. **Complete Alias Resolution in Preprocessing**
   - No `{Alias.Path}` syntax in Style Dictionary
   - All aliases resolved to final Hex/px/numeric values
   - Prevents reference errors in Style Dictionary

2. **Context-Aware Alias Resolution**
   - Brand × Breakpoint × ColorMode matrix
   - Each context combination gets unique resolution
   - Example: `colormode-light` for BILD resolves brand-specific aliases using BILD's mode ID

3. **Mode Name Matching**
   - Collections have different mode IDs
   - Match by `mode.name` instead of `mode.modeId`
   - Robust against Figma re-creating modes

4. **Brand-Specific Processing**
   - Separate token files per brand and mode
   - Prevents collisions during Style Dictionary build
   - Enables brand-specific value verification

5. **Size Class Terminology**
   - iOS/Android use "sizeclass" terminology
   - Only compact (sm) and regular (lg) generated
   - xs and md breakpoints skipped for native platforms

### Performance

- **Preprocessing**: ~2-3 seconds
- **Build**: ~8-10 seconds (all 52 builds)
- **Total**: ~11 seconds
- **Output Size**: ~15 MB (all platforms)

---

## 📝 Changelog

### v2.0.0 (Current) - Custom Plugin Migration

**✨ Features:**
- Custom Figma Plugin integration (replaces Variable Visualizer)
- 7 platform support: CSS, SCSS, JS, JSON, iOS, Android, Flutter
- Complete alias resolution in preprocessing (no Style Dictionary references)
- Composite token support: Typography (12 builds), Effects (6 builds)
- Brand-specific output structure: `dist/{platform}/brands/{brand}/`
- Advertorial special handling (no color/ folder)
- Size class mapping for iOS/Android (compact/regular only)
- Context-aware alias resolution: Brand × Breakpoint × ColorMode

**🐛 Bug Fixes:**
- FontWeight bug fix: "700px" → 700
- Mode name matching instead of ID-based (robust against Figma changes)
- YAML syntax fix in GitHub Actions (multi-line commit messages)
- Exit code 0 for successful builds
- dist/ folder commits to feature branches

**⚡ Performance:**
- 52/52 builds successful (up from 30/30)
- All 7 platforms generate complete token sets
- ~11 seconds total build time

**📦 Migration:**
- New scripts: `preprocess-plugin-tokens.js`, `build-tokens-v2.js`
- New token source: `bild-design-system-raw-data.json`
- Removed: Old Variable Visualizer scripts and token files

---

## 🔗 Resources

- [Style Dictionary v4 Documentation](https://styledictionary.com/)
- [Figma Variables API](https://www.figma.com/plugin-docs/api/properties/figma-variables/)
- [Design Tokens Community Group](https://design-tokens.github.io/community-group/)
- [Repository Issues](https://github.com/UXWizard25/vv-token-test-v3/issues)

---

**Built with ❤️ for the BILD Design System**
