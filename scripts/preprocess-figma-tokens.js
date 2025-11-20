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
 * Konvertiert Figma-Farbwerte in Hex-Format
 */
function colorToHex(color) {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a !== undefined ? color.a : 1;

  if (a < 1) {
    // RGBA Format
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
 * Löst alle Alias-Referenzen rekursiv auf
 */
function resolveAliasValue(aliasString, aliasLookup, modeId, visited = new Set()) {
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

  // Hole den Wert für den aktuellen Mode
  let referencedValue = referencedToken.valuesByMode[modeId];

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
      return resolveAliasValue(`{${nestedAliasPath}}`, aliasLookup, modeId, visited);
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
 * Löst alle Aliase in einem Token-Objekt rekursiv auf
 */
function resolveAliasesInTokens(tokens, aliasLookup, modeId) {
  for (const key in tokens) {
    const token = tokens[key];

    if (typeof token === 'object' && token !== null) {
      // Wenn es ein Token-Objekt mit value ist
      if (token.value !== undefined) {
        // Prüfe, ob der Wert ein Alias ist
        if (typeof token.value === 'string' && token.value.match(/^\{.+\}$/)) {
          const resolvedValue = resolveAliasValue(token.value, aliasLookup, modeId);
          token.value = resolvedValue;
        }
      } else {
        // Rekursiv für verschachtelte Objekte
        resolveAliasesInTokens(token, aliasLookup, modeId);
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
                collectionName: collection.name,
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
 * Speichert die verarbeiteten Tokens
 */
function saveTokens(collectionName, modeTokens, aliasLookup, modeMetadata) {
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

  // Speichere jeden Mode als separate Datei
  Object.entries(modeTokens).forEach(([modeName, tokens]) => {
    // Löse alle Aliase auf
    const modeId = modeMetadata[modeName];
    if (modeId) {
      resolveAliasesInTokens(tokens, aliasLookup, modeId);
    }

    // Bereinige Dateinamen: entferne alle Nicht-Alphanumerische Zeichen außer Bindestriche
    const cleanName = modeName
      .toLowerCase()
      .replace(/\s+/g, '-')           // Leerzeichen zu Bindestrichen
      .replace(/[()]/g, '')            // Entferne Klammern
      .replace(/[^a-z0-9-]/g, '-')     // Ersetze ungültige Zeichen
      .replace(/--+/g, '-')            // Mehrfache Bindestriche zu einem
      .replace(/^-|-$/g, '');          // Entferne führende/folgende Bindestriche

    const fileName = `${cleanName}.json`;
    const filePath = path.join(collectionDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(tokens, null, 2), 'utf8');
    console.log(`    ✅ Gespeichert: ${path.relative(process.cwd(), filePath)}`);
  });
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

  // Verarbeite jede Collection
  console.log('\n📋 Verarbeite Collections:\n');

  figmaData.collections.forEach(collection => {
    const { results, modeMetadata } = processCollection(collection, aliasLookup);
    saveTokens(collection.name, results, aliasLookup, modeMetadata);
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
