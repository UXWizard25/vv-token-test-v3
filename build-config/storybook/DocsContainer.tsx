import React, { useEffect, useState } from 'react';
import { DocsContainer as BaseContainer, type DocsContainerProps } from '@storybook/blocks';
import { addons } from '@storybook/preview-api';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
import { bildLightTheme, bildDarkTheme } from './manager';

// Get channel outside component to ensure it's available immediately
const channel = addons.getChannel();

/**
 * Custom DocsContainer that dynamically switches the Storybook docs theme
 * based on the dark mode state from storybook-dark-mode addon.
 *
 * Note: We can't use useDarkMode() hook here because it's a Storybook hook
 * that only works inside decorators. Instead we use the channel API with
 * React's useState/useEffect.
 *
 * @see https://github.com/storybookjs/storybook/issues/28758
 */
export const DocsContainer: React.FC<React.PropsWithChildren<DocsContainerProps>> = ({
  children,
  context,
  ...props
}) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Get initial state from localStorage
    if (typeof window === 'undefined') return false;
    try {
      const stored = window.localStorage.getItem('sb-addon-themes-3');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.current === 'dark';
      }
    } catch {
      // Ignore
    }
    return false;
  });

  useEffect(() => {
    // Listen for dark mode changes
    channel.on(DARK_MODE_EVENT_NAME, setIsDark);

    return () => {
      channel.off(DARK_MODE_EVENT_NAME, setIsDark);
    };
  }, []);

  return (
    <BaseContainer
      context={context}
      theme={isDark ? bildDarkTheme : bildLightTheme}
      {...props}
    >
      {children}
    </BaseContainer>
  );
};

export default DocsContainer;
