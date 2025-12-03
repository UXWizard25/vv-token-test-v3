# 🎨 BILD Design System - Token Pipeline

> **Part of the [BILD Design Ops Pipeline](./README.md)** | [Icon Documentation](./README.icons.md)

Multi-platform design token transformation pipeline powered by **Style Dictionary v4** with **Figma-scoped semantic type detection**.

[![npm version](https://img.shields.io/npm/v/@marioschmidt/design-system-tokens.svg)](https://www.npmjs.com/package/@marioschmidt/design-system-tokens)
[![Build Status](https://github.com/UXWizard25/vv-token-test-v3/workflows/Build%20Design%20Tokens/badge.svg)](https://github.com/UXWizard25/vv-token-test-v3/actions)

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [🏗️ Pipeline Flow](#️-pipeline-flow)
- [📦 Installation](#-installation)
- [🚀 Quick Start](#-quick-start)
- [🎨 Platform Usage](#-platform-usage)
- [📊 Token Transform Reference](#-token-transform-reference)
- [📁 Output Structure](#-output-structure)
- [🔗 Figma Integration & Dependencies](#-figma-integration--dependencies)
- [🔄 CI/CD Workflows](#-cicd-workflows)
- [🆘 Troubleshooting](#-troubleshooting)
- [🔗 Related](#-related)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Overview

This pipeline processes the multi-layer, multi-brand BILD Design System architecture:

- **3 Brands**: BILD, SportBILD, Advertorial
- **6 Platforms**: CSS, SCSS, JavaScript, JSON, iOS (Swift), Android (Jetpack Compose) *(Flutter/XML disabled)*
- **Multiple Modes**: Density (3), Breakpoints (4), Color Modes (2)
- **Token Types**: Primitives, Semantic Tokens, Component Tokens (~970 files)

### Token Architecture (4 Layers)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 4: Component Tokens                                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Button, Card, Teaser, Alert, InputField, etc.                              │
│  Modes: color (light/dark), density, breakpoint, typography                 │
│  References → Semantic Tokens                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  LAYER 3: Semantic Tokens                                                    │
│  ─────────────────────────────────────────────────────────────────────────  │
│  text-color-primary, surface-color-secondary, border-color-*, etc.          │
│  Modes: color (light/dark), breakpoint                                      │
│  References → Brand Mapping                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  LAYER 2: Brand Mapping + Density                                            │
│  ─────────────────────────────────────────────────────────────────────────  │
│  BrandColorMapping: Color Primitives → Brands                               │
│  BrandTokenMapping: Other Primitives → Brands                               │
│  Density: default, dense, spacious                                          │
│  Modes: BILD, SportBILD, Advertorial                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  LAYER 1: Primitives (Global)                                                │
│  ─────────────────────────────────────────────────────────────────────────  │
│  colorprimitive, spaceprimitive, sizeprimitive, fontprimitive               │
│  Absolute values: --bildred: #DD0000, --space2x: 16px                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### CSS var() Alias Chain

Tokens use `var()` references to maintain the alias chain from Figma:

```css
/* Component → Semantic → Primitive */
--button-primary-bg-color: var(--core-color-primary, #DD0000);
                                ↓
--core-color-primary: var(--bildred, #DD0000);
                           ↓
--bildred: #DD0000;
```

This enables:
- **Theme switching** without recompiling (change primitives = change all)
- **Brand switching** via data attributes
- **Fallback values** for robustness

### Pipeline Flow

```
┌─────────────────────────────────────────────────┐
│ Figma Variables (Design Source)                 │
│ • BILD Design System file                       │
│ • Variables with Scopes & Aliases               │
│ • TokenSync plugin export                       │
└───────────────────────┬─────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│ Raw Export (src/design-tokens/)                 │
│ • bild-design-system-raw-data.json              │
└───────────────────────┬─────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│ Preprocessing (scripts/tokens/preprocess.js)    │
│ • Scope-based type determination                │
│ • Alias resolution                              │
│ • Component token detection                     │
└───────────────────────┬─────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│ Intermediate (tokens/)                          │
│ • Style Dictionary format                       │
│ • ~920 JSON files (tracked in Git)              │
└───────────────────────┬─────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│ Style Dictionary Build                          │
│ • Platform-specific transforms                  │
│ • iOS: CGFloat Points (not px strings)          │
│ • iOS: UIColor objects                          │
└───────────────────────┬─────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│ Build Output (dist/)                            │
│ • 969 successful builds                         │
│ • NOT tracked in Git (CI artifacts)             │
└─────────────────────────────────────────────────┘
```

## Installation

```bash
npm install @marioschmidt/design-system-tokens
```

## Quick Start

```bash
# Full build
npm run build

# Or run steps separately
npm run preprocess     # Figma JSON → Style Dictionary format
npm run build:tokens   # Style Dictionary → 7 platforms
npm run build:bundles  # Generate CSS bundle files
```

## Token Type Mapping

Figma token types (`$type`) are automatically mapped to platform-specific types:

| Figma `$type` | CSS | Swift (iOS) | Kotlin (Android) |
|---------------|-----|-------------|------------------|
| `dimension` | `var(--token)` (px) | `CGFloat` | `Dp` (.dp) |
| `fontSize` | `var(--token)` (px) | `CGFloat` | `TextUnit` (.sp) |
| `lineHeight` | `var(--token)` (px) | `CGFloat` | `TextUnit` (.sp) |
| `letterSpacing` | `var(--token)` (px) | `CGFloat` | `TextUnit` (.sp) |
| `fontWeight` | `var(--token)` | `FontWeight` | `FontWeight` |
| `number` | `var(--token)` | `CGFloat` | `Float` |
| `fontFamily` | `var(--token)` | `String` | `String` |
| `string` | `var(--token)` | `String` | `String` |
| `boolean` | `var(--token)` | `Bool` | `Boolean` |
| `opacity` | `var(--token)` (0-1) | `CGFloat` | `Float` |
| `color` | `var(--token)` (hex/rgba) | `Color` | `Color` |
| `shadow` | `box-shadow` | `ShadowStyle` | `ShadowStyle` |
| `typography` | CSS classes | `TextStyle` | `DesignTextStyle` |

### Token Type Distribution

| $type | Count | Description |
|-------|-------|-------------|
| `dimension` | 3557 | Spacing, sizing, layout values |
| `typography` | 1356 | Composite font definitions |
| `fontSize` | 1086 | Font size values |
| `color` | 1012 | Color values (hex, rgba) |
| `lineHeight` | 840 | Line height values |
| `fontWeight` | 318 | Font weight values (100-1000) |
| `fontFamily` | 307 | Font family names |
| `letterSpacing` | 155 | Letter spacing values |
| `string` | 133 | String values (e.g., breakpoint names) |
| `boolean` | 102 | Boolean flags |
| `shadow` | 78 | Drop shadow definitions |
| `opacity` | 72 | Opacity percentages (0-100) |
| `number` | 24 | Generic numeric values |

## Platform Usage

### CSS

```css
@import '@marioschmidt/design-system-tokens/css/brands/bild/semantic/color/colormode-light.css';

.button {
  background-color: var(--text-color-accent-constant);
  padding: var(--space2x);
  opacity: var(--layer-opacity50);
}
```

### JavaScript / React

> **See [README.js.md](./README.js.md) for complete documentation**

```javascript
// With React ThemeProvider (Dual-Axis Architecture)
import { ThemeProvider, useTheme } from '@marioschmidt/design-system-tokens/react';

function App() {
  return (
    <ThemeProvider colorBrand="bild" colorMode="light">
      <MyComponent />
    </ThemeProvider>
  );
}

function MyComponent() {
  const { theme } = useTheme();
  return (
    <div style={{
      color: theme.colors.textColorPrimary,      // "#232629"
      padding: theme.spacing.gridSpaceRespBase   // "12px" - CSS-ready!
    }}>
      Content
    </div>
  );
}

// Without React - Direct theme creation
import { createTheme } from '@marioschmidt/design-system-tokens/themes';

const theme = createTheme({
  colorBrand: 'bild',
  colorMode: 'light',
  breakpoint: 'md'
});
console.log(theme.colors.textColorPrimary);   // "#232629"
console.log(theme.spacing.gridSpaceRespBase); // "12px"
```

#### JS Token Type Mapping

Token values are automatically formatted based on their `$type` from Figma:

| Token `$type` | JS Output | Example |
|---------------|-----------|---------|
| `dimension`, `fontSize`, `lineHeight`, `letterSpacing` | String with `px` | `"24px"` |
| `color` | String (hex/rgba) | `"#DD0000"` |
| `fontWeight`, `opacity`, `number` | Number | `700`, `50` |
| `fontFamily`, `string` | String | `"Gotham Condensed"` |

This follows the W3C DTCG spec and industry best practices (Chakra UI, MUI).

### iOS Swift

```swift
import UIKit

// Colors (UIColor objects)
view.backgroundColor = StyleDictionary.textColorPrimary

// Dimensions (CGFloat Points)
let padding: CGFloat = StyleDictionary.space2x  // 16

// Typography
label.font = UIFont.TypographyBildregular.display1
```

### Flutter (Currently Disabled)

> **Note:** Flutter output is currently disabled via `FLUTTER_ENABLED = false` in build.js.
> The code remains in place and can be re-enabled when needed.

```dart
// When enabled:
import 'package:design_tokens/brands/bild/semantic/color/colormode_light.dart';

Container(
  color: Colors.textColorPrimary,  // Color(0xFF232629)
)
```

### Android Jetpack Compose (Dual-Axis Architecture)

> **See [README.android.md](./README.android.md) for complete documentation**

```kotlin
import com.bild.designsystem.shared.DesignSystemTheme
import com.bild.designsystem.shared.ColorBrand
import com.bild.designsystem.shared.ContentBrand
import com.bild.designsystem.bild.components.ButtonTokens

@Composable
fun MyScreen() {
    // Dual-Axis Theme Provider
    DesignSystemTheme(
        colorBrand = ColorBrand.Bild,        // Color palette (Bild or Sportbild)
        contentBrand = ContentBrand.Bild,    // Sizing/Typography (Bild, Sportbild, Advertorial)
        darkTheme = isSystemInDarkTheme(),
        sizeClass = WindowSizeClass.Compact,
        density = Density.Default
    ) {
        // Polymorphic access via unified interfaces
        Text(color = DesignSystemTheme.colors.textColorPrimary)
        val fontSize = DesignSystemTheme.sizing.headline1FontSize

        // Component tokens via current() accessors
        val bgColor = ButtonTokens.Colors.current().buttonPrimaryBgColorIdle
    }
}

// Advertorial with SportBILD colors (key use case)
DesignSystemTheme(
    colorBrand = ColorBrand.Sportbild,
    contentBrand = ContentBrand.Advertorial
) { AdvertorialContent() }
```

#### Dual-Axis Architecture

Separates color selection from content selection:

| Axis | Enum | Values | Purpose |
|------|------|--------|---------|
| **Color** | `ColorBrand` | `Bild`, `Sportbild` | Color palette & effects |
| **Content** | `ContentBrand` | `Bild`, `Sportbild`, `Advertorial` | Sizing, typography, layout |

#### Unified Interfaces (Polymorphic Access)

Both iOS and Android implement identical unified protocols/interfaces for polymorphic theme access:

| Interface | Purpose | Property Count | iOS Type | Android Type |
|-----------|---------|----------------|----------|--------------|
| `DesignColorScheme` | All color tokens | 80+ colors | `Color` | `Color` |
| `DesignSizingScheme` | All sizing tokens | 180+ values | `CGFloat` | `Dp` |
| `DesignTypographyScheme` | All text styles | 37 styles | `TextStyle` | `DesignTextStyle` |
| `DesignEffectsScheme` | Shadow tokens (brand-independent) | 8 shadows | `ShadowStyle` | `ShadowStyle` |

> **Note:** Full iOS/Android architecture parity. Both platforms provide `theme.colors`, `theme.sizing`, `theme.typography`, and `theme.effects` accessors with polymorphic brand switching at runtime.

#### Component Token Accessors

All Component Tokens provide theme-aware `current()` accessors:

| Accessor | Selects based on | iOS Values | Android Values |
|----------|-----------------|------------|----------------|
| `Colors.current()` | `isDarkTheme` | Light / Dark | Light / Dark |
| `Sizing.current()` | `sizeClass` | Compact / Regular | Compact / Medium / Expanded |
| `Typography.current()` | `sizeClass` | Compact / Regular | Compact / Medium / Expanded |
| `Density.current()` | `density` | Dense / Default / Spacious | Dense / Default / Spacious |
| `Effects.current()` | `isDarkTheme` | Light / Dark | Light / Dark |

> **Note:** Android uses Material 3 WindowSizeClass with 3 values (Compact/Medium/Expanded), while iOS uses Apple's 2-value system (compact/regular).

### iOS SwiftUI (Dual-Axis Architecture)

> **See [README.ios.md](./README.ios.md) for complete documentation**

```swift
import SwiftUI

struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .designSystemTheme(
                    colorBrand: .bild,        // Color palette
                    contentBrand: .bild,      // Sizing/Typography
                    darkTheme: false,
                    sizeClass: .compact
                )
        }
    }
}

struct MyView: View {
    @Environment(\.designSystemTheme) var theme

    var body: some View {
        // Polymorphic access via unified protocols
        Text("Hello")
            .foregroundColor(theme.colors.textColorPrimary)
            .textStyle(theme.typography.headline1)  // Typography

        // Sizing tokens
        let padding = theme.sizing.gridSpaceRespBase

        // Component tokens
        Button("Click") { }
            .background(ButtonTokens.Colors.light.buttonPrimaryBrandBgColorIdle)
    }
}

// Advertorial with SportBILD colors
.designSystemTheme(
    colorBrand: .sportbild,
    contentBrand: .advertorial
)
```

#### iOS Unified Protocols

| Protocol | Purpose |
|----------|---------|
| `DesignColorScheme` | All color tokens |
| `DesignSizingScheme` | All sizing tokens |
| `DesignTypographyScheme` | All text styles (TextStyle composites) |
| `DesignEffectsScheme` | Shadow tokens (ShadowStyle composites, brand-independent) |

### Android XML (Disabled)

> **Note:** Android XML output is disabled by default. Jetpack Compose is the preferred format.
> Set `ANDROID_XML_ENABLED = true` in build.js to re-enable.

```xml
<TextView
    android:textColor="@color/text_color_primary"
    android:padding="@dimen/space_2x"
    style="@style/TextAppearance.Bild.Display1" />
```

### SCSS

```scss
@import '@marioschmidt/design-system-tokens/scss/brands/bild/semantic/color/colormode-light';

.button {
  background-color: $text-color-accent-constant;
  padding: $space2x;
}
```

## Responsive CSS Architecture

### Breakpoint Implementation

Breakpoints use native `@media` queries instead of `data-breakpoint` attributes:

```css
/* Base values (xs breakpoint) */
[data-brand="bild"] {
  --headline1-font-size: 32px;
}

/* Responsive overrides */
@media (min-width: 390px) {  /* sm */
  [data-brand="bild"] { --headline1-font-size: 40px; }
}
@media (min-width: 600px) {  /* md */
  [data-brand="bild"] { --headline1-font-size: 48px; }
}
@media (min-width: 1024px) { /* lg */
  [data-brand="bild"] { --headline1-font-size: 64px; }
}
```

**Breakpoint Values:**
| Breakpoint | Min-Width | Use Case |
|------------|-----------|----------|
| `xs` | 320px | Mobile (default) |
| `sm` | 390px | Large mobile |
| `md` | 600px | Tablet |
| `lg` | 1024px | Desktop |

### Native Sizeclass Mapping (iOS/Android)

Native platforms use different size class systems:

#### iOS (2 Size Classes - Apple HIG)

```
Web Breakpoints         iOS Size Classes
─────────────────       ────────────────
xs (320px) ─────┐
                ├────→  compact (Phones)
sm (390px) ─────┘

md (600px) ─────┐
                ├────→  regular (Tablets)
lg (1024px) ────┘
```

| Size Class | iOS Trait | Web Breakpoint |
|------------|-----------|----------------|
| `compact` | `.compact` | sm (390px) |
| `regular` | `.regular` | lg (1024px) |

#### Android (3 Size Classes - Material 3 WindowSizeClass)

```
Web Breakpoints         Android WindowSizeClass
─────────────────       ───────────────────────
xs (320px) ─────┐
                ├────→  Compact (< 600dp)
sm (390px) ─────┘

md (600px) ──────────→  Medium (600-839dp)

lg (1024px) ─────────→  Expanded (≥ 840dp)
```

| Size Class | Material 3 Range | Web Breakpoint |
|------------|------------------|----------------|
| `Compact` | width < 600dp | sm (390px) |
| `Medium` | 600dp ≤ width < 840dp | md (600px) |
| `Expanded` | width ≥ 840dp | lg (1024px) |

---

## Token Transform Reference

### Naming Conventions

| Platform | Convention | Example |
|----------|-----------|---------|
| CSS | `kebab-case` with `--` | `--text-color-primary` |
| SCSS | `kebab-case` with `$` | `$text-color-primary` |
| JavaScript | `camelCase` | `textColorPrimary` |
| iOS Swift | `camelCase` | `textColorPrimary` |
| Android Compose | `camelCase` | `textColorPrimary` |
| Android XML | `snake_case` | `text_color_primary` |
| Flutter | `camelCase` | `textColorPrimary` |

### Name Transformations

The pipeline applies these transformations to token names:

| Input | CSS/SCSS | JS/Swift/Compose | Notes |
|-------|----------|------------------|-------|
| `TextColorPrimary` | `text-color-primary` | `textColorPrimary` | CamelCase → kebab/camel |
| `bildred` | `bildred` | `bildred` | Lowercase preserved |
| `bild085` | `bild085` | `bild085` | Numbers allowed |
| `alpha-black-20` | `alpha-black-20` | `alphaBlack20` | Numbers at end OK |
| `space2x` | `space2x` | `space2x` | Dimension pattern |
| `700-black` | `700-black` | `n700Black` | Number prefix → `n` prefix |

**Important:** Tokens with numeric prefixes (e.g., `700-black-font-weight`) get an `n` prefix in camelCase platforms to ensure valid identifiers.

### Token Types

#### Colors

| Platform | Format | Example |
|----------|--------|---------|
| CSS | `#HEX` / `rgba()` | `#DD0000` |
| iOS Swift | `UIColor()` object | `UIColor(red: 0.867, ...)` |
| Android Compose | `Color(0xFF...)` | `Color(0xFFDD0000)` |
| Android XML | `#hex` resource | `#dd0000` |
| Flutter | `Color(0xFF...)` | `Color(0xFFDD0000)` |

#### Dimensions

| Platform | Format | Example |
|----------|--------|---------|
| CSS | `Xpx` | `16px` |
| iOS Swift | `CGFloat` number | `16` |
| Android Compose | `X.dp` | `16.dp` |
| Android XML | `Xpx` dimen | `16px` |
| Flutter | `"Xpx"` string | `"16px"` |

#### Typography (Compose)

Typography tokens in Compose use `.sp` for accessibility scaling:

| Property | Format | Example |
|----------|--------|---------|
| `fontSize` | `X.sp` | `16.sp` |
| `lineHeight` | `X.sp` | `24.sp` |
| `letterSpacing` | `Xf.sp` | `0.5f.sp` |
| `fontWeight` | `Int` | `700` |
| `fontStyle` | `FontStyle` | `FontStyle.Italic` |
| `fontFamily` | `String` | `"Gotham XNarrow"` |

#### Opacity

| Platform | Format | Example |
|----------|--------|---------|
| CSS | `0-1` number | `0.5` |
| iOS Swift | `CGFloat` | `0.5` |
| Android Compose | `Float` | `0.5f` |
| Flutter | `double` | `0.5` |

**Note:** Figma exports opacity as percentage (5, 10, 70). Transform converts to decimal: `5` → `0.05`. iOS/Swift uses per-token type detection to correctly map opacity tokens to `CGFloat` in component protocols.

## Output Toggles

The build pipeline supports toggles to enable/disable specific outputs:

```javascript
// In scripts/tokens/build.js

// Platform output toggles
const FLUTTER_ENABLED = false;        // Disables dist/flutter/ output
const COMPOSE_ENABLED = true;         // Enables dist/android/compose/ output
const ANDROID_XML_ENABLED = false;    // Disables Android XML output

// Token type toggles
const BOOLEAN_TOKENS_ENABLED = false; // Excludes visibility tokens
```

| Toggle | Default | Description |
|--------|---------|-------------|
| `COMPOSE_ENABLED` | `true` | Jetpack Compose Kotlin output in `dist/android/compose/` |
| `ANDROID_XML_ENABLED` | `false` | Android XML resources (disabled, Compose preferred) |
| `FLUTTER_ENABLED` | `false` | Flutter Dart output in `dist/flutter/` |
| `BOOLEAN_TOKENS_ENABLED` | `false` | Boolean/visibility tokens (13 tokens like `hideOnMobile`) |

---

## 📁 Output Structure

```
dist/
├── css/
│   ├── shared/                      # Primitives
│   ├── bundles/                     # Convenience bundles (Quick Start)
│   └── brands/
│       └── bild/
│           ├── density/
│           ├── components/          # ~300 component files
│           └── semantic/
│               ├── breakpoints/
│               ├── color/
│               ├── typography/
│               └── effects/
├── scss/                            # Same structure
├── js/                              # Optimized ESM output
│   ├── index.js                     # Main entry point
│   ├── types.d.ts                   # TypeScript definitions
│   ├── primitives/                  # Shared primitives
│   ├── brands/{brand}/              # Brand tokens (colors, spacing, typography)
│   ├── themes/                      # Pre-built themes + createTheme()
│   └── react/                       # ThemeProvider, useTheme, useBreakpoint
├── json/                            # Same structure
├── ios/                             # Swift Classes
├── android/
│   └── compose/                     # Jetpack Compose (Kotlin)
│       ├── shared/
│       │   ├── DesignTokenPrimitives.kt   # All primitives consolidated
│       │   ├── Density.kt                 # Dense/Default/Spacious enum
│       │   ├── WindowSizeClass.kt         # Material 3: Compact/Medium/Expanded enum
│       │   ├── Brand.kt                   # Bild/Sportbild/Advertorial enum
│       │   └── DesignSystemTheme.kt       # Multi-brand theme provider
│       └── brands/{brand}/
│           ├── components/{Component}/
│           │   └── {Component}Tokens.kt   # Aggregated with current() accessors
│           ├── semantic/
│           │   ├── {Brand}SemanticTokens.kt   # Aggregated Light/Dark + Compact/Medium/Expanded
│           │   ├── color/
│           │   │   ├── ColorsLight.kt     # BildColorScheme interface + BildLightColors
│           │   │   └── ColorsDark.kt      # BildDarkColors object
│           │   └── sizeclass/
│           │       ├── SizingCompact.kt   # BildSizingScheme interface + BildSizingCompact
│           │       ├── SizingMedium.kt    # BildSizingMedium object (Material 3)
│           │       └── SizingExpanded.kt  # BildSizingExpanded object
│           └── theme/
│               └── {Brand}Theme.kt        # CompositionLocal Theme Provider
└── flutter/                         # Dart Classes (disabled by default)
```

### Compose File Organization

Compose output is optimized for Android development:

**Shared Files (brand-independent):**

| File | Content | Access Pattern |
|------|---------|----------------|
| `shared/DesignTokenPrimitives.kt` | All primitives (Colors, Space, Size, Font) | `DesignTokenPrimitives.Colors.bildred` |
| `shared/Density.kt` | UI density enum | `Density.Dense`, `Density.Default`, `Density.Spacious` |
| `shared/WindowSizeClass.kt` | Material 3 responsive layout enum | `WindowSizeClass.Compact`, `WindowSizeClass.Medium`, `WindowSizeClass.Expanded` |
| `shared/ColorBrand.kt`, `ContentBrand.kt` | Dual-axis brand enums | `ColorBrand.Bild`, `ContentBrand.Advertorial` |
| `shared/DesignColorScheme.kt` | Unified color interface | `DesignSystemTheme.colors.textColorPrimary` |
| `shared/DesignSizingScheme.kt` | Unified sizing interface | `DesignSystemTheme.sizing.gridSpaceRespBase` |
| `shared/DesignTypographyScheme.kt` | Unified typography interface | `DesignSystemTheme.typography.headline1` |
| `shared/DesignTextStyle.kt` | Typography composite type | `.toComposeTextStyle()` |
| `shared/DesignEffectsScheme.kt` | Unified effects interface | `DesignSystemTheme.effects.shadowSoftMd` |
| `shared/DropShadow.kt`, `ShadowStyle.kt` | Shadow composite types | `.toModifier()` |
| `shared/EffectsLight.kt`, `EffectsDark.kt` | Light/Dark shadows | Brand-independent, only theme-dependent |
| `shared/DesignSystemTheme.kt` | Multi-brand theme provider | `DesignSystemTheme(colorBrand, contentBrand) { }` |

**Brand Files:**

| File | Content | Access Pattern |
|------|---------|----------------|
| `{Brand}Theme.kt` | CompositionLocal Theme Provider | `BildTheme { }`, `BildTheme.colors.x`, `BildTheme.sizing.x` |
| `{Brand}SemanticTokens.kt` | Colors + Sizing aggregated | `BildSemanticTokens.Colors.Light.textColorPrimary` |
| `ColorsLight.kt` / `ColorsDark.kt` | ColorScheme interface + impl | Used by BildTheme internally |
| `SizingCompact.kt` / `SizingRegular.kt` | SizingScheme interface + impl | Used by BildTheme internally |
| `{Component}Tokens.kt` | Component tokens with `current()` | `ButtonTokens.Colors.current().buttonPrimaryBgColorIdle` |

## 🔗 Figma Integration & Dependencies

### Supported Figma Scopes

| Scope | Assigned Type | Output Format |
|-------|---------------|---------------|
| `FONT_SIZE` | `fontSize` | px (CSS), `.sp` (Compose) |
| `LINE_HEIGHT` | `lineHeight` | px (CSS), `.sp` (Compose) |
| `LETTER_SPACING` | `letterSpacing` | px (CSS), `.sp` (Compose) |
| `FONT_WEIGHT` | `fontWeight` | Unitless integer (100-900) |
| `FONT_FAMILY` | `fontFamily` | String |
| `FONT_STYLE` | `fontStyle` | String, `FontStyle.Italic` (Compose) |
| `OPACITY` | `opacity` | 0-1 decimal (÷100) |
| `WIDTH_HEIGHT` | `dimension` | px (CSS), `.dp` (Compose) |
| `GAP` | `dimension` | px (CSS), `.dp` (Compose) |
| `CORNER_RADIUS` | `dimension` | px (CSS), `.dp` (Compose) |
| `STROKE_FLOAT` | `dimension` | px (CSS), `.dp` (Compose) |
| `PARAGRAPH_SPACING` | `dimension` | px (CSS), `.dp` (Compose) |
| `PARAGRAPH_INDENT` | `dimension` | px (CSS), `.dp` (Compose) |
| `ALL_FILLS`, `FRAME_FILL`, `SHAPE_FILL`, `TEXT_FILL` | `color` | #HEX, `Color(0xFF...)` |
| `STROKE_COLOR`, `EFFECT_COLOR` | `color` | #HEX, `Color(0xFF...)` |

### Compose Unit Mapping

Android Compose uses type-safe units. The pipeline automatically maps token types:

| Token Type | Compose Unit | Example Output |
|------------|--------------|----------------|
| `fontSize` | `.sp` | `16.sp` |
| `lineHeight` | `.sp` | `24.sp` |
| `letterSpacing` | `.sp` | `0.5f.sp` |
| `dimension` | `.dp` | `16.dp` |
| `fontWeight` | `Int` | `700` |
| `fontStyle` | `FontStyle` | `FontStyle.Italic` |
| `fontFamily` | `String` | `"Gotham XNarrow"` |
| `color` | `Color` | `Color(0xFFDD0000)` |
| `opacity` | `Int` | `50` (percentage) |

**Note:** `.sp` (scale-independent pixels) is used for text-related measurements to support accessibility scaling. `.dp` (density-independent pixels) is used for layout dimensions.

### Stable Changes

| Change Type | Impact | Auto-Recovery |
|-------------|--------|---------------|
| New token | Added | Yes |
| Edit value | Updated | Yes |
| Add scope | Better typing | Yes |
| New component | Folder created | Yes |

### Unstable Changes

| Change Type | Impact | Fix Required |
|-------------|--------|--------------|
| Delete collection | Build fails | Code update |
| Rename collection | Tokens skipped | Code update |
| Circular alias | Token unresolved | Fix in Figma |

## 🔄 CI/CD Workflows

### build-tokens.yml
- **Trigger**: Push to main, develop, claude/**
- **Outputs**: Build artifacts (30-day retention)

### auto-pr-from-figma.yml
- **Trigger**: Push to `figma-tokens` branch
- **Creates**: Pull Request to main with release notes

### publish-on-merge.yml
- **Trigger**: Merge to main
- **Actions**: Version bump, npm publish, GitHub Release

## 🆘 Troubleshooting

### Missing dist/ Folder

```bash
# Generate locally
npm run build

# Or download from CI artifacts
```

### Build Failures

```bash
npm run clean
npm install
npm run build
```

### iOS px String Issue

**Fixed:** iOS now uses `custom/size/ios-points` transform. Verify:
```bash
grep "Space2x" dist/ios/shared/Spaceprimitive.swift
# Expected: public static let Space2x = 16 (not "16px")
```

## 🔗 Related

| Document | Description |
|----------|-------------|
| [📖 README.md](./README.md) | Main project overview |
| [📖 README.js.md](./README.js.md) | JavaScript/React integration (Dual-Axis) |
| [📖 README.android.md](./README.android.md) | Android Jetpack Compose (Dual-Axis) |
| [📖 README.ios.md](./README.ios.md) | iOS SwiftUI (Dual-Axis) |
| [📖 README.icons.md](./README.icons.md) | Icon pipeline documentation |
| [Style Dictionary](https://styledictionary.com/) | Build tool documentation |

---

## 🤝 Contributing

> **⚠️ IMPORTANT: Figma is the Single Source of Truth**
>
> Design Tokens must **NOT** be edited directly in the repository.
> All token changes must be made in Figma and exported via the **TokenSync Plugin**.

**Workflow:**
1. Edit/create tokens in Figma
2. Export with TokenSync Plugin
3. Review and merge PR

**NOT Allowed:**
- ❌ Direct changes to `src/design-tokens/*.json`
- ❌ Manual commits to `figma-tokens` branch
- ❌ Changes to generated files in `dist/`

**Allowed (Pipeline Development):**
- ✅ Changes to build scripts (`scripts/`)
- ✅ Changes to configuration (`build-config/`)
- ✅ Workflow adjustments (`.github/workflows/`)
- ✅ Documentation

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) file.

---

**Built with ❤️ for the BILD Design System**

| Feature | Status |
|---------|--------|
| 6 Platforms | ✅ (Flutter/XML disabled) |
| 3 Brands | ✅ |
| ~970 Files | ✅ |
| Figma Scopes | ✅ |
| var() Aliases | ✅ |
| Responsive CSS | ✅ |
| Jetpack Compose | ✅ |
| Theme Provider | ✅ |
