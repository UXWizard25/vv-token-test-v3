import React, { useEffect, useState } from 'react';
import { DocsContainer as BaseContainer } from '@storybook/blocks';
import { addons } from '@storybook/preview-api';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
import { bildLightTheme, bildDarkTheme } from './manager';

/**
 * Custom DocsContainer that dynamically switches the Storybook docs theme
 * based on the dark mode state from storybook-dark-mode addon.
 *
 * Note: We can't use useDarkMode() hook here because it's a Storybook hook
 * that only works inside decorators. Instead we use the channel API with
 * React's useState/useEffect.
 */
export const DocsContainer: React.FC<React.ComponentProps<typeof BaseContainer>> = ({
  children,
  ...props
}) => {
  // Get initial state from localStorage
  const getInitialDarkMode = (): boolean => {
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
  };

  const [isDark, setIsDark] = useState(getInitialDarkMode);

  useEffect(() => {
    const channel = addons.getChannel();

    const handleDarkModeChange = (dark: boolean) => {
      setIsDark(dark);
    };

    channel.on(DARK_MODE_EVENT_NAME, handleDarkModeChange);

    return () => {
      channel.off(DARK_MODE_EVENT_NAME, handleDarkModeChange);
    };
  }, []);

  return (
    <BaseContainer {...props} theme={isDark ? bildDarkTheme : bildLightTheme}>
      {children}
    </BaseContainer>
  );
};

export default DocsContainer;
