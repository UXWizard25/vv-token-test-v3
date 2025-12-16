# @marioschmidt/design-system-icons-react

> **BILD Design System** | React icon components with TypeScript support

[![npm version](https://img.shields.io/npm/v/@marioschmidt/design-system-icons-react.svg)](https://www.npmjs.com/package/@marioschmidt/design-system-icons-react)

---

## Installation

```bash
npm install @marioschmidt/design-system-icons-react
```

**Peer Dependencies:**
- React 18+

---

## Usage

### Named Imports

```tsx
import { IconAdd, IconMenu, IconSearch } from '@marioschmidt/design-system-icons-react';

function App() {
  return (
    <div>
      <IconAdd />
      <IconMenu />
      <IconSearch />
    </div>
  );
}
```

### Individual Imports (Tree-Shakeable)

```tsx
import { IconAdd } from '@marioschmidt/design-system-icons-react/IconAdd';
import IconMenu from '@marioschmidt/design-system-icons-react/IconMenu';
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number \| string` | `24` | Icon size in pixels |
| `color` | `string` | `currentColor` | Icon color |
| `aria-label` | `string` | – | Accessible label (makes icon visible to screen readers) |
| `title` | `string` | – | SVG title element (tooltip) |
| `className` | `string` | – | CSS class name |
| `style` | `CSSProperties` | – | Inline styles |

---

## Accessibility

### Decorative Icons (Default)

By default, icons are hidden from screen readers:

```tsx
<IconAdd />
// Renders: <svg aria-hidden="true" role="img" ...>
```

### Meaningful Icons

Add `aria-label` for icons that convey meaning:

```tsx
<IconAdd aria-label="Add new item" />
// Renders: <svg aria-label="Add new item" role="img" ...>
```

### With Tooltip

```tsx
<IconAdd title="Add new item" aria-label="Add" />
// Renders: <svg aria-label="Add"><title>Add new item</title>...
```

---

## Styling

### Via CSS

Icons use `currentColor` and inherit the parent's text color:

```tsx
<div style={{ color: 'blue' }}>
  <IconAdd /> {/* Blue icon */}
</div>
```

### Via Props

```tsx
<IconAdd size={32} color="#DD0000" />
```

### Via Tailwind CSS

```tsx
<IconAdd className="w-8 h-8 text-blue-500" />
```

---

## TypeScript

Full TypeScript support with auto-completion:

```tsx
import { IconAdd, type IconProps } from '@marioschmidt/design-system-icons-react';

const MyIcon: React.FC<IconProps> = (props) => <IconAdd {...props} />;
```

---

## Icon List

See the full icon catalog in the [main icons documentation](../README.md).

---

## Related Packages

| Package | Purpose |
|---------|---------|
| [`@marioschmidt/design-system-icons`](https://www.npmjs.com/package/@marioschmidt/design-system-icons) | Raw SVG files |
| `de.bild.design:icons` | Android Vector Drawables |
| `BildIcons` | iOS Swift Package |

---

## License

MIT
