# 🎨 BILD Design Ops Pipeline

> **⚠️ IMPORTANT NOTICE**
>
> This pipeline is under active development. Generated packages are for **testing purposes only**.

A comprehensive design operations pipeline for the BILD Design System. Transforms Figma exports into production-ready assets across multiple platforms using the **TokenSync Plugin**.

[![Build Tokens](https://github.com/UXWizard25/vv-token-test-v3/workflows/Build%20Design%20Tokens/badge.svg)](https://github.com/UXWizard25/vv-token-test-v3/actions)
[![Build Icons](https://github.com/UXWizard25/vv-token-test-v3/workflows/Build%20Icons/badge.svg)](https://github.com/UXWizard25/vv-token-test-v3/actions)
[![npm tokens](https://img.shields.io/npm/v/@marioschmidt/design-system-tokens.svg?label=tokens)](https://www.npmjs.com/package/@marioschmidt/design-system-tokens)
[![npm icons](https://img.shields.io/npm/v/@marioschmidt/design-system-icons.svg?label=icons)](https://www.npmjs.com/package/@marioschmidt/design-system-icons)

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [📦 Packages](#-packages)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [🔗 Figma Integration](#-figma-integration)
- [📁 Project Structure](#-project-structure)
- [⚙️ Build Commands](#️-build-commands)
- [🔄 CI/CD Workflows](#-cicd-workflows)
- [📊 Platform Support](#-platform-support)
- [📚 Storybook](#-storybook)
- [📖 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Overview

The BILD Design Ops Pipeline transforms design assets from Figma into production-ready code for multiple platforms. It consists of two independent sub-pipelines:

| Pipeline | Input | Output | Platforms |
|----------|-------|--------|-----------|
| **🎨 Token Pipeline** | Figma Variables | Design Tokens | 3 platforms (6 formats) |
| **🖼️ Icon Pipeline** | Figma Icons (SVG) | Multi-format Icons | 5 platforms |

Both pipelines use the **TokenSync Figma Plugin** for automated exports.

---

## 📦 Packages

| Package | Description | Version | Documentation |
|---------|-------------|---------|---------------|
| **@marioschmidt/design-system-tokens** | Multi-platform design tokens | [![npm](https://img.shields.io/npm/v/@marioschmidt/design-system-tokens.svg)](https://www.npmjs.com/package/@marioschmidt/design-system-tokens) | [📖 README.tokens.md](./README.tokens.md) |
| **@marioschmidt/design-system-icons** | Multi-platform icon assets | [![npm](https://img.shields.io/npm/v/@marioschmidt/design-system-icons.svg)](https://www.npmjs.com/package/@marioschmidt/design-system-icons) | [📖 README.icons.md](./README.icons.md) |
| **JavaScript/React** | ESM + ThemeProvider (Dual-Axis) | - | [📖 docs/js.md](./docs/js.md) |
| **Android Compose** | Jetpack Compose (Dual-Axis) | - | [📖 docs/android.md](./docs/android.md) |
| **iOS SwiftUI** | SwiftUI (Dual-Axis) | - | [📖 docs/ios.md](./docs/ios.md) |
| **Web Components** | Stencil, Lit, Shadow DOM | - | [📖 docs/css.md](./docs/css.md#shadow-dom--web-components) |

---

## 🏗️ Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FIGMA                                          │
│  ┌─────────────────────┐              ┌─────────────────────┐              │
│  │  📊 Variables       │              │  🖼️ Icons           │              │
│  │  (Design Tokens)    │              │  (SVG Assets)       │              │
│  └──────────┬──────────┘              └──────────┬──────────┘              │
└─────────────┼───────────────────────────────────┼──────────────────────────┘
              │                                   │
              │  TokenSync Plugin                 │  TokenSync Plugin
              │                                   │
              ▼                                   ▼
┌─────────────────────────────┐    ┌─────────────────────────────┐
│  📁 figma-tokens branch     │    │  📁 figma-icons branch      │
│  src/design-tokens/*.json   │    │  src/icons/*.svg            │
└──────────────┬──────────────┘    └──────────────┬──────────────┘
               │                                  │
               │  GitHub Actions                  │  GitHub Actions
               │                                  │
               ▼                                  ▼
┌─────────────────────────────┐    ┌─────────────────────────────┐
│  🔧 TOKEN PIPELINE          │    │  🔧 ICON PIPELINE           │
│                             │    │                             │
│  ┌───────────────────────┐  │    │  ┌───────────────────────┐  │
│  │ 1. Preprocessing      │  │    │  │ 1. SVG Validation     │  │
│  │    • Scope detection  │  │    │  │    • Security checks  │  │
│  │    • Alias resolution │  │    │  │    • Structure check  │  │
│  │    • Type mapping     │  │    │  └───────────┬───────────┘  │
│  └───────────┬───────────┘  │    │              │              │
│              │              │    │              ▼              │
│              ▼              │    │  ┌───────────────────────┐  │
│  ┌───────────────────────┐  │    │  │ 2. SVGO Optimization  │  │
│  │ 2. Style Dictionary   │  │    │  │    • currentColor     │  │
│  │    • Transforms       │  │    │  │    • Remove metadata  │  │
│  │    • Formats          │  │    │  └───────────┬───────────┘  │
│  │    • Platform builds  │  │    │              │              │
│  └───────────┬───────────┘  │    │              ▼              │
│              │              │    │  ┌───────────────────────┐  │
│              ▼              │    │  │ 3. Platform Generation│  │
│  ┌───────────────────────┐  │    │  │    • React (TSX→JS)   │  │
│  │ 3. Bundle Generation  │  │    │  │    • Android XML      │  │
│  │    • Quick Start      │  │    │  │    • Flutter TTF      │  │
│  │    • Per-component    │  │    │  │    • iOS Assets       │  │
│  └───────────────────────┘  │    │  └───────────────────────┘  │
└──────────────┬──────────────┘    └──────────────┬──────────────┘
               │                                  │
               ▼                                  ▼
┌─────────────────────────────┐    ┌─────────────────────────────┐
│  📤 OUTPUT                  │    │  📤 OUTPUT                  │
│                             │    │                             │
│  dist/                      │    │  dist/icons/                │
│  ├── css/     (CSS Vars)    │    │  ├── svg/      (Optimized)  │
│  │   └── bundles/ (Quick)   │    │  ├── react/    (ESM + d.ts) │
│  ├── scss/    (SCSS Vars)   │    │  ├── android/  (XML)        │
│  ├── js/      (ESM + React) │    │  ├── flutter/  (TTF + Dart) │
│  ├── json/    (Raw Data)    │    │  └── ios/      (xcassets)   │
│  ├── ios/     (Swift)       │    │                             │
│  └── android/ (Compose/Kt)  │    │                             │
│                             │    │                             │
└──────────────┬──────────────┘    └──────────────┬──────────────┘
               │                                  │
               │  npm publish                     │  npm publish
               │                                  │
               ▼                                  ▼
┌─────────────────────────────┐    ┌─────────────────────────────┐
│  📦 @marioschmidt/          │    │  📦 @marioschmidt/          │
│     design-system-tokens    │    │     design-system-icons     │
└─────────────────────────────┘    └─────────────────────────────┘
```

---

## 🚀 Quick Start

### Installation

```bash
# Design Tokens
npm install @marioschmidt/design-system-tokens

# Icons
npm install @marioschmidt/design-system-icons
```

### Token Usage

```css
/* CSS */
@import '@marioschmidt/design-system-tokens/css/brands/bild/semantic/color/colormode-light.css';

.button {
  background-color: var(--text-color-accent-constant);
  padding: var(--space2x);
}
```

```javascript
// JavaScript (ES Modules) - Values are CSS-ready strings
import { createTheme } from '@marioschmidt/design-system-tokens/themes';
import { ThemeProvider, useTheme } from '@marioschmidt/design-system-tokens/react';

const theme = createTheme({ colorBrand: 'bild', colorMode: 'light' });
console.log(theme.colors.textColorPrimary);   // "#232629"
console.log(theme.spacing.gridSpaceRespBase); // "12px" - CSS-ready!
```

```swift
// iOS Swift
view.backgroundColor = StyleDictionary.textColorPrimary
let padding: CGFloat = StyleDictionary.space2x
```

```kotlin
// Android Jetpack Compose
import com.bild.designsystem.bild.theme.BildTheme
import com.bild.designsystem.bild.components.ButtonTokens
import com.bild.designsystem.shared.Density
import com.bild.designsystem.shared.WindowSizeClass

@Composable
fun MyApp() {
    BildTheme(
        darkTheme = isSystemInDarkTheme(),
        sizeClass = WindowSizeClass.Compact,
        density = Density.Default
    ) {
        Button(
            colors = ButtonDefaults.buttonColors(
                // Theme-aware: auto-selects Light/Dark
                containerColor = ButtonTokens.Colors.current().buttonPrimaryBgColorIdle
            )
        ) {
            Text(
                // Semantic tokens via Theme
                color = BildTheme.colors.textColorPrimary,
                // Component typography: auto-selects Compact/Regular
                fontSize = ButtonTokens.Typography.current().buttonLabelFontSize
            )
        }
    }
}

// Multi-brand apps: Use DesignSystemTheme
import com.bild.designsystem.shared.Brand
import com.bild.designsystem.shared.DesignSystemTheme

DesignSystemTheme(brand = Brand.Bild) { /* ... */ }
```

```tsx
// Web Components (Stencil) - CSS Custom Properties inherit through Shadow DOM
@Component({
  tag: 'my-button',
  shadow: true,
  styles: `
    .btn {
      background: var(--button-primary-brand-bg-color-idle);
      color: var(--button-primary-label-color);
    }
  `
})
export class MyButton { /* ... */ }
```

### Icon Usage

```tsx
// React
import { Add, Menu, Search } from '@marioschmidt/design-system-icons';

<Add size={24} aria-label="Add item" />
```

```xml
<!-- Android -->
<ImageView android:src="@drawable/ic_add" />
```

```dart
// Flutter
Icon(BildIcons.add, size: 24)
```

```swift
// iOS SwiftUI
BildIcon.add.image.foregroundColor(.primary)
```

➡️ See [README.tokens.md](./README.tokens.md) and [README.icons.md](./README.icons.md) for complete usage examples.

---

## 🔗 Figma Integration

Both pipelines integrate with Figma via the **TokenSync Plugin**:

| Branch | Content | Trigger |
|--------|---------|---------|
| `figma-tokens` | Design Variables (JSON) | Token export from Figma |
| `figma-icons` | Icon SVGs | Icon export from Figma |

### Workflow

```
1. Designer exports from Figma using TokenSync Plugin
2. Plugin pushes to dedicated branch (figma-tokens / figma-icons)
3. GitHub Actions automatically builds and creates PR
4. Team reviews PR with build artifacts
5. Merge to main triggers npm publish
```

➡️ See [Figma Integration Guide](./README.tokens.md#-figma-integration--dependencies) for details.

---

## 📁 Project Structure

```
vv-token-test-v3/
│
├── 📁 src/
│   ├── design-tokens/                  # 🎨 Figma token export
│   │   └── bild-design-system-raw-data.json
│   ├── icons/                          # 🖼️ Figma icon export
│   │   ├── icon-*.svg
│   │   └── .codepoints.json            # Flutter codepoint registry
│   ├── docs/                           # 📖 Storybook styleguide pages
│   │   ├── intro.mdx                   # Introduction & overview
│   │   ├── colors.mdx                  # Color tokens & palettes
│   │   ├── typography.mdx              # Font families & text styles
│   │   ├── spacing.mdx                 # Spacing scale & density
│   │   └── effects.mdx                 # Shadows & effects
│   └── components/                     # 🧩 Stencil Web Components
│       ├── ds-button/                  # Button component
│       ├── ds-card/                    # Card component
│       └── index.html                  # Dev/test page
│
├── 📁 scripts/
│   ├── tokens/                         # Token scripts
│   │   ├── preprocess.js               # Token preprocessing
│   │   ├── build.js                    # Token build orchestrator
│   │   ├── bundles.js                  # Bundle generation
│   │   ├── compare-builds.js           # Dist comparison
│   │   └── release-notes.js            # Release notes generator
│   └── icons/                          # Icon scripts
│       ├── build-icons.js              # Main orchestrator
│       ├── optimize-svg.js             # SVGO + validation
│       ├── generate-react.js           # React TSX generation
│       ├── compile-react.js            # TypeScript compilation
│       ├── generate-android.js         # Android XML
│       ├── generate-flutter.js         # Flutter TTF + Dart
│       └── generate-ios.js             # iOS xcassets
│
├── 📁 build-config/
│   ├── tokens/
│   │   └── style-dictionary.config.js  # Token transforms
│   ├── icons/
│   │   ├── svgo.config.js              # SVG optimization
│   │   └── tsconfig.json               # React TypeScript config
│   ├── stencil/
│   │   ├── stencil.config.ts           # Stencil Web Components config
│   │   └── tsconfig.json               # Stencil TypeScript config
│   └── storybook/
│       ├── main.ts                     # Storybook configuration
│       ├── preview.ts                  # Decorators, globalTypes
│       ├── manager.ts                  # Custom BILD UI themes
│       ├── preview-head.html           # CSS imports
│       └── preview-body.html           # Dark mode sync
│
├── 📁 tokens/                          # Preprocessed (Git tracked)
├── 📁 dist/                            # Build output (Git ignored)
│
├── 📄 package.json                     # Token package config
├── 📄 package.icons.json               # Icon package config
│
├── 📁 docs/                            # Platform documentation
│   ├── css.md                          # CSS Custom Properties
│   ├── js.md                           # JavaScript/React
│   ├── android.md                      # Android Compose
│   └── ios.md                          # iOS SwiftUI
│
├── 📄 README.md                        # 👈 This file
├── 📄 README.tokens.md                 # Token documentation
└── 📄 README.icons.md                  # Icon documentation
```

---

## ⚙️ Build Commands

### 🎨 Tokens

```bash
npm run build              # Full build (preprocess + tokens + bundles)
npm run preprocess         # Figma JSON → Style Dictionary format
npm run build:tokens       # Style Dictionary → 7 platforms
npm run build:bundles      # Generate convenience bundles
npm run clean              # Remove dist/ and tokens/
```

### 🧩 Stencil Components

```bash
npm run build:stencil      # Build Stencil Web Components
npm run dev:stencil        # Dev server with hot reload (port 3333)
npm run build:all          # Full build (tokens + bundles + stencil)
```

### 📚 Storybook

```bash
npm run storybook          # Start Storybook dev server (port 6006)
npm run build:storybook    # Build static Storybook for deployment
```

### 🖼️ Icons

```bash
npm run build:icons        # Full build (all platforms)
npm run build:icons:svg    # SVG optimization only
npm run build:icons:react  # React components only
npm run build:icons:android
npm run build:icons:flutter
npm run build:icons:ios
npm run clean:icons        # Remove dist/icons/
```

---

## 🔄 CI/CD Workflows

### 🎨 Token Workflows

| Workflow | Trigger | Action |
|----------|---------|--------|
| `build-tokens.yml` | Push to main/develop/claude/** | Build + upload artifacts |
| `auto-pr-from-figma.yml` | Push to `figma-tokens` | Create/update PR |
| `publish-on-merge.yml` | Merge to main | npm publish + GitHub Release |

### 🖼️ Icon Workflows

| Workflow | Trigger | Action |
|----------|---------|--------|
| `build-icons.yml` | Push to main/develop/claude/** | Build + upload artifacts |
| `auto-pr-from-figma-icons.yml` | Push to `figma-icons` | Create/update PR |
| `publish-icons-on-merge.yml` | Merge to main | npm publish + GitHub Release |

### Why dist/ is NOT in Git

- ✅ No merge conflicts (~970 generated files)
- ✅ Clean Git history (only source files)
- ✅ PR review via CI artifacts (30 days retention)
- ✅ Deterministic builds
- ✅ Smaller repo size

---

## 📊 Platform Support

### 🎨 Token Platforms

| Platform | Format | Files | Status |
|----------|--------|-------|--------|
| CSS | Custom Properties | `dist/css/**/*.css` | ✅ Production |
| SCSS | Variables | `dist/scss/**/*.scss` | ✅ Production |
| JavaScript | ES Modules + React | `dist/js/**/*.js` | ✅ Production |
| JSON | Raw Data | `dist/json/**/*.json` | ✅ Production |
| iOS Swift | SwiftUI Color, CGFloat | `dist/ios/**/*.swift` | ✅ Production |
| Android | Jetpack Compose (Kotlin) | `dist/android/compose/**/*.kt` | ✅ Production |

### 🖼️ Icon Platforms

| Platform | Format | Files | Status |
|----------|--------|-------|--------|
| SVG | Optimized | `dist/icons/svg/*.svg` | ✅ Production |
| React | ESM + TypeScript | `dist/icons/react/*.js` + `.d.ts` | ✅ Production |
| Android | Vector Drawable | `dist/icons/android/drawable/*.xml` | ✅ Production |
| Flutter | TTF + Dart | `dist/icons/flutter/` | ✅ Production |
| iOS | Asset Catalog | `dist/icons/ios/*.xcassets` | ✅ Production |

---

## 📚 Storybook

Storybook provides an interactive component development environment with the **4-axis design token architecture** fully integrated.

### Features

- **4-Axis Token Controls**: Switch between Color Brand, Content Brand, Theme, and Density via toolbar
- **Dark Mode Integration**: Unified dark mode toggle syncs both Storybook UI and component preview
- **Custom BILD Themes**: Storybook UI styled with BILD Design System colors
- **Web Components Ready**: Full support for Stencil components in stories
- **Styleguide Documentation**: Visual documentation pages for design system foundations

### Styleguide Pages

| Page | Content |
|------|---------|
| **Introduction** | Overview, brand architecture, quick links |
| **Colors** | Color palettes with visual swatches, semantic tokens |
| **Typography** | Font families, weights, text style samples |
| **Spacing** | Spacing scale visualization, density modes |
| **Effects** | Shadow tokens with live previews |

### Quick Start

```bash
npm run storybook    # Start at http://localhost:6006
```

### Writing Stories

```tsx
// src/components/ds-button/ds-button.stories.ts
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Components/Button',
  tags: ['autodocs'],
  render: (args) => html`<ds-button variant=${args.variant}>${args.label}</ds-button>`,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost'] },
  },
};
export default meta;

export const Primary: StoryObj = {
  args: { variant: 'primary', label: 'Click me' },
};
```

### Configuration

| File | Purpose |
|------|---------|
| `build-config/storybook/main.ts` | Addons, framework, static dirs |
| `build-config/storybook/preview.ts` | Decorators, globalTypes, parameters |
| `build-config/storybook/manager.ts` | Custom BILD UI themes |
| `build-config/storybook/preview-head.html` | CSS imports, initial data attributes |
| `build-config/storybook/preview-body.html` | Dark mode sync script |

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [📖 README.tokens.md](./README.tokens.md) | Complete token pipeline documentation |
| [📖 docs/js.md](./docs/js.md) | JavaScript/React integration (Dual-Axis) |
| [📖 README.icons.md](./README.icons.md) | Complete icon pipeline documentation |
| [📖 docs/android.md](./docs/android.md) | Android Jetpack Compose (Dual-Axis) |
| [📖 docs/ios.md](./docs/ios.md) | iOS SwiftUI (Dual-Axis) |
| [📖 docs/css.md](./docs/css.md) | CSS Custom Properties & Web Components |

### Quick Links

**Tokens:**
- [Platform Usage Examples](./README.tokens.md#-platform-usage)
- [Transform Reference](./README.tokens.md#-token-transform-reference)
- [Figma Integration](./README.tokens.md#-figma-integration--dependencies)
- [Troubleshooting](./README.tokens.md#-troubleshooting)

**JavaScript/React:**
- [Quick Start](./docs/js.md#quick-start)
- [React ThemeProvider](./docs/js.md#react-themeprovider)
- [Token Type Mapping](./docs/js.md#token-type-mapping)
- [Multi-Brand Apps](./docs/js.md#multi-brand-apps)

**Icons:**
- [Platform Usage Examples](./README.icons.md#usage)
- [Naming Conventions](./README.icons.md#naming-conventions)
- [Accessibility](./README.icons.md#accessibility)
- [SVG Requirements](./README.icons.md#svg-requirements)

---

## 🤝 Contributing

> **⚠️ IMPORTANT: Figma is the Single Source of Truth**
>
> Design assets (tokens and icons) must **NOT** be edited directly in the repository.
> All changes must be made in Figma and exported via the **TokenSync Plugin**.

### Allowed Workflow

```
1. Make changes in Figma
2. Export with TokenSync Plugin
3. Automatic PR is created
4. Review and merge PR
```

### NOT Allowed

- ❌ Direct changes to `src/design-tokens/*.json`
- ❌ Direct changes to `src/icons/*.svg`
- ❌ Manual commits to `figma-tokens` or `figma-icons` branch
- ❌ Changes to generated files in `dist/`

### Allowed (Pipeline Development)

- ✅ Changes to build scripts (`scripts/`)
- ✅ Changes to configuration (`build-config/`)
- ✅ Workflow adjustments (`.github/workflows/`)
- ✅ Documentation

For pipeline changes:
```bash
npm run build && npm run build:icons
```

---

## 📄 License

MIT License - See [LICENSE](./LICENSE) file.

---

## 🔗 Resources

- [Style Dictionary Documentation](https://styledictionary.com/)
- [SVGO Documentation](https://svgo.dev/)
- [Figma Variables API](https://www.figma.com/plugin-docs/api/properties/figma-variables/)
- [Repository Issues](https://github.com/UXWizard25/vv-token-test-v3/issues)

---

**Built with ❤️ for the BILD Design System**

| Tokens | Icons |
|--------|-------|
| ~970 files | 5 platforms |
| 6 platforms (incl. Compose) | TypeScript support |
| 3 brands | Accessibility ready |
