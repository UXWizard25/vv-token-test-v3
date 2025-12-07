import type { Preview } from '@storybook/web-components';
import { html } from 'lit';
import { addons } from '@storybook/preview-api';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
import { bildLightTheme, bildDarkTheme } from './manager';
import { DocsContainer } from './DocsContainer';

// Stencil components are loaded via script tag in preview-head.html
// This ensures they're available before stories render

/**
 * Initialize global data attributes on document load
 * This ensures attributes are set for BOTH stories AND docs pages
 */
function initializeGlobalAttributes() {
  if (typeof document !== 'undefined' && document.documentElement) {
    // Set initial values - these will be updated by the decorator for stories
    // and by the dark mode channel for theme
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('data-color-brand', 'bild');
    document.documentElement.setAttribute('data-content-brand', 'bild');
    document.documentElement.setAttribute('data-density', 'default');
  }
}

// Initialize on load
initializeGlobalAttributes();

/**
 * Listen to dark mode changes from storybook-dark-mode addon
 * Updates data-theme attribute on document.documentElement
 */
const channel = addons.getChannel();
channel.on(DARK_MODE_EVENT_NAME, (isDark: boolean) => {
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }
});

/**
 * Listen to globals updates for docs pages
 * This ensures data attributes are updated even when no decorator runs (pure MDX pages)
 */
channel.on('updateGlobals', (args: { globals: Record<string, string> }) => {
  if (typeof document !== 'undefined' && document.documentElement && args.globals) {
    const { colorBrand, contentBrand, density } = args.globals;
    if (colorBrand) document.documentElement.setAttribute('data-color-brand', colorBrand);
    if (contentBrand) document.documentElement.setAttribute('data-content-brand', contentBrand);
    if (density) document.documentElement.setAttribute('data-density', density);
  }
});

/**
 * Design Token Decorator
 *
 * Sets data attributes for the Dual-Axis architecture:
 * - data-theme: Light/dark mode (controlled by storybook-dark-mode addon)
 * - data-color-brand: Controls colors and effects (bild, sportbild)
 * - data-content-brand: Controls typography, spacing, density (bild, sportbild, advertorial)
 * - data-density: Spacing density (default, dense, spacious)
 *
 * All attributes are set on document.documentElement (html) for CSS selector matching:
 * [data-color-brand="bild"][data-theme="light"] { ... }
 */
const withDesignTokens = (Story: () => unknown, context: { globals: Record<string, string> }) => {
  const { colorBrand, contentBrand, density } = context.globals;

  // Set attributes on document.documentElement (html) for CSS selector matching
  // Note: data-theme is controlled by storybook-dark-mode addon channel
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
  decorators: [withDesignTokens],

  // Toolbar controls - order here determines toolbar order
  // Note: Theme is now controlled by storybook-dark-mode addon (sun/moon toggle)
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

    // Docs configuration with custom container for dynamic theme switching
    docs: {
      toc: true,
      container: DocsContainer,
    },

    // Dark mode addon configuration
    darkMode: {
      dark: bildDarkTheme,
      light: bildLightTheme,
      stylePreview: true, // Apply dark class to preview
    },
  },
};

export default preview;
