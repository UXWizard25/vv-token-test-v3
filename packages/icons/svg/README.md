# @marioschmidt/design-system-icons

> **BILD Design System** | Optimized SVG icons

[![npm version](https://img.shields.io/npm/v/@marioschmidt/design-system-icons.svg)](https://www.npmjs.com/package/@marioschmidt/design-system-icons)

---

## Installation

```bash
npm install @marioschmidt/design-system-icons
```

---

## Usage

### ES Module Import

```javascript
import addIcon from '@marioschmidt/design-system-icons/add.svg';
import menuIcon from '@marioschmidt/design-system-icons/menu.svg';
```

### HTML

```html
<img src="node_modules/@marioschmidt/design-system-icons/add.svg" alt="Add" />
```

### CSS

```css
.icon-add {
  background-image: url('@marioschmidt/design-system-icons/add.svg');
}
```

### Vite / Webpack

Most bundlers support SVG imports out of the box:

```javascript
import addIcon from '@marioschmidt/design-system-icons/add.svg';

// Use as image source
document.querySelector('img').src = addIcon;
```

---

## Optimization

All SVGs are optimized with SVGO:

- **currentColor**: Fills/strokes use `currentColor` for CSS theming
- **Preserved viewBox**: Icons scale correctly at any size
- **Prefixed IDs**: Internal IDs (clipPath, gradients) are prefixed with icon name to prevent DOM collisions

```xml
<!-- Before optimization -->
<clipPath id="a">...</clipPath>

<!-- After optimization -->
<clipPath id="podcast-spotify-clip0_17587_6927">...</clipPath>
```

This ensures multiple icons can be rendered on the same page without conflicts.

---

## Theming

All icons use `currentColor` for fills and strokes, allowing easy color customization via CSS:

```css
.icon-container {
  color: var(--icon-color, #333);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .icon-container {
    color: #fff;
  }
}
```

---

## Icon List

See the full icon catalog in the [main icons documentation](../README.md).

---

## Related Packages

| Package | Purpose |
|---------|---------|
| [`@marioschmidt/design-system-icons-react`](https://www.npmjs.com/package/@marioschmidt/design-system-icons-react) | React components with TypeScript |
| `de.bild.design:icons` | Android Vector Drawables |
| `BildIcons` | iOS Swift Package |

---

## License

MIT
