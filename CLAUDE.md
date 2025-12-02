# CLAUDE.md - BILD Design System Token Pipeline

> Context document for AI assistants. Describes architecture, decisions, and structures.

---

## Quick Reference

```bash
npm run build:tokens    # Full build (preprocess + style-dictionary)
npm run build:bundles   # Regenerate CSS bundles only
npm run build           # Everything (tokens + bundles)
npm run clean           # Delete dist/ and tokens/
```

**Source of Truth:** `src/design-tokens/bild-design-system-raw-data.json` (Figma Export via TokenSync Plugin)

**Platform Documentation:** `README.tokens.md`, `README.android.md`, `README.ios.md`

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

### Mode Dependencies (CSS Output)

| Token Type | Depends On | CSS Output Scope |
|------------|------------|------------------|
| Primitives | – | `:root { }` |
| Semantic Colors | BrandColorMapping + ColorMode | `[data-brand][data-theme] { }` |
| Semantic Sizing | BrandTokenMapping + Breakpoint | `[data-brand] { } @media (...) { }` |
| Density | Density mode | `[data-brand][data-density] { }` |
| Effects | BrandColorMapping + ColorMode | `[data-brand][data-theme] .className { }` |
| Typography | BrandTokenMapping + Breakpoint | `[data-brand] .className { }` |
| Component Tokens | All above | Inherits from semantic layer |

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

| Mode | Min-Width | Device Class | Native Mapping |
|------|-----------|--------------|----------------|
| `xs` | 320px | Mobile (default) | `compact` |
| `sm` | 390px | Large mobile | `compact` |
| `md` | 600px | Tablet | `regular` |
| `lg` | 1024px | Desktop | `regular` |

```
Web Breakpoints              Native SizeClass
═══════════════              ════════════════

    xs (320px) ─────┐
                    ├──────────────→  compact
    sm (390px) ─────┘

    md (600px) ─────┐
                    ├──────────────→  regular
    lg (1024px) ────┘
```

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
│    --bildred: #DD0000;                                                      │
│  }                                                                          │
│                                                                             │
│  [data-brand="bild"][data-theme="light"] {                                  │
│    --core-color-primary: var(--bildred, #DD0000);                           │
│    --button-primary-bg-color: var(--core-color-primary, #DD0000);           │
│  }                                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Platform Output Patterns

### Web (CSS)

```html
<html data-brand="bild" data-theme="light" data-density="default">
```

| Token Type | CSS Selector Pattern |
|------------|---------------------|
| Primitives | `:root { --token: value; }` |
| Semantic Colors | `[data-brand][data-theme] { --token: var(...); }` |
| Breakpoint Sizing | `[data-brand] { } @media (...) { }` |
| Density | `[data-brand][data-density] { }` |
| Typography | `[data-brand] .className { }` |
| Effects | `[data-brand][data-theme] .className { }` |

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

---

## Unified Interfaces (Native Platforms)

For polymorphic brand access, all brand-specific implementations conform to unified interfaces:

| Interface/Protocol | Properties | Implementations |
|--------------------|------------|-----------------|
| `DesignColorScheme` | 80+ color tokens | `BildLightColors`, `BildDarkColors`, `SportbildLightColors`, `SportbildDarkColors` |
| `DesignSizingScheme` | 180+ sizing tokens | `BildSizingCompact`, `BildSizingRegular`, `SportbildSizing*`, `AdvertorialSizing*` |
| `DesignTypographyScheme` | 30+ text styles | `BildTypographyCompact`, `BildTypographyRegular`, `SportbildTypography*`, `AdvertorialTypography*` |
| `DesignEffectsScheme` | 8 shadow tokens | `EffectsLight`, `EffectsDark` (brand-independent, shared across brands) |

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
│              │ TokenSync Plugin Export                                      │
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
│  dist/ (Platform outputs)                                                   │
│  ├── css/, scss/, js/, json/                                                │
│  ├── ios/ (Swift)                                                           │
│  └── android/compose/ (Kotlin)                                              │
│              │                                                              │
│              │ bundles.js                                                   │
│              ▼                                                              │
│  dist/css/bundles/ (Convenience CSS bundles per brand)                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `scripts/tokens/preprocess.js` | Figma JSON → Style Dictionary format |
| `scripts/tokens/build.js` | Orchestrates Style Dictionary builds |
| `build-config/tokens/style-dictionary.config.js` | Custom transforms & formats |
| `scripts/tokens/bundles.js` | CSS bundle generation |

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Layer 0-3 numbering** | Matches Figma structure: Primitives (0) → Mapping (1) → Semantic (2) → Components (3) |
| **@media over data-breakpoint** | Native browser support, no JS required, SSR-compatible |
| **var() with fallbacks** | Robustness if variables missing, easier debugging |
| **Separate mode files** | Lazy loading, better caching, easier debugging |
| **Dual-Axis architecture** | Enables Advertorial + brand colors combination |
| **Unified interfaces** | Polymorphic access, type-safety, runtime brand switching |
| **Typography as classes** | Groups related properties (font-size, weight, line-height) |
| **4→2 breakpoint mapping** | Web (xs/sm/md/lg) → Native (compact/regular) |

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

---

## Common Issues

| Problem | Likely Cause | Solution |
|---------|--------------|----------|
| Empty CSS files | Figma Collection ID changed | Check COLLECTION_IDS in preprocess.js |
| Missing aliases | Figma mode name changed | Verify mode names in Figma |
| Native build errors | Interface out of sync | Check unified interface generation |
| Wrong colors | ColorBrand/ContentBrand mismatch | Verify Dual-Axis configuration |
| Missing tokens | Scope not assigned in Figma | Add appropriate scope in Figma |
