import type { StorybookConfig } from '@storybook/web-components-vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Resolve package path helper (ESM-compatible for Storybook 10)
 */
function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(value)));
}

const config: StorybookConfig = {
  // Stories and documentation location
  stories: [
    '../../packages/components/core/docs/**/*.mdx',                               // Documentation
    '../../packages/components/core/src/**/*.stories.@(js|jsx|mjs|ts|tsx)' // Component stories
  ],

  // Addons (addon-essentials is now part of core in Storybook 10)
  addons: [
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@vueless/storybook-dark-mode'),
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
      from: '../../packages/components/core/dist',
      to: '/stencil',
    },
    {
      from: '../../packages/tokens/dist/json',
      to: '/json',
    },
  ],

  // Vite configuration
  viteFinal: async (config) => {
    // Custom plugin to fix file:// URLs in MDX imports
    const fixMdxImportsPlugin = {
      name: 'fix-mdx-imports',
      enforce: 'pre' as const,
      resolveId(source: string) {
        // Fix file:// protocol URLs that break Rollup
        if (source.startsWith('file://')) {
          try {
            // Convert file:// URL to actual filesystem path
            const resolved = fileURLToPath(source);
            return resolved;
          } catch {
            // Fallback for malformed URLs like file://./...
            const fixedPath = source.replace(/^file:\/\/\.?\//, '');
            return resolve(__dirname, '../../', fixedPath);
          }
        }
        return null;
      },
    };

    return {
      ...config,
      // Add React plugin for DocsContainer.tsx
      plugins: [
        fixMdxImportsPlugin,
        ...(config.plugins ?? []),
        react(),
      ],
      // Ensure proper resolution for Stencil components and MDX
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
          '@mdx-js/react',
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
