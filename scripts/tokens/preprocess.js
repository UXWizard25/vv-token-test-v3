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

// Pipeline Configuration
const pipelineConfig = require('../../build-config/pipeline.config.js');

// Paths (from config)
const INPUT_JSON_PATH = path.join(__dirname, '../..', pipelineConfig.paths.tokensInput, pipelineConfig.figma.inputFile);
const OUTPUT_DIR = path.join(__dirname, '../..', pipelineConfig.paths.tokensIntermediate);

// Mode ID mappings (derived values from config)
const BREAKPOINTS = pipelineConfig.breakpointModeIds;      // { xs: '7017:0', sm: '16706:1', ... }
const COLOR_MODES = pipelineConfig.colorModeIds;           // { light: '588:0', dark: '592:1' }
const DENSITY_MODES = pipelineConfig.densityModeIds;       // { default: '5695:2', ... }

// Brand mappings (derived values from config)
const ALL_BRANDS = pipelineConfig.allBrands;               // ['bild', 'sportbild', 'advertorial']
const BRAND_TO_FIGMA_NAME = pipelineConfig.brandToFigmaName; // { bild: 'BILD', ... }
const FIGMA_NAME_TO_BRAND = pipelineConfig.figmaNameToBrand; // { 'BILD': 'bild', ... }

// Collection IDs (from config)
const COLLECTION_IDS = pipelineConfig.figma.collections;

// Component token path prefix (from config, e.g. 'Component/')
const COMPONENT_PREFIX = pipelineConfig.figma.componentPrefix;
const COMPONENT_PREFIX_SEGMENT = COMPONENT_PREFIX.replace(/\/$/, ''); // 'Component' (without trailing slash)

// Validation settings (from config)
const VALIDATION_STRICT = pipelineConfig.validation?.strict ?? (process.env.CI === 'true');
const VALIDATION_WARN_UNKNOWN = pipelineConfig.validation?.warnUnknownFigmaModes ?? true;

/**
 * Checks if a token path represents a component token
 */
function isComponentToken(tokenPath) {
  return tokenPath.startsWith(COMPONENT_PREFIX);
}

/**
 * Extracts component name from token path
 * Example: "Component/Button/Primary/buttonPrimaryBgColor" → "Button"
 */
function getComponentName(tokenPath) {
  const parts = tokenPath.split('/');
  if (parts[0] === COMPONENT_PREFIX_SEGMENT && parts.length >= 2) {
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
 * Validates Config ↔ Figma synchronization (bidirectional validation)
 *
 * Critical errors (abort in strict mode):
 * - Brand in config.axes but not found in Figma collection
 * - Collection ID in config not found in Figma export
 * - Mode ID in config not found in Figma collection
 * - figmaName in config doesn't match any mode name in collection
 *
 * Warnings (always, never abort):
 * - Additional mode in Figma not defined in config
 *
 * @param {Array} collections - Figma collections array from plugin export
 * @returns {{ errors: string[], warnings: string[], valid: boolean }}
 */
function validateConfigAgainstFigma(collections) {
  const errors = [];
  const warnings = [];

  console.log('\n🔍 Validating Config ↔ Figma synchronization...\n');

  // Create collection ID → collection map for fast lookup
  const collectionMap = new Map(collections.map(c => [c.id, c]));

  // ---------------------------------------------------------------------------
  // 1. Validate Collection IDs exist
  // ---------------------------------------------------------------------------
  const collectionNames = {
    FONT_PRIMITIVE: '_FontPrimitive',
    COLOR_PRIMITIVE: '_ColorPrimitive',
    SIZE_PRIMITIVE: '_SizePrimitive',
    SPACE_PRIMITIVE: '_SpacePrimitive',
    DENSITY: 'Density',
    BRAND_TOKEN_MAPPING: 'BrandTokenMapping',
    BRAND_COLOR_MAPPING: 'BrandColorMapping',
    BREAKPOINT_MODE: 'BreakpointMode',
    COLOR_MODE: 'ColorMode',
  };

  Object.entries(COLLECTION_IDS).forEach(([key, id]) => {
    if (!collectionMap.has(id)) {
      errors.push(`Collection ID not found in Figma: ${collectionNames[key] || key} (${id})`);
    }
  });

  // ---------------------------------------------------------------------------
  // 2. Validate Brand axes against Figma collections
  // ---------------------------------------------------------------------------
  const brandColorCollection = collectionMap.get(COLLECTION_IDS.BRAND_COLOR_MAPPING);
  const brandTokenCollection = collectionMap.get(COLLECTION_IDS.BRAND_TOKEN_MAPPING);

  const figmaColorModes = brandColorCollection?.modes?.map(m => m.name) || [];
  const figmaContentModes = brandTokenCollection?.modes?.map(m => m.name) || [];

  // Check each brand's axes
  ALL_BRANDS.forEach(brandKey => {
    const brand = pipelineConfig.brands[brandKey];
    const figmaName = brand.figmaName;
    const axes = brand.axes || [];

    // Check color axis
    if (axes.includes('color')) {
      if (!figmaColorModes.includes(figmaName)) {
        errors.push(
          `Brand '${brandKey}' has axes: ['color'] but '${figmaName}' not found in BrandColorMapping.\n` +
          `   Available modes: ${figmaColorModes.join(', ') || 'none'}\n` +
          `   Fix: Either add '${figmaName}' mode to BrandColorMapping in Figma, or remove 'color' from axes.`
        );
      }
    }

    // Check content axis
    if (axes.includes('content')) {
      if (!figmaContentModes.includes(figmaName)) {
        errors.push(
          `Brand '${brandKey}' has axes: ['content'] but '${figmaName}' not found in BrandTokenMapping.\n` +
          `   Available modes: ${figmaContentModes.join(', ') || 'none'}\n` +
          `   Fix: Either add '${figmaName}' mode to BrandTokenMapping in Figma, or remove 'content' from axes.`
        );
      }
    }
  });

  // ---------------------------------------------------------------------------
  // 3. Check for unknown Figma modes not in config (Figma → Config)
  // ---------------------------------------------------------------------------
  if (VALIDATION_WARN_UNKNOWN) {
    const configColorFigmaNames = ALL_BRANDS
      .filter(b => pipelineConfig.brands[b].axes?.includes('color'))
      .map(b => pipelineConfig.brands[b].figmaName);
    const configContentFigmaNames = ALL_BRANDS
      .filter(b => pipelineConfig.brands[b].axes?.includes('content'))
      .map(b => pipelineConfig.brands[b].figmaName);

    figmaColorModes.forEach(mode => {
      if (!configColorFigmaNames.includes(mode)) {
        warnings.push(
          `Figma BrandColorMapping has mode '${mode}' not defined in config.\n` +
          `   This mode will be IGNORED during build.\n` +
          `   Fix: Add a brand with figmaName: '${mode}' and axes: ['color', ...] to config.`
        );
      }
    });

    figmaContentModes.forEach(mode => {
      if (!configContentFigmaNames.includes(mode)) {
        warnings.push(
          `Figma BrandTokenMapping has mode '${mode}' not defined in config.\n` +
          `   This mode will be IGNORED during build.\n` +
          `   Fix: Add a brand with figmaName: '${mode}' and axes: ['content', ...] to config.`
        );
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 4. Validate Color Mode IDs
  // ---------------------------------------------------------------------------
  const colorModeCollection = collectionMap.get(COLLECTION_IDS.COLOR_MODE);
  if (colorModeCollection) {
    const figmaColorModeIds = new Set(colorModeCollection.modes.map(m => m.modeId));
    const figmaColorModeNames = Object.fromEntries(
      colorModeCollection.modes.map(m => [m.modeId, m.name])
    );

    Object.entries(pipelineConfig.modes.color).forEach(([modeKey, modeConfig]) => {
      const figmaId = modeConfig.figmaId;
      if (!figmaColorModeIds.has(figmaId)) {
        errors.push(
          `Color mode '${modeKey}' has figmaId '${figmaId}' not found in ColorMode collection.\n` +
          `   Available mode IDs: ${colorModeCollection.modes.map(m => `${m.modeId} (${m.name})`).join(', ')}\n` +
          `   Fix: Update figmaId in config to match Figma.`
        );
      }
    });

    // Warn about unknown color modes in Figma
    if (VALIDATION_WARN_UNKNOWN) {
      const configColorModeIds = new Set(
        Object.values(pipelineConfig.modes.color).map(m => m.figmaId)
      );
      colorModeCollection.modes.forEach(mode => {
        if (!configColorModeIds.has(mode.modeId)) {
          warnings.push(
            `Figma ColorMode has mode '${mode.name}' (${mode.modeId}) not defined in config.\n` +
            `   This mode will be IGNORED during build.`
          );
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 5. Validate Density Mode IDs
  // ---------------------------------------------------------------------------
  const densityCollection = collectionMap.get(COLLECTION_IDS.DENSITY);
  if (densityCollection) {
    const figmaDensityModeIds = new Set(densityCollection.modes.map(m => m.modeId));

    Object.entries(pipelineConfig.modes.density).forEach(([modeKey, modeConfig]) => {
      const figmaId = modeConfig.figmaId;
      if (!figmaDensityModeIds.has(figmaId)) {
        errors.push(
          `Density mode '${modeKey}' has figmaId '${figmaId}' not found in Density collection.\n` +
          `   Available mode IDs: ${densityCollection.modes.map(m => `${m.modeId} (${m.name})`).join(', ')}\n` +
          `   Fix: Update figmaId in config to match Figma.`
        );
      }
    });

    // Warn about unknown density modes in Figma
    if (VALIDATION_WARN_UNKNOWN) {
      const configDensityModeIds = new Set(
        Object.values(pipelineConfig.modes.density).map(m => m.figmaId)
      );
      densityCollection.modes.forEach(mode => {
        if (!configDensityModeIds.has(mode.modeId)) {
          warnings.push(
            `Figma Density has mode '${mode.name}' (${mode.modeId}) not defined in config.\n` +
            `   This mode will be IGNORED during build.`
          );
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 6. Validate Breakpoint Mode IDs
  // ---------------------------------------------------------------------------
  const breakpointCollection = collectionMap.get(COLLECTION_IDS.BREAKPOINT_MODE);
  if (breakpointCollection) {
    const figmaBreakpointModeIds = new Set(breakpointCollection.modes.map(m => m.modeId));

    Object.entries(pipelineConfig.modes.breakpoints).forEach(([modeKey, modeConfig]) => {
      const figmaId = modeConfig.figmaId;
      if (!figmaBreakpointModeIds.has(figmaId)) {
        errors.push(
          `Breakpoint '${modeKey}' has figmaId '${figmaId}' not found in BreakpointMode collection.\n` +
          `   Available mode IDs: ${breakpointCollection.modes.map(m => `${m.modeId} (${m.name})`).join(', ')}\n` +
          `   Fix: Update figmaId in config to match Figma.`
        );
      }
    });

    // Warn about unknown breakpoint modes in Figma
    if (VALIDATION_WARN_UNKNOWN) {
      const configBreakpointModeIds = new Set(
        Object.values(pipelineConfig.modes.breakpoints).map(m => m.figmaId)
      );
      breakpointCollection.modes.forEach(mode => {
        if (!configBreakpointModeIds.has(mode.modeId)) {
          warnings.push(
            `Figma BreakpointMode has mode '${mode.name}' (${mode.modeId}) not defined in config.\n` +
            `   This mode will be IGNORED during build.`
          );
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Output results
  // ---------------------------------------------------------------------------
  if (warnings.length > 0) {
    console.log(`   ⚠️  ${warnings.length} warning(s):\n`);
    warnings.forEach((warning, i) => {
      console.log(`   ${i + 1}. ${warning}\n`);
    });
  }

  if (errors.length > 0) {
    console.log(`   ❌ ${errors.length} critical error(s):\n`);
    errors.forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}\n`);
    });

    if (VALIDATION_STRICT) {
      console.log(`\n   💥 STRICT MODE: Build aborted due to Config ↔ Figma mismatch.`);
      console.log(`   Set validation.strict: false in pipeline.config.js to continue with warnings.\n`);
    } else {
      console.log(`   ⚠️  NON-STRICT MODE: Continuing with errors (may cause unexpected output).\n`);
    }
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`   ✅ Config and Figma are in sync.\n`);
  }

  return {
    errors,
    warnings,
    valid: errors.length === 0,
  };
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
 * @param {object} context - { brandName, breakpointModeId, colorModeModeId, densityModeId }
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
  // If variable comes from Density collection, use Density mode
  else if (variable.collectionId === COLLECTION_IDS.DENSITY && context.densityModeId) {
    targetModeId = context.densityModeId;
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
 * @param {object} options - { acceptSemanticEndpoint, acceptColorModeEndpoint, acceptDensityEndpoint, acceptComponentEndpoint }
 * @returns {Object|null} - { token, collection, collectionType } or null
 */
function getDeepAliasInfo(variableId, aliasLookup, collections, context = {}, options = {}) {
  const {
    acceptSemanticEndpoint = false,    // BreakpointMode semantic tokens
    acceptColorModeEndpoint = false,   // ColorMode semantic tokens
    acceptDensityEndpoint = false,     // Density tokens
    acceptComponentEndpoint = false    // Component tokens in BreakpointMode (for typography composites)
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
    const isComponent = isComponentToken(tokenPath);

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

    // BreakpointMode collection = Semantic level (except component tokens)
    if (acceptSemanticEndpoint && variable.collectionId === COLLECTION_IDS.BREAKPOINT_MODE && !isComponent) {
      const collection = collections.find(c => c.id === variable.collectionId);
      const tokenName = variable.name.split('/').pop();

      return {
        token: tokenName,
        collection: collection ? collection.name.toLowerCase() : 'breakpointmode',
        collectionType: 'semantic',
        variableId: currentId
      };
    }

    // BreakpointMode Component tokens - endpoint if flag set (for typography composite fontSize/lineHeight)
    if (acceptComponentEndpoint && variable.collectionId === COLLECTION_IDS.BREAKPOINT_MODE && isComponent) {
      const collection = collections.find(c => c.id === variable.collectionId);
      const tokenName = variable.name.split('/').pop();

      return {
        token: tokenName,
        collection: collection ? collection.name.toLowerCase() : 'breakpointmode',
        collectionType: 'component-breakpoint',
        variableId: currentId
      };
    }

    // ColorMode collection = Semantic level (except component tokens)
    if (acceptColorModeEndpoint && variable.collectionId === COLLECTION_IDS.COLOR_MODE && !isComponent) {
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
 * Remaps fontStyle alias to fontWeight when the bound variable is semantically a fontWeight
 *
 * Figma Limitation: STRING fontWeight variables can only be bound to boundVariables.fontStyle
 * (because boundVariables.fontWeight only accepts FLOAT/NUMBER types)
 *
 * This function detects such cases by checking:
 * 1. aliases.fontStyle exists AND aliases.fontWeight does not exist
 * 2. The bound variable name contains "fontWeight" (case-insensitive)
 *
 * When detected, the alias is moved from fontStyle to fontWeight.
 * fontStyle values ('italic', 'normal') are derived from the string value,
 * not token references - they don't need aliases.
 *
 * @param {Object} aliases - The aliases object { property: aliasInfo }
 * @param {Map} aliasLookup - Variable lookup map
 * @param {Object} boundVariables - The textStyle.boundVariables object
 */
function remapFontStyleAliasToFontWeight(aliases, aliasLookup, boundVariables) {
  // Only process if fontStyle alias exists and fontWeight doesn't
  if (!aliases.fontStyle || aliases.fontWeight) {
    return;
  }

  // Check if fontStyle is bound
  const fontStyleBinding = boundVariables?.fontStyle;
  if (!fontStyleBinding || fontStyleBinding.type !== 'VARIABLE_ALIAS') {
    return;
  }

  // Get the bound variable name
  const variable = aliasLookup.get(fontStyleBinding.id);
  const variableName = variable?.name || '';

  // Check if this is a fontWeight variable bound to fontStyle
  if (/fontweight/i.test(variableName)) {
    // Move alias from fontStyle to fontWeight
    aliases.fontWeight = aliases.fontStyle;
    delete aliases.fontStyle;
  }
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

  // Dynamically build outputs - colorBrands derived from Figma data
  const colorBrands = pipelineConfig.deriveColorBrands(collections);
  const colorBrandsSet = new Set(colorBrands);
  const outputs = {};
  for (const brand of ALL_BRANDS) {
    outputs[brand] = { density: {}, breakpoints: {} };
    if (colorBrandsSet.has(brand)) {
      outputs[brand].color = {};
    }
  }

  collections.forEach(collection => {
    if (!brandCollectionIds.includes(collection.id)) return;

    console.log(`  📦 ${collection.name}`);

    // Determine category
    let category;
    if (collection.id === COLLECTION_IDS.DENSITY) category = 'density';
    else if (collection.id === COLLECTION_IDS.BREAKPOINT_MODE) category = 'breakpoints';
    else if (collection.id === COLLECTION_IDS.COLOR_MODE) category = 'color';

    // For each brand
    ALL_BRANDS.forEach(brandKey => {
      const figmaName = BRAND_TO_FIGMA_NAME[brandKey];

      // Skip ColorMode for brands without BrandColorMapping
      if (category === 'color' && !hasBrandColorMapping(collections, figmaName)) {
        return;
      }

      // Build mode entries from config (not raw Figma collection modes)
      // This ensures only configured modes are processed and output names match config keys
      let modeEntries;
      if (collection.id === COLLECTION_IDS.DENSITY) {
        modeEntries = Object.entries(DENSITY_MODES).map(([key, modeId]) => ({ name: key, modeId }));
      } else if (collection.id === COLLECTION_IDS.BREAKPOINT_MODE) {
        modeEntries = Object.entries(BREAKPOINTS).map(([key, modeId]) => ({ name: key, modeId }));
      } else {
        // ColorMode - use config-defined color modes
        modeEntries = Object.entries(COLOR_MODES).map(([key, modeId]) => ({ name: key, modeId }));
      }

      // For each configured mode
      modeEntries.forEach(mode => {
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
                brandName: figmaName,
                breakpointModeId: collection.id === COLLECTION_IDS.BREAKPOINT_MODE ? mode.modeId : undefined,
                colorModeModeId: collection.id === COLLECTION_IDS.COLOR_MODE ? mode.modeId : undefined,
                // Add modeName for ColorMode deep alias resolution (Light/Dark)
                modeName: collection.id === COLLECTION_IDS.COLOR_MODE ? mode.name : undefined
              };

              if (collection.id === COLLECTION_IDS.DENSITY) {
                context.breakpointModeId = mode.modeId;
              }

              // Extract DEEP alias info - follows chain to primitive (for CSS var() references)
              // For BreakpointMode: stop at Density level to preserve var(--density-*) references
              aliasInfo = getDeepAliasInfo(modeValue.id, aliasLookup, collections, context, {
                acceptDensityEndpoint: collection.id === COLLECTION_IDS.BREAKPOINT_MODE
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

        // Use config key as output name (already clean lowercase)
        outputs[brandKey][category][mode.name] = tokens;
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

  // Dynamically build outputs from config
  const outputs = {};
  for (const brand of ALL_BRANDS) {
    outputs[brand] = {};
  }

  collections.forEach(collection => {
    if (!overrideCollectionIds.includes(collection.id)) return;

    console.log(`  📦 ${collection.name}`);

    // Each mode is a brand - match by Figma display name
    ALL_BRANDS.forEach(brandKey => {
      const figmaName = BRAND_TO_FIGMA_NAME[brandKey];

      // Find mode by Figma display name (not ID), since each collection has its own mode IDs
      const mode = collection.modes.find(m => m.name === figmaName);

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
            // Resolve alias with brand context (brandName is used for dynamic mode lookup)
            const context = { brandName: figmaName };
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
  const componentOutputs = {};
  for (const brand of ALL_BRANDS) {
    componentOutputs[brand] = {};
  }

  collections.forEach(collection => {
    if (!componentCollectionIds.includes(collection.id)) return;

    const collectionType = getCollectionType(collection.id);
    if (!collectionType) return;

    console.log(`  📦 ${collection.name} (type: ${collectionType})`);

    // For each brand
    ALL_BRANDS.forEach(brandKey => {
      const figmaName = BRAND_TO_FIGMA_NAME[brandKey];

      // Skip ColorMode for brands without BrandColorMapping
      if (collectionType === 'color' && !hasBrandColorMapping(collections, figmaName)) {
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
        // Build mode entries from config (not raw Figma collection modes)
        let modeEntries;
        if (collection.id === COLLECTION_IDS.DENSITY) {
          modeEntries = Object.entries(DENSITY_MODES).map(([key, modeId]) => ({ name: key, modeId }));
        } else if (collection.id === COLLECTION_IDS.BREAKPOINT_MODE) {
          modeEntries = Object.entries(BREAKPOINTS).map(([key, modeId]) => ({ name: key, modeId }));
        } else {
          modeEntries = Object.entries(COLOR_MODES).map(([key, modeId]) => ({ name: key, modeId }));
        }

        // For mode-based collections (ColorMode, Density, Breakpoint)
        modeEntries.forEach(mode => {
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
                  brandName: figmaName,
                  breakpointModeId: collection.id === COLLECTION_IDS.BREAKPOINT_MODE ? mode.modeId : undefined,
                  colorModeModeId: collection.id === COLLECTION_IDS.COLOR_MODE ? mode.modeId : undefined,
                  densityModeId: collection.id === COLLECTION_IDS.DENSITY ? mode.modeId : undefined,
                  // Add modeName for ColorMode deep alias resolution (Light/Dark)
                  modeName: collection.id === COLLECTION_IDS.COLOR_MODE ? mode.name : undefined
                };

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
            const modeKey = `${collectionType}-${mode.name}`;

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
 * Resolves a direct lineHeight value from Figma textStyle format to an absolute px number.
 *
 * Figma exports lineHeight in three formats:
 * - { unit: "PIXELS", value: N } → absolute px value
 * - { unit: "PERCENT", value: N } → percentage of fontSize (e.g., 140 = 140%)
 * - { unit: "AUTO" } → browser default (no explicit lineHeight)
 *
 * @param {object} lineHeightObj - The lineHeight object from Figma textStyle
 * @param {number|null} fontSize - The resolved fontSize (needed for PERCENT conversion)
 * @returns {number|null} - Absolute px value or null (for AUTO/unresolvable)
 */
function resolveDirectLineHeight(lineHeightObj, fontSize) {
  if (!lineHeightObj || typeof lineHeightObj !== 'object') return null;

  switch (lineHeightObj.unit) {
    case 'PIXELS':
      return typeof lineHeightObj.value === 'number' ? roundNumericValue(lineHeightObj.value) : null;

    case 'PERCENT':
      if (fontSize != null && typeof fontSize === 'number' && typeof lineHeightObj.value === 'number') {
        return roundNumericValue(fontSize * (lineHeightObj.value / 100));
      }
      return null;

    case 'AUTO':
      return null;

    default:
      return null;
  }
}

/**
 * Processes Typography Composite Tokens (textStyles)
 * Generates Brand × Breakpoint matrix
 * Separates component-specific typography into component folders
 */
function processTypographyTokens(textStyles, aliasLookup, collections) {
  console.log('\n✍️  Processing Typography Composite Tokens:\n');

  const typographyOutputs = {};
  const componentTypographyOutputs = {};
  ALL_BRANDS.forEach(brand => { componentTypographyOutputs[brand] = {}; });

  // Separate component and semantic typography
  const semanticTextStyles = textStyles.filter(ts => !isComponentToken(ts.name));
  const componentTextStyles = textStyles.filter(ts => isComponentToken(ts.name));

  console.log(`  ℹ️  ${semanticTextStyles.length} semantic styles, ${componentTextStyles.length} component styles`);

  // Process semantic typography (existing logic)
  // For each brand
  ALL_BRANDS.forEach(brandKey => {
    const figmaName = BRAND_TO_FIGMA_NAME[brandKey];
    console.log(`  🏷️  Brand: ${brandKey}`);

    // For each breakpoint
    Object.entries(BREAKPOINTS).forEach(([breakpointName, breakpointModeId]) => {
      const context = {
        brandName: figmaName,
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
              // Accept Component-level (BreakpointMode) for fontSize/lineHeight cross-component references
              const acceptSemanticEndpoint = true;
              const acceptComponentEndpoint = true;

              // Extract DEEP alias info - follows chain to primitive (or semantic/component-breakpoint for typography)
              const aliasInfo = getDeepAliasInfo(alias.id, aliasLookup, collections, context, { acceptSemanticEndpoint, acceptComponentEndpoint });
              if (aliasInfo) {
                aliases[property] = aliasInfo;
              }

              const resolved = resolveAliasWithContext(alias.id, aliasLookup, context, new Set(), collections);
              resolvedStyle[property] = resolved;
            }
          });
        }

        // Remap fontStyle alias to fontWeight if the bound variable is a fontWeight
        // This fixes Figma limitation where STRING fontWeight vars must bind to fontStyle
        remapFontStyleAliasToFontWeight(aliases, aliasLookup, textStyle.boundVariables);

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

        // Fallback: Direct fontSize/lineHeight values (not in boundVariables)
        if (resolvedStyle.fontSize === null && typeof textStyle.fontSize === 'number') {
          resolvedStyle.fontSize = textStyle.fontSize;
        }
        if (resolvedStyle.lineHeight === null && textStyle.lineHeight != null) {
          resolvedStyle.lineHeight = resolveDirectLineHeight(textStyle.lineHeight, resolvedStyle.fontSize);
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

      const key = `${brandKey}-${breakpointName}`;
      typographyOutputs[key] = {
        tokens,
        brand: brandKey,
        breakpoint: breakpointName,
        breakpointModeId
      };

      console.log(`     ✅ ${key}`);
    });
  });

  // Process component typography
  if (componentTextStyles.length > 0) {
    console.log('\n  🧩 Processing Component Typography:\n');

    ALL_BRANDS.forEach(brandKey => {
      const figmaName = BRAND_TO_FIGMA_NAME[brandKey];
      console.log(`  🏷️  Brand: ${brandKey}`);

      Object.entries(BREAKPOINTS).forEach(([breakpointName, breakpointModeId]) => {
        const context = {
          brandName: figmaName,
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
                // Accept Component-level (BreakpointMode) for fontSize/lineHeight cross-component references
                const acceptSemanticEndpoint = true;
                const acceptComponentEndpoint = true;

                // Extract DEEP alias info - follows chain to primitive (or semantic/component-breakpoint for typography)
                const aliasInfo = getDeepAliasInfo(alias.id, aliasLookup, collections, context, { acceptSemanticEndpoint, acceptComponentEndpoint });
                if (aliasInfo) {
                  aliases[property] = aliasInfo;
                }

                const resolved = resolveAliasWithContext(alias.id, aliasLookup, context, new Set(), collections);
                resolvedStyle[property] = resolved;
              }
            });
          }

          // Remap fontStyle alias to fontWeight if the bound variable is a fontWeight
          // This fixes Figma limitation where STRING fontWeight vars must bind to fontStyle
          remapFontStyleAliasToFontWeight(aliases, aliasLookup, textStyle.boundVariables);

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

          // Fallback: Direct fontSize/lineHeight values (not in boundVariables)
          if (resolvedStyle.fontSize === null && typeof textStyle.fontSize === 'number') {
            resolvedStyle.fontSize = textStyle.fontSize;
          }
          if (resolvedStyle.lineHeight === null && textStyle.lineHeight != null) {
            resolvedStyle.lineHeight = resolveDirectLineHeight(textStyle.lineHeight, resolvedStyle.fontSize);
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
            const fontSizeVarName = `${COMPONENT_PREFIX}${componentName}/${baseStyleName}FontSize`;
            const lineHeightVarName = `${COMPONENT_PREFIX}${componentName}/${baseStyleName}LineHeight`;

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
  const componentEffectOutputs = {};
  ALL_BRANDS.forEach(brand => { componentEffectOutputs[brand] = {}; });

  // Separate component and semantic effects
  const semanticEffectStyles = effectStyles.filter(es => !isComponentToken(es.name));
  const componentEffectStyles = effectStyles.filter(es => isComponentToken(es.name));

  console.log(`  ℹ️  ${semanticEffectStyles.length} semantic styles, ${componentEffectStyles.length} component styles`);

  // Process semantic effects (existing logic)
  // For each brand (only ColorBrands - skip Advertorial)
  ALL_BRANDS.forEach(brandKey => {
    const figmaName = BRAND_TO_FIGMA_NAME[brandKey];
    // Skip brands without colors (effects belong to ColorBrand axis)
    if (!pipelineConfig.hasBrandColorMapping(collections, brandKey)) {
      console.log(`  ⏭️  ${brandKey}: Skipped (no ColorBrand - effects inherited from parent)`);
      return;
    }

    console.log(`  🏷️  Brand: ${brandKey}`);

    // For each ColorMode
    Object.entries(COLOR_MODES).forEach(([modeName, colorModeModeId]) => {
      const context = {
        brandName: figmaName,
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

              // Track alias info for this effect layer (all boundVariables)
              const layerAliases = {};

              // Resolve ALL boundVariables if present (color, offsetX, offsetY, radius, spread)
              if (effect.boundVariables) {
                // Map Figma property names to shadowEffect property names
                const propertyMap = {
                  color: 'color',
                  offsetX: 'offsetX',
                  offsetY: 'offsetY',
                  radius: 'radius',
                  spread: 'spread'
                };

                Object.entries(effect.boundVariables).forEach(([figmaProp, alias]) => {
                  if (alias.type === 'VARIABLE_ALIAS' && propertyMap[figmaProp]) {
                    const targetProp = propertyMap[figmaProp];

                    // For color: accept ColorMode semantic endpoint (mode-aware tokens)
                    // For dimensions: follow to primitive (mode-agnostic)
                    const isColorProperty = figmaProp === 'color';
                    const aliasInfo = getDeepAliasInfo(
                      alias.id,
                      aliasLookup,
                      collections,
                      context,
                      { acceptColorModeEndpoint: isColorProperty }
                    );

                    if (aliasInfo) {
                      layerAliases[targetProp] = aliasInfo;
                    }

                    // Resolve actual value for fallback
                    const resolved = resolveAliasWithContext(
                      alias.id,
                      aliasLookup,
                      context,
                      new Set(),
                      collections
                    );
                    shadowEffect[targetProp] = resolved;
                  }
                });
              }

              resolvedEffects.push(shadowEffect);
              // Only add to aliases if we found at least one alias
              if (Object.keys(layerAliases).length > 0) {
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

      const key = `${brandKey}-${modeName}`;
      effectOutputs[key] = {
        tokens,
        brand: brandKey,
        colorMode: modeName,
        colorModeModeId
      };

      console.log(`     ✅ ${key}`);
    });
  });

  // Process component effects (only ColorBrands - skip Advertorial)
  if (componentEffectStyles.length > 0) {
    console.log('\n  🧩 Processing Component Effects:\n');

    ALL_BRANDS.forEach(brandKey => {
      const figmaName = BRAND_TO_FIGMA_NAME[brandKey];
      // Skip brands without colors (component effects belong to ColorBrand axis)
      if (!pipelineConfig.hasBrandColorMapping(collections, brandKey)) {
        console.log(`  ⏭️  ${brandKey}: Skipped (no ColorBrand)`);
        return;
      }

      console.log(`  🏷️  Brand: ${brandKey}`);

      Object.entries(COLOR_MODES).forEach(([modeName, colorModeModeId]) => {
        const context = {
          brandName: figmaName,
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

                // Track alias info for this effect layer (all boundVariables)
                const layerAliases = {};

                // Resolve ALL boundVariables if present (color, offsetX, offsetY, radius, spread)
                if (effect.boundVariables) {
                  // Map Figma property names to shadowEffect property names
                  const propertyMap = {
                    color: 'color',
                    offsetX: 'offsetX',
                    offsetY: 'offsetY',
                    radius: 'radius',
                    spread: 'spread'
                  };

                  Object.entries(effect.boundVariables).forEach(([figmaProp, alias]) => {
                    if (alias.type === 'VARIABLE_ALIAS' && propertyMap[figmaProp]) {
                      const targetProp = propertyMap[figmaProp];

                      // For color: accept ColorMode semantic endpoint (mode-aware tokens)
                      // For dimensions: follow to primitive (mode-agnostic)
                      const isColorProperty = figmaProp === 'color';
                      const aliasInfo = getDeepAliasInfo(
                        alias.id,
                        aliasLookup,
                        collections,
                        context,
                        { acceptColorModeEndpoint: isColorProperty }
                      );

                      if (aliasInfo) {
                        layerAliases[targetProp] = aliasInfo;
                      }

                      // Resolve actual value for fallback
                      const resolved = resolveAliasWithContext(
                        alias.id,
                        aliasLookup,
                        context,
                        new Set(),
                        collections
                      );
                      shadowEffect[targetProp] = resolved;
                    }
                  });
                }

                resolvedEffects.push(shadowEffect);
                // Only add to aliases if we found at least one alias
                if (Object.keys(layerAliases).length > 0) {
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
 * Generates the Breakpoint × Density matrix for tokens that reference Density collection
 * Uses ID-based resolution (not name-based) for cross-collection references
 *
 * @param {Array} collections - All Figma collections
 * @param {Map} aliasLookup - Variable ID lookup map
 * @returns {Object} Matrix with resolved values for all Breakpoint × Density combinations
 */
function generateBreakpointDensityMatrix(collections, aliasLookup) {
  console.log('\n📊 Generating Breakpoint × Density Matrix:\n');

  const semanticMatrix = {};
  const componentMatrices = {}; // { componentName: { tokenName: { ... } } }
  let semanticCount = 0;
  let componentCount = 0;

  // Find BreakpointMode collection
  const breakpointCollection = collections.find(c => c.id === COLLECTION_IDS.BREAKPOINT_MODE);
  if (!breakpointCollection) {
    console.warn('   ⚠️  BreakpointMode collection not found');
    return { semantic: semanticMatrix, components: componentMatrices };
  }

  // Find Density collection
  const densityCollection = collections.find(c => c.id === COLLECTION_IDS.DENSITY);
  if (!densityCollection) {
    console.warn('   ⚠️  Density collection not found');
    return { semantic: semanticMatrix, components: componentMatrices };
  }

  // Process each variable in BreakpointMode
  for (const variable of breakpointCollection.variables) {
    // Check if any mode references a Density token
    let referencesDensity = false;
    for (const modeValue of Object.values(variable.valuesByMode)) {
      if (modeValue && modeValue.type === 'VARIABLE_ALIAS') {
        const referencedVar = aliasLookup.get(modeValue.id);
        if (referencedVar && referencedVar.collectionId === COLLECTION_IDS.DENSITY) {
          referencesDensity = true;
          break;
        }
      }
    }

    if (!referencesDensity) continue;

    // Extract consumer-facing token name (last segment of path)
    const tokenName = variable.name.split('/').pop();

    // Create matrix entry
    const matrixEntry = {
      path: variable.name,
      variableId: variable.id,
      values: {}
    };

    // Resolve for each Breakpoint × Density combination
    for (const [breakpointName, breakpointModeId] of Object.entries(BREAKPOINTS)) {
      matrixEntry.values[breakpointName] = {};

      for (const [densityName, densityModeId] of Object.entries(DENSITY_MODES)) {
        // Get the alias for this breakpoint
        const breakpointValue = variable.valuesByMode[breakpointModeId];

        if (breakpointValue && breakpointValue.type === 'VARIABLE_ALIAS') {
          // Resolve the full chain with density context
          const context = {
            breakpointModeId,
            densityModeId
          };

          const resolvedValue = resolveAliasWithContext(
            breakpointValue.id,
            aliasLookup,
            context,
            new Set(),
            collections
          );

          matrixEntry.values[breakpointName][densityName] = resolvedValue;
        }
      }
    }

    // Determine if this is a component token or semantic token
    if (isComponentToken(variable.name)) {
      const componentName = getComponentName(variable.name);
      if (componentName) {
        if (!componentMatrices[componentName]) {
          componentMatrices[componentName] = {};
        }
        componentMatrices[componentName][tokenName] = matrixEntry;
        componentCount++;
      }
    } else {
      semanticMatrix[tokenName] = matrixEntry;
      semanticCount++;
    }
  }

  console.log(`   ✅ Generated matrix for ${semanticCount} semantic tokens`);
  console.log(`   ✅ Generated matrix for ${componentCount} component tokens across ${Object.keys(componentMatrices).length} components`);

  return { semantic: semanticMatrix, components: componentMatrices };
}

/**
 * Saves the Breakpoint × Density matrix (semantic + components)
 */
function saveBreakpointDensityMatrix(matrixData) {
  console.log('\n💾 Saving Breakpoint × Density Matrix:\n');

  const { semantic, components } = matrixData;

  // Save semantic matrix
  const sharedDir = path.join(OUTPUT_DIR, 'shared');
  if (!fs.existsSync(sharedDir)) {
    fs.mkdirSync(sharedDir, { recursive: true });
  }

  const semanticFilePath = path.join(sharedDir, 'breakpoint-density-matrix.json');
  fs.writeFileSync(semanticFilePath, JSON.stringify(semantic, null, 2), 'utf8');
  console.log(`   ✅ Semantic: ${path.relative(process.cwd(), semanticFilePath)}`);

  // Save component matrices (per brand, per component)
  const brands = ALL_BRANDS;
  for (const brand of brands) {
    for (const [componentName, componentMatrix] of Object.entries(components)) {
      const componentDir = path.join(OUTPUT_DIR, 'brands', brand, 'components', componentName);
      if (!fs.existsSync(componentDir)) {
        fs.mkdirSync(componentDir, { recursive: true });
      }

      const componentFilePath = path.join(componentDir, 'breakpoint-density-matrix.json');
      fs.writeFileSync(componentFilePath, JSON.stringify(componentMatrix, null, 2), 'utf8');
    }
  }

  if (Object.keys(components).length > 0) {
    console.log(`   ✅ Components: ${Object.keys(components).length} component matrices saved per brand`);
  }
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
 * Enriches lineHeight tokens with pre-calculated unitless ratios for CSS output.
 *
 * Enrichment Fallback Cascade (priority order):
 * 1. variableId-Match: Build ratio map from ALL Typography Composites (semantic + component),
 *    then match standalone lineHeight tokens via their variableId
 * 2. Name-Match: *LineHeight → *FontSize in same file (all component modes: breakpoint + density)
 * 3. Composite-Value-Match: Match unmatched lineHeight values against component composites
 *    in the same brand×breakpoint context (only if unique match)
 * 4. px-Fallback: Tokens that can't be resolved stay as px (caught by custom/size/px filter)
 *
 * The $lineHeightRatio property is used by the lineHeight/unitless Style Dictionary transform.
 * Tokens with $alias referencing density/semantic collections (var() references) are skipped.
 *
 * Enrichment Fallback Cascade (priority order):
 * 1. variableId-Match: Typography Composite aliases (semantic + component)
 * 2. Name-Match: *LineHeight → *FontSize in same file (all component modes)
 * 3. Composite-Value-Match: Match lineHeight value against component composites
 * 4. px-Fallback: Tokens that can't be resolved stay as px (caught by custom/size/px filter)
 */
function enrichLineHeightTokensWithRatio(brandSpecificTokens, semanticTypography, componentTypography, componentTokens) {
  console.log('\n📐 Enriching lineHeight tokens with unitless ratios:\n');

  let enrichedSemantic = 0;
  let enrichedComponentVarId = 0;
  let enrichedComponentName = 0;
  let enrichedComponentValue = 0;
  let skippedVarRef = 0;
  let conflictCount = 0;
  const pxFallbacks = []; // Track tokens that couldn't be resolved

  // --- Stage 1: Build ratio map from ALL Typography Composites ---
  // Includes both semantic (Layer 2) and component (Layer 3) composites.
  // Key: variableId of the lineHeight alias, Value: { ratio, fontSize, lineHeight }
  // Conflict detection: if the same variableId appears with different ratios,
  // the token falls back to px output.
  const ratioMaps = {}; // Per brand×breakpoint: { variableId → { ratio, fontSize, lineHeight } }

  // Helper: Process a set of typography composites into a ratioMap
  const processComposites = (obj, ratioMap, conflicts, contextKey) => {
    if (!obj || typeof obj !== 'object') return;
    if (obj.$type === 'typography' && obj.$value && obj.$aliases) {
      const fontSize = obj.$value.fontSize;
      const lineHeight = obj.$value.lineHeight;
      const lineHeightAlias = obj.$aliases.lineHeight;

      if (fontSize && lineHeight && lineHeightAlias?.variableId) {
        const variableId = lineHeightAlias.variableId;
        const ratio = lineHeight / fontSize;

        if (conflicts.has(variableId)) return;

        if (ratioMap[variableId]) {
          const existing = ratioMap[variableId];
          if (Math.abs(existing.ratio - ratio) > 0.0001) {
            conflicts.add(variableId);
            delete ratioMap[variableId];
            conflictCount++;
            console.log(`  ⚠️  Conflict in [${contextKey}]: variableId ${variableId} has ratio ${existing.ratio.toFixed(4)} (${existing.lineHeight}/${existing.fontSize}) vs ${ratio.toFixed(4)} (${lineHeight}/${fontSize}) — px fallback`);
            return;
          }
        }

        ratioMap[variableId] = { ratio, fontSize, lineHeight };
      }
      return;
    }
    Object.values(obj).forEach(v => processComposites(v, ratioMap, conflicts, contextKey));
  };

  // Stage 1a: Semantic typography composites
  Object.entries(semanticTypography).forEach(([key, data]) => {
    if (!ratioMaps[key]) ratioMaps[key] = {};
    const conflicts = new Set();
    processComposites(data.tokens, ratioMaps[key], conflicts, key);
  });

  // Stage 1b: Component typography composites (merged into componentTokens under typography-* keys)
  // Only ADDS new entries — does not conflict with or override semantic entries from Stage 1a.
  // Component composites may use the same variableId with different ratios (e.g., Teaser headline
  // uses the same lineHeight variable with different fontSizes), but the semantic ratio is authoritative.
  Object.entries(componentTokens).forEach(([brand, components]) => {
    Object.entries(components).forEach(([componentName, modes]) => {
      Object.entries(modes).forEach(([modeKey, tokens]) => {
        if (!modeKey.startsWith('typography-')) return;
        const breakpoint = modeKey.replace('typography-', '');
        const mapKey = `${brand}-${breakpoint}`;
        if (!ratioMaps[mapKey]) ratioMaps[mapKey] = {};

        // Process component composites with separate conflict tracking
        // Only add entries that don't already exist in the ratioMap (semantic takes priority)
        const componentConflicts = new Set();
        const existingIds = new Set(Object.keys(ratioMaps[mapKey])); // Preserve semantic entries

        const processComponentComposite = (obj) => {
          if (!obj || typeof obj !== 'object') return;
          if (obj.$type === 'typography' && obj.$value && obj.$aliases) {
            const fontSize = obj.$value.fontSize;
            const lineHeight = obj.$value.lineHeight;
            const lineHeightAlias = obj.$aliases.lineHeight;

            if (fontSize && lineHeight && lineHeightAlias?.variableId) {
              const variableId = lineHeightAlias.variableId;
              const ratio = lineHeight / fontSize;

              // Skip if already set by semantic composites (Stage 1a)
              if (existingIds.has(variableId)) return;
              if (componentConflicts.has(variableId)) return;

              if (ratioMaps[mapKey][variableId]) {
                const existing = ratioMaps[mapKey][variableId];
                if (Math.abs(existing.ratio - ratio) > 0.0001) {
                  componentConflicts.add(variableId);
                  delete ratioMaps[mapKey][variableId];
                  conflictCount++;
                  console.log(`  ⚠️  Conflict in [${mapKey}/${componentName}]: variableId ${variableId} has ratio ${existing.ratio.toFixed(4)} vs ${ratio.toFixed(4)} — px fallback`);
                  return;
                }
              }

              ratioMaps[mapKey][variableId] = { ratio, fontSize, lineHeight };
            }
            return;
          }
          Object.values(obj).forEach(v => processComponentComposite(v));
        };

        processComponentComposite(tokens);
      });
    });
  });

  // --- Stage 2: variableId matching in ALL lineHeight tokens ---
  // Processes both semantic breakpoint tokens AND component breakpoint tokens

  // Stage 2a: Semantic breakpoint tokens
  Object.entries(brandSpecificTokens).forEach(([brand, categories]) => {
    if (!categories.breakpoints) return;

    Object.entries(categories.breakpoints).forEach(([modeName, tokens]) => {
      const typographyKey = `${brand}-${modeName.split('-')[0]}`;
      const ratioMap = ratioMaps[typographyKey];
      if (!ratioMap) return;

      const enrichTokens = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        Object.values(obj).forEach(value => {
          if (value && typeof value === 'object') {
            if (value.$type === 'lineHeight' && typeof value.$value === 'number') {
              if (value.$alias && ['density', 'semantic', 'component-breakpoint'].includes(value.$alias.collectionType)) {
                skippedVarRef++;
                return;
              }
              const variableId = value.$extensions?.['com.figma']?.variableId;
              if (variableId && ratioMap[variableId]) {
                value.$lineHeightRatio = ratioMap[variableId].ratio;
                enrichedSemantic++;
                return;
              }
            }
            enrichTokens(value);
          }
        });
      };
      enrichTokens(tokens);
    });
  });

  // Helper: Collect all leaf tokens (those with $type) from nested structures into flat map
  // Handles both flat tokens ({ tokenName: { $type, $value } }) and
  // grouped tokens ({ GroupName: { tokenName: { $type, $value } } })
  const collectFlatTokens = (tokens) => {
    const flat = {};
    Object.entries(tokens).forEach(([key, value]) => {
      if (!value || typeof value !== 'object') return;
      if (value.$type) {
        // Leaf token (has $type directly)
        flat[key] = value;
      } else {
        // Group: recurse one level deeper
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (subValue && typeof subValue === 'object' && subValue.$type) {
            flat[subKey] = subValue;
          }
        });
      }
    });
    return flat;
  };

  // Stage 2b: Component breakpoint tokens (variableId matching)
  Object.entries(componentTokens).forEach(([brand, components]) => {
    Object.entries(components).forEach(([componentName, modes]) => {
      Object.entries(modes).forEach(([modeKey, tokens]) => {
        if (!modeKey.startsWith('breakpoint-') && !modeKey.startsWith('density-')) return;
        if (!tokens || typeof tokens !== 'object') return;

        // Determine ratioMap key
        let breakpoint;
        if (modeKey.startsWith('breakpoint-')) {
          breakpoint = modeKey.split('-')[1]; // "breakpoint-xs-320px" → "xs"
        } else {
          breakpoint = 'xs'; // density tokens don't have breakpoint context, use xs as default
        }
        const mapKey = `${brand}-${breakpoint}`;
        const ratioMap = ratioMaps[mapKey];
        if (!ratioMap) return;

        const flatTokens = collectFlatTokens(tokens);
        Object.entries(flatTokens).forEach(([tokenName, tokenValue]) => {
          if (tokenValue.$type !== 'lineHeight') return;
          if (typeof tokenValue.$value !== 'number') return;
          if (tokenValue.$lineHeightRatio) return; // Already enriched
          if (tokenValue.$alias && ['density', 'semantic', 'component-breakpoint'].includes(tokenValue.$alias.collectionType)) {
            skippedVarRef++;
            return;
          }

          const variableId = tokenValue.$extensions?.['com.figma']?.variableId;
          if (variableId && ratioMap[variableId]) {
            tokenValue.$lineHeightRatio = ratioMap[variableId].ratio;
            enrichedComponentVarId++;
          }
        });
      });
    });
  });

  // --- Stage 3: Name-matching in ALL component mode files ---
  // Matches *LineHeight → *FontSize tokens in the same file (breakpoint + density)
  // Handles both flat and grouped token structures
  Object.entries(componentTokens).forEach(([brand, components]) => {
    Object.entries(components).forEach(([componentName, modes]) => {
      Object.entries(modes).forEach(([modeKey, tokens]) => {
        // Process breakpoint and density files (skip typography/color/effect files)
        if (!modeKey.startsWith('breakpoint-') && !modeKey.startsWith('density-')) return;
        if (!tokens || typeof tokens !== 'object') return;

        const flatTokens = collectFlatTokens(tokens);

        // Collect all fontSize tokens for name-matching
        const fontSizeMap = {};
        Object.entries(flatTokens).forEach(([tokenName, tokenValue]) => {
          if (tokenValue.$type === 'fontSize' && typeof tokenValue.$value === 'number') {
            fontSizeMap[tokenName] = tokenValue.$value;
          }
        });

        // Find lineHeight tokens not yet enriched and match by name
        Object.entries(flatTokens).forEach(([tokenName, tokenValue]) => {
          if (tokenValue.$type !== 'lineHeight') return;
          if (typeof tokenValue.$value !== 'number') return;
          if (tokenValue.$lineHeightRatio) return; // Already enriched by Stage 2

          // Name-matching: replace "LineHeight" with "FontSize" in token name
          const fontSizeTokenName = tokenName.replace(/LineHeight$/i, 'FontSize');
          if (fontSizeMap[fontSizeTokenName]) {
            const fontSize = fontSizeMap[fontSizeTokenName];
            tokenValue.$lineHeightRatio = tokenValue.$value / fontSize;
            enrichedComponentName++;
          }
        });
      });
    });
  });

  // --- Stage 4: Composite-Value-Match for remaining unmatched tokens ---
  // For lineHeight tokens still without ratio, try matching their value against
  // component typography composites in the same brand×breakpoint context.
  // Only matches if the lineHeight value is UNIQUE within that context.
  Object.entries(componentTokens).forEach(([brand, components]) => {
    Object.entries(components).forEach(([componentName, modes]) => {
      Object.entries(modes).forEach(([modeKey, tokens]) => {
        if (!modeKey.startsWith('breakpoint-')) return;
        if (!tokens || typeof tokens !== 'object') return;

        // Find still-unmatched lineHeight tokens (handle nested groups)
        const flatTokens = collectFlatTokens(tokens);
        const unmatchedTokens = [];
        Object.entries(flatTokens).forEach(([tokenName, tokenValue]) => {
          if (tokenValue.$type !== 'lineHeight') return;
          if (typeof tokenValue.$value !== 'number') return;
          if (tokenValue.$lineHeightRatio) return; // Already enriched
          if (tokenValue.$alias) return; // var() reference
          unmatchedTokens.push({ tokenName, tokenValue });
        });

        if (unmatchedTokens.length === 0) return;

        // Extract breakpoint from modeKey: "breakpoint-xs-320px" → "xs"
        const breakpoint = modeKey.split('-')[1];

        // Build a value→ratio map from ALL component typography composites in this brand×breakpoint
        // Search across ALL components (not just current one — handles cross-component references)
        const valueRatioMap = {}; // lineHeight value → { ratio, count, compositeName }
        Object.entries(components).forEach(([compName, compModes]) => {
          const typoKey = `typography-${breakpoint}`;
          if (!compModes[typoKey]) return;
          Object.entries(compModes[typoKey]).forEach(([styleName, composite]) => {
            if (!composite || composite.$type !== 'typography') return;
            const fs = composite.$value?.fontSize;
            const lh = composite.$value?.lineHeight;
            if (!fs || !lh || typeof fs !== 'number' || typeof lh !== 'number') return;

            const key = lh.toString();
            if (!valueRatioMap[key]) {
              valueRatioMap[key] = { ratio: lh / fs, fontSize: fs, lineHeight: lh, count: 1, compositeName: `${compName}/${styleName}` };
            } else {
              // Check if same ratio (compatible)
              const existing = valueRatioMap[key];
              const newRatio = lh / fs;
              if (Math.abs(existing.ratio - newRatio) > 0.0001) {
                // Different ratios for same lineHeight value — ambiguous, mark as unusable
                existing.count++;
                existing.ambiguous = true;
              } else {
                existing.count++;
              }
            }
          });
        });

        // Try to match unmatched tokens by value
        unmatchedTokens.forEach(({ tokenName, tokenValue }) => {
          const key = tokenValue.$value.toString();
          const match = valueRatioMap[key];
          if (match && !match.ambiguous) {
            tokenValue.$lineHeightRatio = match.ratio;
            enrichedComponentValue++;
          } else {
            pxFallbacks.push({ brand, component: componentName, mode: modeKey, token: tokenName, value: tokenValue.$value });
          }
        });
      });
    });
  });

  console.log(`  ✅ Semantic lineHeight tokens enriched: ${enrichedSemantic}`);
  console.log(`  ✅ Component tokens via variableId: ${enrichedComponentVarId}`);
  console.log(`  ✅ Component tokens via name-match: ${enrichedComponentName}`);
  console.log(`  ✅ Component tokens via value-match: ${enrichedComponentValue}`);
  console.log(`  ⏭️  Skipped (var() references): ${skippedVarRef}`);
  if (conflictCount > 0) {
    console.log(`  ⚠️  Conflicts detected (fallback to px): ${conflictCount}`);
  }
  if (pxFallbacks.length > 0) {
    console.log(`  ⚠️  Remaining px-fallbacks: ${pxFallbacks.length}`);
    pxFallbacks.forEach(({ brand, component, mode, token, value }) => {
      console.log(`     → ${brand}/${component} [${mode}]: ${token} = ${value}px`);
    });
  }
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

  // Validate Config ↔ Figma synchronization (bidirectional validation)
  const validationResult = validateConfigAgainstFigma(pluginData.collections);

  // Abort build in strict mode if critical errors found
  if (!validationResult.valid && VALIDATION_STRICT) {
    console.error('❌ Build aborted due to validation errors in strict mode.');
    console.error('   Run with CI=false or set validation.strict: false to continue with warnings.\n');
    process.exit(1);
  }

  // Create alias lookup
  console.log('🔍 Creating Alias Lookup...');
  const aliasLookup = createAliasLookup(pluginData.collections);
  console.log(`   ℹ️  ${aliasLookup.size} variables indexed`);

  // Derive colorBrands and contentBrands from Figma collections
  console.log('🔍 Deriving brand capabilities from Figma...');
  const colorBrands = pipelineConfig.deriveColorBrands(pluginData.collections);
  const contentBrands = pipelineConfig.deriveContentBrands(pluginData.collections);
  console.log(`   ℹ️  ColorBrands: ${colorBrands.join(', ')}`);
  console.log(`   ℹ️  ContentBrands: ${contentBrands.join(', ')}`);

  // Write metadata file for downstream scripts (build.js, bundles.js, etc.)
  const metadata = {
    generatedAt: new Date().toISOString(),
    colorBrands,
    contentBrands,
    allBrands: ALL_BRANDS,
    validation: {
      valid: validationResult.valid,
      strictMode: VALIDATION_STRICT,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
    },
  };
  const metadataPath = path.join(OUTPUT_DIR, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  console.log(`   ✅ Metadata: ${path.relative(process.cwd(), metadataPath)}`);

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

  // Enrich lineHeight tokens with unitless ratios (for CSS output)
  enrichLineHeightTokensWithRatio(brandSpecificTokens, typographyResults.semantic, typographyResults.component, componentTokens);

  // Generate Breakpoint × Density matrix (ID-based resolution)
  const breakpointDensityMatrix = generateBreakpointDensityMatrix(pluginData.collections, aliasLookup);

  // Save everything
  saveSharedPrimitives(sharedPrimitives);
  saveBrandSpecificTokens(brandSpecificTokens);
  saveBrandOverrides(brandOverrides);
  saveComponentTokens(componentTokens);
  saveTypographyTokens(typographyResults.semantic);
  saveEffectTokens(effectResults.semantic);
  saveBreakpointDensityMatrix(breakpointDensityMatrix);

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
  console.log(`   - Breakpoint × Density Matrix: ${Object.keys(breakpointDensityMatrix).length} tokens`);
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
