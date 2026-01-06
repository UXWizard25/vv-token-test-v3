#!/usr/bin/env node

/**
 * Preprocessing Script for Custom Plugin Export
 *
 * This script transforms the plugin export into a Style Dictionary-compatible structure.
 * It processes both classic tokens and composite tokens (Typography & Effects).
 *
 * Features:
 * - Processes hex colors directly (already in input)
 * - Fixes FontWeight-px bug
 * - Context-aware alias resolution (Brand × Breakpoint/ColorMode)
 * - Generates Brand × Breakpoint matrix for Typography
 * - Generates Brand × ColorMode matrix for Effects
 */

const fs = require('fs');
const path = require('path');

// Paths
const INPUT_JSON_PATH = path.join(__dirname, '../../packages/tokens/src/bild-design-system-raw-data.json');
const OUTPUT_DIR = path.join(__dirname, '../../packages/tokens/.tokens');

// Brand and mode mappings
const BRANDS = {
  BILD: '18038:0',
  SportBILD: '18094:0',
  Advertorial: '18094:1'
};

const BREAKPOINTS = {
  xs: '7017:0',
  sm: '16706:1',
  md: '7015:1',
  lg: '7015:2'
};

const COLOR_MODES = {
  light: '588:0',
  dark: '592:1'
};

// Collection IDs (stable)
const COLLECTION_IDS = {
  FONT_PRIMITIVE: 'VariableCollectionId:470:1450',
  COLOR_PRIMITIVE: 'VariableCollectionId:539:2238',
  SIZE_PRIMITIVE: 'VariableCollectionId:4072:1817',
  SPACE_PRIMITIVE: 'VariableCollectionId:2726:12077',
  DENSITY: 'VariableCollectionId:5695:5841',
  BRAND_TOKEN_MAPPING: 'VariableCollectionId:18038:10593',
  BRAND_COLOR_MAPPING: 'VariableCollectionId:18212:14495',
  BREAKPOINT_MODE: 'VariableCollectionId:7017:25696',
  COLOR_MODE: 'VariableCollectionId:588:1979'
};

/**
 * Checks if a token path represents a component token
 */
function isComponentToken(tokenPath) {
  return tokenPath.startsWith('Component/');
}

/**
 * Checks if a token path represents a semantic (Global) density token
 */
function isSemanticDensityToken(tokenPath) {
  return tokenPath.startsWith('Global/');
}

/**
 * Checks if a token path represents a constant density token
 * These tokens only depend on density mode, not breakpoint
 */
function isConstantDensityToken(tokenPath) {
  return tokenPath.includes('/Constant/');
}

/**
 * Checks if a token path represents a responsive density token
 * These tokens depend on both density mode AND breakpoint
 */
function isResponsiveDensityToken(tokenPath) {
  return tokenPath.includes('/Responsive/');
}

/**
 * Extracts breakpoint from responsive density token path
 * Example: "Global/StackSpace/Responsive/Lg/densityStackSpaceRespSm" → "lg"
 */
function getResponsiveDensityBreakpoint(tokenPath) {
  const match = tokenPath.match(/\/Responsive\/(Xs|Sm|Md|Lg)\//i);
  if (match) {
    return match[1].toLowerCase();
  }
  return null;
}

/**
 * Extracts component name from token path
 * Example: "Component/Button/Primary/buttonPrimaryBgColor" → "Button"
 */
function getComponentName(tokenPath) {
  const parts = tokenPath.split('/');
  if (parts[0] === 'Component' && parts.length >= 2) {
    return parts[1];
  }
  return null;
}

/**
 * Determines collection type for component organization
 */
function getCollectionType(collectionId) {
  switch (collectionId) {
    case COLLECTION_IDS.COLOR_MODE:
      return 'color';
    case COLLECTION_IDS.DENSITY:
      return 'density';
    case COLLECTION_IDS.BREAKPOINT_MODE:
      return 'breakpoint';
    case COLLECTION_IDS.BRAND_TOKEN_MAPPING:
    case COLLECTION_IDS.BRAND_COLOR_MAPPING:
      return 'brand-override';
    default:
      return null;
  }
}

/**
 * Loads the plugin JSON file
 */
function loadPluginTokens() {
  console.log('📥 Loading plugin token file...');
  const data = fs.readFileSync(INPUT_JSON_PATH, 'utf8');
  return JSON.parse(data);
}

/**
 * Creates an alias lookup map for faster reference resolution
 */
function createAliasLookup(collections) {
  const lookup = new Map();

  collections.forEach(collection => {
    collection.variables.forEach(variable => {
      lookup.set(variable.id, {
        name: variable.name,
        collectionId: collection.id,
        collectionName: collection.name,
        valuesByMode: variable.valuesByMode,
        resolvedType: variable.resolvedType,
        description: variable.description
      });
    });
  });

  return lookup;
}

/**
 * Converts Figma RGBA color object to Hex/RGBA string
 */
/**
 * Rounds a numeric value to 2 decimal places, removing floating-point precision errors
 */
function roundNumericValue(value) {
  if (typeof value === 'number') {
    // If it's a whole number, return as-is
    if (Number.isInteger(value)) {
      return value;
    }
    // Round to 2 decimal places
    return Math.round(value * 100) / 100;
  }
  return value;
}

function colorToHex(color) {
  if (typeof color === 'string') {
    // Already a string (Hex or RGBA) - round any decimal values in rgba()
    if (color.startsWith('rgba(')) {
      return color.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/, (match, r, g, b, a) => {
        const roundedAlpha = roundNumericValue(parseFloat(a));
        return `rgba(${r}, ${g}, ${b}, ${roundedAlpha})`;
      });
    }
    return color;
  }

  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a !== undefined ? color.a : 1;

  if (a < 1) {
    // Round alpha to 2 decimal places to remove precision errors
    const roundedAlpha = roundNumericValue(a);
    return `rgba(${r}, ${g}, ${b}, ${roundedAlpha})`;
  }

  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Processes a value based on type
 * FLOAT values come as pure numbers from Figma (no "px" suffix)
 * Unit conversion happens in Style Dictionary transforms based on token type
 */
function processDirectValue(value, resolvedType, tokenPath = '') {
  switch (resolvedType) {
    case 'COLOR':
      return colorToHex(value);
    case 'FLOAT':
      // Round FLOAT values to remove floating-point precision errors
      // Values are pure numbers - no units at this stage
      return roundNumericValue(value);
    case 'STRING':
    case 'BOOLEAN':
      return value;
    default:
      return value;
  }
}

/**
 * Resolves an alias value with context
 * @param {string} variableId - Variable ID
 * @param {Map} aliasLookup - Lookup Map
 * @param {object} context - { brandName, brandModeId, breakpointModeId, colorModeModeId }
 * @param {Set} visited - Circular reference protection
 * @param {Array} collections - All collections (for dynamic brand mode lookup)
 */
function resolveAliasWithContext(variableId, aliasLookup, context = {}, visited = new Set(), collections = []) {
  const variable = aliasLookup.get(variableId);

  if (!variable) {
    console.warn(`⚠️  Variable not found: ${variableId}`);
    return `UNRESOLVED_${variableId}`;
  }

  if (visited.has(variableId)) {
    console.warn(`⚠️  Circular reference: ${variable.name}`);
    return `CIRCULAR_REF_${variableId}`;
  }

  visited.add(variableId);

  // Determine the correct mode based on collection and context
  let targetModeId = null;

  // If variable comes from Breakpoint collection, use Breakpoint mode
  if (variable.collectionId === COLLECTION_IDS.BREAKPOINT_MODE && context.breakpointModeId) {
    targetModeId = context.breakpointModeId;
  }
  // If variable comes from ColorMode collection, use ColorMode
  else if (variable.collectionId === COLLECTION_IDS.COLOR_MODE && context.colorModeModeId) {
    targetModeId = context.colorModeModeId;
  }
  // If variable comes from Brand collection, find the brand mode by name (not ID!)
  else if ((variable.collectionId === COLLECTION_IDS.BRAND_TOKEN_MAPPING ||
             variable.collectionId === COLLECTION_IDS.BRAND_COLOR_MAPPING) && context.brandName) {
    // Find the collection and get the brand mode by name
    const collection = collections.find(c => c.id === variable.collectionId);
    if (collection) {
      const brandMode = collection.modes.find(m => m.name === context.brandName);
      if (brandMode) {
        targetModeId = brandMode.modeId;
      }
    }
    // Fallback to brandModeId if brand name lookup fails
    if (!targetModeId && context.brandModeId) {
      targetModeId = context.brandModeId;
    }
  }
  // Otherwise: take first available mode
  else {
    const modes = Object.keys(variable.valuesByMode);
    targetModeId = modes[0];
  }

  let value = variable.valuesByMode[targetModeId];

  // Fallback if mode doesn't exist
  if (value === undefined || value === null) {
    const modes = Object.keys(variable.valuesByMode);
    if (modes.length > 0) {
      targetModeId = modes[0];
      value = variable.valuesByMode[targetModeId];
    }
  }

  if (value === undefined || value === null) {
    console.warn(`⚠️  No value for ${variable.name} in mode ${targetModeId}`);
    return `NO_VALUE_${variableId}`;
  }

  // If value is itself an alias, resolve recursively
  if (value.type === 'VARIABLE_ALIAS') {
    return resolveAliasWithContext(value.id, aliasLookup, context, visited, collections);
  }

  // Process direct value
  return processDirectValue(value, variable.resolvedType, variable.name);
}

/**
 * Checks if a collection ID belongs to a primitive collection
 * @param {string} collectionId - The collection ID to check
 * @returns {boolean} - True if primitive collection
 */
function isPrimitiveCollection(collectionId) {
  return collectionId === COLLECTION_IDS.FONT_PRIMITIVE ||
         collectionId === COLLECTION_IDS.COLOR_PRIMITIVE ||
         collectionId === COLLECTION_IDS.SIZE_PRIMITIVE ||
         collectionId === COLLECTION_IDS.SPACE_PRIMITIVE;
}

/**
 * Extracts DEEP alias information for CSS var() references
 * Follows the alias chain recursively until a valid endpoint is found
 *
 * Endpoint hierarchy (configurable via options):
 * - Primitive: Always endpoint (default)
 * - BreakpointMode Semantic tokens: Endpoint if acceptSemanticEndpoint = true
 * - ColorMode Semantic tokens: Endpoint if acceptColorModeEndpoint = true
 * - Density tokens: Endpoint if acceptDensityEndpoint = true
 * - BrandMapping: Always pass-through (never endpoint)
 *
 * @param {string} variableId - The Figma Variable ID of the alias target
 * @param {Map} aliasLookup - Lookup Map for all variables
 * @param {Array} collections - Array of all collections
 * @param {object} context - { brandName } for brand-specific mode resolution
 * @param {object} options - { acceptSemanticEndpoint, acceptColorModeEndpoint, acceptDensityEndpoint }
 * @returns {Object|null} - { token, collection, collectionType } or null
 */
function getDeepAliasInfo(variableId, aliasLookup, collections, context = {}, options = {}) {
  const {
    acceptSemanticEndpoint = false,    // BreakpointMode semantic tokens
    acceptColorModeEndpoint = false,   // ColorMode semantic tokens
    acceptDensityEndpoint = false      // Density tokens
  } = options;
  const visited = new Set();
  let currentId = variableId;

  while (currentId) {
    // Prevent infinite loops
    if (visited.has(currentId)) {
      console.warn(`⚠️  Circular alias reference detected: ${currentId}`);
      return null;
    }
    visited.add(currentId);

    const variable = aliasLookup.get(currentId);
    if (!variable) return null;

    const tokenPath = variable.name || '';
    // Component tokens are identified by path prefix - they should NOT be treated as semantic endpoints
    // Everything else in ColorMode/BreakpointMode collections IS the semantic level
    const isComponentToken = tokenPath.startsWith('Component/');

    // Check if we've reached a primitive - ALWAYS endpoint
    if (isPrimitiveCollection(variable.collectionId)) {
      const collection = collections.find(c => c.id === variable.collectionId);
      const tokenName = variable.name.split('/').pop();

      return {
        token: tokenName,
        collection: collection ? collection.name.toLowerCase() : 'primitive',
        collectionType: 'primitive',
        variableId: currentId
      };
    }

    // BreakpointMode collection = Semantic level (except Component/ tokens)
    if (acceptSemanticEndpoint && variable.collectionId === COLLECTION_IDS.BREAKPOINT_MODE && !isComponentToken) {
      const collection = collections.find(c => c.id === variable.collectionId);
      const tokenName = variable.name.split('/').pop();

      return {
        token: tokenName,
        collection: collection ? collection.name.toLowerCase() : 'breakpointmode',
        collectionType: 'semantic',
        variableId: currentId
      };
    }

    // ColorMode collection = Semantic level (except Component/ tokens)
    if (acceptColorModeEndpoint && variable.collectionId === COLLECTION_IDS.COLOR_MODE && !isComponentToken) {
      const collection = collections.find(c => c.id === variable.collectionId);
      const tokenName = variable.name.split('/').pop();

      return {
        token: tokenName,
        collection: collection ? collection.name.toLowerCase() : 'colormode',
        collectionType: 'semantic',
        variableId: currentId
      };
    }

    // Density tokens - endpoint if flag set
    if (acceptDensityEndpoint && variable.collectionId === COLLECTION_IDS.DENSITY) {
      const collection = collections.find(c => c.id === variable.collectionId);
      const tokenName = variable.name.split('/').pop();

      return {
        token: tokenName,
        collection: collection ? collection.name.toLowerCase() : 'density',
        collectionType: 'density',
        variableId: currentId
      };
    }

    // Find the correct mode for this variable's collection
    let targetModeId = null;
    const collection = collections.find(c => c.id === variable.collectionId);

    if (collection) {
      // For Brand collections, use brand name to find mode
      if (variable.collectionId === COLLECTION_IDS.BRAND_TOKEN_MAPPING ||
          variable.collectionId === COLLECTION_IDS.BRAND_COLOR_MAPPING) {
        if (context.brandName) {
          const brandMode = collection.modes.find(m =>
            m.name.toUpperCase() === context.brandName.toUpperCase()
          );
          if (brandMode) {
            targetModeId = brandMode.modeId;
          }
        }
      }

      // For ColorMode collections, use theme mode from context (Light/Dark)
      if (variable.collectionId === COLLECTION_IDS.COLOR_MODE && context.modeName) {
        const themeMode = collection.modes.find(m =>
          m.name.toLowerCase() === context.modeName.toLowerCase()
        );
        if (themeMode) {
          targetModeId = themeMode.modeId;
        }
      }

      // Fallback to first mode
      if (!targetModeId && collection.modes && collection.modes.length > 0) {
        targetModeId = collection.modes[0].modeId;
      }
    }

    // Get value for this mode
    const value = variable.valuesByMode[targetModeId];

    // If value is another alias, continue following the chain
    if (value && value.type === 'VARIABLE_ALIAS') {
      currentId = value.id;
    } else {
      // Direct value reached, no primitive in chain
      return null;
    }
  }

  return null;
}

/**
 * Legacy wrapper for backwards compatibility
 * @deprecated Use getDeepAliasInfo instead
 */
function getAliasInfo(variableId, aliasLookup, collections, context = {}) {
  return getDeepAliasInfo(variableId, aliasLookup, collections, context);
}

/**
 * Determines the token type for Style Dictionary based on Figma scopes and fallback heuristics
 *
 * Token Types:
 * - fontSize, lineHeight, letterSpacing → .sp in Compose, px in CSS
 * - fontWeight → Int (unitless)
 * - fontFamily → String
 * - opacity → Float (unitless, 0-1)
 * - number → Int (unitless)
 * - dimension → .dp in Compose, px in CSS
 * - color → Color() in Compose, hex/rgba in CSS
 * - string → String
 * - boolean → Boolean
 *
 * Priority:
 * 1. Color by value format (hex, rgba)
 * 2. Boolean by resolvedType
 * 3. Figma Scopes (semantic info from Figma)
 * 4. Name-based fallback (for scopes: [])
 * 5. Collection-based fallback
 * 6. Default with warning
 *
 * @param {string} tokenName - Token name
 * @param {string} collectionName - Collection name
 * @param {any} value - Processed value
 * @param {object} variable - Figma variable object (optional, contains scopes and resolvedType)
 */
function determineTokenType(tokenName, collectionName, value, variable = null) {
  const tokenPath = tokenName.toLowerCase();
  const collection = collectionName.toLowerCase();
  const scopes = variable?.scopes || [];

  // ══════════════════════════════════════════════════════════════
  // PRIORITY 0: COLOR (by value format - höchste Priorität)
  // ══════════════════════════════════════════════════════════════
  if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
    return { $type: 'color' };
  }

  // ══════════════════════════════════════════════════════════════
  // PRIORITY 0.5: BOOLEAN (by resolvedType)
  // ══════════════════════════════════════════════════════════════
  if (variable?.resolvedType === 'BOOLEAN') {
    return { $type: 'boolean' };
  }

  // ══════════════════════════════════════════════════════════════
  // PRIORITY 1: Figma Scope-based (semantische Info aus Figma)
  // Reihenfolge ist KRITISCH für kombinierte Scopes!
  // ══════════════════════════════════════════════════════════════
  if (scopes.length > 0) {
    // --- Text-Typography (sp in Compose) ---
    // FONT_SIZE muss VOR LINE_HEIGHT geprüft werden wegen kombinierter Scopes
    if (scopes.includes('FONT_SIZE')) {
      return { $type: 'fontSize' };
    }
    if (scopes.includes('LINE_HEIGHT')) {
      return { $type: 'lineHeight' };
    }
    if (scopes.includes('LETTER_SPACING')) {
      return { $type: 'letterSpacing' };
    }

    // --- Font Properties ---
    if (scopes.includes('FONT_WEIGHT')) {
      return { $type: 'fontWeight' };
    }
    if (scopes.includes('FONT_FAMILY')) {
      return { $type: 'fontFamily' };
    }
    if (scopes.includes('FONT_STYLE')) {
      // Font style strings like "Bold Italic" - used for Figma binding
      return { $type: 'string' };
    }

    // --- Opacity (unitless) ---
    if (scopes.includes('OPACITY')) {
      return { $type: 'opacity' };
    }

    // --- Dimensions (dp in Compose) ---
    if (scopes.includes('CORNER_RADIUS') ||
        scopes.includes('STROKE_FLOAT') ||
        scopes.includes('WIDTH_HEIGHT') ||
        scopes.includes('GAP') ||
        scopes.includes('PARAGRAPH_SPACING') ||
        scopes.includes('PARAGRAPH_INDENT')) {
      return { $type: 'dimension' };
    }

    // --- Colors (various fill/stroke scopes) ---
    if (scopes.includes('ALL_SCOPES') ||
        scopes.includes('ALL_FILLS') ||
        scopes.includes('FRAME_FILL') ||
        scopes.includes('SHAPE_FILL') ||
        scopes.includes('TEXT_FILL') ||
        scopes.includes('STROKE_COLOR') ||
        scopes.includes('EFFECT_COLOR')) {
      // Check if it's actually a color by resolvedType
      if (variable?.resolvedType === 'COLOR') {
        return { $type: 'color' };
      }
      // ALL_SCOPES with BOOLEAN is handled above
    }

    // --- Text Content (string) ---
    if (scopes.includes('TEXT_CONTENT')) {
      // Could be dimension if combined with WIDTH_HEIGHT/GAP
      if (scopes.includes('WIDTH_HEIGHT') || scopes.includes('GAP')) {
        return { $type: 'dimension' };
      }
      return { $type: 'string' };
    }

    // --- Font Variations (usually combined with other scopes) ---
    if (scopes.includes('FONT_VARIATIONS')) {
      // If combined with dimension scopes, treat as dimension
      if (scopes.includes('WIDTH_HEIGHT') || scopes.includes('GAP')) {
        return { $type: 'dimension' };
      }
    }
  }

  // ══════════════════════════════════════════════════════════════
  // PRIORITY 2: Name-based Fallback (für scopes: [])
  // ══════════════════════════════════════════════════════════════

  // --- String values (check type-specific patterns first) ---
  if (typeof value === 'string' && !value.endsWith('px') && !value.endsWith('rem')) {
    // Font Family
    if (tokenPath.includes('fontfamily') || tokenPath.includes('font-family')) {
      return { $type: 'fontFamily' };
    }
    // Font Weight as numeric string ("700") → treat as fontWeight
    if ((tokenPath.includes('fontweight') || tokenPath.includes('font-weight') ||
         tokenPath.includes('stfontweight')) && /^\d+$/.test(value)) {
      return { $type: 'fontWeight' };
    }
    // Text Case
    if (tokenPath.includes('textcase') || tokenPath.includes('text-case')) {
      return { $type: 'string' };
    }
    // Font style strings like "Bold Italic"
    if (tokenPath.includes('fontweight') || tokenPath.includes('font-weight') ||
        tokenPath.includes('stfontweight')) {
      return { $type: 'string' };
    }
    // Other strings without specific type
    return { $type: 'string' };
  }

  // --- Text-Typography (sp in Compose) ---
  if (tokenPath.includes('fontsize') || tokenPath.includes('font-size')) {
    return { $type: 'fontSize' };
  }
  if (tokenPath.includes('lineheight') || tokenPath.includes('line-height')) {
    return { $type: 'lineHeight' };
  }
  if (tokenPath.includes('letterspacing') || tokenPath.includes('letter-spacing') ||
      tokenPath.includes('letterspace')) {
    return { $type: 'letterSpacing' };
  }

  // --- Font Properties ---
  if (tokenPath.includes('fontweight') || tokenPath.includes('font-weight') ||
      (tokenPath.includes('weight') && !tokenPath.includes('size'))) {
    return { $type: 'fontWeight' };
  }

  // --- Opacity ---
  if (tokenPath.includes('opacity') || tokenPath.includes('alpha')) {
    return { $type: 'opacity' };
  }

  // --- Unitless Numbers ---
  const unitlessKeywords = [
    'columns', 'colums', 'rows', 'count', 'index', 'order',
    'zindex', 'z-index', 'layer', 'elevation',
    'aspect', 'ratio', 'scale', 'factor'
  ];
  if (unitlessKeywords.some(k => tokenPath.includes(k))) {
    return { $type: 'number' };
  }

  // --- Dimensions (dp in Compose) ---
  const dimensionKeywords = [
    'size', 'sizes', 'width', 'height',
    'space', 'spacing', 'gap', 'margin', 'padding', 'inset',
    'border', 'stroke', 'radius', 'cornerradius',
    'offset', 'top', 'bottom', 'left', 'right',
    'blur', 'spread', 'shadow', 'thickness'
  ];
  if (dimensionKeywords.some(k => tokenPath.includes(k))) {
    return { $type: 'dimension' };
  }

  // ══════════════════════════════════════════════════════════════
  // PRIORITY 3: Collection-based Fallback
  // ══════════════════════════════════════════════════════════════
  if (collection.includes('size') || collection.includes('space') ||
      collection.includes('breakpoint') || collection.includes('density')) {
    return { $type: 'dimension' };
  }

  // ══════════════════════════════════════════════════════════════
  // PRIORITY 4: Default für FLOAT ohne klare Zuordnung
  // ══════════════════════════════════════════════════════════════
  if (variable?.resolvedType === 'FLOAT' && typeof value === 'number') {
    console.warn(`⚠️  Untyped FLOAT: ${tokenName} → defaulting to dimension`);
    return { $type: 'dimension' };
  }

  return { $type: null };
}

/**
 * Font-weight keyword to numeric value mapping
 */
const FONT_WEIGHT_MAP = {
  'thin': 100,
  'hairline': 100,
  'extralight': 200,
  'ultralight': 200,
  'light': 300,
  'book': 400,
  'normal': 400,
  'regular': 400,
  'medium': 500,
  'semibold': 600,
  'demibold': 600,
  'bold': 700,
  'extrabold': 800,
  'ultrabold': 800,
  'black': 900,
  'heavy': 900,
  'extrablack': 950,
  'ultrablack': 950,
  'ultra': 1000
};

/**
 * Normalizes typography style by fixing fontWeight/fontStyle misalignment
 *
 * Problem: In Figma, fontWeight STRING variables are sometimes bound to fontStyle
 * instead of fontWeight, causing values like "700" or "Bold Italic" to appear
 * as fontStyle in the output.
 *
 * This function corrects:
 * 1. Numeric strings in fontStyle → move to fontWeight
 * 2. Combined values like "Bold Italic" → extract fontWeight + set fontStyle
 * 3. Keyword values like "Black" → convert to numeric fontWeight
 *
 * @param {Object} resolvedStyle - The typography style object to normalize
 * @returns {Object} - The normalized style object
 */
function normalizeTypographyStyle(resolvedStyle) {
  let { fontWeight, fontStyle } = resolvedStyle;

  // Skip if fontStyle is null/undefined or already correct
  if (fontStyle === null || fontStyle === undefined || fontStyle === 'normal' || fontStyle === 'italic') {
    return resolvedStyle;
  }

  // Convert fontStyle to string for analysis
  const fontStyleStr = String(fontStyle).trim();

  // Check if fontStyle contains "Italic" (case insensitive)
  const hasItalic = /italic/i.test(fontStyleStr);

  // Remove "Italic" to get the weight part
  const weightPart = fontStyleStr.replace(/\s*italic\s*/i, '').trim();

  // Determine the numeric fontWeight
  let numericWeight = null;

  // Case 1: Direct numeric value (e.g., "700", "400")
  if (/^\d+$/.test(weightPart)) {
    numericWeight = parseInt(weightPart, 10);
  }
  // Case 2: Keyword value (e.g., "Bold", "Black", "Book")
  else if (weightPart) {
    const normalizedKeyword = weightPart.toLowerCase().replace(/\s+/g, '');
    numericWeight = FONT_WEIGHT_MAP[normalizedKeyword];

    // If not found, try partial matching
    if (!numericWeight) {
      for (const [keyword, value] of Object.entries(FONT_WEIGHT_MAP)) {
        if (normalizedKeyword.includes(keyword) || keyword.includes(normalizedKeyword)) {
          numericWeight = value;
          break;
        }
      }
    }
  }
  // Case 3: fontStyle is just "Italic" with no weight
  else if (hasItalic && !weightPart) {
    // Keep existing fontWeight, just fix fontStyle
    resolvedStyle.fontStyle = 'italic';
    return resolvedStyle;
  }

  // Apply corrections
  if (numericWeight !== null) {
    // Only update fontWeight if it's null/undefined or if fontStyle had a more specific value
    if (fontWeight === null || fontWeight === undefined) {
      resolvedStyle.fontWeight = numericWeight;
    }
    // Set fontStyle correctly
    resolvedStyle.fontStyle = hasItalic ? 'italic' : null;
  } else if (fontStyleStr && fontStyleStr !== 'normal' && fontStyleStr !== 'italic') {
    // Unknown value - log warning but keep original
    console.warn(`⚠️  Unknown fontStyle value: "${fontStyleStr}" - keeping as-is`);
  }

  return resolvedStyle;
}

/**
 * Converts fontWeight string primitives to numeric values
 *
 * Problem: Figma stores some fontWeights as STRING (e.g., "Bold Italic")
 * because font styles (italic) can't be set via variables.
 *
 * Solution: Extract the weight keyword and convert to numeric value.
 * The italic part is handled separately by fontStyle in typography tokens.
 *
 * @param {string} tokenName - Token name (e.g., "stFontWeight/BoldItalic")
 * @param {any} value - Token value
 * @returns {any} - Numeric value if fontWeight string, original value otherwise
 */
function convertFontWeightStringToNumber(tokenName, value) {
  // Only process string values for fontWeight tokens
  if (typeof value !== 'string') {
    return value;
  }

  const lowerName = tokenName.toLowerCase();
  if (!lowerName.includes('fontweight') && !lowerName.includes('font-weight')) {
    return value;
  }

  // Already numeric string? Convert directly
  if (/^\d+$/.test(value)) {
    return parseInt(value, 10);
  }

  // Extract weight part (remove "Italic" if present)
  const weightPart = value.replace(/\s*italic\s*/i, '').trim();

  if (!weightPart) {
    return value; // Just "Italic" with no weight - keep as string
  }

  // Try to map keyword to numeric value
  const normalizedKeyword = weightPart.toLowerCase().replace(/\s+/g, '');
  let numericWeight = FONT_WEIGHT_MAP[normalizedKeyword];

  // Try partial matching if exact match not found
  if (!numericWeight) {
    for (const [keyword, weightValue] of Object.entries(FONT_WEIGHT_MAP)) {
      if (normalizedKeyword.includes(keyword) || keyword.includes(normalizedKeyword)) {
        numericWeight = weightValue;
        break;
      }
    }
  }

  if (numericWeight) {
    return numericWeight;
  }

  // Could not convert - keep original string
  console.warn(`⚠️  Could not convert fontWeight "${value}" to number - keeping as string`);
  return value;
}

/**
 * Converts token name to nested path
 */
function convertTokenName(name) {
  return name
    .split('/')
    .filter(part => part && !part.startsWith('_'))
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-');
}

/**
 * Sets a value in a nested object path
 */
function setNestedPath(obj, pathArray, value) {
  let current = obj;

  for (let i = 0; i < pathArray.length - 1; i++) {
    const key = pathArray[i];
    if (!current[key]) {
      current[key] = {};
    }
    current = current[key];
  }

  const lastKey = pathArray[pathArray.length - 1];
  current[lastKey] = value;
}

/**
 * Processes Shared Primitive Collections (no brand context)
 * Output: shared/{collectionName}.json
 */
function processSharedPrimitives(collections, aliasLookup) {
  console.log('\n📦 Processing Shared Primitives:\n');

  const sharedCollectionIds = [
    COLLECTION_IDS.FONT_PRIMITIVE,
    COLLECTION_IDS.COLOR_PRIMITIVE,
    COLLECTION_IDS.SIZE_PRIMITIVE,
    COLLECTION_IDS.SPACE_PRIMITIVE
  ];

  const outputs = {};

  collections.forEach(collection => {
    if (!sharedCollectionIds.includes(collection.id)) return;

    console.log(`  ✅ ${collection.name}`);

    const tokens = {};

    // Shared primitives have only one mode ("Value")
    const mode = collection.modes[0];
    if (!mode) return;

    collection.variables.forEach(variable => {
      const pathArray = variable.name.split('/').filter(part => part);
      const modeValue = variable.valuesByMode[mode.modeId];

      if (modeValue !== undefined && modeValue !== null) {
        let processedValue;

        if (modeValue.type === 'VARIABLE_ALIAS') {
          processedValue = resolveAliasWithContext(modeValue.id, aliasLookup, {}, new Set(), collections);
        } else {
          processedValue = processDirectValue(modeValue, variable.resolvedType, variable.name);
        }

        // Convert string fontWeights to numeric values (e.g., "Bold Italic" → 700)
        processedValue = convertFontWeightStringToNumber(variable.name, processedValue);

        if (processedValue !== null) {
          const tokenObject = {
            $value: processedValue,
            value: processedValue,
            type: variable.resolvedType.toLowerCase(),
            $extensions: {
              'com.figma': {
                collectionId: collection.id,
                collectionName: collection.name,
                variableId: variable.id
              }
            }
          };

          if (variable.resolvedType === 'COLOR') {
            tokenObject.$type = 'color';
          } else {
            const typeInfo = determineTokenType(variable.name, collection.name, processedValue, variable);
            if (typeInfo.$type) {
              tokenObject.$type = typeInfo.$type;
            }
          }

          if (variable.description) {
            tokenObject.comment = variable.description;
          }

          setNestedPath(tokens, pathArray, tokenObject);
        }
      }
    });

    const cleanName = collection.name
      .replace(/^_/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    outputs[cleanName] = tokens;
  });

  return outputs;
}

/**
 * Checks if a brand has BrandColorMapping
 */
function hasBrandColorMapping(collections, brandName) {
  const brandColorMappingCollection = collections.find(c => c.id === COLLECTION_IDS.BRAND_COLOR_MAPPING);
  if (!brandColorMappingCollection) return false;
  return brandColorMappingCollection.modes.some(m => m.name === brandName);
}

/**
 * Processes Brand-specific Token Collections
 * Output: brands/{brand}/{category}/{collectionName}-{mode}.json
 */
function processBrandSpecificTokens(collections, aliasLookup) {
  console.log('\n🏷️  Processing Brand-specific Tokens:\n');

  const brandCollectionIds = [
    COLLECTION_IDS.DENSITY,
    COLLECTION_IDS.BREAKPOINT_MODE,
    COLLECTION_IDS.COLOR_MODE
  ];

  const outputs = {
    bild: { density: {}, breakpoints: {}, color: {} },
    sportbild: { density: {}, breakpoints: {}, color: {} },
    advertorial: { density: {}, breakpoints: {} } // Advertorial has no BrandColorMapping
  };

  collections.forEach(collection => {
    if (!brandCollectionIds.includes(collection.id)) return;

    console.log(`  📦 ${collection.name}`);

    // Determine category
    let category;
    if (collection.id === COLLECTION_IDS.DENSITY) category = 'density';
    else if (collection.id === COLLECTION_IDS.BREAKPOINT_MODE) category = 'breakpoints';
    else if (collection.id === COLLECTION_IDS.COLOR_MODE) category = 'color';

    // For each brand
    Object.entries(BRANDS).forEach(([brandName, brandModeId]) => {
      const brandKey = brandName.toLowerCase();

      // Skip ColorMode for brands without BrandColorMapping
      if (category === 'color' && !hasBrandColorMapping(collections, brandName)) {
        return;
      }

      // For each mode in this collection
      collection.modes.forEach(mode => {
        const tokens = {};

        collection.variables.forEach(variable => {
          // Skip component tokens - they will be processed separately
          if (isComponentToken(variable.name)) {
            return;
          }

          const pathArray = variable.name.split('/').filter(part => part);
          const modeValue = variable.valuesByMode[mode.modeId];

          if (modeValue !== undefined && modeValue !== null) {
            let processedValue;
            let aliasInfo = null;

            if (modeValue.type === 'VARIABLE_ALIAS') {
              // Context with Brand + Mode (needed for both alias resolution and deep alias info)
              const context = {
                brandName,
                brandModeId,
                breakpointModeId: collection.id === COLLECTION_IDS.BREAKPOINT_MODE ? mode.modeId : undefined,
                colorModeModeId: collection.id === COLLECTION_IDS.COLOR_MODE ? mode.modeId : undefined,
                // Add modeName for ColorMode deep alias resolution (Light/Dark)
                modeName: collection.id === COLLECTION_IDS.COLOR_MODE ? mode.name : undefined
              };

              if (collection.id === COLLECTION_IDS.DENSITY) {
                context.breakpointModeId = mode.modeId;
              }

              // Extract DEEP alias info - follows chain to primitive (for CSS var() references)
              aliasInfo = getDeepAliasInfo(modeValue.id, aliasLookup, collections, context);

              processedValue = resolveAliasWithContext(modeValue.id, aliasLookup, context, new Set(), collections);
            } else {
              processedValue = processDirectValue(modeValue, variable.resolvedType, variable.name);
            }

            if (processedValue !== null) {
              const tokenObject = {
                $value: processedValue,
                value: processedValue,
                type: variable.resolvedType.toLowerCase(),
                $extensions: {
                  'com.figma': {
                    collectionId: collection.id,
                    collectionName: collection.name,
                    variableId: variable.id
                  }
                }
              };

              // Add alias info for CSS var() references (only if alias exists)
              if (aliasInfo) {
                tokenObject.$alias = aliasInfo;
              }

              if (variable.resolvedType === 'COLOR') {
                tokenObject.$type = 'color';
              } else {
                const typeInfo = determineTokenType(variable.name, collection.name, processedValue, variable);
                if (typeInfo.$type) {
                  tokenObject.$type = typeInfo.$type;
                }
              }

              if (variable.description) {
                tokenObject.comment = variable.description;
              }

              setNestedPath(tokens, pathArray, tokenObject);
            }
          }
        });

        // Save brand-specific output
        const cleanModeName = mode.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[()]/g, '')
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/--+/g, '-')
          .replace(/^-|-$/g, '');

        outputs[brandKey][category][cleanModeName] = tokens;
      });

      console.log(`     ✅ ${brandKey} (${Object.keys(outputs[brandKey][category]).length} modes)`);
    });
  });

  return outputs;
}

/**
 * Processes Brand Overrides (BrandTokenMapping, BrandColorMapping)
 * Output: brands/{brand}/overrides/{collectionName}.json
 */
function processBrandOverrides(collections, aliasLookup) {
  console.log('\n🎨 Processing Brand Overrides:\n');

  const overrideCollectionIds = [
    COLLECTION_IDS.BRAND_TOKEN_MAPPING,
    COLLECTION_IDS.BRAND_COLOR_MAPPING
  ];

  const outputs = {
    bild: {},
    sportbild: {},
    advertorial: {}
  };

  collections.forEach(collection => {
    if (!overrideCollectionIds.includes(collection.id)) return;

    console.log(`  📦 ${collection.name}`);

    // Each mode is a brand - match by mode name instead of mode ID
    Object.entries(BRANDS).forEach(([brandName, brandModeId]) => {
      const brandKey = brandName.toLowerCase();

      // Find mode by name (not ID), since each collection has its own mode IDs
      const mode = collection.modes.find(m => m.name === brandName);

      if (!mode) {
        // Brand doesn't exist in this collection (e.g. Advertorial in BrandColorMapping)
        return;
      }

      const tokens = {};

      collection.variables.forEach(variable => {
        const pathArray = variable.name.split('/').filter(part => part);
        const modeValue = variable.valuesByMode[mode.modeId];

        if (modeValue !== undefined && modeValue !== null) {
          let processedValue;

          if (modeValue.type === 'VARIABLE_ALIAS') {
            // Use the GLOBAL brand mode ID (from BRANDS) for alias resolution
            // since aliases can point to other collections (e.g. BrandTokenMapping)
            const context = { brandName, brandModeId };
            processedValue = resolveAliasWithContext(modeValue.id, aliasLookup, context, new Set(), collections);
          } else {
            processedValue = processDirectValue(modeValue, variable.resolvedType, variable.name);
          }

          if (processedValue !== null) {
            const tokenObject = {
              $value: processedValue,
              value: processedValue,
              type: variable.resolvedType.toLowerCase(),
              $extensions: {
                'com.figma': {
                  collectionId: collection.id,
                  collectionName: collection.name,
                  variableId: variable.id
                }
              }
            };

            if (variable.resolvedType === 'COLOR') {
              tokenObject.$type = 'color';
            } else {
              const typeInfo = determineTokenType(variable.name, collection.name, processedValue, variable);
              if (typeInfo.$type) {
                tokenObject.$type = typeInfo.$type;
              }
            }

            if (variable.description) {
              tokenObject.comment = variable.description;
            }

            setNestedPath(tokens, pathArray, tokenObject);
          }
        }
      });

      const cleanCollectionName = collection.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      outputs[brandKey][cleanCollectionName] = tokens;
    });

    console.log(`     ✅ All brands processed`);
  });

  return outputs;
}

/**
 * Processes Component Tokens
 * Extracts component tokens from collections and organizes by:
 * - Component name (Button, Inputfield, etc.)
 * - Collection type (color, density, breakpoint)
 * - Brand and mode
 *
 * Output: brands/{brand}/components/{Component}/{component}-{type}-{mode}.json
 */
function processComponentTokens(collections, aliasLookup) {
  console.log('\n🧩 Processing Component Tokens:\n');

  const componentCollectionIds = [
    COLLECTION_IDS.COLOR_MODE,
    COLLECTION_IDS.DENSITY,
    COLLECTION_IDS.BREAKPOINT_MODE,
    COLLECTION_IDS.BRAND_TOKEN_MAPPING,
    COLLECTION_IDS.BRAND_COLOR_MAPPING
  ];

  // Structure: { brand: { componentName: { type-mode: tokens } } }
  const componentOutputs = {
    bild: {},
    sportbild: {},
    advertorial: {}
  };

  collections.forEach(collection => {
    if (!componentCollectionIds.includes(collection.id)) return;

    const collectionType = getCollectionType(collection.id);
    if (!collectionType) return;

    console.log(`  📦 ${collection.name} (type: ${collectionType})`);

    // For each brand
    Object.entries(BRANDS).forEach(([brandName, brandModeId]) => {
      const brandKey = brandName.toLowerCase();

      // Skip ColorMode for brands without BrandColorMapping
      if (collectionType === 'color' && !hasBrandColorMapping(collections, brandName)) {
        return;
      }

      // SKIP brand-override collections (BrandTokenMapping, BrandColorMapping) for component tokens!
      // These are mapping layers, not consumption layers.
      // - BrandColorMapping tokens are already resolved through ColorMode aliases
      // - BrandTokenMapping tokens are already exported in overrides/brandtokenmapping.json
      // Component tokens should only come from: ColorMode, Density, Breakpoint
      if (collectionType === 'brand-override') {
        return; // Skip - mapping layers are exported separately in overrides/ folder
      } else {
        // For mode-based collections (ColorMode, Density, Breakpoint)
        collection.modes.forEach(mode => {
          const tokens = {};

          collection.variables.forEach(variable => {
            if (!isComponentToken(variable.name)) return;

            const componentName = getComponentName(variable.name);
            if (!componentName) return;

            const pathArray = variable.name.split('/').filter(part => part);
            const modeValue = variable.valuesByMode[mode.modeId];

            if (modeValue !== undefined && modeValue !== null) {
              let processedValue;
              let aliasInfo = null;

              if (modeValue.type === 'VARIABLE_ALIAS') {
                // Context with Brand + Mode (needed for both alias resolution and deep alias info)
                const context = {
                  brandName,
                  brandModeId,
                  breakpointModeId: collection.id === COLLECTION_IDS.BREAKPOINT_MODE ? mode.modeId : undefined,
                  colorModeModeId: collection.id === COLLECTION_IDS.COLOR_MODE ? mode.modeId : undefined,
                  // Add modeName for ColorMode deep alias resolution (Light/Dark)
                  modeName: collection.id === COLLECTION_IDS.COLOR_MODE ? mode.name : undefined
                };

                if (collection.id === COLLECTION_IDS.DENSITY) {
                  context.breakpointModeId = mode.modeId;
                }

                // Extract DEEP alias info for Component tokens
                // Component tokens stop at Semantic (ColorMode/BreakpointMode) or Density endpoints
                aliasInfo = getDeepAliasInfo(modeValue.id, aliasLookup, collections, context, {
                  acceptColorModeEndpoint: true,
                  acceptSemanticEndpoint: true,
                  acceptDensityEndpoint: true
                });

                processedValue = resolveAliasWithContext(modeValue.id, aliasLookup, context, new Set(), collections);
              } else {
                processedValue = processDirectValue(modeValue, variable.resolvedType, variable.name);
              }

              if (processedValue !== null) {
                const tokenObject = {
                  $value: processedValue,
                  value: processedValue,
                  type: variable.resolvedType.toLowerCase(),
                  $extensions: {
                    'com.figma': {
                      collectionId: collection.id,
                      collectionName: collection.name,
                      variableId: variable.id
                    }
                  }
                };

                // Add alias info for CSS var() references (only if alias exists)
                if (aliasInfo) {
                  tokenObject.$alias = aliasInfo;
                }

                if (variable.resolvedType === 'COLOR') {
                  tokenObject.$type = 'color';
                } else {
                  const typeInfo = determineTokenType(variable.name, collection.name, processedValue, variable);
                  if (typeInfo.$type) {
                    tokenObject.$type = typeInfo.$type;
                  }
                }

                if (variable.description) {
                  tokenObject.comment = variable.description;
                }

                setNestedPath(tokens, pathArray, tokenObject);
              }
            }
          });

          // Save tokens for this component + mode
          if (Object.keys(tokens).length > 0 && tokens.Component) {
            const cleanModeName = mode.name
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[()]/g, '')
              .replace(/[^a-z0-9-]/g, '-')
              .replace(/--+/g, '-')
              .replace(/^-|-$/g, '');

            const modeKey = `${collectionType}-${cleanModeName}`;

            // Group by component (note: "Component" is capitalized in the token structure)
            Object.keys(tokens.Component || {}).forEach(componentName => {
              if (!componentOutputs[brandKey][componentName]) {
                componentOutputs[brandKey][componentName] = {};
              }
              componentOutputs[brandKey][componentName][modeKey] = tokens.Component[componentName];
            });
          }
        });
      }
    });
  });

  console.log(`\n  ✅ Component extraction complete`);
  return componentOutputs;
}

/**
 * Processes Typography Composite Tokens (textStyles)
 * Generates Brand × Breakpoint matrix
 * Separates component-specific typography into component folders
 */
function processTypographyTokens(textStyles, aliasLookup, collections) {
  console.log('\n✍️  Processing Typography Composite Tokens:\n');

  const typographyOutputs = {};
  const componentTypographyOutputs = {
    bild: {},
    sportbild: {},
    advertorial: {}
  };

  // Separate component and semantic typography
  const semanticTextStyles = textStyles.filter(ts => !ts.name.startsWith('Component/'));
  const componentTextStyles = textStyles.filter(ts => ts.name.startsWith('Component/'));

  console.log(`  ℹ️  ${semanticTextStyles.length} semantic styles, ${componentTextStyles.length} component styles`);

  // Process semantic typography (existing logic)
  // For each brand
  Object.entries(BRANDS).forEach(([brandName, brandModeId]) => {
    console.log(`  🏷️  Brand: ${brandName}`);

    // For each breakpoint
    Object.entries(BREAKPOINTS).forEach(([breakpointName, breakpointModeId]) => {
      const context = {
        brandName,
        brandModeId,
        breakpointModeId
      };

      const tokens = {};

      semanticTextStyles.forEach(textStyle => {
        const styleName = textStyle.name.split('/').pop(); // e.g. "display1"
        const category = textStyle.name.split('/').slice(-2, -1)[0]; // e.g. "Display"

        const resolvedStyle = {
          fontFamily: null,
          fontWeight: null,
          fontSize: null,
          lineHeight: null,
          letterSpacing: null,
          fontStyle: null,
          textCase: textStyle.textCase || 'ORIGINAL',
          textDecoration: textStyle.textDecoration || 'NONE'
        };

        // Track aliases for each bound property (for CSS var() references)
        const aliases = {};

        // Resolve boundVariables
        if (textStyle.boundVariables) {
          Object.entries(textStyle.boundVariables).forEach(([property, alias]) => {
            if (alias.type === 'VARIABLE_ALIAS') {
              // Accept Semantic-level (BreakpointMode) as endpoint for ALL typography properties
              // This preserves var() references for brand-switching (fontFamily, fontWeight change per brand)
              const acceptSemanticEndpoint = true;

              // Extract DEEP alias info - follows chain to primitive (or semantic for typography)
              const aliasInfo = getDeepAliasInfo(alias.id, aliasLookup, collections, context, { acceptSemanticEndpoint });
              if (aliasInfo) {
                aliases[property] = aliasInfo;
              }

              const resolved = resolveAliasWithContext(alias.id, aliasLookup, context, new Set(), collections);
              resolvedStyle[property] = resolved;
            }
          });
        }

        // Fallback to direct values from fontName
        if (textStyle.fontName) {
          if (!resolvedStyle.fontFamily) {
            resolvedStyle.fontFamily = textStyle.fontName.family;
          }
          // Extract fontWeight/fontStyle from fontName.style if not bound
          // e.g., "Book Italic" → fontWeight: 400, fontStyle: "italic"
          if ((resolvedStyle.fontWeight === null || resolvedStyle.fontStyle === null) && textStyle.fontName.style) {
            const styleStr = textStyle.fontName.style;
            const hasItalic = /italic/i.test(styleStr);
            const weightPart = styleStr.replace(/\s*italic\s*/i, '').trim();

            if (resolvedStyle.fontWeight === null && weightPart) {
              const normalizedKeyword = weightPart.toLowerCase().replace(/\s+/g, '');
              resolvedStyle.fontWeight = FONT_WEIGHT_MAP[normalizedKeyword] || 400;
            }
            if (resolvedStyle.fontStyle === null && hasItalic) {
              resolvedStyle.fontStyle = 'italic';
            }
          }
        }

        // Normalize fontWeight/fontStyle (fix Figma binding issues)
        normalizeTypographyStyle(resolvedStyle);

        // Token structure: category/styleName
        // Keep styleName case for proper platform-specific transformations (camelCase, kebab-case, etc.)
        const pathArray = [category.toLowerCase(), styleName];

        const tokenObject = {
          $value: resolvedStyle,
          value: resolvedStyle,
          type: 'typography',
          $type: 'typography',
          comment: textStyle.description || '',
          $extensions: {
            'com.figma': {
              styleId: textStyle.id,
              styleName: textStyle.name
            }
          }
        };

        // Add aliases info for CSS var() references (only if aliases exist)
        if (Object.keys(aliases).length > 0) {
          tokenObject.$aliases = aliases;
        }

        setNestedPath(tokens, pathArray, tokenObject);
      });

      const key = `${brandName.toLowerCase()}-${breakpointName}`;
      typographyOutputs[key] = {
        tokens,
        brand: brandName,
        breakpoint: breakpointName,
        brandModeId,
        breakpointModeId
      };

      console.log(`     ✅ ${key}`);
    });
  });

  // Process component typography
  if (componentTextStyles.length > 0) {
    console.log('\n  🧩 Processing Component Typography:\n');

    Object.entries(BRANDS).forEach(([brandName, brandModeId]) => {
      const brandKey = brandName.toLowerCase();
      console.log(`  🏷️  Brand: ${brandName}`);

      Object.entries(BREAKPOINTS).forEach(([breakpointName, breakpointModeId]) => {
        const context = {
          brandName,
          brandModeId,
          breakpointModeId
        };

        componentTextStyles.forEach(textStyle => {
          // Extract component name: "Component/Button/buttonLabel" → "Button"
          const pathParts = textStyle.name.split('/');
          if (pathParts.length < 3) return; // Invalid path

          const componentName = pathParts[1];
          const styleName = pathParts.slice(2).join('/');

          const resolvedStyle = {
            fontFamily: null,
            fontWeight: null,
            fontSize: null,
            lineHeight: null,
            letterSpacing: null,
            fontStyle: null,
            textCase: textStyle.textCase || 'ORIGINAL',
            textDecoration: textStyle.textDecoration || 'NONE'
          };

          // Track aliases for each bound property (for CSS var() references)
          const aliases = {};

          // Resolve boundVariables
          if (textStyle.boundVariables) {
            Object.entries(textStyle.boundVariables).forEach(([property, alias]) => {
              if (alias.type === 'VARIABLE_ALIAS') {
                // Accept Semantic-level (BreakpointMode) as endpoint for ALL typography properties
                // This preserves var() references for brand-switching (fontFamily, fontWeight change per brand)
                const acceptSemanticEndpoint = true;

                // Extract DEEP alias info - follows chain to primitive (or semantic for typography)
                const aliasInfo = getDeepAliasInfo(alias.id, aliasLookup, collections, context, { acceptSemanticEndpoint });
                if (aliasInfo) {
                  aliases[property] = aliasInfo;
                }

                const resolved = resolveAliasWithContext(alias.id, aliasLookup, context, new Set(), collections);
                resolvedStyle[property] = resolved;
              }
            });
          }

          // Fallback to direct values from fontName
          if (textStyle.fontName) {
            if (!resolvedStyle.fontFamily) {
              resolvedStyle.fontFamily = textStyle.fontName.family;
            }
            // Extract fontWeight/fontStyle from fontName.style if not bound
            // e.g., "Book Italic" → fontWeight: 400, fontStyle: "italic"
            if ((resolvedStyle.fontWeight === null || resolvedStyle.fontStyle === null) && textStyle.fontName.style) {
              const styleStr = textStyle.fontName.style;
              const hasItalic = /italic/i.test(styleStr);
              const weightPart = styleStr.replace(/\s*italic\s*/i, '').trim();

              if (resolvedStyle.fontWeight === null && weightPart) {
                const normalizedKeyword = weightPart.toLowerCase().replace(/\s+/g, '');
                resolvedStyle.fontWeight = FONT_WEIGHT_MAP[normalizedKeyword] || 400;
              }
              if (resolvedStyle.fontStyle === null && hasItalic) {
                resolvedStyle.fontStyle = 'italic';
              }
            }
          }

          // Normalize fontWeight/fontStyle (fix Figma binding issues)
          normalizeTypographyStyle(resolvedStyle);

          // Initialize component structure
          if (!componentTypographyOutputs[brandKey][componentName]) {
            componentTypographyOutputs[brandKey][componentName] = {};
          }
          if (!componentTypographyOutputs[brandKey][componentName][`typography-${breakpointName}`]) {
            componentTypographyOutputs[brandKey][componentName][`typography-${breakpointName}`] = {};
          }

          // Build token object
          const tokenObject = {
            $value: resolvedStyle,
            value: resolvedStyle,
            type: 'typography',
            $type: 'typography',
            comment: textStyle.description || '',
            $extensions: {
              'com.figma': {
                styleId: textStyle.id,
                styleName: textStyle.name
              }
            }
          };

          // Auto-link fontSize/lineHeight to corresponding Breakpoint tokens
          // Pattern: "buttonLabel" → "buttonLabelFontSize", "buttonLabelLineHeight"
          if (!aliases.fontSize || !aliases.lineHeight) {
            const baseStyleName = styleName.replace(/\//g, '');
            const fontSizeVarName = `Component/${componentName}/${baseStyleName}FontSize`;
            const lineHeightVarName = `Component/${componentName}/${baseStyleName}LineHeight`;

            // Search for matching variables in BreakpointMode collection
            for (const [varId, variable] of aliasLookup) {
              if (variable.collectionId === COLLECTION_IDS.BREAKPOINT_MODE) {
                // Match fontSize variable
                if (!aliases.fontSize && variable.name === fontSizeVarName) {
                  aliases.fontSize = {
                    token: baseStyleName + 'FontSize',
                    collection: 'breakpointmode',
                    collectionType: 'component-breakpoint',
                    variableId: varId
                  };
                }
                // Match lineHeight variable
                if (!aliases.lineHeight && variable.name === lineHeightVarName) {
                  aliases.lineHeight = {
                    token: baseStyleName + 'LineHeight',
                    collection: 'breakpointmode',
                    collectionType: 'component-breakpoint',
                    variableId: varId
                  };
                }
              }
            }
          }

          // Add aliases info for CSS var() references (only if aliases exist)
          if (Object.keys(aliases).length > 0) {
            tokenObject.$aliases = aliases;
          }

          // Add to component typography output
          // Keep styleName case for proper platform-specific transformations
          componentTypographyOutputs[brandKey][componentName][`typography-${breakpointName}`][styleName.replace(/\//g, '-')] = tokenObject;
        });
      });

      console.log(`     ✅ ${brandKey}`);
    });
  }

  return { semantic: typographyOutputs, component: componentTypographyOutputs };
}

/**
 * Processes Effect Composite Tokens (effectStyles)
 * Generates Brand × ColorMode matrix
 * Separates component-specific effects into component folders
 */
function processEffectTokens(effectStyles, aliasLookup, collections) {
  console.log('\n🎨 Processing Effect Composite Tokens:\n');

  const effectOutputs = {};
  const componentEffectOutputs = {
    bild: {},
    sportbild: {},
    advertorial: {}
  };

  // Separate component and semantic effects
  const semanticEffectStyles = effectStyles.filter(es => !es.name.startsWith('Component/'));
  const componentEffectStyles = effectStyles.filter(es => es.name.startsWith('Component/'));

  console.log(`  ℹ️  ${semanticEffectStyles.length} semantic styles, ${componentEffectStyles.length} component styles`);

  // Process semantic effects (existing logic)
  // For each brand (only ColorBrands - skip Advertorial)
  Object.entries(BRANDS).forEach(([brandName, brandModeId]) => {
    // Skip brands without BrandColorMapping (Advertorial)
    // Effects belong to ColorBrand axis, not ContentBrand
    if (!hasBrandColorMapping(collections, brandName)) {
      console.log(`  ⏭️  ${brandName}: Skipped (no ColorBrand - effects inherited from parent)`);
      return;
    }

    console.log(`  🏷️  Brand: ${brandName}`);

    // For each ColorMode
    Object.entries(COLOR_MODES).forEach(([modeName, colorModeModeId]) => {
      const context = {
        brandName,
        brandModeId,
        colorModeModeId,
        modeName  // Add modeName for ColorMode deep alias resolution (Light/Dark)
      };

      const tokens = {};

      semanticEffectStyles.forEach(effectStyle => {
        const styleName = effectStyle.name.split('/').pop();
        const category = effectStyle.name.split('/').slice(-2, -1)[0];

        const resolvedEffects = [];
        // Track aliases for each effect layer (for CSS var() references)
        const aliases = [];

        if (effectStyle.effects && Array.isArray(effectStyle.effects)) {
          effectStyle.effects.forEach((effect, index) => {
            if (effect.type === 'DROP_SHADOW' && effect.visible) {
              const shadowEffect = {
                type: 'dropShadow',
                color: colorToHex(effect.color),
                offsetX: effect.offset.x,
                offsetY: effect.offset.y,
                radius: effect.radius,
                spread: effect.spread || 0,
                blendMode: effect.blendMode || 'NORMAL'
              };

              // Track alias info for this effect layer
              let layerAliases = null;

              // Resolve boundVariables if present
              if (effect.boundVariables && effect.boundVariables.color) {
                if (effect.boundVariables.color.type === 'VARIABLE_ALIAS') {
                  // Extract alias info for CSS var() references - use getDeepAliasInfo with context
                  const aliasInfo = getDeepAliasInfo(effect.boundVariables.color.id, aliasLookup, collections, context);
                  if (aliasInfo) {
                    layerAliases = { color: aliasInfo };
                  }

                  const resolved = resolveAliasWithContext(
                    effect.boundVariables.color.id,
                    aliasLookup,
                    context,
                    new Set(),
                    collections
                  );
                  shadowEffect.color = resolved;
                }
              }

              resolvedEffects.push(shadowEffect);
              if (layerAliases) {
                aliases.push({ index, ...layerAliases });
              }
            }
          });
        }

        // Keep styleName case for proper platform-specific transformations
        const pathArray = [category.toLowerCase(), styleName];

        const tokenObject = {
          $value: resolvedEffects,
          value: resolvedEffects,
          type: 'shadow',
          $type: 'shadow',
          comment: effectStyle.description || '',
          $extensions: {
            'com.figma': {
              styleId: effectStyle.id,
              styleName: effectStyle.name
            }
          }
        };

        // Add aliases info for CSS var() references (only if aliases exist)
        if (aliases.length > 0) {
          tokenObject.$aliases = aliases;
        }

        setNestedPath(tokens, pathArray, tokenObject);
      });

      const key = `${brandName.toLowerCase()}-${modeName}`;
      effectOutputs[key] = {
        tokens,
        brand: brandName,
        colorMode: modeName,
        brandModeId,
        colorModeModeId
      };

      console.log(`     ✅ ${key}`);
    });
  });

  // Process component effects (only ColorBrands - skip Advertorial)
  if (componentEffectStyles.length > 0) {
    console.log('\n  🧩 Processing Component Effects:\n');

    Object.entries(BRANDS).forEach(([brandName, brandModeId]) => {
      // Skip brands without BrandColorMapping (Advertorial)
      // Component effects belong to ColorBrand axis, not ContentBrand
      if (!hasBrandColorMapping(collections, brandName)) {
        console.log(`  ⏭️  ${brandName}: Skipped (no ColorBrand)`);
        return;
      }

      const brandKey = brandName.toLowerCase();
      console.log(`  🏷️  Brand: ${brandName}`);

      Object.entries(COLOR_MODES).forEach(([modeName, colorModeModeId]) => {
        const context = {
          brandName,
          brandModeId,
          colorModeModeId,
          modeName  // Add modeName for ColorMode deep alias resolution (Light/Dark)
        };

        componentEffectStyles.forEach(effectStyle => {
          // Extract component name: "Component/Alert/alertShadowDown" → "Alert"
          const pathParts = effectStyle.name.split('/');
          if (pathParts.length < 3) return; // Invalid path

          const componentName = pathParts[1];
          const styleName = pathParts.slice(2).join('/');

          const resolvedEffects = [];
          // Track aliases for each effect layer (for CSS var() references)
          const aliases = [];

          if (effectStyle.effects && Array.isArray(effectStyle.effects)) {
            effectStyle.effects.forEach((effect, index) => {
              if (effect.type === 'DROP_SHADOW' && effect.visible) {
                const shadowEffect = {
                  type: 'dropShadow',
                  color: colorToHex(effect.color),
                  offsetX: effect.offset.x,
                  offsetY: effect.offset.y,
                  radius: effect.radius,
                  spread: effect.spread || 0,
                  blendMode: effect.blendMode || 'NORMAL'
                };

                // Track alias info for this effect layer
                let layerAliases = null;

                // Resolve boundVariables if present
                if (effect.boundVariables && effect.boundVariables.color) {
                  if (effect.boundVariables.color.type === 'VARIABLE_ALIAS') {
                    // Extract alias info for CSS var() references
                    // Component effects stop at ColorMode semantic tokens
                    const aliasInfo = getDeepAliasInfo(effect.boundVariables.color.id, aliasLookup, collections, context, {
                      acceptColorModeEndpoint: true
                    });
                    if (aliasInfo) {
                      layerAliases = { color: aliasInfo };
                    }

                    const resolved = resolveAliasWithContext(
                      effect.boundVariables.color.id,
                      aliasLookup,
                      context,
                      new Set(),
                      collections
                    );
                    shadowEffect.color = resolved;
                  }
                }

                resolvedEffects.push(shadowEffect);
                if (layerAliases) {
                  aliases.push({ index, ...layerAliases });
                }
              }
            });
          }

          // Initialize component structure
          if (!componentEffectOutputs[brandKey][componentName]) {
            componentEffectOutputs[brandKey][componentName] = {};
          }
          if (!componentEffectOutputs[brandKey][componentName][`effects-${modeName}`]) {
            componentEffectOutputs[brandKey][componentName][`effects-${modeName}`] = {};
          }

          // Build token object
          const tokenObject = {
            $value: resolvedEffects,
            value: resolvedEffects,
            type: 'shadow',
            $type: 'shadow',
            comment: effectStyle.description || '',
            $extensions: {
              'com.figma': {
                styleId: effectStyle.id,
                styleName: effectStyle.name
              }
            }
          };

          // Add aliases info for CSS var() references (only if aliases exist)
          if (aliases.length > 0) {
            tokenObject.$aliases = aliases;
          }

          // Add to component effects output
          // Keep styleName case for proper platform-specific transformations
          componentEffectOutputs[brandKey][componentName][`effects-${modeName}`][styleName.replace(/\//g, '-')] = tokenObject;
        });
      });

      console.log(`     ✅ ${brandKey}`);
    });
  }

  return { semantic: effectOutputs, component: componentEffectOutputs };
}

/**
 * Saves Shared Primitives
 */
function saveSharedPrimitives(sharedOutputs) {
  console.log('\n💾 Saving Shared Primitives:\n');

  const sharedDir = path.join(OUTPUT_DIR, 'shared');
  if (!fs.existsSync(sharedDir)) {
    fs.mkdirSync(sharedDir, { recursive: true });
  }

  Object.entries(sharedOutputs).forEach(([collectionName, tokens]) => {
    const filePath = path.join(sharedDir, `${collectionName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2), 'utf8');
    console.log(`  ✅ ${path.relative(process.cwd(), filePath)}`);
  });
}

/**
 * Saves Brand-specific Tokens
 */
function saveBrandSpecificTokens(brandOutputs) {
  console.log('\n💾 Saving Brand-specific Tokens:\n');

  Object.entries(brandOutputs).forEach(([brand, categories]) => {
    console.log(`  🏷️  ${brand}:`);

    Object.entries(categories).forEach(([category, modes]) => {
      const categoryDir = path.join(OUTPUT_DIR, 'brands', brand, category);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }

      Object.entries(modes).forEach(([modeName, tokens]) => {
        const collectionPrefix = category === 'density' ? 'density' :
                                  category === 'breakpoints' ? 'breakpoint' :
                                  'colormode';
        const fileName = `${collectionPrefix}-${modeName}.json`;
        const filePath = path.join(categoryDir, fileName);
        fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2), 'utf8');
        console.log(`     ✅ ${category}/${fileName}`);
      });
    });
  });
}

/**
 * Saves Brand Overrides
 */
function saveBrandOverrides(overrideOutputs) {
  console.log('\n💾 Saving Brand Overrides:\n');

  Object.entries(overrideOutputs).forEach(([brand, collections]) => {
    console.log(`  🏷️  ${brand}: (${Object.keys(collections).length} collections)`);

    const overridesDir = path.join(OUTPUT_DIR, 'brands', brand, 'overrides');
    if (!fs.existsSync(overridesDir)) {
      fs.mkdirSync(overridesDir, { recursive: true });
    }

    Object.entries(collections).forEach(([collectionName, tokens]) => {
      const fileName = `${collectionName}.json`;
      const filePath = path.join(overridesDir, fileName);
      fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2), 'utf8');
      console.log(`     ✅ overrides/${fileName}`);
    });
  });
}

/**
 * Saves Typography Tokens (semantic only, component typography saved separately)
 */
function saveTypographyTokens(typographyOutputs) {
  console.log('\n💾 Saving Semantic Typography Tokens:\n');

  // Group by brand
  const byBrand = {};
  Object.entries(typographyOutputs).forEach(([key, data]) => {
    const brand = data.brand.toLowerCase();
    const breakpoint = data.breakpoint;

    if (!byBrand[brand]) byBrand[brand] = {};
    byBrand[brand][breakpoint] = data.tokens;
  });

  // Save in brands/{brand}/semantic/typography/
  Object.entries(byBrand).forEach(([brand, breakpoints]) => {
    console.log(`  🏷️  ${brand}:`);

    const typographyDir = path.join(OUTPUT_DIR, 'brands', brand, 'semantic', 'typography');
    if (!fs.existsSync(typographyDir)) {
      fs.mkdirSync(typographyDir, { recursive: true });
    }

    Object.entries(breakpoints).forEach(([breakpoint, tokens]) => {
      const fileName = `typography-${breakpoint}.json`;
      const filePath = path.join(typographyDir, fileName);
      fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2), 'utf8');
      console.log(`     ✅ semantic/typography/${fileName}`);
    });
  });
}

/**
 * Saves Effect Tokens (semantic only, component effects saved separately)
 */
function saveEffectTokens(effectOutputs) {
  console.log('\n💾 Saving Semantic Effect Tokens:\n');

  // Group by brand
  const byBrand = {};
  Object.entries(effectOutputs).forEach(([key, data]) => {
    const brand = data.brand.toLowerCase();
    const colorMode = data.colorMode;

    if (!byBrand[brand]) byBrand[brand] = {};
    byBrand[brand][colorMode] = data.tokens;
  });

  // Save in brands/{brand}/semantic/effects/
  Object.entries(byBrand).forEach(([brand, colorModes]) => {
    console.log(`  🏷️  ${brand}:`);

    const effectsDir = path.join(OUTPUT_DIR, 'brands', brand, 'semantic', 'effects');
    if (!fs.existsSync(effectsDir)) {
      fs.mkdirSync(effectsDir, { recursive: true });
    }

    Object.entries(colorModes).forEach(([colorMode, tokens]) => {
      const fileName = `effects-${colorMode}.json`;
      const filePath = path.join(effectsDir, fileName);
      fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2), 'utf8');
      console.log(`     ✅ semantic/effects/${fileName}`);
    });
  });
}

/**
 * Saves Component Tokens
 * Output: brands/{brand}/components/{ComponentName}/{component}-{type}-{mode}.json
 */
function saveComponentTokens(componentOutputs) {
  console.log('\n💾 Saving Component Tokens:\n');

  let totalComponents = 0;
  let totalFiles = 0;

  Object.entries(componentOutputs).forEach(([brand, components]) => {
    if (Object.keys(components).length === 0) {
      console.log(`  🏷️  ${brand}: No components found`);
      return;
    }

    console.log(`  🏷️  ${brand}:`);

    Object.entries(components).forEach(([componentName, modes]) => {
      const componentDir = path.join(OUTPUT_DIR, 'brands', brand, 'components', componentName);
      if (!fs.existsSync(componentDir)) {
        fs.mkdirSync(componentDir, { recursive: true });
      }

      let fileCount = 0;
      Object.entries(modes).forEach(([modeKey, tokens]) => {
        // Skip empty token objects
        if (!tokens || Object.keys(tokens).length === 0) {
          return;
        }

        const fileName = `${componentName.toLowerCase()}-${modeKey}.json`;
        const filePath = path.join(componentDir, fileName);
        fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2), 'utf8');
        fileCount++;
        totalFiles++;
      });

      if (fileCount > 0) {
        console.log(`     ✅ ${componentName} (${fileCount} files)`);
        totalComponents++;
      }
    });
  });

  console.log(`\n  📊 Total: ${totalComponents} components, ${totalFiles} files`);
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Starting Plugin Token Preprocessing...\n');

  // Clear output directory
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Load plugin tokens
  const pluginData = loadPluginTokens();

  // Create alias lookup
  console.log('🔍 Creating Alias Lookup...');
  const aliasLookup = createAliasLookup(pluginData.collections);
  console.log(`   ℹ️  ${aliasLookup.size} variables indexed`);

  // Process classic tokens
  const sharedPrimitives = processSharedPrimitives(pluginData.collections, aliasLookup);
  const brandSpecificTokens = processBrandSpecificTokens(pluginData.collections, aliasLookup);
  const brandOverrides = processBrandOverrides(pluginData.collections, aliasLookup);

  // Process component tokens
  const componentTokens = processComponentTokens(pluginData.collections, aliasLookup);

  // Process composite tokens
  const typographyResults = processTypographyTokens(pluginData.textStyles || [], aliasLookup, pluginData.collections);
  const effectResults = processEffectTokens(pluginData.effectStyles || [], aliasLookup, pluginData.collections);

  // Merge component typography and effects into componentTokens
  console.log('\n🔄 Merging component typography and effects...\n');
  Object.keys(componentTokens).forEach(brand => {
    // Merge typography
    if (typographyResults.component[brand]) {
      Object.entries(typographyResults.component[brand]).forEach(([componentName, typographyModes]) => {
        if (!componentTokens[brand][componentName]) {
          componentTokens[brand][componentName] = {};
        }
        Object.assign(componentTokens[brand][componentName], typographyModes);
      });
    }

    // Merge effects
    if (effectResults.component[brand]) {
      Object.entries(effectResults.component[brand]).forEach(([componentName, effectModes]) => {
        if (!componentTokens[brand][componentName]) {
          componentTokens[brand][componentName] = {};
        }
        Object.assign(componentTokens[brand][componentName], effectModes);
      });
    }
  });

  // Save everything
  saveSharedPrimitives(sharedPrimitives);
  saveBrandSpecificTokens(brandSpecificTokens);
  saveBrandOverrides(brandOverrides);
  saveComponentTokens(componentTokens);
  saveTypographyTokens(typographyResults.semantic);
  saveEffectTokens(effectResults.semantic);

  // Calculate component statistics
  let totalComponentCount = 0;
  let totalComponentFiles = 0;
  Object.values(componentTokens).forEach(brand => {
    Object.values(brand).forEach(component => {
      totalComponentCount++;
      totalComponentFiles += Object.keys(component).length;
    });
  });

  // Statistics
  console.log('\n✨ Preprocessing completed!\n');
  console.log(`📊 Statistics:`);
  console.log(`   - Shared Primitives: ${Object.keys(sharedPrimitives).length}`);
  console.log(`   - Brand-specific Collections: ${Object.keys(brandSpecificTokens).length} brands`);
  console.log(`   - Brand Overrides: ${Object.keys(brandOverrides).length} brands`);
  console.log(`   - Component Tokens: ${totalComponentCount} components (${totalComponentFiles} files)`);
  console.log(`   - Semantic Typography Outputs: ${Object.keys(typographyResults.semantic).length}`);
  console.log(`   - Semantic Effect Outputs: ${Object.keys(effectResults.semantic).length}`);
  console.log(`   - Output Directory: ${path.relative(process.cwd(), OUTPUT_DIR)}\n`);
}

// Execute script
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Error during preprocessing:', error);
    process.exit(1);
  }
}

module.exports = { main };
