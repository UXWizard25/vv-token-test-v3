# 🌐 CSS - Design System Tokens

> **CSS Custom Properties for Web Applications**
>
> Responsive, multi-brand ready with **Dual-Axis Architecture**.

---

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🔀 Dual-Axis Architecture](#-dual-axis-architecture)
- [📁 File Structure](#-file-structure)
- [📝 Naming Conventions](#-naming-conventions)
- [🏷️ Data Attributes](#️-data-attributes)
- [📦 Bundle Options](#-bundle-options)
- [🎨 Token Categories](#-token-categories)
- [📱 Responsive Tokens](#-responsive-tokens)
- [🎚️ Density Tokens](#️-density-tokens)
- [🧩 Component Tokens](#-component-tokens)
- [✍️ Typography & Effects](#️-typography--effects)
- [💡 Usage Examples](#-usage-examples)
- [📚 Storybook](#-storybook)

---

## 🚀 Quick Start

### 1. HTML Setup

```html
<!DOCTYPE html>
<html data-color-brand="bild" data-content-brand="bild" data-theme="light" data-density="default">
<head>
  <!-- Option A: All-in-one Bundle -->
  <link rel="stylesheet" href="css/bundles/bild.css">

  <!-- Option B: Modular (recommended for optimization) -->
  <link rel="stylesheet" href="css/shared/primitives.css">
  <link rel="stylesheet" href="css/bild/theme.css">
  <link rel="stylesheet" href="css/bild/tokens.css">
  <link rel="stylesheet" href="css/bild/components/button.css">
</head>
<body>
  <!-- Your content -->
</body>
</html>
```

### 2. Use Tokens

```css
.my-component {
  /* Semantic tokens */
  color: var(--text-color-primary);
  background: var(--surface-color-primary);

  /* Spacing tokens */
  padding: var(--grid-space-resp-base);
  gap: var(--stack-space-resp-sm);

  /* Component tokens */
  border-radius: var(--button-border-radius);
}
```

### 3. Switch Themes (JavaScript)

```javascript
// Toggle dark mode
document.documentElement.dataset.theme = 'dark';

// Switch density
document.documentElement.dataset.density = 'dense';

// Switch color brand (colors + effects)
document.documentElement.dataset.colorBrand = 'sportbild';

// Switch content brand (typography + sizing)
document.documentElement.dataset.contentBrand = 'advertorial';
```

---

## 🔀 Dual-Axis Architecture

The CSS output uses a **Dual-Axis Architecture** to separate concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│  data-color-brand          │  data-content-brand               │
│  (ColorBrand Axis)         │  (ContentBrand Axis)              │
├────────────────────────────┼────────────────────────────────────┤
│  Colors                    │  Typography                       │
│  Effects/Shadows           │  Sizing/Spacing                   │
│                            │  Breakpoints                      │
│                            │  Density                          │
├────────────────────────────┼────────────────────────────────────┤
│  Values: bild, sportbild   │  Values: bild, sportbild,         │
│                            │          advertorial              │
└────────────────────────────┴────────────────────────────────────┘
```

### Why Dual-Axis?

**Advertorial** content needs its own typography and sizing but should inherit colors from the parent brand (BILD or SportBILD). The Dual-Axis architecture enables this:

```html
<!-- Advertorial in BILD context -->
<html data-color-brand="bild" data-theme="light">
  <article data-content-brand="advertorial">
    <!-- Uses BILD colors + Advertorial typography -->
  </article>
</html>

<!-- Advertorial in SportBILD context -->
<html data-color-brand="sportbild" data-theme="dark">
  <article data-content-brand="advertorial">
    <!-- Uses SportBILD colors + Advertorial typography -->
  </article>
</html>
```

---

## 📁 File Structure

```
dist/css/
├── shared/
│   └── primitives.css        # Color, Space, Size, Font primitives
│
├── bundles/                   # All-in-one bundles per brand
│   ├── bild.css              # (~122 KB)
│   ├── sportbild.css         # (~124 KB)
│   └── advertorial.css       # (~81 KB)
│
├── bild/                      # Modular files
│   ├── theme.css             # Semantic colors + Effects (light/dark)
│   ├── tokens.css            # Breakpoints + Typography + Density
│   └── components/           # Component-specific tokens
│       ├── button.css
│       ├── article.css
│       ├── teaser.css
│       └── ... (52 components)
│
├── sportbild/                 # Same structure as bild
│   └── ...
│
└── advertorial/               # ContentBrand only (no theme.css content)
    ├── theme.css             # Empty (inherits from ColorBrand)
    ├── tokens.css            # Typography + Breakpoints
    └── components/           # 39 components
```

---

## 📝 Naming Conventions

CSS tokens use **kebab-case** with hyphen separation before AND after numbers:

| Token Type | Example | Pattern |
|------------|---------|---------|
| Spacing | `--space-1-x`, `--space-2-x` | Numbers separated by hyphens |
| Decimal spacing | `--space-0-p-5-x`, `--space-1-p-25-x` | Decimals use `p` for point |
| Colors | `--color-bild-red-50`, `--alpha-red-50-a-80` | Numbers and suffixes separated |
| Typography | `.display-1`, `.headline-2` | Class names with hyphen before number |
| Effects | `.shadow-soft-sm`, `.shadow-hard-md` | Size abbreviations in lowercase |

> **Note:** This ensures consistency and readability. The build system normalizes any Figma input format to this convention.

---

## 🏷️ Data Attributes

### Required Attributes

| Attribute | Values | Axis | Description |
|-----------|--------|------|-------------|
| `data-color-brand` | `bild`, `sportbild` | ColorBrand | Colors + Effects |
| `data-content-brand` | `bild`, `sportbild`, `advertorial` | ContentBrand | Typography + Sizing |
| `data-theme` | `light`, `dark` | - | Color mode |
| `data-density` | `default`, `dense`, `spacious` | - | Spacing density |

### Selector Patterns

```css
/* ColorBrand Axis (colors + effects) */
[data-color-brand="bild"][data-theme="light"] { --text-color-primary: ...; }
[data-color-brand="bild"][data-theme="dark"] { --text-color-primary: ...; }
[data-color-brand="bild"][data-theme="light"] .shadow-soft-md { box-shadow: ...; }

/* ContentBrand Axis (typography + sizing) */
[data-content-brand="bild"] { --grid-space-resp-base: ...; }
[data-content-brand="bild"] { .headline-1 { font-family: ...; } }

/* ContentBrand + Density */
[data-content-brand="bild"][data-density="default"] { ... }
[data-content-brand="bild"][data-density="dense"] { ... }

/* ContentBrand + Breakpoints */
@media (min-width: 600px) {
  [data-content-brand="bild"] { ... }
}
```

---

## 📦 Bundle Options

### Option A: All-in-One Bundle

Best for: Simple projects, quick prototyping.

```html
<link rel="stylesheet" href="css/bundles/bild.css">
```

Contains: Primitives + Theme + Tokens + All Components (~122 KB)

### Option B: Modular Loading

Best for: Production, optimal bundle size.

```html
<!-- Core (always needed) -->
<link rel="stylesheet" href="css/shared/primitives.css">
<link rel="stylesheet" href="css/bild/theme.css">
<link rel="stylesheet" href="css/bild/tokens.css">

<!-- Only components you use -->
<link rel="stylesheet" href="css/bild/components/button.css">
<link rel="stylesheet" href="css/bild/components/teaser.css">
```

### Option C: Theme + Tokens Only

Best for: Using only semantic tokens, no component tokens.

```html
<link rel="stylesheet" href="css/shared/primitives.css">
<link rel="stylesheet" href="css/bild/theme.css">
<link rel="stylesheet" href="css/bild/tokens.css">
```

---

## 🎨 Token Categories

### 1. Primitives (shared/primitives.css)

Raw design values, brand-independent.

```css
:root {
  /* Colors */
  --color-bild-red-50: #DD0000;
  --color-neutral-15: #232629;
  --color-neutral-100: #FFFFFF;

  /* Spacing (note: numbers are hyphen-separated) */
  --space-1-x: 8px;
  --space-2-x: 16px;
  --space-3-x: 24px;

  /* Sizes */
  --size-4-x: 32px;
  --size-6-x: 48px;

  /* Fonts */
  --font-family-gotham-xnarrow: Gotham XNarrow;
  --font-weight-bold: 700;
}
```

### 2. Semantic Tokens (theme.css)

Meaningful design intent, theme-aware. Uses **ColorBrand** axis.

```css
[data-color-brand="bild"][data-theme="light"] {
  /* Text */
  --text-color-primary: var(--color-neutral-15, #232629);
  --text-color-accent: var(--color-bild-red-50, #DD0000);

  /* Surfaces */
  --surface-color-primary: var(--color-neutral-100, #FFFFFF);
  --surface-color-secondary: var(--color-neutral-96, #F2F4F5);

  /* Borders */
  --border-color-medium-contrast: var(--color-neutral-85, #CED4DA);

  /* Core */
  --core-color-primary: var(--color-bild-red-50, #DD0000);
}
```

### 3. Responsive Tokens (tokens.css)

Breakpoint-aware sizing and typography. Uses **ContentBrand** axis.

```css
/* Base (mobile-first) */
[data-content-brand="bild"] {
  --headline-1-font-size: 48px;
  --grid-space-resp-base: var(--space-1-p-5-x, 12px);
}

/* Tablet (600px+) */
@media (min-width: 600px) {
  [data-content-brand="bild"] {
    --headline-1-font-size: 72px;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  [data-content-brand="bild"] {
    --headline-1-font-size: 100px;
    --grid-space-resp-base: var(--space-2-x, 16px);
  }
}
```

### 4. Component Tokens (components/*.css)

Component-specific design decisions. Uses both axes.

```css
/* Colors → ColorBrand Axis */
[data-color-brand="bild"][data-theme="light"] {
  --button-primary-brand-bg-color-idle: var(--color-bild-red-50, #DD0000);
  --button-primary-label-color: var(--color-neutral-100, #FFFFFF);
}

/* Density → ContentBrand Axis */
[data-content-brand="bild"][data-density="default"] {
  --density-button-inline-space: var(--space-2-p-5-x, 20px);
  --density-button-label-font-size: 17px;
}

/* Sizing → ContentBrand Axis */
[data-content-brand="bild"] {
  --button-border-radius: var(--border-radius-md);
  --button-border-width-size: var(--border-width-thick);
}
```

---

## 📱 Responsive Tokens

### Breakpoints

| Breakpoint | Min-Width | Device Class |
|------------|-----------|--------------|
| `xs` | 320px | Mobile (base) |
| `sm` | 390px | Large mobile |
| `md` | 600px | Tablet |
| `lg` | 1024px | Desktop |

### Cascade Optimization

Tokens only appear in media queries when values change:

```css
/* Base value */
[data-content-brand="bild"] {
  --article-headline-font-size: var(--headline-2-font-size);  /* xs: 40px */
}

/* Changes at md */
@media (min-width: 600px) {
  [data-content-brand="bild"] {
    --article-headline-font-size: var(--headline-1-font-size);  /* md: 72px */
  }
}

/* lg inherits from md (no redundant declaration) */
```

---

## 🎚️ Density Tokens

Density tokens control spacing intensity across three modes: `default`, `dense`, and `spacious`.

### Semantic Density (tokens.css)

Semantic density tokens are included in `tokens.css` and define responsive spacing values:

```css
/* Constant spacing (no breakpoint dependency) */
[data-content-brand="bild"][data-density="default"] {
  --density-stack-space-const-3-xs: var(--space-0-p-25-x, 2px);
  --density-stack-space-const-sm: var(--space-1-x, 8px);
  --density-stack-space-const-lg: var(--space-2-x, 16px);
}

/* Responsive spacing (breakpoint × density) */
[data-content-brand="bild"][data-density="default"] {
  --density-xs-stack-space-resp-sm: var(--space-1-x, 8px);
  --density-xs-stack-space-resp-md: var(--space-1-p-5-x, 12px);
}

@media (min-width: 600px) {
  [data-content-brand="bild"][data-density="default"] {
    --density-md-stack-space-resp-sm: var(--space-1-p-5-x, 12px);
    --density-md-stack-space-resp-md: var(--space-2-x, 16px);
  }
}
```

### Alias Chain: Breakpoint → Density → Primitive

Responsive breakpoint tokens reference density tokens, which in turn reference primitives:

```css
/* BreakpointMode → Density → Primitive */
--stack-space-resp-md: var(--density-xs-stack-space-resp-md);
                                ↓
--density-xs-stack-space-resp-md: var(--space-1-p-5-x, 12px);
                                       ↓
--space-1-p-5-x: 12px;
```

This three-level chain enables:
- **Density switching** via `data-density` attribute without recompilation
- **Breakpoint switching** via native `@media` queries
- **Fallback values** for robustness

### Component Density Tokens

Component-specific density tokens (e.g., Button, InputField) are in component files:

```css
/* Component density tokens */
[data-content-brand="bild"][data-density="default"] {
  --density-button-inline-space: var(--space-2-p-5-x, 20px);
  --density-button-stack-space: var(--space-1-x, 8px);
}

[data-content-brand="bild"][data-density="dense"] {
  --density-button-inline-space: var(--space-2-x, 16px);
  --density-button-stack-space: var(--space-0-p-75-x, 6px);
}

[data-content-brand="bild"][data-density="spacious"] {
  --density-button-inline-space: var(--space-3-x, 24px);
  --density-button-stack-space: var(--space-1-p-5-x, 12px);
}
```

---

## 🧩 Component Tokens

### Structure per Component

Each component file contains:

```css
/* === COLOR TOKENS (LIGHT MODE) === */
[data-color-brand="bild"][data-theme="light"] {
  --component-bg-color: ...;
  --component-text-color: ...;
}

/* === COLOR TOKENS (DARK MODE) === */
[data-color-brand="bild"][data-theme="dark"] {
  --component-bg-color: ...;
  --component-text-color: ...;
}

/* === DENSITY TOKENS === */
[data-content-brand="bild"][data-density="default"] { ... }
[data-content-brand="bild"][data-density="dense"] { ... }
[data-content-brand="bild"][data-density="spacious"] { ... }

/* === TYPOGRAPHY TOKENS === */
[data-content-brand="bild"] {
  .component-label { font-family: ...; font-size: ...; }
}

/* === BREAKPOINT TOKENS === */
[data-content-brand="bild"] { ... }
@media (min-width: 600px) { [data-content-brand="bild"] { ... } }
@media (min-width: 1024px) { [data-content-brand="bild"] { ... } }
```

### Available Components

**BILD/SportBILD (52):** Accordion, Alert, Article, AudioPlayer, Avatar, Badge, Breadcrumb, BreakingNews, Button, Card, Carousel, Chip, Datepicker, Drawers, Dropdown, Empties, Foldout, Footer, Gallery, Hey, Icon, InfoElement, InputField, Kicker, LiveTicker, MediaPlayer, Menu, MenuItem, NewsTicker, Pagination, PartnerLinks, Paywall, Quote, RadioButton, Search, SectionTitle, Selection, Separator, Skeletons, Slider, SocialShareButton, SpecialNavi, Spinner, Subheader, Tab, Table, Teaser, TextLink, ToggleSwitch, Video, ...

**Advertorial (39):** Subset of above (no Alert, Gallery, Hey, etc.)

---

## ✍️ Typography & Effects

### Typography Classes

Typography tokens are output as CSS classes under **ContentBrand**:

```css
[data-content-brand="bild"] {
  .button-label {
    font-family: var(--label-font-family);
    font-weight: 700;
    font-size: var(--button-label-font-size);
    line-height: var(--button-label-line-height);
    letter-spacing: var(--letter-space-positive-sm);
    text-transform: uppercase;
  }
}
```

> **Note:** `font-size` is output in px by default (configurable via `FONT_SIZE_UNIT` in `style-dictionary.config.js`). `line-height` is always unitless (ratio-based, e.g., `1.33`).

Usage:
```html
<span class="button-label">Click Me</span>
```

### Effect Classes (Mode-Agnostic with var() Support)

Shadow effects use a **mode-agnostic architecture** where the shadow structure is constant but colors adapt to the theme via CSS Custom Properties:

```css
/* Step 1: Semantic shadow colors (theme-aware) */
[data-color-brand="bild"][data-theme="light"] {
  --shadow-color-soft-key-sm: var(--color-neutral-0-a-7, rgba(0,0,0,0.07));
  --shadow-color-soft-ambient-sm: var(--color-neutral-0-a-10, rgba(0,0,0,0.1));
}

[data-color-brand="bild"][data-theme="dark"] {
  --shadow-color-soft-key-sm: var(--color-neutral-0-a-20, rgba(0,0,0,0.2));
  --shadow-color-soft-ambient-sm: var(--color-neutral-0-a-30, rgba(0,0,0,0.3));
}

/* Step 2: Mode-agnostic shadow effect (no [data-theme] needed!) */
[data-color-brand="bild"] .shadow-soft-sm {
  box-shadow:
    var(--size-0-x, 0px) var(--size-0-p-25-x, 2px) var(--size-0-p-5-x, 4px) var(--size-0-x, 0px) var(--shadow-color-soft-key-sm),
    var(--size-0-x, 0px) var(--size-0-p-125-x, 1px) var(--size-0-p-375-x, 3px) var(--size-0-p-125-x, 1px) var(--shadow-color-soft-ambient-sm);
}
```

**Why this architecture?**
- Shadow **dimensions** (offset, blur, spread) are identical between light/dark modes
- Only **colors** change per theme
- Results in **smaller CSS** (no duplicate shadow definitions)
- Full **var() support** enables runtime theming

**Fallback Strategy:**
- Dimension properties (`--size-*`) get fallbacks (primitive references)
- Color properties (`--shadow-color-*`) don't get fallbacks (semantic references should fail visibly if theme not set)

Usage:
```html
<div class="shadow-soft-md">Elevated card</div>
<div class="shadow-hard-lg">Strong shadow</div>
```

---

## 💡 Usage Examples

### Standard BILD App

```html
<html data-color-brand="bild" data-content-brand="bild" data-theme="light" data-density="default">
```

### Advertorial in BILD

```html
<html data-color-brand="bild" data-theme="light">
  <main data-content-brand="bild">
    <!-- Regular BILD content -->
  </main>
  <article data-content-brand="advertorial">
    <!-- Advertorial with BILD colors but Advertorial typography -->
  </article>
</html>
```

### Advertorial in SportBILD (Dark Mode)

```html
<html data-color-brand="sportbild" data-theme="dark">
  <article data-content-brand="advertorial" data-density="spacious">
    <!-- Advertorial with SportBILD dark colors -->
  </article>
</html>
```

### Basic Button

```html
<button class="my-button">
  <span class="button-label">Submit</span>
</button>
```

```css
.my-button {
  background: var(--button-primary-brand-bg-color-idle);
  color: var(--button-primary-label-color);
  padding: var(--density-button-stack-space) var(--density-button-inline-space);
  border-radius: var(--button-border-radius);
  border: var(--button-border-width-size) solid transparent;
}

.my-button:hover {
  background: var(--button-primary-brand-bg-color-hover);
}
```

### Theme Toggle

```javascript
const toggle = document.getElementById('theme-toggle');
toggle.addEventListener('click', () => {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'light' ? 'dark' : 'light';
});
```

### Density Selector

```javascript
function setDensity(density) {
  document.documentElement.dataset.density = density;
}

// Usage
setDensity('dense');    // Compact UI
setDensity('default');  // Normal UI
setDensity('spacious'); // Generous spacing
```

---

## 🕸️ Shadow DOM / Web Components

The CSS output is **Shadow DOM compatible** for use with frameworks like **Stencil**, **Lit**, or native Web Components.

### How It Works

CSS Custom Properties **inherit through the Shadow DOM boundary**:

```html
<!-- Light DOM: Tokens are set here -->
<body data-color-brand="bild" data-content-brand="bild" data-theme="light">

  <!-- Shadow DOM: Tokens are inherited! -->
  <my-button>
    <!-- #shadow-root -->
    <!-- var(--button-primary-bg) works here! -->
  </my-button>

</body>
```

### Stencil Component Example

```tsx
// my-button.tsx
@Component({
  tag: 'my-button',
  shadow: true,
  styles: `
    .btn {
      /* Token values inherit from Light DOM automatically */
      background: var(--button-primary-brand-bg-color-idle);
      color: var(--button-primary-label-color);
      padding: var(--button-stack-space) var(--button-inline-space);
      border-radius: var(--button-border-radius);
    }

    .btn:hover {
      background: var(--button-primary-brand-bg-color-hover);
    }

    .label {
      font-family: var(--font-family-gotham);
      font-weight: var(--font-weight-bold);
      font-size: var(--button-label-font-size);
    }
  `
})
export class MyButton {
  render() {
    return (
      <button class="btn">
        <span class="label"><slot></slot></span>
      </button>
    );
  }
}
```

### Multi-Brand Theming

```html
<!-- BILD Brand -->
<body data-color-brand="bild" data-content-brand="bild" data-theme="light">
  <my-button>Red Button</my-button>
</body>

<!-- SportBILD Brand -->
<body data-color-brand="sportbild" data-content-brand="sportbild" data-theme="dark">
  <my-button>Blue Button</my-button>
</body>
```

The same component automatically adapts to different brands!

### Dual Selectors

CSS output includes dual selectors for both Light DOM and Shadow DOM:

```css
/* Works in Light DOM AND Shadow DOM (when attribute on component) */
[data-color-brand="bild"][data-theme="light"],
:host([data-color-brand="bild"][data-theme="light"]) {
  --button-primary-brand-bg-color-idle: var(--color-bild-red-50, #DD0000);
}
```

### What Works in Shadow DOM

| Feature | Status | Notes |
|---------|--------|-------|
| Token Variables | ✅ | CSS Custom Properties inherit through Shadow DOM |
| @media Breakpoints | ✅ | Global, work everywhere |
| Light/Dark Mode | ✅ | Variables change, components update |
| Density Modes | ✅ | Variables inherit |
| Typography Classes | ⚠️ | Use `var()` directly instead of classes |
| Effect Classes | ⚠️ | Use `var()` directly instead of classes |

### Best Practice

**For Shadow DOM components, use CSS Custom Properties directly:**

```css
/* ✅ Recommended - Variables inherit */
.label {
  font-family: var(--font-family-gotham);
  font-size: var(--display-1-font-size);
  line-height: var(--display-1-line-height);
}

/* ⚠️ Classes require attribute on component */
.label {
  /* This needs [data-content-brand] on the component itself */
}
```

> **Note:** Typography classes (`.display-1`, `.body`, etc.) are convenience utilities for Light DOM. For Shadow DOM, use the underlying CSS Custom Properties directly.

### Stencil Project Setup

The design system includes a pre-configured Stencil project with demo components:

```bash
# Build tokens first (required)
npm run build

# Build Stencil components
npm run build:stencil

# Start dev server with hot reload (port 3333)
npm run dev:stencil
```

**Demo Components:**
- `<ds-button>` – Button with variant prop (primary, secondary, tertiary)
- `<ds-card>` – Card with surface prop (primary, secondary)

**Brand Switcher (index.html):**

The demo page includes a brand switcher with all four theming axes:

| Selector | Options | Data Attribute |
|----------|---------|----------------|
| Color Brand | BILD, SportBILD | `data-color-brand` |
| Theme | Light, Dark | `data-theme` |
| Content Brand | BILD, SportBILD, Advertorial | `data-content-brand` |
| Density | Default, Dense, Spacious | `data-density` |

**Project Structure:**
```
build-config/stencil/
  stencil.config.ts       # Stencil configuration
  tsconfig.json           # TypeScript config

src/components/
  ds-button/              # Button component
  ds-card/                # Card component
  index.html              # Dev/test page with brand switcher
```

> See [CLAUDE.md](../../CLAUDE.md#stencil-web-components-integration) for complete Stencil documentation.

---

## 📚 Storybook

The design system includes a **Storybook 8.x** setup for component development and documentation with full 4-axis token support.

### Quick Start

```bash
# Build tokens first (required)
npm run build

# Start Storybook dev server (port 6006)
npm run storybook

# Build static Storybook site
npm run build:storybook
```

### Features

**4-Axis Token Switching in Toolbar:**

| Toolbar Control | Options | Description |
|-----------------|---------|-------------|
| Color Brand | BILD, SportBILD | Colors + effects axis |
| Content Brand | BILD, SportBILD, Advertorial | Typography + sizing axis |
| Dark Mode Toggle (🌙) | Light, Dark | Unified UI + content theming |
| Density | Default, Dense, Spacious | Spacing density |

### Dark Mode Integration

The `storybook-dark-mode` addon provides unified dark mode:

- **Moon icon (🌙)** in toolbar toggles both Storybook UI and content area
- Design tokens (`data-theme`) sync automatically via localStorage polling
- Custom BILD themes match the design system look

### Writing Stories

```typescript
// src/components/ds-button/ds-button.stories.ts
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './ds-button';

const meta: Meta = {
  title: 'Components/Button',
  component: 'ds-button',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
    },
  },
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  args: { variant: 'primary' },
  render: (args) => html`
    <ds-button variant=${args.variant}>Primary Button</ds-button>
  `,
};
```

### Styleguide Documentation

The `src/docs/` directory contains visual documentation pages for design system foundations:

| Page | File | Description |
|------|------|-------------|
| Introduction | `intro.mdx` | Overview, brand architecture, links |
| Colors | `colors.mdx` | Color palettes with visual swatches |
| Typography | `typography.mdx` | Font families, weights, text styles |
| Spacing | `spacing.mdx` | Spacing scale, density modes |
| Effects | `effects.mdx` | Shadow tokens with live previews |

These pages use MDX with `@storybook/blocks` and include styled visual elements like color swatches, spacing bars, and shadow cards.

### Configuration

| File | Purpose |
|------|---------|
| `build-config/storybook/main.ts` | Framework, addons, static dirs |
| `build-config/storybook/preview.ts` | Decorators, toolbar controls |
| `build-config/storybook/preview-body.html` | Dark mode sync script |
| `build-config/storybook/manager.ts` | Custom BILD UI themes |

> See [CLAUDE.md](../../CLAUDE.md#storybook-integration) for complete Storybook documentation.

---

## 🌐 Browser Support

CSS Custom Properties are supported in all modern browsers:

- Chrome 49+
- Firefox 31+
- Safari 9.1+
- Edge 15+

### Conditional Fallback Strategy

Fallback values are included **conditionally** based on reference type:

```css
/* ✅ WITH fallback: Primitive references (split-loading safety) */
--text-color-primary: var(--color-neutral-15, #232629);
--grid-space-resp-base: var(--space-1-p-5-x, 12px);

/* ❌ WITHOUT fallback: Semantic references (fail visible) */
--button-primary-bg: var(--bg-color-brand-solid);
```

**Rationale:**
- **Primitive references** get fallbacks → protects against missing `primitives.css` in split-file loading
- **Semantic references** don't get fallbacks → missing `data-theme` should fail visibly, not silently degrade

> See [CLAUDE.md](../../CLAUDE.md#shadow-effects-css-architecture) for detailed fallback architecture.

---

## 📖 Related Documentation

| Document | Description |
|----------|-------------|
| [JavaScript/React](./js.md) | ESM tokens with React ThemeProvider |
| [Android Compose](../../tokens-android/docs/USAGE.md) | Kotlin tokens for Jetpack Compose |
| [iOS SwiftUI](../../tokens-ios/Documentation/USAGE.md) | Swift tokens for SwiftUI |
| [Tokens README](../README.md) | Token pipeline overview |
| [Main README](../../README.md) | Project overview |
| [CLAUDE.md](../../CLAUDE.md) | Architecture & build details |
