#!/usr/bin/env node

/**
 * SVG Optimization Script
 *
 * Optimizes all SVG icons using SVGO configuration.
 * This is the foundation for all platform-specific builds.
 *
 * Input:  src/icons/*.svg
 * Output: dist/icons/svg/*.svg
 */

const fs = require('fs');
const path = require('path');
const { PATHS: SHARED_PATHS, ensureDir } = require('./paths');
const pipelineConfig = require('../../build-config/pipeline.config.js');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PATHS = {
  input: SHARED_PATHS.source,
  output: SHARED_PATHS.svg,
  config: path.resolve(__dirname, '../../build-config/icons/svgo.config.js'),
};

// Dangerous SVG elements that should not be present
const DANGEROUS_ELEMENTS = [
  'script',
  'foreignObject',
  'iframe',
  'embed',
  'object',
];

// Dangerous attributes (event handlers, external references)
const DANGEROUS_PATTERNS = [
  /on\w+\s*=/i,           // Event handlers like onclick, onload
  /javascript:/i,          // javascript: URLs
  /data:/i,                // data: URLs (can contain scripts)
  /xlink:href\s*=\s*["'][^#]/i,  // External xlink:href (not internal #refs)
];

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

const log = {
  info: (msg) => console.log(`\u2139\uFE0F  ${msg}`),
  success: (msg) => console.log(`\u2705 ${msg}`),
  warn: (msg) => console.log(`\u26A0\uFE0F  ${msg}`),
  error: (msg) => console.error(`\u274C ${msg}`),
  step: (msg) => console.log(`\n\u27A1\uFE0F  ${msg}`),
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate SVG content structure and security
 * @returns {Object} { valid: boolean, errors: string[], warnings: string[] }
 */
function validateSvgContent(content, filename) {
  const errors = [];
  const warnings = [];

  // Check if content starts with SVG or XML declaration
  const trimmed = content.trim();
  if (!trimmed.startsWith('<svg') && !trimmed.startsWith('<?xml')) {
    errors.push('File does not appear to be a valid SVG');
    return { valid: false, errors, warnings };
  }

  // Check for <svg> element
  if (!/<svg[\s>]/i.test(content)) {
    errors.push('Missing <svg> root element');
  }

  // Check for viewBox attribute
  if (!/viewBox\s*=\s*["'][^"']+["']/i.test(content)) {
    warnings.push('Missing viewBox attribute (will use default 0 0 24 24)');
  }

  // Check for dangerous elements
  for (const element of DANGEROUS_ELEMENTS) {
    const regex = new RegExp(`<${element}[\\s>]`, 'i');
    if (regex.test(content)) {
      errors.push(`Contains dangerous element: <${element}>`);
    }
  }

  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(content)) {
      errors.push(`Contains potentially dangerous content: ${pattern.source}`);
    }
  }

  // Check for closing </svg> tag
  if (!/<\/svg\s*>/i.test(content)) {
    errors.push('Missing closing </svg> tag');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// SVG PROCESSING
// ============================================================================

/**
 * Load SVGO dynamically (ESM module)
 */
async function loadSvgo() {
  const { optimize } = await import('svgo');
  return optimize;
}

/**
 * Get all SVG files from input directory
 */
function getSvgFiles() {
  if (!fs.existsSync(PATHS.input)) {
    log.warn(`Input directory does not exist: ${PATHS.input}`);
    return [];
  }

  const files = fs.readdirSync(PATHS.input)
    .filter(file => file.endsWith('.svg') && !file.startsWith('.'))
    .sort();

  return files;
}

/**
 * Transform icon name: icon-add.svg -> add
 * Prefix is configurable via pipeline.config.js
 */
function transformIconName(filename) {
  const prefix = pipelineConfig.icons.sourceFilePrefix;
  const prefixRegex = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
  return filename
    .replace(/\.svg$/, '')
    .replace(prefixRegex, '');
}

/**
 * Optimize a single SVG file
 */
async function optimizeSvg(optimize, svgoConfig, filename) {
  const inputPath = path.join(PATHS.input, filename);
  const iconName = transformIconName(filename);
  const outputPath = path.join(PATHS.output, `${iconName}.svg`);

  try {
    const svgContent = fs.readFileSync(inputPath, 'utf8');

    // Validate SVG content before optimization
    const validation = validateSvgContent(svgContent, filename);

    if (!validation.valid) {
      return {
        name: iconName,
        success: false,
        error: `Validation failed:\n${validation.errors.join('\n')}`,
        validationErrors: validation.errors,
      };
    }

    // Log warnings but continue
    if (validation.warnings.length > 0) {
      for (const warning of validation.warnings) {
        log.warn(`${iconName}: ${warning}`);
      }
    }

    const result = optimize(svgContent, {
      path: inputPath,
      ...svgoConfig,
    });

    if (result.error) {
      throw new Error(result.error);
    }

    fs.writeFileSync(outputPath, result.data, 'utf8');

    const originalSize = Buffer.byteLength(svgContent, 'utf8');
    const optimizedSize = Buffer.byteLength(result.data, 'utf8');
    const savings = Math.round((1 - optimizedSize / originalSize) * 100);

    return {
      name: iconName,
      success: true,
      originalSize,
      optimizedSize,
      savings,
      warnings: validation.warnings,
    };
  } catch (error) {
    return {
      name: iconName,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate manifest file with optimization results
 */
function generateManifest(results) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    totalIcons: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    icons: results.map(r => ({
      name: r.name,
      success: r.success,
      ...(r.success && {
        originalSize: r.originalSize,
        optimizedSize: r.optimizedSize,
        savings: `${r.savings}%`,
      }),
      ...(r.error && { error: r.error }),
    })),
  };

  const manifestPath = path.join(PATHS.output, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  return manifest;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n========================================');
  console.log('  SVG Icon Optimization (SVGO)');
  console.log('========================================\n');

  log.step('Loading SVGO...');
  const optimize = await loadSvgo();

  // Load config
  let svgoConfig = {};
  if (fs.existsSync(PATHS.config)) {
    svgoConfig = require(PATHS.config);
    log.success('Loaded SVGO configuration');
  } else {
    log.warn('No SVGO config found, using defaults');
  }

  // Get input files
  log.step('Scanning input directory...');
  const svgFiles = getSvgFiles();

  if (svgFiles.length === 0) {
    log.warn('No SVG files found in src/icons/');
    log.info('Add SVG files to src/icons/ to get started');
    return { success: true, count: 0 };
  }

  log.success(`Found ${svgFiles.length} SVG file(s)`);

  // Create output directory
  if (!fs.existsSync(PATHS.output)) {
    fs.mkdirSync(PATHS.output, { recursive: true });
    log.success('Created output directory');
  }

  // Optimize all files
  log.step('Optimizing SVG files...');
  const results = [];

  for (const file of svgFiles) {
    const result = await optimizeSvg(optimize, svgoConfig, file);
    results.push(result);

    if (result.success) {
      log.info(`${result.name}: ${result.originalSize}B -> ${result.optimizedSize}B (-${result.savings}%)`);
    } else {
      log.error(`${result.name}: ${result.error}`);
    }
  }

  // Generate manifest
  log.step('Generating manifest...');
  const manifest = generateManifest(results);

  // Summary
  console.log('\n========================================');
  console.log('  Summary');
  console.log('========================================\n');

  log.success(`Optimized: ${manifest.successful}/${manifest.totalIcons} icons`);

  if (manifest.failed > 0) {
    log.error(`Failed: ${manifest.failed} icon(s)`);
    return { success: false, count: manifest.successful, failed: manifest.failed };
  }

  const totalSavings = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + (r.originalSize - r.optimizedSize), 0);

  log.info(`Total size reduction: ${totalSavings} bytes`);
  log.info(`Output: ${PATHS.output}`);

  return { success: true, count: manifest.totalIcons };
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

module.exports = { main, PATHS, transformIconName, validateSvgContent };
