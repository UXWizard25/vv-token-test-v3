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
 * Mapping von Collection-Namen zu Output-Strukturen
 */
const COLLECTION_CONFIG = {
  // Semantic Layer - ColorMode
  'colormode': {
    layer: 'semantic',
    category: 'color',
    modes: ['light', 'dark'],
    outputPrefix: 'color',
    figmaCollectionName: 'ColorMode'
  },

  // Semantic Layer - BreakpointMode
  'breakpointmode': {
    layer: 'semantic',
    category: 'breakpoint',
    modes: ['xs-320px', 'sm-390px-compact', 'md-600px', 'lg-1024px-regular'],
    outputPrefix: 'breakpoint',
    figmaCollectionName: 'BreakpointMode',
    modeMapping: {
      'xs-320px': 'xs',
      'sm-390px-compact': 'sm',
      'md-600px': 'md',
      'lg-1024px-regular': 'lg'
    }
  },

  // Zwischenebene - Density
  'density': {
    layer: 'density',
    category: 'density',
    modes: ['compact', 'default', 'spacious'],
    outputPrefix: 'density',
    figmaCollectionName: 'Density'
  },

  // Mapping Layer - BrandTokenMapping
  'brandtokenmapping': {
    layer: 'mapping',
    category: 'brand',
    modes: ['bild', 'sportbild', 'advertorial'],
    outputPrefix: 'brand',
    figmaCollectionName: 'BrandTokenMapping'
  },

  // Mapping Layer - BrandColorMapping
  'brandcolormapping': {
    layer: 'mapping',
    category: 'brand-color',
    modes: ['bild', 'sportbild'],
    outputPrefix: 'brand-color',
    figmaCollectionName: 'BrandColorMapping'
  },

  // Base Layer - Primitives
  'colorprimitive': {
    layer: 'base',
    category: 'color-primitive',
    modes: ['value'],
    outputPrefix: 'primitive-color',
    figmaCollectionName: '_ColorPrimitive'
  },

  'spaceprimitive': {
    layer: 'base',
    category: 'space-primitive',
    modes: ['value'],
    outputPrefix: 'primitive-space',
    figmaCollectionName: '_SpacePrimitive'
  },

  'sizeprimitive': {
    layer: 'base',
    category: 'size-primitive',
    modes: ['value'],
    outputPrefix: 'primitive-size',
    figmaCollectionName: '_SizePrimitive'
  },

  'fontprimitive': {
    layer: 'base',
    category: 'font-primitive',
    modes: ['value'],
    outputPrefix: 'primitive-font',
    figmaCollectionName: '_FontPrimitive'
  }
};

/**
 * Erstellt eine Style Dictionary Konfiguration für einen spezifischen Mode
 */
function createStyleDictionaryConfig(collectionDir, modeName, config) {
  const { layer, category, outputPrefix, modeMapping, figmaCollectionName } = config;
  const outputMode = modeMapping && modeMapping[modeName] ? modeMapping[modeName] : modeName;

  // Filter-Funktion: Exportiert nur Tokens der aktuellen Collection
  const tokenFilter = (token) => {
    // Für Base-Layer: Keine Filter, da keine Dependencies geladen werden
    if (layer === 'base') {
      return true;
    }

    // Für andere Layer: Nur Tokens der aktuellen Collection exportieren
    if (token.$extensions && token.$extensions['com.figma']) {
      return token.$extensions['com.figma'].collectionName === figmaCollectionName;
    }

    // Fallback: Token ohne Metadaten nicht exportieren (verhindert Kollisionen)
    return false;
  };

  // Token-Quelldatei
  const sourceFile = path.join(collectionDir, `${modeName}.json`);

  if (!fs.existsSync(sourceFile)) {
    console.warn(`⚠️  Datei nicht gefunden: ${sourceFile}`);
    return null;
  }

  // Für nicht-Base-Layer: Lade auch alle Primitive Tokens als Dependencies
  const sourceFiles = [sourceFile];

  if (layer !== 'base') {
    // Füge alle Primitive Token-Dateien hinzu, damit Aliase aufgelöst werden können
    const primitiveCollections = ['colorprimitive', 'spaceprimitive', 'sizeprimitive', 'fontprimitive'];

    primitiveCollections.forEach(primitiveName => {
      const primitiveFile = path.join(TOKENS_DIR, primitiveName, 'value.json');
      if (fs.existsSync(primitiveFile)) {
        sourceFiles.push(primitiveFile);
      }
    });

    // Für Semantic Layer: Füge auch Mapping und Density hinzu
    if (layer === 'semantic') {
      // Brand Mappings
      const brandCollections = ['brandtokenmapping', 'brandcolormapping'];
      brandCollections.forEach(brandName => {
        const brandDir = path.join(TOKENS_DIR, brandName);
        if (fs.existsSync(brandDir)) {
          const brandModes = fs.readdirSync(brandDir).filter(f => f.endsWith('.json'));
          brandModes.forEach(modeFile => {
            sourceFiles.push(path.join(brandDir, modeFile));
          });
        }
      });

      // Density
      const densityDir = path.join(TOKENS_DIR, 'density');
      if (fs.existsSync(densityDir)) {
        const densityModes = fs.readdirSync(densityDir).filter(f => f.endsWith('.json'));
        densityModes.forEach(modeFile => {
          sourceFiles.push(path.join(densityDir, modeFile));
        });
      }
    }
  }

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
        transforms: ['attribute/cti', 'name/kebab', 'color/css'],
        buildPath: `${DIST_DIR}/css/${layer}/`,
        files: [{
          destination: `${outputPrefix}-${outputMode}.css`,
          format: 'css/variables',
          filter: tokenFilter,
          options: {
            selector: `:root[data-${category}="${outputMode}"]`,
            mode: outputMode,
            layer: layer,
            category: category
          }
        }]
      },

      // CSS Custom Properties (global root)
      'css-global': {
        transforms: ['attribute/cti', 'name/kebab', 'color/css'],
        buildPath: `${DIST_DIR}/css/${layer}/`,
        files: [{
          destination: `${outputPrefix}-${outputMode}-global.css`,
          format: 'css/variables',
          filter: tokenFilter,
          options: {
            selector: ':root',
            mode: outputMode,
            layer: layer,
            category: category
          }
        }]
      },

      // SCSS Variables
      scss: {
        transforms: ['attribute/cti', 'name/kebab', 'color/css'],
        buildPath: `${DIST_DIR}/scss/${layer}/`,
        files: [{
          destination: `${outputPrefix}-${outputMode}.scss`,
          format: 'scss/variables',
          filter: tokenFilter,
          options: {
            mode: outputMode,
            layer: layer,
            category: category
          }
        }]
      },

      // JavaScript ES6
      js: {
        transforms: ['attribute/cti', 'name/js', 'color/css'],
        buildPath: `${DIST_DIR}/js/${layer}/`,
        files: [{
          destination: `${outputPrefix}-${outputMode}.js`,
          format: 'javascript/es6',
          filter: tokenFilter,
          options: {
            mode: outputMode,
            layer: layer,
            category: category
          }
        }]
      },

      // JSON (strukturiert)
      json: {
        transforms: ['attribute/cti', 'name/js', 'color/css'],
        buildPath: `${DIST_DIR}/json/${layer}/`,
        files: [{
          destination: `${outputPrefix}-${outputMode}.json`,
          format: 'json/nested',
          filter: tokenFilter,
          options: {
            mode: outputMode,
            layer: layer,
            category: category
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
 * Erstellt Index-Dateien für jede Platform
 */
function createIndexFiles() {
  console.log('\n📝 Erstelle Index-Dateien...');

  const platforms = ['css', 'scss', 'js', 'json'];
  const layers = ['base', 'mapping', 'density', 'semantic'];

  platforms.forEach(platform => {
    const platformDir = path.join(DIST_DIR, platform);

    if (!fs.existsSync(platformDir)) {
      return;
    }

    // Erstelle Index für jede Layer innerhalb der Platform
    layers.forEach(layer => {
      const layerDir = path.join(platformDir, layer);

      if (!fs.existsSync(layerDir)) {
        return;
      }

      const files = fs.readdirSync(layerDir)
        .filter(f => f.endsWith(`.${platform}`) && !f.includes('-global') && f !== 'index' + `.${platform}`)
        .sort();

      if (files.length === 0) return;

      let indexContent = '';

      if (platform === 'css') {
        indexContent = `/**\n * ${layer.toUpperCase()} Layer - CSS Index\n * Importiert alle Token-Dateien dieser Layer\n */\n\n`;
        files.forEach(file => {
          indexContent += `@import './${file}';\n`;
        });
      } else if (platform === 'scss') {
        indexContent = `//\n// ${layer.toUpperCase()} Layer - SCSS Index\n// Importiert alle Token-Dateien dieser Layer\n//\n\n`;
        files.forEach(file => {
          indexContent += `@import './${file}';\n`;
        });
      } else if (platform === 'js') {
        indexContent = `/**\n * ${layer.toUpperCase()} Layer - JavaScript Index\n * Exportiert alle Token-Objekte dieser Layer\n */\n\n`;
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
        fs.writeFileSync(path.join(layerDir, `index.${platform}`), indexContent, 'utf8');
      }
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

  const platforms = ['css', 'scss', 'js', 'json'];
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

    // Erstelle Build für jeden Mode
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
        console.error(`   ❌ Fehler bei ${modeName}:`, error.message);
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
  console.log(`📁 Neue Struktur (nach Platform):`);
  console.log(`   - dist/css/         → CSS Custom Properties`);
  console.log(`     ├── base/         → Primitive Tokens`);
  console.log(`     ├── mapping/      → Brand-Tokens`);
  console.log(`     ├── density/      → Density-Variationen`);
  console.log(`     └── semantic/     → ColorMode, BreakpointMode`);
  console.log(``);
  console.log(`   - dist/scss/        → SCSS Variables`);
  console.log(`   - dist/js/          → JavaScript ES6 Modules`);
  console.log(`   - dist/json/        → JSON (strukturiert)`);
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
