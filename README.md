# 🎨 BILD Design System - Token Pipeline v3

> **⚠️ IMPORTANT NOTICE**
>
> This pipeline is still under construction. The generated packages must **not be used in production environments** – only for testing purposes.

A multi-platform design token transformation pipeline powered by **Style Dictionary v4** with **Figma-scoped semantic type detection**. Transforms design tokens from Figma Variables export into consumable formats across 7 platforms, 3 brands, and multiple modes.

[![Build Status](https://github.com/UXWizard25/vv-token-test-v3/workflows/Build%20Design%20Tokens/badge.svg)](https://github.com/UXWizard25/vv-token-test-v3/actions)
[![npm version](https://img.shields.io/npm/v/@marioschmidt/design-system-tokens.svg)](https://www.npmjs.com/package/@marioschmidt/design-system-tokens)

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [📊 Token Transform Reference](#-token-transform-reference)
- [🔗 Figma Integration & Dependencies](#-figma-integration--dependencies)
- [📦 Installation](#-installation)
- [🚀 Quick Start](#-quick-start)
- [🎨 Platform Usage Examples](#-platform-usage-examples)
- [📁 Output Structure](#-output-structure)
- [🔧 Development](#-development)
- [🔄 CI/CD Integration](#-cicd-integration)
- [🆘 Troubleshooting](#-troubleshooting)
- [📝 Changelog](#-changelog)

---

## 🎯 Overview

This pipeline processes the multi-layer, multi-brand BILD Design System architecture with outputs for:

- **3 Brands**: BILD, SportBILD, Advertorial
- **7 Platforms**: CSS, SCSS, JavaScript, JSON, iOS (Swift), Android (XML), Flutter (Dart)
- **Multiple Modes**: Density (3), Breakpoints (4), Color Modes (2)
- **Token Types**: Primitives, Semantic Tokens, Component Tokens (~917 files)
- **Composite Tokens**: Typography, Effects/Shadows (semantic + component-specific)

### Pipeline Flow

```
┌─────────────────────────────────────────────┐
│ Figma Variables (Design Source)            │
│ • BILD Design System file                   │
│ • Variables with Scopes & Aliases           │
│ • TokenSync plugin export                   │
└─────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ Raw Export (src/design-tokens/)            │
│ • bild-design-system-raw-data.json          │
│ • Figma structure with scopes & aliases    │
│ • FLOAT values as pure numbers (no units)  │
└─────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ Preprocessing (scripts/preprocess-*.js)    │
│ • Scope-based type determination            │
│ • Alias resolution                          │
│ • Component token detection & organization  │
│ • Opacity conversion (Figma % → 0-1)       │
│ • Floating-point rounding                   │
└─────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ Intermediate (tokens/)                     │
│ • Style Dictionary format                   │
│ • ~920 JSON files (tracked in Git)         │
│ • Ready for multi-platform transformation  │
└─────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ Style Dictionary Build                     │
│ • Platform-specific transforms              │
│ • iOS: CGFloat Points (not px strings)     │
│ • iOS: UIColor objects (not strings)       │
│ • Typography: px units for web/Flutter     │
│ • Value rounding & precision cleanup       │
└─────────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│ Build Output (dist/)                       │
│ • 969 successful builds                     │
│ • Outputs for all platforms (testing only)  │
│ • NOT tracked in Git (CI artifacts)         │
└─────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 🎯 Platform Outputs

✅ **Platform-Native Formats**
- CSS: `var(--token-name)` with proper units
- iOS Swift: `UIColor` objects, `CGFloat` points, `UIFont` instances
- Flutter: `Color(0xFF...)`, `BoxShadow` arrays
- Android: XML resources with proper types (`<color>`, `<dimen>`)

✅ **Scope-Based Type Detection**
- Figma scopes determine token types (Priority 1)
- Name-based fallback for missing scopes (Priority 2)
- Automatic unit assignment (px, opacity, fontWeight)

✅ **Precision & Rounding**
- Floating-point errors eliminated (`0.699999988` → `0.7`)
- Consistent rounding across all platforms
- Safe decimal precision (2 places standard, 3 for UIColor)

✅ **Cross-Platform Compatibility**
- Naming conventions follow platform best practices
- Type-safe outputs (no string px values on iOS)
- Composite tokens (Typography, Effects) fully supported

### 🏗️ Pipeline Features

✅ **Figma Integration**
- Direct Figma Variables export support
- Scope-aware token processing
- Alias resolution with circular reference detection
- Opacity conversion (Figma % → CSS decimal)

✅ **Multi-Platform Builds**
- 969 successful builds across 7 platforms
- 3 brands × multiple modes
- Composite tokens (Typography: 12 outputs, Effects: 6 outputs)

✅ **CI/CD Ready**
- GitHub Actions integration
- Automatic PR creation from Figma exports
- Build artifacts with 30-day retention
- NPM publishing on merge

---

## 🏗️ Architecture

### Token Processing Stages

#### 1️⃣ **Figma Export** (`src/design-tokens/`)

Raw Figma Variables export containing:
- **Variables** with `scopes` array (semantic type info)
- **Aliases** (references to other variables)
- **FLOAT values** as pure numbers (units assigned later)
- **Collections & Modes** structure

**Key Properties:**
```json
{
  "variables": [
    {
      "name": "Semantic/LayerOpacity/layerOpacity05",
      "resolvedType": "FLOAT",
      "scopes": ["OPACITY"],
      "valuesByMode": {
        "539:2": 5  // Figma opacity as percentage
      }
    },
    {
      "name": "Component/Button/buttonPrimaryBgColor",
      "resolvedType": "COLOR",
      "scopes": ["ALL_SCOPES"],
      "valuesByMode": {
        "588:0": { "type": "VARIABLE_ALIAS", "id": "..." }  // Alias to semantic token
      }
    }
  ]
}
```

#### 2️⃣ **Preprocessing** (`tokens/`)

Transforms raw Figma data into Style Dictionary format:

**Component Token Detection:**
```javascript
// Automatic detection based on path prefix
"Component/Button/buttonPrimaryBgColor" → Component Token (organized in components/Button/)
"Component/Alert/alertBorderWidth" → Component Token (organized in components/Alert/)
"Semantic/TextColor/textColorPrimary" → Semantic Token (organized in semantic/)
"ColorPrimitive/red500" → Primitive Token (organized in shared/)
```

**Scope-Based Type Determination:**
```javascript
// Priority 1: Figma Scopes (semantic meaning)
scopes: ["OPACITY"] → $type: "opacity"
scopes: ["WIDTH_HEIGHT", "GAP"] → $type: "dimension"
scopes: ["FONT_SIZE"] → $type: "fontSize"
scopes: ["FONT_WEIGHT"] → $type: "fontWeight"

// Priority 2: Name-based fallback (if no scopes)
"border-width-hairline" → $type: "dimension"
"layer-opacity50" → $type: "opacity"
"font-weight-700" → $type: "fontWeight"
```

**Value Processing:**
- Opacity: `5` (Figma %) stays as `5` (converted to `0.05` in transforms)
- Dimensions: `0.33` → `0.33` (gets `px` in CSS, stays number for iOS)
- Colors: `#DD0000` → `#DD0000` (converted to UIColor for iOS)
- FontWeight: `700` → `700` (unitless)

**Floating-Point Rounding:**
```javascript
0.33000001311302185 → 0.33
rgba(0, 0, 0, 0.699999988079071) → rgba(0, 0, 0, 0.7)
```

#### 3️⃣ **Style Dictionary Transforms** (`dist/`)

Platform-specific transformations:

**CSS/SCSS/JS:**
```javascript
dimension → "8px"
opacity → 0.05 (from 5)
color → "#DD0000"
```

**iOS Swift:**
```swift
dimension → 8 (CGFloat Points)
opacity → 0.05 (CGFloat)
color → UIColor(red: 0.867, green: 0, blue: 0, alpha: 1)
```

**Flutter:**
```dart
dimension → "8px"
opacity → 0.05
color → Color(0xFFdd0000)
```

---

## 📊 Token Transform Reference

### Naming Conventions

| Platform | Convention | Example | Status |
|----------|-----------|---------|---------|
| **CSS** | `kebab-case` with `--` | `--text-color-primary` | ✅ |
| **SCSS** | `kebab-case` with `$` | `$text-color-primary` | ✅ |
| **JavaScript** | `camelCase` | `textColorPrimary` | ✅ |
| **iOS Swift** | `PascalCase` | `TextColorPrimary` | ✅ |
| **Android** | `kebab-case` | `text-color-primary` | ✅ |
| **Flutter** | `camelCase` | `textColorPrimary` | ✅ |

### Normal Tokens

#### Colors

| Platform | Format | Example | Usage | Ready |
|----------|--------|---------|-------|-------|
| **CSS** | `#HEX` / `rgba()` | `#DD0000` | `var(--text-color-primary)` | ✅ |
| **JavaScript** | `"#HEX"` string | `"#DD0000"` | `backgroundColor: textColorPrimary` | ✅ |
| **iOS Swift** | `UIColor()` object | `UIColor(red: 0.137, ...)` | `view.backgroundColor = TextColorPrimary` | ✅ |
| **Flutter** | `Color(0xFF...)` | `Color(0xFF232629)` | `color: textColorPrimary` | ✅ |
| **Android** | `#hex` resource | `#dd0000` | `@color/text-color-primary` | ✅ |

**Notes:**
- iOS outputs **UIColor objects**, not strings
- Flutter uses ARGB format with `0xFF` prefix
- Transparency values are properly rounded

#### Dimensions (spacing, sizing, borders)

| Platform | Format | Example | Usage | Ready |
|----------|--------|---------|-------|-------|
| **CSS** | `Xpx` | `16px`, `0.33px` | `var(--space2x)` | ✅ |
| **JavaScript** | `"Xpx"` string | `"16px"` | Parsing needed for calculations | ✅⚠️ |
| **iOS Swift** | `CGFloat` number | `16`, `0.33` | `let padding: CGFloat = Space2x` | ✅ |
| **Android** | `Xpx` dimen | `16px` | `@dimen/space2x` | ✅ |
| **Flutter** | `"Xpx"` string | `"16px"` | Parsing: `.replaceAll('px', '')` | ✅⚠️ |

**Notes:**
- iOS uses **Points** (not pixels), outputs pure `CGFloat` numbers
- JavaScript/Flutter get strings with "px" - developers parse for calculations
- Border hairline: `0.33px` properly rounded

#### Opacity

| Platform | Format | Example | Usage | Ready |
|----------|--------|---------|-------|-------|
| **CSS** | `0-1` number | `0.5`, `0.05` | `opacity: var(--layer-opacity50)` | ✅ |
| **JavaScript** | `"0-1"` string | `"0.5"` | `opacity: layerOpacity50` | ✅ |
| **iOS Swift** | `CGFloat` | `0.5` | `view.alpha = LayerOpacity50` | ✅ |
| **Flutter** | `double` | `0.05` | `opacity: layerOpacity05` | ✅ |
| **Android** | `"0-1"` string | `"0.5"` | `android:alpha="@string/layer-opacity50"` | ✅ |

**Notes:**
- Figma exports opacity as percentage (5, 10, 70)
- Transform converts to decimal: `5` → `0.05`, `70` → `0.7`
- All platforms receive proper 0-1 range

#### Font Weight

| Platform | Format | Example | Usage | Ready |
|----------|--------|---------|-------|-------|
| **CSS** | unitless integer | `700`, `400` | `font-weight: var(--font-weight-700)` | ✅ |
| **JavaScript** | number | `700` | `fontWeight: fontWeight700` | ✅ |
| **iOS Swift** | UIFont.Weight | `.bold`, `.regular` | Mapped from numeric value | ✅ |
| **Android** | `bold` / `normal` | text style | `android:textStyle="bold"` | ✅ |
| **Flutter** | FontWeight | `FontWeight.w700` | `fontWeight: FontWeight.w700` | ✅ |

**Notes:**
- All platforms receive unitless integers
- iOS maps to UIFont.Weight enums
- No "px" suffix bug (fixed in preprocessing)

### Composite Tokens

#### Typography

| Platform | Format | Usage | Ready |
|----------|--------|-------|-------|
| **CSS** | CSS Classes with data-attributes | `<h1 class="display1" data-brand="bild" data-breakpoint="lg">` | ✅ |
| **SCSS** | Maps | `$display1: (fontSize: 120px, lineHeight: 120px, ...)` | ✅ |
| **JavaScript** | Objects | `{fontSize: "120px", lineHeight: "120px", fontWeight: 800}` | ✅ |
| **iOS Swift** | UIFont instances | `UIFont.TypographyBildregular.display1` | ✅ |
| **Flutter** | Maps | `{'fontSize': '120px', 'fontWeight': 800, ...}` | ✅ |
| **Android** | XML styles | `<style name="Display1">...</style>` (sp units) | ✅ |

**Example Outputs:**

```css
/* CSS */
[data-brand="bild"][data-breakpoint="lg"] .display1 {
  font-family: Gotham;
  font-weight: 800;
  font-size: 120px;
  line-height: 120px;
  letter-spacing: -2px;
}
```

```javascript
// JavaScript
export const display1 = {
  fontFamily: "Gotham",
  fontWeight: 800,
  fontSize: "120px",
  lineHeight: "120px",
  letterSpacing: "-2px"
};
```

```swift
// iOS Swift
UIFont.TypographyBildregular.display1
// → UIFont(name: "Gotham", size: 120)?.withWeight(.heavy)
```

**Notes:**
- All numeric typography values have `px` units (CSS, JS, Flutter)
- iOS uses Points (native UIFont size)
- Android uses `sp` for text sizing

#### Effects / Shadows

| Platform | Format | Usage | Ready |
|----------|--------|-------|-------|
| **CSS** | `box-shadow` | Ready-to-use shadow classes | ✅ |
| **JavaScript** | Array of objects | `[{offsetX, offsetY, radius, spread, color}]` | ✅ |
| **iOS Swift** | `[NSShadow]` array | `Effects.Shadowsoftmd` (multiple layers) | ✅ |
| **Flutter** | `[BoxShadow]` array | Native BoxShadow objects | ✅ |
| **Android** | Programmatic | Not exported (Android shadows typically in code) | N/A |

**Example Outputs:**

```css
/* CSS */
.shadowsoftmd {
  box-shadow: 0px 2px 16px 0px rgba(0, 0, 0, 0.03),
              0px 4px 12px 0px rgba(0, 0, 0, 0.07);
}
```

```javascript
// JavaScript
export const shadowsoftmd = [
  { offsetX: 0, offsetY: 2, radius: 16, spread: 0, color: "rgba(0, 0, 0, 0.03)" },
  { offsetX: 0, offsetY: 4, radius: 12, spread: 0, color: "rgba(0, 0, 0, 0.07)" }
];
```

```swift
// iOS Swift
public static let Shadowsoftmd: [NSShadow] = [
  NSShadow(offset: CGSize(width: 0, height: 2), blurRadius: 16,
           color: UIColor(red: 0, green: 0, blue: 0, alpha: 0.03))
  // ...
]
```

---

## 🔗 Figma Integration & Dependencies

### Figma Variables Requirements

The pipeline expects Figma Variables with the following structure:

```
Variables:
├── Collections (e.g., "ColorMode", "BreakpointMode", "Density")
│   └── Modes (e.g., "light", "dark", "xs", "sm", "md", "lg")
└── Variables
    ├── name: "Semantic/LayerOpacity/layerOpacity05" OR "Component/Button/buttonPrimaryBgColor"
    ├── resolvedType: "FLOAT" | "COLOR" | "STRING" | "BOOLEAN"
    ├── scopes: ["OPACITY"] | ["WIDTH_HEIGHT"] | ["FONT_SIZE"] | etc.
    └── valuesByMode: { "mode-id": value | alias }
```

**Token Path Patterns:**
- **Semantic Tokens**: `Semantic/Category/tokenName` → Organized in `semantic/` folders
- **Component Tokens**: `Component/ComponentName/tokenName` → Organized in `components/ComponentName/` folders
- **Primitive Tokens**: `ColorPrimitive/colorName` → Organized in `shared/` folder

### Supported Figma Scopes

The pipeline uses Figma scopes to determine token types semantically:

| Scope | Assigned Type | Output Format | Example |
|-------|---------------|---------------|---------|
| `OPACITY` | `opacity` | 0-1 decimal (÷100) | `5` → `0.05` |
| `WIDTH_HEIGHT` | `dimension` | px (CSS/Android), CGFloat (iOS) | `16` → `16px` / `16` |
| `GAP` | `dimension` | Same as WIDTH_HEIGHT | `8` → `8px` / `8` |
| `STROKE_FLOAT` | `dimension` | Same as WIDTH_HEIGHT | `0.33` → `0.33px` / `0.33` |
| `CORNER_RADIUS` | `dimension` | Same as WIDTH_HEIGHT | `4` → `4px` / `4` |
| `FONT_SIZE` | `fontSize` | px with transform | `40` → `40px` |
| `LINE_HEIGHT` | `dimension` | Always px (per requirement) | `48` → `48px` |
| `LETTER_SPACING` | `dimension` | px with transform | `-0.5` → `-0.5px` |
| `FONT_WEIGHT` | `fontWeight` | Unitless integer | `700` → `700` |

### Component Tokens Organization

Component tokens are automatically detected and organized by the preprocessing pipeline:

**Detection Logic:**
```javascript
// Any token starting with "Component/" is a component token
Component/Button/Primary/buttonPrimaryBgColor  → Component Token
Component/Inputfield/inputBorderWidth           → Component Token
Semantic/TextColor/textColorPrimary             → Semantic Token
```

**Automatic Organization:**
```
Component Tokens in Figma:
├── Component/Button/buttonPrimaryBgColor
├── Component/Button/buttonPrimaryTextColor
├── Component/Alert/alertBorderWidth
└── Component/Alert/alertShadow

Generated Output Structure:
dist/css/brands/bild/components/
├── Button/
│   ├── colormode-light.css    (color tokens for Button)
│   ├── density-default.css    (density tokens for Button)
│   └── breakpoints.css        (breakpoint tokens for Button)
└── Alert/
    ├── colormode-light.css
    └── effects-light.css      (shadow/effect tokens for Alert)
```

**Collection-Based Routing:**
- **ColorMode collection** → `components/{ComponentName}/colormode-{mode}.css`
- **Density collection** → `components/{ComponentName}/density-{mode}.css`
- **BreakpointMode collection** → `components/{ComponentName}/breakpoints.css`
- **BrandTokenMapping/BrandColorMapping** → `components/{ComponentName}/overrides/`

**Composite Component Tokens:**
```
Typography:
  Component/Button/buttonLabelStyle → dist/.../components/Button/typography-{breakpoint}.css

Effects:
  Component/Alert/alertShadowDown → dist/.../components/Alert/effects-{colormode}.css
```

**Key Benefits:**
- ✅ Automatic component isolation (Button tokens separate from Alert tokens)
- ✅ Brand × Mode matrix applied to component tokens
- ✅ ~917 component token files across all platforms
- ✅ Clear separation: `semantic/` vs `components/` folders

### What is Stable (✅ Safe Changes)

#### ✅ Creating New Tokens
```
Action: Add new variable in Figma
Result: Automatically included in next export
Pipeline: Preprocesses and builds for all platforms
Risk: None
```

#### ✅ Editing Token Values
```
Action: Change color from #DD0000 to #FF0000
Result: Value updated in next export
Pipeline: All platforms get new value
Risk: None
```

#### ✅ Creating/Editing Aliases
```
Action: Reference another variable
Export: { "type": "VARIABLE_ALIAS", "id": "VariableID:123" }
Pipeline: Alias resolved to final value in preprocessing
Risk: None (circular references detected and warned)
```

#### ✅ Adding Scopes to Tokens
```
Action: Assign "OPACITY" scope in Figma
Result: Pipeline uses scope for type determination
Pipeline: Automatic unit assignment based on scope
Risk: None (improves type detection)
```

#### ✅ Changing Token Names
```
Action: Rename "oldName" → "newName"
Result: New name used in all platforms
Pipeline: Name transforms applied per platform
Risk: Breaking change for consumers (semantic versioning bump)
```

#### ✅ Adding New Modes
```
Action: Add new breakpoint "xl"
Result: New mode exports with variables
Pipeline: Builds new token files for mode
Risk: None (additive change)
```

#### ✅ Creating Component Tokens
```
Action: Add "Component/Button/buttonPrimaryBgColor" in Figma
Result: Automatically detected as component token
Pipeline: Organized in dist/.../components/Button/ folder
Risk: None
Note: Component name extracted from path (2nd segment: "Button")
```

#### ✅ Creating New Components
```
Action: Add first token "Component/Card/cardBgColor"
Result: New component folder created automatically
Pipeline: dist/.../components/Card/ folder generated
Risk: None (additive change)
Note: ~917 component token files currently in pipeline
```

#### ✅ Adding Component Typography/Effects
```
Action: Add textStyle "Component/Button/buttonLabelStyle"
Result: Treated as composite component token
Pipeline: Generated in components/Button/typography-{breakpoint}.css
Risk: None
Note: Component typography/effects separated from semantic styles
```

### What is NOT Stable (⚠️ Pipeline Breaks)

#### ⚠️ Deleting Collections
```
Action: Delete "ColorMode" collection in Figma
Result: All variables in collection missing
Pipeline: ❌ Preprocessing fails (missing collection)
Risk: HIGH - Pipeline breaks
Fix: Restore collection or update preprocessing code
```

#### ⚠️ Renaming Collections
```
Action: Rename "ColorMode" → "ThemeMode"
Result: Preprocessing looks for old name
Pipeline: ⚠️ Collection not found, tokens skipped
Risk: MEDIUM - Tokens not built
Fix: Update collection name in preprocess-plugin-tokens.js
```

#### ⚠️ Deleting Modes (Used by Tokens)
```
Action: Delete "dark" mode from ColorMode
Result: Variables with dark values orphaned
Pipeline: ⚠️ Mode not found for affected tokens
Risk: MEDIUM - Some tokens missing
Fix: Ensure modes exist or remove unused mode references
```

#### ⚠️ Changing Mode Names
```
Action: Rename mode "light" → "bright"
Result: Preprocessing matches by name
Pipeline: ⚠️ May not find renamed mode
Risk: LOW-MEDIUM - Context-dependent
Fix: Preprocessing uses name matching (usually handles this)
Note: Mode IDs can change, names are matched
```

#### ⚠️ Removing Scopes from Critical Tokens
```
Action: Remove "OPACITY" scope from opacity tokens
Result: Falls back to name-based detection
Pipeline: ⚠️ May misdetect type if name unclear
Risk: LOW - Fallback usually works
Fix: Either restore scope or ensure clear token name
```

#### ❌ Circular Alias References
```
Action: TokenA → TokenB → TokenA
Result: Infinite loop in alias resolution
Pipeline: ⚠️ Detected and logged, token marked "UNRESOLVED"
Risk: LOW - Detected but token unusable
Fix: Break circular reference in Figma
```

#### ⚠️ Renaming Component in Token Path
```
Action: Rename "Component/Button/..." → "Component/Btn/..."
Result: Component name extracted from path changes
Pipeline: ✅ Builds successfully but in different folder
Risk: MEDIUM - Breaking change for consumers
Impact: Old path: components/Button/, New path: components/Btn/
Fix: Consumer code must update import paths
Note: Semantic versioning major bump required
```

#### ⚠️ Moving Token Between Component/Semantic
```
Action: "Component/Button/bgColor" → "Semantic/Button/bgColor"
Result: Token moves from components/ to semantic/ folder
Pipeline: ✅ Builds successfully in new location
Risk: MEDIUM - Breaking change for consumers
Impact: Import path changes from components/ to semantic/
Fix: Consumer code must update import paths
Note: Pipeline detects by "Component/" prefix
```

#### ⚠️ Invalid Component Token Paths
```
Action: Create token "Component/buttonBgColor" (only 2 segments)
Result: Missing component name in path
Pipeline: ⚠️ Token skipped or misprocessed
Risk: LOW - Validation catches most cases
Fix: Use proper path: "Component/{ComponentName}/{tokenName}"
Note: Minimum 3 path segments required for component tokens
```

### Pipeline Stability Matrix

| Change Type | Detection | Impact | Auto-Recovery | Fix Required |
|-------------|-----------|--------|---------------|--------------|
| New token | ✅ Auto | ➕ Added | ✅ Yes | ❌ No |
| Edit value | ✅ Auto | 🔄 Updated | ✅ Yes | ❌ No |
| Edit alias | ✅ Auto | 🔄 Resolved | ✅ Yes | ❌ No |
| Add scope | ✅ Auto | ✨ Better typing | ✅ Yes | ❌ No |
| Rename token | ✅ Auto | 🔄 Name updated | ✅ Yes | ⚠️ Consumer breaking |
| Add mode | ✅ Auto | ➕ New outputs | ✅ Yes | ❌ No |
| Delete collection | ❌ Error | ❌ Build fails | ❌ No | ✅ Code update |
| Rename collection | ⚠️ Warning | ⚠️ Tokens skipped | ❌ No | ✅ Code update |
| Delete mode | ⚠️ Warning | ⚠️ Some tokens skip | ⚠️ Partial | ⚠️ Check references |
| Rename mode | ⚠️ Warning | ⚠️ May not match | ⚠️ Usually | ⚠️ Check matching |
| Remove scope | ⚠️ Warning | ⚠️ Fallback to name | ⚠️ Usually | ⚠️ Check type |
| Circular alias | ⚠️ Warning | ⚠️ Token unresolved | ❌ No | ✅ Fix in Figma |
| **New component token** | ✅ Auto | ➕ Component folder | ✅ Yes | ❌ No |
| **New component** | ✅ Auto | ➕ Folder created | ✅ Yes | ❌ No |
| **Component typography/effects** | ✅ Auto | ➕ Composite output | ✅ Yes | ❌ No |
| **Rename component in path** | ✅ Auto | 🔄 Folder renamed | ✅ Yes | ⚠️ Consumer breaking |
| **Move Component↔Semantic** | ✅ Auto | 🔄 Folder changed | ✅ Yes | ⚠️ Consumer breaking |
| **Invalid component path** | ⚠️ Warning | ⚠️ Token skipped | ❌ No | ✅ Fix path in Figma |

### Best Practices

**DO:**
- ✅ Use Figma scopes for all tokens (better type detection)
- ✅ Use clear, semantic token names
- ✅ Test exports in `figma-tokens` branch before merging
- ✅ Review CI build artifacts before publishing
- ✅ Use aliases for design tokens (single source of truth)
- ✅ Use proper component paths: `Component/{ComponentName}/{tokenName}` (min 3 segments)
- ✅ Organize by component in Figma (Button, Alert, Card, etc.)
- ✅ Use consistent component naming (PascalCase recommended)

**DON'T:**
- ❌ Delete collections without updating preprocessing code
- ❌ Create circular alias references
- ❌ Use ambiguous token names without scopes
- ❌ Push directly to `main` without review
- ❌ Manually edit generated files in `dist/`
- ❌ Use invalid component paths like `Component/tokenName` (too few segments)
- ❌ Rename component folders in Figma without coordinating with consumers
- ❌ Mix component and semantic tokens in same path structure

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

### NPM Package Installation

```bash
npm install @marioschmidt/design-system-tokens
```

---

## 🚀 Quick Start

### Build Commands

```bash
# Full build (preprocessing + platform builds)
npm run build

# Or run steps separately:
npm run preprocess     # Figma JSON → Style Dictionary format
npm run build:tokens   # Style Dictionary → 7 platforms
npm run build:bundles  # Generate CSS bundle files

# Development watch mode
npm run watch

# Clean generated files
npm run clean
```

### Build Output

```
✨ Build completed!

📊 Statistics:
   - Shared Primitives: 4/4
   - Brand-specific Tokens: 30/30
   - Component Tokens: 917/917
   - Typography Builds: 12/12
   - Effect Builds: 6/6
   - Builds successful: 969/969
```

---

## 🎨 Platform Usage Examples

### CSS

```css
/* Import tokens */
@import '@marioschmidt/design-system-tokens/css/brands/bild/semantic/color/colormode-light.css';

/* Use variables */
.button {
  background-color: var(--text-color-accent-constant);  /* #DD0000 */
  padding: var(--space2x);  /* 16px */
  opacity: var(--layer-opacity50);  /* 0.5 */
  border-width: var(--border-width-hairline);  /* 0.33px */
}

/* Use typography classes */
<h1 class="display1" data-brand="bild" data-breakpoint="lg">Headline</h1>

/* Use shadow classes */
<div class="shadowsoftmd" data-brand="bild" data-theme="light">Card</div>
```

### JavaScript / React

```javascript
import {
  textColorPrimary,
  space2x,
  layerOpacity50
} from '@marioschmidt/design-system-tokens/js/brands/bild/semantic/color/colormode-light';

import { display1 } from '@marioschmidt/design-system-tokens/js/brands/bild/semantic/typography/typography-lg';

// Use in styled components
const Button = styled.button`
  background-color: ${textColorPrimary};  // "#232629"
  padding: ${space2x};  // "16px"
  opacity: ${layerOpacity50};  // "0.5"
`;

// Use typography
const Headline = styled.h1`
  font-family: ${display1.fontFamily};  // "Gotham"
  font-size: ${display1.fontSize};  // "120px"
  font-weight: ${display1.fontWeight};  // 800
`;
```

### iOS Swift (UIKit / SwiftUI)

```swift
import UIKit

// Colors (UIColor objects, not strings!)
view.backgroundColor = StyleDictionary.TextColorPrimary
// → UIColor(red: 0.137, green: 0.149, blue: 0.161, alpha: 1)

button.setTitleColor(StyleDictionary.TextColorAccentConstant, for: .normal)
// → UIColor(red: 0.867, green: 0, blue: 0, alpha: 1)

// Dimensions (CGFloat Points, not "Xpx" strings!)
let padding: CGFloat = StyleDictionary.Space2x  // 16 (Points)
let borderWidth: CGFloat = StyleDictionary.BorderWidthHairline  // 0.33

// Opacity (CGFloat)
view.alpha = StyleDictionary.LayerOpacity50  // 0.5

// Typography (UIFont instances)
label.font = UIFont.TypographyBildregular.display1
// → UIFont(name: "Gotham", size: 120)?.withWeight(.heavy)

// Effects (NSShadow arrays)
view.layer.shadowColor = Effects.Shadowsoftmd[0].shadowColor
view.layer.shadowOffset = Effects.Shadowsoftmd[0].shadowOffset
view.layer.shadowRadius = Effects.Shadowsoftmd[0].shadowBlurRadius
```

### Flutter

```dart
import 'package:design_tokens/brands/bild/semantic/color/colormode_light.dart';
import 'package:design_tokens/brands/bild/semantic/typography/typography_lg.dart';

// Colors (native Color objects)
Container(
  color: Colors.textColorPrimary,  // Color(0xFF232629)
  child: Text(
    'Headline',
    style: TextStyle(
      fontFamily: TypographyBildLg.display1['fontFamily'],  // 'Gotham'
      fontSize: double.parse(
        TypographyBildLg.display1['fontSize'].replaceAll('px', '')
      ),  // 120.0
      fontWeight: FontWeight.w${TypographyBildLg.display1['fontWeight']},
    ),
  ),
)

// Shadows (BoxShadow arrays)
Container(
  decoration: BoxDecoration(
    boxShadow: EffectsLight.shadowsoftmd,  // [BoxShadow(...), ...]
  ),
)
```

### Android XML

```xml
<!-- Colors -->
<TextView
    android:textColor="@color/text-color-primary"
    android:background="@color/surface-color-primary" />

<!-- Dimensions -->
<View
    android:padding="@dimen/space2x"
    android:layout_width="@dimen/size80x" />

<!-- Typography Styles -->
<TextView
    style="@style/Display1"
    android:text="Headline" />
```

### SCSS

```scss
@import '@marioschmidt/design-system-tokens/scss/brands/bild/semantic/color/colormode-light';
@import '@marioschmidt/design-system-tokens/scss/brands/bild/semantic/typography/typography-lg';

.button {
  background-color: $text-color-accent-constant;  // #DD0000
  padding: $space2x;  // 16px
  opacity: $layer-opacity50;  // 0.5
}

.headline {
  font-family: map-get($display1, 'fontFamily');  // Gotham
  font-size: map-get($display1, 'fontSize');  // 120px
  font-weight: map-get($display1, 'fontWeight');  // 800
}
```

---

## 📁 Output Structure

```
dist/
├── manifest.json                    # Build metadata
│
├── css/                             # CSS Custom Properties
│   ├── shared/                      # Primitives (4 files)
│   │   ├── colorprimitive.css
│   │   ├── fontprimitive.css
│   │   ├── sizeprimitive.css
│   │   └── spaceprimitive.css
│   └── brands/
│       ├── bild/
│       │   ├── density/             # 3 files (compact, default, spacious)
│       │   ├── overrides/           # 2 files (brand + color mappings)
│       │   ├── components/          # ~300 component token files
│       │   └── semantic/
│       │       ├── breakpoints/     # 4 files + 1 responsive
│       │       ├── color/           # 2 files (light, dark)
│       │       ├── typography/      # 4 files (xs, sm, md, lg)
│       │       └── effects/         # 2 files (light, dark)
│       ├── sportbild/               # Same structure as bild
│       └── advertorial/             # No color/ folder!
│
├── scss/                            # SCSS Variables (same structure)
├── js/                              # JavaScript ES6 (same structure)
├── json/                            # JSON Data (same structure)
│
├── ios/                             # Swift Classes
│   ├── shared/                      # 4 files
│   └── brands/{brand}/
│       ├── density/
│       ├── overrides/
│       ├── components/
│       ├── semantic/
│       │   ├── breakpoints/
│       │   ├── color/
│       │   └── effects/
│       ├── sizeclass-compact/       # sm breakpoint: Typography.swift
│       └── sizeclass-regular/       # lg breakpoint: Typography.swift
│
├── android/                         # Android XML Resources
│   └── res/values/
│       ├── shared/
│       └── brands/{brand}/
│           └── sizeclass-{compact|regular}/
│               └── typography_styles.xml
│
├── flutter/                         # Flutter Dart (same as CSS structure)
│
└── bundles/                         # Convenience bundle files
    ├── bild-all.css                 # All BILD tokens
    ├── bild-semantic.css            # Semantic layer only
    └── bild/components/             # Per-component bundles
```

### Brand Differences

| Brand | Color Folder | Color Mapping | Notes |
|-------|--------------|---------------|-------|
| **BILD** | ✅ Yes | ✅ Yes | Full token set |
| **SportBILD** | ✅ Yes | ✅ Yes | Full token set |
| **Advertorial** | ❌ No | ❌ No | No BrandColorMapping collection in Figma |

---

## 🔧 Development

### Project Structure

```
.
├── src/design-tokens/
│   └── bild-design-system-raw-data.json     # Figma Variables export
│
├── scripts/
│   ├── preprocess-plugin-tokens.js          # Preprocessing (1100+ lines)
│   │   • Scope-based type determination
│   │   • Alias resolution
│   │   • Opacity conversion (Figma % → 0-1)
│   │   • Floating-point rounding
│   │
│   ├── build-tokens-v2.js                   # Build orchestration (600+ lines)
│   │   • Multi-platform configuration
│   │   • 969 builds across 7 platforms
│   │   • Composite token support
│   │
│   └── build-bundles.js                     # Bundle generation
│       • Quick Start bundles
│       • Semantic bundles
│       • Component bundles
│
├── build-config/
│   └── style-dictionary.config.js           # Custom transforms (2000+ lines)
│       • iOS Points transform (CGFloat not px strings)
│       • iOS UIColor transform (objects not strings)
│       • Opacity transform (% → decimal)
│       • Floating-point rounding transform
│       • Typography/Effects formats
│
├── tokens/                                  # Intermediate (tracked in Git)
│   ├── shared/                              # 4 primitive files
│   └── brands/                              # ~920 brand/mode/component files
│
├── dist/                                    # Build output (NOT in Git)
│   └── [Generated by npm run build]
│
└── README.md
```

### Development Workflow

1. **Export from Figma**
   - Use TokenSync plugin (custom-built)
   - Target branch: `figma-tokens` (recommended)
   - Exports to: `src/design-tokens/bild-design-system-raw-data.json`

2. **Plugin Pushes to GitHub**
   - Creates/updates `figma-tokens` branch
   - Triggers `auto-pr-from-figma.yml` workflow
   - PR automatically created with build artifacts

3. **Review PR**
   - Source changes: View JSON diff
   - Platform outputs: Download CI artifacts
   - Verify build: 969/969 successful

4. **Merge to main**
   - `publish-on-merge.yml` triggers
   - Fresh build + version bump
   - Publish to npm + GitHub Release

### Local Development

```bash
# Make changes to source
vim src/design-tokens/bild-design-system-raw-data.json

# Build locally
npm run build

# Verify outputs
ls dist/css/brands/bild/
grep "text-color-primary" dist/css/brands/bild/semantic/color/colormode-light.css
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflows

#### 1. Build Tokens (`.github/workflows/build-tokens.yml`)
- **Trigger**: Push/PR to main, develop, claude/**, figma-tokens
- **Outputs**: Build artifacts (30-day retention)
- **PR Comment**: Download link + build stats

#### 2. Auto PR from Figma (`.github/workflows/auto-pr-from-figma.yml`)
- **Trigger**: Push to `figma-tokens` branch
- **Creates**: Pull Request to main
- **Includes**: Build artifacts + stats

#### 3. Publish on Merge (`.github/workflows/publish-on-merge.yml`)
- **Trigger**: Merge to main
- **Actions**: Fresh build, version bump, npm publish, GitHub Release

### Why dist/ is NOT in Git

- ✅ No merge conflicts (969 generated files)
- ✅ Clean Git history (only source files)
- ✅ PR review via CI artifacts (30 days)
- ✅ Deterministic builds (Style Dictionary)
- ✅ Smaller repo size (~15MB saved per commit)

Modern design systems (Shopify Polaris, GitHub Primer, Adobe Spectrum) follow this pattern.

---

## 🆘 Troubleshooting

### Missing dist/ Folder

**Q: Where is the dist/ folder?**

**A:** The `dist/` folder is **intentionally not tracked in Git**. Generate it:

```bash
# Option 1: Generate locally
npm run build

# Option 2: Download from CI
# Go to Actions → Workflow Run → Download Artifacts

# Option 3: Install from npm (includes dist/)
npm install @marioschmidt/design-system-tokens
```

### Build Failures

```bash
# Clean and rebuild
npm run clean
npm install
npm run build

# Check for errors
npm run build 2>&1 | grep "❌"

# Expected: 969/969 builds successful
```

### Token Value Issues

```bash
# Check preprocessing worked
cat tokens/brands/bild/semantic/color/colormode-light.json | grep "textColorPrimary"

# Check final output
grep "text-color-primary" dist/css/brands/bild/semantic/color/colormode-light.css
```

### iOS px String Issue (Fixed)

**Old Problem:** iOS was getting `"8px"` strings instead of `8` CGFloat.

**Solution:** Now using `custom/size/ios-points` transform. Verify:

```bash
grep "Space2x" dist/ios/shared/Spaceprimitive.swift
# Expected: public static let Space2x = 16 (not "16px")
```

### iOS UIColor String Issue (Fixed)

**Old Problem:** iOS was getting `"UIColor(red: ...)"` strings instead of objects.

**Solution:** Format now detects UIColor syntax. Verify:

```bash
grep "TextColorPrimary" dist/ios/brands/bild/semantic/color/ColormodeLight.swift
# Expected: public static let TextColorPrimary = UIColor(red: ..., alpha: ...)
# NOT: "UIColor(red: ..., alpha: ...)"
```

### Opacity Not Converting (Fixed)

**Old Problem:** Opacity showed as `5` instead of `0.05`.

**Solution:** `custom/opacity` transform now divides by 100. Verify:

```bash
grep "layer-opacity05" dist/css/brands/bild/semantic/color/colormode-light.css
# Expected: --layer-opacity05: 0.05; (not 5)
```

---

## 📝 Changelog

### v3.0.0 (Current) - Multi-Platform Transforms

**✨ Major Features:**

- **Scope-Based Type Detection**: Figma scopes determine token types semantically
- **iOS Points Transform**: CGFloat numbers instead of "px" strings
- **iOS UIColor Objects**: Proper UIColor instances instead of strings
- **Opacity Conversion**: Figma % (5, 10, 70) → CSS decimal (0.05, 0.1, 0.7)
- **Floating-Point Rounding**: Eliminates precision errors across all platforms
- **Typography px Units**: fontSize, lineHeight, letterSpacing get proper px units

**🔧 Technical Changes:**

- Added `determineTokenType()` with 2-tier logic (scopes → name fallback)
- Added `custom/size/ios-points` transform (CGFloat output)
- Added `custom/opacity` transform (% to decimal conversion)
- Added `custom/fontWeight` and `custom/number` transforms
- Fixed iOS color format to output UIColor objects
- Fixed all format functions to use `token.$value` (transformed) not `token.value`
- Updated typography formats with px units for web platforms

**📊 Platform Support:**

| Token Type | Platforms Tested | Status |
|------------|------------------|--------|
| Colors | 6/6 | ✅ |
| Dimensions | 6/6 | ✅ |
| Opacity | 6/6 | ✅ |
| Font Weight | 6/6 | ✅ |
| Typography | 6/6 | ✅ |
| Effects | 5/6 | ✅ |

**🐛 Bug Fixes:**

- iOS dimensions now output as CGFloat (16) not strings ("16px")
- iOS colors now output as UIColor objects not strings
- Opacity values properly converted from Figma % to 0-1 range
- Typography fontSize/lineHeight/letterSpacing have px units
- Floating-point precision errors eliminated (0.699999988 → 0.7)

**📚 Documentation:**

- Complete README overhaul with transform reference tables
- Added Figma Integration & Dependencies section
- Documented stable vs. unstable changes
- Added platform usage examples for all 7 platforms
- Added troubleshooting for common issues

**🎯 Build Stats:**

- 969/969 builds successful (up from 52/52)
- Components: 917 files
- All platforms: production-ready outputs

---

### v2.1.0 - CI Artifacts Workflow

- dist/ no longer tracked in Git
- GitHub Actions artifacts for PR review
- Automatic PR comments with download links
- 30-day artifact retention

---

### v2.0.0 - Custom Plugin Migration

- Custom Figma Plugin integration
- 7 platform support
- Complete alias resolution
- Composite tokens (Typography, Effects)
- 52/52 builds successful

---

## 🔗 Resources

- [Style Dictionary v4 Documentation](https://styledictionary.com/)
- [Figma Variables API](https://www.figma.com/plugin-docs/api/properties/figma-variables/)
- [Design Tokens Community Group](https://design-tokens.github.io/community-group/)
- [Repository Issues](https://github.com/UXWizard25/vv-token-test-v3/issues)

---

**Built with ❤️ for the BILD Design System**

Version 3.0.0 | Testing Phase | 969 Successful Builds | 7 Platforms | 3 Brands
