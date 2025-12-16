# CLAUDE.md - BILD Design System Token Pipeline

> Context document for AI assistants. Describes architecture, decisions, and structures.

---

## Monorepo Structure

This repository uses **npm workspaces** to manage multiple packages:

| Package | npm Name | Location | Build Command |
|---------|----------|----------|---------------|
| Tokens | `@marioschmidt/design-system-tokens` | `packages/tokens/` | `npm run build:tokens` |
| Icons (SVG) | `@marioschmidt/design-system-icons` | `packages/icons/svg/` | `npm run build:icons` |
| Icons (React) | `@marioschmidt/design-system-icons-react` | `packages/icons/react/` | `npm run build:icons` |
| Icons (Android) | `de.bild.design:icons` | `packages/icons/android/` | `npm run build:icons` |
| Icons (iOS) | `BildIcons` (SPM) | `packages/icons/ios/` | `npm run build:icons` |
| Components | `@marioschmidt/design-system-components` | `packages/components/` | `npm run build:components` |
| React | `@marioschmidt/design-system-react` | `packages/react/` | `npm run build:react` |
| Vue | `@marioschmidt/design-system-vue` | `packages/vue/` | `npm run build:vue` |

---

## Quick Reference

```bash
npm run build           # Full build (tokens + components)
npm run build:tokens    # Build tokens (preprocess + style-dictionary + bundles)
npm run build:icons     # Build icons package
npm run build:components # Build Stencil Web Components
npm run build:react     # Build React wrapper components
npm run build:vue       # Build Vue 3 wrapper components
npm run build:wrappers  # Build both React and Vue wrappers
npm run build:all       # Everything (tokens + icons + components + wrappers)
npm run dev:stencil     # Stencil dev server (port 3333)
npm run storybook       # Storybook dev server (port 6006)
npm run build:storybook # Build static Storybook
npm run build:docs      # Generate Storybook foundation docs (Colors, Typography, Spacing, Effects)
npm run clean           # Delete all dist/ and tokens/

# Publishing (via workspace)
npm run publish:tokens       # npm publish -w @marioschmidt/design-system-tokens
npm run publish:icons        # npm publish -w @marioschmidt/design-system-icons (SVG)
npm run publish:icons:react  # npm publish -w @marioschmidt/design-system-icons-react
npm run publish:icons:all    # Publish both icon npm packages
npm run publish:components   # npm publish -w @marioschmidt/design-system-components
npm run publish:react        # npm publish -w @marioschmidt/design-system-react
npm run publish:vue          # npm publish -w @marioschmidt/design-system-vue
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

---

## CI/CD & Automated Versioning

### Workflow Overview

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `build-tokens.yml` | Push to main/develop/claude/** | Build tokens, upload artifacts |
| `publish-on-merge.yml` | Push to main | Build, version bump, publish to npm |
| `auto-pr-from-figma.yml` | Push to figma-tokens | Create PR with release notes |

### Impact-Based Semantic Versioning

The `publish-on-merge.yml` workflow automatically determines version bumps based on token change impact:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      IMPACT-BASED VERSIONING FLOW                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Push to main                                                               │
│       │                                                                     │
│       ▼                                                                     │
│  Build current tokens (for comparison)                                      │
│       │                                                                     │
│       ▼                                                                     │
│  Checkout previous release tag → Build baseline                             │
│       │                                                                     │
│       ▼                                                                     │
│  Run compare-builds.js → Generate diff                                      │
│       │                                                                     │
│       ├─── Tokens REMOVED?      → Impact: BREAKING  → Version: MINOR       │
│       ├─── Tokens MODIFIED?     → Impact: MODERATE  → Version: PATCH       │
│       ├─── Tokens ADDED?        → Impact: MINOR     → Version: PATCH       │
│       └─── No changes?          → Impact: NONE      → Version: PATCH       │
│                                                                             │
│       ▼                                                                     │
│  npm version {bump_type} → Final build with correct version                 │
│       │                                                                     │
│       ▼                                                                     │
│  Publish all packages to npm (tokens, icons, components, react, vue)        │
│       │                                                                     │
│       ▼                                                                     │
│  Create GitHub Release with release notes                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Impact Level Determination

The `compare-builds.js` script calculates impact level by analyzing token changes:

| Impact Level | Condition | Version Bump | Examples |
|--------------|-----------|--------------|----------|
| `breaking` | Tokens or files removed | `minor` | Deleted `--button-primary-bg`, removed component |
| `moderate` | Token values modified | `patch` | Changed `#DD0000` to `#EE0000` |
| `minor` | Tokens or files added | `patch` | New `--button-tertiary-*` tokens |
| `none` | No token changes | `patch` | Only workflow/script changes |

**Note:** Breaking changes bump `minor` (not `major`) because we're still in 0.x/1.x development phase. For true semver, `breaking` would bump `major`.

### Race Condition Prevention

The workflow uses a concurrency group to prevent race conditions:

```yaml
concurrency:
  group: publish-main
  cancel-in-progress: false
```

This ensures:
- Only one publish workflow runs at a time
- Subsequent pushes wait for the current publish to complete
- No version conflicts from parallel npm publishes

### Synchronized Package Versioning

All packages are versioned together (monorepo sync):

| Package | npm Name | Version Sync |
|---------|----------|--------------|
| Tokens | `@marioschmidt/design-system-tokens` | ✅ |
| Icons | `@marioschmidt/design-system-icons` | ✅ |
| Components | `@marioschmidt/design-system-components` | ✅ |
| React | `@marioschmidt/design-system-react` | ✅ |
| Vue | `@marioschmidt/design-system-vue` | ✅ |

The root `package.json` version is bumped, and all workspace packages inherit via `npm version` in workspace mode.

### Key CI/CD Files

| File | Purpose |
|------|---------|
| `.github/workflows/publish-on-merge.yml` | Main publish workflow with impact-based versioning |
| `.github/workflows/build-tokens.yml` | Token build and artifact upload |
| `scripts/tokens/compare-builds.js` | Diff analysis and impact level calculation |
| `scripts/tokens/release-notes.js` | Release notes generation from diff |
| `scripts/tokens/scan-component-refs.js` | Stencil component token reference scanner |

### Release Notes Format

The `release-notes.js` script generates human-readable PR comments and release notes with structured sections:

#### Report Structure

| Section | Content | Display |
|---------|---------|---------|
| **🔴 Breaking Changes** | Removed tokens (Layer 2-3) | Grouped by layer, platform tables for renames |
| **🟡 Visual Changes** | Modified tokens | Matrix display with Delta E / % change |
| **🟢 Safe Changes** | Added tokens + internal changes | Collapsible lists |
| **🧩 Affected Stencil Components** | Components using changed tokens | Table + collapsible details |
| **⚙️ Technical Details** | File lists, build stats | Collapsible details |

#### Matrix Display for Multi-Context Tokens

Tokens that vary by brand/mode/breakpoint are displayed in a matrix format:

**Color Matrix (Brand × Mode):**
```markdown
**`--text-color-primary`**

| | Bild | Sportbild |
|---|---|---|
| ☀️ light | 🟡 `#232629` → `#1a1c1e` | 🟡 `#232629` → `#1a1c1e` |
| 🌙 dark | 🟡 `#f2f4f5` → `#ffffff` | – |

> 📊 bild/light: ΔE 4.9 (subtil) · bild/dark: ΔE 4 (subtil)
```

**Breakpoint Matrix (Brand × Breakpoint):**
```markdown
**`--grid-space-resp-base`**

| | Bild | Sportbild |
|---|---|---|
| 📱 xs | 🟠 `12px` → `16px` | 🟠 `12px` → `16px` |
| 📱 sm | 🟡 `16px` → `20px` | – |
| 💻 md | 🟡 `20px` → `24px` | 🟡 `20px` → `24px` |
| 🖥️ lg | 🟠 `24px` → `32px` | – |

> 📊 bild/xs: +33% · bild/sm: +25% · bild/md: +20% · bild/lg: +33%
```

#### Visual Diff Indicators

**Color Changes (Delta E):**

| Icon | ΔE Range | Perception |
|------|----------|------------|
| ⚪ | < 1 | nicht sichtbar |
| 🟢 | 1-2 | kaum sichtbar |
| 🟡 | 2-5 | subtil |
| 🟠 | 5-10 | deutlich |
| 🔴 | > 10 | stark |

**Dimension Changes (%):**

| Icon | Change | Severity |
|------|--------|----------|
| ⚪ | 0% | keine Änderung |
| 🟢 | ≤10% | minimal |
| 🟡 | ≤25% | moderat |
| 🟠 | ≤50% | signifikant |
| 🔴 | >50% | stark |

#### Breakpoint Icons

| Icon | Breakpoint | Device |
|------|------------|--------|
| 📱 | xs, sm | Mobile |
| 💻 | md | Tablet |
| 🖥️ | lg | Desktop |

#### Affected Stencil Components Section

The PR comment includes an **Affected Stencil Components** section that shows which components from the Stencil library are impacted by token changes.

**How it works:**

1. **Scan Phase**: `scan-component-refs.js` scans all `packages/components/src/ds-*/ds-*.css` files
2. **Extract**: Extracts all `var(--token-name)` CSS custom property references
3. **Match**: Compares changed tokens (breaking + visual) against component references
4. **Report**: Shows which components use tokens that changed

**Example Output:**

```markdown
## 🧩 Affected Stencil Components

| Component | Impact | Changed Tokens |
|-----------|--------|----------------|
| **ds-button** | 🔴 2 breaking | `--button-primary-bg`, `--button-border-color` |
| **ds-card** | 🟡 3 visual | `--shadow-soft-md`, `--surface-color-primary`, +1 more |

<details>
<summary>📋 Full token list per component</summary>

### ds-button
- 🔴 `--button-primary-bg` — **removed**
- 🔴 `--button-border-color` — **renamed** to `--button-outline-border-color`

### ds-card
- 🟡 `--shadow-soft-md` — `0 2px 8px...` → `0 4px 12px...`
- 🟡 `--surface-color-primary` — `#FFFFFF` → `#FAFAFA`
</details>
```

**When no components affected:**

```markdown
## 🧩 Affected Stencil Components

> ✅ None of the 2 scanned Stencil components reference the changed tokens
```

---

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
| Modify React wrappers | `packages/react/lib/`, `build-config/stencil/stencil.config.ts` → `reactOutputTarget` |
| Modify Vue wrappers | `packages/vue/lib/`, `build-config/stencil/stencil.config.ts` → `vueOutputTarget` |
| Fix Vue import paths | `scripts/fix-vue-imports.js` |
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
| Modify CI/CD publish workflow | `.github/workflows/publish-on-merge.yml` |
| Change version bump logic | `.github/workflows/publish-on-merge.yml` → "Determine Version Bump Type" step |
| Modify token diff analysis | `scripts/tokens/compare-builds.js` → `calculateImpactLevel()` |
| Change release notes format | `scripts/tokens/release-notes.js` |
| Modify color matrix display | `scripts/tokens/release-notes.js` → `generateColorMatrix()` |
| Modify breakpoint matrix display | `scripts/tokens/release-notes.js` → `generateBreakpointMatrix()` |
| Change visual diff indicators | `scripts/tokens/release-notes.js` → `calculateDeltaE()`, `calculateDimensionDiff()` |
| Modify affected components detection | `scripts/tokens/scan-component-refs.js` → `findAffectedComponents()` |
| Change component scan directory | `scripts/tokens/scan-component-refs.js` → `DEFAULT_COMPONENTS_DIR` |

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

  react/                  # @marioschmidt/design-system-react
    package.json
    lib/                  # Auto-generated React wrappers
      components/         # React component wrappers (DsButton, DsCard, etc.)
      react-component-lib/  # Stencil React runtime utilities
      index.ts            # Package entry point

  vue/                    # @marioschmidt/design-system-vue
    package.json
    lib/                  # Auto-generated Vue 3 wrappers
      components/         # Vue component wrappers (DsButton, DsCard, etc.)
      vue-component-lib/  # Stencil Vue runtime utilities
      index.ts            # Package entry point

build-config/
  stencil/
    stencil.config.ts     # Stencil configuration (includes React/Vue output targets)
    tsconfig.json         # TypeScript config for Stencil

scripts/
  fix-vue-imports.js      # Fixes JSX import path in Vue wrappers

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
| `npm run build:react` | Build React wrapper components |
| `npm run build:vue` | Build Vue 3 wrapper components |
| `npm run build:wrappers` | Build both React and Vue wrappers |
| `npm run dev:stencil` | Start dev server with hot reload (port 3333) |
| `npm run build:all` | Build tokens + icons + Stencil + wrappers in sequence |

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

## React & Vue Wrappers

The design system provides **auto-generated wrapper packages** for React and Vue 3, built using Stencil's output targets.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FRAMEWORK WRAPPER ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Stencil Build Process                                                      │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  src/components/           stencil.config.ts                                │
│  ├── ds-button/     ──────►  outputTargets:                                 │
│  │   ├── ds-button.tsx       ├── dist (Web Components)                      │
│  │   └── ds-button.css       ├── dist-custom-elements                       │
│  ├── ds-card/                ├── reactOutputTarget → packages/react/lib/    │
│  │   └── ...                 └── vueOutputTarget → packages/vue/lib/        │
│  └── ...                                                                    │
│                                                                             │
│  React Wrappers (packages/react/)                                           │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  lib/                                                                       │
│  ├── components/              # Auto-generated React components             │
│  │   ├── DsButton.ts          # Wraps <ds-button> Web Component             │
│  │   └── DsCard.ts            # Wraps <ds-card> Web Component               │
│  ├── react-component-lib/     # Stencil React runtime utilities             │
│  │   ├── createComponent.ts   # Creates React wrapper components            │
│  │   └── utils/               # Event handling, ref forwarding              │
│  └── index.ts                 # Package exports                             │
│                                                                             │
│  Vue 3 Wrappers (packages/vue/)                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  lib/                                                                       │
│  ├── components/              # Auto-generated Vue components               │
│  │   ├── DsButton.ts          # Wraps <ds-button> Web Component             │
│  │   └── DsCard.ts            # Wraps <ds-card> Web Component               │
│  ├── vue-component-lib/       # Stencil Vue runtime utilities               │
│  │   ├── utils.ts             # Vue component creation utilities            │
│  │   └── ...                                                                │
│  └── index.ts                 # Package exports                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### How Wrappers Work

| Feature | Implementation |
|---------|----------------|
| **Component Registration** | Uses `defineCustomElement()` to lazy-load Web Components |
| **Props** | Mapped from Stencil `@Prop()` decorators to framework props |
| **Events** | Converted to framework event patterns (`onClick` / `@click`) |
| **Refs** | Forwarded to underlying Web Component element |
| **TypeScript** | Full type definitions from Stencil's generated types |
| **Tree Shaking** | Individual component imports for optimal bundle size |

### Usage Examples

**React:**
```tsx
import { DsButton, DsCard } from '@marioschmidt/design-system-react';
import '@marioschmidt/design-system-tokens/css/bundles/bild.css';

function App() {
  return (
    <div data-color-brand="bild" data-theme="light">
      <DsButton variant="primary" onClick={() => console.log('clicked')}>
        Click me
      </DsButton>
      <DsCard cardTitle="Hello">Card content</DsCard>
    </div>
  );
}
```

**Vue 3:**
```vue
<script setup>
import { DsButton, DsCard } from '@marioschmidt/design-system-vue';
</script>

<template>
  <div data-color-brand="bild" data-theme="light">
    <DsButton variant="primary" @click="handleClick">
      Click me
    </DsButton>
    <DsCard card-title="Hello">Card content</DsCard>
  </div>
</template>

<style>
@import '@marioschmidt/design-system-tokens/css/bundles/bild.css';
</style>
```

### Key Configuration (stencil.config.ts)

```typescript
import { reactOutputTarget } from '@stencil/react-output-target';
import { vueOutputTarget } from '@stencil/vue-output-target';

export const config: Config = {
  outputTargets: [
    // ... other targets
    reactOutputTarget({
      outDir: '../react/lib/components',
    }),
    vueOutputTarget({
      componentCorePackage: '@marioschmidt/design-system-components',
      proxiesFile: '../vue/lib/components/index.ts',
    }),
  ],
};
```

### Vue Import Fix

The Vue output target generates incorrect JSX import paths. The `scripts/fix-vue-imports.js` script automatically corrects these after build:

```javascript
// Before (incorrect):
import { JSX } from '@marioschmidt/design-system-components/dist/types/components';

// After (correct):
import { JSX } from '@marioschmidt/design-system-components';
```

### Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| React components not rendering | Web Component not registered | Import ensures `defineCustomElement()` is called |
| Vue template errors | camelCase props in template | Use kebab-case: `card-title` not `cardTitle` |
| Types not found | Build not complete | Run `npm run build:components` before `npm run build:wrappers` |
| Vue JSX import error | Incorrect import path | Run `npm run build:vue` (includes fix script) |

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
| `preview-body.html` | Documentation comments only |

### Key Features

**4-Axis Token Architecture in Toolbar:**

| Control | Options | Data Attribute | Mechanism |
|---------|---------|----------------|-----------|
| Theme | Light, Dark | `data-theme` | `storybook-dark-mode` addon (sun/moon toggle) |
| Color Brand | BILD, SportBILD | `data-color-brand` | Toolbar globalType + decorator |
| Content Brand | BILD, SportBILD, Advertorial | `data-content-brand` | Toolbar globalType + decorator |
| Density | Default, Dense, Spacious | `data-density` | Toolbar globalType + decorator |

**Theme & Controls Sync Architecture:**

The architecture ensures all controls work on both Stories AND Docs pages:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      STORYBOOK THEMING ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Manager (Storybook UI)              Preview (Component/Docs Area)          │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  storybook-dark-mode addon           preview.ts:                            │
│  ├── Sun/Moon toggle in toolbar      ├── DARK_MODE_EVENT_NAME listener      │
│  ├── bildLightTheme / bildDarkTheme  │   → sets data-theme attribute        │
│  └── Syncs UI sidebar/toolbar        ├── updateGlobals listener             │
│                                      │   → sets brand/density attributes    │
│  Toolbar globalTypes:                └── withDesignTokens decorator         │
│  ├── colorBrand dropdown                 → sets attributes for stories      │
│  ├── contentBrand dropdown                                                  │
│  └── density dropdown                                                       │
│                                                                             │
│  Channel Events:                                                            │
│  ├── DARK_MODE_EVENT_NAME  → Updates data-theme                             │
│  └── updateGlobals         → Updates data-color-brand, data-content-brand,  │
│                               data-density (for docs pages)                 │
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
| React wrapper import error | Package not built | Run `npm run build:react` after `npm run build:components` |
| Vue wrapper import error | Package not built | Run `npm run build:vue` after `npm run build:components` |
| Vue JSX type error | Incorrect import path in generated code | Run `npm run build:vue` (includes fix-vue-imports.js) |
| React/Vue components not styled | Missing token CSS | Import `@marioschmidt/design-system-tokens/css/bundles/bild.css` |
| Vue props not working | Using camelCase in template | Use kebab-case in templates: `card-title` not `cardTitle` |
| Type definitions missing | Stencil build incomplete | Ensure `npm run build:components` completed successfully |
