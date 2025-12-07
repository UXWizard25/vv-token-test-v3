import { addons } from '@storybook/manager-api';
import { bildLightTheme } from './themes';

/**
 * Storybook Manager Configuration
 *
 * Sets the default theme for the Storybook manager UI (sidebar, toolbar).
 * Themes are defined in themes.ts and shared with preview context.
 */
addons.setConfig({
  theme: bildLightTheme, // Default theme
});
