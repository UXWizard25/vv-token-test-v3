#!/usr/bin/env node

/**
 * iOS Package.swift Generator
 *
 * Generates Package.swift from pipeline.config.js.
 * This ensures the SPM package configuration matches the central config.
 *
 * Output: packages/icons/ios/Package.swift
 */

const fs = require('fs');
const path = require('path');
const config = require('../../build-config/tokens/pipeline.config.js');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PATHS = {
  output: path.resolve(__dirname, '../../packages/icons/ios/Package.swift'),
};

// Extract config values
const iosConfig = config.packages.icons.ios;
const identity = config.identity;
const namingConfig = config.icons.naming;

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

const log = {
  info: (msg) => console.log(`\u2139\uFE0F  ${msg}`),
  success: (msg) => console.log(`\u2705 ${msg}`),
  error: (msg) => console.error(`\u274C ${msg}`),
  step: (msg) => console.log(`\n\u27A1\uFE0F  ${msg}`),
};

// ============================================================================
// GENERATOR
// ============================================================================

/**
 * Generate Package.swift content
 */
function generatePackageSwift() {
  const packageName = iosConfig.packageName;
  const productName = iosConfig.productName;
  const targetName = iosConfig.targetName;
  const swiftToolsVersion = iosConfig.swiftToolsVersion;
  const iosVersion = iosConfig.iosVersion || '15.0';
  const systemName = identity.name;
  const enumName = `${namingConfig.prefix}Icon`;

  return `// swift-tools-version:${swiftToolsVersion}
// The swift-tools-version declares the minimum version of Swift required to build this package.

/**
 * ${systemName} Icons - Swift Package
 *
 * Provides SwiftUI-compatible icon assets for iOS and macOS.
 *
 * Usage:
 *   import ${productName}
 *
 *   // Using the enum
 *   Image(${enumName}.add.rawValue)
 *       .foregroundColor(.primary)
 *
 *   // Using the convenience extension
 *   ${enumName}.add.image
 *       .foregroundColor(.primary)
 */

import PackageDescription

let package = Package(
    name: "${packageName}",
    platforms: [
        .iOS(.v${iosVersion.split('.')[0]}),
        .macOS(.v11),
        .tvOS(.v14),
        .watchOS(.v7)
    ],
    products: [
        .library(
            name: "${productName}",
            targets: ["${targetName}"]
        )
    ],
    targets: [
        .target(
            name: "${targetName}",
            path: "Sources/${targetName}",
            resources: [
                .process("Resources")
            ]
        )
    ]
)
`;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  log.step('Generating Package.swift...');

  try {
    const content = generatePackageSwift();

    // Ensure output directory exists
    const outputDir = path.dirname(PATHS.output);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(PATHS.output, content, 'utf8');
    log.success(`Created ${path.basename(PATHS.output)}`);

    return { success: true };
  } catch (error) {
    log.error(`Failed to generate Package.swift: ${error.message}`);
    return { success: false, error: error.message };
  }
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

module.exports = { main, generatePackageSwift };
