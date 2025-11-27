# BILD Design Ops Pipeline

> **Important:** This pipeline is under active development. Generated packages are for testing purposes only.

A comprehensive design operations pipeline for the BILD Design System. Transforms Figma exports into production-ready assets across multiple platforms.

[![Build Tokens](https://github.com/UXWizard25/vv-token-test-v3/workflows/Build%20Design%20Tokens/badge.svg)](https://github.com/UXWizard25/vv-token-test-v3/actions)
[![Build Icons](https://github.com/UXWizard25/vv-token-test-v3/workflows/Build%20Icons/badge.svg)](https://github.com/UXWizard25/vv-token-test-v3/actions)

## Packages

| Package | Description | npm |
|---------|-------------|-----|
| **[@marioschmidt/design-system-tokens](./README.tokens.md)** | Design tokens for 7 platforms | [![npm](https://img.shields.io/npm/v/@marioschmidt/design-system-tokens.svg)](https://www.npmjs.com/package/@marioschmidt/design-system-tokens) |
| **[@marioschmidt/design-system-icons](./README.icons.md)** | Multi-platform icon assets | [![npm](https://img.shields.io/npm/v/@marioschmidt/design-system-icons.svg)](https://www.npmjs.com/package/@marioschmidt/design-system-icons) |

## Architecture

```
                    BILD Design Ops Pipeline
                             |
          ┌──────────────────┴──────────────────┐
          |                                      |
    Token Pipeline                        Icon Pipeline
          |                                      |
    ┌─────┴─────┐                        ┌──────┴──────┐
    |           |                        |             |
  Figma     Style                      Figma        SVGO
Variables   Dictionary                 Icons          |
    |           |                        |       ┌────┴────┐
    ▼           ▼                        ▼       |    |    |
┌─────────────────────┐            ┌─────────────────────────┐
|  7 Platforms        |            |  5 Platforms            |
|  CSS, SCSS, JS,     |            |  SVG, React, Android,   |
|  iOS, Android,      |            |  Flutter, iOS           |
|  Flutter, JSON      |            |                         |
└─────────────────────┘            └─────────────────────────┘
          |                                      |
          ▼                                      ▼
@marioschmidt/                        @marioschmidt/
design-system-tokens                  design-system-icons
```

## Quick Start

### Installation

```bash
# Design Tokens
npm install @marioschmidt/design-system-tokens

# Icons
npm install @marioschmidt/design-system-icons
```

### Usage Examples

#### Tokens

```css
/* CSS */
@import '@marioschmidt/design-system-tokens/css/brands/bild/semantic/color/colormode-light.css';

.button {
  background-color: var(--text-color-accent-constant);
  padding: var(--space2x);
}
```

```javascript
// JavaScript
import { textColorPrimary } from '@marioschmidt/design-system-tokens/js/brands/bild/semantic/color/colormode-light';
```

#### Icons

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

## Project Structure

```
vv-token-test-v3/
├── src/
│   ├── design-tokens/           # Figma token export
│   │   └── bild-design-system-raw-data.json
│   └── icons/                   # Figma icon export
│       ├── icon-*.svg
│       └── .codepoints.json     # Flutter codepoint registry
│
├── scripts/
│   ├── preprocess-*.js          # Token preprocessing
│   ├── build-*.js               # Token build scripts
│   └── icons/                   # Icon build scripts
│       ├── build-icons.js
│       ├── optimize-svg.js
│       ├── generate-react.js
│       ├── compile-react.js     # TypeScript compilation
│       ├── generate-android.js
│       ├── generate-flutter.js
│       └── generate-ios.js
│
├── build-config/
│   ├── style-dictionary.config.js
│   └── icons/
│       └── svgo.config.js
│
├── tokens/                      # Preprocessed tokens (Git tracked)
├── dist/                        # Build output (Git ignored)
│
├── package.json                 # Token package config
├── package.icons.json           # Icon package config
│
├── README.md                    # This file
├── README.tokens.md             # Token documentation
└── README.icons.md              # Icon documentation
```

## Build Commands

### Tokens

```bash
npm run build              # Full token build
npm run preprocess         # Figma JSON → Style Dictionary
npm run build:tokens       # Style Dictionary → 7 platforms
npm run build:bundles      # Generate CSS bundles
```

### Icons

```bash
npm run build:icons        # Full icon build (all platforms)
npm run build:icons:svg    # SVG optimization only
npm run build:icons:react  # React components only
npm run build:icons:android
npm run build:icons:flutter
npm run build:icons:ios
```

## CI/CD Workflows

### Token Workflows

| Workflow | Trigger | Action |
|----------|---------|--------|
| `build-tokens.yml` | Push to main/develop/claude/** | Build + artifacts |
| `auto-pr-from-figma.yml` | Push to `figma-tokens` | Create PR |
| `publish-on-merge.yml` | Merge to main | npm publish |

### Icon Workflows

| Workflow | Trigger | Action |
|----------|---------|--------|
| `build-icons.yml` | Push to main/develop/claude/** | Build + artifacts |
| `auto-pr-from-figma-icons.yml` | Push to `figma-icons` | Create PR |
| `publish-icons-on-merge.yml` | Merge to main | npm publish |

## Figma Integration

Both pipelines integrate with Figma via custom plugins:

| Branch | Source | Plugin |
|--------|--------|--------|
| `figma-tokens` | Figma Variables | TokenSync Plugin |
| `figma-icons` | Figma Icons | BILD Icons Plugin |

**Workflow:**
1. Designer exports from Figma
2. Plugin pushes to dedicated branch
3. CI builds and creates PR
4. Review and merge
5. Automatic npm publish

## Documentation

- **[Token Documentation](./README.tokens.md)** - Detailed token pipeline documentation
  - Platform outputs (CSS, SCSS, JS, iOS, Android, Flutter, JSON)
  - Transform reference tables
  - Figma integration guide
  - Troubleshooting

- **[Icon Documentation](./README.icons.md)** - Detailed icon pipeline documentation
  - Platform outputs (SVG, React, Android, Flutter, iOS)
  - Naming conventions
  - Accessibility guidelines
  - Codepoint stability (Flutter)

## Platform Support

### Tokens

| Platform | Format | Status |
|----------|--------|--------|
| CSS | Custom Properties | Production |
| SCSS | Variables | Production |
| JavaScript | ES6 Modules | Production |
| JSON | Structured Data | Production |
| iOS Swift | UIColor, CGFloat | Production |
| Android | XML Resources | Production |
| Flutter | Dart Classes | Production |

### Icons

| Platform | Format | Status |
|----------|--------|--------|
| SVG | Optimized | Production |
| React | ESM + TypeScript | Production |
| Android | Vector Drawable | Production |
| Flutter | TTF + Dart | Production |
| iOS | Asset Catalog + Swift | Production |

## Build Statistics

| Metric | Tokens | Icons |
|--------|--------|-------|
| Platforms | 7 | 5 |
| Brands | 3 | 1 |
| Files Generated | ~970 | Variable |
| Build Time | ~5s | ~4s |

## Contributing

1. Create feature branch from `main`
2. Make changes
3. Run build: `npm run build && npm run build:icons`
4. Create PR
5. Wait for CI checks

## License

UNLICENSED - Internal use only.

---

**Built for the BILD Design System**
