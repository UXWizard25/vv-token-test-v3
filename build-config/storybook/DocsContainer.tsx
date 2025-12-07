import React, { useEffect, useState } from 'react';
import { DocsContainer as BaseContainer } from '@storybook/blocks';
import { addons } from '@storybook/preview-api';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const channel = addons.getChannel();

    // Set initial state from localStorage if available
    const stored = localStorage.getItem('sb-addon-themes-3');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setIsDark(parsed.current === 'dark');
      } catch {
        // Ignore parse errors
      }
    }

    // Listen for dark mode changes
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
