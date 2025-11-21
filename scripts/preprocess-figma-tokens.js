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

/**
 * Bestimmt den Token-Typ basierend auf Collection-Namen und Token-Pfad
 * Style Dictionary nutzt den $type für transforms (z.B. um px hinzuzufügen)
 *
 * @param {string} tokenName - Der Token-Name/Pfad (z.B. "FontWeight/1000UltraFontWeight")
 * @param {string} collectionName - Der Name der Collection (z.B. "_SizePrimitive", "_FontPrimitive")
 * @param {any} value - Der Token-Wert
 * @returns {object} - Objekt mit $type für Style Dictionary
 */
function determineTokenType(tokenName, collectionName, value) {
  const tokenPath = tokenName.toLowerCase();
  const collection = collectionName.toLowerCase();

  // Color: Hex (#) oder RGBA/RGB Farben
  if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
    return { $type: 'color' };
  }

  // WICHTIG: Wenn der Wert ein String ist (außer Farben), setze keinen dimension type
  if (typeof value === 'string') {
    // Font Families und andere Strings: kein $type
    return { $type: null };
  }

  // FontWeight: Bleibt unitless
  if (tokenPath.includes('fontweight') || tokenPath.includes('font-weight')) {
    return { $type: 'fontWeight' };
  }

  // FontSize: Dimension (Style Dictionary fügt px hinzu) - nur wenn numerisch!
  if (tokenPath.includes('fontsize') || tokenPath.includes('font-size')) {
    if (typeof value === 'number') {
      return { $type: 'dimension' };
    }
  }

  // LineHeight: < 10 = unitless (relative), >= 10 = dimension (absolut)
  if (tokenPath.includes('lineheight') || tokenPath.includes('line-height')) {
    if (typeof value === 'number' && value < 10) {
      return { $type: 'number' };  // Relativer LineHeight-Wert
    } else if (typeof value === 'number') {
      return { $type: 'dimension' };  // Absoluter LineHeight-Wert
    }
  }

  // Size Tokens: Dimension - nur wenn numerisch!
  if (collection.includes('size') || tokenPath.includes('size')) {
    // Ausnahme: wenn es FontSize ist, wurde es bereits oben behandelt
    if (!tokenPath.includes('fontsize') && !tokenPath.includes('font-size')) {
      if (typeof value === 'number') {
        return { $type: 'dimension' };
      }
    }
  }

  // Space/Spacing Tokens: Dimension - nur wenn numerisch!
  if (collection.includes('space') || tokenPath.includes('space') || tokenPath.includes('spacing')) {
    if (typeof value === 'number') {
      return { $type: 'dimension' };
    }
  }

  // Breakpoints: Dimension - nur wenn numerisch!
  if (collection.includes('breakpoint') || tokenPath.includes('breakpoint')) {
    if (typeof value === 'number') {
      return { $type: 'dimension' };
    }
  }

  // Density: Dimension - nur wenn numerisch!
  if (collection.includes('density') || tokenPath.includes('density')) {
    if (typeof value === 'number') {
      return { $type: 'dimension' };
    }
  }

  // Width/Height: Dimension - nur wenn numerisch!
  if (tokenPath.includes('width') || tokenPath.includes('height')) {
    if (typeof value === 'number') {
      return { $type: 'dimension' };
    }
  }

  // Fallback: Keine spezielle Behandlung
  return { $type: null };
}

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
  // WICHTIG: Prüfe auf undefined/null, nicht auf falsy (0, false, "" sind valide Werte!)
  if (value === undefined || value === null) return null;

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

  // Finde das referenzierte Token
  let referencedToken = null;
  let referencedTokenId = null;
  for (const [id, tokenData] of aliasLookup.entries()) {
    const tokenPath = tokenData.name
      .split('/')
      .filter(part => part && !part.startsWith('_'))
      .join('.');

    if (tokenPath === aliasPath) {
      referencedToken = tokenData;
      referencedTokenId = id;
      break;
    }
  }

  if (!referencedToken) {
    console.warn(`⚠️  Alias-Referenz nicht gefunden: ${aliasPath} - wird als unaufgelöster String beibehalten`);
    // Entferne geschweifte Klammern, damit Style Dictionary nicht versucht, es aufzulösen
    return `UNRESOLVED_MISSING_TOKEN__${aliasPath.replace(/\./g, '_')}`;
  }

  // Zirkuläre Referenz-Erkennung (verwende Variable-ID statt Name, da gleiche Namen in verschiedenen Collections existieren können)
  if (visited.has(referencedTokenId)) {
    console.warn(`⚠️  Zirkuläre Referenz erkannt: ${aliasPath} - wird als unaufgelöster String beibehalten`);
    // Entferne geschweifte Klammern, damit Style Dictionary nicht versucht, es aufzulösen
    return `UNRESOLVED_CIRCULAR_REF__${aliasPath.replace(/\./g, '_')}`;
  }

  visited.add(referencedTokenId);

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
  // WICHTIG: Prüfe auf undefined/null, nicht auf falsy (0, false, "" sind valide Werte!)
  if (referencedValue === undefined || referencedValue === null) {
    const availableModes = Object.keys(referencedToken.valuesByMode);
    if (availableModes.length > 0) {
      const fallbackModeId = availableModes[0];
      referencedValue = referencedToken.valuesByMode[fallbackModeId];
      // console.log(`   ℹ️  Fallback Mode für ${aliasPath}: ${fallbackModeId}`);
    }
  }

  if (referencedValue === undefined || referencedValue === null) {
    console.warn(`⚠️  Kein Wert verfügbar: ${aliasPath} - wird als unaufgelöster String beibehalten`);
    // Entferne geschweifte Klammern, damit Style Dictionary nicht versucht, es aufzulösen
    return `UNRESOLVED_NO_VALUE__${aliasPath.replace(/\./g, '_')}`;
  }

  // Wenn der referenzierte Wert selbst ein Alias ist, löse rekursiv auf
  if (referencedValue.type === 'VARIABLE_ALIAS') {
    const nestedTokenId = referencedValue.id;
    const nestedToken = aliasLookup.get(nestedTokenId);

    if (!nestedToken) {
      console.warn(`⚠️  Verschachtelter Alias nicht gefunden: ${nestedTokenId}`);
      return `UNRESOLVED_NESTED_ALIAS__${nestedTokenId}`;
    }

    // Zirkuläre Referenz-Erkennung für verschachtelten Alias
    if (visited.has(nestedTokenId)) {
      const nestedAliasPath = nestedToken.name
        .split('/')
        .filter(part => part && !part.startsWith('_'))
        .join('.');
      console.warn(`⚠️  Zirkuläre Referenz erkannt: ${nestedAliasPath}`);
      return `UNRESOLVED_CIRCULAR_REF__${nestedAliasPath.replace(/\./g, '_')}`;
    }

    visited.add(nestedTokenId);

    // Bestimme Mode-ID für verschachtelte Referenz
    let nestedModeId = targetModeId;
    if (targetBrand && brandModeMap[nestedToken.collectionId]) {
      if (brandModeMap[nestedToken.collectionId][targetBrand]) {
        nestedModeId = brandModeMap[nestedToken.collectionId][targetBrand];
      }
    }

    // Hole Wert für verschachtelten Token
    let nestedValue = nestedToken.valuesByMode[nestedModeId];

    // Fallback
    if (nestedValue === undefined || nestedValue === null) {
      const availableModes = Object.keys(nestedToken.valuesByMode);
      if (availableModes.length > 0) {
        nestedModeId = availableModes[0];
        nestedValue = nestedToken.valuesByMode[nestedModeId];
      }
    }

    if (nestedValue === undefined || nestedValue === null) {
      const nestedAliasPath = nestedToken.name
        .split('/')
        .filter(part => part && !part.startsWith('_'))
        .join('.');
      console.warn(`⚠️  Kein Wert verfügbar für verschachtelten Alias: ${nestedAliasPath}`);
      return `UNRESOLVED_NO_VALUE__${nestedAliasPath.replace(/\./g, '_')}`;
    }

    // Wenn verschachtelter Wert auch ein Alias ist, rekursiv weiter
    if (nestedValue.type === 'VARIABLE_ALIAS') {
      // Rekursiv weiter (visited wird übergeben!)
      const furtherNestedTokenId = nestedValue.id;
      const furtherNestedToken = aliasLookup.get(furtherNestedTokenId);
      if (furtherNestedToken) {
        const furtherNestedAliasPath = furtherNestedToken.name
          .split('/')
          .filter(part => part && !part.startsWith('_'))
          .join('.');
        return resolveAliasValue(`{${furtherNestedAliasPath}}`, aliasLookup, nestedModeId, brandModeMap, targetBrand, visited);
      }
    }

    // Konvertiere finalen verschachtelten Wert
    const processedNestedValue = processDirectValue(nestedValue, nestedToken.resolvedType);
    return processedNestedValue;
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
      if (token.value !== undefined || token.$value !== undefined) {
        const valueToResolve = token.$value !== undefined ? token.$value : token.value;

        // Prüfe, ob der Wert ein Alias ist
        if (typeof valueToResolve === 'string' && valueToResolve.match(/^\{.+\}$/)) {
          const resolvedValue = resolveAliasValue(valueToResolve, aliasLookup, modeId, brandModeMap, targetBrand);

          // Update both value and $value
          if (token.$value !== undefined) {
            token.$value = resolvedValue;
          }
          if (token.value !== undefined) {
            token.value = resolvedValue;
          }
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
        let processedValue = processValue(modeValue, variable.resolvedType, aliasLookup);

        if (processedValue !== null) {
          // Behalte den Wert numerisch - Style Dictionary transforms fügen Units hinzu
          // Nur den type anpassen wenn wir einen speziellen $type haben
          let finalType = TYPE_MAPPING[variable.resolvedType] || 'other';

          const tokenObject = {
            $value: processedValue,  // DTCG spec requires $value
            value: processedValue,   // Keep for backward compatibility
            type: finalType,
            $extensions: {
              'com.figma': {
                collectionId: collection.id,  // Stabile ID
                collectionName: collection.name,  // Für Logging
                variableId: variable.id
              }
            }
          };

          // Setze $type basierend auf Figma's resolvedType und determineTokenType
          // Für Farben: Nutze resolvedType, auch wenn der aktuelle Wert ein Alias ist
          if (variable.resolvedType === 'COLOR') {
            tokenObject.$type = 'color';
          } else {
            // Für andere Typen: Nutze determineTokenType basierend auf Wert und Name
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
