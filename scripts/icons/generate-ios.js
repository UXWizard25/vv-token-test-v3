#!/usr/bin/env node

/**
 * iOS SVG Asset Generation Script
 *
 * Generates optimized SVG assets for iOS with proper asset catalog structure.
 * Modern iOS (13+) supports SVG natively via SF Symbols.
 *
 * Input:  dist/icons/svg/*.svg
 * Output: dist/icons/ios/
 *         - Assets.xcassets/Icons/
 *           - {icon}.imageset/
 *             - {icon}.svg
 *             - Contents.json
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PATHS = {
  input: path.resolve(__dirname, '../../packages/icons/dist/svg'),
  output: path.resolve(__dirname, '../../packages/icons/dist/ios/Assets.xcassets/Icons'),
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
 * Convert kebab-case to camelCase for iOS
 * add -> add
 * arrow-left -> arrowLeft
 */
function toiOSName(str) {
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
// IOS ASSET GENERATION
// ============================================================================

/**
 * Generate Contents.json for an imageset
 */
function generateImagesetContents(svgFilename) {
  return {
    images: [
      {
        filename: svgFilename,
        idiom: 'universal',
      },
    ],
    info: {
      author: 'bild-design-system-icons',
      version: 1,
    },
    properties: {
      'preserves-vector-representation': true,
      'template-rendering-intent': 'template',
    },
  };
}

/**
 * Generate Contents.json for the Icons folder
 */
function generateFolderContents() {
  return {
    info: {
      author: 'bild-design-system-icons',
      version: 1,
    },
    properties: {
      'provides-namespace': true,
    },
  };
}

/**
 * Generate Contents.json for the root xcassets
 */
function generateXcassetsContents() {
  return {
    info: {
      author: 'bild-design-system-icons',
      version: 1,
    },
  };
}

/**
 * Process SVG for iOS (add template rendering support)
 */
function processForIOS(svgContent) {
  // Ensure fill is currentColor for template rendering
  let processed = svgContent;

  // Remove any hardcoded colors, replace with currentColor
  processed = processed
    .replace(/fill="#[0-9a-fA-F]+"/g, 'fill="currentColor"')
    .replace(/fill="rgb\([^)]+\)"/g, 'fill="currentColor"')
    .replace(/fill="black"/g, 'fill="currentColor"')
    .replace(/fill="white"/g, 'fill="currentColor"');

  return processed;
}

/**
 * Generate iOS asset for a single icon
 */
function generateIOSAsset(filename) {
  const inputPath = path.join(PATHS.input, filename);
  const iconName = filename.replace(/\.svg$/, '');
  const iosName = toiOSName(iconName);
  const imagesetDir = path.join(PATHS.output, `${iosName}.imageset`);

  try {
    // Create imageset directory
    if (!fs.existsSync(imagesetDir)) {
      fs.mkdirSync(imagesetDir, { recursive: true });
    }

    // Read and process SVG
    const svgContent = fs.readFileSync(inputPath, 'utf8');
    const processedSvg = processForIOS(svgContent);

    // Write SVG to imageset
    const svgPath = path.join(imagesetDir, `${iosName}.svg`);
    fs.writeFileSync(svgPath, processedSvg, 'utf8');

    // Write Contents.json
    const contentsPath = path.join(imagesetDir, 'Contents.json');
    const contents = generateImagesetContents(`${iosName}.svg`);
    fs.writeFileSync(contentsPath, JSON.stringify(contents, null, 2), 'utf8');

    return {
      name: iosName,
      originalName: iconName,
      success: true,
    };
  } catch (error) {
    return {
      name: iosName,
      originalName: iconName,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate Swift extension for easy icon access
 */
function generateSwiftExtension(icons) {
  const iconCases = icons
    .filter(i => i.success)
    .map(i => `    case ${i.name} = "${i.name}"`)
    .join('\n');

  const iconPreviewCases = icons
    .filter(i => i.success)
    .map(i => `        case .${i.name}: return "${i.originalName}"`)
    .join('\n');

  return `// GENERATED CODE - DO NOT MODIFY BY HAND
// Generated at: ${new Date().toISOString()}
//
// BILD Design System Icons - Swift Extension
// To regenerate, run: npm run build:icons:ios

import SwiftUI

/// BILD Design System Icon names
///
/// Usage:
/// \`\`\`swift
/// Image(BildIcon.add.rawValue)
///     .foregroundColor(.primary)
///
/// // Or with the convenience extension:
/// BildIcon.add.image
///     .foregroundColor(.primary)
/// \`\`\`
public enum BildIcon: String, CaseIterable {
${iconCases}

    /// The image for this icon
    public var image: Image {
        Image(rawValue, bundle: .module)
    }

    /// Human-readable name for preview/debugging
    public var displayName: String {
        switch self {
${iconPreviewCases}
        }
    }
}

#if DEBUG
/// Preview provider for all icons
struct BildIconPreviews: PreviewProvider {
    static var previews: some View {
        ScrollView {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 60))], spacing: 16) {
                ForEach(BildIcon.allCases, id: \\.self) { icon in
                    VStack {
                        icon.image
                            .font(.title)
                        Text(icon.displayName)
                            .font(.caption2)
                    }
                }
            }
            .padding()
        }
    }
}
#endif
`;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n========================================');
  console.log('  iOS SVG Asset Generation');
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

  // Create output directory structure
  const xcassetsDir = path.dirname(PATHS.output);
  if (!fs.existsSync(PATHS.output)) {
    fs.mkdirSync(PATHS.output, { recursive: true });
    log.success('Created Assets.xcassets structure');
  }

  // Write xcassets Contents.json
  const xcassetsContentsPath = path.join(xcassetsDir, 'Contents.json');
  fs.writeFileSync(
    xcassetsContentsPath,
    JSON.stringify(generateXcassetsContents(), null, 2),
    'utf8'
  );

  // Write Icons folder Contents.json
  const iconsContentsPath = path.join(PATHS.output, 'Contents.json');
  fs.writeFileSync(
    iconsContentsPath,
    JSON.stringify(generateFolderContents(), null, 2),
    'utf8'
  );

  // Generate all iOS assets
  log.step('Generating iOS assets...');
  const results = [];

  for (const file of svgFiles) {
    const result = generateIOSAsset(file);
    results.push(result);

    if (result.success) {
      log.info(`${result.name}.imageset/`);
    } else {
      log.error(`${result.name}: ${result.error}`);
    }
  }

  // Generate Swift extension
  log.step('Generating Swift extension...');
  const swiftContent = generateSwiftExtension(results);
  const swiftDir = path.join(path.dirname(xcassetsDir), 'Sources');
  if (!fs.existsSync(swiftDir)) {
    fs.mkdirSync(swiftDir, { recursive: true });
  }
  const swiftPath = path.join(swiftDir, 'BildIcons.swift');
  fs.writeFileSync(swiftPath, swiftContent, 'utf8');
  log.success('Created BildIcons.swift');

  // Summary
  console.log('\n========================================');
  console.log('  Summary');
  console.log('========================================\n');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  log.success(`Generated: ${successful}/${results.length} imagesets`);

  if (failed > 0) {
    log.error(`Failed: ${failed} imageset(s)`);
    return { success: false, count: successful, failed };
  }

  log.info(`Output: ${path.dirname(xcassetsDir)}`);

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

module.exports = { main, PATHS, toiOSName };
