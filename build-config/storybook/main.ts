import type { StorybookConfig } from '@storybook/web-components-vite';
import { join, dirname } from 'path';
import react from '@vitejs/plugin-react';

/**
 * Resolve package path helper
 */
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  // Stories and documentation location
  stories: [
    '../../packages/components/docs/**/*.mdx',                               // Documentation
    '../../packages/components/src/**/*.stories.@(js|jsx|mjs|ts|tsx)' // Component stories
  ],

  // Addons
  addons: [
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('storybook-dark-mode'),
  ],

  // Framework: Web Components with Vite
  framework: {
    name: getAbsolutePath('@storybook/web-components-vite') as '@storybook/web-components-vite',
    options: {},
  },

  // Static directories for CSS bundles, Stencil components, and JSON tokens
  staticDirs: [
    {
      from: '../../packages/tokens/dist/css',
      to: '/css',
    },
    {
      from: '../../packages/components/dist',
      to: '/stencil',
    },
    {
      from: '../../packages/tokens/dist/json',
      to: '/json',
    },
  ],

  // Vite configuration
  viteFinal: async (config) => {
    return {
      ...config,
      // Add React plugin for DocsContainer.tsx
      plugins: [
        ...(config.plugins ?? []),
        react(),
      ],
      // Ensure proper resolution for Stencil components
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
        },
      },
      // Optimize dependencies
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [
          ...(config.optimizeDeps?.include ?? []),
          'lit',
          'lit/decorators.js',
          'react',
          'react-dom',
        ],
      },
    };
  },

  // Documentation settings
  docs: {
    autodocs: 'tag',
  },

  // TypeScript configuration
  typescript: {
    check: false,
    reactDocgen: false,
  },
};

export default config;
