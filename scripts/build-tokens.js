#!/usr/bin/env node

/**
 * Build Script für Style Dictionary Token-Pipeline (v4)
 *
 * Dieses Script orchestriert den Build-Prozess für alle Token-Layers und Modes.
 */

const StyleDictionary = require('style-dictionary').default;
const fs = require('fs');
const path = require('path');

// Importiere Custom Transforms und Formats
const customConfig = require('../build-config/style-dictionary.config.js');

const TOKENS_DIR = path.join(__dirname, '../tokens');
const DIST_DIR = path.join(__dirname, '../dist');

/**
 * Mapping von Collection-IDs zu Output-Strukturen
 * Verwendet stabile Collection IDs aus Figma statt Namen für Robustheit bei Umbenennungen
 */
const COLLECTION_CONFIG = {
  // Semantic Layer - ColorMode (brand-specific)
  'colormode': {
    layer: 'semantic',
    category: 'color',
    modes: ['light', 'dark'],
    outputPrefix: 'color',
    figmaCollectionId: 'VariableCollectionId:588:1979',
    figmaCollectionName: 'ColorMode',  // Nur für Logging
    brandSpecific: true,
    brands: ['bild', 'sportbild', 'advertorial']
  },

  // Semantic Layer - BreakpointMode (brand-specific)
  'breakpointmode': {
    layer: 'semantic',
    category: 'breakpoints',
    modes: ['xs-320px', 'sm-390px-compact', 'md-600px', 'lg-1024px-regular'],
    outputPrefix: 'breakpoint',
    figmaCollectionId: 'VariableCollectionId:7017:25696',
    figmaCollectionName: 'BreakpointMode',  // Nur für Logging
    brandSpecific: true,
    brands: ['bild', 'sportbild', 'advertorial'],
    modeMapping: {
      'xs-320px': 'xs',
      'sm-390px-compact': 'sm',
      'md-600px': 'md',
      'lg-1024px-regular': 'lg'
    }
  },

  // Zwischenebene - Density (not brand-specific)
  'density': {
    layer: 'density',
    category: 'density',
    modes: ['compact', 'default', 'spacious'],
    outputPrefix: 'density',
    figmaCollectionId: 'VariableCollectionId:5695:5841',
    figmaCollectionName: 'Density',  // Nur für Logging
    brandSpecific: false
  },

  // Mapping Layer - BrandTokenMapping
  'brandtokenmapping': {
    layer: 'mapping',
    category: 'brand',
    modes: ['bild', 'sportbild', 'advertorial'],
    outputPrefix: 'brand',
    figmaCollectionId: 'VariableCollectionId:18038:10593',
    figmaCollectionName: 'BrandTokenMapping',  // Nur für Logging
    brandSpecific: false
  },

  // Mapping Layer - BrandColorMapping
  'brandcolormapping': {
    layer: 'mapping',
    category: 'brand-color',
    modes: ['bild', 'sportbild'],
    outputPrefix: 'brand-color',
    figmaCollectionId: 'VariableCollectionId:18212:14495',
    figmaCollectionName: 'BrandColorMapping',  // Nur für Logging
    brandSpecific: false
  },

  // Base Layer - Primitives
  'colorprimitive': {
    layer: 'base',
    category: 'color-primitive',
    modes: ['value'],
    outputPrefix: 'primitive-color',
    figmaCollectionId: 'VariableCollectionId:539:2238',
    figmaCollectionName: '_ColorPrimitive',  // Nur für Logging
    brandSpecific: false
  },

  'spaceprimitive': {
    layer: 'base',
    category: 'space-primitive',
    modes: ['value'],
    outputPrefix: 'primitive-space',
    figmaCollectionId: 'VariableCollectionId:2726:12077',
    figmaCollectionName: '_SpacePrimitive',  // Nur für Logging
    brandSpecific: false
  },

  'sizeprimitive': {
    layer: 'base',
    category: 'size-primitive',
    modes: ['value'],
    outputPrefix: 'primitive-size',
    figmaCollectionId: 'VariableCollectionId:4072:1817',
    figmaCollectionName: '_SizePrimitive',  // Nur für Logging
    brandSpecific: false
  },

  'fontprimitive': {
    layer: 'base',
    category: 'font-primitive',
    modes: ['value'],
    outputPrefix: 'primitive-font',
    figmaCollectionId: 'VariableCollectionId:470:1450',
    figmaCollectionName: '_FontPrimitive',  // Nur für Logging
    brandSpecific: false
  }
};

/**
 * Erstellt eine Style Dictionary Konfiguration für einen spezifischen Mode
 * @param {string} collectionDir - Verzeichnis der Collection
 * @param {string} modeName - Name des Modes
 * @param {object} config - Collection Config
 * @param {string|null} brand - Brand-Name (für brand-spezifische Builds)
 */
function createStyleDictionaryConfig(collectionDir, modeName, config, brand = null) {
  const { layer, category, outputPrefix, modeMapping, figmaCollectionId, figmaCollectionName } = config;
  const outputMode = modeMapping && modeMapping[modeName] ? modeMapping[modeName] : modeName;

  // Brand-spezifische Pfad- und Dateinamen-Anpassung
  const brandPath = brand ? `${brand}/` : '';
  const brandPrefix = brand ? `-${brand}` : '';
  const finalOutputPrefix = `${outputPrefix}${brandPrefix}`;

  // Build-Pfade je nach Layer und Brand
  const buildPathBase = brand && layer === 'semantic'
    ? `${DIST_DIR}/{{platform}}/${layer}/${brand}/${category}/`
    : `${DIST_DIR}/{{platform}}/${layer}/`;

  // Filter-Funktion: Exportiert nur Tokens der aktuellen Collection
  const tokenFilter = (token) => {
    // Für Base-Layer: Keine Filter, da keine Dependencies geladen werden
    if (layer === 'base') {
      return true;
    }

    // Für andere Layer: Nur Tokens der aktuellen Collection exportieren
    if (token.$extensions && token.$extensions['com.figma']) {
      // Verwende Collection ID (stabil) statt Name (kann sich ändern)
      return token.$extensions['com.figma'].collectionId === figmaCollectionId;
    }

    // Fallback: Token ohne Metadaten nicht exportieren (verhindert Kollisionen)
    return false;
  };

  // Token-Quelldatei (brand-spezifisch wenn brand gesetzt)
  const fileName = brand ? `${modeName}-${brand}.json` : `${modeName}.json`;
  const sourceFile = path.join(collectionDir, fileName);

  if (!fs.existsSync(sourceFile)) {
    console.warn(`⚠️  Datei nicht gefunden: ${sourceFile}`);
    return null;
  }

  // Alle Aliase wurden bereits im Preprocessing aufgelöst,
  // daher müssen keine Dependencies geladen werden
  const sourceFiles = [sourceFile];

  // Registriere Custom Transforms
  Object.entries(customConfig.transforms).forEach(([name, transform]) => {
    try {
      StyleDictionary.registerTransform(transform);
    } catch (e) {
      // Transform bereits registriert
    }
  });

  // Registriere Custom Formats
  Object.entries(customConfig.formats).forEach(([name, format]) => {
    try {
      StyleDictionary.registerFormat({
        name: name,
        format: format
      });
    } catch (e) {
      // Format bereits registriert
    }
  });

  return {
    source: sourceFiles,
    platforms: {
      // CSS Custom Properties
      css: {
        transforms: ['attribute/cti', 'name/kebab', 'color/css', 'custom/size/px'],
        buildPath: buildPathBase.replace('{{platform}}', 'css'),
        files: [{
          destination: `${finalOutputPrefix}-${outputMode}.css`,
          format: 'css/variables',
          filter: tokenFilter,
          options: {
            selector: `:root[data-${category}="${outputMode}"]`,
            mode: outputMode,
            layer: layer,
            category: category,
            brand: brand
          }
        }]
      },

      // CSS Custom Properties (global root)
      'css-global': {
        transforms: ['attribute/cti', 'name/kebab', 'color/css', 'custom/size/px'],
        buildPath: buildPathBase.replace('{{platform}}', 'css'),
        files: [{
          destination: `${finalOutputPrefix}-${outputMode}-global.css`,
          format: 'css/variables',
          filter: tokenFilter,
          options: {
            selector: ':root',
            mode: outputMode,
            layer: layer,
            category: category,
            brand: brand
          }
        }]
      },

      // SCSS Variables
      scss: {
        transforms: ['attribute/cti', 'name/kebab', 'color/css', 'custom/size/px'],
        buildPath: buildPathBase.replace('{{platform}}', 'scss'),
        files: [{
          destination: `${finalOutputPrefix}-${outputMode}.scss`,
          format: 'scss/variables',
          filter: tokenFilter,
          options: {
            mode: outputMode,
            layer: layer,
            category: category,
            brand: brand
          }
        }]
      },

      // JavaScript ES6
      js: {
        transforms: ['attribute/cti', 'name/js', 'color/css', 'custom/size/px'],
        buildPath: buildPathBase.replace('{{platform}}', 'js'),
        files: [{
          destination: `${finalOutputPrefix}-${outputMode}.js`,
          format: 'javascript/es6',
          filter: tokenFilter,
          options: {
            mode: outputMode,
            layer: layer,
            category: category,
            brand: brand
          }
        }]
      },

      // JSON (strukturiert)
      json: {
        transforms: ['attribute/cti', 'name/js', 'color/css', 'custom/size/px'],
        buildPath: buildPathBase.replace('{{platform}}', 'json'),
        files: [{
          destination: `${finalOutputPrefix}-${outputMode}.json`,
          format: 'json/nested',
          filter: tokenFilter,
          options: {
            mode: outputMode,
            layer: layer,
            category: category,
            brand: brand
          }
        }]
      },

      // iOS - Swift
      'ios-swift': {
        transforms: ['custom/color/UIColor', 'attribute/cti', 'name/ios-swift'],
        buildPath: buildPathBase.replace('{{platform}}', 'ios'),
        files: [{
          destination: `${finalOutputPrefix.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}${outputMode.charAt(0).toUpperCase() + outputMode.slice(1)}.swift`,
          format: 'ios-swift/class',
          filter: tokenFilter,
          options: {
            className: `${finalOutputPrefix.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}${outputMode.charAt(0).toUpperCase() + outputMode.slice(1)}`,
            outputReferences: false
          }
        }]
      },

      // Android - XML Resources
      android: {
        transforms: ['attribute/cti', 'name/snake', 'color/hex8android'],
        buildPath: buildPathBase.replace('{{platform}}', 'android/res/values'),
        files: [{
          destination: `${finalOutputPrefix.replace(/-/g, '_')}_${outputMode}.xml`,
          format: 'android/resources',
          filter: tokenFilter,
          options: {
            outputReferences: false
          }
        }]
      },

      // Flutter - Dart
      flutter: {
        transforms: ['attribute/cti', 'name/flutter-dart', 'color/hex8flutter'],
        buildPath: buildPathBase.replace('{{platform}}', 'flutter'),
        files: [{
          destination: `${finalOutputPrefix.replace(/-/g, '_')}_${outputMode}.dart`,
          format: 'flutter/class',
          filter: tokenFilter,
          options: {
            className: `${finalOutputPrefix.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}${outputMode.charAt(0).toUpperCase() + outputMode.slice(1)}`,
            outputReferences: false
          }
        }]
      }
    }
  };
}

/**
 * Bereinigt das Dist-Verzeichnis
 */
function cleanDist() {
  console.log('🧹 Bereinige Dist-Verzeichnis...');
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

/**
 * Rekursive Funktion zum Erstellen von Index-Dateien
 */
function createIndexFilesRecursive(dir, platform, depth = 0) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const entries = fs.readdirSync(dir);

  // Prüfe, ob es Subdirectories gibt
  const subdirs = entries.filter(e => {
    const fullPath = path.join(dir, e);
    return fs.statSync(fullPath).isDirectory();
  });

  // Wenn Subdirectories existieren, rekursiv durchgehen
  if (subdirs.length > 0) {
    subdirs.forEach(subdir => {
      createIndexFilesRecursive(path.join(dir, subdir), platform, depth + 1);
    });
  }

  // Erstelle Index-Datei für aktuelles Verzeichnis
  const files = entries
    .filter(f => f.endsWith(`.${platform}`) && !f.includes('-global') && f !== `index.${platform}`)
    .sort();

  if (files.length === 0) return;

  let indexContent = '';
  const layerName = path.basename(dir);

  if (platform === 'css') {
    indexContent = `/**\n * ${layerName.toUpperCase()} - CSS Index\n */\n\n`;
    files.forEach(file => {
      indexContent += `@import './${file}';\n`;
    });
  } else if (platform === 'scss') {
    indexContent = `//\n// ${layerName.toUpperCase()} - SCSS Index\n//\n\n`;
    files.forEach(file => {
      indexContent += `@import './${file}';\n`;
    });
  } else if (platform === 'js') {
    indexContent = `/**\n * ${layerName.toUpperCase()} - JavaScript Index\n */\n\n`;
    files.forEach(file => {
      const varName = file.replace('.js', '').replace(/-/g, '_');
      indexContent += `import ${varName} from './${file}';\n`;
    });
    indexContent += `\nexport {\n`;
    files.forEach(file => {
      const varName = file.replace('.js', '').replace(/-/g, '_');
      indexContent += `  ${varName},\n`;
    });
    indexContent += `};\n`;
  }

  if (indexContent) {
    fs.writeFileSync(path.join(dir, `index.${platform}`), indexContent, 'utf8');
  }
}

/**
 * Erstellt Index-Dateien für jede Platform
 */
function createIndexFiles() {
  console.log('\n📝 Erstelle Index-Dateien...');

  const platforms = ['css', 'scss', 'js', 'json']; // iOS, Android, Flutter don't need index files
  const layers = ['base', 'mapping', 'density', 'semantic'];

  platforms.forEach(platform => {
    const platformDir = path.join(DIST_DIR, platform);

    if (!fs.existsSync(platformDir)) {
      return;
    }

    // Erstelle Index für jede Layer innerhalb der Platform (rekursiv)
    layers.forEach(layer => {
      const layerDir = path.join(platformDir, layer);
      createIndexFilesRecursive(layerDir, platform);
    });

    console.log(`  ✅ Index-Dateien erstellt für Platform: ${platform}`);
  });
}

/**
 * Erstellt eine Gesamt-Übersicht
 */
function createManifest() {
  console.log('\n📋 Erstelle Manifest...');

  const manifest = {
    generated: new Date().toISOString(),
    version: '1.0.0',
    platforms: {}
  };

  const platforms = ['css', 'scss', 'js', 'json', 'ios', 'android', 'flutter'];
  const layers = ['base', 'mapping', 'density', 'semantic'];

  platforms.forEach(platform => {
    const platformDir = path.join(DIST_DIR, platform);

    if (!fs.existsSync(platformDir)) {
      return;
    }

    manifest.platforms[platform] = {
      layers: {}
    };

    layers.forEach(layer => {
      const layerDir = path.join(platformDir, layer);

      if (!fs.existsSync(layerDir)) {
        return;
      }

      const files = fs.readdirSync(layerDir)
        .filter(f => !f.startsWith('index'))
        .sort();

      if (files.length > 0) {
        manifest.platforms[platform].layers[layer] = {
          files: files,
          path: `dist/${platform}/${layer}/`
        };
      }
    });
  });

  // Zähle Statistiken
  manifest.statistics = {
    totalFiles: 0,
    byPlatform: {}
  };

  platforms.forEach(platform => {
    if (manifest.platforms[platform]) {
      let count = 0;
      Object.values(manifest.platforms[platform].layers).forEach(layer => {
        count += layer.files.length;
      });
      manifest.statistics.byPlatform[platform] = count;
      manifest.statistics.totalFiles += count;
    }
  });

  fs.writeFileSync(
    path.join(DIST_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  console.log('  ✅ Manifest erstellt: dist/manifest.json');
}

/**
 * Hauptfunktion
 */
async function main() {
  console.log('🎨 ============================================');
  console.log('   BILD Design System - Token Build');
  console.log('   ============================================\n');

  // Bereinige Dist
  cleanDist();

  // Prüfe, ob Tokens-Verzeichnis existiert
  if (!fs.existsSync(TOKENS_DIR)) {
    console.error('❌ Tokens-Verzeichnis nicht gefunden!');
    console.error('   Führe zuerst "npm run preprocess" aus.\n');
    process.exit(1);
  }

  // Liste alle Collections
  const collections = fs.readdirSync(TOKENS_DIR)
    .filter(f => {
      const fullPath = path.join(TOKENS_DIR, f);
      return fs.statSync(fullPath).isDirectory();
    });

  console.log(`📦 Gefundene Collections: ${collections.length}\n`);

  let totalBuilds = 0;
  let successfulBuilds = 0;

  // Verarbeite jede Collection
  for (const collectionName of collections) {
    const config = COLLECTION_CONFIG[collectionName];

    if (!config) {
      console.log(`⚠️  Keine Config für Collection: ${collectionName} (überspringe)`);
      continue;
    }

    console.log(`\n📦 Collection: ${collectionName}`);
    console.log(`   Layer: ${config.layer}`);
    console.log(`   Modes: ${config.modes.join(', ')}`);

    const collectionDir = path.join(TOKENS_DIR, collectionName);

    // Prüfe, ob Collection brand-spezifisch ist
    if (config.brandSpecific) {
      // Erstelle Build für jede Brand + Mode Kombination
      for (const brand of config.brands) {
        console.log(`\n   🏷️  Brand: ${brand}`);

        for (const modeName of config.modes) {
          const sdConfig = createStyleDictionaryConfig(collectionDir, modeName, config, brand);

          if (!sdConfig) {
            continue;
          }

          try {
            totalBuilds++;
            const sd = new StyleDictionary(sdConfig);
            await sd.buildAllPlatforms();
            successfulBuilds++;

            const outputMode = config.modeMapping && config.modeMapping[modeName]
              ? config.modeMapping[modeName]
              : modeName;

            console.log(`      ✅ ${config.outputPrefix}-${brand}-${outputMode}`);
          } catch (error) {
            console.error(`      ❌ Fehler bei ${brand}-${modeName}:`);
            console.error(`         Message: ${error.message || 'undefined'}`);
            console.error(`         Error: ${error}`);
          }
        }
      }
    } else {
      // Standard-Build ohne Brand-Spezifikation
      for (const modeName of config.modes) {
        const sdConfig = createStyleDictionaryConfig(collectionDir, modeName, config);

        if (!sdConfig) {
          continue;
        }

        try {
          totalBuilds++;
          const sd = new StyleDictionary(sdConfig);
          await sd.buildAllPlatforms();
          successfulBuilds++;

          const outputMode = config.modeMapping && config.modeMapping[modeName]
            ? config.modeMapping[modeName]
            : modeName;

          console.log(`   ✅ ${config.outputPrefix}-${outputMode}`);
        } catch (error) {
          console.error(`   ❌ Fehler bei ${modeName}:`);
          console.error(`      Message: ${error.message || 'undefined'}`);
          console.error(`      Error: ${error}`);
        }
      }
    }
  }

  // Erstelle Index-Dateien
  createIndexFiles();

  // Erstelle Manifest
  createManifest();

  // Zusammenfassung
  console.log('\n✨ ============================================');
  console.log('   Build abgeschlossen!');
  console.log('   ============================================\n');
  console.log(`📊 Statistiken:`);
  console.log(`   - Collections verarbeitet: ${collections.length}`);
  console.log(`   - Builds erfolgreich: ${successfulBuilds}/${totalBuilds}`);
  console.log(`   - Output-Verzeichnis: dist/\n`);
  console.log(`📁 Neue Brand-Spezifische Struktur:`);
  console.log(`   - dist/css/         → CSS Custom Properties`);
  console.log(`     ├── base/         → Primitive Tokens`);
  console.log(`     ├── mapping/      → Brand-Mappings`);
  console.log(`     ├── density/      → Density-Variationen`);
  console.log(`     └── semantic/     → Brand-Spezifische Tokens`);
  console.log(`         ├── bild/`);
  console.log(`         │   ├── color/          (color-bild-light, color-bild-dark)`);
  console.log(`         │   └── breakpoints/    (breakpoint-bild-xs, -sm, -md, -lg)`);
  console.log(`         ├── sportbild/`);
  console.log(`         │   ├── color/`);
  console.log(`         │   └── breakpoints/`);
  console.log(`         └── advertorial/`);
  console.log(`             ├── color/`);
  console.log(`             └── breakpoints/`);
  console.log(``);
  console.log(`   - dist/scss/        → SCSS Variables (gleiche Struktur)`);
  console.log(`   - dist/js/          → JavaScript ES6 Modules`);
  console.log(`   - dist/json/        → JSON (strukturiert)`);
  console.log(`   - dist/ios/         → iOS Swift Classes`);
  console.log(`   - dist/android/     → Android XML Resources`);
  console.log(`   - dist/flutter/     → Flutter Dart Classes`);
  console.log('');
}

// Führe Script aus
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fehler beim Build:', error);
    process.exit(1);
  });
}

module.exports = { main };
