#!/usr/bin/env node

/**
 * Android Vector Drawable Generation Script
 *
 * Converts optimized SVGs to Android Vector Drawable XML format.
 * Uses svg2vectordrawable for conversion.
 *
 * Input:  dist/icons/svg/*.svg
 * Output: dist/icons/android/drawable/*.xml
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PATHS = {
  input: path.resolve(__dirname, '../../packages/icons/dist/svg'),
  output: path.resolve(__dirname, '../../packages/icons/dist/android/drawable'),
};

const ANDROID_CONFIG = {
  // Default size in dp
  width: 24,
  height: 24,
  // Use theme attribute for color
  fillColor: '?attr/colorOnSurface',
  // Float precision
  floatPrecision: 2,
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
};

// ============================================================================
// NAME TRANSFORMATIONS
// ============================================================================

/**
 * Convert to Android resource naming: add -> ic_add
 */
function toAndroidName(name) {
  return `ic_${name.replace(/-/g, '_')}`;
}

/**
 * Get all SVG files from input directory
 */
function getSvgFiles() {
  if (!fs.existsSync(PATHS.input)) {
    log.warn(`Input directory does not exist: ${PATHS.input}`);
    log.info('Run "npm run build:icons:svg" first');
    return [];
  }

  const files = fs.readdirSync(PATHS.input)
    .filter(file => file.endsWith('.svg') && !file.startsWith('.'))
    .sort();

  return files;
}

// ============================================================================
// VECTOR DRAWABLE GENERATION
// ============================================================================

/**
 * Load svg2vectordrawable dynamically
 */
async function loadConverter() {
  const s2v = await import('svg2vectordrawable');
  return s2v.default || s2v;
}

/**
 * Parse viewBox from SVG
 */
function parseViewBox(svgContent) {
  const match = svgContent.match(/viewBox="([^"]+)"/);
  if (match) {
    const [, , width, height] = match[1].split(/\s+/).map(Number);
    return { width: width || 24, height: height || 24 };
  }
  return { width: 24, height: 24 };
}

/**
 * Convert SVG to Vector Drawable manually
 * (Fallback if svg2vectordrawable fails)
 */
function convertToVectorDrawable(svgContent, config) {
  const { width, height } = parseViewBox(svgContent);

  // Check if SVG uses stroke (outline icons) or fill
  const usesStroke = svgContent.includes('stroke=');

  // Extract path data from SVG
  const pathMatches = svgContent.matchAll(/<path[^>]*d="([^"]+)"[^>]*\/?>/g);
  const paths = [];

  for (const match of pathMatches) {
    paths.push(match[1]);
  }

  // Extract circle elements
  const circleMatches = svgContent.matchAll(/<circle[^>]*cx="([^"]+)"[^>]*cy="([^"]+)"[^>]*r="([^"]+)"[^>]*\/?>/g);
  const circles = [];

  for (const match of circleMatches) {
    circles.push({ cx: match[1], cy: match[2], r: match[3] });
  }

  // Build Vector Drawable XML
  const colorAttr = usesStroke ? 'android:strokeColor' : 'android:fillColor';
  const extraAttrs = usesStroke ? `\n        android:strokeWidth="2"` : '';

  let pathElements = paths.map(pathData => `    <path
        ${colorAttr}="${config.fillColor}"${extraAttrs}
        android:pathData="${pathData}"/>`).join('\n');

  // Add circles as paths
  if (circles.length > 0) {
    const circleElements = circles.map(c => {
      // Convert circle to arc path
      const r = parseFloat(c.r);
      const cx = parseFloat(c.cx);
      const cy = parseFloat(c.cy);
      const pathData = `M${cx - r},${cy}a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 -${r * 2},0`;
      return `    <path
        ${colorAttr}="${config.fillColor}"${extraAttrs}
        android:pathData="${pathData}"/>`;
    }).join('\n');
    pathElements = pathElements + '\n' + circleElements;
  }

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="${config.width}dp"
    android:height="${config.height}dp"
    android:viewportWidth="${width}"
    android:viewportHeight="${height}">
${pathElements}
</vector>
`;

  return xml;
}

/**
 * Generate a single Vector Drawable
 */
async function generateVectorDrawable(converter, filename) {
  const inputPath = path.join(PATHS.input, filename);
  const iconName = filename.replace(/\.svg$/, '');
  const androidName = toAndroidName(iconName);
  const outputPath = path.join(PATHS.output, `${androidName}.xml`);

  try {
    const svgContent = fs.readFileSync(inputPath, 'utf8');

    let xmlContent;

    try {
      // Try using svg2vectordrawable
      xmlContent = await converter(svgContent, {
        floatPrecision: ANDROID_CONFIG.floatPrecision,
        xmlTag: true,
      });

      // Replace fill and stroke colors with theme attribute
      xmlContent = xmlContent
        .replace(/android:fillColor="#[0-9a-fA-F]+"/g, `android:fillColor="${ANDROID_CONFIG.fillColor}"`)
        .replace(/android:fillColor="currentColor"/g, `android:fillColor="${ANDROID_CONFIG.fillColor}"`)
        .replace(/android:strokeColor="#[0-9a-fA-F]+"/g, `android:strokeColor="${ANDROID_CONFIG.fillColor}"`)
        .replace(/android:strokeColor="currentColor"/g, `android:strokeColor="${ANDROID_CONFIG.fillColor}"`);

      // Set default dimensions
      xmlContent = xmlContent
        .replace(/android:width="\d+dp"/, `android:width="${ANDROID_CONFIG.width}dp"`)
        .replace(/android:height="\d+dp"/, `android:height="${ANDROID_CONFIG.height}dp"`);

    } catch (conversionError) {
      // Fallback to manual conversion
      log.warn(`Using fallback converter for ${iconName}`);
      xmlContent = convertToVectorDrawable(svgContent, ANDROID_CONFIG);
    }

    fs.writeFileSync(outputPath, xmlContent, 'utf8');

    return {
      name: androidName,
      originalName: iconName,
      success: true,
    };
  } catch (error) {
    return {
      name: androidName,
      originalName: iconName,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate attrs.xml for custom theme attributes
 */
function generateAttrsXml() {
  const attrsContent = `<?xml version="1.0" encoding="utf-8"?>
<!-- Icon theme attributes for dynamic coloring -->
<resources>
    <!-- Define icon tint attribute if not using Material theme -->
    <!--
    <attr name="iconTint" format="color" />
    -->

    <!--
    Usage in your theme:
    <style name="AppTheme" parent="Theme.MaterialComponents.DayNight">
        <item name="colorOnSurface">@color/your_icon_color</item>
    </style>

    Or override per-icon:
    <ImageView
        android:src="@drawable/ic_add"
        app:tint="?attr/colorPrimary" />
    -->
</resources>
`;

  const attrsPath = path.join(PATHS.output, '..', 'values', 'attrs_icons.xml');
  const valuesDir = path.dirname(attrsPath);

  if (!fs.existsSync(valuesDir)) {
    fs.mkdirSync(valuesDir, { recursive: true });
  }

  fs.writeFileSync(attrsPath, attrsContent, 'utf8');
  return attrsPath;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n========================================');
  console.log('  Android Vector Drawable Generation');
  console.log('========================================\n');

  // Load converter
  log.step('Loading svg2vectordrawable...');
  let converter;
  try {
    converter = await loadConverter();
    log.success('Loaded svg2vectordrawable');
  } catch (error) {
    log.warn('svg2vectordrawable not available, using fallback');
    converter = null;
  }

  // Get input files
  log.step('Scanning optimized SVGs...');
  const svgFiles = getSvgFiles();

  if (svgFiles.length === 0) {
    log.warn('No optimized SVG files found');
    log.info('Run "npm run build:icons:svg" first');
    return { success: true, count: 0 };
  }

  log.success(`Found ${svgFiles.length} SVG file(s)`);

  // Create output directory
  if (!fs.existsSync(PATHS.output)) {
    fs.mkdirSync(PATHS.output, { recursive: true });
    log.success('Created output directory');
  }

  // Generate all vector drawables
  log.step('Generating Vector Drawables...');
  const results = [];

  for (const file of svgFiles) {
    const result = await generateVectorDrawable(converter, file);
    results.push(result);

    if (result.success) {
      log.info(`${result.name}.xml`);
    } else {
      log.error(`${result.name}: ${result.error}`);
    }
  }

  // Generate attrs.xml
  log.step('Generating theme attributes...');
  generateAttrsXml();
  log.success('Created attrs_icons.xml');

  // Summary
  console.log('\n========================================');
  console.log('  Summary');
  console.log('========================================\n');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  log.success(`Generated: ${successful}/${results.length} drawables`);

  if (failed > 0) {
    log.error(`Failed: ${failed} drawable(s)`);
    return { success: false, count: successful, failed };
  }

  log.info(`Output: ${PATHS.output}`);

  return { success: true, count: successful };
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

module.exports = { main, PATHS, toAndroidName };
