# 🎨 BILD Design Ops Pipeline

> **⚠️ IMPORTANT NOTICE**
>
> This pipeline is under active development. Generated packages are for **testing purposes only**.

A comprehensive design operations pipeline for the BILD Design System. Transforms Figma exports into production-ready assets across multiple platforms using the **CodeBridge Plugin**.

[![Build Tokens](https://github.com/UXWizard25/bild-design-system/workflows/Build%20Design%20Tokens/badge.svg)](https://github.com/UXWizard25/bild-design-system/actions)
[![Build Icons](https://github.com/UXWizard25/bild-design-system/workflows/Build%20Icons/badge.svg)](https://github.com/UXWizard25/bild-design-system/actions)
[![npm tokens](https://img.shields.io/npm/v/@marioschmidt/design-system-tokens.svg?label=tokens)](https://www.npmjs.com/package/@marioschmidt/design-system-tokens)
[![npm icons](https://img.shields.io/npm/v/@marioschmidt/design-system-icons.svg?label=icons)](https://www.npmjs.com/package/@marioschmidt/design-system-icons)
[![npm components](https://img.shields.io/npm/v/@marioschmidt/design-system-components.svg?label=components)](https://www.npmjs.com/package/@marioschmidt/design-system-components)
[![npm react](https://img.shields.io/npm/v/@marioschmidt/design-system-react.svg?label=react)](https://www.npmjs.com/package/@marioschmidt/design-system-react)
[![npm vue](https://img.shields.io/npm/v/@marioschmidt/design-system-vue.svg?label=vue)](https://www.npmjs.com/package/@marioschmidt/design-system-vue)

---

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [📦 Packages](#-packages)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [⚙️ Build Commands](#️-build-commands)
- [🔄 CI/CD Workflows](#-cicd-workflows)
- [📚 Storybook](#-storybook)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Overview

The BILD Design Ops Pipeline transforms design assets from Figma into production-ready code for multiple platforms. It consists of two independent sub-pipelines:

| Pipeline | Input | Output | Platforms |
|----------|-------|--------|-----------|
| **🎨 Token Pipeline** | Figma Variables | Design Tokens | Web (CSS, SCSS, JS), iOS, Android |
| **🖼️ Icon Pipeline** | Figma Icons (SVG) | Multi-format Icons | React, iOS, Android |
| **🧩 Component Pipeline** | Stencil Source | Web Components | All browsers (Shadow DOM) |

Both pipelines use the **CodeBridge Figma Plugin** for automated exports.

---

## 📦 Packages

### Design Tokens

| Package | Registry | Description | Documentation |
|---------|----------|-------------|---------------|
| **@marioschmidt/design-system-tokens** | npm | Web tokens (CSS, JS, SCSS, JSON) | [📖 README](./packages/tokens/README.md) |
| **BildDesignTokens** | SPM (GitHub) | iOS/macOS SwiftUI tokens | [📖 README](./packages/tokens-ios/README.md) |
| **de.bild.design:tokens** | Maven (GitHub Packages) | Android Jetpack Compose tokens | [📖 README](./packages/tokens-android/README.md) |

### Icons

| Package | Registry | Description | Documentation |
|---------|----------|-------------|---------------|
| **@marioschmidt/design-system-icons** | npm | Optimized SVG icons | [📖 README](./packages/icons/svg/README.md) |
| **@marioschmidt/design-system-icons-react** | npm | React icon components | [📖 README](./packages/icons/react/README.md) |
| **de.bild.design:icons** | Maven | Android Vector Drawables | [📖 README](./packages/icons/android/README.md) |
| **BildIcons** | SPM | iOS Swift Package | [📖 README](./packages/icons/ios/README.md) |

### Components

| Package | Registry | Description | Documentation |
|---------|----------|-------------|---------------|
| **@marioschmidt/design-system-components** | npm | Stencil Web Components | [📖 README](./packages/components/core/README.md) |
| **@marioschmidt/design-system-react** | npm | React wrapper components | [📖 README](./packages/components/react/README.md) |
| **@marioschmidt/design-system-vue** | npm | Vue 3 wrapper components | [📖 README](./packages/components/vue/README.md) |

### 📚 Platform Documentation

| Platform | Documentation |
|----------|---------------|
| CSS/Web | [packages/tokens/docs/css.md](./packages/tokens/docs/css.md) |
| JavaScript/React | [packages/tokens/docs/js.md](./packages/tokens/docs/js.md) |
| Android Compose | [packages/tokens/docs/android.md](./packages/tokens/docs/android.md) |
| iOS SwiftUI | [packages/tokens/docs/ios.md](./packages/tokens/docs/ios.md) |

---

## 🏗️ Architecture

### High-Level Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FIGMA                                          │
│  ┌─────────────────────┐              ┌─────────────────────┐              │
│  │  📊 Variables       │              │  🖼️ Icons           │              │
│  │  (Design Tokens)    │              │  (SVG Assets)       │              │
│  └──────────┬──────────┘              └──────────┬──────────┘              │
└─────────────┼───────────────────────────────────┼──────────────────────────┘
              │                                   │
              │  CodeBridge Plugin                │  CodeBridge Plugin
              │                                   │
              ▼                                   ▼
┌─────────────────────────────┐    ┌─────────────────────────────┐
│  📁 figma-tokens branch     │    │  📁 figma-icons branch      │
│  packages/tokens/src/       │    │  packages/icons/src/        │
└──────────────┬──────────────┘    └──────────────┬──────────────┘
               │                                  │
               │  GitHub Actions                  │  GitHub Actions
               │                                  │
               ▼                                  ▼
┌─────────────────────────────┐    ┌─────────────────────────────┐
│  🔧 TOKEN PIPELINE          │    │  🔧 ICON PIPELINE           │
│  scripts/tokens/            │    │  scripts/icons/             │
│  • preprocess.js            │    │  • optimize-svg.js          │
│  • build.js                 │    │  • generate-react.js        │
│  • bundles.js               │    │  • generate-android.js      │
│                             │    │  • generate-ios.js          │
└──────────────┬──────────────┘    └──────────────┬──────────────┘
               │                                  │
               ▼                                  ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  📦 MONOREPO (npm workspaces)                                                │
│                                                                              │
│  packages/                                                                   │
│  ├── tokens/                    ├── icons/                                   │
│  │   └── dist/                  │   ├── svg/dist/        (npm: SVG)          │
│  │       ├── css/               │   ├── react/dist/      (npm: React)        │
│  │       ├── scss/              │   ├── android/src/     (Maven)             │
│  │       └── js/                │   └── ios/Sources/     (SPM)               │
│  │                              │                                            │
│  ├── tokens-ios/                ├── components/          (Stencil)           │
│  │   └── Sources/   (SPM)       ├── react/               (React wrappers)    │
│  ├── tokens-android/            └── vue/                 (Vue wrappers)      │
│  │   └── src/kotlin/ (Maven)                                                 │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
               │                                   │
               │  Distribution                     │
               ▼                                   ▼
┌─────────────────────────────┐    ┌─────────────────────────────┐
│  📦 TOKENS                  │    │  📦 ICONS                   │
│  npm: design-system-tokens  │    │  npm: design-system-icons   │
│  SPM: BildDesignTokens      │    │       design-system-icons-  │
│  Maven: de.bild.design:     │    │       react                 │
│         tokens              │    │  Maven: de.bild.design:icons│
│                             │    │  SPM: BildIcons             │
│  📦 COMPONENTS              │    │                             │
│  npm: design-system-        │    │                             │
│       components/react/vue  │    │                             │
└─────────────────────────────┘    └─────────────────────────────┘
```

### 🎨 Token Architecture (4 Layers)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAYER 3: Component Tokens                                                   │
│  Button, Card, Teaser, Alert, InputField, Navigation, etc. (~55 components) │
├─────────────────────────────────────────────────────────────────────────────┤
│  LAYER 2: Semantic Tokens                                                    │
│  text-color-primary, surface-color-*, border-color-*, effects               │
├─────────────────────────────────────────────────────────────────────────────┤
│  LAYER 1: Brand Mapping + Density                                            │
│  BrandColorMapping (BILD, SportBILD) + BrandTokenMapping + Density          │
├─────────────────────────────────────────────────────────────────────────────┤
│  LAYER 0: Primitives                                                         │
│  colorprimitive, spaceprimitive, sizeprimitive, fontprimitive               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 🔀 Dual-Axis Architecture

Separates color selection from content selection for flexible theming:

| Axis | Attribute | Values | Controls |
|------|-----------|--------|----------|
| **Color** | `data-color-brand` | `bild`, `sportbild` | Colors & Effects |
| **Content** | `data-content-brand` | `bild`, `sportbild`, `advertorial` | Typography & Spacing |
| **Theme** | `data-theme` | `light`, `dark` | Color Mode |
| **Density** | `data-density` | `default`, `dense`, `spacious` | Spacing Density |

> **Example:** Advertorial content uses BILD/SportBILD colors but has its own typography.
> ```html
> <body data-color-brand="bild" data-content-brand="advertorial" data-theme="light">
> ```

---

## 🚀 Quick Start

### Installation

#### Web (npm)

```bash
# Design Tokens
npm install @marioschmidt/design-system-tokens

# Icons (choose your platform)
npm install @marioschmidt/design-system-icons        # SVG only
npm install @marioschmidt/design-system-icons-react  # React components

# Web Components (Vanilla JS)
npm install @marioschmidt/design-system-components

# React Wrappers
npm install @marioschmidt/design-system-react

# Vue 3 Wrappers
npm install @marioschmidt/design-system-vue
```

#### iOS (Swift Package Manager)

In Xcode: **File → Add Package Dependencies**

```
URL: https://github.com/UXWizard25/bild-design-system.git
Product: BildDesignTokens
```

> ✅ No authentication required (public repository)

#### Android (GitHub Packages Maven)

1. Add repository to `settings.gradle.kts`:

```kotlin
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
        maven {
            url = uri("https://maven.pkg.github.com/UXWizard25/bild-design-system")
            credentials {
                username = properties["gpr.user"]?.toString() ?: ""
                password = properties["gpr.token"]?.toString() ?: ""
            }
        }
    }
}
```

2. Add dependency to `build.gradle.kts`:

```kotlin
implementation("de.bild.design:tokens:1.0.0")
```

3. Configure credentials in `~/.gradle/gradle.properties`:

```properties
gpr.user=YOUR_GITHUB_USERNAME
gpr.token=YOUR_GITHUB_TOKEN  # needs read:packages scope
```

> ⚠️ GitHub Packages requires authentication even for public repos

### Usage Examples

```css
/* CSS */
@import '@marioschmidt/design-system-tokens/css/bundles/bild.css';

.button {
  background: var(--button-primary-brand-bg-color-idle);
  color: var(--button-primary-label-color);
}
```

```javascript
// JavaScript
import { createTheme } from '@marioschmidt/design-system-tokens/themes';

const theme = createTheme({ colorBrand: 'bild', colorMode: 'light' });
console.log(theme.colors.textColorPrimary);   // "#232629"
console.log(theme.spacing.gridSpaceRespBase); // "12px"
```

```tsx
// React Icons
import { IconAdd, IconSearch } from '@marioschmidt/design-system-icons-react';

<IconAdd size={24} aria-label="Add item" />
```

```html
<!-- Web Components -->
<body data-color-brand="bild" data-content-brand="bild" data-theme="light">
  <script type="module" src="@marioschmidt/design-system-components/dist/esm/index.js"></script>
  <ds-button variant="primary">Click me</ds-button>
</body>
```

```tsx
// React
import { DsButton, DsCard } from '@marioschmidt/design-system-react';

function App() {
  return (
    <div data-color-brand="bild" data-theme="light">
      <DsButton variant="primary">Click me</DsButton>
      <DsCard cardTitle="Hello">Card content</DsCard>
    </div>
  );
}
```

```vue
<!-- Vue 3 -->
<script setup>
import { DsButton, DsCard } from '@marioschmidt/design-system-vue';
</script>

<template>
  <div data-color-brand="bild" data-theme="light">
    <DsButton variant="primary">Click me</DsButton>
    <DsCard card-title="Hello">Card content</DsCard>
  </div>
</template>
```

➡️ See [Package Documentation](#-packages) for complete usage guides.

---

## 📁 Project Structure

```
bild-design-system/
│
├── 📱 apps/
│   └── docs/                      # @bild/docs (private, Storybook)
│       ├── package.json           # Isolated Storybook dependencies
│       └── stories/
│           └── foundations/       # Auto-generated foundation docs
│               ├── intro.mdx      # Introduction (manual)
│               ├── colors.mdx     # Color tokens (auto-generated)
│               ├── typography.mdx # Typography (auto-generated)
│               ├── spacing.mdx    # Spacing (auto-generated)
│               └── effects.mdx    # Effects (auto-generated)
│
├── 📦 packages/
│   ├── tokens/                    # @marioschmidt/design-system-tokens (npm)
│   │   ├── src/                   # Figma export (bild-design-system-raw-data.json)
│   │   ├── docs/                  # Platform guides (css, js, ios, android)
│   │   ├── dist/                  # Built outputs (css, scss, js, json)
│   │   ├── README.md
│   │   └── package.json
│   │
│   ├── tokens-ios/                # BildDesignTokens (Swift Package Manager)
│   │   ├── Package.swift          # SPM manifest
│   │   ├── Sources/               # Generated Swift files (169 files)
│   │   └── README.md
│   │
│   ├── tokens-android/            # de.bild.design:tokens (Maven/GitHub Packages)
│   │   ├── build.gradle.kts       # Gradle build with Maven publishing
│   │   ├── src/main/kotlin/       # Generated Kotlin files (182 files)
│   │   └── README.md
│   │
│   ├── icons/                     # Icon packages (multi-platform)
│   │   ├── src/                   # Figma SVG export + .codepoints.json
│   │   ├── svg/                   # @marioschmidt/design-system-icons
│   │   │   └── dist/              # Optimized SVG files
│   │   ├── react/                 # @marioschmidt/design-system-icons-react
│   │   │   └── dist/              # React components + TypeScript
│   │   ├── android/               # de.bild.design:icons (Maven)
│   │   │   └── src/main/res/      # Vector Drawables
│   │   ├── ios/                   # BildIcons (Swift Package Manager)
│   │   │   └── Sources/BildIcons/ # Asset Catalog + Swift enum
│   │   └── README.md
│   │
│   └── components/
│       ├── core/                  # @marioschmidt/design-system-components
│       │   ├── src/               # Stencil components (ds-button, ds-card)
│       │   ├── dist/              # Built Stencil output
│       │   └── README.md
│       │
│       ├── react/                 # @marioschmidt/design-system-react
│       │   ├── lib/               # Auto-generated React wrappers
│       │   └── dist/              # Built output
│       │
│       └── vue/                   # @marioschmidt/design-system-vue
│           ├── lib/               # Auto-generated Vue wrappers
│           └── dist/              # Built output
│
├── 🔧 scripts/
│   ├── tokens/                    # Token build scripts
│   │   ├── preprocess.js          # Figma JSON → Style Dictionary
│   │   ├── build.js               # Style Dictionary builds + JS optimization
│   │   └── bundles.js             # CSS bundle generation
│   └── icons/                     # Icon build scripts
│       ├── build-icons.js         # Main orchestrator
│       ├── paths.js               # Centralized path configuration
│       ├── optimize-svg.js        # SVGO optimization
│       ├── generate-react.js      # React TSX generation
│       ├── generate-android.js    # Android Vector Drawables
│       └── generate-ios.js        # iOS Asset Catalog + Swift
│
├── ⚙️ build-config/
│   ├── tokens/                    # style-dictionary.config.js
│   ├── icons/                     # svgo.config.js, svgr.config.js
│   ├── stencil/                   # stencil.config.ts, tsconfig.json
│   └── storybook/                 # main.ts, preview.ts, manager.ts
│
├── 🔄 .github/workflows/
│   ├── build-tokens.yml           # Token build + artifacts
│   ├── build-icons.yml            # Icon build + artifacts
│   ├── auto-pr-from-figma.yml     # Auto-PR for token changes
│   ├── auto-pr-from-figma-icons.yml # Auto-PR for icon changes
│   ├── publish-on-merge.yml       # Publish tokens + components
│   └── publish-icons-on-merge.yml # Publish icons
│
├── README.md                      # This file
└── CLAUDE.md                      # AI assistant context
```

---

## ⚙️ Build Commands

```bash
# Full builds
npm run build              # Tokens + Components
npm run build:all          # Tokens + Icons + Components + React/Vue Wrappers

# Individual builds
npm run build:tokens       # Preprocess + Style Dictionary + Bundles
npm run build:icons        # All icon platforms
npm run build:components   # Stencil Web Components + generate React/Vue wrappers
npm run build:react        # React wrapper package
npm run build:vue          # Vue wrapper package
npm run build:wrappers     # Both React + Vue

# Development
npm run dev:stencil        # Stencil dev server (port 3333)
npm run storybook          # Storybook (port 6006)

# Publishing (via workspace)
npm run publish:tokens
npm run publish:icons           # SVG package
npm run publish:icons:react     # React package
npm run publish:icons:all       # Both icon npm packages
npm run publish:components
npm run publish:react
npm run publish:vue

# Maintenance
npm run clean              # Remove all dist/ and tokens/
```

---

## 🔄 CI/CD Workflows

| Workflow | Trigger | Action |
|----------|---------|--------|
| `build-tokens.yml` | Push to main/develop | Build tokens + components + wrappers, upload artifacts |
| `build-icons.yml` | Push to main/develop | Build icons + upload artifacts |
| `auto-pr-from-figma.yml` | Push to `figma-tokens` | Create/update PR with release notes |
| `auto-pr-from-figma-icons.yml` | Push to `figma-icons` | Create/update PR with release notes |
| `publish-on-merge.yml` | Merge to main (tokens/components src) | npm publish (tokens, components, react, vue) + GitHub Release |
| `publish-icons-on-merge.yml` | Merge to main (icons src) | npm publish (SVG + React) + GitHub Release |

### Release Notes Features

PR comments and release notes include:
- **🔴 Breaking Changes**: Removed tokens grouped by layer
- **🟡 Visual Changes**: Matrix display with ΔE (colors) and % change (dimensions)
- **🟢 Safe Changes**: Added tokens and internal changes
- **Visual Indicators**: ⚪🟢🟡🟠🔴 for change severity

📖 See [.github/workflows/README.md](./.github/workflows/README.md) for detailed documentation.

---

## 📚 Storybook

Interactive component documentation with live theming controls.

```bash
npm run storybook          # Start dev server (port 6006)
npm run build:storybook    # Build static site
```

### Features

- **4-Axis Token Controls**: Color Brand, Content Brand, Theme, Density
- **Dark Mode Toggle**: Synced with design tokens
- **Component Stories**: Button, Card with all variants
- **Styleguide Pages**: Colors, Typography, Spacing, Effects

---

## 🤝 Contributing

> **⚠️ IMPORTANT: Figma is the Single Source of Truth**
>
> Design assets must **NOT** be edited directly in the repository.
> All changes must be made in Figma and exported via the **CodeBridge Plugin**.

### ✅ Allowed

- Changes to build scripts (`scripts/`)
- Configuration changes (`build-config/`)
- Workflow adjustments (`.github/workflows/`)
- Documentation updates
- Stencil component development (`packages/components/core/src/`)

### ❌ Not Allowed

- Direct changes to `packages/tokens/src/*.json`
- Direct changes to `packages/icons/src/*.svg`
- Manual commits to `figma-tokens` or `figma-icons` branch

---

## 📄 License

MIT

---

**Built with ❤️ for the BILD Design System**
