#!/usr/bin/env node

/**
 * Preprocessing Script für Figma Variable Visualizer Export
 *
 * Dieses Script transformiert den Figma-Export in eine Style Dictionary-kompatible Struktur.
 * Es erstellt separate Token-Dateien für verschiedene Layers und Modes.
 */

const fs = require('fs');
const path = require('path');

// Pfade
const FIGMA_JSON_PATH = path.join(__dirname, '../src/design-tokens/BILD Design System-variables-full.json');
const OUTPUT_DIR = path.join(__dirname, '../tokens');

// Mapping von Figma-Typen zu Style Dictionary Typen
const TYPE_MAPPING = {
  'COLOR': 'color',
  'FLOAT': 'number',
  'STRING': 'string',
  'BOOLEAN': 'boolean'
};

// Brand-spezifische Collections Konfiguration
// Verwendet stabile Collection IDs aus Figma statt Namen für Robustheit bei Umbenennungen
const BRAND_SPECIFIC_COLLECTIONS = {
  'VariableCollectionId:588:1979': {  // ColorMode
    collectionName: 'ColorMode',  // Nur für Logging
    brandSpecific: true,
    brands: ['bild', 'sportbild', 'advertorial'],
    brandCollectionIds: ['VariableCollectionId:18038:10593', 'VariableCollectionId:18212:14495']  // BrandTokenMapping, BrandColorMapping
  },
  'VariableCollectionId:7017:25696': {  // BreakpointMode
    collectionName: 'BreakpointMode',  // Nur für Logging
    brandSpecific: true,
    brands: ['bild', 'sportbild', 'advertorial'],
    brandCollectionIds: ['VariableCollectionId:18038:10593']  // BrandTokenMapping
  }
};

/**
 * Lädt die Figma JSON Datei
 */
function loadFigmaTokens() {
  console.log('📥 Lade Figma Token-Datei...');
  const data = fs.readFileSync(FIGMA_JSON_PATH, 'utf8');
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
        collectionId: collection.id,  // Stabile ID
        collectionName: collection.name,  // Für Logging
        valuesByMode: variable.valuesByMode,
        resolvedType: variable.resolvedType,
        description: variable.description
      });
    });
  });

  return lookup;
}

/**
 * Erstellt Brand → Mode-ID Mappings für Brand-Collections
 */
function createBrandModeMapping(collections) {
  const brandModeMap = {};

  // Brand Collection IDs
  const BRAND_COLLECTION_IDS = [
    'VariableCollectionId:18038:10593',  // BrandTokenMapping
    'VariableCollectionId:18212:14495'   // BrandColorMapping
  ];

  collections.forEach(collection => {
    if (BRAND_COLLECTION_IDS.includes(collection.id)) {
      brandModeMap[collection.id] = {};

      collection.modes.forEach(mode => {
        const brandName = mode.name.toLowerCase();
        brandModeMap[collection.id][brandName] = mode.modeId;
      });
    }
  });

  return brandModeMap;
}

/**
 * Konvertiert Figma-Farbwerte in Hex-Format
 */
function colorToHex(color) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a !== undefined ? color.a : 1;

  if (a < 1) {
    // RGBA Format für Transparenz
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  // Hex Format
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Konvertiert einen Token-Namen in einen Style Dictionary-kompatiblen Pfad
 */
function convertTokenName(name) {
  // Entfernt Prefix-Slashes und konvertiert zu Kebab-Case
  return name
    .split('/')
    .filter(part => part && !part.startsWith('_'))
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-');
}

/**
 * Erstellt einen verschachtelten Token-Objekt-Pfad
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
 * Verarbeitet einen Token-Wert
 */
function processValue(value, resolvedType, aliasLookup) {
  if (!value) return null;

  // Alias-Referenz
  if (value.type === 'VARIABLE_ALIAS') {
    const referencedVar = aliasLookup.get(value.id);
    if (referencedVar) {
      // Erstelle Style Dictionary Alias-Syntax
      const aliasPath = referencedVar.name
        .split('/')
        .filter(part => part && !part.startsWith('_'))
        .join('.');
      return `{${aliasPath}}`;
    }
    return null;
  }

  // Direkte Werte basierend auf Typ
  switch (resolvedType) {
    case 'COLOR':
      return colorToHex(value);
    case 'FLOAT':
      return value;
    case 'STRING':
      return value;
    case 'BOOLEAN':
      return value;
    default:
      return value;
  }
}

/**
 * Löst alle Alias-Referenzen rekursiv auf (brand-aware)
 * @param {string} aliasString - Alias im Format {path.to.token}
 * @param {Map} aliasLookup - Lookup-Map aller Tokens
 * @param {string} modeId - Aktuelle Mode-ID
 * @param {object} brandModeMap - Mapping von Brand-Namen zu Mode-IDs in Brand-Collections
 * @param {string|null} targetBrand - Ziel-Brand (z.B. 'bild', 'sportbild')
 * @param {Set} visited - Besuchte Tokens (Zirkelschutz)
 */
function resolveAliasValue(aliasString, aliasLookup, modeId, brandModeMap, targetBrand = null, visited = new Set()) {
  // Extrahiere Token-Pfad aus {path.to.token} Syntax
  const match = aliasString.match(/^\{(.+)\}$/);
  if (!match) {
    // Kein Alias, gib Wert zurück
    return aliasString;
  }

  const aliasPath = match[1];

  // Zirkuläre Referenz-Erkennung
  if (visited.has(aliasPath)) {
    console.warn(`⚠️  Zirkuläre Referenz erkannt: ${aliasPath} - wird als unaufgelöster String beibehalten`);
    // Entferne geschweifte Klammern, damit Style Dictionary nicht versucht, es aufzulösen
    return `UNRESOLVED_CIRCULAR_REF__${aliasPath.replace(/\./g, '_')}`;
  }

  visited.add(aliasPath);

  // Finde das referenzierte Token
  let referencedToken = null;
  for (const [id, tokenData] of aliasLookup.entries()) {
    const tokenPath = tokenData.name
      .split('/')
      .filter(part => part && !part.startsWith('_'))
      .join('.');

    if (tokenPath === aliasPath) {
      referencedToken = tokenData;
      break;
    }
  }

  if (!referencedToken) {
    console.warn(`⚠️  Alias-Referenz nicht gefunden: ${aliasPath} - wird als unaufgelöster String beibehalten`);
    // Entferne geschweifte Klammern, damit Style Dictionary nicht versucht, es aufzulösen
    return `UNRESOLVED_MISSING_TOKEN__${aliasPath.replace(/\./g, '_')}`;
  }

  // Bestimme den richtigen Mode-ID basierend auf der Collection
  let targetModeId = modeId;

  // Wenn das referenzierte Token aus einer Brand-Collection kommt, verwende den Brand-spezifischen Mode
  // Verwende Collection ID (stabil) statt Name (kann sich ändern)
  if (targetBrand && brandModeMap[referencedToken.collectionId]) {
    if (brandModeMap[referencedToken.collectionId][targetBrand]) {
      targetModeId = brandModeMap[referencedToken.collectionId][targetBrand];
    }
  }

  // Hole den Wert für den richtigen Mode
  let referencedValue = referencedToken.valuesByMode[targetModeId];

  // Fallback: Wenn der spezifische Mode nicht existiert, nutze den ersten verfügbaren Mode
  if (!referencedValue) {
    const availableModes = Object.keys(referencedToken.valuesByMode);
    if (availableModes.length > 0) {
      const fallbackModeId = availableModes[0];
      referencedValue = referencedToken.valuesByMode[fallbackModeId];
      // console.log(`   ℹ️  Fallback Mode für ${aliasPath}: ${fallbackModeId}`);
    }
  }

  if (!referencedValue) {
    console.warn(`⚠️  Kein Wert verfügbar: ${aliasPath} - wird als unaufgelöster String beibehalten`);
    // Entferne geschweifte Klammern, damit Style Dictionary nicht versucht, es aufzulösen
    return `UNRESOLVED_NO_VALUE__${aliasPath.replace(/\./g, '_')}`;
  }

  // Wenn der referenzierte Wert selbst ein Alias ist, löse rekursiv auf
  if (referencedValue.type === 'VARIABLE_ALIAS') {
    const nestedAliasLookup = aliasLookup.get(referencedValue.id);
    if (nestedAliasLookup) {
      const nestedAliasPath = nestedAliasLookup.name
        .split('/')
        .filter(part => part && !part.startsWith('_'))
        .join('.');
      return resolveAliasValue(`{${nestedAliasPath}}`, aliasLookup, targetModeId, brandModeMap, targetBrand, visited);
    }
  }

  // Konvertiere den finalen Wert
  const processedValue = processDirectValue(referencedValue, referencedToken.resolvedType);
  return processedValue;
}

/**
 * Verarbeitet einen direkten Wert (nicht-Alias)
 */
function processDirectValue(value, resolvedType) {
  switch (resolvedType) {
    case 'COLOR':
      return colorToHex(value);
    case 'FLOAT':
      return value;
    case 'STRING':
      return value;
    case 'BOOLEAN':
      return value;
    default:
      return value;
  }
}

/**
 * Löst alle Aliase in einem Token-Objekt rekursiv auf (brand-aware)
 */
function resolveAliasesInTokens(tokens, aliasLookup, modeId, brandModeMap, targetBrand = null) {
  for (const key in tokens) {
    const token = tokens[key];

    if (typeof token === 'object' && token !== null) {
      // Wenn es ein Token-Objekt mit value ist
      if (token.value !== undefined) {
        // Prüfe, ob der Wert ein Alias ist
        if (typeof token.value === 'string' && token.value.match(/^\{.+\}$/)) {
          const resolvedValue = resolveAliasValue(token.value, aliasLookup, modeId, brandModeMap, targetBrand);
          token.value = resolvedValue;
        }
      } else {
        // Rekursiv für verschachtelte Objekte
        resolveAliasesInTokens(token, aliasLookup, modeId, brandModeMap, targetBrand);
      }
    }
  }
}

/**
 * Verarbeitet eine Collection und erstellt Token-Objekte für jeden Mode
 */
function processCollection(collection, aliasLookup) {
  console.log(`  📦 Verarbeite Collection: ${collection.name}`);

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

    // Verarbeite jeden Mode
    collection.modes.forEach(mode => {
      const modeValue = variable.valuesByMode[mode.modeId];

      if (modeValue !== undefined) {
        const processedValue = processValue(modeValue, variable.resolvedType, aliasLookup);

        if (processedValue !== null) {
          const tokenObject = {
            value: processedValue,
            type: TYPE_MAPPING[variable.resolvedType] || 'other',
            $extensions: {
              'com.figma': {
                collectionId: collection.id,  // Stabile ID
                collectionName: collection.name,  // Für Logging
                variableId: variable.id
              }
            }
          };

          if (variable.description) {
            tokenObject.comment = variable.description;
          }

          setNestedPath(results[mode.name], pathArray, tokenObject);
        }
      }
    });
  });

  return { results, modeMetadata };
}

/**
 * Speichert die verarbeiteten Tokens (brand-aware)
 */
function saveTokens(collectionId, collectionName, modeTokens, aliasLookup, modeMetadata, brandModeMap) {
  // Erstelle Unterverzeichnis für Collection
  // Entferne führenden Unterstrich und bereinige den Namen
  const cleanCollectionName = collectionName
    .replace(/^_/, '')                 // Entferne führenden Unterstrich
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');

  const collectionDir = path.join(OUTPUT_DIR, cleanCollectionName);

  if (!fs.existsSync(collectionDir)) {
    fs.mkdirSync(collectionDir, { recursive: true });
  }

  // Prüfe, ob Collection brand-spezifisch ist (verwende Collection ID statt Name)
  const brandConfig = BRAND_SPECIFIC_COLLECTIONS[collectionId];

  if (brandConfig && brandConfig.brandSpecific) {
    // Brand-spezifische Collection: Erstelle separate Dateien für jede Brand
    console.log(`    🏷️  Brand-spezifische Collection erkannt`);

    Object.entries(modeTokens).forEach(([modeName, originalTokens]) => {
      const modeId = modeMetadata[modeName];

      // Für jede Brand eine separate Datei erstellen
      brandConfig.brands.forEach(brand => {
        // Deep Clone der Tokens für jede Brand
        const tokens = JSON.parse(JSON.stringify(originalTokens));

        // Löse Aliase mit brand-spezifischem Mode auf
        if (modeId) {
          resolveAliasesInTokens(tokens, aliasLookup, modeId, brandModeMap, brand);
        }

        // Bereinige Dateinamen
        const cleanName = modeName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[()]/g, '')
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/--+/g, '-')
          .replace(/^-|-$/g, '');

        const fileName = `${cleanName}-${brand}.json`;
        const filePath = path.join(collectionDir, fileName);

        fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2), 'utf8');
        console.log(`    ✅ Gespeichert: ${path.relative(process.cwd(), filePath)} (Brand: ${brand})`);
      });
    });
  } else {
    // Normale Collection: Standard-Verhalten
    Object.entries(modeTokens).forEach(([modeName, tokens]) => {
      // Löse alle Aliase auf (ohne brand-spezifischen Mode)
      const modeId = modeMetadata[modeName];
      if (modeId) {
        resolveAliasesInTokens(tokens, aliasLookup, modeId, brandModeMap);
      }

      // Bereinige Dateinamen
      const cleanName = modeName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[()]/g, '')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '');

      const fileName = `${cleanName}.json`;
      const filePath = path.join(collectionDir, fileName);

      fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2), 'utf8');
      console.log(`    ✅ Gespeichert: ${path.relative(process.cwd(), filePath)}`);
    });
  }
}

/**
 * Hauptfunktion
 */
function main() {
  console.log('🚀 Starte Figma Token Preprocessing...\n');

  // Leere Output-Verzeichnis
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Lade Figma Tokens
  const figmaData = loadFigmaTokens();

  // Erstelle Alias-Lookup
  console.log('🔍 Erstelle Alias-Lookup...');
  const aliasLookup = createAliasLookup(figmaData.collections);

  // Erstelle Brand-Mode-Mapping
  console.log('🏷️  Erstelle Brand-Mode-Mapping...');
  const brandModeMap = createBrandModeMapping(figmaData.collections);
  console.log(`    ℹ️  Brand-Modes: ${JSON.stringify(brandModeMap, null, 2)}\n`);

  // Verarbeite jede Collection
  console.log('📋 Verarbeite Collections:\n');

  figmaData.collections.forEach(collection => {
    const { results, modeMetadata } = processCollection(collection, aliasLookup);
    saveTokens(collection.id, collection.name, results, aliasLookup, modeMetadata, brandModeMap);
  });

  // Erstelle Index-Datei mit Metadaten
  const metadata = {
    generated: new Date().toISOString(),
    source: 'Figma Variable Visualizer',
    lastModified: figmaData.lastModified,
    collections: figmaData.collections.map(c => ({
      name: c.name,
      modes: c.modes.map(m => m.name),
      variableCount: c.variables.length
    }))
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, '_metadata.json'),
    JSON.stringify(metadata, null, 2),
    'utf8'
  );

  console.log('\n✨ Preprocessing abgeschlossen!\n');
  console.log(`📊 Statistiken:`);
  console.log(`   - Collections verarbeitet: ${figmaData.collections.length}`);
  console.log(`   - Tokens gesamt: ${figmaData.collections.reduce((sum, c) => sum + c.variables.length, 0)}`);
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
