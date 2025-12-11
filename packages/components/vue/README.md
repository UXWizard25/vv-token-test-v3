# Vue 3 Wrappers for BILD Design System

> **Part of the [BILD Design Ops Pipeline](../../../README.md)** | [Components](../core/README.md) | [React](../react/README.md)

Vue 3 wrapper components for the BILD Design System, auto-generated from Stencil Web Components using `@stencil/vue-output-target`.

[![npm version](https://img.shields.io/npm/v/@marioschmidt/design-system-vue.svg)](https://www.npmjs.com/package/@marioschmidt/design-system-vue)

---

## Installation

```bash
npm install @marioschmidt/design-system-vue @marioschmidt/design-system-tokens
```

**Peer Dependencies:**
- `vue` >= 3
- `@marioschmidt/design-system-components` ^1.0.0 (optional, auto-loaded)

---

## Usage

### Basic Usage

```vue
<script setup>
import { DsButton, DsCard } from '@marioschmidt/design-system-vue';
</script>

<template>
  <div data-color-brand="bild" data-content-brand="bild" data-theme="light">
    <DsButton variant="primary" @click="handleClick">
      Click me
    </DsButton>

    <DsCard card-title="Hello World">
      <p>Card content goes here.</p>
    </DsCard>
  </div>
</template>

<style>
@import '@marioschmidt/design-system-tokens/css/bundles/bild.css';
</style>
```

### With Theme Provider (Recommended)

```vue
<!-- ThemeProvider.vue -->
<script setup>
defineProps({
  colorBrand: { type: String, default: 'bild' },
  contentBrand: { type: String, default: 'bild' },
  theme: { type: String, default: 'light' },
  density: { type: String, default: 'default' },
});
</script>

<template>
  <div
    :data-color-brand="colorBrand"
    :data-content-brand="contentBrand"
    :data-theme="theme"
    :data-density="density"
  >
    <slot />
  </div>
</template>
```

```vue
<!-- App.vue -->
<script setup>
import { DsButton } from '@marioschmidt/design-system-vue';
import ThemeProvider from './ThemeProvider.vue';
</script>

<template>
  <ThemeProvider color-brand="bild" theme="light">
    <DsButton variant="primary">BILD Button</DsButton>
  </ThemeProvider>
</template>
```

---

## Available Components

| Component | Props | Description |
|-----------|-------|-------------|
| **DsButton** | `variant`, `disabled` | Interactive button with hover/active states |
| **DsCard** | `surface`, `card-title` | Content container with shadow and padding |

### DsButton

```vue
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

```vue
<DsCard card-title="Card Title">
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
| `card-title` | `string` | - | Optional card title |

> **Note:** In Vue templates, use `kebab-case` for props (e.g., `card-title` instead of `cardTitle`).

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

```vue
<script setup>
import { ref } from 'vue';
import { DsButton } from '@marioschmidt/design-system-vue';

const theme = ref('light');
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
};
</script>

<template>
  <div data-color-brand="bild" :data-theme="theme">
    <button @click="toggleTheme">Toggle Theme</button>
    <DsButton variant="primary">Themed Button</DsButton>
  </div>
</template>
```

---

## How It Works

1. **Stencil builds Web Components** with Shadow DOM
2. **Vue output target** generates wrapper components during build
3. **Wrappers use `defineCustomElement`** to lazy-load the actual Web Component
4. **CSS Custom Properties** inherit through the Shadow DOM for theming

The Vue wrappers provide:
- Full TypeScript support with proper prop types
- Vue event handling (`@click`, `@change`, etc.)
- v-model support where applicable
- Tree-shakeable imports

---

## TypeScript

Full TypeScript support is included:

```vue
<script setup lang="ts">
import { DsButton, DsCard } from '@marioschmidt/design-system-vue';
import type { JSX } from '@marioschmidt/design-system-components';

// Props are fully typed
const buttonVariant: JSX.DsButton['variant'] = 'primary';
</script>

<template>
  <DsButton :variant="buttonVariant">Typed Button</DsButton>
</template>
```

---

## Vite Configuration

If using Vite, you may need to configure custom element handling:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Treat ds-* tags as custom elements
          isCustomElement: (tag) => tag.startsWith('ds-'),
        },
      },
    }),
  ],
});
```

---

## Related

| Package | Description |
|---------|-------------|
| [@marioschmidt/design-system-components](../core/README.md) | Core Stencil Web Components |
| [@marioschmidt/design-system-react](../react/README.md) | React wrapper components |
| [@marioschmidt/design-system-tokens](../../tokens/README.md) | Design tokens (CSS, JS, iOS, Android) |

---

## License

MIT
