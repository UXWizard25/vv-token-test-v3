# 🖼️ BILD Design System Icons

> **Part of the [BILD Design Ops Pipeline](../../README.md)** | [Token Documentation](../tokens/README.md) | [Component Documentation](../components/README.md)

Multi-platform icon transformation pipeline for the BILD Design System.

[![npm version](https://img.shields.io/npm/v/@marioschmidt/design-system-icons.svg)](https://www.npmjs.com/package/@marioschmidt/design-system-icons)
[![Build Status](https://github.com/UXWizard25/vv-token-test-v3/workflows/Build%20Icons/badge.svg)](https://github.com/UXWizard25/vv-token-test-v3/actions)

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [🏗️ Architecture](#️-architecture)
- [📦 Installation](#-installation)
- [🚀 Usage](#-usage)
- [📁 File Structure](#-file-structure)
- [⚙️ Build Commands](#️-build-commands)
- [➕ Adding New Icons](#-adding-new-icons)
- [📝 Naming Conventions](#-naming-conventions)
- [✅ SVG Requirements](#-svg-requirements)
- [♿ Accessibility](#-accessibility)
- [🎨 Theming](#-theming)
- [🔄 CI/CD Workflows](#-cicd-workflows)
- [🔢 Codepoint Stability (Flutter)](#-codepoint-stability-flutter)
- [🆘 Troubleshooting](#-troubleshooting)
- [📚 Dependencies](#-dependencies)
- [🔗 Related](#-related)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Overview

This pipeline transforms SVG icons from Figma into optimized, production-ready assets for 5 platforms:

| Platform | Output | Format | Status |
|----------|--------|--------|--------|
| **🌐 Web** | `dist/icons/svg/` | Optimized SVG | ✅ Production |
| **⚛️ React** | `dist/icons/react/` | ESM JavaScript + TypeScript Declarations | ✅ Production |
| **🤖 Android** | `dist/icons/android/` | Vector Drawable XML | ✅ Production |
| **💙 Flutter** | `dist/icons/flutter/` | TTF Font + Dart Class | ✅ Production |
| **🍎 iOS** | `dist/icons/ios/` | Asset Catalog + Swift | ✅ Production |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          FIGMA                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🖼️ Icon Components                                      │   │
│  │  • 24x24 viewBox                                         │   │
│  │  • Single color (converted to currentColor)              │   │
│  └────────────────────────────┬────────────────────────────┘   │
└───────────────────────────────┼─────────────────────────────────┘
                                │
                                │  CodeBridge Plugin Export
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  📁 figma-icons Branch                                          │
│  src/icons/icon-*.svg                                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │  GitHub Actions Trigger
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  🔧 BUILD PIPELINE                                              │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 1️⃣ SVG Validation                                          │ │
│  │    • Security checks (no scripts, no external refs)       │ │
│  │    • Structure validation (viewBox, valid SVG)            │ │
│  └───────────────────────────┬───────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 2️⃣ SVGO Optimization                                       │ │
│  │    • Convert colors to currentColor                       │ │
│  │    • Remove metadata & editor data                        │ │
│  │    • Optimize paths                                       │ │
│  └───────────────────────────┬───────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 3️⃣ Platform Generation                                     │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ React: TSX → TypeScript Compilation → ESM + d.ts    │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │ │
│  │  │ Android  │  │ Flutter  │  │   iOS    │               │ │
│  │  │   XML    │  │ TTF+Dart │  │ xcassets │               │ │
│  │  └──────────┘  └──────────┘  └──────────┘               │ │
│  └───────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  📤 OUTPUT: dist/icons/                                         │
│                                                                 │
│  ├── svg/           ← Optimized SVGs                           │
│  ├── react-src/     ← TSX Source (intermediate)                │
│  ├── react/         ← Compiled ESM + .d.ts + .js.map           │
│  ├── android/       ← Vector Drawables + attrs                 │
│  ├── flutter/       ← TTF font + Dart class                    │
│  └── ios/           ← Asset Catalog + Swift extension          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │  npm publish
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  📦 @marioschmidt/design-system-icons                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

```bash
npm install @marioschmidt/design-system-icons
```

---

## 🚀 Usage

### ⚛️ React

```tsx
import { Add, Menu, Search } from '@marioschmidt/design-system-icons';

// Default (decorative icon - hidden from screen readers)
<Add />

// With size
<Add size={32} />

// Accessible (visible to screen readers)
<Add aria-label="Add new item" />

// With tooltip
<Add title="Add new item" aria-label="Add" />

// Custom styling
<Add className="text-primary" style={{ color: 'red' }} />
```

### 🤖 Android

```xml
<ImageView
    android:src="@drawable/ic_add"
    android:layout_width="24dp"
    android:layout_height="24dp"
    app:tint="?attr/colorOnSurface" />
```

Icons automatically use `?attr/colorOnSurface` for Material theming.

### 💙 Flutter

```dart
import 'package:bild_design_system_icons/icons.dart';

// Static access
Icon(BildIcons.add)
Icon(BildIcons.menu, size: 32)

// Dynamic access by name
Icon(BildIcons.byName('add'))

// List all available icons
BildIcons.names.forEach((name) => print(name));
```

### 🍎 iOS (SwiftUI)

```swift
import BildDesignSystemIcons

// Using enum
BildIcon.add.image
    .foregroundColor(.primary)

// With size
BildIcon.menu.image
    .font(.system(size: 32))

// Iterate all icons
ForEach(BildIcon.allCases, id: \.self) { icon in
    icon.image
}
```

### 🌐 SVG (Direct)

```html
<img src="node_modules/@marioschmidt/design-system-icons/dist/icons/svg/add.svg" alt="Add">
```

---

## 📁 File Structure

### Monorepo Structure

This package is part of the npm workspaces monorepo:

| Package | npm Name | Location |
|---------|----------|----------|
| Tokens | `@marioschmidt/design-system-tokens` | `packages/tokens/` |
| Icons | `@marioschmidt/design-system-icons` | `packages/icons/` |
| Components | `@marioschmidt/design-system-components` | `packages/components/` |

```
src/icons/
├── icon-add.svg           ← Source SVGs from Figma
├── icon-menu.svg
├── icon-search.svg
└── .codepoints.json       ← Flutter codepoint registry (auto-managed)

scripts/icons/
├── build-icons.js         ← Main orchestrator
├── optimize-svg.js        ← SVGO optimization + SVG validation
├── generate-react.js      ← React TSX generation → react-src/
├── compile-react.js       ← TypeScript compilation → react/
├── generate-android.js    ← Android XML generation
├── generate-flutter.js    ← Flutter font generation
├── generate-ios.js        ← iOS asset generation
├── compare-icon-builds.js ← Diff detection for PRs
└── generate-icon-release-notes.js

build-config/icons/
└── svgo.config.js         ← SVG optimization config

packages/icons/dist/        ← Generated output (gitignored)
├── svg/                   ← Optimized SVGs
├── react-src/             ← TSX source (intermediate)
├── react/                 ← Compiled ESM JavaScript
│   ├── *.js               ← ESM modules
│   ├── *.d.ts             ← TypeScript declarations
│   ├── *.js.map           ← Source maps
│   └── package.json       ← Module configuration
├── android/
│   ├── drawable/          ← ic_*.xml files
│   └── values/            ← attrs_icons.xml
├── flutter/
│   ├── fonts/             ← BildIcons.ttf
│   └── lib/               ← icons.dart
└── ios/
    ├── Assets.xcassets/   ← Xcode asset catalog
    └── Sources/           ← BildIcons.swift
```

---

## ⚙️ Build Commands

```bash
# Build all platforms
npm run build:icons

# Build specific platforms
npm run build:icons:svg      # Only SVGO optimization
npm run build:icons:react    # Only React components
npm run build:icons:android  # Only Android drawables
npm run build:icons:flutter  # Only Flutter font
npm run build:icons:ios      # Only iOS assets

# Clean build output
npm run clean:icons
```

---

## ➕ Adding New Icons

### Via Figma (Recommended)

1. Export SVGs from Figma using the **CodeBridge Plugin**
2. Plugin pushes to `figma-icons` branch
3. CI automatically builds and creates PR
4. Review and merge PR

### Manual

1. Add SVG to `src/icons/` with naming convention:
   ```
   icon-{name}.svg

   Examples:
   icon-add.svg
   icon-arrow-left.svg
   icon-chevron-down.svg
   ```

2. Run build:
   ```bash
   npm run build:icons
   ```

3. Commit and push

---

## 📝 Naming Conventions

### Source Files

| Pattern | Example | Valid |
|---------|---------|-------|
| `icon-{name}.svg` | `icon-add.svg` | ✅ |
| `icon-{name}-{variant}.svg` | `icon-arrow-left.svg` | ✅ |
| Lowercase only | `icon-add.svg` | ✅ |
| Kebab-case | `icon-chevron-down.svg` | ✅ |
| No prefix | `add.svg` | ❌ |
| Uppercase | `icon-Add.svg` | ❌ |
| Underscore | `icon_add.svg` | ❌ |

### Generated Output

| Platform | Input | Output |
|----------|-------|--------|
| SVG | `icon-add.svg` | `add.svg` |
| React | `icon-add.svg` | `Add.js` + `Add.d.ts` |
| Android | `icon-add.svg` | `ic_add.xml` |
| Flutter | `icon-add.svg` | `BildIcons.add` |
| iOS | `icon-add.svg` | `BildIcon.add` |

---

## ✅ SVG Requirements

### Must Have
- ✅ `viewBox` attribute (e.g., `viewBox="0 0 24 24"`)
- ✅ Single color (will be converted to `currentColor`)
- ✅ Vector paths only (no raster images)

### Recommended
- 📐 24x24 viewBox (standard icon size)
- 📏 Centered content with 2px padding
- 🖌️ Stroke-based or fill-based (not mixed)
- 📏 Stroke width: 2px for outline icons

### Will Be Removed
- `width` and `height` attributes
- Figma/Sketch/Illustrator metadata
- Comments and doctype
- Unused definitions
- Hardcoded colors (replaced with `currentColor`)

### 🔒 Security Validation

The build pipeline validates all SVGs before processing:

| Check | Action |
|-------|--------|
| Missing `<svg>` element | ❌ Build fails |
| Missing `</svg>` tag | ❌ Build fails |
| `<script>` elements | ❌ Blocked (XSS risk) |
| `<foreignObject>`, `<iframe>`, `<embed>` | ❌ Blocked |
| Event handlers (`onclick`, etc.) | ❌ Blocked |
| `javascript:` URLs | ❌ Blocked |
| External `xlink:href` | ❌ Blocked |
| Missing `viewBox` | ⚠️ Warning (continues with default) |

---

## ♿ Accessibility

### React Components

```tsx
// Decorative icon (default)
// Hidden from screen readers
<Add />
// Renders: <svg aria-hidden="true" role="img" ...>

// Meaningful icon
// Visible to screen readers with label
<Add aria-label="Add new item" />
// Renders: <svg aria-label="Add new item" role="img" ...>

// With tooltip
<Add title="Add new item" aria-label="Add" />
// Renders: <svg aria-label="Add"><title>Add new item</title>...
```

### Guidelines

| Use Case | Props | Screen Reader |
|----------|-------|---------------|
| Decorative (next to text) | None (default) | Hidden |
| Standalone button | `aria-label="Action"` | Reads label |
| With tooltip | `title="..." aria-label="..."` | Reads label |

---

## 🎨 Theming

All icons use `currentColor` and inherit the parent's text color:

```css
/* CSS */
.icon-container {
  color: var(--color-icon-primary);
}
```

```tsx
/* React / Tailwind */
<Add className="text-blue-500" />

/* Inline */
<Add style={{ color: '#1a73e8' }} />
```

### Platform-Specific Theming

| Platform | Mechanism |
|----------|-----------|
| 🌐 Web/React | CSS `color` property |
| 🤖 Android | `?attr/colorOnSurface` or `app:tint` |
| 💙 Flutter | `IconTheme` or `color` parameter |
| 🍎 iOS | `.foregroundColor()` modifier |

---

## 🔄 CI/CD Workflows

### build-icons.yml
- **Trigger**: Push to `main`, `develop`, `figma-icons`, `claude/**`
- **Action**: Builds all platforms, uploads artifacts (30-day retention)
- **PR Comment**: Build summary with download link

### auto-pr-from-figma-icons.yml
- **Trigger**: Push to `figma-icons` branch
- **Action**: Builds icons, compares with main, generates release notes
- **Output**: Creates/updates PR automatically

### publish-icons-on-merge.yml
- **Trigger**: Merge to `main` with icon changes
- **Action**: Bumps version (patch), publishes to npm, creates GitHub release

---

## 🔢 Codepoint Stability (Flutter)

Flutter icons use a TTF font with stable codepoints. The `.codepoints.json` registry ensures:

- ✅ Existing icons keep their codepoint forever
- ✅ New icons get the next available codepoint
- ✅ No breaking changes between versions

```json
{
  "nextCodepoint": "e007",
  "icons": {
    "add": "e001",
    "arrow-left": "e002",
    "arrow-right": "e003"
  }
}
```

---

## 🆘 Troubleshooting

### Build fails with "No SVG files found"
- ✅ Check that SVGs are in `src/icons/`
- ✅ Verify naming convention: `icon-{name}.svg`

### React components have wrong attribute names
- Attributes are auto-converted to camelCase
- `stroke-width` → `strokeWidth`

### Android icons are wrong color
- Icons use `?attr/colorOnSurface` by default
- Override with `app:tint="@color/your_color"`

### Flutter font not generating
- Ensure `fantasticon` is installed
- Check `dist/icons/flutter/fonts/` for TTF file

### iOS assets not showing
- Verify `Assets.xcassets` structure
- Check `Contents.json` has correct filenames

---

## 📚 Dependencies

Build-time only (not shipped with package):

| Package | Version | Purpose |
|---------|---------|---------|
| svgo | ^3.2.0 | SVG optimization |
| @svgr/core | ^8.1.0 | React component generation |
| svg2vectordrawable | ^2.9.1 | Android conversion |
| fantasticon | ^3.0.0 | Flutter font generation |
| typescript | ^5.3.0 | React TypeScript compilation |
| @types/react | ^18.2.0 | React type definitions |

---

## 📦 Package Exports

```javascript
// Main entry (React)
import { Add } from '@marioschmidt/design-system-icons';

// Platform-specific
import { Add } from '@marioschmidt/design-system-icons/react';

// Individual icon
import Add from '@marioschmidt/design-system-icons/react/Add';

// Raw SVG path
import addSvg from '@marioschmidt/design-system-icons/svg/add.svg';
```

---

## 🔗 Related

| Document | Description |
|----------|-------------|
| [📖 Main README](../../README.md) | Project overview |
| [📖 Tokens README](../tokens/README.md) | Token pipeline documentation |
| [📖 Components README](../components/README.md) | Stencil Web Components |

---

## 🤝 Contributing

> **⚠️ IMPORTANT: Figma is the Single Source of Truth**
>
> Icons must **NOT** be edited directly in the repository. All icon changes must be made in Figma and exported via the **CodeBridge Plugin**.

**Workflow:**
1. Edit/create icons in Figma
2. Export with CodeBridge Plugin
3. Review and merge PR

**NOT Allowed:**
- ❌ Direct SVG changes in `src/icons/`
- ❌ Manual commits to `figma-icons` branch
- ❌ Changes to generated files

**Allowed (Pipeline Development):**
- ✅ Changes to build scripts (`scripts/icons/`)
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
| 5 Platforms | ✅ |
| TypeScript Support | ✅ |
| Accessibility | ✅ |
| Security Validation | ✅ |
| Stable Codepoints | ✅ |
