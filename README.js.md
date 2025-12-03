# JavaScript/React - Design System Tokens

> **ESM Design Tokens for JavaScript & React**
>
> Tree-shakeable, type-safe, multi-brand ready with **Dual-Axis Architecture**.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Dual-Axis Architecture](#dual-axis-architecture)
- [React ThemeProvider](#react-themeprovider)
- [Token Access](#token-access)
- [Multi-Brand Apps](#multi-brand-apps)
- [File Structure](#file-structure)
- [API Reference](#api-reference)
- [Token Type Mapping](#token-type-mapping)

---

## Quick Start

### 1. Install Package

```bash
npm install @bild/design-tokens
```

### 2. Import Tokens

```javascript
// Import pre-built themes
import { bildLight, bildDark, sportbildLight } from '@bild/design-tokens/js/themes';

// Or create dynamic themes
import { createTheme } from '@bild/design-tokens/js/themes';

// Import primitives directly
import { colorPrimitive, spacePrimitive } from '@bild/design-tokens/js/primitives';

// Import React bindings
import { ThemeProvider, useTheme, useBreakpoint } from '@bild/design-tokens/js/react';
```

### 3. Use with React

```jsx
import { ThemeProvider, useTheme } from '@bild/design-tokens/js/react';

function App() {
  return (
    <ThemeProvider
      colorBrand="bild"
      contentBrand="bild"
      colorMode="light"
      breakpoint="md"
      density="default"
    >
      <MyComponent />
    </ThemeProvider>
  );
}

function MyComponent() {
  const { theme, colorBrand, colorMode } = useTheme();

  return (
    <div style={{
      color: theme.colors.textColorPrimary,
      padding: theme.spacing.gridSpaceRespBase  // "12px"
    }}>
      Hello from {colorBrand} ({colorMode} mode)
    </div>
  );
}
```

### 4. Use without React

```javascript
import { createTheme } from '@bild/design-tokens/js/themes';

// Create a theme for specific configuration
const theme = createTheme({
  colorBrand: 'bild',
  contentBrand: 'bild',
  colorMode: 'light',
  breakpoint: 'md',
  density: 'default'
});

// Access tokens
console.log(theme.colors.textColorPrimary);     // "#232629"
console.log(theme.spacing.gridSpaceRespBase);   // "12px"
console.log(theme.typography.headline1);        // { fontFamily, fontSize: "72px", ... }
```

---

## Dual-Axis Architecture

The design system uses a **Dual-Axis Architecture** that separates color selection from content selection:

```
+-------------------------------------------------------------------+
|  DUAL-AXIS THEME ARCHITECTURE                                     |
|  ---------------------------------------------------------------  |
|                                                                   |
|  Axis 1: ColorBrand (Color Palette + Effects)                     |
|  +----------------+----------------+                              |
|  |     "bild"     |  "sportbild"   |   <- Only brands with colors |
|  +----------------+----------------+                              |
|                                                                   |
|  Axis 2: ContentBrand (Sizing/Typography)                         |
|  +----------------+----------------+----------------+              |
|  |     "bild"     |  "sportbild"   | "advertorial"  |  <- All     |
|  +----------------+----------------+----------------+              |
|                                                                   |
|  Combined Usage:                                                  |
|  createTheme({                                                    |
|      colorBrand: 'sportbild',    // SportBILD colors              |
|      contentBrand: 'advertorial' // Advertorial sizing            |
|  })                                                               |
+-------------------------------------------------------------------+
```

### Why Dual-Axis?

- **Advertorial** has its own sizing/typography but uses BILD or SportBILD colors
- Enables flexible combinations: "Advertorial content styled with SportBILD colors"
- Full tree-shaking support - only import what you use

### Valid Combinations

| ColorBrand | ContentBrand | Use Case |
|------------|--------------|----------|
| `bild` | `bild` | Standard BILD app |
| `sportbild` | `sportbild` | Standard SportBILD app |
| `bild` | `advertorial` | Advertorial in BILD context |
| `sportbild` | `advertorial` | Advertorial in SportBILD context |

---

## React ThemeProvider

### Basic Usage

```jsx
import { ThemeProvider, useTheme } from '@bild/design-tokens/js/react';

function App() {
  return (
    <ThemeProvider
      colorBrand="bild"
      contentBrand="bild"
      colorMode="light"
    >
      <YourApp />
    </ThemeProvider>
  );
}
```

### With Auto-Breakpoint Detection

```jsx
// Automatically detects viewport width and sets breakpoint
<ThemeProvider
  colorBrand="bild"
  contentBrand="bild"
  colorMode="light"
  autoBreakpoint={true}
>
  <YourApp />
</ThemeProvider>
```

### SSR-Safe Default Breakpoint

```jsx
// For SSR: specify a default breakpoint for server rendering
<ThemeProvider
  colorBrand="bild"
  contentBrand="bild"
  colorMode="light"
  autoBreakpoint={true}
  defaultBreakpoint="md"  // Used during SSR, then hydrated with actual
>
  <YourApp />
</ThemeProvider>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `colorBrand` | `'bild' \| 'sportbild'` | `'bild'` | Color palette brand |
| `contentBrand` | `'bild' \| 'sportbild' \| 'advertorial'` | `'bild'` | Sizing/typography brand |
| `colorMode` | `'light' \| 'dark'` | `'light'` | Color mode |
| `breakpoint` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Responsive breakpoint |
| `density` | `'dense' \| 'default' \| 'spacious'` | `'default'` | UI density |
| `autoBreakpoint` | `boolean` | `false` | Auto-detect breakpoint from viewport |
| `defaultBreakpoint` | `string` | `'md'` | Default breakpoint for SSR |

### useTheme Hook

```jsx
import { useTheme } from '@bild/design-tokens/js/react';

function MyComponent() {
  const {
    theme,           // Full theme object with all tokens
    colorBrand,      // Current color brand
    contentBrand,    // Current content brand
    colorMode,       // Current color mode
    breakpoint,      // Current breakpoint
    density          // Current density
  } = useTheme();

  return (
    <div style={{
      color: theme.colors.textColorPrimary,
      backgroundColor: theme.colors.surfaceColorPrimary,
      padding: theme.spacing.gridSpaceRespBase  // "12px"
    }}>
      Content
    </div>
  );
}
```

### useBreakpoint Hook

```jsx
import {
  useBreakpoint,
  useIsBreakpoint,
  useIsBreakpointUp,
  useIsBreakpointDown,
  BREAKPOINTS
} from '@bild/design-tokens/js/react';

function ResponsiveComponent() {
  const breakpoint = useBreakpoint();           // 'xs' | 'sm' | 'md' | 'lg'
  const isMobile = useIsBreakpoint('xs');       // true if exactly xs
  const isTabletUp = useIsBreakpointUp('md');   // true if md or larger
  const isMobileDown = useIsBreakpointDown('sm'); // true if sm or smaller

  return (
    <div>
      Current breakpoint: {breakpoint}
      {isMobile && <MobileLayout />}
      {isTabletUp && <DesktopLayout />}
    </div>
  );
}
```

### Breakpoint Values

```javascript
import { BREAKPOINTS } from '@bild/design-tokens/js/react';

// BREAKPOINTS = {
//   xs: 320,   // Mobile (default)
//   sm: 390,   // Large mobile
//   md: 600,   // Tablet
//   lg: 1024   // Desktop
// }
```

---

## Token Access

### Pre-built Themes

For quick access to complete themes:

```javascript
import {
  bildLight,
  bildDark,
  sportbildLight,
  sportbildDark,
  advertorialInBildLight,
  advertorialInBildDark,
  advertorialInSportbildLight,
  advertorialInSportbildDark
} from '@bild/design-tokens/js/themes';

// Access tokens directly
const primaryColor = bildLight.colors.textColorPrimary;  // "#232629"
const spacing = bildLight.spacing.gridSpaceRespBase;     // "12px"
```

### Dynamic Theme Creation

For runtime configuration:

```javascript
import { createTheme, availableBrands, colorModes, breakpoints } from '@bild/design-tokens/js/themes';

// Create theme with specific configuration
const theme = createTheme({
  colorBrand: 'bild',
  contentBrand: 'bild',
  colorMode: 'dark',
  breakpoint: 'lg',
  density: 'default'
});

// Available options
console.log(availableBrands);  // ['bild', 'sportbild', 'advertorial']
console.log(colorModes);       // ['light', 'dark']
console.log(breakpoints);      // ['xs', 'sm', 'md', 'lg']
```

### Primitives (Base Values)

```javascript
import {
  colorPrimitive,
  spacePrimitive,
  sizePrimitive,
  fontPrimitive
} from '@bild/design-tokens/js/primitives';

// Raw color values
console.log(colorPrimitive.bildred);    // "#dd0000"
console.log(colorPrimitive.bild050);    // "#f5f5f5"

// Spacing scale
console.log(spacePrimitive.space1x);    // "8px"
console.log(spacePrimitive.space2x);    // "16px"
console.log(spacePrimitive.space4x);    // "32px"

// Size scale
console.log(sizePrimitive.size4x);      // "32px"
console.log(sizePrimitive.size8x);      // "64px"

// Font primitives
console.log(fontPrimitive.gothamXnarrow);  // "Gotham XNarrow"
```

### Brand-Specific Imports

```javascript
// Import specific brand tokens
import * as bild from '@bild/design-tokens/js/brands/bild';
import * as sportbild from '@bild/design-tokens/js/brands/sportbild';
import * as advertorial from '@bild/design-tokens/js/brands/advertorial';

// Access brand semantic tokens
console.log(bild.semantic.color.light.textColorPrimary);
console.log(sportbild.semantic.color.dark.accentColorPrimary);
```

---

## Multi-Brand Apps

### Runtime Brand Switching

```jsx
import { useState } from 'react';
import { ThemeProvider, useTheme } from '@bild/design-tokens/js/react';

function App() {
  const [colorBrand, setColorBrand] = useState('bild');
  const [colorMode, setColorMode] = useState('light');

  return (
    <ThemeProvider
      colorBrand={colorBrand}
      contentBrand="bild"
      colorMode={colorMode}
    >
      <div>
        <button onClick={() => setColorBrand('bild')}>BILD</button>
        <button onClick={() => setColorBrand('sportbild')}>SportBILD</button>
        <button onClick={() => setColorMode(m => m === 'light' ? 'dark' : 'light')}>
          Toggle Dark Mode
        </button>
        <ThemedContent />
      </div>
    </ThemeProvider>
  );
}
```

### Advertorial with Brand Colors

```jsx
// Advertorial content with BILD colors
<ThemeProvider
  colorBrand="bild"
  contentBrand="advertorial"
  colorMode="light"
>
  <AdvertorialContent />
</ThemeProvider>

// Advertorial content with SportBILD colors
<ThemeProvider
  colorBrand="sportbild"
  contentBrand="advertorial"
  colorMode="light"
>
  <AdvertorialContent />
</ThemeProvider>
```

### White-Label Configuration

```javascript
// Load brand from environment or config
const colorBrand = process.env.REACT_APP_COLOR_BRAND || 'bild';
const contentBrand = process.env.REACT_APP_CONTENT_BRAND || 'bild';

<ThemeProvider
  colorBrand={colorBrand}
  contentBrand={contentBrand}
  colorMode="light"
>
  <App />
</ThemeProvider>
```

---

## File Structure

```
dist/js/
|-- index.js                    # Main entry point (re-exports all modules)
|-- index.d.ts                  # TypeScript definitions
|
|-- primitives/                 # Layer 0: Raw design values
|   |-- index.js                # Exports all primitives
|   |-- colorprimitive.js       # Raw colors (#dd0000, etc.)
|   |-- spaceprimitive.js       # Spacing scale (8px, 16px, etc.)
|   |-- sizeprimitive.js        # Size scale
|   |-- fontprimitive.js        # Font families, weights
|   +-- *.d.ts                  # TypeScript definitions
|
|-- themes/                     # Pre-built & dynamic themes
|   |-- index.js                # Exports createTheme + pre-built themes
|   |-- createTheme.js          # Dynamic theme factory
|   |-- bild-light.js           # Pre-built: BILD Light
|   |-- bild-dark.js            # Pre-built: BILD Dark
|   |-- sportbild-light.js      # Pre-built: SportBILD Light
|   |-- sportbild-dark.js       # Pre-built: SportBILD Dark
|   |-- advertorial-in-bild-light.js
|   |-- advertorial-in-bild-dark.js
|   |-- advertorial-in-sportbild-light.js
|   |-- advertorial-in-sportbild-dark.js
|   +-- *.d.ts                  # TypeScript definitions
|
|-- react/                      # React bindings
|   |-- index.js                # Exports all React utilities
|   |-- index.d.ts              # TypeScript definitions
|   |-- ThemeContext.js         # React Context
|   |-- ThemeProvider.js        # Provider component
|   |-- useTheme.js             # Theme access hook
|   +-- useBreakpoint.js        # Responsive hooks
|
+-- brands/                     # Brand-specific tokens
    |-- index.js                # Exports all brands
    |-- bild/
    |   |-- index.js            # BILD brand entry
    |   +-- semantic/           # Semantic tokens
    |       |-- color/          # Light/Dark colors
    |       |-- sizing/         # Breakpoint sizing
    |       |-- typography/     # Text styles
    |       +-- effects/        # Shadows
    |-- sportbild/
    |   +-- ...                 # Same structure
    +-- advertorial/
        +-- semantic/           # Only sizing/typography (no colors)
```

---

## API Reference

### createTheme(options)

Creates a theme object with tokens for the specified configuration.

```typescript
function createTheme(options: {
  colorBrand?: 'bild' | 'sportbild';
  contentBrand?: 'bild' | 'sportbild' | 'advertorial';
  colorMode?: 'light' | 'dark';
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg';
  density?: 'dense' | 'default' | 'spacious';
}): Theme;
```

**Returns:**

```typescript
interface Theme {
  __meta: {
    brand: string;
    colorBrand: string;
    colorMode: string;
    breakpoint: string;
    density: string;
  };
  colors: {
    textColorPrimary: string;      // "#232629"
    textColorSecondary: string;
    surfaceColorPrimary: string;
    accentColorPrimary: string;
    layerOpacity50: number;        // 50 (opacity stays as number)
    // ... 80+ color tokens
  };
  spacing: {
    gridSpaceRespBase: string;     // "12px"
    gridSpaceRespLG: string;       // "32px"
    pageInlineSpace: string;       // "0px"
    layoutGuideGridColums: number; // 8 (number type stays as number)
    // ... 180+ spacing tokens
  };
  typography: {
    headline1: TypographyStyle;
    headline2: TypographyStyle;
    body: TypographyStyle;
    // ... 30+ text styles
  };
  effects: {
    shadowSoftSm: ShadowLayer[];
    shadowSoftMd: ShadowLayer[];
    shadowSoftLg: ShadowLayer[];
    // ... 8 shadow tokens
  };
  density: Record<string, string>; // Density-specific tokens
}

interface TypographyStyle {
  fontFamily: string;       // "Gotham Condensed"
  fontSize: string;         // "48px"
  fontWeight: number;       // 900
  lineHeight: string;       // "48px"
  letterSpacing?: string;   // "0px"
}

interface ShadowLayer {
  offsetX: number;
  offsetY: number;
  radius: number;
  spread: number;
  color: string;
}
```

### getTokens(colorBrand, contentBrand, colorMode, breakpoint, density)

Low-level function to get raw token objects.

```typescript
function getTokens(
  colorBrand: string,
  contentBrand: string,
  colorMode: string,
  breakpoint: string,
  density: string
): {
  color: object;
  sizing: object;
  typography: object;
  effects: object;
};
```

### ThemeProvider Props

```typescript
interface ThemeProviderProps {
  children: React.ReactNode;
  colorBrand?: 'bild' | 'sportbild';
  contentBrand?: 'bild' | 'sportbild' | 'advertorial';
  colorMode?: 'light' | 'dark';
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg';
  density?: 'dense' | 'default' | 'spacious';
  autoBreakpoint?: boolean;
  defaultBreakpoint?: 'xs' | 'sm' | 'md' | 'lg';
}
```

### useTheme Return Value

```typescript
interface UseThemeResult {
  theme: Theme;
  colorBrand: 'bild' | 'sportbild';
  contentBrand: 'bild' | 'sportbild' | 'advertorial';
  colorMode: 'light' | 'dark';
  breakpoint: 'xs' | 'sm' | 'md' | 'lg';
  density: 'dense' | 'default' | 'spacious';
}
```

### useBreakpoint Hooks

```typescript
function useBreakpoint(): 'xs' | 'sm' | 'md' | 'lg';
function useIsBreakpoint(bp: string): boolean;
function useIsBreakpointUp(bp: string): boolean;
function useIsBreakpointDown(bp: string): boolean;

const BREAKPOINTS: {
  xs: 320;
  sm: 390;
  md: 600;
  lg: 1024;
};
```

---

## Tree-Shaking

The package is designed for optimal tree-shaking:

```javascript
// Good: Import only what you need
import { bildLight } from '@bild/design-tokens/js/themes/bild-light';
import { colorPrimitive } from '@bild/design-tokens/js/primitives/colorprimitive';

// Also good: Named imports from index
import { bildLight, createTheme } from '@bild/design-tokens/js/themes';

// Less optimal: Namespace import (includes all)
import * as themes from '@bild/design-tokens/js/themes';
```

### Bundle Size

| Import | Approximate Size |
|--------|------------------|
| Single theme | ~15 KB |
| All themes | ~120 KB |
| Primitives only | ~8 KB |
| React bindings | ~3 KB |
| Full package | ~150 KB |

---

## TypeScript Support

Full TypeScript definitions are included:

```typescript
import type { Theme } from '@bild/design-tokens/js/themes';
import { createTheme } from '@bild/design-tokens/js/themes';

const theme: Theme = createTheme({
  colorBrand: 'bild',
  colorMode: 'dark'
});

// Type-safe token access
const color: string = theme.color.textColorPrimary;
```

---

## CSS-in-JS Integration

### With styled-components

```jsx
import styled from 'styled-components';
import { ThemeProvider as DSThemeProvider, useTheme } from '@bild/design-tokens/js/react';
import { ThemeProvider as SCThemeProvider } from 'styled-components';

// Wrap styled-components ThemeProvider
function App() {
  return (
    <DSThemeProvider colorBrand="bild" colorMode="light">
      <ThemeWrapper>
        <YourApp />
      </ThemeWrapper>
    </DSThemeProvider>
  );
}

function ThemeWrapper({ children }) {
  const { theme } = useTheme();
  return <SCThemeProvider theme={theme}>{children}</SCThemeProvider>;
}

// Use in styled components - values are CSS-ready strings
const Card = styled.div`
  background: ${props => props.theme.colors.surfaceColorPrimary};
  padding: ${props => props.theme.spacing.gridSpaceRespBase};  /* "12px" */
`;
```

### With Emotion

```jsx
import { ThemeProvider } from '@emotion/react';
import { useTheme } from '@bild/design-tokens/js/react';

function ThemeWrapper({ children }) {
  const { theme } = useTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
```

### With Vanilla CSS Variables

```javascript
import { bildLight } from '@bild/design-tokens/js/themes';

// Generate CSS custom properties - values are already CSS-ready
function generateCSSVariables(theme) {
  const vars = [];
  for (const [key, value] of Object.entries(theme.colors)) {
    if (typeof value === 'string') {
      vars.push(`--color-${key}: ${value};`);
    }
  }
  for (const [key, value] of Object.entries(theme.spacing)) {
    vars.push(`--spacing-${key}: ${value};`);  // Already includes "px"
  }
  return `:root { ${vars.join(' ')} }`;
}

// Output example:
// :root {
//   --color-textColorPrimary: #232629;
//   --spacing-gridSpaceRespBase: 12px;
//   --spacing-gridSpaceRespLG: 32px;
// }
```

---

## Best Practices

### 1. Use Dual-Axis for Advertorial

```jsx
// Correct: Advertorial with explicit color brand
<ThemeProvider
  colorBrand="bild"
  contentBrand="advertorial"
>
  <AdvertorialContent />
</ThemeProvider>

// Avoid: Advertorial doesn't have its own colors
```

### 2. Prefer Pre-built Themes for Static Sites

```javascript
// For SSG/static: Use pre-built themes
import { bildLight } from '@bild/design-tokens/js/themes';

// For dynamic apps: Use createTheme
import { createTheme } from '@bild/design-tokens/js/themes';
```

### 3. Enable Auto-Breakpoint for Responsive UIs

```jsx
// Automatically adapts to viewport
<ThemeProvider autoBreakpoint={true}>
  <ResponsiveApp />
</ThemeProvider>
```

### 4. Handle SSR with Default Breakpoint

```jsx
// SSR-safe: Provide fallback breakpoint
<ThemeProvider
  autoBreakpoint={true}
  defaultBreakpoint="md"
>
  <App />
</ThemeProvider>
```

---

## Token Type Mapping

Token values are automatically formatted based on their `$type` from the Figma source, following the [W3C Design Tokens Community Group (DTCG)](https://www.designtokens.org/) specification:

| Source `$type` | JS Output | Example |
|----------------|-----------|---------|
| `dimension` | `string` with `px` | `"24px"` |
| `fontSize` | `string` with `px` | `"48px"` |
| `lineHeight` | `string` with `px` | `"56px"` |
| `letterSpacing` | `string` with `px` | `"-0.5px"` |
| `color` | `string` (hex/rgba) | `"#DD0000"` |
| `fontWeight` | `number` | `700` |
| `fontFamily` | `string` | `"Gotham Condensed"` |
| `opacity` | `number` (0-100) | `50` |
| `number` | `number` | `8` |
| `boolean` | `boolean` | `true` |
| `string` | `string` | `"value"` |

### Why Strings with Units?

Following industry best practices (Chakra UI, MUI, Tailwind CSS), dimension values include CSS units:

```javascript
// Directly usable in CSS/CSS-in-JS - no transformation needed
<div style={{
  padding: theme.spacing.gridSpaceRespBase,     // "12px" ✓
  fontSize: theme.typography.headline1.fontSize  // "48px" ✓
}}>

// Numbers stay as numbers where appropriate
<div style={{
  fontWeight: theme.typography.headline1.fontWeight,  // 700 ✓
  opacity: theme.colors.layerOpacity50 / 100          // 0.5 ✓
}}>
```

### Composite Types

Typography and shadow tokens are composite objects:

```javascript
// Typography - all dimension properties have px suffix
theme.typography.headline1 = {
  fontFamily: "Gotham Condensed",  // string
  fontWeight: 900,                  // number
  fontSize: "48px",                 // string with px
  lineHeight: "48px",               // string with px
  letterSpacing: "0px"              // string with px
}

// Shadow - array of layers
theme.effects.shadowSoftMd = [
  { offsetX: 0, offsetY: 2, radius: 16, spread: 0, color: "rgba(0,0,0,0.03)" },
  { offsetX: 0, offsetY: 4, radius: 12, spread: 0, color: "rgba(0,0,0,0.07)" }
]
```

---

## Requirements

- Node.js 16+ (ESM support)
- React 18+ (for React bindings)
- Modern bundler with ESM support (Vite, webpack 5, esbuild)

---

## Related Documentation

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | Project Overview |
| [README.tokens.md](./README.tokens.md) | All Platforms |
| [README.ios.md](./README.ios.md) | iOS SwiftUI Integration |
| [README.android.md](./README.android.md) | Android Jetpack Compose |
| [CLAUDE.md](./CLAUDE.md) | Build Pipeline Details |

---

**Generated by BILD Design System Token Pipeline**
