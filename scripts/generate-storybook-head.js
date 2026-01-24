#!/usr/bin/env node

/**
 * Generate Storybook preview-head.html
 *
 * Generates the dynamic portions of preview-head.html from pipeline.config.js:
 * - CSS bundle link tags (one per brand)
 * - Stencil Web Components loader script
 * - Initial data-attribute values
 *
 * The CSS styling section (dark mode overrides, font declarations) is kept static
 * as it contains design-system-specific token values.
 *
 * Usage: node scripts/generate-storybook-head.js
 */

const fs = require('fs');
const path = require('path');
const pipelineConfig = require('../build-config/tokens/pipeline.config.js');

const PREVIEW_HEAD_PATH = path.join(__dirname, '../build-config/storybook/preview-head.html');

const BRANDS = pipelineConfig.brands.all;
const NAMESPACE = pipelineConfig.stencil.namespace;
const DATA_ATTRS = pipelineConfig.platforms.css.dataAttributes;
const DEFAULT_BRAND = pipelineConfig.brands.defaultBrand;
const DEFAULT_COLOR_MODE = pipelineConfig.modes.color[0];
const DEFAULT_DENSITY = pipelineConfig.modes.density[0];

function generate() {
  if (!fs.existsSync(PREVIEW_HEAD_PATH)) {
    console.error('❌ preview-head.html not found at:', PREVIEW_HEAD_PATH);
    process.exit(1);
  }

  let content = fs.readFileSync(PREVIEW_HEAD_PATH, 'utf-8');

  // 1. Replace CSS bundle link tags
  // Match the block of consecutive link tags for CSS bundles
  const cssLinkRegex = /<!-- Design Token CSS Bundles[^>]*-->\n((?:<link rel="stylesheet" href="\.\/css\/bundles\/[^"]+\.css" \/>\n)+)/;
  const newCssLinks = BRANDS.map(brand =>
    `<link rel="stylesheet" href="./css/bundles/${brand}.css" />`
  ).join('\n') + '\n';
  content = content.replace(cssLinkRegex, `<!-- Design Token CSS Bundles (relative paths for GitHub Pages compatibility) -->\n${newCssLinks}`);

  // 2. Replace Stencil loader script path
  const stencilRegex = /<script type="module" src="\.\/stencil\/[^/]+\/[^"]+\.esm\.js"><\/script>/;
  content = content.replace(stencilRegex, `<script type="module" src="./stencil/${NAMESPACE}/${NAMESPACE}.esm.js"></script>`);

  // 3. Replace initial data attribute script
  const attrScriptRegex = /\(function\(\) \{\s*var html = document\.documentElement;\s*html\.setAttribute\('[^']+', '[^']+'\);\s*html\.setAttribute\('[^']+', '[^']+'\);\s*html\.setAttribute\('[^']+', '[^']+'\);\s*html\.setAttribute\('[^']+', '[^']+'\);\s*\}\)\(\);/;
  const newAttrScript = `(function() {
    var html = document.documentElement;
    html.setAttribute('${DATA_ATTRS.colorBrand}', '${DEFAULT_BRAND}');
    html.setAttribute('${DATA_ATTRS.contentBrand}', '${DEFAULT_BRAND}');
    html.setAttribute('${DATA_ATTRS.theme}', '${DEFAULT_COLOR_MODE}');
    html.setAttribute('${DATA_ATTRS.density}', '${DEFAULT_DENSITY}');
  })();`;
  content = content.replace(attrScriptRegex, newAttrScript);

  // 4. Replace data-theme references in CSS selectors
  // The CSS uses html[data-theme="dark"] selectors
  content = content.replace(/html\[data-theme=/g, `html[${DATA_ATTRS.theme}=`);

  fs.writeFileSync(PREVIEW_HEAD_PATH, content, 'utf-8');
  console.log('✅ preview-head.html updated from pipeline config');
  console.log(`   Brands: ${BRANDS.join(', ')}`);
  console.log(`   Namespace: ${NAMESPACE}`);
  console.log(`   Default: ${DATA_ATTRS.colorBrand}="${DEFAULT_BRAND}", ${DATA_ATTRS.theme}="${DEFAULT_COLOR_MODE}"`);
}

generate();
