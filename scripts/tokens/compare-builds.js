#!/usr/bin/env node

/**
 * Compare Dist Builds - Full Platform Comparison
 *
 * Compares entire dist/ folders (old vs new) and generates
 * platform-specific diff data for release notes.
 *
 * Usage:
 *   node scripts/tokens/compare-builds.js --old dist-old/ --new dist/ --output diff.json
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

  kotlin: {
    extensions: ['.kt'],
    icon: '🤖',
    name: 'Android (Compose)',
    parseTokens: (content) => {
      const tokens = new Map();

      // Match Kotlin val/const val: val TokenName = value
      const valRegex = /(?:const\s+)?val\s+(\w+)\s*=\s*(.+)$/gm;
      let match;
      while ((match = valRegex.exec(content)) !== null) {
        tokens.set(match[1], match[2].trim());
      }

      // Match Kotlin object properties with explicit types: val Name: Type = value
      const typedValRegex = /val\s+(\w+):\s*\w+\s*=\s*(.+)$/gm;
      while ((match = typedValRegex.exec(content)) !== null) {
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
 * Uses token 'name' field (from Style Dictionary) or key as token name
 * to ensure consistency with other platforms (CSS, JS, etc.)
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
      // Use 'name' field from Style Dictionary output, fallback to key (not full path)
      // This ensures consistency with other platforms that use flat token names
      const tokenName = value.name || key;
      tokens.set(tokenName, typeof tokenValue === 'object' ? JSON.stringify(tokenValue) : String(tokenValue));
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
// SOURCE FILE PARSING (for Rename Detection)
// =============================================================================

/**
 * Parse Figma source file and extract variable metadata
 * @param {string} sourcePath - Path to bild-design-system-raw-data.json
 * @returns {Map} - Map of variableId -> { id, name, resolvedType, scopes, collectionId, collectionName }
 */
function parseSourceFile(sourcePath) {
  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️  Source file not found: ${sourcePath}`);
    return new Map();
  }

  try {
    const data = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
    const variables = new Map();

    if (!data.collections || !Array.isArray(data.collections)) {
      console.log(`⚠️  Invalid source file format: missing collections`);
      return variables;
    }

    data.collections.forEach(collection => {
      if (!collection.variables) return;

      collection.variables.forEach(variable => {
        variables.set(variable.id, {
          id: variable.id,
          name: variable.name,
          resolvedType: variable.resolvedType,
          scopes: variable.scopes || [],
          collectionId: collection.id,
          collectionName: collection.name,
          description: variable.description || ''
        });
      });
    });

    console.log(`   Parsed ${variables.size} variables from source file`);
    return variables;
  } catch (e) {
    console.log(`⚠️  Error parsing source file: ${e.message}`);
    return new Map();
  }
}

/**
 * Detect token renames by comparing Variable IDs between old and new source
 * @param {Map} oldSource - Variables from old source file
 * @param {Map} newSource - Variables from new source file
 * @returns {Object} - { renames, actuallyRemoved, actuallyAdded }
 */
function detectRenames(oldSource, newSource) {
  const renames = [];
  const actuallyRemoved = [];
  const actuallyAdded = [];

  // Find renames and true removals
  for (const [id, oldVar] of oldSource) {
    const newVar = newSource.get(id);
    if (!newVar) {
      // Variable ID doesn't exist in new → truly removed
      actuallyRemoved.push({
        variableId: id,
        name: oldVar.name,
        resolvedType: oldVar.resolvedType,
        collectionName: oldVar.collectionName,
        category: categorizeTokenFromSource(oldVar)
      });
    } else if (oldVar.name !== newVar.name) {
      // Same ID, different name → renamed
      renames.push({
        variableId: id,
        oldName: oldVar.name,
        newName: newVar.name,
        resolvedType: oldVar.resolvedType,
        collectionName: oldVar.collectionName,
        category: categorizeTokenFromSource(oldVar),
        confidence: 1.0 // 100% confidence because same Variable ID
      });
    }
  }

  // Find true additions (new Variable IDs)
  for (const [id, newVar] of newSource) {
    if (!oldSource.has(id)) {
      actuallyAdded.push({
        variableId: id,
        name: newVar.name,
        resolvedType: newVar.resolvedType,
        collectionName: newVar.collectionName,
        category: categorizeTokenFromSource(newVar)
      });
    }
  }

  return { renames, actuallyRemoved, actuallyAdded };
}

// =============================================================================
// TOKEN CATEGORIZATION
// =============================================================================

/**
 * Token category definitions for grouping changes
 */
const TOKEN_CATEGORIES = {
  colors: {
    icon: '🎨',
    label: 'Colors',
    match: (token) => {
      if (token.resolvedType === 'COLOR') return true;
      if (token.$type === 'color') return true;
      return false;
    }
  },
  typography: {
    icon: '📝',
    label: 'Typography',
    match: (token) => {
      const typographyTypes = ['fontSize', 'lineHeight', 'letterSpacing', 'fontWeight', 'fontFamily'];
      if (typographyTypes.includes(token.$type)) return true;
      // Check scopes from source
      const scopes = token.scopes || [];
      if (scopes.some(s => ['FONT_SIZE', 'LINE_HEIGHT', 'LETTER_SPACING', 'FONT_WEIGHT', 'FONT_FAMILY'].includes(s))) return true;
      return false;
    }
  },
  spacing: {
    icon: '📏',
    label: 'Spacing',
    match: (token) => {
      const name = (token.name || '').toLowerCase();
      if (token.$type === 'dimension' && /space|gap|inline|stack|inset|margin|padding/i.test(name)) return true;
      // Check scopes
      const scopes = token.scopes || [];
      if (scopes.includes('GAP')) return true;
      // Check collection name
      if ((token.collectionName || '').toLowerCase().includes('space')) return true;
      return false;
    }
  },
  sizing: {
    icon: '📐',
    label: 'Sizing',
    match: (token) => {
      const name = (token.name || '').toLowerCase();
      if (token.$type === 'dimension' && !/space|gap|inline|stack|inset|margin|padding/i.test(name)) return true;
      // Check scopes
      const scopes = token.scopes || [];
      if (scopes.some(s => ['CORNER_RADIUS', 'WIDTH_HEIGHT', 'STROKE_FLOAT'].includes(s))) return true;
      // Check collection name
      if ((token.collectionName || '').toLowerCase().includes('size')) return true;
      return false;
    }
  },
  effects: {
    icon: '✨',
    label: 'Effects',
    match: (token) => {
      if (token.$type === 'shadow') return true;
      const name = (token.name || '').toLowerCase();
      if (/shadow|effect|elevation|blur/i.test(name)) return true;
      return false;
    }
  }
};

/**
 * Categorize a token from source file metadata
 */
function categorizeTokenFromSource(sourceVar) {
  // Create a token-like object for matching
  const token = {
    name: sourceVar.name,
    resolvedType: sourceVar.resolvedType,
    scopes: sourceVar.scopes || [],
    collectionName: sourceVar.collectionName
  };

  for (const [category, config] of Object.entries(TOKEN_CATEGORIES)) {
    if (config.match(token)) return category;
  }
  return 'other';
}

/**
 * Categorize a token from dist comparison
 */
function categorizeTokenFromDist(tokenName, value) {
  const name = tokenName.toLowerCase();

  // Color detection by value
  if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
    return 'colors';
  }

  // Name-based detection
  if (/color|bg|background|foreground|fill|stroke|text-color|surface|accent/i.test(name)) {
    return 'colors';
  }
  if (/font-?size|line-?height|letter-?spacing|font-?weight|font-?family|typography/i.test(name)) {
    return 'typography';
  }
  if (/space|gap|inline|stack|inset|margin|padding/i.test(name)) {
    return 'spacing';
  }
  if (/shadow|effect|elevation|blur/i.test(name)) {
    return 'effects';
  }
  if (/size|width|height|radius|border-radius/i.test(name)) {
    return 'sizing';
  }

  return 'other';
}

// =============================================================================
// LAYER DETECTION
// =============================================================================

/**
 * Detect token layer from collection name
 */
function detectLayer(collectionName) {
  if (!collectionName) return 'unknown';

  const normalized = collectionName.replace(/^_/, '').toLowerCase();

  // Primitives (Layer 0)
  if (/primitive|fontprimitive|colorprimitive|sizeprimitive|spaceprimitive/i.test(normalized)) {
    return 'primitive';
  }

  // Mapping (Layer 1)
  if (/brandtokenmapping|brandcolormapping|density/i.test(normalized)) {
    return 'mapping';
  }

  // Semantic (Layer 2)
  if (/breakpointmode|colormode/i.test(normalized)) {
    return 'semantic';
  }

  // Component (Layer 3) - detected from token path
  return 'semantic'; // Default for unknown
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
    return 'kotlin';  // Android Compose uses .kt files
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
 * Normalize token value for comparison
 * Handles hex color case differences (#B0D1F3 vs #b0d1f3)
 */
function normalizeTokenValue(value) {
  if (typeof value !== 'string') return value;

  // Normalize hex colors to lowercase (3, 4, 6, or 8 digit hex)
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) {
    return value.toLowerCase();
  }

  return value;
}

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
    } else if (normalizeTokenValue(oldValue) !== normalizeTokenValue(newValue)) {
      // Compare normalized values to ignore case differences in hex colors
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

  // Maps to group token details by normalized name
  const tokenDetailsAdded = new Map();    // normalizedName -> { platforms: [...], value, ... }
  const tokenDetailsModified = new Map(); // normalizedName -> { platforms: [...], oldValue, newValue, ... }
  const tokenDetailsRemoved = new Map();  // normalizedName -> { platforms: [...], value, ... }

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
    byUniqueToken: {
      added: [],
      modified: [],
      removed: []
    },
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

    const platformInfo = { key: platform, name: platformData.name, icon: platformData.icon };

    if (diff.type === 'added') {
      results.summary.filesAdded++;
      platformData.filesAdded++;
      platformData.tokensAdded += diff.tokens.length;
      results.summary.tokensAdded += diff.tokens.length;
      // Track unique tokens with details
      for (const token of diff.tokens) {
        const normalized = normalizeTokenName(token.name);
        uniqueTokensAdded.add(normalized);
        if (!tokenDetailsAdded.has(normalized)) {
          tokenDetailsAdded.set(normalized, { value: token.value, platforms: [] });
        }
        tokenDetailsAdded.get(normalized).platforms.push({
          ...platformInfo, tokenName: token.name, file: diff.file
        });
      }
    } else if (diff.type === 'removed') {
      results.summary.filesRemoved++;
      platformData.filesRemoved++;
      platformData.tokensRemoved += diff.tokens.length;
      results.summary.tokensRemoved += diff.tokens.length;
      // Track unique tokens with details
      for (const token of diff.tokens) {
        const normalized = normalizeTokenName(token.name);
        uniqueTokensRemoved.add(normalized);
        if (!tokenDetailsRemoved.has(normalized)) {
          tokenDetailsRemoved.set(normalized, { value: token.value, platforms: [] });
        }
        tokenDetailsRemoved.get(normalized).platforms.push({
          ...platformInfo, tokenName: token.name, file: diff.file
        });
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
      // Track unique tokens with details
      for (const token of diff.changes.added) {
        const normalized = normalizeTokenName(token.name);
        uniqueTokensAdded.add(normalized);
        if (!tokenDetailsAdded.has(normalized)) {
          tokenDetailsAdded.set(normalized, { value: token.value, platforms: [] });
        }
        tokenDetailsAdded.get(normalized).platforms.push({
          ...platformInfo, tokenName: token.name, file: diff.file
        });
      }
      for (const token of diff.changes.modified) {
        const normalized = normalizeTokenName(token.name);
        uniqueTokensModified.add(normalized);
        if (!tokenDetailsModified.has(normalized)) {
          tokenDetailsModified.set(normalized, { oldValue: token.oldValue, newValue: token.newValue, platforms: [] });
        }
        tokenDetailsModified.get(normalized).platforms.push({
          ...platformInfo, tokenName: token.name, file: diff.file
        });
      }
      for (const token of diff.changes.removed) {
        const normalized = normalizeTokenName(token.name);
        uniqueTokensRemoved.add(normalized);
        if (!tokenDetailsRemoved.has(normalized)) {
          tokenDetailsRemoved.set(normalized, { value: token.value, platforms: [] });
        }
        tokenDetailsRemoved.get(normalized).platforms.push({
          ...platformInfo, tokenName: token.name, file: diff.file
        });
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

  // Convert token details Maps to arrays for byUniqueToken
  for (const [normalized, details] of tokenDetailsAdded) {
    results.byUniqueToken.added.push({
      normalizedName: normalized,
      displayName: details.platforms[0]?.tokenName || normalized,
      value: details.value,
      platforms: details.platforms
    });
  }
  for (const [normalized, details] of tokenDetailsModified) {
    results.byUniqueToken.modified.push({
      normalizedName: normalized,
      displayName: details.platforms[0]?.tokenName || normalized,
      oldValue: details.oldValue,
      newValue: details.newValue,
      platforms: details.platforms
    });
  }
  for (const [normalized, details] of tokenDetailsRemoved) {
    results.byUniqueToken.removed.push({
      normalizedName: normalized,
      displayName: details.platforms[0]?.tokenName || normalized,
      value: details.value,
      platforms: details.platforms
    });
  }

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
    sourceOld: null,
    sourceNew: null,
    output: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--old' && args[i + 1]) {
      options.oldDir = args[++i];
    } else if (args[i] === '--new' && args[i + 1]) {
      options.newDir = args[++i];
    } else if (args[i] === '--source-old' && args[i + 1]) {
      options.sourceOld = args[++i];
    } else if (args[i] === '--source-new' && args[i + 1]) {
      options.sourceNew = args[++i];
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
Usage: node scripts/tokens/compare-builds.js --old <old-dist> --new <new-dist> [options]

Options:
  --old         Path to old dist directory (baseline)
  --new         Path to new dist directory (current)
  --source-old  Path to old Figma source JSON (for rename detection)
  --source-new  Path to new Figma source JSON (for rename detection)
  --output      Path to output JSON file (optional, defaults to stdout)

Example:
  node scripts/tokens/compare-builds.js \\
    --old dist-old/ \\
    --new dist/ \\
    --source-old source-old.json \\
    --source-new source-new.json \\
    --output diff.json
`);
    process.exit(1);
  }

  // Run dist comparison
  const results = compareDistBuilds(options.oldDir, options.newDir);

  // Run source-based rename detection if source files provided
  if (options.sourceOld && options.sourceNew) {
    console.log(`\n🔄 Detecting renames from source files...`);
    console.log(`   Old: ${options.sourceOld}`);
    console.log(`   New: ${options.sourceNew}`);

    const oldSource = parseSourceFile(options.sourceOld);
    const newSource = parseSourceFile(options.sourceNew);

    if (oldSource.size > 0 && newSource.size > 0) {
      const renameResults = detectRenames(oldSource, newSource);

      // Add rename detection results
      results.renames = renameResults.renames;
      results.sourceBasedChanges = {
        actuallyRemoved: renameResults.actuallyRemoved,
        actuallyAdded: renameResults.actuallyAdded
      };
      results.summary.uniqueTokensRenamed = renameResults.renames.length;

      // Adjust removed count - subtract renames from removed (they're not truly removed)
      // Note: This is approximate since dist-based and source-based detection may differ
      const renamedNormalizedNames = new Set(
        renameResults.renames.map(r => normalizeTokenName(r.oldName))
      );

      console.log(`\n   ✅ Rename detection complete:`);
      console.log(`      🔄 Renamed: ${renameResults.renames.length}`);
      console.log(`      🔴 Actually removed: ${renameResults.actuallyRemoved.length}`);
      console.log(`      🟢 Actually added: ${renameResults.actuallyAdded.length}`);
    } else {
      console.log(`   ⚠️  Could not perform rename detection (empty source files)`);
      results.renames = [];
      results.summary.uniqueTokensRenamed = 0;
    }
  } else {
    results.renames = [];
    results.summary.uniqueTokensRenamed = 0;
  }

  // Add category groupings
  results.byCategory = groupByCategory(results);

  const output = JSON.stringify(results, null, 2);

  if (options.output) {
    fs.writeFileSync(options.output, output, 'utf-8');
    console.log(`\n📄 Results written to: ${options.output}`);
  } else {
    console.log(output);
  }
}

/**
 * Group token changes by category
 */
function groupByCategory(results) {
  const categories = {
    colors: { added: [], modified: [], removed: [] },
    typography: { added: [], modified: [], removed: [] },
    spacing: { added: [], modified: [], removed: [] },
    sizing: { added: [], modified: [], removed: [] },
    effects: { added: [], modified: [], removed: [] },
    other: { added: [], modified: [], removed: [] }
  };

  // Group from byUniqueToken
  if (results.byUniqueToken) {
    for (const token of results.byUniqueToken.added || []) {
      const cat = categorizeTokenFromDist(token.displayName, token.value);
      categories[cat].added.push(token);
    }
    for (const token of results.byUniqueToken.modified || []) {
      const cat = categorizeTokenFromDist(token.displayName, token.oldValue);
      categories[cat].modified.push(token);
    }
    for (const token of results.byUniqueToken.removed || []) {
      const cat = categorizeTokenFromDist(token.displayName, token.value);
      categories[cat].removed.push(token);
    }
  }

  return categories;
}

if (require.main === module) {
  main();
}

module.exports = {
  compareDistBuilds,
  platformParsers,
  parseSourceFile,
  detectRenames,
  categorizeTokenFromDist,
  categorizeTokenFromSource,
  TOKEN_CATEGORIES
};
