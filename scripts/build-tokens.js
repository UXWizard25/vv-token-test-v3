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
    outputPrefix: 'color'
  },

  // Semantic Layer - BreakpointMode
  'breakpointmode': {
    layer: 'semantic',
    category: 'breakpoint',
    modes: ['xs-320px', 'sm-390px-compact', 'md-600px', 'lg-1024px-regular'],
    outputPrefix: 'breakpoint',
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
    outputPrefix: 'density'
  },

  // Mapping Layer - BrandTokenMapping
  'brandtokenmapping': {
    layer: 'mapping',
    category: 'brand',
    modes: ['bild', 'sportbild', 'advertorial'],
    outputPrefix: 'brand'
  },

  // Mapping Layer - BrandColorMapping
  'brandcolormapping': {
    layer: 'mapping',
    category: 'brand-color',
    modes: ['bild', 'sportbild'],
    outputPrefix: 'brand-color'
  },

  // Base Layer - Primitives
  'colorprimitive': {
    layer: 'base',
    category: 'color-primitive',
    modes: ['value'],
    outputPrefix: 'primitive-color'
  },

  'spaceprimitive': {
    layer: 'base',
    category: 'space-primitive',
    modes: ['value'],
    outputPrefix: 'primitive-space'
  },

  'sizeprimitive': {
    layer: 'base',
    category: 'size-primitive',
    modes: ['value'],
    outputPrefix: 'primitive-size'
  },

  'fontprimitive': {
    layer: 'base',
    category: 'font-primitive',
    modes: ['value'],
    outputPrefix: 'primitive-font'
  }
};

/**
 * Erstellt eine Style Dictionary Konfiguration für einen spezifischen Mode
 */
function createStyleDictionaryConfig(collectionDir, modeName, config) {
  const { layer, category, outputPrefix, modeMapping } = config;
  const outputMode = modeMapping && modeMapping[modeName] ? modeMapping[modeName] : modeName;

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

  const buildPath = `${DIST_DIR}/${layer}/`;

  return {
    source: sourceFiles,
    platforms: {
      // CSS Custom Properties
      css: {
        transforms: ['attribute/cti', 'name/kebab', 'color/css'],
        buildPath: buildPath,
        files: [{
          destination: `${outputPrefix}-${outputMode}.css`,
          format: 'css/variables',
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
        buildPath: buildPath,
        files: [{
          destination: `${outputPrefix}-${outputMode}-global.css`,
          format: 'css/variables',
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
        buildPath: buildPath,
        files: [{
          destination: `${outputPrefix}-${outputMode}.scss`,
          format: 'scss/variables',
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
        buildPath: buildPath,
        files: [{
          destination: `${outputPrefix}-${outputMode}.js`,
          format: 'javascript/es6',
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
        buildPath: buildPath,
        files: [{
          destination: `${outputPrefix}-${outputMode}.json`,
          format: 'json/nested',
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
 * Erstellt Index-Dateien für jede Layer
 */
function createIndexFiles() {
  console.log('\n📝 Erstelle Index-Dateien...');

  const layers = ['base', 'mapping', 'density', 'semantic'];

  layers.forEach(layer => {
    const layerDir = path.join(DIST_DIR, layer);

    if (!fs.existsSync(layerDir)) {
      return;
    }

    // Liste alle CSS-Dateien
    const cssFiles = fs.readdirSync(layerDir)
      .filter(f => f.endsWith('.css') && !f.includes('-global'))
      .sort();

    // Erstelle CSS Index
    let cssIndex = `/**\n * ${layer.toUpperCase()} Layer - Index File\n * Importiert alle Token-Dateien dieser Layer\n */\n\n`;
    cssFiles.forEach(file => {
      cssIndex += `@import './${file}';\n`;
    });

    fs.writeFileSync(path.join(layerDir, 'index.css'), cssIndex, 'utf8');

    // Erstelle SCSS Index
    const scssFiles = fs.readdirSync(layerDir).filter(f => f.endsWith('.scss')).sort();
    let scssIndex = `//\n// ${layer.toUpperCase()} Layer - Index File\n// Importiert alle Token-Dateien dieser Layer\n//\n\n`;
    scssFiles.forEach(file => {
      scssIndex += `@import './${file}';\n`;
    });

    fs.writeFileSync(path.join(layerDir, 'index.scss'), scssIndex, 'utf8');

    // Erstelle JS Index
    const jsFiles = fs.readdirSync(layerDir).filter(f => f.endsWith('.js') && f !== 'index.js').sort();
    let jsIndex = `/**\n * ${layer.toUpperCase()} Layer - Index File\n * Exportiert alle Token-Objekte dieser Layer\n */\n\n`;
    jsFiles.forEach(file => {
      const varName = file.replace('.js', '').replace(/-/g, '_');
      jsIndex += `import ${varName} from './${file}';\n`;
    });
    jsIndex += `\nexport {\n`;
    jsFiles.forEach(file => {
      const varName = file.replace('.js', '').replace(/-/g, '_');
      jsIndex += `  ${varName},\n`;
    });
    jsIndex += `};\n`;

    fs.writeFileSync(path.join(layerDir, 'index.js'), jsIndex, 'utf8');

    console.log(`  ✅ Index-Dateien erstellt für: ${layer}`);
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
    layers: {}
  };

  const layers = ['base', 'mapping', 'density', 'semantic'];

  layers.forEach(layer => {
    const layerDir = path.join(DIST_DIR, layer);

    if (!fs.existsSync(layerDir)) {
      return;
    }

    const files = fs.readdirSync(layerDir)
      .filter(f => !f.startsWith('index'))
      .sort();

    manifest.layers[layer] = {
      files: files,
      path: `dist/${layer}/`
    };
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
  console.log(`📁 Struktur:`);
  console.log(`   - dist/base/        → Primitive Tokens`);
  console.log(`   - dist/mapping/     → Brand-spezifische Tokens`);
  console.log(`   - dist/density/     → Density-Variationen`);
  console.log(`   - dist/semantic/    → Semantische Tokens (ColorMode, BreakpointMode)`);
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
