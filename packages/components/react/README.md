# React Wrappers for BILD Design System

> **Part of the [BILD Design Ops Pipeline](../../../README.md)** | [Components](../core/README.md) | [Vue](../vue/README.md)

React wrapper components for the BILD Design System, auto-generated from Stencil Web Components using `@stencil/react-output-target`.

[![npm version](https://img.shields.io/npm/v/@marioschmidt/design-system-react.svg)](https://www.npmjs.com/package/@marioschmidt/design-system-react)

---

## Installation

```bash
npm install @marioschmidt/design-system-react @marioschmidt/design-system-tokens
```

**Peer Dependencies:**
- `react` >= 17
- `react-dom` >= 17
- `@marioschmidt/design-system-components` ^1.0.0 (optional, auto-loaded)

---

## Usage

### Basic Usage

```tsx
import { DsButton, DsCard } from '@marioschmidt/design-system-react';
import '@marioschmidt/design-system-tokens/css/bundles/bild.css';

function App() {
  return (
    <div data-color-brand="bild" data-content-brand="bild" data-theme="light">
      <DsButton variant="primary" onClick={() => alert('Clicked!')}>
        Click me
      </DsButton>

      <DsCard cardTitle="Hello World">
        <p>Card content goes here.</p>
      </DsCard>
    </div>
  );
}
```

### With Theme Provider (Recommended)

```tsx
import { DsButton, DsCard } from '@marioschmidt/design-system-react';
import '@marioschmidt/design-system-tokens/css/bundles/bild.css';

function ThemeProvider({ children, colorBrand, contentBrand, theme, density }) {
  return (
    <div
      data-color-brand={colorBrand}
      data-content-brand={contentBrand}
      data-theme={theme}
      data-density={density}
    >
      {children}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider colorBrand="bild" contentBrand="bild" theme="light" density="default">
      <DsButton variant="primary">BILD Button</DsButton>
    </ThemeProvider>
  );
}
```

---

## Available Components

| Component | Props | Description |
|-----------|-------|-------------|
| **DsButton** | `variant`, `disabled` | Interactive button with hover/active states |
| **DsCard** | `surface`, `cardTitle` | Content container with shadow and padding |

### DsButton

```tsx
<DsButton variant="primary">Primary Button</DsButton>
<DsButton variant="secondary">Secondary Button</DsButton>
<DsButton variant="tertiary">Tertiary Button</DsButton>
<DsButton disabled>Disabled Button</DsButton>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'` | Button style variant |
| `disabled` | `boolean` | `false` | Disabled state |

### DsCard

```tsx
<DsCard cardTitle="Card Title">
  <p>Card content</p>
</DsCard>

<DsCard surface="secondary">
  <p>Secondary surface card</p>
</DsCard>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `surface` | `'primary' \| 'secondary'` | `'primary'` | Card surface variant |
| `cardTitle` | `string` | - | Optional card title |

---

## Theming

Components automatically adapt to design tokens via CSS Custom Properties.

### Data Attributes

Set these on a parent element (usually `<body>` or a wrapper div):

| Attribute | Values | Purpose |
|-----------|--------|---------|
| `data-color-brand` | `bild`, `sportbild` | Colors & effects |
| `data-content-brand` | `bild`, `sportbild`, `advertorial` | Typography & spacing |
| `data-theme` | `light`, `dark` | Color mode |
| `data-density` | `default`, `dense`, `spacious` | Spacing density |

### Runtime Theme Switching

```tsx
function App() {
  const [theme, setTheme] = useState('light');

  return (
    <div data-color-brand="bild" data-theme={theme}>
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
      <DsButton variant="primary">Themed Button</DsButton>
    </div>
  );
}
```

---

## How It Works

1. **Stencil builds Web Components** with Shadow DOM
2. **React output target** generates wrapper components during build
3. **Wrappers use `defineCustomElement`** to lazy-load the actual Web Component
4. **CSS Custom Properties** inherit through the Shadow DOM for theming

The React wrappers provide:
- Full TypeScript support with proper prop types
- React event handling (`onClick`, `onChange`, etc.)
- Ref forwarding to the underlying Web Component
- Tree-shakeable imports

---

## TypeScript

Full TypeScript support is included:

```tsx
import { DsButton, DsCard } from '@marioschmidt/design-system-react';
import type { JSX } from '@marioschmidt/design-system-components';

// Props are fully typed
const buttonProps: JSX.DsButton = {
  variant: 'primary',
  disabled: false,
};
```

---

## Related

| Package | Description |
|---------|-------------|
| [@marioschmidt/design-system-components](../core/README.md) | Core Stencil Web Components |
| [@marioschmidt/design-system-vue](../vue/README.md) | Vue 3 wrapper components |
| [@marioschmidt/design-system-tokens](../../tokens/README.md) | Design tokens (CSS, JS, iOS, Android) |

---

## License

MIT
