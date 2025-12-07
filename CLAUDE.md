# CLAUDE.md - BILD Design System Token Pipeline

> Context document for AI assistants. Describes architecture, decisions, and structures.

---

## Monorepo Structure

This repository uses **npm workspaces** to manage multiple packages:

| Package | npm Name | Location | Build Command |
|---------|----------|----------|---------------|
| Tokens | `@marioschmidt/design-system-tokens` | `packages/tokens/` | `npm run build:tokens` |
| Icons | `@marioschmidt/design-system-icons` | `packages/icons/` | `npm run build:icons` |
| Components | `@marioschmidt/design-system-components` | `packages/components/` | `npm run build:components` |

---

## Quick Reference

```bash
npm run build           # Full build (tokens + components)
npm run build:tokens    # Build tokens (preprocess + style-dictionary + bundles)
npm run build:icons     # Build icons package
npm run build:components # Build Stencil Web Components
npm run build:all       # Everything (tokens + icons + components)
npm run dev:stencil     # Stencil dev server (port 3333)
npm run storybook       # Storybook dev server (port 6006)
npm run build:storybook # Build static Storybook
npm run build:docs      # Generate Storybook foundation docs (Colors, Typography, Spacing, Effects)
npm run clean           # Delete all dist/ and tokens/

# Publishing (via workspace)
npm run publish:tokens     # npm publish -w @marioschmidt/design-system-tokens
npm run publish:icons      # npm publish -w @marioschmidt/design-system-icons
npm run publish:components # npm publish -w @marioschmidt/design-system-components
```

**Source of Truth:** `src/design-tokens/bild-design-system-raw-data.json` (Figma Export via CodeBridge Plugin)

**Platform Documentation:** `packages/tokens/README.md`, `packages/tokens/docs/css.md`, `packages/tokens/docs/js.md`, `packages/tokens/docs/android.md`, `packages/tokens/docs/ios.md`

---

## Design System Architecture Overview

### The 4-Layer Token Hierarchy (Layer 0-3)

The BILD Design System uses a **4-layer token architecture** (numbered 0-3) where each layer references the layer below it. This creates a clear chain of abstraction from raw values to component-specific tokens.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 0: PRIMITIVES (Source Layer - No Modes)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Purpose: Raw, absolute design values - the foundation                      │
│                                                                             │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐    │
│  │ ColorPrimitive│ │ SpacePrimitive│ │ SizePrimitive │ │ FontPrimitive │    │
│  │               │ │               │ │               │ │               │    │
│  │ bild015       │ │ space1x (8px) │ │ size-sm       │ │ gotham-xnarrow│    │
│  │ bildred056    │ │ space2x (16px)│ │ size-md       │ │ gotham-cond   │    │
│  │ alpha-*       │ │ space3x (24px)│ │ size-lg       │ │ font-weight-* │    │
│  └───────┬───────┘ └───────┬───────┘ └───────┬───────┘ └───────┬───────┘    │
│          │                 │                 │                 │            │
│          └─────────────────┴────────┬────────┴─────────────────┘            │
│                                     │                                       │
│  NO MODES - Absolute values         ▼                                       │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  LAYER 1: MAPPING (Brand + Density Layer)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Purpose: Map primitives to brand-specific values                           │
│                                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │  BrandColorMapping  │  │  BrandTokenMapping  │  │      Density        │  │
│  │  ─────────────────  │  │  ─────────────────  │  │  ─────────────────  │  │
│  │  Modes:             │  │  Modes:             │  │  Modes:             │  │
│  │  • BILD             │  │  • BILD             │  │  • default          │  │
│  │  • SportBILD        │  │  • SportBILD        │  │  • dense            │  │
│  │  (NO Advertorial!)  │  │  • Advertorial      │  │  • spacious         │  │
│  │                     │  │                     │  │                     │  │
│  │  Output:            │  │  Output:            │  │  Output:            │  │
│  │  → Brand Colors     │  │  → Spacing          │  │  → Spacing          │  │
│  │                     │  │  → Sizing           │  │  → Sizing           │  │
│  │                     │  │  → Typography       │  │  → Typography       │  │
│  └──────────┬──────────┘  └──────────┬──────────┘  └──────────┬──────────┘  │
│             │                        │                        │             │
│             │                        └────────────┬───────────┘             │
│             ▼                                     ▼                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  LAYER 2: SEMANTIC (Consumption Layer - Multi-Mode)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Purpose: Meaningful design intent tokens (context-independent)             │
│                                                                             │
│  ┌───────────────────────────────┐    ┌───────────────────────────────┐     │
│  │         ColorMode             │    │       BreakpointMode          │     │
│  │  ───────────────────────────  │    │  ───────────────────────────  │     │
│  │  Modes: light | dark          │    │  Modes: xs | sm | md | lg     │     │
│  │                               │    │                               │     │
│  │  Input: BrandColorMapping     │    │  Input: BrandTokenMapping     │     │
│  │                               │    │         + Density             │     │
│  │  Output:                      │    │  Output:                      │     │
│  │  → text-color-primary         │    │  → grid-space-resp-base       │     │
│  │  → accent-color-primary       │    │  → content-gap                │     │
│  │  → surface-color-*            │    │  → font-sizes                 │     │
│  │  → Effects (shadows)          │    │  → Typography                 │     │
│  └───────────────┬───────────────┘    └───────────────┬───────────────┘     │
│                  │                                    │                     │
│                  └──────────────┬─────────────────────┘                     │
│                                 ▼                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  LAYER 3: COMPONENTS (Brand + Theme + Density + Breakpoint)                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Purpose: Component-specific design decisions                               │
│  Examples: Button, Card, Teaser, Alert, InputField, Navigation, etc.        │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │     Button      │  │      Card       │  │   Typography    │  ... (~55)  │
│  │  ─────────────  │  │  ─────────────  │  │  ─────────────  │              │
│  │  --button-      │  │  --card-bg      │  │  --heading-size │              │
│  │    primary-bg   │  │  --card-padding │  │  --body-line-   │              │
│  │  --button-      │  │                 │  │    height       │              │
│  │    label-color  │  │                 │  │                 │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│                                                                             │
│  Collections per component: ColorMode, Density, Breakpoint, Typography      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Figma Collections & Modes

### Collection Overview

| Collection | Layer | Modes | Input From | Output |
|------------|-------|-------|------------|--------|
| **ColorPrimitive** | 0 | – | – | Raw colors (#DD0000, etc.) |
| **SpacePrimitive** | 0 | – | – | Spacing scale (8px, 16px, etc.) |
| **SizePrimitive** | 0 | – | – | Size scale (size-sm, size-md, etc.) |
| **FontPrimitive** | 0 | – | – | Font families, weights |
| **BrandColorMapping** | 1 | BILD, SportBILD | ColorPrimitive | Brand color palette |
| **BrandTokenMapping** | 1 | BILD, SportBILD, Advertorial | Space/Size/FontPrimitive | Spacing, Sizing, Typography |
| **Density** | 1 | default, dense, spacious | Space/SizePrimitive | Spacing, Sizing variants |
| **ColorMode** | 2 | light, dark | BrandColorMapping | Semantic colors, Effects |
| **BreakpointMode** | 2 | xs, sm, md, lg | BrandTokenMapping + Density | Responsive sizing, Typography |
| **{Component}** | 3 | varies | ColorMode, BreakpointMode | Component-specific tokens |

### Token Flow Diagram

```
Token Flow (Layer 0 → Layer 3):
═══════════════════════════════════════════════════════════════════════════════

LAYER 0                    LAYER 1                    LAYER 2              LAYER 3
─────────────────────────────────────────────────────────────────────────────────

ColorPrimitive ──────────→ BrandColorMapping ───────→ ColorMode ─────────┐
                           (BILD | SportBILD)         (light | dark)     │
                                                                         │
                                                      ┌─ text-color-*    │
                                                      ├─ surface-color-* ├──→ Components
                                                      └─ Effects         │     (Button,
                                                                         │      Card,
SpacePrimitive ─┐                                                        │      Teaser,
                │                                                        │      etc.)
SizePrimitive  ─┼────────→ BrandTokenMapping ──┬────→ BreakpointMode ───┘
                │          (BILD | SportBILD   │      (xs|sm|md|lg)
FontPrimitive ──┘           | Advertorial)     │
                                               │      ┌─ grid-space-*
                           Density ────────────┘      ├─ font-sizes
                           (default|dense|spacious)   └─ Typography
```

### Mode Dependencies (CSS Output - Dual-Axis)

| Token Type | Depends On | CSS Output Scope |
|------------|------------|------------------|
| Primitives | – | `:root { }` |
| Semantic Colors | BrandColorMapping + ColorMode | `[data-color-brand][data-theme] { }` |
| Semantic Sizing | BrandTokenMapping + Breakpoint | `[data-content-brand] { } @media (...) { }` |
| Density | Density mode | `[data-content-brand][data-density] { }` |
| Effects | BrandColorMapping + ColorMode | `[data-color-brand][data-theme] .className { }` |
| Typography | BrandTokenMapping + Breakpoint | `[data-content-brand] .className { }` |
| Component Colors | ColorMode | `[data-color-brand][data-theme] { }` |
| Component Sizing | Breakpoint + Density | `[data-content-brand] { }` |

---

## Brands Deep Dive

### Brand Characteristics

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BRAND MATRIX                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                    BILD          SportBILD       Advertorial                │
│  ────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Own Colors?       ✅ Yes         ✅ Yes          ❌ NO                      │
│                    (bildred,      (sport colors)  (uses BILD or             │
│                     bild palette)                  SportBILD colors)        │
│                                                                             │
│  Own Sizing?       ✅ Yes         ✅ Yes          ✅ Yes                     │
│                                                                             │
│  Own Typography?   ✅ Yes         ✅ Yes          ✅ Yes                     │
│                                                                             │
│  Own Effects?      ✅ Yes         ✅ Yes          ❌ NO                      │
│                    (shadows)      (shadows)       (uses BILD or             │
│                                                    SportBILD effects)       │
│                                                                             │
│  Components?       ✅ Full set    ✅ Full set     ⚠️ Partial set            │
│                    (~55)          (~55)           (subset)                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### The Advertorial Problem → Dual-Axis Solution

**Problem:** Advertorial content needs its own sizing/typography but should use BILD or SportBILD colors depending on context.

**Solution:** Separate brand selection into two independent axes:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DUAL-AXIS ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  AXIS 1: ColorBrand (determines colors + effects)                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                     │    │
│  │    ┌─────────────┐          ┌─────────────┐                         │    │
│  │    │    BILD     │          │  SportBILD  │     (only 2 options)    │    │
│  │    │             │          │             │                         │    │
│  │    │  bildred    │          │  sport-red  │                         │    │
│  │    │  bild015    │          │  sport-015  │                         │    │
│  │    │  shadows    │          │  shadows    │                         │    │
│  │    └─────────────┘          └─────────────┘                         │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  AXIS 2: ContentBrand (determines sizing + typography)                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                                                                     │    │
│  │    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐              │    │
│  │    │    BILD     │   │  SportBILD  │   │ Advertorial │  (3 options) │    │
│  │    │             │   │             │   │             │              │    │
│  │    │  spacing    │   │  spacing    │   │  spacing    │              │    │
│  │    │  font-sizes │   │  font-sizes │   │  font-sizes │              │    │
│  │    │  typography │   │  typography │   │  typography │              │    │
│  │    └─────────────┘   └─────────────┘   └─────────────┘              │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  COMBINATION EXAMPLES:                                                      │
│  ──────────────────────────────────────────────────────────────────────    │
│                                                                             │
│  ColorBrand: BILD      + ContentBrand: BILD        = Standard BILD app      │
│  ColorBrand: SportBILD + ContentBrand: SportBILD   = Standard SportBILD app │
│  ColorBrand: BILD      + ContentBrand: Advertorial = Advertorial in BILD    │
│  ColorBrand: SportBILD + ContentBrand: Advertorial = Advertorial in Sport   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Modes In Detail

### Color Modes

| Mode | Purpose | CSS Selector |
|------|---------|--------------|
| `light` | Default light theme | `[data-theme="light"]` |
| `dark` | Dark theme | `[data-theme="dark"]` |

### Breakpoint Modes

| Mode | Min-Width | Device Class | iOS Mapping | Android Mapping |
|------|-----------|--------------|-------------|-----------------|
| `xs` | 320px | Mobile (default) | – | – |
| `sm` | 390px | Large mobile | `compact` | `Compact` |
| `md` | 600px | Tablet | – | `Medium` |
| `lg` | 1024px | Desktop | `regular` | `Expanded` |

```
Web Breakpoints              iOS SizeClass        Android WindowSizeClass
═══════════════              ═════════════        ══════════════════════

    xs (320px) ─────┐
                    ├────→  compact              ┐
    sm (390px) ─────┘                            ├──→  Compact (< 600dp)
                                                 ┘
    md (600px) ─────┐
                    ├────→  regular              ────→  Medium (600-839dp)
    lg (1024px) ────┘
                                                 ────→  Expanded (≥ 840dp)
```

> **Platform Difference:** iOS uses 2 size classes (compact/regular), Android uses Material 3 WindowSizeClass with 3 values (Compact/Medium/Expanded).

### Density Modes

| Mode | Purpose | Use Case |
|------|---------|----------|
| `default` | Standard spacing | Normal UI |
| `dense` | Compact spacing | Data-heavy views, lists |
| `spacious` | Generous spacing | Hero sections, marketing |

---

## Token Reference Chain (Alias Resolution)

Tokens reference each other through aliases. Here's how a button color token resolves:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ALIAS RESOLUTION CHAIN                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  LAYER 3: Component Token                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  button-primary-bg-color                                            │    │
│  │  └──→ references: core-color-primary                                │    │
│  └────────────────────────────────────────────────────────────────┬────┘    │
│                                                                   │         │
│                                                                   ▼         │
│  LAYER 2: Semantic Token (ColorMode)                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  core-color-primary                                                 │    │
│  │  └──→ references: {BrandColorMapping.primary}                       │    │
│  └────────────────────────────────────────────────────────────────┬────┘    │
│                                                                   │         │
│                                                                   ▼         │
│  LAYER 1: Brand Mapping (resolves per brand mode)                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  BrandColorMapping.primary                                          │    │
│  │  ├── Mode BILD:      → bildred                                      │    │
│  │  └── Mode SportBILD: → sportred                                     │    │
│  └────────────────────────────────────────────────────────────────┬────┘    │
│                                                                   │         │
│                                                                   ▼         │
│  LAYER 0: Primitive (final value)                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  bildred = #DD0000                                                  │    │
│  │  sportred = #E30613                                                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  CSS OUTPUT (preserves chain with var() fallbacks):                         │
│  ──────────────────────────────────────────────────────────────────────    │
│                                                                             │
│  :root {                                                                    │
│    --color-bild-red-50: #DD0000;                                            │
│  }                                                                          │
│                                                                             │
│  [data-color-brand="bild"][data-theme="light"] {                            │
│    --core-color-primary: var(--color-bild-red-50, #DD0000);                 │
│    --button-primary-bg-color: var(--core-color-primary, #DD0000);           │
│  }                                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Platform Output Patterns

### Web (CSS) - Dual-Axis Architecture

```html
<!-- Standard BILD -->
<html data-color-brand="bild" data-content-brand="bild" data-theme="light" data-density="default">

<!-- Advertorial in BILD context -->
<html data-color-brand="bild" data-content-brand="advertorial" data-theme="light">

<!-- Advertorial in SportBILD context -->
<html data-color-brand="sportbild" data-content-brand="advertorial" data-theme="dark">
```

| Token Type | CSS Selector Pattern |
|------------|---------------------|
| Primitives | `:root { --token: value; }` |
| Semantic Colors | `[data-color-brand][data-theme] { --token: var(...); }` |
| Breakpoint Sizing | `[data-content-brand] { } @media (...) { }` |
| Density | `[data-content-brand][data-density] { }` |
| Typography | `[data-content-brand] .className { }` |
| Effects | `[data-color-brand][data-theme] .className { }` |
| Component Colors | `[data-color-brand][data-theme] { }` |
| Component Sizing | `[data-content-brand] { }` |

### iOS (SwiftUI)

```swift
// Theme setup
.designSystemTheme(
    colorBrand: .bild,
    contentBrand: .bild,
    darkTheme: false,
    sizeClass: .compact,
    density: .default
)

// Polymorphic access via protocols
@Environment(\.designSystemTheme) var theme
theme.colors.textColorPrimary     // any DesignColorScheme
theme.sizing.gridSpaceRespBase    // any DesignSizingScheme
theme.effects.shadowSoftMd        // any DesignEffectsScheme
```

### Android (Jetpack Compose)

```kotlin
// Theme setup
DesignSystemTheme(
    colorBrand = ColorBrand.Bild,
    contentBrand = ContentBrand.Bild,
    darkTheme = isSystemInDarkTheme(),
    sizeClass = WindowSizeClass.Compact,
    density = Density.Default
) {
    // Polymorphic access via interfaces
    DesignSystemTheme.colors.textColorPrimary   // DesignColorScheme
    DesignSystemTheme.sizing.gridSpaceRespBase  // DesignSizingScheme
    DesignSystemTheme.typography.headline1      // DesignTypographyScheme
    DesignSystemTheme.effects.shadowSoftMd      // DesignEffectsScheme (brand-independent)

    // Component tokens via current()
    ButtonTokens.Colors.current().buttonPrimaryBgColorIdle
    ButtonTokens.Typography.current().buttonLabel
    MenuTokens.Effects.current().menuShadow  // Component-level effects
}
```

### JavaScript/React (ES Modules)

```javascript
// React with ThemeProvider (Dual-Axis)
import { ThemeProvider, useTheme } from '@bild/design-tokens/react';

<ThemeProvider colorBrand="bild" colorMode="light">
  <App />
</ThemeProvider>

// Access via hook
const { theme } = useTheme();
theme.colors.textColorPrimary      // "#232629"
theme.spacing.gridSpaceRespBase    // "12px" (CSS-ready string!)

// Without React
import { createTheme } from '@bild/design-tokens/themes';
const theme = createTheme({ colorBrand: 'bild', colorMode: 'light' });
```

**JS Token Type Mapping (`flattenTokens()` in build.js):**

| Token `$type` | JS Output | Example |
|---------------|-----------|---------|
| `dimension` | String with `px` | `"24px"` |
| `fontSize` | String with `px` | `"48px"` |
| `lineHeight` | String with `px` | `"56px"` |
| `letterSpacing` | String with `px` | `"-0.5px"` |
| `color` | String (hex/rgba) | `"#DD0000"` |
| `fontWeight` | Number | `700` |
| `opacity` | Number (0-100) | `50` |
| `number` | Number | `8` |

> **Note:** Follows W3C DTCG specification. Dimension types output CSS-ready strings, while numeric types (fontWeight, opacity, number) stay as numbers.

---

## Unified Interfaces (Native Platforms)

For polymorphic brand access, all brand-specific implementations conform to unified interfaces:

| Interface/Protocol | Properties | iOS Implementations | Android Implementations |
|--------------------|------------|---------------------|-------------------------|
| `DesignColorScheme` | 80+ color tokens | `BildLightColors`, `BildDarkColors`, etc. | Same |
| `DesignSizingScheme` | 180+ sizing tokens | `BildSizingCompact`, `BildSizingRegular` | `BildSizingCompact`, `BildSizingMedium`, `BildSizingExpanded` |
| `DesignTypographyScheme` | 30+ text styles | `BildTypographyCompact`, `BildTypographyRegular` | `BildTypographyCompact`, `BildTypographyMedium`, `BildTypographyExpanded` |
| `DesignEffectsScheme` | 8 shadow tokens | `EffectsLight`, `EffectsDark` | Same (brand-independent) |

**Note on Size Classes:**
- **iOS:** Uses Apple's 2-class system (compact/regular)
- **Android:** Uses Material 3 WindowSizeClass with 3 values (Compact/Medium/Expanded)

**Note on Effects:** Effects/shadows are **brand-independent** and only depend on light/dark mode. Both iOS and Android share the same `EffectsLight`/`EffectsDark` implementations across all brands.

**Benefit:** Code can work with `any DesignColorScheme` without knowing the specific brand.

---

## Build Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BUILD PIPELINE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FIGMA (Source of Truth)                                                    │
│  └── Variables with scopes, modes, and aliases                              │
│              │                                                              │
│              │ CodeBridge Plugin Export                                     │
│              ▼                                                              │
│  src/design-tokens/bild-design-system-raw-data.json (~1MB)                  │
│              │                                                              │
│              │ preprocess.js                                                │
│              │ • Parse Figma JSON structure                                 │
│              │ • Resolve aliases per brand × mode context                   │
│              │ • Detect component tokens from naming                        │
│              │ • Extract composite tokens (typography, effects)             │
│              ▼                                                              │
│  tokens/ (~920 JSON files in Style Dictionary format)                       │
│  ├── shared/primitives (colorprimitive, spaceprimitive, etc.)               │
│  └── brands/{brand}/ (color, density, semantic, components)                 │
│              │                                                              │
│              │ build.js + style-dictionary.config.js                        │
│              │ • Platform-specific transforms                               │
│              │ • Custom format functions                                    │
│              │ • Native theme provider generation                           │
│              ▼                                                              │
│  packages/tokens/dist/ (Platform outputs)                                   │
│  ├── css/, scss/, js/, json/                                                │
│  ├── ios/ (Swift)                                                           │
│  └── android/compose/ (Kotlin)                                              │
│              │                                                              │
│              │ bundles.js                                                   │
│              ▼                                                              │
│  packages/tokens/dist/css/bundles/ (Convenience CSS bundles per brand)      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `scripts/tokens/preprocess.js` | Figma JSON → Style Dictionary format |
| `scripts/tokens/build.js` | Orchestrates Style Dictionary builds + JS output generation + CSS optimizations |
| `build-config/tokens/style-dictionary.config.js` | Custom transforms & formats |
| `scripts/tokens/bundles.js` | CSS bundle generation |
| `scripts/tokens/generate-docs.js` | Auto-generates Storybook MDX documentation from token JSON files |

### CSS Optimization Functions (in build.js)

| Function | Purpose |
|----------|---------|
| `optimizeComponentColorCSS()` | Token-level split: separates mode-agnostic from light/dark-specific color tokens |
| `optimizeComponentEffectsCSS()` | Consolidates identical light/dark effects into mode-agnostic output |
| `getChangedVariables()` | Cascade optimization: eliminates redundant @media declarations |

### JS Output Functions (in build.js)

| Function | Purpose |
|----------|---------|
| `buildOptimizedJSOutput()` | Main JS build orchestrator |
| `flattenTokens(obj)` | Converts nested tokens to flat camelCase, applies type mapping |
| `generateCreateTheme()` | Generates `createTheme()` factory function |
| `generateReactBindings()` | Generates ThemeProvider, useTheme, useBreakpoint |
| `generateTypeDefinitions()` | Generates TypeScript `.d.ts` files |

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Layer 0-3 numbering** | Matches Figma structure: Primitives (0) → Mapping (1) → Semantic (2) → Components (3) |
| **@media over data-breakpoint** | Native browser support, no JS required, SSR-compatible |
| **var() with fallbacks** | Robustness if variables missing, easier debugging |
| **Separate mode files** | Lazy loading, better caching, easier debugging |
| **Dual-Axis architecture** | Enables Advertorial + brand colors combination (all platforms: CSS, iOS, Android, JS) |
| **Unified interfaces** | Polymorphic access, type-safety, runtime brand switching |
| **Typography as classes** | Groups related properties (font-size, weight, line-height) |
| **Platform-specific breakpoint mapping** | iOS: 4→2 (compact/regular), Android: 4→3 (Compact/Medium/Expanded per Material 3) |
| **JS dimension strings with px** | W3C DTCG spec, industry standard (Chakra UI, MUI), CSS-ready values |
| **JS React ThemeProvider** | Consistent pattern across platforms, Dual-Axis support |
| **CSS token-level split** | Mode-agnostic tokens separate from light/dark-specific for smaller bundle size |
| **CSS cascade optimization** | Only output @media when value changes from previous breakpoint |
| **CSS effects consolidation** | Identical light/dark shadows merged into single mode-agnostic output |
| **CSS Dual-Axis selectors** | `data-color-brand` for colors/effects, `data-content-brand` for typography/sizing |
| **Format-agnostic naming** | Transformers normalize any input format (camelCase, kebab-case, snake_case) to consistent output |

---

## Token Naming Conventions

The build system normalizes token names to platform-specific conventions, regardless of the input format from Figma.

### Naming Rules per Platform

| Platform | Format | Rules | Examples |
|----------|--------|-------|----------|
| **CSS/SCSS** | `kebab-case` | Separation before AND after numbers | `--space-1-x`, `--alpha-red-50-a-80`, `.shadow-soft-sm` |
| **JavaScript** | `camelCase` | Lowercase after numbers, capitalized abbreviations | `space1x`, `alphaRed50a80`, `shadowSoftSm` |
| **iOS/Swift** | `camelCase` | Lowercase after numbers, capitalized abbreviations | `space1x`, `alphaRed50a80`, `shadowSoftSm` |
| **Android/Kotlin** | `camelCase` | Lowercase after numbers, capitalized abbreviations | `space1x`, `alphaRed50a80`, `shadowSoftSm` |

### Format-Agnostic Input

The transformers produce consistent output regardless of Figma input format:

```
Figma Input          →  CSS              →  JS/Swift/Kotlin
─────────────────────────────────────────────────────────────
space1x              →  --space-1-x      →  space1x
space-1-x            →  --space-1-x      →  space1x
space_1_x            →  --space-1-x      →  space1x
Space1X              →  --space-1-x      →  space1x

shadowSoftSM         →  .shadow-soft-sm  →  shadowSoftSm
shadow-soft-sm       →  .shadow-soft-sm  →  shadowSoftSm
shadowSoftSm         →  .shadow-soft-sm  →  shadowSoftSm
```

### Implementation Details

| Transformer | Location | Purpose |
|-------------|----------|---------|
| `nameTransformers.kebab` | `style-dictionary.config.js` | CSS/SCSS names with full number separation |
| `nameTransformers.camel` | `style-dictionary.config.js` | Swift/Kotlin names via Style Dictionary |
| `toCamelCase()` | `build.js` | JavaScript names with consistent casing |

### Key Transformation Rules

1. **CSS kebab-case:**
   - Letter→Number: `red50` → `red-50`
   - Number→Letter: `1x` → `1-x`
   - Consecutive uppercase: `SM` → `s-m`

2. **JS/Native camelCase:**
   - Letters after numbers stay lowercase: `50a` → `50a` (not `50A`)
   - Abbreviations get capitalized: `SM` → `Sm` (not `SM`)
   - First character always lowercase

---

## Change Guide

| Task | Files to Modify |
|------|-----------------|
| Change token values | In Figma (Source of Truth) |
| Modify output format | `style-dictionary.config.js` |
| Change alias resolution | `preprocess.js` |
| Add new brand | `preprocess.js`, `build.js`, `bundles.js` |
| Add new breakpoint | `preprocess.js`, `build.js` |
| Enable/disable platform | `build.js` (toggle flags) |
| Modify component token pattern | `style-dictionary.config.js` |
| Change JS type mapping | `build.js` → `flattenTokens()` function |
| Modify React bindings | `build.js` → `generateReactBindings()` function |
| Change JS output structure | `build.js` → `buildOptimizedJSOutput()` function |
| Modify CSS color optimization | `build.js` → `optimizeComponentColorCSS()` function |
| Modify CSS effects optimization | `build.js` → `optimizeComponentEffectsCSS()` function |
| Change CSS bundle structure | `bundles.js` → `buildBrandTokens()`, `buildBrandBundle()` |
| Modify CSS Dual-Axis selectors | `style-dictionary.config.js` → `getBrandAttribute()`, `build.js` → optimization functions |
| Modify token naming conventions | `style-dictionary.config.js` → `nameTransformers`, `build.js` → `toCamelCase()` |
| Add new Stencil component | `src/components/ds-{name}/ds-{name}.tsx`, `ds-{name}.css` |
| Modify Stencil config | `build-config/stencil/stencil.config.ts` |
| Change Stencil output targets | `build-config/stencil/stencil.config.ts` → `outputTargets` |
| Change global CSS bundle for Stencil | `build-config/stencil/stencil.config.ts` → `globalStyle` |
| Add new story | `src/components/ds-{name}/ds-{name}.stories.ts` |
| Modify Storybook addons | `build-config/storybook/main.ts` → `addons` |
| Change Storybook toolbar controls | `build-config/storybook/preview.ts` → `globalTypes` |
| Modify Storybook UI themes | `build-config/storybook/manager.ts` |
| Change dark mode sync behavior | `build-config/storybook/preview-body.html` |
| Add static files to Storybook | `build-config/storybook/main.ts` → `staticDirs` |
| Add/modify styleguide documentation | `packages/components/docs/*.mdx` (auto-generated) or `scripts/tokens/generate-docs.js` |
| Change styleguide stories pattern | `build-config/storybook/main.ts` → `stories` glob |
| Modify auto-generated docs structure | `scripts/tokens/generate-docs.js` → `generateColorsDocs()`, `generateTypographyDocs()`, etc. |
| Change token source for docs | Token JSON files in `packages/tokens/.tokens/` |

---

## Shadow DOM / Web Components Support

The CSS output is **Shadow DOM compatible** for use with Web Component frameworks like **Stencil**, **Lit**, or native Web Components.

### How It Works

CSS Custom Properties **inherit through the Shadow DOM boundary**. This is the key mechanism that enables theming:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CSS CUSTOM PROPERTY INHERITANCE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Light DOM                          Shadow DOM                              │
│  ──────────────────────────────────────────────────────────────────────    │
│                                                                             │
│  <body data-color-brand="bild"      <my-button>                             │
│        data-content-brand="bild"      #shadow-root                          │
│        data-theme="light">              .button-label {                     │
│    │                                      /* These INHERIT from body! */    │
│    │  CSS Variables set here:             color: var(--button-label-color); │
│    │  --button-label-color: #FFF;         font-size: var(--button-label-   │
│    │  --button-primary-bg: #DD0000;                    font-size);          │
│    │  --font-family-gotham: Gotham;       background: var(--button-primary │
│    │                                                   -bg);                │
│    └──────────────────────────────►     }                                   │
│         Variables inherit           </my-button>                            │
│         through Shadow DOM                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Dual Selector Output

The CSS output includes **dual selectors** for both Light DOM and Shadow DOM contexts:

```css
/* Token Variables - Work in both contexts */
[data-color-brand="bild"][data-theme="light"],
:host([data-color-brand="bild"][data-theme="light"]) {
  --button-primary-brand-bg-color-idle: var(--color-bild-red-50, #DD0000);
  --button-primary-label-color: var(--color-neutral-100, #FFFFFF);
}

/* Typography Classes - Light DOM convenience */
[data-content-brand="bild"] .display-1,
:host([data-content-brand="bild"]) .display-1 {
  font-family: var(--font-family-gotham, Gotham);
  font-size: var(--display-1-font-size, 40px);
}
```

### Usage Pattern for Stencil Components

**Recommended: Use CSS Custom Properties directly**

```tsx
// my-button.tsx (Stencil Component)
@Component({
  tag: 'my-button',
  shadow: true,
  styles: `
    :host {
      display: inline-block;
    }

    .btn {
      /* All token values inherit from Light DOM automatically! */
      background: var(--button-primary-brand-bg-color-idle);
      color: var(--button-primary-label-color);
      padding: var(--button-stack-space) var(--button-inline-space);
      border-radius: var(--button-border-radius);
    }

    .btn:hover {
      background: var(--button-primary-brand-bg-color-hover);
    }

    .label {
      font-family: var(--font-family-gotham);
      font-weight: var(--font-weight-bold);
      font-size: var(--button-label-font-size);
    }
  `
})
export class MyButton {
  render() {
    return (
      <button class="btn">
        <span class="label"><slot></slot></span>
      </button>
    );
  }
}
```

```html
<!-- Usage - Tokens set on body, inherited into all Shadow DOMs -->
<body data-color-brand="bild" data-content-brand="bild" data-theme="light" data-density="default">
  <my-button>BILD Button</my-button>  <!-- Red button -->
</body>

<body data-color-brand="sportbild" data-content-brand="sportbild" data-theme="dark">
  <my-button>Sport Button</my-button>  <!-- Blue button -->
</body>
```

### What Works in Shadow DOM

| Feature | Mechanism | Status |
|---------|-----------|--------|
| **Color Tokens** | CSS Custom Properties inheritance | ✅ Works |
| **Spacing Tokens** | CSS Custom Properties inheritance | ✅ Works |
| **Typography Tokens** | CSS Custom Properties inheritance | ✅ Works |
| **Responsive Breakpoints** | @media queries (global) | ✅ Works |
| **Light/Dark Mode** | CSS Custom Properties inheritance | ✅ Works |
| **Density Modes** | CSS Custom Properties inheritance | ✅ Works |
| **Typography Classes** | `:host([attr])` selector | ⚠️ Requires attribute on component |
| **Effect Classes** | `:host([attr])` selector | ⚠️ Requires attribute on component |

### Important Notes

1. **CSS Custom Properties are the primary mechanism** - They inherit automatically through Shadow DOM
2. **Typography classes (`.display-1`, `.body`, etc.)** are convenience utilities for Light DOM; in Shadow DOM, use the underlying CSS Custom Properties directly
3. **`:host([attr])` selectors** only match when the attribute is on the component itself, not on ancestors
4. **`:host-context([attr])`** would look up ancestors but is **not supported in Firefox**

### Architecture Decision

| Approach | Browser Support | Recommendation |
|----------|-----------------|----------------|
| CSS Custom Properties | ✅ All browsers | **Primary mechanism** |
| `:host([attr])` selectors | ✅ All browsers | For component-level attributes |
| `:host-context([attr])` | ❌ No Firefox | **Not recommended** |

---

## Stencil Web Components Integration

The design system includes a **Stencil-based component library** for building Web Components that consume design tokens.

### Project Structure

```
packages/
  components/             # @marioschmidt/design-system-components
    package.json
    dist/                 # Built Stencil components
      bds/                # Lazy-loaded components
      components/         # Custom Elements (auto-define)
      esm/                # ES Modules
      www/                # Dev server output
      docs/               # Auto-generated component docs

build-config/
  stencil/
    stencil.config.ts     # Stencil configuration
    tsconfig.json         # TypeScript config for Stencil

src/
  components/
    ds-button/            # Button component
      ds-button.tsx
      ds-button.css
    ds-card/              # Card component
      ds-card.tsx
      ds-card.css
    index.html            # Dev/test page with brand switcher
```

### npm Scripts

| Script | Purpose |
|--------|---------|
| `npm run build:components` | Build Stencil components (requires tokens built first) |
| `npm run dev:stencil` | Start dev server with hot reload (port 3333) |
| `npm run build:all` | Build tokens + icons + Stencil in sequence |

### Creating New Components

1. **Create component directory:**
   ```
   src/components/ds-{name}/
     ds-{name}.tsx
     ds-{name}.css
   ```

2. **Component structure:**
   ```tsx
   import { Component, Prop, h } from '@stencil/core';

   @Component({
     tag: 'ds-{name}',
     styleUrl: 'ds-{name}.css',
     shadow: true,
   })
   export class Ds{Name} {
     @Prop() variant: string = 'default';

     render() {
       return (
         <div class={`ds-{name} ds-{name}--${this.variant}`}>
           <slot></slot>
         </div>
       );
     }
   }
   ```

3. **Use design tokens in CSS:**
   ```css
   :host {
     display: block;
   }

   .ds-{name} {
     /* Tokens inherit from Light DOM automatically */
     background: var(--surface-color-primary);
     color: var(--text-color-primary);
     padding: var(--space-2-x);
     border-radius: var(--border-radius-md);
   }
   ```

### Key Configuration (stencil.config.ts)

| Option | Value | Purpose |
|--------|-------|---------|
| `namespace` | `bds` | Component prefix (BILD Design System) |
| `srcDir` | `../../src/components` | Source directory |
| `globalStyle` | `../../packages/tokens/dist/css/bundles/bild.css` | Token CSS bundle |
| `outputTargets` | `dist`, `dist-custom-elements`, `www` | Build outputs |

### Brand Switching in Components

Components automatically adapt to brand/theme/density changes via CSS Custom Property inheritance:

```html
<!-- BILD Brand (default density) -->
<body data-color-brand="bild" data-content-brand="bild" data-theme="light" data-density="default">
  <ds-button variant="primary">BILD Button</ds-button>
</body>

<!-- SportBILD Brand (dense layout) -->
<body data-color-brand="sportbild" data-content-brand="sportbild" data-theme="dark" data-density="dense">
  <ds-button variant="primary">Sport Button</ds-button>
</body>
```

**Demo Page Brand Switcher** (`src/components/index.html`):

| Selector | Options | Data Attribute |
|----------|---------|----------------|
| Color Brand | BILD, SportBILD | `data-color-brand` |
| Theme | Light, Dark | `data-theme` |
| Content Brand | BILD, SportBILD, Advertorial | `data-content-brand` |
| Density | Default, Dense, Spacious | `data-density` |

No JavaScript required – pure CSS Custom Property inheritance through Shadow DOM.

---

## Storybook Integration

Storybook 8.x is configured for developing and documenting Web Components with full design token support.

### Project Structure

```
build-config/
  storybook/
    main.ts                 # Storybook configuration
    preview.ts              # Decorators, globalTypes, parameters
    manager.ts              # Custom BILD UI themes (light/dark)
    preview-head.html       # CSS imports, initial data attributes
    preview-body.html       # Dark mode sync script

packages/components/
  docs/                     # Styleguide documentation (auto-generated)
    intro.mdx               # Introduction & overview (manual)
    colors.mdx              # Color tokens & palettes (auto-generated)
    typography.mdx          # Font families & text styles (auto-generated)
    spacing.mdx             # Spacing scale & density (auto-generated)
    effects.mdx             # Shadows & effects (auto-generated)

src/components/
  ds-button/
    ds-button.stories.ts    # Story file (co-located with component)

scripts/tokens/
  generate-docs.js          # Documentation generator script
```

### Configuration Files

| File | Purpose |
|------|---------|
| `main.ts` | Framework (`@storybook/web-components-vite`), addons, static dirs |
| `preview.ts` | `withDesignTokens` decorator, toolbar controls, dark mode themes |
| `manager.ts` | Custom BILD themes for Storybook UI (sidebar, toolbar) |
| `preview-head.html` | CSS bundle import, initial `data-*` attributes on body |
| `preview-body.html` | Dark mode sync via localStorage polling |

### Key Features

**4-Axis Token Architecture in Toolbar:**

| Control | Options | Data Attribute |
|---------|---------|----------------|
| Color Brand | BILD, SportBILD | `data-color-brand` |
| Content Brand | BILD, SportBILD, Advertorial | `data-content-brand` |
| Theme | Light, Dark (via dark mode toggle) | `data-theme` |
| Density | Default, Dense, Spacious | `data-density` |

**Dark Mode Sync:**

The `storybook-dark-mode` addon controls both UI and content area:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DARK MODE ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Manager (Storybook UI)          Preview (Component Area)                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  storybook-dark-mode addon       preview-body.html script:                  │
│  ├── Stores state in             ├── Reads localStorage on load             │
│  │   localStorage                ├── Polls localStorage every 200ms         │
│  │   (sb-addon-themes-3)         └── Sets body[data-theme]                  │
│  └── Applies UI theme                                                       │
│                                                                             │
│  Toggle Click → localStorage → Polling detects → body[data-theme] updated  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Addons

| Addon | Purpose |
|-------|---------|
| `@storybook/addon-essentials` | Controls, actions, viewport, backgrounds |
| `@storybook/addon-docs` | Auto-generated documentation |
| `storybook-dark-mode` | Dark mode toggle with custom BILD themes |

### Static Directories

| Path | Mapped To | Purpose |
|------|-----------|---------|
| `packages/tokens/dist/css` | `/css` | Design token CSS bundles |
| `packages/components/dist` | `/stencil` | Built Stencil components |

### Writing Stories

```tsx
// src/components/ds-button/ds-button.stories.ts
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

// Ensure component is loaded
import '../ds-button';

const meta: Meta = {
  title: 'Components/Button',
  tags: ['autodocs'],
  render: (args) => html`
    <ds-button variant=${args.variant}>
      ${args.label}
    </ds-button>
  `,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
    },
    label: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: {
    variant: 'primary',
    label: 'Click me',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    label: 'Secondary',
  },
};
```

### Custom BILD Themes (manager.ts)

```typescript
const bildLightTheme = create({
  base: 'light',
  brandTitle: 'BILD Design System',
  colorPrimary: '#DD0000',    // BILD Red
  colorSecondary: '#DD0000',
  appBg: '#F2F4F5',           // --color-neutral-96
  appContentBg: '#FFFFFF',
  // ... more theme values
});

const bildDarkTheme = create({
  base: 'dark',
  brandTitle: 'BILD Design System',
  colorPrimary: '#DD0000',
  appBg: '#1C1C1C',           // --color-neutral-10
  appContentBg: '#232629',    // --color-neutral-15
  // ... more theme values
});
```

### Styleguide Documentation

The `packages/components/docs/` directory contains MDX documentation pages for the design system foundations. **Most pages are auto-generated** from token JSON files.

| Page | File | Generated | Source |
|------|------|-----------|--------|
| **Introduction** | `intro.mdx` | ❌ Manual | – |
| **Colors** | `colors.mdx` | ✅ Auto | `Semantic > Color` tokens |
| **Typography** | `typography.mdx` | ✅ Auto | `Semantic > Typography` tokens |
| **Spacing** | `spacing.mdx` | ✅ Auto | `Semantic > Space` tokens (Inline, Stack, Gap) |
| **Effects** | `effects.mdx` | ✅ Auto | Semantic shadow tokens |

**Auto-Generated Documentation:**

Documentation is generated by `scripts/tokens/generate-docs.js` which reads token JSON files and produces MDX with:

- Live CSS variable previews (color swatches, spacing bars, shadow cards)
- Token tables with CSS custom property names
- Usage descriptions from token comments
- Responsive token visualization
- Automatic updates when tokens change

```bash
# Regenerate documentation from tokens
npm run build:docs
```

**Generator Functions:**

| Function | Token Source Path | Output |
|----------|-------------------|--------|
| `generateColorsDocs()` | `Semantic > Color` | Color palettes, semantic tokens |
| `generateTypographyDocs()` | `Semantic > Typography` | Font families, text styles |
| `generateSpacingDocs()` | `Semantic > Space > {Inline, Stack, Gap}` | Spacing scale (Responsive + Constant) |
| `generateEffectsDocs()` | Semantic shadow tokens | Shadow effects |

**MDX Format Notes:**

- Uses `@storybook/blocks` for `Meta` import
- HTML tables with inline CSS (markdown tables don't render properly in MDX)
- `<style>{``}` blocks for component styling
- Visual elements use CSS custom properties for live theming
- Auto-generated files include `AUTO-GENERATED FILE - DO NOT EDIT MANUALLY` header

---

## Common Issues

| Problem | Likely Cause | Solution |
|---------|--------------|----------|
| Empty CSS files | Figma Collection ID changed | Check COLLECTION_IDS in preprocess.js |
| Missing aliases | Figma mode name changed | Verify mode names in Figma |
| Native build errors | Interface out of sync | Check unified interface generation |
| Wrong colors | ColorBrand/ContentBrand mismatch | Verify Dual-Axis configuration |
| Missing tokens | Scope not assigned in Figma | Add appropriate scope in Figma |
| Tokens not applying in Shadow DOM | Variables not set on ancestor | Ensure `data-*` attributes are on `<body>` or wrapper |
| Typography classes not working in Shadow DOM | Using class instead of variables | Use `var(--token-name)` directly instead of classes |
| Stencil build fails with "Unable to find CSS" | Tokens not built | Run `npm run build:tokens` before `npm run build:components` |
| Stencil components not rendering | Script not loaded | Check `<script src="/build/bds.esm.js">` in HTML |
| Brand switching not working in Stencil | Missing data attributes | Add `data-color-brand`, `data-content-brand`, `data-theme` to `<body>` |
| Storybook shows loading spinner | Build error in preview | Check console for errors, ensure `npm run build:all` completed |
| Storybook dark mode toggle doesn't change content | localStorage key changed | Verify `sb-addon-themes-3` key in preview-body.html |
| Storybook toolbar controls missing | globalTypes not configured | Check `preview.ts` → `globalTypes` configuration |
| Stories not found | Wrong stories glob pattern | Check `main.ts` → `stories` path pattern |
| CSS tokens not loading in Storybook | Static dirs misconfigured | Verify `main.ts` → `staticDirs` and `npm run build` completed |
| Components not rendering in stories | Stencil not built | Run `npm run build:all` before `npm run storybook` |
| MDX parsing error (acorn/FunctionDeclaration) | Wrong MDX format or imports | Use `@storybook/blocks` import, avoid TSX components in MDX |
| "No matching indexer found" for MDX | Wrong file extension | Use `.mdx` for docs-only pages, `.stories.ts` for component stories |
| Markdown tables showing as raw text | MDX doesn't render markdown tables | Use HTML `<table>` elements with inline CSS instead |
| Styleguide pages not appearing | Stories glob pattern wrong | Check `main.ts` → `stories` includes `src/docs/**/*.mdx` |
