import { Config } from '@stencil/core';
import { reactOutputTarget } from '@stencil/react-output-target';
import { vueOutputTarget } from '@stencil/vue-output-target';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pipelineConfig = require('../tokens/pipeline.config.js');

const NAMESPACE = pipelineConfig.stencil.namespace;
const COMPONENTS_PKG = pipelineConfig.packages.components.npm;
const SRC_DIR = `../../${pipelineConfig.components.srcDir}`;
const DIST_DIR = '../../packages/components/core/dist';
const DEFAULT_BRAND = pipelineConfig.brands.defaultBrand;
const TOKENS_DIST = `../../${pipelineConfig.output.distDir}`;

export const config: Config = {
  namespace: NAMESPACE,
  srcDir: SRC_DIR,
  globalStyle: `${TOKENS_DIST}css/bundles/${DEFAULT_BRAND}.css`,
  outputTargets: [
    {
      type: 'dist',
      dir: DIST_DIR,
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
      dir: `${DIST_DIR}/components`,
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'www',
      dir: `${DIST_DIR}/www`,
      serviceWorker: null,
      copy: [
        { src: '../../../tokens/dist/css', dest: 'css' },
        { src: '../../../icons/svg/dist', dest: 'icons' },
      ],
    },
    {
      type: 'docs-readme',
      dir: `${DIST_DIR}/docs`,
    },
    // React wrapper output
    reactOutputTarget({
      outDir: '../../packages/components/react/src',
      stencilPackageName: COMPONENTS_PKG,
      customElementsDir: 'dist/components',
    }),
    // Vue wrapper output
    vueOutputTarget({
      componentCorePackage: COMPONENTS_PKG,
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
    port: pipelineConfig.stencil.devServerPort,
  },
};
