import { Config } from '@stencil/core';
import { reactOutputTarget } from '@stencil/react-output-target';
import { vueOutputTarget } from '@stencil/vue-output-target';

export const config: Config = {
  namespace: 'bds',
  srcDir: '../../packages/components/src',
  globalStyle: '../../packages/tokens/dist/css/bundles/bild.css',
  outputTargets: [
    {
      type: 'dist',
      dir: '../../packages/components/dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      dir: '../../packages/components/dist/components',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'www',
      dir: '../../packages/components/dist/www',
      serviceWorker: null,
      copy: [
        { src: '../../tokens/dist/css', dest: 'css' },
      ],
    },
    {
      type: 'docs-readme',
      dir: '../../packages/components/dist/docs',
    },
    // React wrapper output
    reactOutputTarget({
      outDir: '../../packages/react/src',
      stencilPackageName: '@marioschmidt/design-system-components',
      customElementsDir: 'dist/components',
    }),
    // Vue wrapper output
    vueOutputTarget({
      componentCorePackage: '@marioschmidt/design-system-components',
      proxiesFile: '../../packages/vue/src/components.ts',
      includeImportCustomElements: true,
      customElementsDir: 'dist/components',
    }),
  ],
  testing: {
    browserHeadless: 'new',
  },
  devServer: {
    reloadStrategy: 'pageReload',
    port: 3333,
  },
};
