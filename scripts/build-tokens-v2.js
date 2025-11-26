#!/usr/bin/env node

/**
 * Build Script for Style Dictionary Token Pipeline v2
 *
 * This script orchestrates the build process for:
 * - Classic Tokens (variables)
 * - Composite Tokens (typography & effects)
 * - Brand × Breakpoint/ColorMode matrix
 */

const StyleDictionary = require('style-dictionary').default;
const fs = require('fs');
const path = require('path');

// Import custom config
const customConfig = require('../build-config/style-dictionary.config.js');

const TOKENS_DIR = path.join(__dirname, '../tokens');
const DIST_DIR = path.join(__dirname, '../dist');

// Brands and breakpoints
const BRANDS = ['bild', 'sportbild', 'advertorial'];
const BREAKPOINTS = ['xs', 'sm', 'md', 'lg'];
const COLOR_MODES = ['light', 'dark'];

// Size class mapping for native platforms
const SIZE_CLASS_MAPPING = {
  sm: 'compact',
  lg: 'regular'
};

/**
 * Creates platform configuration for standard tokens (Primitives, Brand-specific, etc.)
 * CSS version with data-attributes for runtime theme switching
 *
 * @param {string} buildPath - Base build path
 * @param {string} fileName - Output file name
 * @param {object} cssOptions - CSS-specific options { brand, mode, modeType }
 */
function createStandardPlatformConfig(buildPath, fileName, cssOptions = {}) {
  // Filter to exclude documentation-only tokens that cause collisions
  const tokenFilter = (token) => {
    // Exclude TextLabels tokens - these are documentation-only and cause name collisions
    if (token.path && token.path.includes('TextLabels')) {
      return false;
    }
    return true;
  };

  return {
    css: {
      transformGroup: 'custom/css',
      buildPath: `${buildPath}/`,
      files: [{
        destination: `${fileName}.css`,
        format: cssOptions.brand || cssOptions.mode ? 'custom/css/themed-variables' : 'custom/css/variables',
        filter: tokenFilter,
        options: {
          outputReferences: false,
          ...cssOptions  // brand, mode, modeType for data-attributes
        }
      }]
    },
    scss: {
      transformGroup: 'custom/scss',
      buildPath: `${DIST_DIR}/scss/${buildPath.replace(DIST_DIR + '/css/', '')}/`,
      files: [{
        destination: `${fileName}.scss`,
        format: 'custom/scss/variables',
        filter: tokenFilter,
        options: { outputReferences: false }
      }]
    },
    js: {
      transformGroup: 'custom/js',
      buildPath: `${DIST_DIR}/js/${buildPath.replace(DIST_DIR + '/css/', '')}/`,
      files: [{
        destination: `${fileName}.js`,
        format: 'custom/javascript/es6',
        filter: tokenFilter,
        options: { outputReferences: false }
      }]
    },
    json: {
      transformGroup: 'custom/js',
      buildPath: `${DIST_DIR}/json/${buildPath.replace(DIST_DIR + '/css/', '')}/`,
      files: [{
        destination: `${fileName}.json`,
        format: 'json',
        filter: tokenFilter,
        options: { outputReferences: false }
      }]
    },
    ios: {
      transformGroup: 'custom/ios-swift',
      buildPath: `${DIST_DIR}/ios/${buildPath.replace(DIST_DIR + '/css/', '')}/`,
      files: [{
        destination: `${fileName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}.swift`,
        format: 'ios-swift/class',
        filter: tokenFilter,
        options: {
          outputReferences: false,
          className: fileName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')
        }
      }]
    },
    android: {
      transformGroup: 'custom/android',
      buildPath: `${DIST_DIR}/android/res/values/${buildPath.replace(DIST_DIR + '/css/', '')}/`,
      files: [{
        destination: `${fileName}.xml`,
        format: 'android/resources',
        filter: tokenFilter,
        options: { outputReferences: false }
      }]
    },
    flutter: {
      transformGroup: 'custom/flutter',
      buildPath: `${DIST_DIR}/flutter/${buildPath.replace(DIST_DIR + '/css/', '')}/`,
      files: [{
        destination: `${fileName}.dart`,
        format: 'flutter/class',
        filter: tokenFilter,
        options: {
          outputReferences: false,
          className: fileName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')
        }
      }]
    }
  };
}

/**
 * Cleans the dist directory
 */
function cleanDist() {
  console.log('🧹 Cleaning dist directory...');
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

/**
 * Registers custom transforms, transform groups and formats
 */
function registerCustomConfig() {
  // Register transforms
  Object.entries(customConfig.transforms).forEach(([name, transform]) => {
    try {
      StyleDictionary.registerTransform(transform);
    } catch (e) {
      // Already registered
    }
  });

  // Register transform groups
  if (customConfig.transformGroups) {
    Object.entries(customConfig.transformGroups).forEach(([name, transforms]) => {
      try {
        StyleDictionary.registerTransformGroup({
          name: name,
          transforms: transforms
        });
      } catch (e) {
        // Already registered
      }
    });
  }

  // Register formats
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
 * Creates Style Dictionary config for Typography tokens
 */
function createTypographyConfig(brand, breakpoint) {
  const sourceFile = path.join(TOKENS_DIR, 'brands', brand, 'semantic', 'typography', `typography-${breakpoint}.json`);

  if (!fs.existsSync(sourceFile)) {
    return null;
  }

  const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
  const fileName = `typography-${breakpoint}`;

  return {
    source: [sourceFile],
    platforms: {
      // CSS: Custom format for Typography classes
      css: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/css/brands/${brand}/semantic/typography/`,
        files: [{
          destination: `${fileName}.css`,
          format: 'css/typography-classes',
          options: {
            brand: brandName,
            breakpoint
          }
        }]
      },

      // JS: Custom Typography format
      js: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/js/brands/${brand}/semantic/typography/`,
        files: [{
          destination: `${fileName}.js`,
          format: 'javascript/typography',
          options: {
            brand: brandName,
            breakpoint
          }
        }]
      },

      // JSON: Standard JSON
      json: {
        transformGroup: 'js',
        buildPath: `${DIST_DIR}/json/brands/${brand}/semantic/typography/`,
        files: [{ destination: `${fileName}.json`, format: 'json', options: { outputReferences: false } }]
      },

      // Flutter: Custom Typography format
      flutter: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/flutter/brands/${brand}/semantic/typography/`,
        files: [{
          destination: `${fileName}.dart`,
          format: 'flutter/typography',
          options: {
            brand: brandName,
            breakpoint,
            sizeClass: SIZE_CLASS_MAPPING[breakpoint] || breakpoint
          }
        }]
      },

      // SCSS: Custom Typography format
      scss: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/scss/brands/${brand}/semantic/typography/`,
        files: [{
          destination: `${fileName}.scss`,
          format: 'scss/typography',
          options: {
            brand: brandName,
            breakpoint
          }
        }]
      },

      // iOS: Only compact (sm) and regular (lg) with custom format
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

      // Android: Only compact (sm) and regular (lg) with custom format
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
 * Creates Style Dictionary config for Effect tokens
 */
function createEffectConfig(brand, colorMode) {
  const sourceFile = path.join(TOKENS_DIR, 'brands', brand, 'semantic', 'effects', `effects-${colorMode}.json`);

  if (!fs.existsSync(sourceFile)) {
    return null;
  }

  const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
  const fileName = `effects-${colorMode}`;

  return {
    source: [sourceFile],
    platforms: {
      // CSS: Custom format for Effect classes
      css: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/css/brands/${brand}/semantic/effects/`,
        files: [{
          destination: `${fileName}.css`,
          format: 'css/effect-classes',
          options: {
            brand: brandName,
            colorMode
          }
        }]
      },

      // JS: Custom Effects format
      js: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/js/brands/${brand}/semantic/effects/`,
        files: [{
          destination: `${fileName}.js`,
          format: 'javascript/effects',
          options: {
            brand: brandName,
            colorMode
          }
        }]
      },

      // JSON: Standard JSON
      json: {
        transformGroup: 'js',
        buildPath: `${DIST_DIR}/json/brands/${brand}/semantic/effects/`,
        files: [{ destination: `${fileName}.json`, format: 'json', options: { outputReferences: false } }]
      },

      // iOS: Custom Swift Effects format
      ios: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/ios/brands/${brand}/semantic/effects/`,
        files: [{
          destination: `${fileName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}.swift`,
          format: 'ios-swift/effects',
          options: {
            brand: brandName,
            colorMode
          }
        }]
      },

      // Flutter: Custom Effects format
      flutter: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/flutter/brands/${brand}/semantic/effects/`,
        files: [{
          destination: `${fileName}.dart`,
          format: 'flutter/effects',
          options: {
            brand: brandName,
            colorMode
          }
        }]
      },

      // SCSS: Custom Effects format
      scss: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/scss/brands/${brand}/semantic/effects/`,
        files: [{
          destination: `${fileName}.scss`,
          format: 'scss/effects',
          options: {
            brand: brandName,
            colorMode
          }
        }]
      },

      // Android: Custom Effects format
      android: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/android/brands/${brand}/semantic/effects/`,
        files: [{
          destination: `${fileName}.xml`,
          format: 'android/effects',
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
 * Builds Shared Primitive Tokens
 */
async function buildSharedPrimitives() {
  console.log('\n📦 Building Shared Primitives:\n');

  const sharedDir = path.join(TOKENS_DIR, 'shared');
  if (!fs.existsSync(sharedDir)) {
    console.log('  ⚠️  No shared/ directory found');
    return { total: 0, successful: 0 };
  }

  const files = fs.readdirSync(sharedDir).filter(f => f.endsWith('.json'));
  let successful = 0;

  for (const file of files) {
    const baseName = path.basename(file, '.json');
    const sourcePath = path.join(sharedDir, file);

    const config = {
      source: [sourcePath],
      platforms: createStandardPlatformConfig(`${DIST_DIR}/css/shared`, baseName)
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
 * Builds Brand-specific Token Collections
 */
async function buildBrandSpecificTokens() {
  console.log('\n🏷️  Building Brand-specific Tokens:\n');

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
        // Extract density mode from filename (e.g., "density-compact" -> "compact")
        const densityMatch = fileName.match(/density-(\w+)/);
        const densityMode = densityMatch ? densityMatch[1] : null;

        const config = {
          source: [path.join(densityDir, file)],
          platforms: createStandardPlatformConfig(
            `${DIST_DIR}/css/brands/${brand}/density`,
            fileName,
            {
              brand,
              mode: densityMode,
              modeType: 'density'
            }
          )
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
        // Extract breakpoint from filename (e.g., "breakpoint-lg" -> "lg")
        const breakpointMatch = fileName.match(/breakpoint-(\w+)/);
        const breakpointMode = breakpointMatch ? breakpointMatch[1] : null;

        const config = {
          source: [path.join(breakpointsDir, file)],
          platforms: createStandardPlatformConfig(
            `${DIST_DIR}/css/brands/${brand}/semantic/breakpoints`,
            fileName,
            {
              brand,
              mode: breakpointMode,
              modeType: 'breakpoint'
            }
          )
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
        // Extract color mode from filename (e.g., "colormode-light" -> "light")
        const colorModeMatch = fileName.match(/colormode-(\w+)/);
        const colorMode = colorModeMatch ? colorModeMatch[1] : null;

        const config = {
          source: [path.join(colorDir, file)],
          platforms: createStandardPlatformConfig(
            `${DIST_DIR}/css/brands/${brand}/semantic/color`,
            fileName,
            {
              brand,
              mode: colorMode,
              modeType: 'theme'
            }
          )
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
          platforms: createStandardPlatformConfig(`${DIST_DIR}/css/brands/${brand}/overrides`, fileName)
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
 * Creates platform config for component typography tokens
 */
function createComponentTypographyConfig(sourceFile, brand, componentName, fileName) {
  const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
  // Extract breakpoint from fileName (e.g., "button-typography-lg" -> "lg")
  const breakpointMatch = fileName.match(/typography-(\w+)$/);
  const breakpoint = breakpointMatch ? breakpointMatch[1] : null;

  return {
    source: [sourceFile],
    platforms: {
      css: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/css/brands/${brand}/components/${componentName}/`,
        files: [{
          destination: `${fileName}.css`,
          format: 'css/typography-classes',
          options: {
            brand: brandName,
            breakpoint: breakpoint || 'default',
            componentName
          }
        }]
      },
      scss: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/scss/brands/${brand}/components/${componentName}/`,
        files: [{
          destination: `${fileName}.scss`,
          format: 'scss/typography',
          options: {
            brand: brandName,
            breakpoint: breakpoint || 'default',
            componentName
          }
        }]
      },
      js: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/js/brands/${brand}/components/${componentName}/`,
        files: [{
          destination: `${fileName}.js`,
          format: 'javascript/typography',
          options: {
            brand: brandName,
            breakpoint: breakpoint || 'default',
            componentName
          }
        }]
      },
      json: {
        transformGroup: 'js',
        buildPath: `${DIST_DIR}/json/brands/${brand}/components/${componentName}/`,
        files: [{ destination: `${fileName}.json`, format: 'json', options: { outputReferences: false } }]
      },
      ios: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/ios/brands/${brand}/components/${componentName}/`,
        files: [{
          destination: `${fileName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}.swift`,
          format: 'ios-swift/typography',
          options: {
            brand: brandName,
            breakpoint,
            componentName,
            sizeClass: SIZE_CLASS_MAPPING[breakpoint] || breakpoint
          }
        }]
      },
      flutter: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/flutter/brands/${brand}/components/${componentName}/`,
        files: [{
          destination: `${fileName}.dart`,
          format: 'flutter/typography',
          options: {
            brand: brandName,
            breakpoint,
            componentName,
            sizeClass: SIZE_CLASS_MAPPING[breakpoint] || breakpoint
          }
        }]
      },
      android: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/android/brands/${brand}/components/${componentName}/`,
        files: [{
          destination: `${fileName}.xml`,
          format: 'android/typography-styles',
          options: {
            brand: brandName,
            breakpoint,
            componentName
          }
        }]
      }
    }
  };
}

/**
 * Creates platform config for component effects tokens
 */
function createComponentEffectsConfig(sourceFile, brand, componentName, fileName) {
  const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
  // Extract colorMode from fileName (e.g., "alert-effects-light" -> "light")
  const colorModeMatch = fileName.match(/effects-(\w+)$/);
  const colorMode = colorModeMatch ? colorModeMatch[1] : null;

  return {
    source: [sourceFile],
    platforms: {
      css: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/css/brands/${brand}/components/${componentName}/`,
        files: [{
          destination: `${fileName}.css`,
          format: 'css/effect-classes',
          options: {
            brand: brandName,
            colorMode: colorMode || 'default',
            componentName
          }
        }]
      },
      scss: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/scss/brands/${brand}/components/${componentName}/`,
        files: [{
          destination: `${fileName}.scss`,
          format: 'scss/effects',
          options: {
            brand: brandName,
            colorMode: colorMode || 'default',
            componentName
          }
        }]
      },
      js: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/js/brands/${brand}/components/${componentName}/`,
        files: [{
          destination: `${fileName}.js`,
          format: 'javascript/effects',
          options: {
            brand: brandName,
            colorMode: colorMode || 'default',
            componentName
          }
        }]
      },
      json: {
        transformGroup: 'js',
        buildPath: `${DIST_DIR}/json/brands/${brand}/components/${componentName}/`,
        files: [{ destination: `${fileName}.json`, format: 'json', options: { outputReferences: false } }]
      },
      ios: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/ios/brands/${brand}/components/${componentName}/`,
        files: [{
          destination: `${fileName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}.swift`,
          format: 'ios-swift/effects',
          options: {
            brand: brandName,
            colorMode,
            componentName
          }
        }]
      },
      flutter: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/flutter/brands/${brand}/components/${componentName}/`,
        files: [{
          destination: `${fileName}.dart`,
          format: 'flutter/effects',
          options: {
            brand: brandName,
            colorMode,
            componentName
          }
        }]
      },
      android: {
        transforms: ['attribute/cti'],
        buildPath: `${DIST_DIR}/android/brands/${brand}/components/${componentName}/`,
        files: [{
          destination: `${fileName}.xml`,
          format: 'android/effects',
          options: {
            brand: brandName,
            colorMode,
            componentName
          }
        }]
      }
    }
  };
}

/**
 * Builds Component Tokens
 * Components are organized in brands/{brand}/components/{Component}/
 */
async function buildComponentTokens() {
  console.log('\n🧩 Building Component Tokens:\n');

  let totalBuilds = 0;
  let successfulBuilds = 0;

  for (const brand of BRANDS) {
    console.log(`  🏷️  ${brand}:`);

    const componentsDir = path.join(TOKENS_DIR, 'brands', brand, 'components');
    if (!fs.existsSync(componentsDir)) {
      console.log(`     ⚠️  No components directory found`);
      continue;
    }

    const componentNames = fs.readdirSync(componentsDir).filter(name => {
      const componentPath = path.join(componentsDir, name);
      return fs.statSync(componentPath).isDirectory();
    });

    for (const componentName of componentNames) {
      const componentDir = path.join(componentsDir, componentName);
      const files = fs.readdirSync(componentDir).filter(f => f.endsWith('.json'));

      let componentSuccessful = 0;

      for (const file of files) {
        const fileName = path.basename(file, '.json');
        const sourcePath = path.join(componentDir, file);

        // Determine config based on file type
        let config;
        if (fileName.includes('typography-')) {
          config = createComponentTypographyConfig(sourcePath, brand, componentName, fileName);
        } else if (fileName.includes('effects-')) {
          config = createComponentEffectsConfig(sourcePath, brand, componentName, fileName);
        } else {
          // Standard token config for color, density, breakpoint tokens
          // Extract mode and modeType from filename
          let cssOptions = { brand };

          // Check for color mode (e.g., "alert-color-light" -> mode: "light", modeType: "theme")
          const colorModeMatch = fileName.match(/color-(\w+)/);
          if (colorModeMatch) {
            cssOptions.mode = colorModeMatch[1];
            cssOptions.modeType = 'theme';
          }

          // Check for density mode (e.g., "button-density-compact" -> mode: "compact", modeType: "density")
          const densityMatch = fileName.match(/density-(\w+)/);
          if (densityMatch) {
            cssOptions.mode = densityMatch[1];
            cssOptions.modeType = 'density';
          }

          // Check for breakpoint mode (e.g., "audioplayer-breakpoint-lg-1024px-regular" -> mode: "lg", modeType: "breakpoint")
          const breakpointMatch = fileName.match(/breakpoint-(\w+)/);
          if (breakpointMatch) {
            cssOptions.mode = breakpointMatch[1];
            cssOptions.modeType = 'breakpoint';
          }

          config = {
            source: [sourcePath],
            platforms: createStandardPlatformConfig(
              `${DIST_DIR}/css/brands/${brand}/components/${componentName}`,
              fileName,
              cssOptions
            )
          };
        }

        try {
          totalBuilds++;
          await new StyleDictionary(config).buildAllPlatforms();
          successfulBuilds++;
          componentSuccessful++;
        } catch (error) {
          console.error(`     ❌ ${componentName}/${fileName}: ${error.message}`);
        }
      }

      if (componentSuccessful > 0) {
        console.log(`     ✅ ${componentName} (${componentSuccessful}/${files.length} files)`);
      }
    }
  }

  return { totalBuilds, successfulBuilds };
}

/**
 * Builds Typography Tokens (brand-specific)
 */
async function buildTypographyTokens() {
  console.log('\n✍️  Building Typography Tokens:\n');

  let totalBuilds = 0;
  let successfulBuilds = 0;

  for (const brand of BRANDS) {
    console.log(`  🏷️  ${brand}:`);

    for (const breakpoint of BREAKPOINTS) {
      const config = createTypographyConfig(brand, breakpoint);

      if (!config) {
        console.log(`     ⚠️  No data for ${brand}-${breakpoint}`);
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
 * Builds Effect Tokens
 */
async function buildEffectTokens() {
  console.log('\n🎨 Building Effect Tokens:\n');

  let totalBuilds = 0;
  let successfulBuilds = 0;

  for (const brand of BRANDS) {
    console.log(`  🏷️  Brand: ${brand}`);

    for (const colorMode of COLOR_MODES) {
      const config = createEffectConfig(brand, colorMode);

      if (!config) {
        console.log(`     ⚠️  No data for ${brand}-${colorMode}`);
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
 * Breakpoint configuration for media queries (mobile-first)
 */
const BREAKPOINT_CONFIG = {
  xs: { minWidth: null, order: 1 },      // Base, no media query
  sm: { minWidth: '390px', order: 2 },   // @media (min-width: 390px)
  md: { minWidth: '600px', order: 3 },   // @media (min-width: 600px)
  lg: { minWidth: '1024px', order: 4 }   // @media (min-width: 1024px)
};

/**
 * Converts data-breakpoint CSS files to responsive CSS with media queries
 * Mobile-first approach: XS = base, then min-width media queries
 */
async function convertToResponsiveCSS() {
  console.log('\n📱 Converting to Responsive CSS (Media Queries):\n');

  let successfulConversions = 0;

  for (const brand of BRANDS) {
    console.log(`  🏷️  ${brand}:`);

    // Process Typography files
    const typographyFiles = {};
    for (const breakpoint of BREAKPOINTS) {
      const filePath = path.join(DIST_DIR, 'css', 'brands', brand, 'semantic', 'typography', `typography-${breakpoint}.css`);
      if (fs.existsSync(filePath)) {
        typographyFiles[breakpoint] = fs.readFileSync(filePath, 'utf8');
      }
    }

    if (Object.keys(typographyFiles).length > 0) {
      const responsiveCSS = generateResponsiveTypographyCSS(typographyFiles, brand);
      const outputPath = path.join(DIST_DIR, 'css', 'brands', brand, 'semantic', 'typography', `typography-responsive.css`);
      fs.writeFileSync(outputPath, responsiveCSS);
      successfulConversions++;
      console.log(`     ✅ typography-responsive.css`);
    }

    // Process Component Typography files
    const componentsDir = path.join(TOKENS_DIR, 'brands', brand, 'components');
    if (fs.existsSync(componentsDir)) {
      const components = fs.readdirSync(componentsDir).filter(name => {
        return fs.statSync(path.join(componentsDir, name)).isDirectory();
      });

      for (const component of components) {
        const componentTypographyFiles = {};
        for (const breakpoint of BREAKPOINTS) {
          const filePath = path.join(DIST_DIR, 'css', 'brands', brand, 'components', component, `${component.toLowerCase()}-typography-${breakpoint}.css`);
          if (fs.existsSync(filePath)) {
            componentTypographyFiles[breakpoint] = fs.readFileSync(filePath, 'utf8');
          }
        }

        if (Object.keys(componentTypographyFiles).length > 0) {
          const responsiveCSS = generateResponsiveTypographyCSS(componentTypographyFiles, brand, component);
          const outputPath = path.join(DIST_DIR, 'css', 'brands', brand, 'components', component, `${component.toLowerCase()}-typography-responsive.css`);
          fs.writeFileSync(outputPath, responsiveCSS);
          successfulConversions++;
        }
      }
      console.log(`     ✅ ${components.length} component typography files`);
    }
  }

  console.log(`\n  Total: ${successfulConversions} responsive files generated`);
  return { totalConversions: successfulConversions };
}

/**
 * Generates responsive CSS with media queries from breakpoint-specific files
 */
function generateResponsiveTypographyCSS(breakpointFiles, brand, component = null) {
  const packageVersion = require('../package.json').version;
  const date = new Date().toISOString().split('T')[0];
  const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
  const context = component ? `Component: ${component}` : 'Semantic Typography';

  // Header
  let output = `/**
 * ============================================================================
 * ${brandName} Design System - Responsive Typography${component ? ` (${component})` : ''}
 * ============================================================================
 *
 * Brand: ${brandName}
 * ${context}
 * Version: ${packageVersion}
 * Generated: ${date}
 *
 * Uses CSS Media Queries (Mobile-First)
 * Base: XS (320px+) - No media query
 * SM: 390px+ - @media (min-width: 390px)
 * MD: 600px+ - @media (min-width: 600px)
 * LG: 1024px+ - @media (min-width: 1024px)
 *
 * Copyright (c) 2024 Axel Springer Deutschland GmbH
 * Proprietary and confidential. All rights reserved.
 * ============================================================================
 */

`;

  // Parse all breakpoint files and extract classes
  const classesByName = {};

  for (const breakpoint of BREAKPOINTS) {
    const css = breakpointFiles[breakpoint];
    if (!css) continue;

    // Extract all class definitions
    const classRegex = /\[data-brand="[^"]+"\]\[data-breakpoint="[^"]+"\]\s+\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/g;
    let match;

    while ((match = classRegex.exec(css)) !== null) {
      const className = match[1];
      const properties = match[2].trim();

      if (!classesByName[className]) {
        classesByName[className] = {};
      }

      classesByName[className][breakpoint] = properties;
    }
  }

  // Generate mobile-first responsive CSS
  const brandLowercase = brand.toLowerCase();

  output += `/* === RESPONSIVE TYPOGRAPHY${component ? ` - ${component.toUpperCase()}` : ''} === */\n\n`;
  output += `[data-brand="${brandLowercase}"][data-theme="light"],\n`;
  output += `[data-brand="${brandLowercase}"][data-theme="dark"] {\n`;

  // For each class, generate base + media queries
  Object.keys(classesByName).forEach(className => {
    const breakpointStyles = classesByName[className];

    // Base styles (XS)
    if (breakpointStyles.xs) {
      output += `  .${className} {\n`;
      const props = breakpointStyles.xs.split(';').map(p => p.trim()).filter(p => p);
      props.forEach(prop => {
        output += `    ${prop};\n`;
      });
      output += `  }\n\n`;
    }

    // Media queries for larger breakpoints (only if different from base)
    ['sm', 'md', 'lg'].forEach(breakpoint => {
      const currentStyles = breakpointStyles[breakpoint];
      if (!currentStyles) return;

      // Check if styles are different from XS
      const baseStyles = breakpointStyles.xs || '';
      if (currentStyles === baseStyles) return; // Skip if identical

      const config = BREAKPOINT_CONFIG[breakpoint];
      if (!config.minWidth) return;

      output += `  @media (min-width: ${config.minWidth}) {\n`;
      output += `    .${className} {\n`;
      const props = currentStyles.split(';').map(p => p.trim()).filter(p => p);
      props.forEach(prop => {
        output += `      ${prop};\n`;
      });
      output += `    }\n`;
      output += `  }\n\n`;
    });
  });

  output += `}\n`;

  return output;
}

/**
 * Creates Manifest
 */
function createManifest(stats) {
  console.log('\n📋 Creating Manifest...');

  const manifest = {
    generated: new Date().toISOString(),
    version: '2.0.0',
    statistics: {
      sharedPrimitives: stats.sharedPrimitives || { total: 0, successful: 0 },
      brandSpecific: stats.brandSpecific || { totalBuilds: 0, successfulBuilds: 0 },
      componentTokens: stats.componentTokens || { totalBuilds: 0, successfulBuilds: 0 },
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
          brands: 'css/brands/{brand}/ (with data-attributes)'
        },
        scss: {
          shared: 'scss/shared/',
          brands: 'scss/brands/{brand}/'
        },
        js: {
          shared: 'js/shared/',
          brands: 'js/brands/{brand}/'
        },
        json: {
          shared: 'json/shared/',
          brands: 'json/brands/{brand}/'
        },
        ios: {
          shared: 'ios/shared/',
          brands: 'ios/brands/{brand}/',
          sizeClasses: 'ios/brands/{brand}/sizeclass-{compact|regular}/'
        },
        android: {
          shared: 'android/res/values/shared/',
          brands: 'android/res/values/brands/{brand}/',
          sizeClasses: 'android/brands/{brand}/sizeclass-{compact|regular}/'
        },
        flutter: {
          shared: 'flutter/shared/',
          brands: 'flutter/brands/{brand}/'
        }
      }
    }
  };

  fs.writeFileSync(
    path.join(DIST_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  console.log('  ✅ Manifest created: dist/manifest.json');
}

/**
 * Main function
 */
async function main() {
  console.log('🎨 ============================================');
  console.log('   BILD Design System - Token Build v2');
  console.log('   ============================================\n');

  // Clean dist
  cleanDist();

  // Register custom config
  registerCustomConfig();

  // Check if tokens directory exists
  if (!fs.existsSync(TOKENS_DIR)) {
    console.error('❌ Tokens directory not found!');
    console.error('   Run "npm run preprocess" first.\n');
    process.exit(1);
  }

  const stats = {};

  // Build shared primitives
  stats.sharedPrimitives = await buildSharedPrimitives();

  // Build brand-specific tokens
  stats.brandSpecific = await buildBrandSpecificTokens();

  // Build component tokens
  stats.componentTokens = await buildComponentTokens();

  // Build typography tokens
  stats.typographyTokens = await buildTypographyTokens();

  // Convert to responsive CSS with media queries
  stats.responsiveCSS = await convertToResponsiveCSS();

  // Build effect tokens
  stats.effectTokens = await buildEffectTokens();

  // Create manifest
  createManifest(stats);

  // Summary
  console.log('\n✨ ============================================');
  console.log('   Build completed!');
  console.log('   ============================================\n');

  // Calculate total statistics for GitHub Actions
  const totalBuilds = stats.sharedPrimitives.total + stats.brandSpecific.totalBuilds +
                      stats.componentTokens.totalBuilds + stats.typographyTokens.totalBuilds +
                      stats.effectTokens.totalBuilds;
  const successfulBuilds = stats.sharedPrimitives.successful + stats.brandSpecific.successfulBuilds +
                           stats.componentTokens.successfulBuilds + stats.typographyTokens.successfulBuilds +
                           stats.effectTokens.successfulBuilds;

  console.log(`📊 Statistiken:`);
  console.log(`   - Shared Primitives: ${stats.sharedPrimitives.successful}/${stats.sharedPrimitives.total}`);
  console.log(`   - Brand-spezifische Tokens: ${stats.brandSpecific.successfulBuilds}/${stats.brandSpecific.totalBuilds}`);
  console.log(`   - Component Tokens: ${stats.componentTokens.successfulBuilds}/${stats.componentTokens.totalBuilds}`);
  console.log(`   - Typography Builds: ${stats.typographyTokens.successfulBuilds}/${stats.typographyTokens.totalBuilds}`);
  console.log(`   - Responsive CSS Files: ${stats.responsiveCSS.totalConversions}`);
  console.log(`   - Effect Builds: ${stats.effectTokens.successfulBuilds}/${stats.effectTokens.totalBuilds}`);
  console.log(`   - Builds erfolgreich: ${successfulBuilds}/${totalBuilds}`);
  console.log(`   - Output-Verzeichnis: dist/\n`);

  console.log(`📁 Struktur:`);
  console.log(`   dist/`);
  console.log(`   ├── css/        (CSS with data-attributes for theme switching)`);
  console.log(`   ├── scss/       (SCSS variables)`);
  console.log(`   ├── js/         (JavaScript ES6)`);
  console.log(`   ├── json/       (JSON)`);
  console.log(`   ├── ios/        (Swift)`);
  console.log(`   ├── android/    (Android XML resources)`);
  console.log(`   └── flutter/    (Dart classes)`);
  console.log(``);
  console.log(`   Each platform contains:`);
  console.log(`   - shared/              (primitives)`);
  console.log(`   - brands/{brand}/`);
  console.log(`       ├── density/       (3 modes)`);
  console.log(`       ├── overrides/     (brand mappings)`);
  console.log(`       ├── components/    (component-specific tokens)`);
  console.log(`       │   └── {Component}/  (color, density, breakpoint modes)`);
  console.log(`       └── semantic/`);
  console.log(`           ├── breakpoints/  (4 modes)`);
  console.log(`           ├── color/        (2 modes)`);
  console.log(`           ├── effects/      (2 color modes)`);
  console.log(`           └── typography/   (4 breakpoints)`);
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
