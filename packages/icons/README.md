# 🖼️ BILD Design System Icons

> **Part of the [BILD Design Ops Pipeline](../../README.md)** | [Token Documentation](../tokens/README.md) | [Component Documentation](../components/core/README.md)

Multi-platform icon transformation pipeline for the BILD Design System.

[![npm version](https://img.shields.io/npm/v/@marioschmidt/design-system-icons.svg)](https://www.npmjs.com/package/@marioschmidt/design-system-icons)
[![Build Status](https://github.com/UXWizard25/bild-design-system/workflows/Build%20Icons/badge.svg)](https://github.com/UXWizard25/bild-design-system/actions)

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [📦 Package Structure](#-package-structure)
- [🏗️ Architecture](#️-architecture)
- [📦 Installation](#-installation)
- [🚀 Usage](#-usage)
- [📁 File Structure](#-file-structure)
- [⚙️ Build Commands](#️-build-commands)
- [⚙️ Configuration](#️-configuration)
- [➕ Adding New Icons](#-adding-new-icons)
- [📝 Naming Conventions](#-naming-conventions)
- [✅ SVG Requirements](#-svg-requirements)
- [♿ Accessibility](#-accessibility)
- [🎨 Theming](#-theming)
- [🔄 CI/CD Workflows](#-cicd-workflows)
- [🆘 Troubleshooting](#-troubleshooting)
- [📚 Dependencies](#-dependencies)
- [🔗 Related](#-related)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Overview

This pipeline transforms SVG icons from Figma into optimized, production-ready assets for 4 platforms, each distributed as a separate package:

| Platform | Package | Distribution | Status |
|----------|---------|--------------|--------|
| **🌐 Web (SVG)** | `@marioschmidt/design-system-icons` | npm | ✅ Production |
| **⚛️ React** | `@marioschmidt/design-system-icons-react` | npm | ✅ Production |
| **🤖 Android** | `de.bild.design:icons` | GitHub Packages (Maven) | ✅ Production |
| **🍎 iOS** | `BildIcons` | Swift Package Manager | ✅ Production |

---

## 📦 Package Structure

The icons are organized into platform-specific packages for optimal tree-shaking and platform-native distribution:

```
packages/icons/
├── src/                    ← Source SVGs from Figma
├── svg/                    ← @marioschmidt/design-system-icons (npm)
│   ├── package.json
│   └── dist/               → Optimized SVG files
├── react/                  ← @marioschmidt/design-system-icons-react (npm)
│   ├── package.json
│   └── dist/               → React components + TypeScript
├── android/                ← de.bild.design:icons (GitHub Packages)
│   ├── build.gradle.kts
│   └── src/main/res/       → Vector Drawables + attrs
└── ios/                    ← BildIcons (Swift Package Manager)
    ├── Package.swift
    └── Sources/BildIcons/  → Asset Catalog + Swift enum
```

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
│  │  ┌──────────┐  ┌──────────┐                              │ │
│  │  │ Android  │  │   iOS    │                              │ │
│  │  │   XML    │  │ xcassets │                              │ │
│  │  └──────────┘  └──────────┘                              │ │
│  └───────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  📤 OUTPUT: packages/icons/                                     │
│                                                                 │
│  ├── svg/dist/      ← Optimized SVGs (@marioschmidt/...icons)  │
│  ├── react/dist/    ← ESM + .d.ts (@marioschmidt/...icons-react)│
│  ├── android/src/   ← Vector Drawables (de.bild.design:icons)  │
│  └── ios/Sources/   ← Asset Catalog (BildIcons via SPM)        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │  Platform Distribution
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  📦 PACKAGES                                                    │
│                                                                 │
│  npm:    @marioschmidt/design-system-icons (SVG)               │
│          @marioschmidt/design-system-icons-react (React)       │
│  Maven:  de.bild.design:icons (Android → GitHub Packages)      │
│  SPM:    BildIcons (iOS → Git tags)                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

### 🌐 Web (SVG only)

```bash
npm install @marioschmidt/design-system-icons
```

### ⚛️ React Components

```bash
npm install @marioschmidt/design-system-icons-react
```

### 🤖 Android (Gradle)

```kotlin
// settings.gradle.kts
dependencyResolutionManagement {
    repositories {
        maven {
            url = uri("https://maven.pkg.github.com/UXWizard25/bild-design-system")
            credentials {
                username = project.findProperty("gpr.user") ?: System.getenv("GITHUB_USER")
                password = project.findProperty("gpr.token") ?: System.getenv("GITHUB_TOKEN")
            }
        }
    }
}

// build.gradle.kts
dependencies {
    implementation("de.bild.design:icons:1.0.4")
}
```

### 🍎 iOS (Swift Package Manager)

```swift
// Package.swift or Xcode: File → Add Package Dependencies
.package(url: "https://github.com/UXWizard25/bild-design-system.git", from: "1.0.0")

// Target dependency
.target(name: "YourApp", dependencies: ["BildIcons"])
```

---

## 🚀 Usage

### ⚛️ React

```tsx
import { IconAdd, IconMenu, IconSearch } from '@marioschmidt/design-system-icons-react';

// Default (decorative icon - hidden from screen readers)
<IconAdd />

// With size
<IconAdd size={32} />

// Accessible (visible to screen readers)
<IconAdd aria-label="Add new item" />

// With tooltip
<IconAdd title="Add new item" aria-label="Add" />

// Custom styling
<IconAdd className="text-primary" style={{ color: 'red' }} />
```

### 🌐 SVG (Direct Import)

```javascript
// ES Module import
import addIcon from '@marioschmidt/design-system-icons/add.svg';

// Or use direct path
<img src="node_modules/@marioschmidt/design-system-icons/add.svg" alt="Add" />
```

### 🤖 Android

```xml
<!-- XML Layout -->
<ImageView
    android:src="@drawable/ic_add"
    android:layout_width="24dp"
    android:layout_height="24dp"
    app:tint="?attr/colorOnSurface" />
```

```kotlin
// Jetpack Compose (recommended)
import de.bild.design.icons.*

BildIcon(BildIcons.Add, contentDescription = "Add item")

// With custom size and color
BildIcon(
    icon = BildIcons.Menu,
    contentDescription = "Menu",
    size = BildIconSize.LG,
    tint = MaterialTheme.colorScheme.primary
)
```

Icons use static black fill by default - apply `app:tint` or the `tint` parameter for theming.

### 🍎 iOS (SwiftUI)

```swift
import BildIcons

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

---

## 📁 File Structure

### Monorepo Structure

This package is part of the npm workspaces monorepo:

| Package | npm Name | Location |
|---------|----------|----------|
| Tokens | `@marioschmidt/design-system-tokens` | `packages/tokens/` |
| Icons (SVG) | `@marioschmidt/design-system-icons` | `packages/icons/svg/` |
| Icons (React) | `@marioschmidt/design-system-icons-react` | `packages/icons/react/` |
| Components | `@marioschmidt/design-system-components` | `packages/components/` |
| React | `@marioschmidt/design-system-react` | `packages/react/` |
| Vue | `@marioschmidt/design-system-vue` | `packages/vue/` |

```
packages/icons/
├── src/                       ← Source SVGs from Figma
│   ├── icon-add.svg
│   ├── icon-menu.svg
│   └── icon-search.svg
│
├── svg/                       ← @marioschmidt/design-system-icons
│   ├── package.json
│   └── dist/                  → Optimized SVG files
│       ├── add.svg
│       ├── menu.svg
│       └── ...
│
├── react/                     ← @marioschmidt/design-system-icons-react
│   ├── package.json
│   ├── .src/                  → Intermediate TSX (gitignored)
│   └── dist/                  → Compiled ESM JavaScript
│       ├── IconAdd.js
│       ├── IconAdd.d.ts
│       ├── index.js
│       └── ...
│
├── android/                   ← de.bild.design:icons (Maven)
│   ├── build.gradle.kts
│   └── src/main/res/
│       ├── drawable/          → ic_*.xml Vector Drawables
│       └── values/            → attrs_icons.xml
│
└── ios/                       ← BildIcons (Swift Package Manager)
    ├── Package.swift
    └── Sources/BildIcons/
        ├── BildIcon.swift     → Swift enum
        └── Resources/
            └── Assets.xcassets/Icons/

scripts/icons/
├── build-icons.js         ← Main orchestrator
├── paths.js               ← Centralized path configuration
├── optimize-svg.js        ← SVGO optimization + SVG validation
├── generate-react.js      ← React TSX generation (intermediate)
├── compile-react.js       ← TypeScript compilation → dist/
├── generate-android.js    ← Android XML generation
├── generate-ios.js        ← iOS asset generation
├── compare-icon-builds.js ← Diff detection for PRs
└── generate-icon-release-notes.js

build-config/icons/
├── svgo.config.js         ← SVG optimization config
└── tsconfig.json          ← TypeScript config for React build
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
npm run build:icons:ios      # Only iOS assets

# Clean build output
npm run clean:icons
```

---

## ⚙️ Configuration

All icon pipeline settings are centralized in **`build-config/pipeline.config.js`**, following the same single-source-of-truth principle as the token pipeline.

### Configuration Settings

```javascript
// build-config/pipeline.config.js
icons: {
  enabled: true,                    // Master switch for icon pipeline
  defaultSize: 24,                  // Default icon size in dp/pt
  sourceFilePrefix: 'icon-',        // Prefix removed from source files
  sizePresets: {                    // Size presets for all platforms
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
  },
  platforms: {
    svg: { enabled: true },
    react: {
      enabled: true,
      componentPrefix: 'Icon',      // add → IconAdd
    },
    android: { enabled: true },
    ios: { enabled: true },
  },
},
```

### Derived Values

These values are **automatically computed** from `identity.shortName` in the config:

| Property | Example (shortName: `'bild'`) | Usage |
|----------|-------------------------------|-------|
| `iosIconEnumName` | `'BildIcon'` | Swift enum name |
| `iconObjectName` | `'BildIcons'` | Kotlin object / SPM module name |
| `androidIconPackage` | `'de.bild.design.icons'` | Kotlin package name |
| `iconAssetAuthor` | `'bild-design-system-icons'` | Asset catalog author string |

### Adapting for a Different Design System

To adapt the icon pipeline for a different design system, modify `pipeline.config.js`:

```javascript
// Example: ACME Design System
identity: {
  shortName: 'acme',  // → AcmeIcon, AcmeIcons, de.acme.design.icons
},
icons: {
  defaultSize: 20,                  // Different default size
  sourceFilePrefix: 'icon-',        // Same prefix convention
  sizePresets: {
    sm: 16,
    md: 20,
    lg: 24,
  },
  platforms: {
    svg: { enabled: true },
    react: {
      enabled: true,
      componentPrefix: 'Acme',      // add → AcmeAdd
    },
    android: { enabled: true },
    ios: { enabled: false },        // Disable iOS output
  },
},
```

All scripts read from this configuration—no hardcoded values in build scripts.

📖 **Full documentation:** See `build-config/PIPELINE-CONFIG.md`

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
| typescript | ^5.3.0 | React TypeScript compilation |
| @types/react | ^18.2.0 | React type definitions |

---

## 📦 Package Exports

### SVG Package (`@marioschmidt/design-system-icons`)

```javascript
// Individual SVG file
import addSvg from '@marioschmidt/design-system-icons/add.svg';

// Or via explicit path
import menuSvg from '@marioschmidt/design-system-icons/menu.svg';
```

### React Package (`@marioschmidt/design-system-icons-react`)

```javascript
// Named exports from index
import { IconAdd, IconMenu, IconSearch } from '@marioschmidt/design-system-icons-react';

// Individual component (tree-shakeable)
import { IconAdd } from '@marioschmidt/design-system-icons-react/IconAdd';

// Default export from individual file
import IconChevronDown from '@marioschmidt/design-system-icons-react/IconChevronDown';
```

---

## 🔗 Related

| Document | Description |
|----------|-------------|
| [📖 Main README](../../README.md) | Project overview |
| [📖 Tokens README](../tokens/README.md) | Token pipeline documentation |
| [📖 Components README](../components/core/README.md) | Stencil Web Components |

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
| 4 Platforms | ✅ |
| TypeScript Support | ✅ |
| Accessibility | ✅ |
| Security Validation | ✅ |
