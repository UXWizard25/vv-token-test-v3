import type { StorybookConfig } from '@storybook/web-components-vite';
import { join, dirname } from 'path';

/**
 * Resolve package path helper
 */
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  // Stories location: next to components
  stories: ['../../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  // Addons
  addons: [
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-docs'),
  ],

  // Framework: Web Components with Vite
  framework: {
    name: getAbsolutePath('@storybook/web-components-vite') as '@storybook/web-components-vite',
    options: {},
  },

  // Static directories for CSS bundles and Stencil components
  staticDirs: [
    {
      from: '../../dist/css',
      to: '/css',
    },
    {
      from: '../../dist/stencil',
      to: '/stencil',
    },
  ],

  // Vite configuration
  viteFinal: async (config) => {
    return {
      ...config,
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
