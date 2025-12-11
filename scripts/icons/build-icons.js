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

// ============================================================================
// CONFIGURATION
// ============================================================================

const PATHS = {
  root: path.resolve(__dirname, '../..'),
  input: path.resolve(__dirname, '../../packages/icons/src'),
  output: path.resolve(__dirname, '../../packages/icons/dist'),
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
 * Generate build manifest
 */
function generateManifest(results, startTime) {
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  const manifest = {
    generatedAt: new Date().toISOString(),
    buildDuration: `${duration}s`,
    inputDirectory: PATHS.input,
    outputDirectory: PATHS.output,
    platforms: {},
  };

  for (const [stepName, result] of Object.entries(results)) {
    manifest.platforms[stepName] = {
      success: result.success,
      count: result.count || 0,
      ...(result.error && { error: result.error }),
    };
  }

  const manifestPath = path.join(PATHS.output, 'manifest.json');

  // Ensure output directory exists
  if (!fs.existsSync(PATHS.output)) {
    fs.mkdirSync(PATHS.output, { recursive: true });
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  return manifest;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const startTime = Date.now();

  log.header('BILD Design System - Icon Build Pipeline');

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

  // Clean output directory
  log.step('Preparing output directory...');
  if (fs.existsSync(PATHS.output)) {
    fs.rmSync(PATHS.output, { recursive: true });
    log.info('Cleaned previous build');
  }
  fs.mkdirSync(PATHS.output, { recursive: true });
  log.success('Output directory ready');

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

  // Generate manifest
  log.step('Generating build manifest...');
  const manifest = generateManifest(results, startTime);
  log.success('Created manifest.json');

  // Final summary
  log.header('Build Summary');

  const successCount = Object.values(results).filter(r => r.success).length;
  const totalSteps = Object.keys(results).length;

  console.log('');
  log.info(`Input:    ${inputCount} SVG file(s)`);
  log.info(`Output:   ${PATHS.output}`);
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
