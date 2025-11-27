# BILD Design System Icons

> **Part of the [BILD Design Ops Pipeline](./README.md)**

Multi-platform icon transformation pipeline for the BILD Design System.

[![npm version](https://img.shields.io/npm/v/@marioschmidt/design-system-icons.svg)](https://www.npmjs.com/package/@marioschmidt/design-system-icons)

## Overview

This pipeline transforms SVG icons from Figma into optimized, production-ready assets for 5 platforms:

| Platform | Output | Format |
|----------|--------|--------|
| **Web** | `dist/icons/svg/` | Optimized SVG |
| **React** | `dist/icons/react/` | ESM JavaScript + TypeScript Declarations |
| **Android** | `dist/icons/android/` | Vector Drawable XML |
| **Flutter** | `dist/icons/flutter/` | TTF Font + Dart Class |
| **iOS** | `dist/icons/ios/` | Asset Catalog + Swift |

## Architecture

```
Figma Plugin
     │
     ▼
┌─────────────────┐
│  figma-icons    │  ← Branch: Figma pushes SVGs here
│  Branch         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  GitHub Action  │  ← auto-pr-from-figma-icons.yml
│  Build + PR     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  src/icons/     │  ← Source SVGs (icon-{name}.svg)
│  *.svg          │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│              Build Pipeline                      │
│  ┌─────────┐                                    │
│  │  SVGO   │ ← Optimization (currentColor)      │
│  └────┬────┘                                    │
│       │                                         │
│       ▼                                         │
│  ┌─────────────────────────────────────────┐   │
│  │  Platform Generators                      │   │
│  │  ┌───────────────────┐                   │   │
│  │  │ React (TSX → JS)  │ ← TypeScript      │   │
│  │  └───────────────────┘   Compilation     │   │
│  │  ┌─────────┐ ┌───────┐ ┌─────┐          │   │
│  │  │ Android │ │Flutter│ │ iOS │          │   │
│  │  └─────────┘ └───────┘ └─────┘          │   │
│  └─────────────────────────────────────────┘   │
└────────┬────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  dist/icons/    │  ← Multi-platform output
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  npm publish    │  ← @marioschmidt/design-system-icons
└─────────────────┘
```

## Installation

```bash
npm install @marioschmidt/design-system-icons
```

## Usage

### React

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

### Android

```xml
<ImageView
    android:src="@drawable/ic_add"
    android:layout_width="24dp"
    android:layout_height="24dp"
    app:tint="?attr/colorOnSurface" />
```

Icons automatically use `?attr/colorOnSurface` for theming.

### Flutter

```dart
import 'package:bild_design_system_icons/icons.dart';

// Static access
Icon(BildIcons.add)
Icon(BildIcons.menu, size: 32)

// Dynamic access
Icon(BildIcons.byName('add'))

// List all icons
BildIcons.names.forEach((name) => print(name));
```

### iOS (SwiftUI)

```swift
import BildDesignSystemIcons

// Using enum
BildIcon.add.image
    .foregroundColor(.primary)

// With size
BildIcon.menu.image
    .font(.system(size: 32))

// All icons
ForEach(BildIcon.allCases, id: \.self) { icon in
    icon.image
}
```

## File Structure

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
├── svgo.config.js         ← SVG optimization config
└── svgr.config.js         ← React component config

dist/icons/                 ← Generated output (gitignored)
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

## Build Commands

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

## Adding New Icons

### Via Figma (Recommended)

1. Export SVGs from Figma using the BILD Icons plugin
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

## Naming Conventions

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
| React | `icon-add.svg` | `Add.tsx` |
| Android | `icon-add.svg` | `ic_add.xml` |
| Flutter | `icon-add.svg` | `BildIcons.add` |
| iOS | `icon-add.svg` | `BildIcon.add` |

## SVG Requirements

### Must Have
- `viewBox` attribute (e.g., `viewBox="0 0 24 24"`)
- Single color (will be converted to `currentColor`)
- Vector paths only (no raster images)

### Recommended
- 24x24 viewBox (standard icon size)
- Centered content with 2px padding
- Stroke-based or fill-based (not mixed)
- Stroke width: 2px for outline icons

### Will Be Removed
- `width` and `height` attributes
- Figma/Sketch/Illustrator metadata
- Comments and doctype
- Unused definitions
- Hardcoded colors (replaced with `currentColor`)

### Security Validation

The build pipeline validates all SVGs before processing:

| Check | Action |
|-------|--------|
| Missing `<svg>` element | Build fails |
| Missing `</svg>` tag | Build fails |
| `<script>` elements | Blocked (XSS risk) |
| `<foreignObject>`, `<iframe>`, `<embed>` | Blocked |
| Event handlers (`onclick`, etc.) | Blocked |
| `javascript:` URLs | Blocked |
| External `xlink:href` | Blocked |
| Missing `viewBox` | Warning (continues with default)

## Accessibility

### React Components

```tsx
// Decorative icon (default)
// Hidden from screen readers
<Add />
// Renders: <svg aria-hidden="true" ...>

// Meaningful icon
// Visible to screen readers with label
<Add aria-label="Add new item" />
// Renders: <svg aria-label="Add new item" ...>

// With tooltip
<Add title="Add new item" aria-label="Add" />
// Renders: <svg aria-label="Add"><title>Add new item</title>...
```

### Guidelines

| Use Case | Props |
|----------|-------|
| Decorative (next to text) | None (default) |
| Standalone button | `aria-label="Action"` |
| With tooltip | `title="..." aria-label="..."` |

## Theming

All icons use `currentColor` and inherit the parent's text color:

```css
/* CSS */
.icon-container {
  color: var(--color-icon-primary);
}

/* Tailwind */
<Add className="text-blue-500" />

/* Inline */
<Add style={{ color: '#1a73e8' }} />
```

### Platform-Specific Theming

| Platform | Mechanism |
|----------|-----------|
| Web/React | CSS `color` property |
| Android | `?attr/colorOnSurface` or `app:tint` |
| Flutter | `IconTheme` or `color` parameter |
| iOS | `.foregroundColor()` modifier |

## CI/CD Workflows

### build-icons.yml
Triggers on push to `main`, `develop`, `figma-icons`, `claude/**`
- Builds all platforms
- Uploads artifacts (30-day retention)
- Comments on PRs with build summary

### auto-pr-from-figma-icons.yml
Triggers on push to `figma-icons` branch
- Builds icons
- Compares with main branch
- Generates release notes
- Creates/updates PR automatically

### publish-icons-on-merge.yml
Triggers on merge to `main` with icon changes
- Bumps version (patch)
- Publishes to npm
- Creates GitHub release

## Codepoint Stability (Flutter)

Flutter icons use a TTF font with stable codepoints. The `.codepoints.json` registry ensures:

- Existing icons keep their codepoint forever
- New icons get the next available codepoint
- No breaking changes between versions

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

## Troubleshooting

### Build fails with "No SVG files found"
- Check that SVGs are in `src/icons/`
- Verify naming convention: `icon-{name}.svg`

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

## Dependencies

Build-time only (not shipped with package):

| Package | Version | Purpose |
|---------|---------|---------|
| svgo | ^3.2.0 | SVG optimization |
| @svgr/core | ^8.1.0 | React component generation |
| svg2vectordrawable | ^2.9.1 | Android conversion |
| fantasticon | ^3.0.0 | Flutter font generation |
| typescript | ^5.3.0 | React TypeScript compilation |
| @types/react | ^18.2.0 | React type definitions |

## Package Exports

```javascript
// Main entry (React)
import { Add } from '@marioschmidt/design-system-icons';

// Platform-specific
import { Add } from '@marioschmidt/design-system-icons/react';

// Raw SVG path
import addSvg from '@marioschmidt/design-system-icons/svg/add.svg';
```

## License

UNLICENSED - Internal use only.

## Related

- [Main README](./README.md) - Project overview
- [Token Documentation](./README.tokens.md) - Design tokens package
- [Figma BILD Icons Plugin](#) - Figma export plugin

---

**Part of the BILD Design Ops Pipeline**
