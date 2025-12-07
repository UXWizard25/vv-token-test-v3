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
      // Try storybook-dark-mode key
      const stored = window.localStorage.getItem('sb-addon-themes-3');
      console.log('[DocsContainer] localStorage sb-addon-themes-3:', stored);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('[DocsContainer] parsed:', parsed);
        return parsed.current === 'dark';
      }
    } catch (e) {
      console.error('[DocsContainer] localStorage error:', e);
    }
    return false;
  });

  useEffect(() => {
    console.log('[DocsContainer] Setting up channel listener for:', DARK_MODE_EVENT_NAME);

    const handleDarkModeChange = (dark: boolean) => {
      console.log('[DocsContainer] Received dark mode event:', dark);
      setIsDark(dark);
    };

    channel.on(DARK_MODE_EVENT_NAME, handleDarkModeChange);

    return () => {
      channel.off(DARK_MODE_EVENT_NAME, handleDarkModeChange);
    };
  }, []);

  console.log('[DocsContainer] Rendering with isDark:', isDark);

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
