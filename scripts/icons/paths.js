/**
 * Icon Build Pipeline - Path Configuration
 *
 * Centralized path configuration for all icon build scripts.
 * This ensures consistency across all platform builds.
 */

const path = require('path');
const config = require('../../build-config/tokens/pipeline.config.js');

// Base paths
const ROOT = path.resolve(__dirname, '../..');
const ICONS_ROOT = path.join(ROOT, 'packages/icons');

// Extract config values for path construction
const androidNamespace = config.packages.icons.android.namespace;
const iosProductName = config.packages.icons.ios.productName;

// Convert namespace to path (de.bild.design.icons → de/bild/design/icons)
const androidNamespacePath = androidNamespace.replace(/\./g, '/');

/**
 * All paths used by the icon build pipeline
 */
const PATHS = {
  // Root directories
  root: ROOT,
  iconsRoot: ICONS_ROOT,

  // ============================================
  // INPUT
  // ============================================

  /** Source SVG files from Figma */
  source: path.join(ICONS_ROOT, 'src'),

  // ============================================
  // NPM PACKAGE OUTPUTS
  // ============================================

  /** @marioschmidt/design-system-icons - Optimized SVGs */
  svg: path.join(ICONS_ROOT, 'svg/dist'),

  /** @marioschmidt/design-system-icons-react - React components */
  react: path.join(ICONS_ROOT, 'react/dist'),

  /** Temporary directory for React TSX compilation */
  reactSrc: path.join(ICONS_ROOT, 'react/.src'),

  // ============================================
  // NATIVE PLATFORM OUTPUTS
  // ============================================

  /** Android Vector Drawables */
  android: path.join(ICONS_ROOT, 'android/src/main/res/drawable'),

  /** Android values (attrs.xml) */
  androidValues: path.join(ICONS_ROOT, 'android/src/main/res/values'),

  /** Android Kotlin source files (path derived from namespace) */
  androidKotlin: path.join(ICONS_ROOT, `android/src/main/kotlin/${androidNamespacePath}`),

  /** iOS Asset Catalog (path derived from product name) */
  ios: path.join(ICONS_ROOT, `ios/Sources/${iosProductName}/Resources/Assets.xcassets/Icons`),

  /** iOS Swift source files (path derived from product name) */
  iosSwift: path.join(ICONS_ROOT, `ios/Sources/${iosProductName}`),

  // ============================================
  // LEGACY PATHS (for migration compatibility)
  // ============================================

  /** @deprecated Use PATHS.svg instead */
  legacyOutput: path.join(ICONS_ROOT, 'dist'),
};

/**
 * Ensure a directory exists, creating it if necessary
 * @param {string} dirPath - Directory path to ensure exists
 */
function ensureDir(dirPath) {
  const fs = require('fs');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

/**
 * Clean a directory by removing all contents
 * @param {string} dirPath - Directory path to clean
 */
function cleanDir(dirPath) {
  const fs = require('fs');
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true });
  }
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
}

module.exports = {
  PATHS,
  ensureDir,
  cleanDir,
};
