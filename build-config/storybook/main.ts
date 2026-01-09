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
    '../../apps/docs/stories/**/*.mdx',                                    // Foundation documentation
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

  // Static directories for CSS bundles, Stencil components, icons, and JSON tokens
  // Using resolve() to ensure paths are absolute for Vite compatibility
  staticDirs: [
    {
      from: resolve(__dirname, '../../packages/tokens/dist/css'),
      to: '/css',
    },
    {
      from: resolve(__dirname, '../../packages/components/core/dist'),
      to: '/stencil',
    },
    {
      from: resolve(__dirname, '../../packages/tokens/dist/json'),
      to: '/json',
    },
    {
      from: resolve(__dirname, '../../packages/icons/svg/dist'),
      to: '/icons',
    },
  ],

  // Vite configuration
  viteFinal: async (config, { configType }) => {
    // Set base path for GitHub Pages production builds
    // In development, base is '/', in production it's '/vv-token-test-v3/'
    const isProduction = configType === 'PRODUCTION';
    const basePath = isProduction ? '/vv-token-test-v3/' : '/';
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

    // Define paths for static directories
    const iconsPath = resolve(__dirname, '../../packages/icons/svg/dist');
    const cssPath = resolve(__dirname, '../../packages/tokens/dist/css');
    const stencilPath = resolve(__dirname, '../../packages/components/core/dist');
    const jsonPath = resolve(__dirname, '../../packages/tokens/dist/json');

    return {
      ...config,
      // Set base path for GitHub Pages (only in production)
      base: basePath,
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
      // Server configuration to allow serving from external directories
      server: {
        ...config.server,
        fs: {
          ...config.server?.fs,
          allow: [
            ...(config.server?.fs?.allow ?? []),
            iconsPath,
            cssPath,
            stencilPath,
            jsonPath,
            resolve(__dirname, '../../'),
          ],
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
