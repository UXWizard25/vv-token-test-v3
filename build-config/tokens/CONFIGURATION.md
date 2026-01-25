# Pipeline Configuration Guide

> Documentation of Figma dependencies and configuration options for the token pipeline system.

---

## Overview

The token pipeline uses a **hybrid configuration strategy**:

| Source | What is extracted |
|--------|-------------------|
| **Figma (automatic)** | Brands, Modes, Mode IDs, Token values |
| **pipeline.config.js (manual)** | Collection IDs, Breakpoint pixels, Platform settings |

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CONFIGURATION ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Figma Source (bild-design-system-raw-data.json)                            │
│  ════════════════════════════════════════════════                           │
│  ✅ Auto-discovered at build time:                                          │
│     • Brand names (BILD, SportBILD, Advertorial)                            │
│     • Color modes (Light, Dark)                                             │
│     • Density modes (default, dense, spacious)                              │
│     • Breakpoint modes (XS, SM, MD, LG)                                     │
│     • Mode IDs (18038:0, 588:0, etc.)                                       │
│     • Default brand (from defaultModeId)                                    │
│     • ColorBrands vs ContentBrands (from collection membership)             │
│                                                                             │
│  pipeline.config.js                                                         │
│  ════════════════════════════════════════════════                           │
│  ⚙️  Manual configuration required:                                         │
│     • Collection IDs (stable Figma references)                              │
│     • Breakpoint minWidth values (320px, 390px, etc.)                       │
│     • Platform settings (CSS unit, native mappings)                         │
│     • Output paths and package names                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Figma Dependencies (Architecture Requirements)

### 1. Collection Structure (CRITICAL)

The pipeline expects these Figma Variable Collections:

| Collection | Purpose | Layer |
|------------|---------|-------|
| `_ColorPrimitive` | Base color values | 0 |
| `_SpacePrimitive` | Spacing scale | 0 |
| `_SizePrimitive` | Size scale | 0 |
| `_FontPrimitive` | Font families, weights | 0 |
| `BrandTokenMapping` | Brand → Sizing/Typography | 1 |
| `BrandColorMapping` | Brand → Colors | 1 |
| `Density` | Density modes | 1 |
| `ColorMode` | Light/Dark theme | 2 |
| `BreakpointMode` | Responsive breakpoints | 2 |

**Important:** Collection names can be anything, but the **Collection IDs** must be correctly configured in `pipeline.config.js`.

### 2. Mode Naming Conventions

The pipeline extracts **keys** from Figma mode names:

```
Figma Mode Name    →    Extracted Key
─────────────────────────────────────────
"BILD"             →    "bild"
"SportBILD"        →    "sportbild"
"Light"            →    "light"
"Dark"             →    "dark"
"XS - 320px"       →    "xs"
"SM - 390px"       →    "sm"
"default"          →    "default"
"dense"            →    "dense"
```

**Rule:** The first word segment (before space/hyphen) is used as the key, in lowercase.

### 3. Dual-Axis Brand Detection

The pipeline automatically detects which brands have which properties:

```
BrandColorMapping Collection          BrandTokenMapping Collection
┌─────────────────────────────┐      ┌─────────────────────────────┐
│ Modes:                      │      │ Modes:                      │
│   • BILD                    │      │   • BILD                    │
│   • SportBILD               │      │   • SportBILD               │
│                             │      │   • Advertorial             │
└─────────────────────────────┘      └─────────────────────────────┘
         ↓                                      ↓
   COLOR_BRANDS =                        CONTENT_BRANDS =
   ['bild', 'sportbild']                 ['bild', 'sportbild', 'advertorial']
```

**Result:** Advertorial has its own sizing/typography but no own colors (inherits from BILD or SportBILD).

### 4. Default Brand Detection

The default brand is extracted from `defaultModeId` of the BrandTokenMapping collection:

```json
{
  "id": "VariableCollectionId:18038:10593",
  "name": "BrandTokenMapping",
  "defaultModeId": "18038:0",  // ← This mode becomes the default
  "modes": [
    { "name": "BILD", "modeId": "18038:0" },  // ← Match → DEFAULT_BRAND = "bild"
    { "name": "SportBILD", "modeId": "18094:0" },
    { "name": "Advertorial", "modeId": "18094:1" }
  ]
}
```

---

## Configurable Options (pipeline.config.js)

### 1. Collection IDs (REQUIRED)

```javascript
source: {
  collections: {
    FONT_PRIMITIVE: 'VariableCollectionId:470:1450',
    COLOR_PRIMITIVE: 'VariableCollectionId:539:2238',
    SIZE_PRIMITIVE: 'VariableCollectionId:4072:1817',
    SPACE_PRIMITIVE: 'VariableCollectionId:2726:12077',
    DENSITY: 'VariableCollectionId:5695:5841',
    BRAND_TOKEN_MAPPING: 'VariableCollectionId:18038:10593',
    BRAND_COLOR_MAPPING: 'VariableCollectionId:18212:14495',
    BREAKPOINT_MODE: 'VariableCollectionId:7017:25696',
    COLOR_MODE: 'VariableCollectionId:588:1979',
  },
}
```

**When to change:** When collections are recreated in Figma (IDs change).

**How to find IDs:** In the Figma export JSON under `collections[].id`.

### 2. Breakpoint Min-Width (REQUIRED)

```javascript
modes: {
  breakpoints: {
    xs: { minWidth: 320, deviceName: 'Mobile (default)' },
    sm: { minWidth: 390, deviceName: 'Large Mobile' },
    md: { minWidth: 600, deviceName: 'Tablet' },
    lg: { minWidth: 1024, deviceName: 'Desktop' },
  },
}
```

**Why manual:** Figma doesn't store CSS @media query values.

**Important:** The keys (xs, sm, md, lg) must match the extracted Figma mode keys.

### 3. Platform Settings (OPTIONAL)

#### CSS Settings

```javascript
platforms: {
  css: {
    enabled: true,
    fontSizeUnit: 'px',  // or 'rem'
    remBase: 16,
    dataAttributes: {
      colorBrand: 'data-color-brand',
      contentBrand: 'data-content-brand',
      theme: 'data-theme',
      density: 'data-density',
    },
  },
}
```

#### Native Platform Mappings

```javascript
platforms: {
  ios: {
    enabled: true,
    sizeClasses: {
      compact: 'sm',   // iOS SizeClass → Breakpoint Key
      regular: 'lg',
    },
  },
  android: {
    enabled: true,
    sizeClasses: {
      compact: 'sm',   // WindowSizeClass → Breakpoint Key
      medium: 'md',
      expanded: 'lg',
    },
  },
}
```

### 4. Identity & Packages (OPTIONAL)

```javascript
identity: {
  name: 'BILD Design System',
  shortName: 'bild',
  copyright: 'Axel Springer Deutschland GmbH',
},

packages: {
  tokens: { npm: '@marioschmidt/design-system-tokens' },
  // ...
},
```

---

## What is NOT Configured

These values are **automatically extracted from Figma**:

| Value | Source |
|-------|--------|
| Brand names | BrandTokenMapping/BrandColorMapping modes |
| ColorBrands list | BrandColorMapping modes |
| ContentBrands list | BrandTokenMapping modes |
| Default brand | BrandTokenMapping defaultModeId |
| Color modes (light/dark) | ColorMode collection modes |
| Density modes | Density collection modes |
| Breakpoint keys | BreakpointMode collection modes |
| Mode IDs | All collections modes[].modeId |

---

## Naming Constraints

### No Hyphens in Keys

```
✅ Allowed:     bild, sportbild, myBrand, extraDense
❌ Forbidden:   sport-bild, my-brand, extra-dense
```

**Reason:** Keys are embedded in CSS Custom Properties:
```css
--density-{mode}-stack-space-resp-md
```
With hyphens, it would be impossible to determine where the mode ends and the token begins.

### Breakpoint Key Extraction

The pipeline extracts the first letter-block from Figma mode names:

```
"XS - 320px"        →  xs     (first block before " - ")
"SM - 390px (comp)" →  sm     (first block before " - ")
"Mobile"            →  mobile (entire name, lowercase)
```

---

## Troubleshooting

### Problem: "Collection not found"

```
Cause:   Collection ID in pipeline.config.js doesn't match Figma.
Solution: Open bild-design-system-raw-data.json and copy the current ID.
```

### Problem: "Brand not in collection"

```
Cause:   Brand mode was renamed or removed in Figma.
Solution: No action needed - automatically detected.
         Check build output for "Discovering modes" lines.
```

### Problem: Breakpoint key mismatch

```
Cause:   Figma mode name extracts different key than in config.
Solution: Adjust modes.breakpoints keys to match extracted keys.

Example:
  Figma: "Extra Small - 320px"  →  extracts: "extra"
  Config must be: { extra: { minWidth: 320 } }
```

### Problem: Advertorial has no colors

```
This is correct! Advertorial is only in BrandTokenMapping, not in
BrandColorMapping. It inherits colors from BILD or SportBILD via the
Dual-Axis architecture (data-color-brand + data-content-brand).
```

---

## Change Matrix

| Change in Figma | Action Required |
|-----------------|-----------------|
| New collection created | Add collection ID to config |
| Collection renamed | None (ID stays stable) |
| Collection deleted/recreated | Update collection ID in config |
| New brand mode | None (auto-discovered) |
| Brand mode renamed | None (auto-discovered) |
| New color/density mode | None (auto-discovered) |
| New breakpoint mode | Add minWidth to config |
| Token added/changed | None (auto-processed) |

---

## Build Validation

After `npm run build:tokens` you should see:

```
🔍 Discovering modes from Figma source...
   ✓ Color modes: light, dark
   ✓ Density modes: default, dense, spacious
   ✓ Breakpoints: xs, sm, md, lg
   ✓ Content brands: bild, sportbild, advertorial (default: bild)
   ✓ Color brands: bild, sportbild
```

This output confirms that auto-discovery is working correctly.
