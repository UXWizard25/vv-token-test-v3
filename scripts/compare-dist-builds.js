#!/usr/bin/env node

/**
 * Compare Dist Builds - Full Platform Comparison
 *
 * Compares entire dist/ folders (old vs new) and generates
 * platform-specific diff data for release notes.
 *
 * Usage:
 *   node compare-dist-builds.js --old dist-old/ --new dist/ --output diff.json
 */

const fs = require('fs');
const path = require('path');

// =============================================================================
// PLATFORM PARSERS
// =============================================================================

const platformParsers = {
  css: {
    extensions: ['.css'],
    icon: '🌐',
    name: 'CSS',
    parseTokens: (content, filePath) => {
      const tokens = new Map();

      // Match CSS custom properties: --token-name: value;
      const varRegex = /--([\w-]+):\s*([^;]+);/g;
      let match;
      while ((match = varRegex.exec(content)) !== null) {
        tokens.set(`--${match[1]}`, match[2].trim());
      }

      // Match CSS classes (for typography/effects): .className { ... }
      // Also match data-attribute selectors with classes
      const classRegex = /(?:\[data-[^\]]+\]\s*)?\.(\w+)\s*\{([^}]+)\}/g;
      while ((match = classRegex.exec(content)) !== null) {
        const className = match[1];
        const properties = match[2].trim();
        // Create a normalized value from the properties
        const normalizedProps = properties
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('/*'))
          .join(' ');
        tokens.set(`.${className}`, normalizedProps);
      }

      return tokens;
    }
  },

  scss: {
    extensions: ['.scss'],
    icon: '📜',
    name: 'SCSS',
    parseTokens: (content) => {
      const tokens = new Map();
      // Match SCSS variables: $token-name: value;
      const regex = /\$([\w-]+):\s*([^;]+);/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        tokens.set(`$${match[1]}`, match[2].trim());
      }

      // Match SCSS maps (for typography/effects): $name: ( ... );
      const mapRegex = /\$([\w-]+):\s*\(([^)]+)\);/gs;
      while ((match = mapRegex.exec(content)) !== null) {
        const mapName = match[1];
        const mapContent = match[2].trim().replace(/\s+/g, ' ');
        tokens.set(`$${mapName}`, mapContent);
      }

      return tokens;
    }
  },

  js: {
    extensions: ['.js'],
    icon: '💛',
    name: 'JavaScript',
    parseTokens: (content) => {
      const tokens = new Map();

      // Match simple ES6 exports: export const tokenName = "value";
      const stringRegex = /export const (\w+) = "([^"]+)";/g;
      let match;
      while ((match = stringRegex.exec(content)) !== null) {
        tokens.set(match[1], match[2]);
      }

      // Match object exports (typography): export const name = { ... };
      const objectRegex = /export const (\w+) = \{([^}]+)\};/gs;
      while ((match = objectRegex.exec(content)) !== null) {
        if (!tokens.has(match[1])) {
          const objContent = match[2].trim().replace(/\s+/g, ' ');
          tokens.set(match[1], `{${objContent}}`);
        }
      }

      // Match array exports (effects): export const name = [ ... ];
      const arrayRegex = /export const (\w+) = \[([^\]]+)\];/gs;
      while ((match = arrayRegex.exec(content)) !== null) {
        if (!tokens.has(match[1])) {
          const arrContent = match[2].trim().replace(/\s+/g, ' ');
          tokens.set(match[1], `[${arrContent}]`);
        }
      }

      // Match numeric/other simple values
      const simpleRegex = /export const (\w+) = ([^;{[\n]+);/g;
      while ((match = simpleRegex.exec(content)) !== null) {
        if (!tokens.has(match[1])) {
          tokens.set(match[1], match[2].trim());
        }
      }

      return tokens;
    }
  },

  swift: {
    extensions: ['.swift'],
    icon: '🍎',
    name: 'iOS (Swift)',
    parseTokens: (content) => {
      const tokens = new Map();

      // Match Swift static lets with array values: public static let Name: [Type] = [...]
      const arrayRegex = /public static let (\w+):\s*\[[^\]]+\]\s*=\s*\[([^\]]+)\]/gs;
      let match;
      while ((match = arrayRegex.exec(content)) !== null) {
        const arrContent = match[2].trim().replace(/\s+/g, ' ');
        tokens.set(match[1], `[${arrContent}]`);
      }

      // Match Swift static lets: public static let TokenName = value
      const regex = /public static let (\w+) = (.+)$/gm;
      while ((match = regex.exec(content)) !== null) {
        if (!tokens.has(match[1])) {
          tokens.set(match[1], match[2].trim());
        }
      }

      // Also match static lets without public
      const regex2 = /static let (\w+) = (.+)$/gm;
      while ((match = regex2.exec(content)) !== null) {
        if (!tokens.has(match[1])) {
          tokens.set(match[1], match[2].trim());
        }
      }

      return tokens;
    }
  },

  xml: {
    extensions: ['.xml'],
    icon: '🤖',
    name: 'Android (XML)',
    parseTokens: (content) => {
      const tokens = new Map();
      // Match XML resources: <type name="token_name">value</type>
      const regex = /<(color|dimen|string|string-array) name="([\w_-]+)"[^>]*>([^<]*)<\/\1>/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        tokens.set(match[2], match[3].trim());
      }
      return tokens;
    }
  },

  dart: {
    extensions: ['.dart'],
    icon: '🐦',
    name: 'Flutter (Dart)',
    parseTokens: (content) => {
      const tokens = new Map();

      // Match Dart static const with array values: static const name = [ ... ];
      const arrayRegex = /static const (\w+) = \[([^\]]+)\];/gs;
      let match;
      while ((match = arrayRegex.exec(content)) !== null) {
        const arrContent = match[2].trim().replace(/\s+/g, ' ');
        tokens.set(match[1], `[${arrContent}]`);
      }

      // Match Dart static const with map values: static const name = { ... };
      const mapRegex = /static const (\w+) = \{([^}]+)\};/gs;
      while ((match = mapRegex.exec(content)) !== null) {
        if (!tokens.has(match[1])) {
          const mapContent = match[2].trim().replace(/\s+/g, ' ');
          tokens.set(match[1], `{${mapContent}}`);
        }
      }

      // Match simple Dart static consts: static const tokenName = value;
      const regex = /static const (\w+) = ([^;{[\n]+);/g;
      while ((match = regex.exec(content)) !== null) {
        if (!tokens.has(match[1])) {
          tokens.set(match[1], match[2].trim());
        }
      }

      return tokens;
    }
  },

  json: {
    extensions: ['.json'],
    icon: '📋',
    name: 'JSON',
    parseTokens: (content, filePath) => {
      const tokens = new Map();
      // Skip manifest.json
      if (filePath && filePath.includes('manifest.json')) {
        return tokens;
      }
      try {
        const data = JSON.parse(content);
        flattenJsonTokens(data, '', tokens);
      } catch (e) {
        // Invalid JSON, skip
      }
      return tokens;
    }
  }
};

/**
 * Recursively flatten JSON tokens
 */
function flattenJsonTokens(obj, prefix, tokens) {
  if (!obj || typeof obj !== 'object') return;

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;

    // Skip metadata fields
    if (['filePath', 'isSource', 'original', 'path', 'attributes', '$extensions', 'com.figma'].includes(key)) {
      continue;
    }

    // If this looks like a token (has $value or value)
    if (value && typeof value === 'object' && ('$value' in value || 'value' in value)) {
      const tokenValue = value.$value !== undefined ? value.$value : value.value;
      tokens.set(path, typeof tokenValue === 'object' ? JSON.stringify(tokenValue) : String(tokenValue));
    } else if (value && typeof value === 'object') {
      flattenJsonTokens(value, path, tokens);
    }
  }
}

// =============================================================================
// TOKEN NORMALIZATION (for deduplication across platforms)
// =============================================================================

/**
 * Normalize a token name to a common format for cross-platform deduplication
 *
 * Examples:
 *   CSS:   --button-tertiary-label-color  → buttontertiarylabelcolor
 *   JS:    buttonTertiaryLabelColor       → buttontertiarylabelcolor
 *   Swift: ButtonTertiaryLabelColor       → buttontertiarylabelcolor
 *   XML:   button_tertiary_label_color    → buttontertiarylabelcolor
 *   SCSS:  $button-tertiary-label-color   → buttontertiarylabelcolor
 */
function normalizeTokenName(name) {
  return name
    .toLowerCase()
    .replace(/^[-$.]/, '')     // Remove leading prefixes (-, $, .)
    .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric
}

// =============================================================================
// FILE DISCOVERY
// =============================================================================

/**
 * Recursively find all files in a directory
 */
function findAllFiles(dir, baseDir = dir) {
  const files = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      files.push(...findAllFiles(fullPath, baseDir));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }

  return files;
}

/**
 * Detect platform from file path
 */
function detectPlatform(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  // Check by directory first
  if (filePath.startsWith('css/') || filePath.startsWith('bundles/')) {
    return 'css';
  } else if (filePath.startsWith('scss/')) {
    return 'scss';
  } else if (filePath.startsWith('js/')) {
    return 'js';
  } else if (filePath.startsWith('ios/')) {
    return 'swift';
  } else if (filePath.startsWith('android/')) {
    return 'xml';
  } else if (filePath.startsWith('flutter/')) {
    return 'dart';
  } else if (filePath.startsWith('json/')) {
    return 'json';
  }

  // Fallback to extension
  for (const [platform, config] of Object.entries(platformParsers)) {
    if (config.extensions.includes(ext)) {
      return platform;
    }
  }

  return null;
}

/**
 * Extract metadata from file path
 */
function extractFileMetadata(filePath) {
  const parts = filePath.split('/');
  const metadata = {
    platform: detectPlatform(filePath),
    brand: null,
    layer: null,
    component: null,
    fileName: path.basename(filePath)
  };

  // Extract brand
  const brandIndex = parts.indexOf('brands');
  if (brandIndex !== -1 && parts[brandIndex + 1]) {
    metadata.brand = parts[brandIndex + 1];
  }

  // Extract layer (semantic, components, shared, overrides)
  if (parts.includes('components')) {
    metadata.layer = 'components';
    const compIndex = parts.indexOf('components');
    if (parts[compIndex + 1]) {
      metadata.component = parts[compIndex + 1];
    }
  } else if (parts.includes('semantic')) {
    metadata.layer = 'semantic';
  } else if (parts.includes('shared')) {
    metadata.layer = 'shared';
  } else if (parts.includes('overrides')) {
    metadata.layer = 'overrides';
  } else if (parts.includes('bundles')) {
    metadata.layer = 'bundles';
  }

  return metadata;
}

// =============================================================================
// DIFF ENGINE
// =============================================================================

/**
 * Compare two token maps and return differences
 */
function compareTokenMaps(oldTokens, newTokens) {
  const changes = {
    added: [],
    modified: [],
    removed: []
  };

  // Find added and modified
  for (const [name, newValue] of newTokens) {
    const oldValue = oldTokens.get(name);
    if (oldValue === undefined) {
      changes.added.push({ name, value: newValue });
    } else if (oldValue !== newValue) {
      changes.modified.push({ name, oldValue, newValue });
    }
  }

  // Find removed
  for (const [name, oldValue] of oldTokens) {
    if (!newTokens.has(name)) {
      changes.removed.push({ name, value: oldValue });
    }
  }

  return changes;
}

/**
 * Compare a single file between old and new
 */
function compareFile(oldDir, newDir, relativePath) {
  const platform = detectPlatform(relativePath);
  if (!platform || !platformParsers[platform]) {
    return null;
  }

  const parser = platformParsers[platform];
  const oldPath = path.join(oldDir, relativePath);
  const newPath = path.join(newDir, relativePath);

  const oldExists = fs.existsSync(oldPath);
  const newExists = fs.existsSync(newPath);

  const metadata = extractFileMetadata(relativePath);

  // File added
  if (!oldExists && newExists) {
    const content = fs.readFileSync(newPath, 'utf-8');
    const tokens = parser.parseTokens(content, relativePath);
    return {
      type: 'added',
      file: relativePath,
      platform,
      metadata,
      tokens: Array.from(tokens.entries()).map(([name, value]) => ({ name, value }))
    };
  }

  // File removed
  if (oldExists && !newExists) {
    const content = fs.readFileSync(oldPath, 'utf-8');
    const tokens = parser.parseTokens(content, relativePath);
    return {
      type: 'removed',
      file: relativePath,
      platform,
      metadata,
      tokens: Array.from(tokens.entries()).map(([name, value]) => ({ name, value }))
    };
  }

  // File modified
  if (oldExists && newExists) {
    const oldContent = fs.readFileSync(oldPath, 'utf-8');
    const newContent = fs.readFileSync(newPath, 'utf-8');

    // Quick check if files are identical
    if (oldContent === newContent) {
      return null;
    }

    const oldTokens = parser.parseTokens(oldContent, relativePath);
    const newTokens = parser.parseTokens(newContent, relativePath);

    const changes = compareTokenMaps(oldTokens, newTokens);

    // No token-level changes (maybe just formatting)
    if (changes.added.length === 0 && changes.modified.length === 0 && changes.removed.length === 0) {
      return null;
    }

    return {
      type: 'modified',
      file: relativePath,
      platform,
      metadata,
      changes
    };
  }

  return null;
}

/**
 * Compare entire dist directories
 */
function compareDistBuilds(oldDir, newDir) {
  console.log(`\n🔍 Comparing dist builds...`);
  console.log(`   Old: ${oldDir}`);
  console.log(`   New: ${newDir}\n`);

  // Find all files in both directories
  const oldFiles = new Set(findAllFiles(oldDir));
  const newFiles = new Set(findAllFiles(newDir));
  const allFiles = new Set([...oldFiles, ...newFiles]);

  console.log(`   Found ${oldFiles.size} files in old build`);
  console.log(`   Found ${newFiles.size} files in new build`);
  console.log(`   Comparing ${allFiles.size} unique files...\n`);

  // Skip manifest.json (has timestamps)
  allFiles.delete('manifest.json');

  // Sets to track unique tokens across all platforms (normalized names)
  const uniqueTokensAdded = new Set();
  const uniqueTokensModified = new Set();
  const uniqueTokensRemoved = new Set();

  // Compare all files
  const results = {
    summary: {
      totalFiles: allFiles.size,
      filesAdded: 0,
      filesRemoved: 0,
      filesModified: 0,
      // Per-platform counts (additive)
      tokensAdded: 0,
      tokensModified: 0,
      tokensRemoved: 0,
      // Unique token counts (deduplicated across platforms)
      uniqueTokensAdded: 0,
      uniqueTokensModified: 0,
      uniqueTokensRemoved: 0
    },
    platforms: {},
    byBrand: {},
    byComponent: {},
    allChanges: []
  };

  // Initialize platform structures
  for (const [platform, config] of Object.entries(platformParsers)) {
    results.platforms[platform] = {
      name: config.name,
      icon: config.icon,
      filesAdded: 0,
      filesRemoved: 0,
      filesModified: 0,
      tokensAdded: 0,
      tokensModified: 0,
      tokensRemoved: 0,
      changes: []
    };
  }

  let processed = 0;
  for (const file of allFiles) {
    processed++;
    if (processed % 500 === 0) {
      console.log(`   Processing... ${processed}/${allFiles.size}`);
    }

    const diff = compareFile(oldDir, newDir, file);
    if (!diff) continue;

    const platform = diff.platform;
    const platformData = results.platforms[platform];

    if (diff.type === 'added') {
      results.summary.filesAdded++;
      platformData.filesAdded++;
      platformData.tokensAdded += diff.tokens.length;
      results.summary.tokensAdded += diff.tokens.length;
      // Track unique tokens
      for (const token of diff.tokens) {
        uniqueTokensAdded.add(normalizeTokenName(token.name));
      }
    } else if (diff.type === 'removed') {
      results.summary.filesRemoved++;
      platformData.filesRemoved++;
      platformData.tokensRemoved += diff.tokens.length;
      results.summary.tokensRemoved += diff.tokens.length;
      // Track unique tokens
      for (const token of diff.tokens) {
        uniqueTokensRemoved.add(normalizeTokenName(token.name));
      }
    } else if (diff.type === 'modified') {
      results.summary.filesModified++;
      platformData.filesModified++;
      platformData.tokensAdded += diff.changes.added.length;
      platformData.tokensModified += diff.changes.modified.length;
      platformData.tokensRemoved += diff.changes.removed.length;
      results.summary.tokensAdded += diff.changes.added.length;
      results.summary.tokensModified += diff.changes.modified.length;
      results.summary.tokensRemoved += diff.changes.removed.length;
      // Track unique tokens
      for (const token of diff.changes.added) {
        uniqueTokensAdded.add(normalizeTokenName(token.name));
      }
      for (const token of diff.changes.modified) {
        uniqueTokensModified.add(normalizeTokenName(token.name));
      }
      for (const token of diff.changes.removed) {
        uniqueTokensRemoved.add(normalizeTokenName(token.name));
      }
    }

    platformData.changes.push(diff);
    results.allChanges.push(diff);

    // Group by brand
    if (diff.metadata.brand) {
      if (!results.byBrand[diff.metadata.brand]) {
        results.byBrand[diff.metadata.brand] = [];
      }
      results.byBrand[diff.metadata.brand].push(diff);
    }

    // Group by component
    if (diff.metadata.component) {
      if (!results.byComponent[diff.metadata.component]) {
        results.byComponent[diff.metadata.component] = [];
      }
      results.byComponent[diff.metadata.component].push(diff);
    }
  }

  // Set unique token counts
  results.summary.uniqueTokensAdded = uniqueTokensAdded.size;
  results.summary.uniqueTokensModified = uniqueTokensModified.size;
  results.summary.uniqueTokensRemoved = uniqueTokensRemoved.size;

  // Calculate impact level
  results.summary.impactLevel = calculateImpactLevel(results);

  console.log(`\n✅ Comparison complete!`);
  console.log(`   Files: +${results.summary.filesAdded} / ~${results.summary.filesModified} / -${results.summary.filesRemoved}`);
  console.log(`   Tokens (per platform): +${results.summary.tokensAdded} / ~${results.summary.tokensModified} / -${results.summary.tokensRemoved}`);
  console.log(`   Unique Tokens: +${results.summary.uniqueTokensAdded} / ~${results.summary.uniqueTokensModified} / -${results.summary.uniqueTokensRemoved}`);
  console.log(`   Impact: ${results.summary.impactLevel}\n`);

  return results;
}

/**
 * Calculate overall impact level
 */
function calculateImpactLevel(results) {
  if (results.summary.tokensRemoved > 0 || results.summary.filesRemoved > 0) {
    return 'breaking';
  }
  if (results.summary.tokensModified > 0) {
    return 'moderate';
  }
  if (results.summary.tokensAdded > 0 || results.summary.filesAdded > 0) {
    return 'minor';
  }
  return 'none';
}

// =============================================================================
// CLI
// =============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    oldDir: null,
    newDir: null,
    output: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--old' && args[i + 1]) {
      options.oldDir = args[++i];
    } else if (args[i] === '--new' && args[i + 1]) {
      options.newDir = args[++i];
    } else if (args[i] === '--output' && args[i + 1]) {
      options.output = args[++i];
    }
  }

  return options;
}

function main() {
  const options = parseArgs();

  if (!options.oldDir || !options.newDir) {
    console.log(`
Usage: node compare-dist-builds.js --old <old-dist> --new <new-dist> [--output <file.json>]

Options:
  --old     Path to old dist directory (baseline)
  --new     Path to new dist directory (current)
  --output  Path to output JSON file (optional, defaults to stdout)

Example:
  node compare-dist-builds.js --old dist-old/ --new dist/ --output diff.json
`);
    process.exit(1);
  }

  const results = compareDistBuilds(options.oldDir, options.newDir);

  const output = JSON.stringify(results, null, 2);

  if (options.output) {
    fs.writeFileSync(options.output, output, 'utf-8');
    console.log(`📄 Results written to: ${options.output}`);
  } else {
    console.log(output);
  }
}

if (require.main === module) {
  main();
}

module.exports = { compareDistBuilds, platformParsers };
