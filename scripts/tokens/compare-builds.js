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
// CACHING FOR PERFORMANCE
// =============================================================================

// Cache Maps for expensive operations
const normalizedNameCache = new Map();
const categoryCache = new Map();

/**
 * Clear caches (useful for testing or between runs)
 */
function clearCaches() {
  normalizedNameCache.clear();
  categoryCache.clear();
}

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
  // Check cache first
  if (normalizedNameCache.has(name)) {
    return normalizedNameCache.get(name);
  }

  const normalized = name
    .toLowerCase()
    .replace(/^[-$.]/, '')     // Remove leading prefixes (-, $, .)
    .replace(/[^a-z0-9]/g, ''); // Remove all non-alphanumeric

  // Cache and return
  normalizedNameCache.set(name, normalized);
  return normalized;
}

/**
 * Convert platform-specific token name to canonical dot notation
 *
 * This provides a platform-agnostic representation following W3C DTCG conventions.
 *
 * Examples:
 *   CSS var:   --button-primary-bg      → button.primary.bg
 *   CSS class: .display-1               → display.1
 *   CSS class: .shadow-soft-md          → shadow.soft.md
 *   SCSS:      $button-primary-bg       → button.primary.bg
 *   JS:        buttonPrimaryBg          → button.primary.bg
 *   Swift:     ButtonPrimaryBg          → button.primary.bg
 *   Kotlin:    button_primary_bg        → button.primary.bg
 */
function toDotNotation(tokenName) {
  if (!tokenName) return tokenName;

  let result = tokenName;

  // Remove platform prefixes
  if (result.startsWith('--')) {
    // CSS variable: --token-name
    result = result.slice(2);
  } else if (result.startsWith('.')) {
    // CSS class: .class-name
    result = result.slice(1);
  } else if (result.startsWith('$')) {
    // SCSS variable: $token-name
    result = result.slice(1);
  }

  // Handle different naming conventions
  // 1. kebab-case (CSS/SCSS): button-primary-bg → button.primary.bg
  // 2. snake_case (Kotlin/XML): button_primary_bg → button.primary.bg
  // 3. camelCase (JS): buttonPrimaryBg → button.primary.bg
  // 4. PascalCase (Swift): ButtonPrimaryBg → button.primary.bg

  // First, normalize camelCase/PascalCase to kebab-case
  result = result
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')  // camelCase splits
    .toLowerCase();

  // Then convert separators to dots
  result = result
    .replace(/[-_]+/g, '.');  // Replace - and _ with .

  return result;
}

// =============================================================================
// SOURCE FILE PARSING (for Rename Detection)
// =============================================================================

// Consumption layers where renames are breaking changes
const CONSUMPTION_LAYERS = ['semantic', 'component'];

/**
 * Parse Figma source file and extract variable metadata
 * @param {string} sourcePath - Path to bild-design-system-raw-data.json
 * @returns {Object} - { variables: Map, styles: Map }
 */
function parseSourceFile(sourcePath) {
  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️  Source file not found: ${sourcePath}`);
    return { variables: new Map(), styles: new Map() };
  }

  try {
    const data = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));
    const variables = new Map();
    const styles = new Map();

    // Parse variables from collections
    if (data.collections && Array.isArray(data.collections)) {
      data.collections.forEach(collection => {
        if (!collection.variables) return;

        collection.variables.forEach(variable => {
          const layer = detectLayerFromCollection(collection.name);
          variables.set(variable.id, {
            id: variable.id,
            name: variable.name,
            resolvedType: variable.resolvedType,
            scopes: variable.scopes || [],
            collectionId: collection.id,
            collectionName: collection.name,
            description: variable.description || '',
            layer,
            isBreaking: CONSUMPTION_LAYERS.includes(layer)
          });
        });
      });
    }

    // Parse textStyles (Typography)
    if (data.textStyles && Array.isArray(data.textStyles)) {
      data.textStyles.forEach(style => {
        const layer = style.name.startsWith('Component/') ? 'component' : 'semantic';
        styles.set(style.id, {
          id: style.id,
          name: style.name,
          type: 'typography',
          layer,
          isBreaking: CONSUMPTION_LAYERS.includes(layer),
          description: style.description || '',
          // Store style properties for comparison
          properties: extractTypographyProperties(style)
        });
      });
    }

    // Parse effectStyles (Effects/Shadows)
    if (data.effectStyles && Array.isArray(data.effectStyles)) {
      data.effectStyles.forEach(style => {
        const layer = style.name.startsWith('Component/') ? 'component' : 'semantic';
        styles.set(style.id, {
          id: style.id,
          name: style.name,
          type: 'effect',
          layer,
          isBreaking: CONSUMPTION_LAYERS.includes(layer),
          description: style.description || '',
          // Store effect properties for comparison
          properties: extractEffectProperties(style)
        });
      });
    }

    console.log(`   Parsed ${variables.size} variables, ${styles.size} styles from source file`);
    return { variables, styles };
  } catch (e) {
    console.log(`⚠️  Error parsing source file: ${e.message}`);
    return { variables: new Map(), styles: new Map() };
  }
}

/**
 * Extract typography properties for comparison
 */
function extractTypographyProperties(style) {
  const props = {};

  if (style.fontName) {
    props.fontFamily = style.fontName.family;
    props.fontStyle = style.fontName.style;
  }
  if (style.fontSize !== undefined) props.fontSize = style.fontSize;
  if (style.lineHeight !== undefined) {
    props.lineHeight = style.lineHeight.value !== undefined
      ? style.lineHeight.value
      : style.lineHeight;
  }
  if (style.letterSpacing !== undefined) {
    props.letterSpacing = style.letterSpacing.value !== undefined
      ? style.letterSpacing.value
      : style.letterSpacing;
  }
  if (style.textCase) props.textCase = style.textCase;
  if (style.textDecoration) props.textDecoration = style.textDecoration;

  // Track bound variables (references)
  if (style.boundVariables) {
    props.boundVariables = style.boundVariables;
  }

  return props;
}

/**
 * Extract effect properties for comparison
 */
function extractEffectProperties(style) {
  if (!style.effects || !Array.isArray(style.effects)) {
    return [];
  }

  return style.effects.map(effect => ({
    type: effect.type,
    visible: effect.visible,
    color: effect.color,
    offset: effect.offset,
    radius: effect.radius,
    spread: effect.spread,
    blendMode: effect.blendMode,
    // Track bound variables (references)
    boundVariables: effect.boundVariables
  }));
}

/**
 * Detect token renames by comparing Variable IDs between old and new source
 * @param {Object} oldSource - { variables: Map, styles: Map } from old source file
 * @param {Object} newSource - { variables: Map, styles: Map } from new source file
 * @returns {Object} - { renames, styleRenames, actuallyRemoved, actuallyAdded, styleChanges }
 */
function detectRenames(oldSource, newSource) {
  const renames = [];
  const actuallyRemoved = [];
  const actuallyAdded = [];

  // --- Variable Renames ---
  for (const [id, oldVar] of oldSource.variables) {
    const newVar = newSource.variables.get(id);
    if (!newVar) {
      // Variable ID doesn't exist in new → truly removed
      actuallyRemoved.push({
        variableId: id,
        name: oldVar.name,
        resolvedType: oldVar.resolvedType,
        collectionName: oldVar.collectionName,
        category: categorizeTokenFromSource(oldVar),
        layer: oldVar.layer,
        isBreaking: oldVar.isBreaking
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
        layer: oldVar.layer,
        isBreaking: oldVar.isBreaking,
        tokenType: 'variable',
        confidence: 1.0 // 100% confidence because same Variable ID
      });
    }
  }

  // Find true additions (new Variable IDs)
  for (const [id, newVar] of newSource.variables) {
    if (!oldSource.variables.has(id)) {
      actuallyAdded.push({
        variableId: id,
        name: newVar.name,
        resolvedType: newVar.resolvedType,
        collectionName: newVar.collectionName,
        category: categorizeTokenFromSource(newVar),
        layer: newVar.layer,
        isBreaking: newVar.isBreaking
      });
    }
  }

  // --- Style Renames (Typography & Effects) ---
  const styleRenames = [];
  const styleChanges = {
    typography: { added: [], modified: [], removed: [] },
    effects: { added: [], modified: [], removed: [] }
  };

  for (const [id, oldStyle] of oldSource.styles) {
    const newStyle = newSource.styles.get(id);
    const changeType = oldStyle.type === 'typography' ? 'typography' : 'effects';

    if (!newStyle) {
      // Style ID doesn't exist in new → truly removed
      styleChanges[changeType].removed.push({
        styleId: id,
        name: oldStyle.name,
        type: oldStyle.type,
        layer: oldStyle.layer,
        isBreaking: oldStyle.isBreaking,
        properties: oldStyle.properties
      });
    } else if (oldStyle.name !== newStyle.name) {
      // Same ID, different name → renamed (ALWAYS breaking in consumption layer)
      styleRenames.push({
        styleId: id,
        oldName: oldStyle.name,
        newName: newStyle.name,
        type: oldStyle.type,
        layer: oldStyle.layer,
        isBreaking: oldStyle.isBreaking, // Typography/Effects are always semantic or component
        tokenType: oldStyle.type,
        category: oldStyle.type === 'typography' ? 'typography' : 'effects',
        confidence: 1.0
      });

      // Also check if properties changed
      const propChanges = compareStyleProperties(oldStyle, newStyle);
      if (propChanges.length > 0) {
        styleChanges[changeType].modified.push({
          styleId: id,
          name: newStyle.name,
          oldName: oldStyle.name,
          type: oldStyle.type,
          layer: oldStyle.layer,
          isBreaking: oldStyle.isBreaking,
          changedProperties: propChanges,
          wasRenamed: true
        });
      }
    } else {
      // Same name, check if properties changed
      const propChanges = compareStyleProperties(oldStyle, newStyle);
      if (propChanges.length > 0) {
        styleChanges[changeType].modified.push({
          styleId: id,
          name: oldStyle.name,
          type: oldStyle.type,
          layer: oldStyle.layer,
          isBreaking: false, // Property changes are not breaking
          changedProperties: propChanges,
          wasRenamed: false
        });
      }
    }
  }

  // Find truly added styles
  for (const [id, newStyle] of newSource.styles) {
    if (!oldSource.styles.has(id)) {
      const changeType = newStyle.type === 'typography' ? 'typography' : 'effects';
      styleChanges[changeType].added.push({
        styleId: id,
        name: newStyle.name,
        type: newStyle.type,
        layer: newStyle.layer,
        isBreaking: false, // Additions are not breaking
        properties: newStyle.properties
      });
    }
  }

  return { renames, styleRenames, actuallyRemoved, actuallyAdded, styleChanges };
}

/**
 * Compare style properties and return changed properties
 */
function compareStyleProperties(oldStyle, newStyle) {
  const changes = [];
  const oldProps = oldStyle.properties || {};
  const newProps = newStyle.properties || {};

  // For typography
  if (oldStyle.type === 'typography') {
    const propsToCompare = ['fontFamily', 'fontStyle', 'fontSize', 'lineHeight', 'letterSpacing', 'textCase', 'textDecoration'];
    for (const prop of propsToCompare) {
      if (JSON.stringify(oldProps[prop]) !== JSON.stringify(newProps[prop])) {
        changes.push({
          property: prop,
          oldValue: oldProps[prop],
          newValue: newProps[prop]
        });
      }
    }
  }

  // For effects (compare array of shadow layers)
  if (oldStyle.type === 'effect') {
    const oldEffects = Array.isArray(oldProps) ? oldProps : [];
    const newEffects = Array.isArray(newProps) ? newProps : [];

    if (oldEffects.length !== newEffects.length) {
      changes.push({
        property: 'layerCount',
        oldValue: oldEffects.length,
        newValue: newEffects.length
      });
    } else {
      for (let i = 0; i < oldEffects.length; i++) {
        const oldEffect = oldEffects[i];
        const newEffect = newEffects[i];
        const effectProps = ['type', 'color', 'offset', 'radius', 'spread', 'blendMode'];
        for (const prop of effectProps) {
          if (JSON.stringify(oldEffect[prop]) !== JSON.stringify(newEffect[prop])) {
            changes.push({
              property: `layer${i}.${prop}`,
              oldValue: oldEffect[prop],
              newValue: newEffect[prop]
            });
          }
        }
      }
    }
  }

  return changes;
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
  // Build cache key from name + value type indicator
  const valueIndicator = typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb')) ? 'color' : '';
  const cacheKey = `${tokenName}|${valueIndicator}`;

  // Check cache first
  if (categoryCache.has(cacheKey)) {
    return categoryCache.get(cacheKey);
  }

  const name = tokenName.toLowerCase();
  let category = 'other';

  // Color detection by value
  if (valueIndicator === 'color') {
    category = 'colors';
  }
  // Name-based detection
  else if (/color|bg|background|foreground|fill|stroke|text-color|surface|accent/i.test(name)) {
    category = 'colors';
  }
  else if (/font-?size|line-?height|letter-?spacing|font-?weight|font-?family|typography/i.test(name)) {
    category = 'typography';
  }
  else if (/space|gap|inline|stack|inset|margin|padding/i.test(name)) {
    category = 'spacing';
  }
  else if (/shadow|effect|elevation|blur/i.test(name)) {
    category = 'effects';
  }
  else if (/size|width|height|radius|border-radius/i.test(name)) {
    category = 'sizing';
  }

  // Cache and return
  categoryCache.set(cacheKey, category);
  return category;
}

// =============================================================================
// LAYER DETECTION
// =============================================================================

/**
 * Token layer constants
 */
const TOKEN_LAYERS = {
  primitive: { icon: '⚙️', label: 'Primitives', order: 0 },
  semantic: { icon: '🎯', label: 'Semantic', order: 1 },
  component: { icon: '🧩', label: 'Components', order: 2 }
};

/**
 * Detect token layer from file path (dist-based detection)
 *
 * Path patterns:
 *   /shared/           → primitive (color primitives, space primitives, etc.)
 *   /semantic/         → semantic (ColorMode, BreakpointMode outputs)
 *   /components/       → component (Button, Card, etc.)
 *   /bundles/          → bundle (skip - aggregated files)
 */
function detectLayerFromPath(filePath) {
  if (!filePath) return 'semantic'; // Default

  const normalized = filePath.toLowerCase();

  // Primitives - shared folder contains raw primitive values
  if (normalized.includes('/shared/') || normalized.includes('/primitives/')) {
    return 'primitive';
  }

  // Components - component-specific tokens
  if (normalized.includes('/components/')) {
    return 'component';
  }

  // Bundles - skip (aggregated files, not layer-specific)
  if (normalized.includes('/bundles/')) {
    return 'bundle';
  }

  // Default to semantic (ColorMode, BreakpointMode, etc.)
  return 'semantic';
}

/**
 * Detect token layer from collection name (source-based detection)
 */
function detectLayerFromCollection(collectionName) {
  if (!collectionName) return 'semantic';

  const normalized = collectionName.replace(/^_/, '').toLowerCase();

  // Primitives (Layer 0)
  if (/primitive|fontprimitive|colorprimitive|sizeprimitive|spaceprimitive/i.test(normalized)) {
    return 'primitive';
  }

  // Mapping (Layer 1) - treat as semantic for consumer purposes
  if (/brandtokenmapping|brandcolormapping|density/i.test(normalized)) {
    return 'semantic';
  }

  // Semantic (Layer 2)
  if (/breakpointmode|colormode/i.test(normalized)) {
    return 'semantic';
  }

  // Component (Layer 3) - often has component name in collection
  // Default to semantic for unknown
  return 'semantic';
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
 * Build a context key from metadata for valuesByContext grouping
 * Format: "brand/mode" for colors, "brand/breakpoint" for sizing, etc.
 * Returns null if no relevant context is found
 */
function buildContextKey(metadata) {
  const parts = [];

  // Brand is always first if present
  if (metadata.brand) {
    parts.push(metadata.brand);
  }

  // Add mode for color tokens
  if (metadata.mode) {
    parts.push(metadata.mode);
  }

  // Add breakpoint for sizing/typography tokens
  if (metadata.breakpoint) {
    parts.push(metadata.breakpoint);
  }

  // Add density if present
  if (metadata.density) {
    parts.push(metadata.density);
  }

  return parts.length > 0 ? parts.join('/') : null;
}

/**
 * Extract metadata from file path
 */
function extractFileMetadata(filePath) {
  const parts = filePath.split('/');
  const fileName = path.basename(filePath);
  const fileNameLower = fileName.toLowerCase();

  const metadata = {
    platform: detectPlatform(filePath),
    brand: null,
    layer: null,
    tokenLayer: null, // normalized layer: primitive, semantic, component
    component: null,
    fileName: fileName,
    // New context fields for Visual Changes matrix
    mode: null,       // light | dark (color mode)
    breakpoint: null, // xs | sm | md | lg
    density: null     // default | dense | spacious
  };

  // Extract brand
  const brandIndex = parts.indexOf('brands');
  if (brandIndex !== -1 && parts[brandIndex + 1]) {
    metadata.brand = parts[brandIndex + 1];
  }

  // Extract color mode from filename
  // Patterns: color-light.css, color-dark.css, effects-light.css, *-light.json, etc.
  if (/[-_](light|dark)\b/i.test(fileNameLower) || /^(light|dark)\./i.test(fileNameLower)) {
    const modeMatch = fileNameLower.match(/[-_]?(light|dark)/i);
    if (modeMatch) {
      metadata.mode = modeMatch[1].toLowerCase();
    }
  }
  // Also check path for colormode folder
  if (parts.includes('colormode') || parts.some(p => /colormode/i.test(p))) {
    const modeMatch = fileNameLower.match(/(light|dark)/i);
    if (modeMatch) {
      metadata.mode = modeMatch[1].toLowerCase();
    }
  }

  // Extract breakpoint from filename
  // Patterns: typography-xs.css, typography-lg.css, breakpoint-md.css, sizing-sm.json
  const breakpointMatch = fileNameLower.match(/[-_](xs|sm|md|lg)\b/i);
  if (breakpointMatch) {
    metadata.breakpoint = breakpointMatch[1].toLowerCase();
  }
  // Also check path for breakpoint/breakpointmode folder
  if (parts.includes('breakpoint') || parts.includes('breakpointmode') ||
      parts.some(p => /breakpoint/i.test(p))) {
    const bpMatch = fileNameLower.match(/(xs|sm|md|lg)/i);
    if (bpMatch) {
      metadata.breakpoint = bpMatch[1].toLowerCase();
    }
  }

  // Extract density from filename
  // Patterns: density-dense.css, density-spacious.css, *-dense.json
  const densityMatch = fileNameLower.match(/[-_](default|dense|spacious)\b/i);
  if (densityMatch) {
    metadata.density = densityMatch[1].toLowerCase();
  }
  // Also check path for density folder
  if (parts.includes('density')) {
    const denMatch = fileNameLower.match(/(default|dense|spacious)/i);
    if (denMatch) {
      metadata.density = denMatch[1].toLowerCase();
    }
  }

  // Extract layer (semantic, components, shared, overrides)
  if (parts.includes('components')) {
    metadata.layer = 'components';
    metadata.tokenLayer = 'component';
    const compIndex = parts.indexOf('components');
    if (parts[compIndex + 1]) {
      metadata.component = parts[compIndex + 1];
    }
    // Components have mixed categories - need name-based detection
    metadata.category = null;
  } else if (parts.includes('semantic')) {
    metadata.layer = 'semantic';
    metadata.tokenLayer = 'semantic';
    // Extract category from semantic subfolder path
    // Patterns: /semantic/color/, /semantic/typography/, /semantic/effects/
    const semanticIndex = parts.indexOf('semantic');
    const subFolder = parts[semanticIndex + 1]?.toLowerCase();
    if (subFolder === 'color' || subFolder === 'colormode') {
      metadata.category = 'colors';
    } else if (subFolder === 'typography') {
      metadata.category = 'typography';
    } else if (subFolder === 'effects') {
      metadata.category = 'effects';
    } else if (subFolder === 'breakpoints' || subFolder === 'breakpointmode') {
      // Breakpoints contain mixed spacing/sizing - need name-based detection
      metadata.category = null;
    } else if (subFolder === 'density') {
      // Density contains mixed spacing/sizing - need name-based detection
      metadata.category = null;
    }
  } else if (parts.includes('shared')) {
    metadata.layer = 'shared';
    metadata.tokenLayer = 'primitive';
    // Shared/primitives - check filename for category hint
    if (fileNameLower.includes('color')) {
      metadata.category = 'colors';
    } else if (fileNameLower.includes('space')) {
      metadata.category = 'spacing';
    } else if (fileNameLower.includes('size')) {
      metadata.category = 'sizing';
    } else if (fileNameLower.includes('font') || fileNameLower.includes('typography')) {
      metadata.category = 'typography';
    } else {
      metadata.category = null;
    }
  } else if (parts.includes('overrides')) {
    metadata.layer = 'overrides';
    metadata.tokenLayer = 'semantic';
    metadata.category = null; // Overrides need name-based detection
  } else if (parts.includes('bundles')) {
    metadata.layer = 'bundles';
    metadata.tokenLayer = 'bundle'; // Skip in layer grouping
    metadata.category = null; // Bundles are mixed
  } else {
    // Default based on path detection
    metadata.tokenLayer = detectLayerFromPath(filePath);
    metadata.category = null;
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
  const tokenDetailsAdded = new Map();    // normalizedName -> { platforms: [...], value, layer, ... }
  const tokenDetailsModified = new Map(); // normalizedName -> { platforms: [...], oldValue, newValue, layer, ... }
  const tokenDetailsRemoved = new Map();  // normalizedName -> { platforms: [...], value, layer, ... }

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

    // Get token layer and category from file metadata
    const tokenLayer = diff.metadata.tokenLayer || 'semantic';
    const pathCategory = diff.metadata.category; // null if needs name-based detection

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
          tokenDetailsAdded.set(normalized, {
            value: token.value,
            layer: tokenLayer,
            pathCategory, // from file path, null if mixed
            platforms: []
          });
        }
        tokenDetailsAdded.get(normalized).platforms.push({
          ...platformInfo, tokenName: token.name, file: diff.file, layer: tokenLayer
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
          tokenDetailsRemoved.set(normalized, {
            value: token.value,
            layer: tokenLayer,
            pathCategory, // from file path, null if mixed
            platforms: []
          });
        }
        tokenDetailsRemoved.get(normalized).platforms.push({
          ...platformInfo, tokenName: token.name, file: diff.file, layer: tokenLayer
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
          tokenDetailsAdded.set(normalized, {
            value: token.value,
            layer: tokenLayer,
            pathCategory,
            platforms: []
          });
        }
        tokenDetailsAdded.get(normalized).platforms.push({
          ...platformInfo, tokenName: token.name, file: diff.file, layer: tokenLayer
        });
      }
      for (const token of diff.changes.modified) {
        const normalized = normalizeTokenName(token.name);
        uniqueTokensModified.add(normalized);
        if (!tokenDetailsModified.has(normalized)) {
          tokenDetailsModified.set(normalized, {
            oldValue: token.oldValue,
            newValue: token.newValue,
            layer: tokenLayer,
            pathCategory,
            platforms: [],
            valuesByContext: new Map() // brand/mode/breakpoint/density → { old, new }
          });
        }
        const details = tokenDetailsModified.get(normalized);
        details.platforms.push({
          ...platformInfo,
          tokenName: token.name,
          file: diff.file,
          layer: tokenLayer,
          // Include context info in platform data
          brand: diff.metadata.brand,
          mode: diff.metadata.mode,
          breakpoint: diff.metadata.breakpoint,
          density: diff.metadata.density
        });

        // Build context key and store values per context
        const contextKey = buildContextKey(diff.metadata);
        if (contextKey && !details.valuesByContext.has(contextKey)) {
          details.valuesByContext.set(contextKey, {
            old: token.oldValue,
            new: token.newValue,
            brand: diff.metadata.brand,
            mode: diff.metadata.mode,
            breakpoint: diff.metadata.breakpoint,
            density: diff.metadata.density
          });
        }
      }
      for (const token of diff.changes.removed) {
        const normalized = normalizeTokenName(token.name);
        uniqueTokensRemoved.add(normalized);
        if (!tokenDetailsRemoved.has(normalized)) {
          tokenDetailsRemoved.set(normalized, {
            value: token.value,
            layer: tokenLayer,
            pathCategory,
            platforms: []
          });
        }
        tokenDetailsRemoved.get(normalized).platforms.push({
          ...platformInfo, tokenName: token.name, file: diff.file, layer: tokenLayer
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

  // Helper: Get preferred display name (CSS format preferred for consistency)
  const getDisplayName = (platforms, fallback) => {
    // Prefer CSS, then SCSS, then first available
    const cssToken = platforms.find(p => p.key === 'css');
    if (cssToken) return cssToken.tokenName;
    const scssToken = platforms.find(p => p.key === 'scss');
    if (scssToken) return scssToken.tokenName;
    return platforms[0]?.tokenName || fallback;
  };

  // Convert token details Maps to arrays for byUniqueToken
  // Use path-based category when available, fallback to name-based detection
  for (const [normalized, details] of tokenDetailsAdded) {
    const displayName = getDisplayName(details.platforms, normalized);
    const category = details.pathCategory || categorizeTokenFromDist(displayName, details.value);
    results.byUniqueToken.added.push({
      normalizedName: normalized,
      displayName,
      canonicalName: toDotNotation(displayName),  // Platform-agnostic dot notation
      value: details.value,
      layer: details.layer,
      category,
      platforms: details.platforms
    });
  }
  for (const [normalized, details] of tokenDetailsModified) {
    // Convert valuesByContext Map to Object for JSON serialization
    const valuesByContext = {};
    for (const [key, value] of details.valuesByContext) {
      valuesByContext[key] = value;
    }

    const displayName = getDisplayName(details.platforms, normalized);
    const category = details.pathCategory || categorizeTokenFromDist(displayName, details.newValue);
    results.byUniqueToken.modified.push({
      normalizedName: normalized,
      displayName,
      canonicalName: toDotNotation(displayName),  // Platform-agnostic dot notation
      oldValue: details.oldValue,
      newValue: details.newValue,
      layer: details.layer,
      category,
      platforms: details.platforms,
      valuesByContext: valuesByContext, // brand/mode/breakpoint context → { old, new }
      hasMultipleContexts: details.valuesByContext.size > 1
    });
  }
  for (const [normalized, details] of tokenDetailsRemoved) {
    const displayName = getDisplayName(details.platforms, normalized);
    const category = details.pathCategory || categorizeTokenFromDist(displayName, details.value);
    results.byUniqueToken.removed.push({
      normalizedName: normalized,
      displayName,
      canonicalName: toDotNotation(displayName),  // Platform-agnostic dot notation
      value: details.value,
      layer: details.layer,
      category,
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
 * Breaking = Removed OR Renamed in consumption layer (semantic + component)
 * Primitive layer removed/renamed = Safe (internal cleanup)
 */
function calculateImpactLevel(results) {
  // Check for breaking renames (consumption layer renames - layer-based classification)
  const hasBreakingRenames = (results.renames || []).some(r => CONSUMPTION_LAYERS.includes(r.layer));
  const hasBreakingStyleRenames = (results.styleRenames || []).some(r => CONSUMPTION_LAYERS.includes(r.layer));

  // Check for breaking removed tokens (consumption layer only)
  const removedTokens = results.byUniqueToken?.removed || [];
  const hasBreakingRemoved = removedTokens.some(t => CONSUMPTION_LAYERS.includes(t.layer));

  if (hasBreakingRemoved || hasBreakingRenames || hasBreakingStyleRenames) {
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

    const hasVariables = oldSource.variables.size > 0 && newSource.variables.size > 0;
    const hasStyles = oldSource.styles.size > 0 || newSource.styles.size > 0;

    if (hasVariables || hasStyles) {
      const renameResults = detectRenames(oldSource, newSource);

      // Add variable rename detection results
      results.renames = renameResults.renames;
      results.sourceBasedChanges = {
        actuallyRemoved: renameResults.actuallyRemoved,
        actuallyAdded: renameResults.actuallyAdded
      };

      // Add style rename detection results (Typography & Effects)
      results.styleRenames = renameResults.styleRenames;
      results.styleChanges = renameResults.styleChanges;

      // Count breaking vs non-breaking renames
      const breakingVariableRenames = renameResults.renames.filter(r => r.isBreaking);
      const nonBreakingVariableRenames = renameResults.renames.filter(r => !r.isBreaking);
      const breakingStyleRenames = renameResults.styleRenames.filter(r => r.isBreaking);

      results.summary.uniqueTokensRenamed = renameResults.renames.length;
      results.summary.uniqueStylesRenamed = renameResults.styleRenames.length;
      results.summary.breakingRenames = breakingVariableRenames.length + breakingStyleRenames.length;

      console.log(`\n   ✅ Rename detection complete:`);
      console.log(`      🔄 Variable Renames: ${renameResults.renames.length} (${breakingVariableRenames.length} breaking)`);
      console.log(`      🔄 Style Renames: ${renameResults.styleRenames.length} (${breakingStyleRenames.length} breaking)`);
      console.log(`      🔴 Actually removed: ${renameResults.actuallyRemoved.length} variables`);
      console.log(`      🟢 Actually added: ${renameResults.actuallyAdded.length} variables`);

      // Log style changes
      const typographyChanges = renameResults.styleChanges.typography;
      const effectChanges = renameResults.styleChanges.effects;
      if (typographyChanges.modified.length + typographyChanges.added.length + typographyChanges.removed.length > 0) {
        console.log(`      📝 Typography: +${typographyChanges.added.length} / ~${typographyChanges.modified.length} / -${typographyChanges.removed.length}`);
      }
      if (effectChanges.modified.length + effectChanges.added.length + effectChanges.removed.length > 0) {
        console.log(`      ✨ Effects: +${effectChanges.added.length} / ~${effectChanges.modified.length} / -${effectChanges.removed.length}`);
      }
    } else {
      console.log(`   ⚠️  Could not perform rename detection (empty source files)`);
      results.renames = [];
      results.styleRenames = [];
      results.styleChanges = { typography: { added: [], modified: [], removed: [] }, effects: { added: [], modified: [], removed: [] } };
      results.summary.uniqueTokensRenamed = 0;
      results.summary.uniqueStylesRenamed = 0;
      results.summary.breakingRenames = 0;
    }
  } else {
    results.renames = [];
    results.styleRenames = [];
    results.styleChanges = { typography: { added: [], modified: [], removed: [] }, effects: { added: [], modified: [], removed: [] } };
    results.summary.uniqueTokensRenamed = 0;
    results.summary.uniqueStylesRenamed = 0;
    results.summary.breakingRenames = 0;
  }

  // Recalculate impact level now that we have rename info
  results.summary.impactLevel = calculateImpactLevel(results);

  // Add category groupings
  results.byCategory = groupByCategory(results);

  // Add layer groupings
  results.byLayer = groupByLayer(results);

  // Add pre-grouped results for optimized release notes
  results.grouped = createGroupedResults(results);

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

/**
 * Group token changes by layer (primitive, semantic, component)
 */
function groupByLayer(results) {
  const layers = {
    primitive: { added: [], modified: [], removed: [] },
    semantic: { added: [], modified: [], removed: [] },
    component: { added: [], modified: [], removed: [] }
  };

  // Group from byUniqueToken
  if (results.byUniqueToken) {
    for (const token of results.byUniqueToken.added || []) {
      const layer = token.layer || 'semantic';
      if (layers[layer]) {
        layers[layer].added.push(token);
      }
    }
    for (const token of results.byUniqueToken.modified || []) {
      const layer = token.layer || 'semantic';
      if (layers[layer]) {
        layers[layer].modified.push(token);
      }
    }
    for (const token of results.byUniqueToken.removed || []) {
      const layer = token.layer || 'semantic';
      if (layers[layer]) {
        layers[layer].removed.push(token);
      }
    }
  }

  return layers;
}

/**
 * Create pre-grouped results for optimized release notes generation.
 * Groups tokens by impact level (breaking/visual/safe) to eliminate redundant filtering.
 *
 * Structure:
 * - breaking: Consumption layer removed + renamed (variables + combined styles)
 * - visual: Modified tokens grouped by category with context data
 * - safe: Added tokens + internal (primitive layer) changes
 */
function createGroupedResults(results) {
  const grouped = {
    // Breaking changes (consumption layer only)
    breaking: {
      removed: {
        variables: [],    // Removed CSS variables (semantic + component layer)
        typography: [],   // Removed typography styles
        effects: []       // Removed effect styles
      },
      renamed: {
        variables: [],    // Renamed CSS variables
        typography: [],   // Renamed typography styles
        effects: []       // Renamed effect styles
      }
    },
    // Visual changes (modified tokens with diffs)
    visual: {
      colors: [],         // Modified color tokens with valuesByContext
      spacing: [],        // Modified spacing tokens with valuesByContext
      sizing: [],         // Modified sizing tokens
      typography: {
        variables: [],    // Modified typography variables (font-size, etc.)
        styles: []        // Modified combined typography styles
      },
      effects: {
        variables: [],    // Modified effect variables
        styles: []        // Modified combined effect styles
      }
    },
    // Safe changes (additions + internal)
    safe: {
      added: {
        variables: [],    // New CSS variables
        typography: [],   // New typography styles
        effects: []       // New effect styles
      },
      internal: {
        modified: [],     // Primitive layer modifications
        removed: []       // Primitive layer removals
      }
    },
    // Summary counts for quick access
    counts: {
      breakingRemoved: 0,
      breakingRenamed: 0,
      visualModified: 0,
      safeAdded: 0,
      internalChanges: 0
    }
  };

  // --- BREAKING: Removed tokens (consumption layer only) ---
  if (results.byUniqueToken?.removed) {
    for (const token of results.byUniqueToken.removed) {
      if (CONSUMPTION_LAYERS.includes(token.layer)) {
        grouped.breaking.removed.variables.push(token);
      } else {
        grouped.safe.internal.removed.push(token);
      }
    }
  }

  // --- BREAKING: Removed combined styles ---
  if (results.styleChanges) {
    // Typography removed
    for (const style of results.styleChanges.typography?.removed || []) {
      if (CONSUMPTION_LAYERS.includes(style.layer || 'semantic')) {
        grouped.breaking.removed.typography.push(style);
      }
    }
    // Effects removed
    for (const style of results.styleChanges.effects?.removed || []) {
      if (CONSUMPTION_LAYERS.includes(style.layer || 'semantic')) {
        grouped.breaking.removed.effects.push(style);
      }
    }
  }

  // --- BREAKING: Renamed variables ---
  if (results.renames) {
    for (const rename of results.renames) {
      if (CONSUMPTION_LAYERS.includes(rename.layer)) {
        grouped.breaking.renamed.variables.push(rename);
      }
    }
  }

  // --- BREAKING: Renamed styles ---
  if (results.styleRenames) {
    for (const rename of results.styleRenames) {
      if (CONSUMPTION_LAYERS.includes(rename.layer || 'semantic')) {
        if (rename.type === 'typography') {
          grouped.breaking.renamed.typography.push(rename);
        } else if (rename.type === 'effect') {
          grouped.breaking.renamed.effects.push(rename);
        }
      }
    }
  }

  // --- VISUAL: Modified tokens by category ---
  if (results.byUniqueToken?.modified) {
    for (const token of results.byUniqueToken.modified) {
      const category = categorizeTokenFromDist(token.displayName, token.oldValue);

      switch (category) {
        case 'colors':
          grouped.visual.colors.push(token);
          break;
        case 'spacing':
          grouped.visual.spacing.push(token);
          break;
        case 'sizing':
          grouped.visual.sizing.push(token);
          break;
        case 'typography':
          grouped.visual.typography.variables.push(token);
          break;
        case 'effects':
          grouped.visual.effects.variables.push(token);
          break;
        default:
          // Check if it's primitive layer
          if (!CONSUMPTION_LAYERS.includes(token.layer)) {
            grouped.safe.internal.modified.push(token);
          } else {
            // Default to sizing for consumption layer
            grouped.visual.sizing.push(token);
          }
      }
    }
  }

  // --- VISUAL: Modified combined styles ---
  if (results.styleChanges) {
    // Typography modified
    for (const style of results.styleChanges.typography?.modified || []) {
      grouped.visual.typography.styles.push(style);
    }
    // Effects modified
    for (const style of results.styleChanges.effects?.modified || []) {
      grouped.visual.effects.styles.push(style);
    }
  }

  // --- SAFE: Added tokens ---
  if (results.byUniqueToken?.added) {
    for (const token of results.byUniqueToken.added) {
      grouped.safe.added.variables.push(token);
    }
  }

  // --- SAFE: Added combined styles ---
  if (results.styleChanges) {
    // Typography added
    for (const style of results.styleChanges.typography?.added || []) {
      grouped.safe.added.typography.push(style);
    }
    // Effects added
    for (const style of results.styleChanges.effects?.added || []) {
      grouped.safe.added.effects.push(style);
    }
  }

  // --- Calculate counts ---
  grouped.counts.breakingRemoved =
    grouped.breaking.removed.variables.length +
    grouped.breaking.removed.typography.length +
    grouped.breaking.removed.effects.length;

  grouped.counts.breakingRenamed =
    grouped.breaking.renamed.variables.length +
    grouped.breaking.renamed.typography.length +
    grouped.breaking.renamed.effects.length;

  grouped.counts.visualModified =
    grouped.visual.colors.length +
    grouped.visual.spacing.length +
    grouped.visual.sizing.length +
    grouped.visual.typography.variables.length +
    grouped.visual.typography.styles.length +
    grouped.visual.effects.variables.length +
    grouped.visual.effects.styles.length;

  grouped.counts.safeAdded =
    grouped.safe.added.variables.length +
    grouped.safe.added.typography.length +
    grouped.safe.added.effects.length;

  grouped.counts.internalChanges =
    grouped.safe.internal.modified.length +
    grouped.safe.internal.removed.length;

  return grouped;
}

if (require.main === module) {
  main();
}

module.exports = {
  compareDistBuilds,
  platformParsers,
  parseSourceFile,
  detectRenames,
  compareStyleProperties,
  categorizeTokenFromDist,
  categorizeTokenFromSource,
  detectLayerFromPath,
  extractFileMetadata,
  toDotNotation,
  groupByLayer,
  groupByCategory,
  createGroupedResults,
  clearCaches,
  TOKEN_CATEGORIES,
  TOKEN_LAYERS,
  CONSUMPTION_LAYERS
};
