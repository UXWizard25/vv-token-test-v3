import { Config } from '@stencil/core';
import { reactOutputTarget } from '@stencil/react-output-target';
import { vueOutputTarget } from '@stencil/vue-output-target';

export const config: Config = {
  namespace: 'bds',
  srcDir: '../../packages/components/core/src',
  globalStyle: '../../packages/tokens/dist/css/bundles/bild.css',
  outputTargets: [
    {
      type: 'dist',
      dir: '../../packages/components/core/dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      dir: '../../packages/components/core/dist/components',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'www',
      dir: '../../packages/components/core/dist/www',
      serviceWorker: null,
      copy: [
        { src: '../../../tokens/dist/css', dest: 'css' },
        { src: '../../../icons/svg/dist', dest: 'icons' },
      ],
    },
    {
      type: 'docs-readme',
      dir: '../../packages/components/core/dist/docs',
    },
    // React wrapper output
    reactOutputTarget({
      outDir: '../../packages/components/react/src',
      stencilPackageName: '@marioschmidt/design-system-components',
      customElementsDir: 'dist/components',
    }),
    // Vue wrapper output
    vueOutputTarget({
      componentCorePackage: '@marioschmidt/design-system-components',
      proxiesFile: '../../packages/components/vue/src/components.ts',
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
