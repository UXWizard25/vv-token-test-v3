# BILD Design System - Token Pipeline

> **Part of the [BILD Design Ops Pipeline](./README.md)**

Multi-platform design token transformation pipeline powered by **Style Dictionary v4** with **Figma-scoped semantic type detection**.

[![npm version](https://img.shields.io/npm/v/@marioschmidt/design-system-tokens.svg)](https://www.npmjs.com/package/@marioschmidt/design-system-tokens)

## Overview

This pipeline processes the multi-layer, multi-brand BILD Design System architecture:

- **3 Brands**: BILD, SportBILD, Advertorial
- **7 Platforms**: CSS, SCSS, JavaScript, JSON, iOS (Swift), Android (XML), Flutter (Dart)
- **Multiple Modes**: Density (3), Breakpoints (4), Color Modes (2)
- **Token Types**: Primitives, Semantic Tokens, Component Tokens (~970 files)

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
│ Preprocessing (scripts/preprocess-*.js)         │
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

```javascript
import {
  textColorPrimary,
  space2x
} from '@marioschmidt/design-system-tokens/js/brands/bild/semantic/color/colormode-light';

const Button = styled.button`
  background-color: ${textColorPrimary};
  padding: ${space2x};
`;
```

### iOS Swift

```swift
import UIKit

// Colors (UIColor objects)
view.backgroundColor = StyleDictionary.TextColorPrimary

// Dimensions (CGFloat Points)
let padding: CGFloat = StyleDictionary.Space2x  // 16

// Typography
label.font = UIFont.TypographyBildregular.display1
```

### Flutter

```dart
import 'package:design_tokens/brands/bild/semantic/color/colormode_light.dart';

Container(
  color: Colors.textColorPrimary,  // Color(0xFF232629)
)
```

### Android XML

```xml
<TextView
    android:textColor="@color/text-color-primary"
    android:padding="@dimen/space2x"
    style="@style/Display1" />
```

### SCSS

```scss
@import '@marioschmidt/design-system-tokens/scss/brands/bild/semantic/color/colormode-light';

.button {
  background-color: $text-color-accent-constant;
  padding: $space2x;
}
```

## Token Transform Reference

### Naming Conventions

| Platform | Convention | Example |
|----------|-----------|---------|
| CSS | `kebab-case` with `--` | `--text-color-primary` |
| SCSS | `kebab-case` with `$` | `$text-color-primary` |
| JavaScript | `camelCase` | `textColorPrimary` |
| iOS Swift | `PascalCase` | `TextColorPrimary` |
| Android | `kebab-case` | `text-color-primary` |
| Flutter | `camelCase` | `textColorPrimary` |

### Token Types

#### Colors

| Platform | Format | Example |
|----------|--------|---------|
| CSS | `#HEX` / `rgba()` | `#DD0000` |
| iOS Swift | `UIColor()` object | `UIColor(red: 0.867, ...)` |
| Flutter | `Color(0xFF...)` | `Color(0xFFDD0000)` |
| Android | `#hex` resource | `#dd0000` |

#### Dimensions

| Platform | Format | Example |
|----------|--------|---------|
| CSS | `Xpx` | `16px` |
| iOS Swift | `CGFloat` number | `16` |
| Android | `Xpx` dimen | `16px` |
| Flutter | `"Xpx"` string | `"16px"` |

#### Opacity

| Platform | Format | Example |
|----------|--------|---------|
| CSS | `0-1` number | `0.5` |
| iOS Swift | `CGFloat` | `0.5` |
| Flutter | `double` | `0.5` |

**Note:** Figma exports opacity as percentage (5, 10, 70). Transform converts to decimal: `5` → `0.05`

## Output Structure

```
dist/
├── css/
│   ├── shared/                      # Primitives
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
├── js/                              # Same structure
├── json/                            # Same structure
├── ios/                             # Swift Classes
├── android/                         # XML Resources
├── flutter/                         # Dart Classes
└── bundles/                         # Convenience bundles
```

## Figma Integration

### Supported Figma Scopes

| Scope | Assigned Type | Output Format |
|-------|---------------|---------------|
| `OPACITY` | `opacity` | 0-1 decimal (÷100) |
| `WIDTH_HEIGHT` | `dimension` | px (CSS), CGFloat (iOS) |
| `GAP` | `dimension` | Same as above |
| `FONT_SIZE` | `fontSize` | px with transform |
| `FONT_WEIGHT` | `fontWeight` | Unitless integer |

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

## CI/CD Workflows

### build-tokens.yml
- **Trigger**: Push to main, develop, claude/**
- **Outputs**: Build artifacts (30-day retention)

### auto-pr-from-figma.yml
- **Trigger**: Push to `figma-tokens` branch
- **Creates**: Pull Request to main with release notes

### publish-on-merge.yml
- **Trigger**: Merge to main
- **Actions**: Version bump, npm publish, GitHub Release

## Troubleshooting

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

## Related

- [Main README](./README.md) - Project overview
- [Icon Documentation](./README.icons.md) - Icon pipeline
- [Style Dictionary](https://styledictionary.com/) - Build tool

---

**Part of the BILD Design Ops Pipeline**
