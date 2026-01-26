#!/usr/bin/env node

/**
 * Fix Vue Output Target JSX Import Path
 *
 * The @stencil/vue-output-target generates an incorrect import path for JSX types:
 *   import type { JSX } from '@marioschmidt/design-system-components/dist/components';
 *
 * This should be:
 *   import type { JSX } from '@marioschmidt/design-system-components';
 *
 * This script automatically fixes this after the Stencil build.
 */

const fs = require('fs');
const path = require('path');
const pipelineConfig = require('../build-config/tokens/pipeline.config.js');

const COMPONENTS_PKG = pipelineConfig.packages.components;
const VUE_COMPONENTS_FILE = path.join(__dirname, '../packages/components/vue/src/components.ts');

function fixVueImports() {
  console.log('🔧 Fixing Vue JSX import path...');

  if (!fs.existsSync(VUE_COMPONENTS_FILE)) {
    console.log('⚠️  Vue components file not found, skipping fix');
    return false;
  }

  let content = fs.readFileSync(VUE_COMPONENTS_FILE, 'utf-8');

  // Fix the incorrect import path
  const incorrectImport = `from '${COMPONENTS_PKG}/dist/components'`;
  const correctImport = `from '${COMPONENTS_PKG}'`;

  if (content.includes(incorrectImport)) {
    content = content.replace(incorrectImport, correctImport);
    fs.writeFileSync(VUE_COMPONENTS_FILE, content, 'utf-8');
    console.log('✅ Fixed Vue JSX import path');
    return true;
  } else if (content.includes(correctImport)) {
    console.log('✅ Vue JSX import path already correct');
    return true;
  } else {
    console.log('⚠️  Could not find expected import pattern');
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  const success = fixVueImports();
  process.exit(success ? 0 : 1);
}

module.exports = { fixVueImports };
