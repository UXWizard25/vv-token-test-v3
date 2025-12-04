# CSS - Design System Tokens

> **CSS Custom Properties für Web-Anwendungen**
>
> Data-Attribute basiert, responsive, multi-brand ready.

---

## Table of Contents

- [Quick Start](#quick-start)
- [File Structure](#file-structure)
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
<html data-brand="bild" data-theme="light" data-density="default">
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

// Switch brand
document.documentElement.dataset.brand = 'sportbild';
```

---

## File Structure

```
dist/css/
├── shared/
│   └── primitives.css        # Color, Space, Size, Font primitives
│
├── bundles/                   # All-in-one bundles per brand
│   ├── bild.css              # (~116 KB)
│   ├── sportbild.css         # (~117 KB)
│   └── advertorial.css       # (~83 KB)
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
└── advertorial/               # Same structure (40 components)
    └── ...
```

---

## Data Attributes

### Required Attributes

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `data-brand` | `bild`, `sportbild`, `advertorial` | - | Brand selection (required) |
| `data-theme` | `light`, `dark` | `light` | Color mode |
| `data-density` | `default`, `dense`, `spacious` | `default` | Spacing density |

### Selector Specificity

```css
/* Brand only (sizing, typography) */
[data-brand="bild"] { }

/* Brand + Theme (colors) */
[data-brand="bild"][data-theme="light"] { }
[data-brand="bild"][data-theme="dark"] { }

/* Brand + Density */
[data-brand="bild"][data-density="default"] { }
[data-brand="bild"][data-density="dense"] { }

/* Brand + Theme + Class (effects) */
[data-brand="bild"][data-theme="light"] .shadow-soft-md { }
```

---

## Bundle Options

### Option A: All-in-One Bundle

Best for: Simple projects, quick prototyping.

```html
<link rel="stylesheet" href="css/bundles/bild.css">
```

Contains: Primitives + Theme + Tokens + All Components (~116 KB)

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
  --bildred: #DD0000;
  --bild015: #232629;
  --white100: #FFFFFF;

  /* Spacing */
  --space1x: 8px;
  --space2x: 16px;
  --space3x: 24px;

  /* Sizes */
  --size4x: 32px;
  --size6x: 48px;

  /* Fonts */
  --font-family-gotham-xnarrow: Gotham XNarrow;
  --font-weight-bold: 700;
}
```

### 2. Semantic Tokens (theme.css)

Meaningful design intent, theme-aware.

```css
[data-brand="bild"][data-theme="light"] {
  /* Text */
  --text-color-primary: var(--bild015, #232629);
  --text-color-accent: var(--bildred, #DD0000);

  /* Surfaces */
  --surface-color-primary: var(--white100, #FFFFFF);
  --surface-color-secondary: var(--bild096, #F2F4F5);

  /* Borders */
  --border-color-medium-contrast: var(--bild085, #CED4DA);

  /* Core */
  --core-color-primary: var(--bildred, #DD0000);
}
```

### 3. Responsive Tokens (tokens.css)

Breakpoint-aware sizing and typography.

```css
/* Base (mobile-first) */
[data-brand="bild"] {
  --headline1-font-size: 48px;
  --grid-space-resp-base: var(--space1p5x, 12px);
}

/* Tablet (600px+) */
@media (min-width: 600px) {
  [data-brand="bild"] {
    --headline1-font-size: 72px;
    --grid-space-resp-base: var(--space1p5x, 12px);
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  [data-brand="bild"] {
    --headline1-font-size: 100px;
    --grid-space-resp-base: var(--space2x, 16px);
  }
}
```

### 4. Component Tokens (components/*.css)

Component-specific design decisions.

```css
/* Button colors (theme-aware) */
[data-brand="bild"][data-theme="light"] {
  --button-primary-brand-bg-color-idle: var(--bildred, #DD0000);
  --button-primary-label-color: var(--white100, #FFFFFF);
}

/* Button density (density-aware) */
[data-brand="bild"][data-density="default"] {
  --density-button-inline-space: var(--space2p5x, 20px);
  --density-button-label-font-size: 17px;
}

/* Button sizing (responsive) */
[data-brand="bild"] {
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
[data-brand="bild"] {
  --article-headline-font-size: var(--headline2-font-size);  /* xs: 40px */
}

/* Changes at md */
@media (min-width: 600px) {
  [data-brand="bild"] {
    --article-headline-font-size: var(--headline1-font-size);  /* md: 72px */
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
[data-brand="bild"][data-theme="light"] {
  --component-bg-color: ...;
  --component-text-color: ...;
}

/* === COLOR TOKENS (DARK MODE) === */
[data-brand="bild"][data-theme="dark"] {
  --component-bg-color: ...;
  --component-text-color: ...;
}

/* === DENSITY TOKENS === */
[data-brand="bild"][data-density="default"] { ... }
[data-brand="bild"][data-density="dense"] { ... }
[data-brand="bild"][data-density="spacious"] { ... }

/* === TYPOGRAPHY TOKENS === */
[data-brand="bild"] {
  .component-label { font-family: ...; font-size: ...; }
}

/* === BREAKPOINT TOKENS === */
[data-brand="bild"] { ... }
@media (min-width: 600px) { ... }
@media (min-width: 1024px) { ... }
```

### Available Components (52)

Accordion, Alert, Article, AudioPlayer, Avatar, Badge, Breadcrumb, BreakingNews, Button, Card, Carousel, Chip, Datepicker, Drawers, Dropdown, Empties, Foldout, Footer, Gallery, Hey, Icon, InfoElement, InputField, Kicker, LiveTicker, MediaPlayer, Menu, MenuItem, NewsTicker, Pagination, PartnerLinks, Paywall, Quote, RadioButton, Search, SectionTitle, Selection, Separator, Skeletons, Slider, SocialShareButton, SpecialNavi, Spinner, Subheader, Tab, Table, Teaser, TextLink, ToggleSwitch, Video, ...

---

## Typography & Effects

### Typography Classes

Typography tokens are output as CSS classes:

```css
[data-brand="bild"] {
  .button-label {
    font-family: var(--font-family-gotham-xnarrow, Gotham XNarrow);
    font-weight: 700;
    font-size: var(--button-label-font-size, 15px);
    line-height: var(--button-label-line-height, 15px);
    letter-spacing: var(--letter-space0p5, 0.5px);
    text-transform: uppercase;
  }
}
```

Usage:
```html
<span class="button-label">Click Me</span>
```

### Effect Classes

Shadows are output as CSS classes:

```css
/* Semantic effects */
[data-brand="bild"][data-theme="light"] .shadow-soft-md {
  box-shadow: 0px 2px 16px 0px rgba(0, 0, 0, 0.03), ...;
}

/* Component effects (mode-agnostic when identical) */
[data-brand="bild"] .alert-shadow-down {
  box-shadow: 0px 6px 10px 0px var(--black-alpha20, rgba(0, 0, 0, 0.2));
}
```

Usage:
```html
<div class="shadow-soft-md">Elevated card</div>
<div class="alert-shadow-down">Alert with shadow</div>
```

---

## Usage Examples

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

### Responsive Card

```css
.card {
  background: var(--surface-color-primary);
  padding: var(--grid-space-resp-base);
  border-radius: var(--border-radius-md);
}

.card-title {
  color: var(--headline-color-primary);
  font-size: var(--headline3-font-size);
  margin-bottom: var(--stack-space-resp-sm);
}

.card-body {
  color: var(--text-color-primary);
  font-size: var(--body-font-size);
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
--text-color-primary: var(--bild015, #232629);
/*                              ↑ fallback value */
```

---

## Related Documentation

- [JavaScript/React Tokens](./README.js.md)
- [Android Compose Tokens](./README.android.md)
- [iOS SwiftUI Tokens](./README.ios.md)
- [Architecture Overview](./CLAUDE.md)
