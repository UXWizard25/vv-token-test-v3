# 🎨 BILD Design Ops Pipeline

> **⚠️ IMPORTANT NOTICE**
>
> This pipeline is under active development. Generated packages are for **testing purposes only**.

A comprehensive design operations pipeline for the BILD Design System. Transforms Figma exports into production-ready assets across multiple platforms using the **CodeBridge Plugin**.

[![Build Tokens](https://github.com/UXWizard25/vv-token-test-v3/workflows/Build%20Design%20Tokens/badge.svg)](https://github.com/UXWizard25/vv-token-test-v3/actions)
[![Build Icons](https://github.com/UXWizard25/vv-token-test-v3/workflows/Build%20Icons/badge.svg)](https://github.com/UXWizard25/vv-token-test-v3/actions)
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
| **🖼️ Icon Pipeline** | Figma Icons (SVG) | Multi-format Icons | React, iOS, Android, Flutter |
| **🧩 Component Pipeline** | Stencil Source | Web Components | All browsers (Shadow DOM) |

Both pipelines use the **CodeBridge Figma Plugin** for automated exports.

---

## 📦 Packages

| Package | Description | Documentation |
|---------|-------------|---------------|
| **@marioschmidt/design-system-tokens** | Multi-platform design tokens (CSS, JS, iOS, Android) | [📖 README](./packages/tokens/README.md) |
| **@marioschmidt/design-system-icons** | Multi-platform icon assets (React, iOS, Android, Flutter) | [📖 README](./packages/icons/README.md) |
| **@marioschmidt/design-system-components** | Stencil Web Components | [📖 README](./packages/components/README.md) |
| **@marioschmidt/design-system-react** | React wrapper components | [📖 README](./packages/react/README.md) |
| **@marioschmidt/design-system-vue** | Vue 3 wrapper components | [📖 README](./packages/vue/README.md) |

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
│                             │    │  • generate-flutter.js      │
│                             │    │  • generate-ios.js          │
└──────────────┬──────────────┘    └──────────────┬──────────────┘
               │                                  │
               ▼                                  ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  📦 MONOREPO (npm workspaces)                                                │
│                                                                              │
│  packages/                                                                   │
│  ├── tokens/                    ├── icons/                                   │
│  │   └── dist/                  │   └── dist/                                │
│  │       ├── css/               │       ├── svg/                             │
│  │       ├── scss/              │       ├── react/                           │
│  │       ├── js/                │       ├── android/                         │
│  │       ├── ios/               │       ├── flutter/                         │
│  │       └── android/           │       └── ios/                             │
│  │                              │                                            │
│  └── components/                                                             │
│      └── dist/                  ← Stencil Web Components                     │
│                                                                              │
└──────────────┬───────────────────────────────────┬───────────────────────────┘
               │                                   │
               │  npm publish                      │  npm publish
               │                                   │
               ▼                                   ▼
┌─────────────────────────────┐    ┌─────────────────────────────┐
│  📦 @marioschmidt/          │    │  📦 @marioschmidt/          │
│     design-system-tokens    │    │     design-system-icons     │
└─────────────────────────────┘    └─────────────────────────────┘
                              │
                              ▼
               ┌─────────────────────────────┐
               │  📦 @marioschmidt/          │
               │     design-system-components│
               └─────────────────────────────┘
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

```bash
# Design Tokens
npm install @marioschmidt/design-system-tokens

# Icons
npm install @marioschmidt/design-system-icons

# Web Components (Vanilla JS)
npm install @marioschmidt/design-system-components

# React Wrappers
npm install @marioschmidt/design-system-react

# Vue 3 Wrappers
npm install @marioschmidt/design-system-vue
```

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
import { Add, Search } from '@marioschmidt/design-system-icons';

<Add size={24} aria-label="Add item" />
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
vv-token-test-v3/
│
├── 📦 packages/
│   ├── tokens/                    # @marioschmidt/design-system-tokens
│   │   ├── src/                   # Figma export (bild-design-system-raw-data.json)
│   │   ├── docs/                  # Platform guides (css, js, ios, android)
│   │   ├── dist/                  # Built outputs (css, scss, js, ios, android)
│   │   ├── README.md
│   │   └── package.json
│   │
│   ├── icons/                     # @marioschmidt/design-system-icons
│   │   ├── src/                   # Figma SVG export + .codepoints.json
│   │   ├── dist/                  # Built outputs (svg, react, ios, android, flutter)
│   │   ├── README.md
│   │   └── package.json
│   │
│   ├── components/                # @marioschmidt/design-system-components
│   │   ├── src/                   # Stencil components (ds-button, ds-card)
│   │   │   ├── ds-button/
│   │   │   └── ds-card/
│   │   ├── docs/                  # Storybook MDX pages (intro, colors, typography, etc.)
│   │   ├── dist/                  # Built Stencil output
│   │   ├── README.md
│   │   └── package.json
│   │
│   ├── react/                     # @marioschmidt/design-system-react
│   │   ├── src/                   # Auto-generated React wrappers
│   │   ├── dist/                  # Built output
│   │   ├── README.md
│   │   └── package.json
│   │
│   └── vue/                       # @marioschmidt/design-system-vue
│       ├── src/                   # Auto-generated Vue wrappers
│       ├── dist/                  # Built output
│       ├── README.md
│       └── package.json
│
├── 🔧 scripts/
│   ├── tokens/                    # Token build scripts
│   │   ├── preprocess.js          # Figma JSON → Style Dictionary
│   │   ├── build.js               # Style Dictionary builds + JS optimization
│   │   └── bundles.js             # CSS bundle generation
│   └── icons/                     # Icon build scripts
│       ├── build-icons.js         # Main orchestrator
│       ├── optimize-svg.js        # SVGO optimization
│       ├── generate-react.js      # React TSX generation
│       ├── generate-android.js    # Android Vector Drawables
│       ├── generate-flutter.js    # Flutter TTF + Dart
│       └── generate-ios.js        # iOS Asset Catalog
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
npm run publish:icons
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
| `publish-icons-on-merge.yml` | Merge to main (icons src) | npm publish + GitHub Release |

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
- Stencil component development (`packages/components/src/`)

### ❌ Not Allowed

- Direct changes to `packages/tokens/src/*.json`
- Direct changes to `packages/icons/src/*.svg`
- Manual commits to `figma-tokens` or `figma-icons` branch

---

## 📄 License

MIT

---

**Built with ❤️ for the BILD Design System**
