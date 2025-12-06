import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'bds',
  srcDir: '../../src/components',
  globalStyle: '../../dist/css/bundles/bild.css',
  outputTargets: [
    {
      type: 'dist',
      dir: '../../dist/stencil',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      dir: '../../dist/stencil/components',
      customElementsExportBehavior: 'auto-define-custom-elements',
    },
    {
      type: 'www',
      dir: '../../dist/stencil/www',
      serviceWorker: null,
      copy: [
        { src: '../../dist/css', dest: 'css' },
      ],
    },
    {
      type: 'docs-readme',
      dir: '../../dist/stencil/docs',
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
