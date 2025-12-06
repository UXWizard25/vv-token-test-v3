import type { Preview } from '@storybook/web-components';
import { html } from 'lit';
import { withThemeByDataAttribute } from '@storybook/addon-themes';

// Stencil components are loaded via script tag in preview-head.html
// This ensures they're available before stories render

/**
 * Design Token Decorator for Color Brand, Content Brand, and Density
 *
 * Sets data attributes for the Dual-Axis architecture:
 * - data-color-brand: Controls colors and effects (bild, sportbild)
 * - data-content-brand: Controls typography, spacing, density (bild, sportbild, advertorial)
 * - data-density: Spacing density (default, dense, spacious)
 *
 * IMPORTANT: All attributes MUST be set on document.documentElement (html)
 * because withThemeByDataAttribute sets data-theme there, and CSS selectors
 * require all attributes on the same element:
 * [data-color-brand="bild"][data-theme="light"] { ... }
 */
const withDesignTokens = (Story: () => unknown, context: { globals: Record<string, string> }) => {
  const { colorBrand, contentBrand, density } = context.globals;

  // Set attributes on document.documentElement (html) for CSS selector matching
  // withThemeByDataAttribute also sets data-theme on documentElement
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.setAttribute('data-color-brand', colorBrand);
    document.documentElement.setAttribute('data-content-brand', contentBrand);
    document.documentElement.setAttribute('data-density', density);
  }

  return html`
    <div
      style="padding: 1rem; min-height: 100px;"
    >
      ${Story()}
    </div>
  `;
};

const preview: Preview = {
  // Global decorators - order matters! withThemeByDataAttribute should run first
  decorators: [
    withDesignTokens,
    // Theme decorator from @storybook/addon-themes - sets data-theme on document.documentElement
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],

  // Toolbar controls for brand and density switching
  globalTypes: {
    colorBrand: {
      description: 'Color brand (colors & effects)',
      toolbar: {
        title: 'Color Brand',
        icon: 'paintbrush',
        items: [
          { value: 'bild', title: 'BILD', icon: 'circle' },
          { value: 'sportbild', title: 'SportBILD', icon: 'circle' },
        ],
        dynamicTitle: true,
      },
    },
    contentBrand: {
      description: 'Content brand (typography, spacing)',
      toolbar: {
        title: 'Content Brand',
        icon: 'document',
        items: [
          { value: 'bild', title: 'BILD' },
          { value: 'sportbild', title: 'SportBILD' },
          { value: 'advertorial', title: 'Advertorial' },
        ],
        dynamicTitle: true,
      },
    },
    density: {
      description: 'Spacing density',
      toolbar: {
        title: 'Density',
        icon: 'component',
        items: [
          { value: 'default', title: 'Default' },
          { value: 'dense', title: 'Dense' },
          { value: 'spacious', title: 'Spacious' },
        ],
        dynamicTitle: true,
      },
    },
  },

  // Initial global values
  initialGlobals: {
    colorBrand: 'bild',
    contentBrand: 'bild',
    density: 'default',
  },

  // Default parameters
  parameters: {
    // Actions configuration
    actions: { argTypesRegex: '^on[A-Z].*' },

    // Controls configuration
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    // Backgrounds addon - use canvas background
    backgrounds: {
      default: 'canvas',
      values: [
        { name: 'canvas', value: 'var(--surface-color-canvas, #F0F2F4)' },
        { name: 'white', value: '#ffffff' },
        { name: 'dark', value: '#232629' },
      ],
    },

    // Docs configuration
    docs: {
      toc: true,
    },
  },
};

export default preview;
