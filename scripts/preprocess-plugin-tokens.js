#!/usr/bin/env node

/**
 * Preprocessing Script für Custom Plugin Export
 *
 * Dieses Script transformiert den Plugin-Export in eine Style Dictionary-kompatible Struktur.
 * Es verarbeitet sowohl klassische Tokens als auch Composite Tokens (Typography & Effects).
 *
 * Features:
 * - Verarbeitet Hex-Farben direkt (bereits im Input)
 * - Fixt FontWeight-px-Bug
 * - Context-aware Alias Resolution (Brand × Breakpoint/ColorMode)
 * - Generiert Brand × Breakpoint Matrix für Typography
 * - Generiert Brand × ColorMode Matrix für Effects
 */

const fs = require('fs');
const path = require('path');

// Pfade
const INPUT_JSON_PATH = path.join(__dirname, '../src/design-tokens/bild-design-system-raw-data.json');
const OUTPUT_DIR = path.join(__dirname, '../tokens');

// Brand und Mode Mappings
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

// Collection IDs (stabil)
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
 * Lädt die Plugin JSON Datei
 */
function loadPluginTokens() {
  console.log('📥 Lade Plugin Token-Datei...');
  const data = fs.readFileSync(INPUT_JSON_PATH, 'utf8');
  return JSON.parse(data);
}

/**
 * Erstellt ein Alias-Lookup-Map für schnellere Referenzauflösung
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
 * Fixt den FontWeight-px-Bug
 * Input: "700px" → Output: 700
 */
function fixFontWeightValue(value, tokenPath, resolvedType) {
  // Nur für FontWeight-Tokens
  if (resolvedType === 'FLOAT' && tokenPath.toLowerCase().includes('fontweight')) {
    if (typeof value === 'string' && value.endsWith('px')) {
      const numericValue = parseInt(value.replace('px', ''), 10);
      return numericValue;
    }
  }
  return value;
}

/**
 * Konvertiert Figma RGBA-Farbobjekt zu Hex/RGBA-String
 */
function colorToHex(color) {
  if (typeof color === 'string') {
    // Bereits ein String (Hex oder RGB)
    return color;
  }

  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a !== undefined ? color.a : 1;

  if (a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Verarbeitet einen Wert basierend auf Typ
 */
function processDirectValue(value, resolvedType, tokenPath = '') {
  // Fix FontWeight-px-Bug
  const fixedValue = fixFontWeightValue(value, tokenPath, resolvedType);

  switch (resolvedType) {
    case 'COLOR':
      return colorToHex(fixedValue);
    case 'FLOAT':
    case 'STRING':
    case 'BOOLEAN':
      return fixedValue;
    default:
      return fixedValue;
  }
}

/**
 * Löst einen Alias-Wert mit Context auf
 * @param {string} variableId - Variable ID
 * @param {Map} aliasLookup - Lookup Map
 * @param {object} context - { brandModeId, breakpointModeId, colorModeModeId }
 * @param {Set} visited - Zirkelschutz
 */
function resolveAliasWithContext(variableId, aliasLookup, context = {}, visited = new Set()) {
  const variable = aliasLookup.get(variableId);

  if (!variable) {
    console.warn(`⚠️  Variable nicht gefunden: ${variableId}`);
    return `UNRESOLVED_${variableId}`;
  }

  if (visited.has(variableId)) {
    console.warn(`⚠️  Zirkuläre Referenz: ${variable.name}`);
    return `CIRCULAR_REF_${variableId}`;
  }

  visited.add(variableId);

  // Bestimme den richtigen Mode basierend auf Collection und Context
  let targetModeId = null;

  // Wenn Variable aus Breakpoint-Collection kommt, nutze Breakpoint-Mode
  if (variable.collectionId === COLLECTION_IDS.BREAKPOINT_MODE && context.breakpointModeId) {
    targetModeId = context.breakpointModeId;
  }
  // Wenn Variable aus ColorMode-Collection kommt, nutze ColorMode
  else if (variable.collectionId === COLLECTION_IDS.COLOR_MODE && context.colorModeModeId) {
    targetModeId = context.colorModeModeId;
  }
  // Wenn Variable aus Brand-Collection kommt, nutze Brand-Mode
  else if ((variable.collectionId === COLLECTION_IDS.BRAND_TOKEN_MAPPING ||
             variable.collectionId === COLLECTION_IDS.BRAND_COLOR_MAPPING) && context.brandModeId) {
    targetModeId = context.brandModeId;
  }
  // Sonst: nimm ersten verfügbaren Mode
  else {
    const modes = Object.keys(variable.valuesByMode);
    targetModeId = modes[0];
  }

  let value = variable.valuesByMode[targetModeId];

  // Fallback wenn Mode nicht existiert
  if (value === undefined || value === null) {
    const modes = Object.keys(variable.valuesByMode);
    if (modes.length > 0) {
      targetModeId = modes[0];
      value = variable.valuesByMode[targetModeId];
    }
  }

  if (value === undefined || value === null) {
    console.warn(`⚠️  Kein Wert für ${variable.name} in Mode ${targetModeId}`);
    return `NO_VALUE_${variableId}`;
  }

  // Wenn Wert selbst ein Alias ist, rekursiv auflösen
  if (value.type === 'VARIABLE_ALIAS') {
    return resolveAliasWithContext(value.id, aliasLookup, context, visited);
  }

  // Direkten Wert verarbeiten
  return processDirectValue(value, variable.resolvedType, variable.name);
}

/**
 * Bestimmt den Token-Typ für Style Dictionary
 */
function determineTokenType(tokenName, collectionName, value) {
  const tokenPath = tokenName.toLowerCase();
  const collection = collectionName.toLowerCase();

  // Color
  if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
    return { $type: 'color' };
  }

  // String-Werte: kein $type
  if (typeof value === 'string' && !value.endsWith('px')) {
    return { $type: null };
  }

  // FontWeight
  if (tokenPath.includes('fontweight') || tokenPath.includes('font-weight')) {
    return { $type: 'fontWeight' };
  }

  // Dimension-Typen (nur wenn numerisch oder px-String)
  if (typeof value === 'number' || (typeof value === 'string' && value.endsWith('px'))) {
    if (tokenPath.includes('fontsize') || tokenPath.includes('font-size')) {
      return { $type: 'dimension' };
    }
    if (tokenPath.includes('lineheight') || tokenPath.includes('line-height')) {
      if (typeof value === 'number' && value < 10) {
        return { $type: 'number' }; // Relative LineHeight
      }
      return { $type: 'dimension' };
    }
    if (collection.includes('size') || collection.includes('space') ||
        collection.includes('breakpoint') || collection.includes('density') ||
        tokenPath.includes('width') || tokenPath.includes('height')) {
      return { $type: 'dimension' };
    }
  }

  return { $type: null };
}

/**
 * Konvertiert Token-Namen zu verschachteltem Pfad
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
 * Setzt einen Wert in verschachtelten Objekt-Pfad
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
 * Verarbeitet klassische Token-Collections
 */
function processClassicTokens(collections, aliasLookup) {
  console.log('\n📋 Verarbeite klassische Token-Collections:\n');

  const collectionOutputs = {};

  collections.forEach(collection => {
    console.log(`  📦 ${collection.name}`);

    const results = {};
    const modeMetadata = {};

    // Initialisiere Objekte für jeden Mode
    collection.modes.forEach(mode => {
      results[mode.name] = {};
      modeMetadata[mode.name] = mode.modeId;
    });

    // Verarbeite jede Variable
    collection.variables.forEach(variable => {
      const pathArray = variable.name.split('/').filter(part => part);

      collection.modes.forEach(mode => {
        const modeValue = variable.valuesByMode[mode.modeId];

        if (modeValue !== undefined && modeValue !== null) {
          let processedValue;

          // Wenn Alias, löse vollständig auf (NICHT Style Dictionary Syntax)
          if (modeValue.type === 'VARIABLE_ALIAS') {
            // Bestimme Context basierend auf Collection
            let context = {};

            if (collection.id === COLLECTION_IDS.COLOR_MODE) {
              context.colorModeModeId = mode.modeId;
            } else if (collection.id === COLLECTION_IDS.BREAKPOINT_MODE) {
              context.breakpointModeId = mode.modeId;
            } else if (collection.id === COLLECTION_IDS.BRAND_TOKEN_MAPPING ||
                       collection.id === COLLECTION_IDS.BRAND_COLOR_MAPPING) {
              context.brandModeId = mode.modeId;
            } else if (collection.id === COLLECTION_IDS.DENSITY) {
              context.breakpointModeId = mode.modeId; // Density nutzt Breakpoints
            }

            // Vollständige rekursive Auflösung
            processedValue = resolveAliasWithContext(modeValue.id, aliasLookup, context, new Set());
          } else {
            // Direkter Wert
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

            // Setze $type
            if (variable.resolvedType === 'COLOR') {
              tokenObject.$type = 'color';
            } else {
              const typeInfo = determineTokenType(variable.name, collection.name, processedValue);
              if (typeInfo.$type) {
                tokenObject.$type = typeInfo.$type;
              }
            }

            if (variable.description) {
              tokenObject.comment = variable.description;
            }

            setNestedPath(results[mode.name], pathArray, tokenObject);
          }
        }
      });
    });

    collectionOutputs[collection.name] = {
      results,
      modeMetadata,
      collectionId: collection.id
    };
  });

  return collectionOutputs;
}

/**
 * Verarbeitet Typography Composite Tokens (textStyles)
 * Generiert Brand × Breakpoint Matrix
 */
function processTypographyTokens(textStyles, aliasLookup) {
  console.log('\n✍️  Verarbeite Typography Composite Tokens:\n');

  const typographyOutputs = {};

  // Für jeden Brand
  Object.entries(BRANDS).forEach(([brandName, brandModeId]) => {
    console.log(`  🏷️  Brand: ${brandName}`);

    // Für jeden Breakpoint
    Object.entries(BREAKPOINTS).forEach(([breakpointName, breakpointModeId]) => {
      const context = {
        brandModeId,
        breakpointModeId
      };

      const tokens = {};

      textStyles.forEach(textStyle => {
        const styleName = textStyle.name.split('/').pop(); // z.B. "display1"
        const category = textStyle.name.split('/').slice(-2, -1)[0]; // z.B. "Display"

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

        // Resolve boundVariables
        if (textStyle.boundVariables) {
          Object.entries(textStyle.boundVariables).forEach(([property, alias]) => {
            if (alias.type === 'VARIABLE_ALIAS') {
              const resolved = resolveAliasWithContext(alias.id, aliasLookup, context, new Set());
              resolvedStyle[property] = resolved;
            }
          });
        }

        // Fallback zu direkten Werten
        if (!resolvedStyle.fontFamily && textStyle.fontName) {
          resolvedStyle.fontFamily = textStyle.fontName.family;
        }

        // Token-Struktur: category/styleName
        const pathArray = [category.toLowerCase(), styleName.toLowerCase()];

        setNestedPath(tokens, pathArray, {
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
        });
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

  return typographyOutputs;
}

/**
 * Verarbeitet Effect Composite Tokens (effectStyles)
 * Generiert Brand × ColorMode Matrix
 */
function processEffectTokens(effectStyles, aliasLookup) {
  console.log('\n🎨 Verarbeite Effect Composite Tokens:\n');

  const effectOutputs = {};

  // Für jeden Brand
  Object.entries(BRANDS).forEach(([brandName, brandModeId]) => {
    console.log(`  🏷️  Brand: ${brandName}`);

    // Für jeden ColorMode
    Object.entries(COLOR_MODES).forEach(([modeName, colorModeModeId]) => {
      const context = {
        brandModeId,
        colorModeModeId
      };

      const tokens = {};

      effectStyles.forEach(effectStyle => {
        const styleName = effectStyle.name.split('/').pop();
        const category = effectStyle.name.split('/').slice(-2, -1)[0];

        const resolvedEffects = [];

        if (effectStyle.effects && Array.isArray(effectStyle.effects)) {
          effectStyle.effects.forEach(effect => {
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

              // Resolve boundVariables wenn vorhanden
              if (effect.boundVariables && effect.boundVariables.color) {
                if (effect.boundVariables.color.type === 'VARIABLE_ALIAS') {
                  const resolved = resolveAliasWithContext(
                    effect.boundVariables.color.id,
                    aliasLookup,
                    context,
                    new Set()
                  );
                  shadowEffect.color = resolved;
                }
              }

              resolvedEffects.push(shadowEffect);
            }
          });
        }

        const pathArray = [category.toLowerCase(), styleName.toLowerCase()];

        setNestedPath(tokens, pathArray, {
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
        });
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

  return effectOutputs;
}

/**
 * Speichert verarbeitete Tokens
 */
function saveClassicTokens(collectionOutputs, aliasLookup) {
  console.log('\n💾 Speichere klassische Tokens:\n');

  Object.entries(collectionOutputs).forEach(([collectionName, data]) => {
    const cleanName = collectionName
      .replace(/^_/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '');

    const collectionDir = path.join(OUTPUT_DIR, 'classic', cleanName);
    if (!fs.existsSync(collectionDir)) {
      fs.mkdirSync(collectionDir, { recursive: true });
    }

    Object.entries(data.results).forEach(([modeName, tokens]) => {
      const fileName = modeName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[()]/g, '')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '');

      const filePath = path.join(collectionDir, `${fileName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2), 'utf8');
      console.log(`  ✅ ${path.relative(process.cwd(), filePath)}`);
    });
  });
}

/**
 * Speichert Typography Tokens
 */
function saveTypographyTokens(typographyOutputs) {
  console.log('\n💾 Speichere Typography Tokens:\n');

  const typographyDir = path.join(OUTPUT_DIR, 'typography');
  if (!fs.existsSync(typographyDir)) {
    fs.mkdirSync(typographyDir, { recursive: true });
  }

  Object.entries(typographyOutputs).forEach(([key, data]) => {
    const fileName = `${key}.json`;
    const filePath = path.join(typographyDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(data.tokens, null, 2), 'utf8');
    console.log(`  ✅ ${path.relative(process.cwd(), filePath)}`);
  });
}

/**
 * Speichert Effect Tokens
 */
function saveEffectTokens(effectOutputs) {
  console.log('\n💾 Speichere Effect Tokens:\n');

  const effectsDir = path.join(OUTPUT_DIR, 'effects');
  if (!fs.existsSync(effectsDir)) {
    fs.mkdirSync(effectsDir, { recursive: true });
  }

  Object.entries(effectOutputs).forEach(([key, data]) => {
    const fileName = `${key}.json`;
    const filePath = path.join(effectsDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(data.tokens, null, 2), 'utf8');
    console.log(`  ✅ ${path.relative(process.cwd(), filePath)}`);
  });
}

/**
 * Hauptfunktion
 */
function main() {
  console.log('🚀 Starte Plugin Token Preprocessing...\n');

  // Leere Output-Verzeichnis
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Lade Plugin Tokens
  const pluginData = loadPluginTokens();

  // Erstelle Alias-Lookup
  console.log('🔍 Erstelle Alias-Lookup...');
  const aliasLookup = createAliasLookup(pluginData.collections);
  console.log(`   ℹ️  ${aliasLookup.size} Variablen indexiert`);

  // Verarbeite klassische Tokens
  const classicTokens = processClassicTokens(pluginData.collections, aliasLookup);

  // Verarbeite Composite Tokens
  const typographyTokens = processTypographyTokens(pluginData.textStyles || [], aliasLookup);
  const effectTokens = processEffectTokens(pluginData.effectStyles || [], aliasLookup);

  // Speichere alles
  saveClassicTokens(classicTokens, aliasLookup);
  saveTypographyTokens(typographyTokens);
  saveEffectTokens(effectTokens);

  // Statistiken
  console.log('\n✨ Preprocessing abgeschlossen!\n');
  console.log(`📊 Statistiken:`);
  console.log(`   - Collections: ${Object.keys(classicTokens).length}`);
  console.log(`   - Typography Outputs: ${Object.keys(typographyTokens).length}`);
  console.log(`   - Effect Outputs: ${Object.keys(effectTokens).length}`);
  console.log(`   - Output-Verzeichnis: ${path.relative(process.cwd(), OUTPUT_DIR)}\n`);
}

// Führe Script aus
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Fehler beim Preprocessing:', error);
    process.exit(1);
  }
}

module.exports = { main };
