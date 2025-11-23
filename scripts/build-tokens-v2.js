#!/usr/bin/env node

/**
 * Build Script für Style Dictionary Token-Pipeline v2
 *
 * Dieses Script orchestriert den Build-Prozess für:
 * - Klassische Tokens (variables)
 * - Composite Tokens (typography & effects)
 * - Brand × Breakpoint/ColorMode Matrix
 */

const StyleDictionary = require('style-dictionary').default;
const fs = require('fs');
const path = require('path');

// Importiere Custom Config
const customConfig = require('../build-config/style-dictionary.config.js');

const TOKENS_DIR = path.join(__dirname, '../tokens');
const DIST_DIR = path.join(__dirname, '../dist');

// Brands und Breakpoints
const BRANDS = ['bild', 'sportbild', 'advertorial'];
const BREAKPOINTS = ['xs', 'sm', 'md', 'lg'];
const COLOR_MODES = ['light', 'dark'];

// Size Class Mapping für Native Platforms
const SIZE_CLASS_MAPPING = {
  sm: 'compact',
  lg: 'regular'
};

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
 * Registriert Custom Transforms und Formats
 */
function registerCustomConfig() {
  // Registriere Transforms
  Object.entries(customConfig.transforms).forEach(([name, transform]) => {
    try {
      StyleDictionary.registerTransform(transform);
    } catch (e) {
      // Already registered
    }
  });

  // Registriere Formats
  Object.entries(customConfig.formats).forEach(([name, format]) => {
    try {
      StyleDictionary.registerFormat({
        name: name,
        format: format
      });
    } catch (e) {
      // Already registered
    }
  });
}

/**
 * Erstellt Style Dictionary Config für Typography Tokens
 */
function createTypographyConfig(brand, breakpoint) {
  const sourceFile = path.join(TOKENS_DIR, 'typography', `${brand}-${breakpoint}.json`);

  if (!fs.existsSync(sourceFile)) {
    return null;
  }

  const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);

  return {
    source: [sourceFile],
    platforms: {
      // CSS: 4 separate files per brand (xs, sm, md, lg)
      css: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/css/${brand}/typography/`,
        files: [{
          destination: `typography-${breakpoint}.css`,
          format: 'css/typography-classes',
          options: {
            brand: brandName,
            breakpoint
          }
        }]
      },

      // iOS: Nur compact (sm) und regular (lg)
      ...(SIZE_CLASS_MAPPING[breakpoint] ? {
        ios: {
          transforms: ['attribute/cti'],
          buildPath: `${DIST_DIR}/ios/${brand}/sizeclass-${SIZE_CLASS_MAPPING[breakpoint]}/`,
          files: [{
            destination: 'Typography.swift',
            format: 'ios-swift/typography',
            options: {
              brand: brandName,
              breakpoint,
              sizeClass: SIZE_CLASS_MAPPING[breakpoint]
            }
          }]
        }
      } : {}),

      // Android: Nur compact (sm) und regular (lg)
      ...(SIZE_CLASS_MAPPING[breakpoint] ? {
        android: {
          transforms: ['attribute/cti'],
          buildPath: `${DIST_DIR}/android/${brand}/sizeclass-${SIZE_CLASS_MAPPING[breakpoint]}/`,
          files: [{
            destination: 'typography_styles.xml',
            format: 'android/typography-styles',
            options: {
              brand: brandName,
              breakpoint
            }
          }]
        }
      } : {})
    }
  };
}

/**
 * Erstellt Style Dictionary Config für Effect Tokens
 */
function createEffectConfig(brand, colorMode) {
  const sourceFile = path.join(TOKENS_DIR, 'effects', `${brand}-${colorMode}.json`);

  if (!fs.existsSync(sourceFile)) {
    return null;
  }

  const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);

  return {
    source: [sourceFile],
    platforms: {
      // CSS
      css: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/css/${brand}/effects/`,
        files: [{
          destination: `effects-${colorMode}.css`,
          format: 'css/effect-classes',
          options: {
            brand: brandName,
            colorMode
          }
        }]
      }
    }
  };
}

/**
 * Baut klassische Token Collections
 */
async function buildClassicTokens() {
  console.log('\n📦 Baue Klassische Tokens:\n');

  const classicDir = path.join(TOKENS_DIR, 'classic');
  if (!fs.existsSync(classicDir)) {
    console.log('  ⚠️  Kein classic/ Verzeichnis gefunden');
    return { total: 0, successful: 0 };
  }

  // Sammle ALLE Token-Dateien als gemeinsame Source (für Alias-Auflösung)
  const allTokenFiles = [];
  const collections = fs.readdirSync(classicDir);

  collections.forEach(collection => {
    const collectionDir = path.join(classicDir, collection);
    if (!fs.statSync(collectionDir).isDirectory()) return;

    const files = fs.readdirSync(collectionDir).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      allTokenFiles.push(path.join(collectionDir, file));
    });
  });

  console.log(`  ℹ️  Gefunden: ${allTokenFiles.length} Token-Dateien\n`);

  // Baue einen gemeinsamen Build mit allen Tokens
  const config = {
    source: allTokenFiles,
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: `${DIST_DIR}/css/classic/`,
        files: [{
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            outputReferences: false  // Aliase sind bereits im Preprocessing aufgelöst
          }
        }]
      },
      json: {
        transformGroup: 'js',
        buildPath: `${DIST_DIR}/json/classic/`,
        files: [{
          destination: 'tokens.json',
          format: 'json/nested'
        }]
      }
    }
  };

  try {
    const sd = new StyleDictionary(config);
    await sd.buildAllPlatforms();
    console.log(`  ✅ Alle klassischen Tokens gebaut\n`);
    console.log(`     📄 CSS: dist/css/classic/tokens.css`);
    console.log(`     📄 JSON: dist/json/classic/tokens.json`);
    return { total: 1, successful: 1 };
  } catch (error) {
    console.error(`  ❌ Fehler beim Build klassischer Tokens:`);
    console.error(`     ${error.message}`);
    return { total: 1, successful: 0 };
  }
}

/**
 * Baut Typography Tokens
 */
async function buildTypographyTokens() {
  console.log('\n✍️  Baue Typography Tokens:\n');

  let totalBuilds = 0;
  let successfulBuilds = 0;

  for (const brand of BRANDS) {
    console.log(`  🏷️  Brand: ${brand}`);

    for (const breakpoint of BREAKPOINTS) {
      const config = createTypographyConfig(brand, breakpoint);

      if (!config) {
        console.log(`     ⚠️  Keine Daten für ${brand}-${breakpoint}`);
        continue;
      }

      try {
        totalBuilds++;
        const sd = new StyleDictionary(config);
        await sd.buildAllPlatforms();
        successfulBuilds++;

        const platforms = Object.keys(config.platforms).join(', ');
        console.log(`     ✅ ${brand}-${breakpoint} (${platforms})`);
      } catch (error) {
        console.error(`     ❌ Fehler bei ${brand}-${breakpoint}:`);
        console.error(`        ${error.message}`);
      }
    }
  }

  return { totalBuilds, successfulBuilds };
}

/**
 * Baut Effect Tokens
 */
async function buildEffectTokens() {
  console.log('\n🎨 Baue Effect Tokens:\n');

  let totalBuilds = 0;
  let successfulBuilds = 0;

  for (const brand of BRANDS) {
    console.log(`  🏷️  Brand: ${brand}`);

    for (const colorMode of COLOR_MODES) {
      const config = createEffectConfig(brand, colorMode);

      if (!config) {
        console.log(`     ⚠️  Keine Daten für ${brand}-${colorMode}`);
        continue;
      }

      try {
        totalBuilds++;
        const sd = new StyleDictionary(config);
        await sd.buildAllPlatforms();
        successfulBuilds++;

        console.log(`     ✅ ${brand}-${colorMode}`);
      } catch (error) {
        console.error(`     ❌ Fehler bei ${brand}-${colorMode}:`);
        console.error(`        ${error.message}`);
      }
    }
  }

  return { totalBuilds, successfulBuilds };
}

/**
 * Erstellt Manifest
 */
function createManifest(stats) {
  console.log('\n📋 Erstelle Manifest...');

  const manifest = {
    generated: new Date().toISOString(),
    version: '2.0.0',
    statistics: {
      classicTokens: stats.classicTokens || { total: 0, successful: 0 },
      typographyTokens: stats.typographyTokens || { total: 0, successful: 0 },
      effectTokens: stats.effectTokens || { total: 0, successful: 0 }
    },
    structure: {
      brands: BRANDS,
      breakpoints: BREAKPOINTS,
      colorModes: COLOR_MODES,
      sizeClasses: Object.values(SIZE_CLASS_MAPPING)
    }
  };

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
  console.log('   BILD Design System - Token Build v2');
  console.log('   ============================================\n');

  // Bereinige Dist
  cleanDist();

  // Registriere Custom Config
  registerCustomConfig();

  // Prüfe ob Tokens-Verzeichnis existiert
  if (!fs.existsSync(TOKENS_DIR)) {
    console.error('❌ Tokens-Verzeichnis nicht gefunden!');
    console.error('   Führe zuerst "npm run preprocess" aus.\n');
    process.exit(1);
  }

  const stats = {};

  // Baue klassische Tokens
  stats.classicTokens = await buildClassicTokens();

  // Baue Typography Tokens
  stats.typographyTokens = await buildTypographyTokens();

  // Baue Effect Tokens
  stats.effectTokens = await buildEffectTokens();

  // Erstelle Manifest
  createManifest(stats);

  // Zusammenfassung
  console.log('\n✨ ============================================');
  console.log('   Build abgeschlossen!');
  console.log('   ============================================\n');
  console.log(`📊 Statistiken:`);
  console.log(`   - Classic Token Builds: ${stats.classicTokens.successful}/${stats.classicTokens.total}`);
  console.log(`   - Typography Builds: ${stats.typographyTokens.successfulBuilds}/${stats.typographyTokens.totalBuilds}`);
  console.log(`   - Effect Builds: ${stats.effectTokens.successfulBuilds}/${stats.effectTokens.totalBuilds}`);
  console.log(`   - Output-Verzeichnis: dist/\n`);

  console.log(`📁 Struktur:`);
  console.log(`   dist/`);
  console.log(`   ├── css/`);
  console.log(`   │   ├── bild/`);
  console.log(`   │   │   ├── typography/    (xs, sm, md, lg)`);
  console.log(`   │   │   └── effects/       (light, dark)`);
  console.log(`   │   ├── sportbild/ (same)`);
  console.log(`   │   └── advertorial/ (same)`);
  console.log(`   ├── ios/`);
  console.log(`   │   ├── bild/`);
  console.log(`   │   │   ├── sizeclass-compact/   (Typography.swift)`);
  console.log(`   │   │   └── sizeclass-regular/   (Typography.swift)`);
  console.log(`   │   ├── sportbild/ (same)`);
  console.log(`   │   └── advertorial/ (same)`);
  console.log(`   └── android/`);
  console.log(`       ├── bild/`);
  console.log(`       │   ├── sizeclass-compact/   (typography_styles.xml)`);
  console.log(`       │   └── sizeclass-regular/   (typography_styles.xml)`);
  console.log(`       ├── sportbild/ (same)`);
  console.log(`       └── advertorial/ (same)`);
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
