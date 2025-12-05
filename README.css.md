# CSS - Design System Tokens

> **CSS Custom Properties für Web-Anwendungen**
>
> Dual-Axis Architektur, responsive, multi-brand ready.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Dual-Axis Architecture](#dual-axis-architecture)
- [File Structure](#file-structure)
- [Naming Conventions](#naming-conventions)
- [Data Attributes](#data-attributes)
- [Bundle Options](#bundle-options)
- [Token Categories](#token-categories)
- [Responsive Tokens](#responsive-tokens)
- [Component Tokens](#component-tokens)
- [Typography & Effects](#typography--effects)
- [Usage Examples](#usage-examples)

---

## Quick Start

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

## Dual-Axis Architecture

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

## File Structure

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
│   ├── tokens.css            # Responsive breakpoints + Typography
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

## Naming Conventions

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

## Data Attributes

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

## Bundle Options

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

## Token Categories

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

## Responsive Tokens

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

## Component Tokens

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

## Typography & Effects

### Typography Classes

Typography tokens are output as CSS classes under **ContentBrand**:

```css
[data-content-brand="bild"] {
  .button-label {
    font-family: var(--font-family-gotham-xnarrow, Gotham XNarrow);
    font-weight: 700;
    font-size: var(--button-label-font-size, 15px);
    line-height: var(--button-label-line-height, 15px);
    letter-spacing: var(--letter-space-0-p-5, 0.5px);
    text-transform: uppercase;
  }
}
```

Usage:
```html
<span class="button-label">Click Me</span>
```

### Effect Classes

Shadows are output as CSS classes under **ColorBrand**:

```css
/* Semantic effects */
[data-color-brand="bild"][data-theme="light"] .shadow-soft-md {
  box-shadow: 0px 2px 16px 0px rgba(0, 0, 0, 0.03), ...;
}

/* Component effects */
[data-color-brand="bild"] .alert-shadow-down {
  box-shadow: 0px 6px 10px 0px var(--alpha-black-20, rgba(0, 0, 0, 0.2));
}
```

Usage:
```html
<div class="shadow-soft-md">Elevated card</div>
<div class="alert-shadow-down">Alert with shadow</div>
```

---

## Usage Examples

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

## Browser Support

CSS Custom Properties are supported in all modern browsers:

- Chrome 49+
- Firefox 31+
- Safari 9.1+
- Edge 15+

For legacy browser support, fallback values are included:

```css
--text-color-primary: var(--color-neutral-15, #232629);
/*                                            ↑ fallback value */
```

---

## Related Documentation

- [JavaScript/React Tokens](./dist/js/README.md)
- [Android Compose Tokens](./dist/android/compose/README.md)
- [iOS SwiftUI Tokens](./dist/ios/README.md)
- [Architecture Overview](./CLAUDE.md)
