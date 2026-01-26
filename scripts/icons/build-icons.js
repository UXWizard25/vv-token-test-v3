#!/usr/bin/env node

/**
 * Icon Build Orchestrator
 *
 * Orchestrates the complete icon build pipeline:
 * 1. SVG Optimization (SVGO)
 * 2. React Component Generation (SVGR)
 * 3. Android Vector Drawable Generation
 * 4. iOS Asset Generation
 *
 * Usage:
 *   npm run build:icons          # Build all platforms
 *   npm run build:icons:svg      # Only SVG optimization
 *   npm run build:icons:react    # Only React components
 *   npm run build:icons:android  # Only Android drawables
 *   npm run build:icons:ios      # Only iOS assets
 */

const fs = require('fs');
const path = require('path');
const { PATHS: SHARED_PATHS, cleanDir, ensureDir } = require('./paths');
const config = require('../../build-config/tokens/pipeline.config.js');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PATHS = {
  root: SHARED_PATHS.root,
  iconsRoot: SHARED_PATHS.iconsRoot,
  input: SHARED_PATHS.source,
  // Output directories for each platform
  svg: SHARED_PATHS.svg,
  react: SHARED_PATHS.react,
  reactSrc: SHARED_PATHS.reactSrc,
  android: SHARED_PATHS.android,
  ios: SHARED_PATHS.ios,
};

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

const log = {
  info: (msg) => console.log(`\u2139\uFE0F  ${msg}`),
  success: (msg) => console.log(`\u2705 ${msg}`),
  warn: (msg) => console.log(`\u26A0\uFE0F  ${msg}`),
  error: (msg) => console.error(`\u274C ${msg}`),
  step: (msg) => console.log(`\n\u27A1\uFE0F  ${msg}`),
  header: (msg) => {
    console.log('\n' + '='.repeat(50));
    console.log(`  ${msg}`);
    console.log('='.repeat(50));
  },
};

// ============================================================================
// BUILD STEPS
// ============================================================================

const buildSteps = [
  {
    name: 'SVG Optimization',
    script: './optimize-svg.js',
    output: 'svg',
    required: true,
  },
  {
    name: 'React Components (TSX)',
    script: './generate-react.js',
    output: 'react-src',
    required: false,
  },
  {
    name: 'React Compilation (JS)',
    script: './compile-react.js',
    output: 'react',
    required: false,
  },
  {
    name: 'Android Vector Drawables',
    script: './generate-android.js',
    output: 'android',
    required: false,
  },
  {
    name: 'iOS Assets',
    script: './generate-ios.js',
    output: 'ios',
    required: false,
  },
  {
    name: 'iOS Package.swift',
    script: './generate-ios-package.js',
    output: 'ios-package',
    required: false,
  },
  {
    name: 'Android build.gradle.kts',
    script: './generate-android-gradle.js',
    output: 'android-gradle',
    required: false,
  },
];

// ============================================================================
// BUILD EXECUTION
// ============================================================================

/**
 * Run a single build step
 */
async function runBuildStep(step) {
  const scriptPath = path.resolve(__dirname, step.script);

  if (!fs.existsSync(scriptPath)) {
    log.error(`Script not found: ${step.script}`);
    return { success: false, error: 'Script not found' };
  }

  try {
    const module = require(scriptPath);
    const result = await module.main();
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Count input SVG files
 */
function countInputFiles() {
  if (!fs.existsSync(PATHS.input)) {
    return 0;
  }

  return fs.readdirSync(PATHS.input)
    .filter(file => file.endsWith('.svg') && !file.startsWith('.'))
    .length;
}

/**
 * Get sorted list of icon names from SVG output directory
 */
function getIconNames() {
  if (!fs.existsSync(PATHS.svg)) {
    return [];
  }

  return fs.readdirSync(PATHS.svg)
    .filter(file => file.endsWith('.svg'))
    .map(file => file.replace('.svg', ''))
    .sort();
}

/**
 * Generate build manifest with icon names
 */
function generateManifest(results, startTime) {
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Get icon names from built SVG files
  const iconNames = getIconNames();

  const manifest = {
    generatedAt: new Date().toISOString(),
    buildDuration: `${duration}s`,
    inputDirectory: PATHS.input,
    outputDirectories: {
      svg: PATHS.svg,
      react: PATHS.react,
      android: PATHS.android,
      ios: PATHS.ios,
    },
    // Include icon names for dynamic loading
    icons: iconNames,
    platforms: {},
  };

  for (const [stepName, result] of Object.entries(results)) {
    manifest.platforms[stepName] = {
      success: result.success,
      count: result.count || 0,
      ...(result.error && { error: result.error }),
    };
  }

  // Write manifest to SVG package (primary npm package)
  const manifestPath = path.join(PATHS.svg, 'manifest.json');
  ensureDir(PATHS.svg);
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  return manifest;
}

/**
 * Generate TypeScript file with icon names for type-safe imports
 */
function generateIconsTs(iconNames) {
  const content = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 * Generated by: npm run build:icons
 *
 * This file is automatically regenerated when icons are added, removed, or renamed.
 * To update, run: npm run build:icons
 */

export const ICON_NAMES = [
${iconNames.map(name => `  '${name}',`).join('\n')}
] as const;

export type IconName = typeof ICON_NAMES[number];
`;

  const stencilPath = config.icons.outputs.stencilTypesPath;
  if (!stencilPath) {
    return null; // Skip if disabled in config
  }
  const outputPath = path.join(PATHS.root, stencilPath);
  fs.writeFileSync(outputPath, content, 'utf8');

  return outputPath;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const startTime = Date.now();

  log.header(`${config.identity.name} - Icon Build Pipeline`);

  // Check for input files
  log.step('Checking input directory...');
  const inputCount = countInputFiles();

  if (inputCount === 0) {
    log.warn('No SVG files found in src/icons/');
    log.info('Add SVG files to src/icons/ to get started');
    log.info('Expected format: icon-{name}.svg (e.g., icon-add.svg)');

    // Generate empty manifest
    generateManifest({}, startTime);

    return {
      success: true,
      message: 'No icons to process',
    };
  }

  log.success(`Found ${inputCount} SVG file(s) to process`);

  // Clean output directories for each platform
  log.step('Preparing output directories...');

  const outputDirs = [PATHS.svg, PATHS.react, PATHS.reactSrc, PATHS.android, PATHS.ios];
  for (const dir of outputDirs) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true });
    }
    fs.mkdirSync(dir, { recursive: true });
  }
  log.info('Cleaned previous builds');
  log.success('Output directories ready');

  // Run all build steps
  const results = {};
  let hasErrors = false;

  for (const step of buildSteps) {
    log.header(step.name);

    const result = await runBuildStep(step);
    results[step.output] = result;

    if (!result.success) {
      if (step.required) {
        log.error(`Required step "${step.name}" failed: ${result.error}`);
        hasErrors = true;
        break;
      } else {
        log.warn(`Optional step "${step.name}" failed: ${result.error}`);
      }
    }
  }

  // Generate manifest with icon names
  log.step('Generating build manifest...');
  const manifest = generateManifest(results, startTime);
  log.success(`Created manifest.json with ${manifest.icons.length} icons`);

  // Generate TypeScript file for Stencil components
  if (config.icons.outputs.stencilTypesPath) {
    log.step('Generating icons.ts for Stencil...');
    const iconsTsPath = generateIconsTs(manifest.icons);
    if (iconsTsPath) {
      log.success(`Created ${path.relative(PATHS.root, iconsTsPath)}`);
    }
  }

  // Final summary
  log.header('Build Summary');

  const successCount = Object.values(results).filter(r => r.success).length;
  const totalSteps = Object.keys(results).length;

  console.log('');
  log.info(`Input:    ${inputCount} SVG file(s)`);
  log.info(`Output:`);
  log.info(`  - SVG:     ${PATHS.svg}`);
  log.info(`  - React:   ${PATHS.react}`);
  log.info(`  - Android: ${PATHS.android}`);
  log.info(`  - iOS:     ${PATHS.ios}`);
  log.info(`Duration: ${manifest.buildDuration}`);
  console.log('');

  console.log('Platform Results:');
  for (const [platform, result] of Object.entries(results)) {
    const status = result.success ? '\u2705' : '\u274C';
    const count = result.count || 0;
    console.log(`  ${status} ${platform}: ${count} file(s)`);
  }

  console.log('');

  if (hasErrors) {
    log.error(`Build completed with errors (${successCount}/${totalSteps} steps succeeded)`);
    return { success: false, results };
  }

  log.success(`Build completed successfully (${successCount}/${totalSteps} platforms)`);

  return { success: true, results };
}

// Run if called directly
if (require.main === module) {
  main()
    .then(result => {
      if (!result.success) {
        process.exit(1);
      }
    })
    .catch(error => {
      log.error(error.message);
      process.exit(1);
    });
}

module.exports = { main, PATHS };
