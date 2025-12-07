import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming';

/**
 * BILD Design System - Custom Storybook UI Themes
 *
 * Defines light and dark themes for the Storybook UI (sidebar, toolbar, etc.)
 * Used by storybook-dark-mode addon for automatic theme switching.
 */

// Light theme based on BILD design tokens
const bildLightTheme = create({
  base: 'light',

  // Brand
  brandTitle: 'BILD Design System',
  brandUrl: 'https://github.com/UXWizard25/vv-token-test-v3',

  // Colors - based on BILD color primitives
  colorPrimary: '#DD0000', // --color-bild-red-50
  colorSecondary: '#DD0000', // --color-bild-red-50

  // UI colors (light mode)
  appBg: '#F2F4F5', // --color-neutral-96
  appContentBg: '#FFFFFF', // --color-neutral-100
  appPreviewBg: '#FFFFFF', // --color-neutral-100 (preview/canvas area)
  appBorderColor: '#CED4DA', // --color-neutral-85
  appBorderRadius: 4,

  // Text colors (light mode)
  textColor: '#232629', // --color-neutral-15
  textInverseColor: '#FFFFFF', // --color-neutral-100
  textMutedColor: '#666B70', // --color-neutral-45

  // Toolbar (light mode)
  barTextColor: '#4B525A', // --color-neutral-35
  barSelectedColor: '#DD0000', // --color-bild-red-50
  barHoverColor: '#DD0000', // --color-bild-red-50
  barBg: '#FFFFFF', // --color-neutral-100

  // Form colors
  inputBg: '#FFFFFF',
  inputBorder: '#CED4DA',
  inputTextColor: '#232629',
  inputBorderRadius: 4,
});

// Dark theme based on BILD design tokens
const bildDarkTheme = create({
  base: 'dark',

  // Brand
  brandTitle: 'BILD Design System',
  brandUrl: 'https://github.com/UXWizard25/vv-token-test-v3',

  // Colors - based on BILD color primitives
  colorPrimary: '#DD0000', // --color-bild-red-50
  colorSecondary: '#DD0000', // --color-bild-red-50

  // UI colors (dark mode)
  appBg: '#1C1C1C', // --color-neutral-10
  appContentBg: '#232629', // --color-neutral-15
  appPreviewBg: '#232629', // --color-neutral-15 (preview/canvas area)
  appBorderColor: '#4B525A', // --color-neutral-35
  appBorderRadius: 4,

  // Text colors (dark mode)
  textColor: '#F2F4F5', // --color-neutral-96
  textInverseColor: '#232629', // --color-neutral-15
  textMutedColor: '#9CA3AB', // --color-neutral-65

  // Toolbar (dark mode)
  barTextColor: '#CED4DA', // --color-neutral-85
  barSelectedColor: '#DD0000', // --color-bild-red-50
  barHoverColor: '#DD0000', // --color-bild-red-50
  barBg: '#1C1C1C', // --color-neutral-10

  // Form colors
  inputBg: '#232629',
  inputBorder: '#4B525A',
  inputTextColor: '#F2F4F5',
  inputBorderRadius: 4,
});

// Configure Storybook with dark mode addon themes
addons.setConfig({
  theme: bildLightTheme, // Default theme
});

// Export themes for storybook-dark-mode addon (used in preview.ts)
export { bildLightTheme, bildDarkTheme };
