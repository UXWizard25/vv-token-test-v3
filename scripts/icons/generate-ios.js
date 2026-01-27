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
const { PATHS: SHARED_PATHS } = require('./paths');
const pipelineConfig = require('../../build-config/pipeline.config.js');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PATHS = {
  input: SHARED_PATHS.svg,
  output: SHARED_PATHS.ios,
  swift: SHARED_PATHS.iosSwift,
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
 * 2-liga-logo -> _2LigaLogo (prefixed with underscore for Swift validity)
 *
 * Swift identifiers cannot start with numbers, so we prefix with underscore.
 */
function toiOSName(str) {
  const camelCase = str.replace(/-([a-z0-9])/gi, (_, char) => char.toUpperCase());
  // Swift identifiers cannot start with a number - prefix with underscore
  if (/^[0-9]/.test(camelCase)) {
    return '_' + camelCase;
  }
  return camelCase;
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
      author: pipelineConfig.iconAssetAuthor,
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
      author: pipelineConfig.iconAssetAuthor,
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
      author: pipelineConfig.iconAssetAuthor,
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
 * All names are derived from pipeline.config.js
 */
function generateSwiftExtension(icons) {
  // Get config values
  const enumName = pipelineConfig.iosIconEnumName;
  const systemName = pipelineConfig.identity.name;
  const defaultSize = pipelineConfig.icons.defaultSize;
  const sizePresets = pipelineConfig.icons.sizePresets;

  const iconCases = icons
    .filter(i => i.success)
    .map(i => `    case ${i.name} = "${i.name}"`)
    .join('\n');

  const iconPreviewCases = icons
    .filter(i => i.success)
    .map(i => `        case .${i.name}: return "${i.originalName}"`)
    .join('\n');

  // Size preset full names for documentation
  const sizeFullNames = {
    xs: 'Extra small',
    sm: 'Small',
    md: 'Medium',
    lg: 'Large',
    xl: 'Extra large',
  };

  // Generate size enum cases from config
  const sizeCases = Object.entries(sizePresets)
    .map(([key, value]) => {
      const isDefault = value === defaultSize;
      const comment = isDefault ? ' - Default' : '';
      const fullName = sizeFullNames[key] || key.charAt(0).toUpperCase() + key.slice(1);
      return `        /// ${fullName} icon (${value}pt)${comment}
        case ${key} = ${value}`;
    })
    .join('\n');

  return `// GENERATED CODE - DO NOT MODIFY BY HAND
// Generated at: ${new Date().toISOString()}
//
// ${systemName} Icons - Swift Extension
// To regenerate, run: npm run build:icons:ios

import SwiftUI

// MARK: - ${enumName} Enum

/// ${systemName} Icon names
///
/// Usage:
/// \`\`\`swift
/// // Simple usage with convenience method
/// ${enumName}.add.icon()
///
/// // With custom size and color
/// ${enumName}.arrowLeft.icon(size: 32, color: .blue)
///
/// // Using the raw Image for more control
/// ${enumName}.menu.image
///     .resizable()
///     .frame(width: ${defaultSize}, height: ${defaultSize})
///     .foregroundColor(.primary)
/// \`\`\`
public enum ${enumName}: String, CaseIterable, Sendable {
${iconCases}

    /// The image for this icon (use for custom configurations)
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

// MARK: - Convenience Modifiers

public extension ${enumName} {
    /// Standard icon sizes following SF Symbols conventions
    enum Size: CGFloat, Sendable {
${sizeCases}
    }

    /// Creates an icon view with specified size and color
    ///
    /// - Parameters:
    ///   - size: The icon size in points (default: ${defaultSize})
    ///   - color: The icon color (default: .primary)
    /// - Returns: A configured icon view
    ///
    /// Example:
    /// \`\`\`swift
    /// ${enumName}.add.icon(size: 32, color: .blue)
    /// \`\`\`
    @ViewBuilder
    func icon(size: CGFloat = ${defaultSize}, color: Color = .primary) -> some View {
        image
            .resizable()
            .renderingMode(.template)
            .frame(width: size, height: size)
            .foregroundColor(color)
    }

    /// Creates an icon view with a preset size
    ///
    /// - Parameters:
    ///   - size: The preset size (.xs, .sm, .md, .lg, .xl)
    ///   - color: The icon color (default: .primary)
    /// - Returns: A configured icon view
    ///
    /// Example:
    /// \`\`\`swift
    /// ${enumName}.menu.icon(size: .lg, color: .red)
    /// \`\`\`
    @ViewBuilder
    func icon(size: Size, color: Color = .primary) -> some View {
        icon(size: size.rawValue, color: color)
    }
}

// MARK: - Button Convenience

public extension ${enumName} {
    /// Creates a button with this icon
    ///
    /// - Parameters:
    ///   - size: The icon size in points (default: ${defaultSize})
    ///   - color: The icon color (default: .primary)
    ///   - action: The action to perform when tapped
    /// - Returns: A button with the icon
    ///
    /// Example:
    /// \`\`\`swift
    /// ${enumName}.close.button {
    ///     dismiss()
    /// }
    /// \`\`\`
    func button(
        size: CGFloat = ${defaultSize},
        color: Color = .primary,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            icon(size: size, color: color)
        }
    }
}

// MARK: - Accessibility

public extension ${enumName} {
    /// Creates an accessible icon with a label for screen readers
    ///
    /// - Parameters:
    ///   - label: The accessibility label for screen readers
    ///   - size: The icon size in points (default: ${defaultSize})
    ///   - color: The icon color (default: .primary)
    /// - Returns: An accessible icon view
    ///
    /// Example:
    /// \`\`\`swift
    /// ${enumName}.add.accessibleIcon(label: "Add item")
    /// \`\`\`
    @ViewBuilder
    func accessibleIcon(
        label: String,
        size: CGFloat = ${defaultSize},
        color: Color = .primary
    ) -> some View {
        icon(size: size, color: color)
            .accessibilityLabel(label)
    }

    /// Creates a decorative icon hidden from screen readers
    ///
    /// Use for icons that are purely decorative and don't convey meaning.
    ///
    /// - Parameters:
    ///   - size: The icon size in points (default: ${defaultSize})
    ///   - color: The icon color (default: .primary)
    /// - Returns: A decorative icon view hidden from accessibility
    @ViewBuilder
    func decorativeIcon(size: CGFloat = ${defaultSize}, color: Color = .primary) -> some View {
        icon(size: size, color: color)
            .accessibilityHidden(true)
    }
}

#if DEBUG
// MARK: - Previews

/// Preview provider for all icons
struct ${enumName}Previews: PreviewProvider {
    static var previews: some View {
        ScrollView {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 80))], spacing: 16) {
                ForEach(${enumName}.allCases, id: \\.self) { icon in
                    VStack(spacing: 8) {
                        icon.icon(size: .md)
                        Text(icon.displayName)
                            .font(.caption2)
                            .lineLimit(1)
                    }
                    .frame(width: 80)
                }
            }
            .padding()
        }
        .previewDisplayName("All Icons")
    }
}

/// Preview for icon sizes
struct ${enumName}SizePreviews: PreviewProvider {
    static var previews: some View {
        VStack(spacing: 24) {
            HStack(spacing: 24) {
                ${enumName}.add.icon(size: .xs)
                ${enumName}.add.icon(size: .sm)
                ${enumName}.add.icon(size: .md)
                ${enumName}.add.icon(size: .lg)
                ${enumName}.add.icon(size: .xl)
            }
            HStack(spacing: 24) {
                ${enumName}.add.icon(size: .md, color: .red)
                ${enumName}.add.icon(size: .md, color: .blue)
                ${enumName}.add.icon(size: .md, color: .green)
            }
        }
        .padding()
        .previewDisplayName("Icon Sizes & Colors")
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
  if (!fs.existsSync(PATHS.swift)) {
    fs.mkdirSync(PATHS.swift, { recursive: true });
  }
  const swiftFileName = `${pipelineConfig.iosIconEnumName}.swift`;
  const swiftPath = path.join(PATHS.swift, swiftFileName);
  fs.writeFileSync(swiftPath, swiftContent, 'utf8');
  log.success(`Created ${swiftFileName}`);

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
