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
view.backgroundColor = StyleDictionary.textColorPrimary

// Dimensions (CGFloat Points)
let padding: CGFloat = StyleDictionary.space2x  // 16

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

## Token Transform Reference

### Naming Conventions

| Platform | Convention | Example |
|----------|-----------|---------|
| CSS | `kebab-case` with `--` | `--text-color-primary` |
| SCSS | `kebab-case` with `$` | `$text-color-primary` |
| JavaScript | `camelCase` | `textColorPrimary` |
| iOS Swift | `camelCase` | `textColorPrimary` |
| Android | `snake_case` | `text_color_primary` |
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
├── js/                              # Same structure
├── json/                            # Same structure
├── ios/                             # Swift Classes
├── android/                         # XML Resources
└── flutter/                         # Dart Classes
```

## 🔗 Figma Integration & Dependencies

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
| 7 Platforms | ✅ |
| 3 Brands | ✅ |
| ~970 Files | ✅ |
| Figma Scopes | ✅ |
