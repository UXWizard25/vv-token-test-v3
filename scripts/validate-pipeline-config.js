#!/usr/bin/env node

/**
 * Pipeline Configuration Validator
 *
 * Validates pipeline.config.js for:
 * - Required fields and correct types
 * - Cross-references between sections (brands in modes, etc.)
 * - File/directory existence (optional, with --check-paths flag)
 * - Figma ID format consistency
 *
 * Usage:
 *   node scripts/validate-pipeline-config.js              # Structure validation only
 *   node scripts/validate-pipeline-config.js --check-paths # Also check file paths exist
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '../build-config/tokens/pipeline.config.js');
const ROOT_DIR = path.join(__dirname, '..');

let errors = [];
let warnings = [];

function error(msg) { errors.push(`❌ ${msg}`); }
function warn(msg) { warnings.push(`⚠️  ${msg}`); }
function ok(msg) { console.log(`  ✅ ${msg}`); }

// ─── Type Helpers ────────────────────────────────────────────────────────────

function assertString(val, path, minLen = 1) {
  if (typeof val !== 'string') return error(`${path}: expected string, got ${typeof val}`);
  if (val.length < minLen) return error(`${path}: must be at least ${minLen} characters`);
}

function assertArray(val, path, minLen = 1) {
  if (!Array.isArray(val)) return error(`${path}: expected array, got ${typeof val}`);
  if (val.length < minLen) return error(`${path}: must have at least ${minLen} element(s)`);
}

function assertObject(val, path) {
  if (!val || typeof val !== 'object' || Array.isArray(val)) {
    return error(`${path}: expected object, got ${Array.isArray(val) ? 'array' : typeof val}`);
  }
}

function assertBoolean(val, path) {
  if (typeof val !== 'boolean') return error(`${path}: expected boolean, got ${typeof val}`);
}

function assertNumber(val, path, min = 0) {
  if (typeof val !== 'number') return error(`${path}: expected number, got ${typeof val}`);
  if (val < min) return error(`${path}: must be >= ${min}`);
}

// ─── Section Validators ──────────────────────────────────────────────────────

function validateIdentity(config) {
  console.log('\n📋 identity:');
  const id = config.identity;
  if (!id) return error('identity: section missing');

  assertString(id.name, 'identity.name');
  assertString(id.shortName, 'identity.shortName');
  assertString(id.copyright, 'identity.copyright');
  assertString(id.repositoryUrl, 'identity.repositoryUrl');

  if (id.repositoryUrl && !id.repositoryUrl.startsWith('https://')) {
    warn('identity.repositoryUrl: should start with https://');
  }

  ok('identity section valid');
}

function validateSource(config, checkPaths) {
  console.log('\n📋 source:');
  const src = config.source;
  if (!src) return error('source: section missing');

  assertString(src.inputFile, 'source.inputFile');
  assertString(src.inputDir, 'source.inputDir');
  assertString(src.outputDir, 'source.outputDir');

  // Check directories end with /
  if (src.inputDir && !src.inputDir.endsWith('/')) {
    warn('source.inputDir: should end with /');
  }
  if (src.outputDir && !src.outputDir.endsWith('/')) {
    warn('source.outputDir: should end with /');
  }

  // Validate collections
  assertObject(src.collections, 'source.collections');
  if (src.collections) {
    const requiredCollections = [
      'FONT_PRIMITIVE', 'COLOR_PRIMITIVE', 'SIZE_PRIMITIVE', 'SPACE_PRIMITIVE',
      'DENSITY', 'BRAND_TOKEN_MAPPING', 'BRAND_COLOR_MAPPING',
      'BREAKPOINT_MODE', 'COLOR_MODE',
    ];
    for (const col of requiredCollections) {
      if (!src.collections[col]) error(`source.collections.${col}: missing`);
      else if (!src.collections[col].startsWith('VariableCollectionId:')) {
        warn(`source.collections.${col}: expected to start with 'VariableCollectionId:'`);
      }
    }
  }

  // Validate modes
  assertObject(src.modes, 'source.modes');
  if (src.modes) {
    assertObject(src.modes.brands, 'source.modes.brands');
    assertObject(src.modes.breakpoints, 'source.modes.breakpoints');
    assertObject(src.modes.colorModes, 'source.modes.colorModes');
    assertObject(src.modes.densityModes, 'source.modes.densityModes');
  }

  // Validate pathConventions
  assertObject(src.pathConventions, 'source.pathConventions');
  if (src.pathConventions) {
    assertString(src.pathConventions.componentPrefix, 'source.pathConventions.componentPrefix');
  }

  // Check file paths if requested
  if (checkPaths) {
    const inputPath = path.join(ROOT_DIR, src.inputDir, src.inputFile);
    if (!fs.existsSync(inputPath)) {
      warn(`source.inputFile: ${inputPath} does not exist`);
    }
    const outputPath = path.join(ROOT_DIR, src.outputDir);
    if (!fs.existsSync(outputPath)) {
      warn(`source.outputDir: ${outputPath} does not exist (created during build)`);
    }
  }

  ok('source section valid');
}

function validateBrands(config) {
  console.log('\n📋 brands:');
  const brands = config.brands;
  if (!brands) return error('brands: section missing');

  assertArray(brands.all, 'brands.all');
  assertArray(brands.colorBrands, 'brands.colorBrands');
  assertArray(brands.contentBrands, 'brands.contentBrands');
  assertString(brands.defaultBrand, 'brands.defaultBrand');
  assertObject(brands.displayNames, 'brands.displayNames');

  // Cross-reference checks
  if (brands.all && brands.defaultBrand) {
    if (!brands.all.includes(brands.defaultBrand)) {
      error(`brands.defaultBrand '${brands.defaultBrand}' not in brands.all`);
    }
  }

  if (brands.all && brands.colorBrands) {
    for (const b of brands.colorBrands) {
      if (!brands.all.includes(b)) {
        error(`brands.colorBrands: '${b}' not in brands.all`);
      }
    }
  }

  if (brands.all && brands.contentBrands) {
    for (const b of brands.contentBrands) {
      if (!brands.all.includes(b)) {
        error(`brands.contentBrands: '${b}' not in brands.all`);
      }
    }
  }

  if (brands.all && brands.displayNames) {
    for (const b of brands.all) {
      if (!brands.displayNames[b]) {
        warn(`brands.displayNames: missing display name for '${b}'`);
      }
    }
  }

  // Cross-reference with source.modes.brands
  if (config.source && config.source.modes && config.source.modes.brands && brands.all) {
    const sourceBrands = Object.keys(config.source.modes.brands);
    for (const b of brands.all) {
      if (!sourceBrands.includes(b)) {
        error(`brands.all: '${b}' not found in source.modes.brands`);
      }
    }
  }

  ok('brands section valid');
}

function validateModes(config) {
  console.log('\n📋 modes:');
  const modes = config.modes;
  if (!modes) return error('modes: section missing');

  assertArray(modes.color, 'modes.color', 2);
  assertArray(modes.density, 'modes.density', 1);
  assertObject(modes.breakpoints, 'modes.breakpoints');

  // Validate breakpoints structure
  if (modes.breakpoints) {
    const bpKeys = Object.keys(modes.breakpoints);
    if (bpKeys.length < 2) error('modes.breakpoints: need at least 2 breakpoints');

    let prevWidth = 0;
    for (const [key, bp] of Object.entries(modes.breakpoints)) {
      assertNumber(bp.minWidth, `modes.breakpoints.${key}.minWidth`, 1);
      if (bp.minWidth <= prevWidth) {
        error(`modes.breakpoints.${key}.minWidth (${bp.minWidth}) must be > previous (${prevWidth})`);
      }
      prevWidth = bp.minWidth;
    }
  }

  // Validate density display names cover all density modes
  if (modes.densityDisplayNames && modes.density) {
    for (const d of modes.density) {
      if (!modes.densityDisplayNames[d]) {
        warn(`modes.densityDisplayNames: missing display name for '${d}'`);
      }
    }
  }

  // Validate color display names cover all color modes
  if (modes.colorDisplayNames && modes.color) {
    for (const c of modes.color) {
      if (!modes.colorDisplayNames[c]) {
        warn(`modes.colorDisplayNames: missing display name for '${c}'`);
      }
    }
  }

  // Cross-reference with source.modes.breakpoints
  if (config.source && config.source.modes && config.source.modes.breakpoints && modes.breakpoints) {
    const sourceBreakpoints = Object.keys(config.source.modes.breakpoints);
    const configBreakpoints = Object.keys(modes.breakpoints);
    for (const bp of configBreakpoints) {
      if (!sourceBreakpoints.includes(bp)) {
        error(`modes.breakpoints: '${bp}' not in source.modes.breakpoints`);
      }
    }
  }

  // Cross-reference with source.modes.colorModes
  if (config.source && config.source.modes && config.source.modes.colorModes && modes.color) {
    const sourceColorModes = Object.keys(config.source.modes.colorModes);
    for (const c of modes.color) {
      if (!sourceColorModes.includes(c)) {
        error(`modes.color: '${c}' not in source.modes.colorModes`);
      }
    }
  }

  // Cross-reference with source.modes.densityModes
  if (config.source && config.source.modes && config.source.modes.densityModes && modes.density) {
    const sourceDensityModes = Object.keys(config.source.modes.densityModes);
    for (const d of modes.density) {
      if (!sourceDensityModes.includes(d)) {
        error(`modes.density: '${d}' not in source.modes.densityModes`);
      }
    }
  }

  ok('modes section valid');
}

function validatePlatforms(config, checkPaths) {
  console.log('\n📋 platforms:');
  const platforms = config.platforms;
  if (!platforms) return error('platforms: section missing');

  // CSS Platform
  if (platforms.css) {
    assertBoolean(platforms.css.enabled, 'platforms.css.enabled');
    if (platforms.css.enabled) {
      assertString(platforms.css.fontSizeUnit, 'platforms.css.fontSizeUnit');
      if (!['px', 'rem'].includes(platforms.css.fontSizeUnit)) {
        error("platforms.css.fontSizeUnit: must be 'px' or 'rem'");
      }
      assertNumber(platforms.css.remBase, 'platforms.css.remBase', 1);
      assertObject(platforms.css.dataAttributes, 'platforms.css.dataAttributes');
      if (platforms.css.dataAttributes) {
        const required = ['colorBrand', 'contentBrand', 'theme', 'density'];
        for (const attr of required) {
          assertString(platforms.css.dataAttributes[attr], `platforms.css.dataAttributes.${attr}`);
        }
      }
      assertObject(platforms.css.fallbackStrategy, 'platforms.css.fallbackStrategy');
    }
  }

  // iOS Platform
  if (platforms.ios && platforms.ios.enabled) {
    assertString(platforms.ios.moduleName, 'platforms.ios.moduleName');
    assertString(platforms.ios.outputDir, 'platforms.ios.outputDir');
    assertObject(platforms.ios.sizeClasses, 'platforms.ios.sizeClasses');

    // Validate sizeClass references valid breakpoints
    if (platforms.ios.sizeClasses && config.modes && config.modes.breakpoints) {
      const bpKeys = Object.keys(config.modes.breakpoints);
      for (const [cls, bp] of Object.entries(platforms.ios.sizeClasses)) {
        if (!bpKeys.includes(bp)) {
          error(`platforms.ios.sizeClasses.${cls}: '${bp}' not in modes.breakpoints`);
        }
      }
    }

    if (checkPaths) {
      const iosPath = path.join(ROOT_DIR, platforms.ios.outputDir);
      if (!fs.existsSync(iosPath)) {
        warn(`platforms.ios.outputDir: ${iosPath} does not exist (created during build)`);
      }
    }
  }

  // Android Platform
  if (platforms.android && platforms.android.enabled) {
    assertString(platforms.android.packageName, 'platforms.android.packageName');
    assertString(platforms.android.mavenCoordinates, 'platforms.android.mavenCoordinates');
    assertString(platforms.android.outputDir, 'platforms.android.outputDir');
    assertObject(platforms.android.sizeClasses, 'platforms.android.sizeClasses');

    // Validate sizeClass references valid breakpoints
    if (platforms.android.sizeClasses && config.modes && config.modes.breakpoints) {
      const bpKeys = Object.keys(config.modes.breakpoints);
      for (const [cls, bp] of Object.entries(platforms.android.sizeClasses)) {
        if (!bpKeys.includes(bp)) {
          error(`platforms.android.sizeClasses.${cls}: '${bp}' not in modes.breakpoints`);
        }
      }
    }

    if (checkPaths) {
      const androidPath = path.join(ROOT_DIR, platforms.android.outputDir);
      if (!fs.existsSync(androidPath)) {
        warn(`platforms.android.outputDir: ${androidPath} does not exist (created during build)`);
      }
    }
  }

  ok('platforms section valid');
}

function validateOutput(config) {
  console.log('\n📋 output:');
  const output = config.output;
  if (!output) return error('output: section missing');

  assertString(output.distDir, 'output.distDir');
  if (output.distDir && !output.distDir.endsWith('/')) {
    warn('output.distDir: should end with /');
  }

  assertObject(output.showDescriptions, 'output.showDescriptions');

  ok('output section valid');
}

function validatePackages(config) {
  console.log('\n📋 packages:');
  const packages = config.packages;
  if (!packages) return error('packages: section missing');

  const requiredPackages = ['tokens', 'components', 'react', 'vue', 'icons', 'iconsReact'];
  for (const pkg of requiredPackages) {
    if (!packages[pkg]) {
      error(`packages.${pkg}: missing`);
    } else {
      assertString(packages[pkg].npm, `packages.${pkg}.npm`);
      if (packages[pkg].npm && !packages[pkg].npm.startsWith('@')) {
        warn(`packages.${pkg}.npm: scoped package names should start with '@'`);
      }
    }
  }

  ok('packages section valid');
}

function validateStencil(config) {
  console.log('\n📋 stencil:');
  const stencil = config.stencil;
  if (!stencil) return error('stencil: section missing');

  assertString(stencil.namespace, 'stencil.namespace');
  assertNumber(stencil.devServerPort, 'stencil.devServerPort', 1024);

  if (stencil.namespace && !/^[a-z][a-z0-9-]*$/.test(stencil.namespace)) {
    warn('stencil.namespace: should be lowercase alphanumeric with hyphens');
  }

  ok('stencil section valid');
}

function validateComponents(config, checkPaths) {
  console.log('\n📋 components:');
  const components = config.components;
  if (!components) return error('components: section missing');

  assertString(components.prefix, 'components.prefix');
  assertString(components.srcDir, 'components.srcDir');

  if (components.prefix && !components.prefix.endsWith('-')) {
    warn("components.prefix: should end with '-' (e.g., 'ds-')");
  }

  if (checkPaths) {
    const srcPath = path.join(ROOT_DIR, components.srcDir);
    if (!fs.existsSync(srcPath)) {
      warn(`components.srcDir: ${srcPath} does not exist`);
    }
  }

  ok('components section valid');
}

function validateDeployment(config) {
  console.log('\n📋 deployment:');
  const deployment = config.deployment;
  if (!deployment) return error('deployment: section missing');

  assertString(deployment.storybookBasePath, 'deployment.storybookBasePath');
  if (deployment.storybookBasePath && !deployment.storybookBasePath.startsWith('/')) {
    error("deployment.storybookBasePath: must start with '/'");
  }
  if (deployment.storybookBasePath && !deployment.storybookBasePath.endsWith('/')) {
    error("deployment.storybookBasePath: must end with '/'");
  }

  ok('deployment section valid');
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const checkPaths = process.argv.includes('--check-paths');

  console.log('🔍 Validating pipeline.config.js...');
  if (checkPaths) console.log('   (with file path checks)');

  // Load config
  let config;
  try {
    config = require(CONFIG_PATH);
  } catch (e) {
    console.error(`\n❌ FATAL: Cannot load config: ${e.message}`);
    process.exit(1);
  }

  // Run all validators
  validateIdentity(config);
  validateSource(config, checkPaths);
  validateBrands(config);
  validateModes(config);
  validatePlatforms(config, checkPaths);
  validateOutput(config);
  validatePackages(config);
  validateStencil(config);
  validateComponents(config, checkPaths);
  validateDeployment(config);

  // Report results
  console.log('\n' + '═'.repeat(60));

  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${warnings.length}):`);
    for (const w of warnings) console.log(`   ${w}`);
  }

  if (errors.length > 0) {
    console.log(`\n❌ Errors (${errors.length}):`);
    for (const e of errors) console.log(`   ${e}`);
    console.log(`\n❌ Validation FAILED with ${errors.length} error(s)`);
    process.exit(1);
  }

  console.log(`\n✅ Validation PASSED (${warnings.length} warning(s))`);
}

main();
