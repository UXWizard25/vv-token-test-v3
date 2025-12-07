import { Config } from '@stencil/core';

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
    },
    {
      type: 'www',
      dir: '../../packages/components/dist/www',
      serviceWorker: null,
      copy: [
        { src: '../../packages/tokens/dist/css', dest: 'css' },
      ],
    },
    {
      type: 'docs-readme',
      dir: '../../packages/components/dist/docs',
    },
  ],
  testing: {
    browserHeadless: 'new',
  },
  devServer: {
    reloadStrategy: 'pageReload',
    port: 3333,
  },
};
