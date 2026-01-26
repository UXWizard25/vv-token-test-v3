import type { Preview } from '@storybook/web-components-vite';
import { html } from 'lit';
import { addons } from 'storybook/preview-api';
import { DARK_MODE_EVENT_NAME } from '@vueless/storybook-dark-mode';
import { bildLightTheme, bildDarkTheme } from './themes';
import { DocsContainer } from './DocsContainer';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pipelineConfig = require('../tokens/pipeline.config.js');

// Derived config values
const DATA_ATTRS = pipelineConfig.platforms.css.dataAttributes;
const COLOR_BRANDS = pipelineConfig.brands.colorBrands;
const CONTENT_BRANDS = pipelineConfig.brands.contentBrands;
const DENSITY_MODES = pipelineConfig.modes.density;
const DEFAULT_BRAND = pipelineConfig.brands.defaultBrand;
const DISPLAY_NAMES = pipelineConfig.brands.displayNames;
const DENSITY_DISPLAY_NAMES = pipelineConfig.modes.densityDisplayNames;
const COLOR_MODES = pipelineConfig.modes.color;

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
    document.documentElement.setAttribute(DATA_ATTRS.theme, COLOR_MODES[0]);
    document.documentElement.setAttribute(DATA_ATTRS.colorBrand, DEFAULT_BRAND);
    document.documentElement.setAttribute(DATA_ATTRS.contentBrand, DEFAULT_BRAND);
    document.documentElement.setAttribute(DATA_ATTRS.density, DENSITY_MODES[0]);
  }

  // Set icons base path for GitHub Pages and other subpath deployments
  // import.meta.env.BASE_URL is provided by Vite based on the 'base' config
  if (typeof window !== 'undefined') {
    const baseUrl = import.meta.env?.BASE_URL || '/';
    (window as Window & { __ICONS_BASE_PATH__?: string }).__ICONS_BASE_PATH__ = `${baseUrl}icons`;
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
    document.documentElement.setAttribute(DATA_ATTRS.theme, isDark ? COLOR_MODES[1] : COLOR_MODES[0]);
  }
});

/**
 * Listen to globals updates for docs pages
 * This ensures data attributes are updated even when no decorator runs (pure MDX pages)
 */
channel.on('updateGlobals', (args: { globals: Record<string, string> }) => {
  if (typeof document !== 'undefined' && document.documentElement && args.globals) {
    const { colorBrand, contentBrand, density } = args.globals;
    if (colorBrand) document.documentElement.setAttribute(DATA_ATTRS.colorBrand, colorBrand);
    if (contentBrand) document.documentElement.setAttribute(DATA_ATTRS.contentBrand, contentBrand);
    if (density) document.documentElement.setAttribute(DATA_ATTRS.density, density);
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
    document.documentElement.setAttribute(DATA_ATTRS.colorBrand, colorBrand);
    document.documentElement.setAttribute(DATA_ATTRS.contentBrand, contentBrand);
    document.documentElement.setAttribute(DATA_ATTRS.density, density);
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
        items: COLOR_BRANDS.map(b => ({ value: b, title: DISPLAY_NAMES[b] || b, icon: 'circle' })),
        dynamicTitle: true,
      },
    },
    contentBrand: {
      description: 'Content brand (typography, spacing)',
      toolbar: {
        title: 'Content Brand',
        icon: 'document',
        items: CONTENT_BRANDS.map(b => ({ value: b, title: DISPLAY_NAMES[b] || b })),
        dynamicTitle: true,
      },
    },
    density: {
      description: 'Spacing density',
      toolbar: {
        title: 'Density',
        icon: 'component',
        items: DENSITY_MODES.map(d => ({ value: d, title: DENSITY_DISPLAY_NAMES[d] || d })),
        dynamicTitle: true,
      },
    },
  },

  // Initial global values
  initialGlobals: {
    colorBrand: DEFAULT_BRAND,
    contentBrand: DEFAULT_BRAND,
    density: DENSITY_MODES[0],
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

    // Backgrounds addon - use canvas background (consistent with sidebar)
    backgrounds: {
      default: 'canvas',
      values: [
        { name: 'canvas', value: 'var(--bg-color-primary, #FFFFFF)' },
        { name: 'light-gray', value: '#F2F4F5' },
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
