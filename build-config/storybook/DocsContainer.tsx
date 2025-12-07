import React from 'react';
import { DocsContainer as BaseContainer } from '@storybook/blocks';
import { useDarkMode } from 'storybook-dark-mode';
import { bildLightTheme, bildDarkTheme } from './manager';

/**
 * Custom DocsContainer that dynamically switches the Storybook docs theme
 * based on the dark mode state from storybook-dark-mode addon.
 *
 * This ensures the entire docs page (wrapper, content, tables, etc.)
 * properly adapts to light/dark mode changes.
 */
export const DocsContainer: React.FC<React.ComponentProps<typeof BaseContainer>> = ({
  children,
  ...props
}) => {
  const isDark = useDarkMode();

  return (
    <BaseContainer {...props} theme={isDark ? bildDarkTheme : bildLightTheme}>
      {children}
    </BaseContainer>
  );
};

export default DocsContainer;
