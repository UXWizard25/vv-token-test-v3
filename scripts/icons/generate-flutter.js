#!/usr/bin/env node

/**
 * Flutter Icon Font Generation Script
 *
 * Generates a TTF icon font and Dart class from optimized SVGs.
 * Uses fantasticon for font generation with stable codepoints.
 *
 * Input:  dist/icons/svg/*.svg
 * Output: dist/icons/flutter/
 *         - fonts/icons.ttf
 *         - lib/icons.dart
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PATHS = {
  input: path.resolve(__dirname, '../../packages/icons/dist/svg'),
  output: path.resolve(__dirname, '../../packages/icons/dist/flutter'),
  codepoints: path.resolve(__dirname, '../../packages/icons/src/.codepoints.json'),
};

const FLUTTER_CONFIG = {
  fontName: 'BildIcons',
  className: 'BildIcons',
  package: 'bild_design_system_icons',
  startCodepoint: 0xe001,
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
 * Convert kebab-case to camelCase
 * add -> add
 * arrow-left -> arrowLeft
 */
function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
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
// CODEPOINT MANAGEMENT
// ============================================================================

/**
 * Load codepoint registry
 */
function loadCodepointRegistry() {
  if (fs.existsSync(PATHS.codepoints)) {
    try {
      return JSON.parse(fs.readFileSync(PATHS.codepoints, 'utf8'));
    } catch (error) {
      log.warn('Could not parse codepoints file, creating new one');
    }
  }

  return {
    description: 'Flutter Icon Font Codepoint Registry',
    nextCodepoint: 'e001',
    icons: {},
  };
}

/**
 * Save codepoint registry
 */
function saveCodepointRegistry(registry) {
  fs.writeFileSync(PATHS.codepoints, JSON.stringify(registry, null, 2), 'utf8');
}

/**
 * Get or assign codepoint for an icon
 */
function getCodepoint(registry, iconName) {
  if (registry.icons[iconName]) {
    return registry.icons[iconName];
  }

  // Assign new codepoint
  const codepoint = registry.nextCodepoint;
  registry.icons[iconName] = codepoint;

  // Increment next codepoint
  const nextInt = parseInt(codepoint, 16) + 1;
  registry.nextCodepoint = nextInt.toString(16).padStart(4, '0');

  return codepoint;
}

// ============================================================================
// FLUTTER GENERATION
// ============================================================================

/**
 * Generate Dart icon class
 */
function generateDartClass(icons, codepointMap) {
  const iconEntries = icons
    .map(icon => {
      const dartName = toCamelCase(icon.name);
      const codepoint = codepointMap[icon.name];
      return `  /// Icon: ${icon.name}
  static const IconData ${dartName} = IconData(0x${codepoint}, fontFamily: _fontFamily, fontPackage: _fontPackage);`;
    })
    .join('\n\n');

  const allIconsMap = icons
    .map(icon => `    '${icon.name}': ${toCamelCase(icon.name)},`)
    .join('\n');

  return `// GENERATED CODE - DO NOT MODIFY BY HAND
// Generated at: ${new Date().toISOString()}
//
// This file contains icon definitions for the BILD Design System.
// To regenerate, run: npm run build:icons:flutter

import 'package:flutter/widgets.dart';

/// BILD Design System Icons
///
/// Usage:
/// \`\`\`dart
/// Icon(${FLUTTER_CONFIG.className}.add)
/// Icon(${FLUTTER_CONFIG.className}.arrowLeft, size: 32)
/// \`\`\`
///
/// Total icons: ${icons.length}
class ${FLUTTER_CONFIG.className} {
  ${FLUTTER_CONFIG.className}._();

  static const String _fontFamily = '${FLUTTER_CONFIG.fontName}';
  static const String? _fontPackage = '${FLUTTER_CONFIG.package}';

${iconEntries}

  /// Map of all available icons by name
  static const Map<String, IconData> values = {
${allIconsMap}
  };

  /// Get icon by name (returns null if not found)
  static IconData? byName(String name) => values[name];

  /// List of all icon names
  static List<String> get names => values.keys.toList();
}
`;
}

/**
 * Generate pubspec.yaml snippet
 */
function generatePubspecSnippet() {
  return `# Add to your pubspec.yaml:
#
# flutter:
#   fonts:
#     - family: ${FLUTTER_CONFIG.fontName}
#       fonts:
#         - asset: packages/${FLUTTER_CONFIG.package}/fonts/${FLUTTER_CONFIG.fontName}.ttf
`;
}

/**
 * Load fantasticon dynamically and generate font
 */
async function generateIconFont(icons, codepointMap) {
  const fontsDir = path.join(PATHS.output, 'fonts');
  const libDir = path.join(PATHS.output, 'lib');

  // Create directories
  if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
  }
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }

  try {
    // Try to use fantasticon
    const { generateFonts } = await import('fantasticon');

    // Create codepoints config for fantasticon
    const codepoints = {};
    for (const icon of icons) {
      codepoints[icon.name] = parseInt(codepointMap[icon.name], 16);
    }

    await generateFonts({
      inputDir: PATHS.input,
      outputDir: fontsDir,
      name: FLUTTER_CONFIG.fontName,
      fontTypes: ['ttf'],
      assetTypes: [],
      codepoints,
      fontHeight: 1000,
      normalize: true,
    });

    log.success('Generated TTF font with fantasticon');
    return true;
  } catch (error) {
    log.warn(`fantasticon failed: ${error.message}`);
    log.info('Font generation skipped - install fantasticon for TTF output');

    // Create placeholder message
    const placeholderPath = path.join(fontsDir, 'README.md');
    fs.writeFileSync(placeholderPath, `# Font Generation

To generate the TTF font, ensure fantasticon is installed:

\`\`\`bash
npm install fantasticon
npm run build:icons:flutter
\`\`\`

The Dart class has been generated with stable codepoints.
Once the font is generated, icons will work in Flutter.
`, 'utf8');

    return false;
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n========================================');
  console.log('  Flutter Icon Font Generation');
  console.log('========================================\n');

  // Get input files
  log.step('Scanning optimized SVGs...');
  const svgFiles = getSvgFiles();

  if (svgFiles.length === 0) {
    log.warn('No optimized SVG files found');
    log.info('Run "npm run build:icons:svg" first');
    return { success: true, count: 0 };
  }

  log.success(`Found ${svgFiles.length} SVG file(s)`);

  // Load codepoint registry
  log.step('Loading codepoint registry...');
  const registry = loadCodepointRegistry();
  const existingCount = Object.keys(registry.icons).length;
  log.info(`Existing codepoints: ${existingCount}`);

  // Build icon list with codepoints
  const icons = svgFiles.map(file => {
    const name = file.replace(/\.svg$/, '');
    return { name, file };
  });

  // Assign codepoints (stable - existing icons keep their codepoints)
  const codepointMap = {};
  let newCodepoints = 0;

  for (const icon of icons) {
    const isNew = !registry.icons[icon.name];
    codepointMap[icon.name] = getCodepoint(registry, icon.name);
    if (isNew) newCodepoints++;
  }

  if (newCodepoints > 0) {
    log.info(`New codepoints assigned: ${newCodepoints}`);
  }

  // Save updated registry
  saveCodepointRegistry(registry);
  log.success('Updated codepoint registry');

  // Create output directories
  const libDir = path.join(PATHS.output, 'lib');
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }

  // Generate Dart class
  log.step('Generating Dart class...');
  const dartContent = generateDartClass(icons, codepointMap);
  const dartPath = path.join(libDir, 'icons.dart');
  fs.writeFileSync(dartPath, dartContent, 'utf8');
  log.success('Created icons.dart');

  // Generate pubspec snippet
  const pubspecSnippet = generatePubspecSnippet();
  const pubspecPath = path.join(PATHS.output, 'pubspec_snippet.yaml');
  fs.writeFileSync(pubspecPath, pubspecSnippet, 'utf8');
  log.success('Created pubspec_snippet.yaml');

  // Generate TTF font
  log.step('Generating icon font...');
  const fontGenerated = await generateIconFont(icons, codepointMap);

  // Summary
  console.log('\n========================================');
  console.log('  Summary');
  console.log('========================================\n');

  log.success(`Processed: ${icons.length} icons`);
  log.info(`Stable codepoints: ${Object.keys(registry.icons).length}`);
  log.info(`Font generated: ${fontGenerated ? 'Yes' : 'No (fantasticon not available)'}`);
  log.info(`Output: ${PATHS.output}`);

  return { success: true, count: icons.length, fontGenerated };
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

module.exports = { main, PATHS, toCamelCase };
