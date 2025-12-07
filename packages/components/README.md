# 🧩 BILD Design System Components

> **Part of the [BILD Design Ops Pipeline](../../README.md)** | [Token Documentation](../tokens/README.md) | [Icon Documentation](../icons/README.md)

Stencil-based Web Components for the BILD Design System. Components consume design tokens via CSS Custom Properties and work in any framework.

[![npm version](https://img.shields.io/npm/v/@marioschmidt/design-system-components.svg)](https://www.npmjs.com/package/@marioschmidt/design-system-components)
[![Build Status](https://github.com/UXWizard25/vv-token-test-v3/workflows/Build%20Design%20Tokens/badge.svg)](https://github.com/UXWizard25/vv-token-test-v3/actions)

---

## 📋 Table of Contents

- [📦 Installation](#-installation)
- [🚀 Usage](#-usage)
- [🧩 Available Components](#-available-components)
- [🎨 Theming](#-theming)
- [🌓 Shadow DOM](#-shadow-dom)
- [📁 Project Structure](#-project-structure)
- [⚙️ Development](#️-development)
- [📚 Storybook](#-storybook)
- [🔗 Related](#-related)
- [📄 License](#-license)

---

## 📦 Installation

```bash
npm install @marioschmidt/design-system-components
```

**Recommended:** Install together with design tokens:

```bash
npm install @marioschmidt/design-system-tokens @marioschmidt/design-system-components
```

---

## 🚀 Usage

### Option 1: Lazy Loading (Recommended)

```javascript
import { defineCustomElements } from '@marioschmidt/design-system-components/loader';

// Register all components (lazy-loaded on first use)
defineCustomElements();
```

### Option 2: Custom Elements (Auto-Define)

```javascript
// Import and auto-register all components
import '@marioschmidt/design-system-components/components';
```

### Option 3: Individual Components

```javascript
import { DsButton, DsCard } from '@marioschmidt/design-system-components';
```

### HTML Usage

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Load design tokens CSS -->
  <link rel="stylesheet" href="node_modules/@marioschmidt/design-system-tokens/dist/css/bundles/bild.css">

  <!-- Load components -->
  <script type="module" src="node_modules/@marioschmidt/design-system-components/dist/esm/index.js"></script>
</head>
<body data-color-brand="bild" data-content-brand="bild" data-theme="light" data-density="default">

  <ds-button variant="primary">Click me</ds-button>

  <ds-card>
    <h2>Card Title</h2>
    <p>Card content goes here.</p>
  </ds-card>

</body>
</html>
```

---

## 🧩 Available Components

| Component | Tag | Variants | Description |
|-----------|-----|----------|-------------|
| **Button** | `<ds-button>` | `primary`, `secondary`, `ghost` | Interactive button with hover/active states |
| **Card** | `<ds-card>` | - | Content container with shadow and padding |

### Button

```html
<!-- Primary (default) -->
<ds-button variant="primary">Primary Button</ds-button>

<!-- Secondary -->
<ds-button variant="secondary">Secondary Button</ds-button>

<!-- Ghost -->
<ds-button variant="ghost">Ghost Button</ds-button>
```

### Card

```html
<ds-card>
  <h2>Card Title</h2>
  <p>Card content with automatic styling.</p>
</ds-card>
```

---

## 🎨 Theming

Components automatically adapt to brand/theme/density changes via CSS Custom Properties.

### Data Attributes

Set these on `<body>` or any parent element:

| Attribute | Values | Purpose |
|-----------|--------|---------|
| `data-color-brand` | `bild`, `sportbild` | Colors & effects |
| `data-content-brand` | `bild`, `sportbild`, `advertorial` | Typography & spacing |
| `data-theme` | `light`, `dark` | Color mode |
| `data-density` | `default`, `dense`, `spacious` | Spacing density |

### Brand Examples

```html
<!-- BILD Brand (Light) -->
<body data-color-brand="bild" data-content-brand="bild" data-theme="light" data-density="default">
  <ds-button variant="primary">BILD Button</ds-button>  <!-- Red -->
</body>

<!-- SportBILD Brand (Dark, Dense) -->
<body data-color-brand="sportbild" data-content-brand="sportbild" data-theme="dark" data-density="dense">
  <ds-button variant="primary">Sport Button</ds-button>  <!-- Blue -->
</body>

<!-- Advertorial in BILD context -->
<body data-color-brand="bild" data-content-brand="advertorial" data-theme="light">
  <ds-button variant="primary">Advertorial Button</ds-button>  <!-- BILD colors, Advertorial typography -->
</body>
```

### Runtime Switching

```javascript
// Switch brand at runtime - components update automatically!
document.body.dataset.colorBrand = 'sportbild';
document.body.dataset.theme = 'dark';
```

---

## 🌓 Shadow DOM

All components use Shadow DOM for style encapsulation. Design tokens are inherited through CSS Custom Properties:

```
Light DOM                          Shadow DOM
─────────────────────────────────────────────────────
<body data-color-brand="bild">     <ds-button>
  │                                  #shadow-root
  │  CSS Variables set here:           .button {
  │  --button-primary-bg: #DD0000      background: var(--button-primary-bg);
  │  --button-label-color: #FFF        color: var(--button-label-color);
  │                                    /* Inherits from body! */
  └────────────────────────────►     }
       Variables inherit
       through Shadow DOM
```

### How It Works

1. **Token CSS** is loaded in the Light DOM (on `<body>` or `<html>`)
2. **CSS Custom Properties inherit** through the Shadow DOM boundary
3. **Components read tokens** using `var(--token-name)`
4. **No JavaScript needed** for theming - pure CSS inheritance

### What Inherits

| Token Type | Inheritance | Example |
|------------|-------------|---------|
| Color tokens | ✅ Inherits | `var(--button-primary-bg-color)` |
| Spacing tokens | ✅ Inherits | `var(--button-inline-space)` |
| Typography tokens | ✅ Inherits | `var(--button-label-font-size)` |
| Effects (shadows) | ✅ Inherits | `var(--shadow-soft-md)` |

---

## 📁 Project Structure

```
packages/components/
├── src/                          # Stencil component source
│   ├── ds-button/
│   │   ├── ds-button.tsx         # Component logic
│   │   ├── ds-button.css         # Component styles (uses tokens)
│   │   └── ds-button.stories.ts  # Storybook stories
│   ├── ds-card/
│   │   ├── ds-card.tsx
│   │   ├── ds-card.css
│   │   └── ds-card.stories.ts
│   └── components.d.ts           # Generated type definitions
│
├── docs/                         # Storybook MDX documentation
│   ├── intro.mdx                 # Introduction & overview
│   ├── colors.mdx                # Color tokens
│   ├── typography.mdx            # Typography tokens
│   ├── spacing.mdx               # Spacing & density
│   └── effects.mdx               # Shadows & effects
│
├── dist/                         # Built output (gitignored)
│   ├── esm/                      # ES Modules
│   ├── cjs/                      # CommonJS
│   ├── components/               # Custom Elements (auto-define)
│   ├── loader/                   # Lazy loader
│   └── types/                    # TypeScript definitions
│
├── package.json
└── README.md
```

---

## ⚙️ Development

### Prerequisites

Build tokens first (components depend on token CSS):

```bash
npm run build:tokens
```

### Commands

```bash
# Start dev server with hot reload
npm run dev:stencil        # Port 3333

# Build components
npm run build:components

# Build everything (tokens + icons + components)
npm run build:all

# Clean build output
npm run clean
```

### Creating New Components

1. **Create component directory:**
   ```
   packages/components/src/ds-{name}/
   ├── ds-{name}.tsx
   ├── ds-{name}.css
   └── ds-{name}.stories.ts
   ```

2. **Component structure:**
   ```tsx
   import { Component, Prop, h } from '@stencil/core';

   @Component({
     tag: 'ds-{name}',
     styleUrl: 'ds-{name}.css',
     shadow: true,
   })
   export class Ds{Name} {
     @Prop() variant: string = 'default';

     render() {
       return (
         <div class={`ds-{name} ds-{name}--${this.variant}`}>
           <slot></slot>
         </div>
       );
     }
   }
   ```

3. **Use design tokens in CSS:**
   ```css
   :host {
     display: block;
   }

   .ds-{name} {
     /* Tokens inherit from Light DOM automatically */
     background: var(--surface-color-primary);
     color: var(--text-color-primary);
     padding: var(--space-2-x);
     border-radius: var(--border-radius-md);
   }
   ```

---

## 📚 Storybook

Interactive component documentation with live theming.

```bash
npm run storybook          # Start dev server (port 6006)
npm run build:storybook    # Build static site
```

### Features

- **4-Axis Controls**: Color Brand, Content Brand, Theme, Density
- **Component Stories**: All variants with controls
- **Styleguide Pages**: Colors, Typography, Spacing, Effects
- **Dark Mode Toggle**: Synced with design tokens

### Writing Stories

```typescript
// ds-button.stories.ts
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Components/Button',
  tags: ['autodocs'],
  render: (args) => html`
    <ds-button variant=${args.variant}>
      ${args.label}
    </ds-button>
  `,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
    },
  },
};

export default meta;

export const Primary: StoryObj = {
  args: { variant: 'primary', label: 'Click me' },
};
```

---

## 🔗 Related

| Document | Description |
|----------|-------------|
| [📖 Main README](../../README.md) | Project overview |
| [📖 Tokens README](../tokens/README.md) | Design tokens documentation |
| [📖 Icons README](../icons/README.md) | Icon library documentation |
| [📖 CSS Documentation](../tokens/docs/css.md) | CSS Custom Properties & Shadow DOM |

---

## 📄 License

MIT

---

**Built with ❤️ for the BILD Design System**

| Feature | Status |
|---------|--------|
| Shadow DOM | ✅ |
| CSS Custom Properties | ✅ |
| 4-Axis Theming | ✅ |
| TypeScript | ✅ |
| Storybook | ✅ |
