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
  const sourceFile = path.join(TOKENS_DIR, 'brands', brand, 'semantic', 'typography', `typography-${breakpoint}.json`);

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
        buildPath: `${DIST_DIR}/css/brands/${brand}/semantic/typography/`,
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
          buildPath: `${DIST_DIR}/ios/brands/${brand}/sizeclass-${SIZE_CLASS_MAPPING[breakpoint]}/`,
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
          buildPath: `${DIST_DIR}/android/brands/${brand}/sizeclass-${SIZE_CLASS_MAPPING[breakpoint]}/`,
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
  const sourceFile = path.join(TOKENS_DIR, 'brands', brand, 'semantic', 'effects', `effects-${colorMode}.json`);

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
        buildPath: `${DIST_DIR}/css/brands/${brand}/semantic/effects/`,
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
 * Baut Shared Primitive Tokens
 */
async function buildSharedPrimitives() {
  console.log('\n📦 Baue Shared Primitives:\n');

  const sharedDir = path.join(TOKENS_DIR, 'shared');
  if (!fs.existsSync(sharedDir)) {
    console.log('  ⚠️  Kein shared/ Verzeichnis gefunden');
    return { total: 0, successful: 0 };
  }

  const files = fs.readdirSync(sharedDir).filter(f => f.endsWith('.json'));
  let successful = 0;

  for (const file of files) {
    const baseName = path.basename(file, '.json');
    const sourcePath = path.join(sharedDir, file);

    const config = {
      source: [sourcePath],
      platforms: {
        css: {
          transformGroup: 'css',
          buildPath: `${DIST_DIR}/css/shared/`,
          files: [{
            destination: `${baseName}.css`,
            format: 'css/variables',
            options: { outputReferences: false }
          }]
        }
      }
    };

    try {
      const sd = new StyleDictionary(config);
      await sd.buildAllPlatforms();
      console.log(`  ✅ ${baseName}`);
      successful++;
    } catch (error) {
      console.error(`  ❌ ${baseName}: ${error.message}`);
    }
  }

  return { total: files.length, successful };
}

/**
 * Baut Brand-spezifische Token Collections
 */
async function buildBrandSpecificTokens() {
  console.log('\n🏷️  Baue Brand-spezifische Tokens:\n');

  let totalBuilds = 0;
  let successfulBuilds = 0;

  for (const brand of BRANDS) {
    console.log(`  📦 ${brand}:`);

    const brandDir = path.join(TOKENS_DIR, 'brands', brand);
    if (!fs.existsSync(brandDir)) continue;

    // Density
    const densityDir = path.join(brandDir, 'density');
    if (fs.existsSync(densityDir)) {
      const files = fs.readdirSync(densityDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const fileName = path.basename(file, '.json');
        const config = {
          source: [path.join(densityDir, file)],
          platforms: {
            css: {
              transformGroup: 'css',
              buildPath: `${DIST_DIR}/css/brands/${brand}/density/`,
              files: [{ destination: `${fileName}.css`, format: 'css/variables', options: { outputReferences: false } }]
            }
          }
        };

        try {
          totalBuilds++;
          await new StyleDictionary(config).buildAllPlatforms();
          successfulBuilds++;
        } catch (error) {
          console.error(`     ❌ density/${fileName}: ${error.message}`);
        }
      }
      console.log(`     ✅ density (${files.length} modes)`);
    }

    // Breakpoints
    const breakpointsDir = path.join(brandDir, 'breakpoints');
    if (fs.existsSync(breakpointsDir)) {
      const files = fs.readdirSync(breakpointsDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const fileName = path.basename(file, '.json');
        const config = {
          source: [path.join(breakpointsDir, file)],
          platforms: {
            css: {
              transformGroup: 'css',
              buildPath: `${DIST_DIR}/css/brands/${brand}/semantic/breakpoints/`,
              files: [{ destination: `${fileName}.css`, format: 'css/variables', options: { outputReferences: false } }]
            }
          }
        };

        try {
          totalBuilds++;
          await new StyleDictionary(config).buildAllPlatforms();
          successfulBuilds++;
        } catch (error) {
          console.error(`     ❌ breakpoints/${fileName}: ${error.message}`);
        }
      }
      console.log(`     ✅ breakpoints (${files.length} modes)`);
    }

    // Color
    const colorDir = path.join(brandDir, 'color');
    if (fs.existsSync(colorDir)) {
      const files = fs.readdirSync(colorDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const fileName = path.basename(file, '.json');
        const config = {
          source: [path.join(colorDir, file)],
          platforms: {
            css: {
              transformGroup: 'css',
              buildPath: `${DIST_DIR}/css/brands/${brand}/semantic/color/`,
              files: [{ destination: `${fileName}.css`, format: 'css/variables', options: { outputReferences: false } }]
            }
          }
        };

        try {
          totalBuilds++;
          await new StyleDictionary(config).buildAllPlatforms();
          successfulBuilds++;
        } catch (error) {
          console.error(`     ❌ color/${fileName}: ${error.message}`);
        }
      }
      console.log(`     ✅ color (${files.length} modes)`);
    }

    // Overrides
    const overridesDir = path.join(brandDir, 'overrides');
    if (fs.existsSync(overridesDir)) {
      const files = fs.readdirSync(overridesDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const fileName = path.basename(file, '.json');
        const config = {
          source: [path.join(overridesDir, file)],
          platforms: {
            css: {
              transformGroup: 'css',
              buildPath: `${DIST_DIR}/css/brands/${brand}/overrides/`,
              files: [{ destination: `${fileName}.css`, format: 'css/variables', options: { outputReferences: false } }]
            }
          }
        };

        try {
          totalBuilds++;
          await new StyleDictionary(config).buildAllPlatforms();
          successfulBuilds++;
        } catch (error) {
          console.error(`     ❌ overrides/${fileName}: ${error.message}`);
        }
      }
      console.log(`     ✅ overrides (${files.length} collections)`);
    }
  }

  return { totalBuilds, successfulBuilds };
}

/**
 * Baut Typography Tokens (brand-spezifisch)
 */
async function buildTypographyTokens() {
  console.log('\n✍️  Baue Typography Tokens:\n');

  let totalBuilds = 0;
  let successfulBuilds = 0;

  for (const brand of BRANDS) {
    console.log(`  🏷️  ${brand}:`);

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
      sharedPrimitives: stats.sharedPrimitives || { total: 0, successful: 0 },
      brandSpecific: stats.brandSpecific || { totalBuilds: 0, successfulBuilds: 0 },
      typographyTokens: stats.typographyTokens || { totalBuilds: 0, successfulBuilds: 0 },
      effectTokens: stats.effectTokens || { totalBuilds: 0, successfulBuilds: 0 }
    },
    structure: {
      brands: BRANDS,
      breakpoints: BREAKPOINTS,
      colorModes: COLOR_MODES,
      sizeClasses: Object.values(SIZE_CLASS_MAPPING),
      outputPaths: {
        css: {
          shared: 'css/shared/',
          brands: 'css/brands/{brand}/'
        },
        ios: 'ios/brands/{brand}/sizeclass-{compact|regular}/',
        android: 'android/brands/{brand}/sizeclass-{compact|regular}/'
      }
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

  // Baue Shared Primitives
  stats.sharedPrimitives = await buildSharedPrimitives();

  // Baue Brand-spezifische Tokens
  stats.brandSpecific = await buildBrandSpecificTokens();

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

  // Berechne Gesamtstatistik für GitHub Actions
  const totalBuilds = stats.sharedPrimitives.total + stats.brandSpecific.totalBuilds +
                      stats.typographyTokens.totalBuilds + stats.effectTokens.totalBuilds;
  const successfulBuilds = stats.sharedPrimitives.successful + stats.brandSpecific.successfulBuilds +
                           stats.typographyTokens.successfulBuilds + stats.effectTokens.successfulBuilds;

  console.log(`📊 Statistiken:`);
  console.log(`   - Shared Primitives: ${stats.sharedPrimitives.successful}/${stats.sharedPrimitives.total}`);
  console.log(`   - Brand-spezifische Tokens: ${stats.brandSpecific.successfulBuilds}/${stats.brandSpecific.totalBuilds}`);
  console.log(`   - Typography Builds: ${stats.typographyTokens.successfulBuilds}/${stats.typographyTokens.totalBuilds}`);
  console.log(`   - Effect Builds: ${stats.effectTokens.successfulBuilds}/${stats.effectTokens.totalBuilds}`);
  console.log(`   - Builds erfolgreich: ${successfulBuilds}/${totalBuilds}`);
  console.log(`   - Output-Verzeichnis: dist/\n`);

  console.log(`📁 Struktur:`);
  console.log(`   dist/`);
  console.log(`   ├── css/`);
  console.log(`   │   ├── shared/              (primitives)`);
  console.log(`   │   └── brands/`);
  console.log(`   │       └── {brand}/`);
  console.log(`   │           ├── density/     (3 modes)`);
  console.log(`   │           ├── overrides/   (brand mappings)`);
  console.log(`   │           └── semantic/`);
  console.log(`   │               ├── breakpoints/  (4 modes)`);
  console.log(`   │               ├── color/        (2 modes)`);
  console.log(`   │               ├── effects/      (2 color modes)`);
  console.log(`   │               └── typography/   (4 breakpoints)`);
  console.log(`   ├── ios/brands/{brand}/sizeclass-{compact|regular}/`);
  console.log(`   └── android/brands/{brand}/sizeclass-{compact|regular}/`);
  console.log('');

  // Explizit success exit code
  process.exit(0);
}

// Führe Script aus
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fehler beim Build:', error);
    process.exit(1);
  });
}

module.exports = { main };
