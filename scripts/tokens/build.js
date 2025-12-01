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
const customConfig = require('../../build-config/tokens/style-dictionary.config.js');

const TOKENS_DIR = path.join(__dirname, '../../tokens');
const DIST_DIR = path.join(__dirname, '../../dist');

// Brands and breakpoints
const BRANDS = ['bild', 'sportbild', 'advertorial'];
const BREAKPOINTS = ['xs', 'sm', 'md', 'lg'];
const COLOR_MODES = ['light', 'dark'];
const DENSITY_MODES = ['compact', 'default', 'spacious'];

// Native platforms only use compact (sm) and regular (lg) size classes
const NATIVE_BREAKPOINTS = ['sm', 'lg'];

// Platform output toggles - set to false to disable output generation
const FLUTTER_ENABLED = false;
const COMPOSE_ENABLED = true;

// Token type toggles - set to false to exclude from all platform outputs
const BOOLEAN_TOKENS_ENABLED = false;

// Size class mapping for native platforms
const SIZE_CLASS_MAPPING = {
  sm: 'compact',
  lg: 'regular'
};

// Helper to check if a breakpoint should be built for native platforms
function isNativeBreakpoint(breakpoint) {
  return NATIVE_BREAKPOINTS.includes(breakpoint);
}

// Helper to get sizeclass name from breakpoint
function getSizeClassName(breakpoint) {
  return SIZE_CLASS_MAPPING[breakpoint] || breakpoint;
}

/**
 * Creates platform configuration for standard tokens (Primitives, Brand-specific, etc.)
 * CSS version with data-attributes for runtime theme switching
 *
 * @param {string} buildPath - Base build path
 * @param {string} fileName - Output file name
 * @param {object} cssOptions - CSS-specific options { brand, mode, modeType }
 */
function createStandardPlatformConfig(buildPath, fileName, cssOptions = {}) {
  // Filter to exclude documentation-only tokens and disabled token types
  const tokenFilter = (token) => {
    // Exclude TextLabels tokens - these are documentation-only and cause name collisions
    if (token.path && token.path.includes('TextLabels')) {
      return false;
    }
    // Exclude boolean tokens when disabled (visibility tokens like hideOnMobile, etc.)
    if (!BOOLEAN_TOKENS_ENABLED && token.type === 'boolean') {
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
        // Use alias format for CSS to generate var(--primitive, fallback) references
        format: cssOptions.brand || cssOptions.mode ? 'custom/css/themed-variables-with-alias' : 'custom/css/variables-with-alias',
        filter: tokenFilter,
        options: {
          outputReferences: true,  // Enable var() references to primitives
          showDescriptions: false, // Disable token descriptions for cleaner CSS output
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
    // iOS: For breakpoint mode, use sizeclass folder and naming, skip non-native breakpoints
    ...((cssOptions.modeType === 'breakpoint' && !isNativeBreakpoint(cssOptions.mode)) ? {} : {
      ios: {
        transformGroup: 'custom/ios-swift',
        buildPath: (() => {
          let iosPath = buildPath.replace(DIST_DIR + '/css/', '');
          // For semantic breakpoint tokens, change folder from 'breakpoints' to 'sizeclass'
          if (cssOptions.modeType === 'breakpoint' && iosPath.includes('/breakpoints')) {
            iosPath = iosPath.replace('/breakpoints', '/sizeclass');
          }
          return `${DIST_DIR}/ios/${iosPath}/`;
        })(),
        files: [{
          destination: (() => {
            // For breakpoint tokens, use sizeclass naming
            if (cssOptions.modeType === 'breakpoint' && cssOptions.mode) {
              const sizeClass = getSizeClassName(cssOptions.mode);
              const isComponent = buildPath.includes('/components/');
              if (isComponent) {
                // Extract component name from path (e.g., .../components/Button/ -> Button)
                const componentMatch = buildPath.match(/\/components\/([^/]+)/);
                const componentName = componentMatch ? componentMatch[1] : '';
                return `${componentName}Sizeclass${sizeClass.charAt(0).toUpperCase() + sizeClass.slice(1)}.swift`;
              }
              return `Sizeclass${sizeClass.charAt(0).toUpperCase() + sizeClass.slice(1)}.swift`;
            }
            return `${fileName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}.swift`;
          })(),
          format: 'ios-swift/class',
          filter: tokenFilter,
          options: {
            outputReferences: false,
            className: (() => {
              if (cssOptions.modeType === 'breakpoint' && cssOptions.mode) {
                const sizeClass = getSizeClassName(cssOptions.mode);
                const isComponent = buildPath.includes('/components/');
                if (isComponent) {
                  const componentMatch = buildPath.match(/\/components\/([^/]+)/);
                  const componentName = componentMatch ? componentMatch[1] : '';
                  return `${componentName}Sizeclass${sizeClass.charAt(0).toUpperCase() + sizeClass.slice(1)}`;
                }
                return `Sizeclass${sizeClass.charAt(0).toUpperCase() + sizeClass.slice(1)}`;
              }
              return fileName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
            })()
          }
        }]
      }
    }),
    // Android: For breakpoint mode, use sizeclass folder and naming, skip non-native breakpoints
    ...((cssOptions.modeType === 'breakpoint' && !isNativeBreakpoint(cssOptions.mode)) ? {} : {
      android: {
        transformGroup: 'custom/android',
        buildPath: (() => {
          let androidPath = buildPath.replace(DIST_DIR + '/css/', '');
          // For semantic breakpoint tokens, change folder from 'breakpoints' to 'sizeclass'
          if (cssOptions.modeType === 'breakpoint' && androidPath.includes('/breakpoints')) {
            androidPath = androidPath.replace('/breakpoints', '/sizeclass');
          }
          return `${DIST_DIR}/android/res/values/${androidPath}/`;
        })(),
        files: [{
          destination: (() => {
            // For breakpoint tokens, use sizeclass naming
            if (cssOptions.modeType === 'breakpoint' && cssOptions.mode) {
              const sizeClass = getSizeClassName(cssOptions.mode);
              const isComponent = buildPath.includes('/components/');
              if (isComponent) {
                const componentMatch = buildPath.match(/\/components\/([^/]+)/);
                const componentName = componentMatch ? componentMatch[1].toLowerCase() : '';
                return `${componentName}-sizeclass-${sizeClass}.xml`;
              }
              return `sizeclass-${sizeClass}.xml`;
            }
            return `${fileName}.xml`;
          })(),
          format: 'android/resources',
          filter: tokenFilter,
          options: { outputReferences: false }
        }]
      }
    }),
    // Flutter: For breakpoint mode, use sizeclass folder and naming, skip non-native breakpoints
    ...((cssOptions.modeType === 'breakpoint' && !isNativeBreakpoint(cssOptions.mode)) || !FLUTTER_ENABLED ? {} : {
      flutter: {
        transformGroup: 'custom/flutter',
        buildPath: (() => {
          let flutterPath = buildPath.replace(DIST_DIR + '/css/', '');
          // For semantic breakpoint tokens, change folder from 'breakpoints' to 'sizeclass'
          if (cssOptions.modeType === 'breakpoint' && flutterPath.includes('/breakpoints')) {
            flutterPath = flutterPath.replace('/breakpoints', '/sizeclass');
          }
          return `${DIST_DIR}/flutter/${flutterPath}/`;
        })(),
        files: [{
          destination: (() => {
            // For breakpoint tokens, use sizeclass naming
            if (cssOptions.modeType === 'breakpoint' && cssOptions.mode) {
              const sizeClass = getSizeClassName(cssOptions.mode);
              const isComponent = buildPath.includes('/components/');
              if (isComponent) {
                const componentMatch = buildPath.match(/\/components\/([^/]+)/);
                const componentName = componentMatch ? componentMatch[1].toLowerCase() : '';
                return `${componentName}_sizeclass_${sizeClass}.dart`;
              }
              return `sizeclass_${sizeClass}.dart`;
            }
            return `${fileName}.dart`;
          })(),
          format: 'flutter/class',
          filter: tokenFilter,
          options: {
            outputReferences: false,
            className: (() => {
              if (cssOptions.modeType === 'breakpoint' && cssOptions.mode) {
                const sizeClass = getSizeClassName(cssOptions.mode);
                const isComponent = buildPath.includes('/components/');
                if (isComponent) {
                  const componentMatch = buildPath.match(/\/components\/([^/]+)/);
                  const componentName = componentMatch ? componentMatch[1] : '';
                  return `${componentName}Sizeclass${sizeClass.charAt(0).toUpperCase() + sizeClass.slice(1)}`;
                }
                return `Sizeclass${sizeClass.charAt(0).toUpperCase() + sizeClass.slice(1)}`;
              }
              return fileName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
            })()
          }
        }]
      }
    }),
    // Compose: For breakpoint mode, use sizeclass folder and naming, skip non-native breakpoints
    // For density mode, output all three density variants
    // Skip compose for overrides (brand mapping layer) - these are intermediate tokens not needed in final output
    ...((cssOptions.modeType === 'breakpoint' && !isNativeBreakpoint(cssOptions.mode)) || !COMPOSE_ENABLED || cssOptions.skipCompose ? {} : {
      compose: {
        transformGroup: 'custom/compose',
        buildPath: (() => {
          let composePath = buildPath.replace(DIST_DIR + '/css/', '');
          // For semantic breakpoint tokens, change folder from 'breakpoints' to 'sizeclass'
          if (cssOptions.modeType === 'breakpoint' && composePath.includes('/breakpoints')) {
            composePath = composePath.replace('/breakpoints', '/sizeclass');
          }
          return `${DIST_DIR}/compose/${composePath}/`;
        })(),
        files: [{
          destination: (() => {
            // For breakpoint tokens, use sizeclass naming
            if (cssOptions.modeType === 'breakpoint' && cssOptions.mode) {
              const sizeClass = getSizeClassName(cssOptions.mode);
              const isComponent = buildPath.includes('/components/');
              if (isComponent) {
                const componentMatch = buildPath.match(/\/components\/([^/]+)/);
                const componentName = componentMatch ? componentMatch[1] : '';
                return `${componentName}Sizing${sizeClass.charAt(0).toUpperCase() + sizeClass.slice(1)}.kt`;
              }
              return `Sizing${sizeClass.charAt(0).toUpperCase() + sizeClass.slice(1)}.kt`;
            }
            // For color mode tokens
            if (cssOptions.modeType === 'theme' && cssOptions.mode) {
              const modeName = cssOptions.mode.charAt(0).toUpperCase() + cssOptions.mode.slice(1);
              const isComponent = buildPath.includes('/components/');
              if (isComponent) {
                const componentMatch = buildPath.match(/\/components\/([^/]+)/);
                const componentName = componentMatch ? componentMatch[1] : '';
                return `${componentName}Colors${modeName}.kt`;
              }
              return `Colors${modeName}.kt`;
            }
            // For density tokens
            if (cssOptions.modeType === 'density' && cssOptions.mode) {
              const modeName = cssOptions.mode.charAt(0).toUpperCase() + cssOptions.mode.slice(1);
              const isComponent = buildPath.includes('/components/');
              if (isComponent) {
                const componentMatch = buildPath.match(/\/components\/([^/]+)/);
                const componentName = componentMatch ? componentMatch[1] : '';
                return `${componentName}Density${modeName}.kt`;
              }
              return `Density${modeName}.kt`;
            }
            // Default: PascalCase filename
            return `${fileName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}.kt`;
          })(),
          format: (() => {
            // Choose format based on token type
            if (buildPath.includes('/shared/')) {
              return 'compose/primitives';
            }
            // For components, use component-tokens format for all mode types
            if (buildPath.includes('/components/')) {
              return 'compose/component-tokens';
            }
            if (cssOptions.modeType === 'theme') {
              return 'compose/semantic-colors';
            }
            if (cssOptions.modeType === 'breakpoint' || cssOptions.modeType === 'density') {
              return 'compose/spacing';
            }
            return 'compose/primitives';
          })(),
          filter: tokenFilter,
          options: {
            outputReferences: false,
            packageName: (() => {
              const basePkg = 'com.bild.designsystem';
              if (buildPath.includes('/shared/')) {
                return `${basePkg}.shared`;
              }
              if (cssOptions.brand) {
                if (buildPath.includes('/components/')) {
                  return `${basePkg}.${cssOptions.brand}.components`;
                }
                return `${basePkg}.${cssOptions.brand}.semantic`;
              }
              return basePkg;
            })(),
            className: (() => {
              if (cssOptions.modeType === 'breakpoint' && cssOptions.mode) {
                const sizeClass = getSizeClassName(cssOptions.mode);
                return `Sizing${sizeClass.charAt(0).toUpperCase() + sizeClass.slice(1)}`;
              }
              return fileName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
            })(),
            brand: cssOptions.brand || '',
            mode: cssOptions.mode || '',
            modeType: (() => {
              if (cssOptions.modeType === 'breakpoint') return 'sizeclass';
              return cssOptions.modeType || '';
            })(),
            componentName: (() => {
              if (buildPath.includes('/components/')) {
                const componentMatch = buildPath.match(/\/components\/([^/]+)/);
                return componentMatch ? componentMatch[1] : '';
              }
              return '';
            })(),
            tokenType: (() => {
              if (cssOptions.modeType === 'theme') return 'color';
              if (cssOptions.modeType === 'breakpoint') return 'sizing';
              if (cssOptions.modeType === 'density') return 'density';
              return '';
            })()
          }
        }]
      }
    })
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

      // Flutter: Custom Typography format - only compact (sm) and regular (lg)
      // Output to semantic/typography/ with sizeclass in filename
      ...(FLUTTER_ENABLED && SIZE_CLASS_MAPPING[breakpoint] ? {
        flutter: {
          transforms: ['attribute/cti'],
          buildPath: `${DIST_DIR}/flutter/brands/${brand}/semantic/typography/`,
          files: [{
            destination: `typography_sizeclass_${SIZE_CLASS_MAPPING[breakpoint]}.dart`,
            format: 'flutter/typography',
            options: {
              brand: brandName,
              breakpoint,
              sizeClass: SIZE_CLASS_MAPPING[breakpoint]
            }
          }]
        }
      } : {}),

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
      // Output to semantic/typography/ with sizeclass in filename
      ...(SIZE_CLASS_MAPPING[breakpoint] ? {
        ios: {
          transforms: ['attribute/cti'],
          buildPath: `${DIST_DIR}/ios/brands/${brand}/semantic/typography/`,
          files: [{
            destination: `TypographySizeclass${SIZE_CLASS_MAPPING[breakpoint].charAt(0).toUpperCase() + SIZE_CLASS_MAPPING[breakpoint].slice(1)}.swift`,
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
      // Output to semantic/typography/ with sizeclass in filename
      ...(SIZE_CLASS_MAPPING[breakpoint] ? {
        android: {
          transforms: ['attribute/cti'],
          buildPath: `${DIST_DIR}/android/brands/${brand}/semantic/typography/`,
          files: [{
            destination: `typography-sizeclass-${SIZE_CLASS_MAPPING[breakpoint]}.xml`,
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
      ...(FLUTTER_ENABLED ? {
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
        }
      } : {}),

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

    // Overrides (Brand Mapping Layer) - DISABLED
    // These intermediate tokens are NOT needed in the output because:
    // 1. Semantic/Component tokens already contain resolved brand-specific values
    // 2. CSS references primitives directly (var(--bildred)), not brand mapping (--core-color-primary)
    // 3. No other tokens reference the brand mapping layer for alias resolution
    // 4. The values are redundant copies of what's already in primitives + semantic tokens
    //
    // If you need to re-enable for debugging/documentation purposes, uncomment below:
    /*
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
    */
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
      // iOS: Only compact (sm) and regular (lg) with sizeclass naming
      ...(breakpoint && isNativeBreakpoint(breakpoint) ? {
        ios: {
          transforms: ['attribute/cti'],
          buildPath: `${DIST_DIR}/ios/brands/${brand}/components/${componentName}/`,
          files: [{
            destination: `${componentName}Sizeclass${getSizeClassName(breakpoint).charAt(0).toUpperCase() + getSizeClassName(breakpoint).slice(1)}.swift`,
            format: 'ios-swift/typography',
            options: {
              brand: brandName,
              breakpoint,
              componentName,
              sizeClass: getSizeClassName(breakpoint)
            }
          }]
        }
      } : {}),
      // Flutter: Only compact (sm) and regular (lg) with sizeclass naming
      ...(FLUTTER_ENABLED && breakpoint && isNativeBreakpoint(breakpoint) ? {
        flutter: {
          transforms: ['attribute/cti'],
          buildPath: `${DIST_DIR}/flutter/brands/${brand}/components/${componentName}/`,
          files: [{
            destination: `${componentName.toLowerCase()}_sizeclass_${getSizeClassName(breakpoint)}.dart`,
            format: 'flutter/typography',
            options: {
              brand: brandName,
              breakpoint,
              componentName,
              sizeClass: getSizeClassName(breakpoint)
            }
          }]
        }
      } : {}),
      // Android: Only compact (sm) and regular (lg) with sizeclass naming
      ...(breakpoint && isNativeBreakpoint(breakpoint) ? {
        android: {
          transforms: ['attribute/cti'],
          buildPath: `${DIST_DIR}/android/brands/${brand}/components/${componentName}/`,
          files: [{
            destination: `${componentName.toLowerCase()}-sizeclass-${getSizeClassName(breakpoint)}.xml`,
            format: 'android/typography-styles',
            options: {
              brand: brandName,
              breakpoint,
              componentName
            }
          }]
        }
      } : {}),
      // Compose: Only compact (sm) and regular (lg) with sizeclass naming
      ...(COMPOSE_ENABLED && breakpoint && isNativeBreakpoint(breakpoint) ? {
        compose: {
          transforms: ['attribute/cti'],
          buildPath: `${DIST_DIR}/compose/brands/${brand}/components/${componentName}/`,
          files: [{
            destination: `${componentName}Typography${getSizeClassName(breakpoint).charAt(0).toUpperCase() + getSizeClassName(breakpoint).slice(1)}.kt`,
            format: 'compose/typography',
            options: {
              packageName: `com.bild.designsystem.${brand}.components`,
              brand: brand,
              mode: getSizeClassName(breakpoint),
              componentName
            }
          }]
        }
      } : {})
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
      ...(FLUTTER_ENABLED ? {
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
        }
      } : {}),
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
 * Converts breakpoint-based typography files to responsive CSS with media queries
 */
async function convertToResponsiveCSS() {
  console.log('\n📱 Converting to Responsive CSS with Media Queries:\n');

  const breakpointConfig = {
    xs: null,           // base, no media query
    sm: '390px',
    md: '600px',
    lg: '1024px'
  };

  let totalConversions = 0;
  let successfulConversions = 0;

  // Only process CSS files
  const cssDir = path.join(DIST_DIR, 'css', 'brands');

  for (const brand of BRANDS) {
    const brandDir = path.join(cssDir, brand);
    if (!fs.existsSync(brandDir)) continue;

    console.log(`  🏷️  ${brand}:`);

    // Process semantic typography
    const semanticTypographyDir = path.join(brandDir, 'semantic', 'typography');
    if (fs.existsSync(semanticTypographyDir)) {
      const semanticFiles = fs.readdirSync(semanticTypographyDir)
        .filter(f => f.endsWith('-xs.css'));

      for (const baseFile of semanticFiles) {
        const baseName = baseFile.replace('-xs.css', '');
        totalConversions++;

        try {
          // Typography uses var() references that respond to breakpoints automatically,
          // so skip media queries to avoid redundant class definitions
          const responsiveContent = await generateResponsiveFile(
            semanticTypographyDir,
            baseName,
            brand,
            breakpointConfig,
            { skipMediaQueries: true }
          );

          const outputPath = path.join(semanticTypographyDir, `${baseName}-responsive.css`);
          fs.writeFileSync(outputPath, responsiveContent, 'utf-8');
          successfulConversions++;
          console.log(`     ✅ semantic/${baseName}-responsive.css`);

          // Cleanup: Remove individual breakpoint files (redundant for CSS)
          for (const bp of BREAKPOINTS) {
            const bpFile = path.join(semanticTypographyDir, `${baseName}-${bp}.css`);
            if (fs.existsSync(bpFile)) {
              fs.unlinkSync(bpFile);
            }
          }
        } catch (error) {
          console.error(`     ❌ Error: semantic/${baseName} - ${error.message}`);
        }
      }
    }

    // Process semantic breakpoints
    const semanticBreakpointsDir = path.join(brandDir, 'semantic', 'breakpoints');
    if (fs.existsSync(semanticBreakpointsDir)) {
      const breakpointFiles = fs.readdirSync(semanticBreakpointsDir)
        .filter(f => f.includes('-xs-') && f.endsWith('.css'));

      for (const baseFile of breakpointFiles) {
        totalConversions++;

        try {
          const responsiveContent = await generateResponsiveBreakpointFile(
            semanticBreakpointsDir,
            brand,
            breakpointConfig
          );

          const outputPath = path.join(semanticBreakpointsDir, 'breakpoint-responsive.css');
          fs.writeFileSync(outputPath, responsiveContent, 'utf-8');
          successfulConversions++;
          console.log(`     ✅ semantic/breakpoint-responsive.css`);

          // Cleanup: Remove individual data-attribute breakpoint files (replaced by responsive file)
          const allBpFiles = fs.readdirSync(semanticBreakpointsDir)
            .filter(f => f.endsWith('.css') && f !== 'breakpoint-responsive.css');
          for (const bpFile of allBpFiles) {
            const filePath = path.join(semanticBreakpointsDir, bpFile);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }

          break; // Only generate once per brand
        } catch (error) {
          console.error(`     ❌ Error: semantic/breakpoints - ${error.message}`);
          break;
        }
      }
    }

    // Process component typography
    const componentsDir = path.join(brandDir, 'components');
    if (fs.existsSync(componentsDir)) {
      const componentFolders = fs.readdirSync(componentsDir)
        .filter(f => fs.statSync(path.join(componentsDir, f)).isDirectory());

      for (const component of componentFolders) {
        const componentDir = path.join(componentsDir, component);
        const typographyFiles = fs.readdirSync(componentDir)
          .filter(f => f.endsWith('-xs.css') && f.includes('typography'));

        for (const baseFile of typographyFiles) {
          const baseName = baseFile.replace('-xs.css', '');
          totalConversions++;

          try {
            // Typography uses var() references that respond to breakpoints automatically,
            // so skip media queries to avoid redundant class definitions
            const responsiveContent = await generateResponsiveFile(
              componentDir,
              baseName,
              brand,
              breakpointConfig,
              { skipMediaQueries: true }
            );

            const outputPath = path.join(componentDir, `${baseName}-responsive.css`);
            fs.writeFileSync(outputPath, responsiveContent, 'utf-8');
            successfulConversions++;
            console.log(`     ✅ ${component}/${baseName}-responsive.css`);

            // Cleanup: Remove individual breakpoint files (redundant for CSS)
            for (const bp of BREAKPOINTS) {
              const bpFile = path.join(componentDir, `${baseName}-${bp}.css`);
              if (fs.existsSync(bpFile)) {
                fs.unlinkSync(bpFile);
              }
            }
          } catch (error) {
            console.error(`     ❌ Error: ${component}/${baseName} - ${error.message}`);
          }
        }

        // Process component breakpoint tokens (non-typography, non-effects)
        // Convert data-breakpoint selectors to @media queries
        const breakpointFiles = fs.readdirSync(componentDir)
          .filter(f => f.endsWith('.css') && f.includes('-breakpoint-') && !f.includes('responsive'));

        if (breakpointFiles.length > 0) {
          totalConversions++;

          try {
            const responsiveContent = await generateComponentBreakpointResponsive(
              componentDir,
              component.toLowerCase(),
              brand,
              breakpointConfig
            );

            const outputPath = path.join(componentDir, `${component.toLowerCase()}-breakpoint-responsive.css`);
            fs.writeFileSync(outputPath, responsiveContent, 'utf-8');
            successfulConversions++;
            console.log(`     ✅ ${component}/${component.toLowerCase()}-breakpoint-responsive.css`);

            // Cleanup: Remove individual breakpoint files (redundant for CSS)
            for (const bpFile of breakpointFiles) {
              const filePath = path.join(componentDir, bpFile);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            }
          } catch (error) {
            console.error(`     ❌ Error: ${component}/breakpoints - ${error.message}`);
          }
        }
      }
    }
  }

  return { totalConversions, successfulConversions };
}

/**
 * Generates a responsive CSS file with media queries from breakpoint files
 * For Typography: Only output base styles (XS) since var() references handle responsiveness
 */
async function generateResponsiveFile(dir, baseName, brand, breakpointConfig, options = {}) {
  const { skipMediaQueries = false } = options;
  const breakpointFiles = {};

  // Read all breakpoint files
  for (const bp of BREAKPOINTS) {
    const filePath = path.join(dir, `${baseName}-${bp}.css`);
    if (fs.existsSync(filePath)) {
      breakpointFiles[bp] = fs.readFileSync(filePath, 'utf-8');
    }
  }

  if (Object.keys(breakpointFiles).length === 0) {
    throw new Error('No breakpoint files found');
  }

  // Extract header from first file
  const firstFile = breakpointFiles.xs || breakpointFiles.sm || breakpointFiles.md || breakpointFiles.lg;
  const headerMatch = firstFile.match(/^\/\*\*[\s\S]*?\*\//);
  const header = headerMatch ? headerMatch[0].replace(/Breakpoint: \w+/, 'Responsive (Media Queries)') : '';

  let output = header + '\n\n';

  // Extract CSS classes from each breakpoint
  const breakpointClasses = {};
  for (const [bp, content] of Object.entries(breakpointFiles)) {
    const classes = extractClasses(content, brand, bp);
    breakpointClasses[bp] = classes;
  }

  // Generate responsive CSS with media queries
  output += `[data-brand="${brand}"] {\n`;

  // Base styles (XS)
  if (breakpointClasses.xs && breakpointClasses.xs.length > 0) {
    for (const cls of breakpointClasses.xs) {
      output += `  .${cls.name} {\n`;
      for (const prop of cls.properties) {
        output += `    ${prop}\n`;
      }
      output += `  }\n\n`;
    }
  }

  // Media queries for SM, MD, LG - skip if using var() references (Typography)
  if (!skipMediaQueries) {
    for (const bp of ['sm', 'md', 'lg']) {
      if (breakpointClasses[bp] && breakpointClasses[bp].length > 0 && breakpointConfig[bp]) {
        output += `  @media (min-width: ${breakpointConfig[bp]}) {\n`;
        for (const cls of breakpointClasses[bp]) {
          output += `    .${cls.name} {\n`;
          for (const prop of cls.properties) {
            output += `      ${prop}\n`;
          }
          output += `    }\n\n`;
        }
        output += `  }\n\n`;
      }
    }
  }

  output += `}\n`;

  return output;
}

/**
 * Generates a responsive breakpoint CSS file with media queries from breakpoint files
 */
async function generateResponsiveBreakpointFile(dir, brand, breakpointConfig) {
  const breakpointFiles = {};

  // Read all breakpoint files
  for (const bp of BREAKPOINTS) {
    const files = fs.readdirSync(dir).filter(f => f.includes(`-${bp}-`) && f.endsWith('.css'));
    if (files.length > 0) {
      const filePath = path.join(dir, files[0]);
      if (fs.existsSync(filePath)) {
        breakpointFiles[bp] = fs.readFileSync(filePath, 'utf-8');
      }
    }
  }

  if (Object.keys(breakpointFiles).length === 0) {
    throw new Error('No breakpoint files found');
  }

  // Extract header from first file
  const firstFile = breakpointFiles.xs || breakpointFiles.sm || breakpointFiles.md || breakpointFiles.lg;
  const headerMatch = firstFile.match(/^\/\*\*[\s\S]*?\*\//);
  let header = headerMatch ? headerMatch[0] : '';
  header = header.replace(/Breakpoint: \w+/, 'Responsive (Media Queries)');
  header = header.replace(/Context: breakpoint: \w+/i, 'Context: Responsive (Media Queries)');

  let output = header + '\n\n';

  // Extract CSS variables from each breakpoint as key-value maps
  const breakpointVarMaps = {};
  for (const [bp, content] of Object.entries(breakpointFiles)) {
    breakpointVarMaps[bp] = parseVariablesToMap(extractRootVariables(content));
  }

  // Get base values (XS)
  const baseVars = breakpointVarMaps.xs || breakpointVarMaps.sm || breakpointVarMaps.md || breakpointVarMaps.lg;

  // Generate responsive CSS with media queries using [data-brand] selector
  output += `[data-brand="${brand}"] {\n`;
  if (baseVars && Object.keys(baseVars).length > 0) {
    for (const [varName, value] of Object.entries(baseVars)) {
      output += `  ${varName}: ${value};\n`;
    }
  }
  output += `}\n\n`;

  // Media queries for SM, MD, LG - only output CHANGED values
  for (const bp of ['sm', 'md', 'lg']) {
    if (breakpointVarMaps[bp] && breakpointConfig[bp]) {
      const changedVars = getChangedVariables(baseVars, breakpointVarMaps[bp]);

      if (Object.keys(changedVars).length > 0) {
        output += `@media (min-width: ${breakpointConfig[bp]}) {\n`;
        output += `  [data-brand="${brand}"] {\n`;
        for (const [varName, value] of Object.entries(changedVars)) {
          output += `    ${varName}: ${value};\n`;
        }
        output += `  }\n`;
        output += `}\n\n`;
      }
    }
  }

  return output;
}

/**
 * Generates a responsive CSS file with media queries for component breakpoint tokens
 * Converts [data-brand][data-breakpoint] selectors to @media queries with [data-brand] only
 * Only outputs values that change between breakpoints to minimize redundancy
 */
async function generateComponentBreakpointResponsive(dir, componentName, brand, breakpointConfig) {
  const breakpointFiles = {};
  const fileMapping = {
    xs: null,
    sm: null,
    md: null,
    lg: null
  };

  // Find breakpoint files by pattern
  const files = fs.readdirSync(dir).filter(f => f.includes('-breakpoint-') && f.endsWith('.css'));

  for (const file of files) {
    if (file.includes('-xs-')) fileMapping.xs = file;
    else if (file.includes('-sm-')) fileMapping.sm = file;
    else if (file.includes('-md-')) fileMapping.md = file;
    else if (file.includes('-lg-')) fileMapping.lg = file;
  }

  // Read all breakpoint files
  for (const [bp, fileName] of Object.entries(fileMapping)) {
    if (fileName) {
      const filePath = path.join(dir, fileName);
      if (fs.existsSync(filePath)) {
        breakpointFiles[bp] = fs.readFileSync(filePath, 'utf-8');
      }
    }
  }

  if (Object.keys(breakpointFiles).length === 0) {
    throw new Error('No breakpoint files found');
  }

  // Extract header from first file
  const firstFile = breakpointFiles.xs || breakpointFiles.sm || breakpointFiles.md || breakpointFiles.lg;
  const headerMatch = firstFile.match(/^\/\*\*[\s\S]*?\*\//);
  let header = headerMatch ? headerMatch[0] : '';
  header = header.replace(/breakpoint: \w+/i, 'Responsive (Media Queries)');
  header = header.replace(/Context: breakpoint: \w+/i, 'Context: Responsive (Media Queries)');

  let output = header + '\n\n';

  // Extract CSS variables from each breakpoint as key-value maps
  const breakpointVarMaps = {};
  for (const [bp, content] of Object.entries(breakpointFiles)) {
    breakpointVarMaps[bp] = parseVariablesToMap(extractRootVariables(content));
  }

  // Get base values (XS)
  const baseVars = breakpointVarMaps.xs || breakpointVarMaps.sm || breakpointVarMaps.md || breakpointVarMaps.lg;

  // Generate responsive CSS with media queries
  // Base styles (XS) - use [data-brand] selector
  output += `[data-brand="${brand}"] {\n`;
  if (baseVars && Object.keys(baseVars).length > 0) {
    for (const [varName, value] of Object.entries(baseVars)) {
      output += `  ${varName}: ${value};\n`;
    }
  }
  output += `}\n\n`;

  // Media queries for SM, MD, LG - only output CHANGED values
  for (const bp of ['sm', 'md', 'lg']) {
    if (breakpointVarMaps[bp] && breakpointConfig[bp]) {
      const changedVars = getChangedVariables(baseVars, breakpointVarMaps[bp]);

      if (Object.keys(changedVars).length > 0) {
        output += `@media (min-width: ${breakpointConfig[bp]}) {\n`;
        output += `  [data-brand="${brand}"] {\n`;
        for (const [varName, value] of Object.entries(changedVars)) {
          output += `    ${varName}: ${value};\n`;
        }
        output += `  }\n`;
        output += `}\n\n`;
      }
    }
  }

  return output;
}

/**
 * Extracts CSS custom property declarations from data-attribute selector
 */
function extractRootVariables(content) {
  const variables = [];

  // Match [data-brand="..."][data-breakpoint="..."] { ... } or :root { ... }
  const selectorMatch = content.match(/(?:\[data-brand="[^"]+"\]\[data-breakpoint="[^"]+"\]|:root)\s*\{([\s\S]*)\}/);
  if (selectorMatch) {
    const selectorContent = selectorMatch[1];

    // Extract all CSS custom properties (--variable-name: value;)
    // This regex handles multi-line values and comments
    const lines = selectorContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      // Match CSS custom property declaration
      if (trimmed.startsWith('--') && trimmed.includes(':')) {
        // Remove inline comments but keep the declaration
        const cleanLine = trimmed.replace(/\/\*.*?\*\//g, '').trim();
        if (cleanLine && cleanLine.endsWith(';')) {
          variables.push(cleanLine);
        }
      }
    }
  }

  return variables;
}

/**
 * Parses an array of CSS variable declarations into a name-value map
 * @param {string[]} variables - Array of declarations like "--var-name: value;"
 * @returns {Object} - Map of variable names to values
 */
function parseVariablesToMap(variables) {
  const map = {};
  for (const decl of variables) {
    // Parse "--var-name: value;" into name and value
    const colonIndex = decl.indexOf(':');
    if (colonIndex > 0) {
      const name = decl.substring(0, colonIndex).trim();
      // Remove trailing semicolon from value
      let value = decl.substring(colonIndex + 1).trim();
      if (value.endsWith(';')) {
        value = value.slice(0, -1).trim();
      }
      map[name] = value;
    }
  }
  return map;
}

/**
 * Compares two variable maps and returns only the variables that have different values
 * @param {Object} baseVars - Base (XS) variables map
 * @param {Object} compareVars - Variables to compare against base
 * @returns {Object} - Map of variables that have changed
 */
function getChangedVariables(baseVars, compareVars) {
  const changed = {};
  for (const [name, value] of Object.entries(compareVars)) {
    // Include if value is different from base, or if it's a new variable
    if (baseVars[name] !== value) {
      changed[name] = value;
    }
  }
  return changed;
}

/**
 * Extracts CSS classes from a file
 */
function extractClasses(content, brand, breakpoint) {
  const classes = [];

  // Check if content uses data-attribute selectors or plain classes
  const hasDataAttributes = content.includes(`[data-brand="${brand}"][data-breakpoint="${breakpoint}"]`);

  if (hasDataAttributes) {
    // Component typography with data attributes
    const selector = `[data-brand="${brand}"][data-breakpoint="${breakpoint}"]`;
    const classRegex = new RegExp(`\\/\\*[\\s\\S]*?\\*\\/\\s*${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+\\.(\\S+)\\s*{([^}]*)}`, 'g');
    let match;

    while ((match = classRegex.exec(content)) !== null) {
      const className = match[1];
      const properties = match[2]
        .split(';')
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => p + ';');

      classes.push({
        name: className,
        properties
      });
    }
  } else {
    // Semantic typography without data attributes
    const classRegex = /\/\*[\s\S]*?\*\/\s*\.([\w-]+)\s*{([^}]*)}/g;
    let match;

    while ((match = classRegex.exec(content)) !== null) {
      const className = match[1];
      const properties = match[2]
        .split(';')
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => p + ';');

      classes.push({
        name: className,
        properties
      });
    }
  }

  return classes;
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
      effectTokens: stats.effectTokens || { totalBuilds: 0, successfulBuilds: 0 },
      responsiveCSS: stats.responsiveCSS || { totalConversions: 0, successfulConversions: 0 }
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
        ...(FLUTTER_ENABLED ? {
          flutter: {
            shared: 'flutter/shared/',
            brands: 'flutter/brands/{brand}/'
          }
        } : {})
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
 * Aggregates individual Compose component files into single files per component
 * Creates: dist/compose/brands/{brand}/components/{Component}/{Component}Tokens.kt
 */
async function aggregateComposeComponents() {
  if (!COMPOSE_ENABLED) {
    return { totalComponents: 0, successfulComponents: 0 };
  }

  console.log('📦 Aggregating Compose component files...');

  let totalComponents = 0;
  let successfulComponents = 0;

  const composeDir = path.join(DIST_DIR, 'compose', 'brands');

  if (!fs.existsSync(composeDir)) {
    console.log('  ⚠️  No Compose output found, skipping aggregation');
    return { totalComponents: 0, successfulComponents: 0 };
  }

  for (const brand of BRANDS) {
    const brandComponentsDir = path.join(composeDir, brand, 'components');

    if (!fs.existsSync(brandComponentsDir)) {
      continue;
    }

    const componentDirs = fs.readdirSync(brandComponentsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const componentName of componentDirs) {
      totalComponents++;
      const componentDir = path.join(brandComponentsDir, componentName);
      const ktFiles = fs.readdirSync(componentDir)
        .filter(f => f.endsWith('.kt'))
        .sort();

      if (ktFiles.length === 0) continue;

      try {
        // Parse all individual files and collect tokens
        const tokenGroups = {
          colors: { light: [], dark: [] },
          sizing: { compact: [], regular: [] },
          density: { compact: [], default: [], spacious: [] },
          typography: { compact: [], regular: [] }
        };

        for (const ktFile of ktFiles) {
          const content = fs.readFileSync(path.join(componentDir, ktFile), 'utf8');
          const tokens = parseKotlinTokens(content);

          // Categorize based on filename
          const lowerFile = ktFile.toLowerCase();
          if (lowerFile.includes('colorslight')) {
            tokenGroups.colors.light = tokens;
          } else if (lowerFile.includes('colorsdark')) {
            tokenGroups.colors.dark = tokens;
          } else if (lowerFile.includes('sizingcompact')) {
            tokenGroups.sizing.compact = tokens;
          } else if (lowerFile.includes('sizingregular')) {
            tokenGroups.sizing.regular = tokens;
          } else if (lowerFile.includes('densitycompact')) {
            tokenGroups.density.compact = tokens;
          } else if (lowerFile.includes('densitydefault')) {
            tokenGroups.density.default = tokens;
          } else if (lowerFile.includes('densityspacious')) {
            tokenGroups.density.spacious = tokens;
          } else if (lowerFile.includes('typographycompact')) {
            tokenGroups.typography.compact = tokens;
          } else if (lowerFile.includes('typographyregular')) {
            tokenGroups.typography.regular = tokens;
          }
        }

        // Generate aggregated file
        const aggregatedContent = generateAggregatedComponentFile(
          brand,
          componentName,
          tokenGroups
        );

        // Write aggregated file
        const outputPath = path.join(componentDir, `${componentName}Tokens.kt`);
        fs.writeFileSync(outputPath, aggregatedContent, 'utf8');

        console.log(`     ✅ ${brand}/${componentName}Tokens.kt`);
        successfulComponents++;

      } catch (error) {
        console.error(`     ❌ ${brand}/${componentName}: ${error.message}`);
      }
    }
  }

  console.log(`  📊 Aggregated: ${successfulComponents}/${totalComponents} components\n`);
  return { totalComponents, successfulComponents };
}

/**
 * Parses Kotlin token file and extracts val declarations
 */
function parseKotlinTokens(content) {
  const tokens = [];
  const valRegex = /val\s+(\w+)\s*=\s*(.+)/g;
  let match;

  while ((match = valRegex.exec(content)) !== null) {
    tokens.push({
      name: match[1],
      value: match[2].trim()
    });
  }

  return tokens;
}

/**
 * Generates aggregated Kotlin file with nested objects
 */
function generateAggregatedComponentFile(brand, componentName, tokenGroups) {
  const brandPascal = brand.charAt(0).toUpperCase() + brand.slice(1);
  const packageJson = require('../../package.json');
  const version = packageJson.version;

  // Determine required imports based on token values
  const allTokens = [
    ...tokenGroups.colors.light,
    ...tokenGroups.colors.dark,
    ...tokenGroups.sizing.compact,
    ...tokenGroups.sizing.regular,
    ...tokenGroups.density.compact,
    ...tokenGroups.density.default,
    ...tokenGroups.density.spacious,
    ...tokenGroups.typography.compact,
    ...tokenGroups.typography.regular
  ];

  const hasColor = allTokens.some(t => t.value.includes('Color('));
  const hasDp = allTokens.some(t => t.value.includes('.dp'));
  const hasSp = allTokens.some(t => t.value.includes('.sp'));

  const imports = ['import androidx.compose.runtime.Immutable'];
  if (hasColor) imports.push('import androidx.compose.ui.graphics.Color');
  if (hasDp || hasSp) imports.push('import androidx.compose.ui.unit.Dp');
  if (hasDp) imports.push('import androidx.compose.ui.unit.dp');
  if (hasSp) imports.push('import androidx.compose.ui.unit.sp');

  let output = `/**
 * Do not edit directly, this file was auto-generated.
 *
 * BILD Design System Tokens v${version}
 * Generated by Style Dictionary
 *
 * Component: ${componentName} | Brand: ${brandPascal}
 * Aggregated component tokens with all modes
 *
 * Copyright (c) 2024 Axel Springer Deutschland GmbH
 */

package com.bild.designsystem.${brand}.components

${imports.join('\n')}

/**
 * ${componentName} Design Tokens
 *
 * Usage:
 *   ${componentName}Tokens.Colors.Light.primaryBgIdle
 *   ${componentName}Tokens.Sizing.Compact.height
 *   ${componentName}Tokens.Density.Default.contentGap
 */
object ${componentName}Tokens {
`;

  // Colors section
  if (tokenGroups.colors.light.length > 0 || tokenGroups.colors.dark.length > 0) {
    output += `
    // ══════════════════════════════════════════════════════════════
    // COLORS
    // ══════════════════════════════════════════════════════════════
    object Colors {
`;
    if (tokenGroups.colors.light.length > 0) {
      output += `        object Light {\n`;
      tokenGroups.colors.light.forEach(t => {
        output += `            val ${t.name} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    if (tokenGroups.colors.dark.length > 0) {
      output += `        object Dark {\n`;
      tokenGroups.colors.dark.forEach(t => {
        output += `            val ${t.name} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    output += `    }\n`;
  }

  // Sizing section
  if (tokenGroups.sizing.compact.length > 0 || tokenGroups.sizing.regular.length > 0) {
    output += `
    // ══════════════════════════════════════════════════════════════
    // SIZING (WindowSizeClass)
    // ══════════════════════════════════════════════════════════════
    object Sizing {
`;
    if (tokenGroups.sizing.compact.length > 0) {
      output += `        object Compact {\n`;
      tokenGroups.sizing.compact.forEach(t => {
        output += `            val ${t.name} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    if (tokenGroups.sizing.regular.length > 0) {
      output += `        object Regular {\n`;
      tokenGroups.sizing.regular.forEach(t => {
        output += `            val ${t.name} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    output += `    }\n`;
  }

  // Density section
  if (tokenGroups.density.compact.length > 0 ||
      tokenGroups.density.default.length > 0 ||
      tokenGroups.density.spacious.length > 0) {
    output += `
    // ══════════════════════════════════════════════════════════════
    // DENSITY
    // ══════════════════════════════════════════════════════════════
    object Density {
`;
    if (tokenGroups.density.compact.length > 0) {
      output += `        object Compact {\n`;
      tokenGroups.density.compact.forEach(t => {
        output += `            val ${t.name} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    if (tokenGroups.density.default.length > 0) {
      output += `        object Default {\n`;
      tokenGroups.density.default.forEach(t => {
        output += `            val ${t.name} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    if (tokenGroups.density.spacious.length > 0) {
      output += `        object Spacious {\n`;
      tokenGroups.density.spacious.forEach(t => {
        output += `            val ${t.name} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    output += `    }\n`;
  }

  // Typography section
  if (tokenGroups.typography.compact.length > 0 || tokenGroups.typography.regular.length > 0) {
    output += `
    // ══════════════════════════════════════════════════════════════
    // TYPOGRAPHY
    // ══════════════════════════════════════════════════════════════
    object Typography {
`;
    if (tokenGroups.typography.compact.length > 0) {
      output += `        object Compact {\n`;
      tokenGroups.typography.compact.forEach(t => {
        output += `            val ${t.name} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    if (tokenGroups.typography.regular.length > 0) {
      output += `        object Regular {\n`;
      tokenGroups.typography.regular.forEach(t => {
        output += `            val ${t.name} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    output += `    }\n`;
  }

  output += `}
`;

  return output;
}

/**
 * Generates Theme Provider files for each brand
 * Creates: dist/compose/brands/{brand}/theme/{Brand}Theme.kt
 */
async function generateComposeThemeProviders() {
  if (!COMPOSE_ENABLED) {
    return { totalThemes: 0, successfulThemes: 0 };
  }

  console.log('🎨 Generating Compose Theme Providers...');

  let totalThemes = 0;
  let successfulThemes = 0;

  const composeDir = path.join(DIST_DIR, 'compose', 'brands');

  if (!fs.existsSync(composeDir)) {
    console.log('  ⚠️  No Compose output found, skipping theme generation');
    return { totalThemes: 0, successfulThemes: 0 };
  }

  for (const brand of BRANDS) {
    totalThemes++;
    const brandDir = path.join(composeDir, brand);

    if (!fs.existsSync(brandDir)) {
      continue;
    }

    try {
      // Create theme directory
      const themeDir = path.join(brandDir, 'theme');
      if (!fs.existsSync(themeDir)) {
        fs.mkdirSync(themeDir, { recursive: true });
      }

      // Generate Theme Provider
      const themeContent = generateThemeProviderFile(brand);
      const themeFile = path.join(themeDir, `${brand.charAt(0).toUpperCase() + brand.slice(1)}Theme.kt`);
      fs.writeFileSync(themeFile, themeContent, 'utf8');

      console.log(`     ✅ ${brand}/theme/${brand.charAt(0).toUpperCase() + brand.slice(1)}Theme.kt`);
      successfulThemes++;

    } catch (error) {
      console.error(`     ❌ ${brand}: ${error.message}`);
    }
  }

  console.log(`  📊 Generated: ${successfulThemes}/${totalThemes} theme providers\n`);
  return { totalThemes, successfulThemes };
}

/**
 * Generates the Theme Provider Kotlin file content
 */
function generateThemeProviderFile(brand) {
  const brandPascal = brand.charAt(0).toUpperCase() + brand.slice(1);
  const packageJson = require('../../package.json');
  const version = packageJson.version;

  return `/**
 * Do not edit directly, this file was auto-generated.
 *
 * BILD Design System Tokens v${version}
 * Generated by Style Dictionary
 *
 * Theme Provider for ${brandPascal}
 * Provides CompositionLocal-based theming for Jetpack Compose
 *
 * Copyright (c) 2024 Axel Springer Deutschland GmbH
 */

package com.bild.designsystem.${brand}.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf
import com.bild.designsystem.${brand}.semantic.${brandPascal}LightColors
import com.bild.designsystem.${brand}.semantic.${brandPascal}DarkColors
import com.bild.designsystem.${brand}.semantic.${brandPascal}SizingCompact
import com.bild.designsystem.${brand}.semantic.${brandPascal}SizingRegular

// ══════════════════════════════════════════════════════════════════════════════
// SIZE CLASS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Window size class for responsive layouts
 */
enum class WindowSizeClass {
    Compact,  // Phones in portrait
    Regular   // Tablets, phones in landscape
}

// ══════════════════════════════════════════════════════════════════════════════
// DENSITY
// ══════════════════════════════════════════════════════════════════════════════

/**
 * UI density for spacing adjustments
 */
enum class ${brandPascal}Density {
    Compact,   // Dense UI (less padding)
    Default,   // Standard spacing
    Spacious   // More breathing room
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSITION LOCALS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * CompositionLocal for current color scheme (Light/Dark)
 * Use staticCompositionLocalOf for values that rarely change
 */
internal val Local${brandPascal}Colors = staticCompositionLocalOf { ${brandPascal}LightColors }

/**
 * CompositionLocal for current size class (Compact/Regular)
 */
internal val Local${brandPascal}SizeClass = staticCompositionLocalOf { WindowSizeClass.Compact }

/**
 * CompositionLocal for current density (Compact/Default/Spacious)
 */
internal val Local${brandPascal}Density = staticCompositionLocalOf { ${brandPascal}Density.Default }

/**
 * CompositionLocal for dark theme state
 */
internal val LocalIsDarkTheme = staticCompositionLocalOf { false }

// ══════════════════════════════════════════════════════════════════════════════
// THEME PROVIDER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * ${brandPascal} Design System Theme Provider
 *
 * Wraps content with CompositionLocals for theming.
 * All child composables can access theme values via [${brandPascal}Theme].
 *
 * @param darkTheme Whether to use dark color scheme
 * @param sizeClass Current window size class for responsive sizing
 * @param density UI density for spacing adjustments
 * @param content Composable content to wrap
 *
 * Usage:
 * \`\`\`kotlin
 * ${brandPascal}Theme(
 *     darkTheme = isSystemInDarkTheme(),
 *     sizeClass = calculateWindowSizeClass(),
 *     density = ${brandPascal}Density.Default
 * ) {
 *     // Your app content
 *     Text(
 *         color = ${brandPascal}Theme.colors.textColorPrimary,
 *         fontSize = ${brandPascal}Theme.sizing.headline1FontSize
 *     )
 * }
 * \`\`\`
 */
@Composable
fun ${brandPascal}Theme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    sizeClass: WindowSizeClass = WindowSizeClass.Compact,
    density: ${brandPascal}Density = ${brandPascal}Density.Default,
    content: @Composable () -> Unit
) {
    val colors = if (darkTheme) ${brandPascal}DarkColors else ${brandPascal}LightColors

    CompositionLocalProvider(
        Local${brandPascal}Colors provides colors,
        Local${brandPascal}SizeClass provides sizeClass,
        Local${brandPascal}Density provides density,
        LocalIsDarkTheme provides darkTheme,
        content = content
    )
}

// ══════════════════════════════════════════════════════════════════════════════
// THEME ACCESSOR OBJECT
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Accessor object for ${brandPascal} theme values
 *
 * Provides convenient access to current theme values from any composable.
 * Values are read from CompositionLocals set by [${brandPascal}Theme].
 *
 * Usage:
 * \`\`\`kotlin
 * @Composable
 * fun MyButton() {
 *     Button(
 *         colors = ButtonDefaults.buttonColors(
 *             containerColor = ${brandPascal}Theme.colors.coreColorPrimary
 *         )
 *     ) {
 *         Text(
 *             text = "Click me",
 *             fontSize = ${brandPascal}Theme.sizing.buttonLabelFontSize
 *         )
 *     }
 * }
 * \`\`\`
 */
object ${brandPascal}Theme {

    /**
     * Current color scheme (Light or Dark based on theme)
     */
    val colors: Any
        @Composable
        @ReadOnlyComposable
        get() = Local${brandPascal}Colors.current

    /**
     * Current sizing values based on WindowSizeClass
     */
    val sizing: Any
        @Composable
        @ReadOnlyComposable
        get() = when (Local${brandPascal}SizeClass.current) {
            WindowSizeClass.Compact -> ${brandPascal}SizingCompact
            WindowSizeClass.Regular -> ${brandPascal}SizingRegular
        }

    /**
     * Current window size class
     */
    val sizeClass: WindowSizeClass
        @Composable
        @ReadOnlyComposable
        get() = Local${brandPascal}SizeClass.current

    /**
     * Current UI density
     */
    val density: ${brandPascal}Density
        @Composable
        @ReadOnlyComposable
        get() = Local${brandPascal}Density.current

    /**
     * Whether dark theme is currently active
     */
    val isDarkTheme: Boolean
        @Composable
        @ReadOnlyComposable
        get() = LocalIsDarkTheme.current
}
`;
}

/**
 * Consolidates all primitive files into a single DesignTokenPrimitives.kt file
 * Creates: dist/compose/shared/DesignTokenPrimitives.kt
 */
async function consolidateComposePrimitives() {
  if (!COMPOSE_ENABLED) {
    return { total: 0, successful: 0 };
  }

  console.log('📦 Consolidating Compose Primitives...');

  const sharedDir = path.join(DIST_DIR, 'compose', 'shared');

  if (!fs.existsSync(sharedDir)) {
    console.log('  ⚠️  No Compose shared directory found');
    return { total: 0, successful: 0 };
  }

  const primitiveFiles = ['Colorprimitive.kt', 'Fontprimitive.kt', 'Sizeprimitive.kt', 'Spaceprimitive.kt'];
  const primitiveData = {
    Colors: [],
    Font: [],
    Size: [],
    Space: []
  };

  // Parse each primitive file
  for (const fileName of primitiveFiles) {
    const filePath = path.join(sharedDir, fileName);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    const category = fileName.replace('primitive.kt', '').replace('Color', 'Colors');

    // Extract val declarations
    const valRegex = /^\s*(internal\s+)?val\s+(\w+)\s*=\s*(.+)$/gm;
    let match;
    while ((match = valRegex.exec(content)) !== null) {
      const name = match[2];
      const value = match[3].trim();
      if (primitiveData[category]) {
        primitiveData[category].push({ name, value });
      }
    }
  }

  // Generate consolidated file
  const packageJson = require('../../package.json');
  const version = packageJson.version;

  let output = `/**
 * Do not edit directly, this file was auto-generated.
 *
 * BILD Design System Tokens v${version}
 * Generated by Style Dictionary
 *
 * Consolidated Design Token Primitives
 * All primitive values in a single file for easy imports
 *
 * Copyright (c) 2024 Axel Springer Deutschland GmbH
 */

package com.bild.designsystem

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * Design Token Primitives
 *
 * Usage:
 *   DesignTokenPrimitives.Colors.Bildred
 *   DesignTokenPrimitives.Space.Space2x
 *   DesignTokenPrimitives.Size.Size4x
 *   DesignTokenPrimitives.Font.FontWeightBold
 */
object DesignTokenPrimitives {

`;

  // Add Colors
  if (primitiveData.Colors.length > 0) {
    output += `    // ══════════════════════════════════════════════════════════════
    // COLORS
    // ══════════════════════════════════════════════════════════════
    object Colors {
`;
    primitiveData.Colors.forEach(t => {
      output += `        val ${t.name} = ${t.value}\n`;
    });
    output += `    }\n\n`;
  }

  // Add Font
  if (primitiveData.Font.length > 0) {
    output += `    // ══════════════════════════════════════════════════════════════
    // FONT
    // ══════════════════════════════════════════════════════════════
    object Font {
`;
    primitiveData.Font.forEach(t => {
      output += `        val ${t.name} = ${t.value}\n`;
    });
    output += `    }\n\n`;
  }

  // Add Size
  if (primitiveData.Size.length > 0) {
    output += `    // ══════════════════════════════════════════════════════════════
    // SIZE
    // ══════════════════════════════════════════════════════════════
    object Size {
`;
    primitiveData.Size.forEach(t => {
      output += `        val ${t.name} = ${t.value}\n`;
    });
    output += `    }\n\n`;
  }

  // Add Space
  if (primitiveData.Space.length > 0) {
    output += `    // ══════════════════════════════════════════════════════════════
    // SPACE
    // ══════════════════════════════════════════════════════════════
    object Space {
`;
    primitiveData.Space.forEach(t => {
      output += `        val ${t.name} = ${t.value}\n`;
    });
    output += `    }\n`;
  }

  output += `}
`;

  // Write consolidated file
  const consolidatedFile = path.join(sharedDir, 'DesignTokenPrimitives.kt');
  fs.writeFileSync(consolidatedFile, output, 'utf8');

  console.log(`     ✅ shared/DesignTokenPrimitives.kt (${primitiveData.Colors.length + primitiveData.Font.length + primitiveData.Size.length + primitiveData.Space.length} tokens)`);
  console.log(`  📊 Consolidated 4 primitive files into 1\n`);

  return { total: 1, successful: 1 };
}

/**
 * Aggregates semantic token files into consolidated files per brand
 * Creates: dist/compose/brands/{brand}/semantic/{Brand}SemanticTokens.kt
 */
async function aggregateComposeSemantics() {
  if (!COMPOSE_ENABLED) {
    return { totalBrands: 0, successfulBrands: 0 };
  }

  console.log('📦 Aggregating Compose Semantic Tokens...');

  let totalBrands = 0;
  let successfulBrands = 0;

  const composeDir = path.join(DIST_DIR, 'compose', 'brands');

  if (!fs.existsSync(composeDir)) {
    console.log('  ⚠️  No Compose brands directory found');
    return { totalBrands: 0, successfulBrands: 0 };
  }

  for (const brand of BRANDS) {
    totalBrands++;
    const brandDir = path.join(composeDir, brand);
    const semanticDir = path.join(brandDir, 'semantic');

    if (!fs.existsSync(semanticDir)) continue;

    try {
      const brandPascal = brand.charAt(0).toUpperCase() + brand.slice(1);
      const packageJson = require('../../package.json');
      const version = packageJson.version;

      // Collect semantic tokens
      const semanticData = {
        colors: { light: [], dark: [] },
        sizing: { compact: [], regular: [] }
      };

      // Read color files
      const colorDir = path.join(semanticDir, 'color');
      if (fs.existsSync(colorDir)) {
        const colorFiles = fs.readdirSync(colorDir).filter(f => f.endsWith('.kt'));
        for (const fileName of colorFiles) {
          const content = fs.readFileSync(path.join(colorDir, fileName), 'utf8');
          const mode = fileName.toLowerCase().includes('dark') ? 'dark' : 'light';

          const valRegex = /^\s*val\s+(\w+)\s*=\s*(.+)$/gm;
          let match;
          while ((match = valRegex.exec(content)) !== null) {
            semanticData.colors[mode].push({ name: match[1], value: match[2].trim() });
          }
        }
      }

      // Read sizing files
      const sizingDir = path.join(semanticDir, 'sizeclass');
      if (fs.existsSync(sizingDir)) {
        const sizingFiles = fs.readdirSync(sizingDir).filter(f => f.endsWith('.kt'));
        for (const fileName of sizingFiles) {
          const content = fs.readFileSync(path.join(sizingDir, fileName), 'utf8');
          const mode = fileName.toLowerCase().includes('regular') ? 'regular' : 'compact';

          const valRegex = /^\s*val\s+(\w+)\s*=\s*(.+)$/gm;
          let match;
          while ((match = valRegex.exec(content)) !== null) {
            semanticData.sizing[mode].push({ name: match[1], value: match[2].trim() });
          }
        }
      }

      // Generate aggregated semantic file
      let output = `/**
 * Do not edit directly, this file was auto-generated.
 *
 * BILD Design System Tokens v${version}
 * Generated by Style Dictionary
 *
 * Brand: ${brandPascal} | Aggregated Semantic Tokens
 * All semantic tokens in a single file with mode variants
 *
 * Copyright (c) 2024 Axel Springer Deutschland GmbH
 */

package com.bild.designsystem.${brand}.semantic

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * ${brandPascal} Semantic Tokens
 *
 * Usage:
 *   ${brandPascal}SemanticTokens.Colors.Light.textColorPrimary
 *   ${brandPascal}SemanticTokens.Colors.Dark.textColorPrimary
 *   ${brandPascal}SemanticTokens.Sizing.Compact.headline1FontSize
 *   ${brandPascal}SemanticTokens.Sizing.Regular.headline1FontSize
 */
object ${brandPascal}SemanticTokens {

`;

      // Add Colors section
      if (semanticData.colors.light.length > 0 || semanticData.colors.dark.length > 0) {
        output += `    // ══════════════════════════════════════════════════════════════
    // COLORS
    // ══════════════════════════════════════════════════════════════
    object Colors {
`;
        if (semanticData.colors.light.length > 0) {
          output += `        object Light {\n`;
          semanticData.colors.light.forEach(t => {
            output += `            val ${t.name} = ${t.value}\n`;
          });
          output += `        }\n`;
        }
        if (semanticData.colors.dark.length > 0) {
          output += `        object Dark {\n`;
          semanticData.colors.dark.forEach(t => {
            output += `            val ${t.name} = ${t.value}\n`;
          });
          output += `        }\n`;
        }
        output += `    }\n\n`;
      }

      // Add Sizing section
      if (semanticData.sizing.compact.length > 0 || semanticData.sizing.regular.length > 0) {
        output += `    // ══════════════════════════════════════════════════════════════
    // SIZING (WindowSizeClass)
    // ══════════════════════════════════════════════════════════════
    object Sizing {
`;
        if (semanticData.sizing.compact.length > 0) {
          output += `        object Compact {\n`;
          semanticData.sizing.compact.forEach(t => {
            output += `            val ${t.name} = ${t.value}\n`;
          });
          output += `        }\n`;
        }
        if (semanticData.sizing.regular.length > 0) {
          output += `        object Regular {\n`;
          semanticData.sizing.regular.forEach(t => {
            output += `            val ${t.name} = ${t.value}\n`;
          });
          output += `        }\n`;
        }
        output += `    }\n`;
      }

      output += `}
`;

      // Write aggregated file
      const aggregatedFile = path.join(semanticDir, `${brandPascal}SemanticTokens.kt`);
      fs.writeFileSync(aggregatedFile, output, 'utf8');

      const totalTokens = semanticData.colors.light.length + semanticData.colors.dark.length +
                          semanticData.sizing.compact.length + semanticData.sizing.regular.length;
      console.log(`     ✅ ${brand}/semantic/${brandPascal}SemanticTokens.kt (${totalTokens} tokens)`);
      successfulBrands++;

    } catch (error) {
      console.error(`     ❌ ${brand}: ${error.message}`);
    }
  }

  console.log(`  📊 Aggregated: ${successfulBrands}/${totalBrands} brand semantics\n`);
  return { totalBrands, successfulBrands };
}

/**
 * Removes individual Compose files, keeping only aggregated versions
 * This reduces file count and simplifies imports
 */
async function cleanupComposeIndividualFiles() {
  if (!COMPOSE_ENABLED) {
    return { removed: 0 };
  }

  console.log('🧹 Cleaning up individual Compose files...');

  let removedCount = 0;

  // Clean up primitive files (keep only DesignTokenPrimitives.kt)
  const sharedDir = path.join(DIST_DIR, 'compose', 'shared');
  if (fs.existsSync(sharedDir)) {
    const primitiveFiles = ['Colorprimitive.kt', 'Fontprimitive.kt', 'Sizeprimitive.kt', 'Spaceprimitive.kt'];
    for (const fileName of primitiveFiles) {
      const filePath = path.join(sharedDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        removedCount++;
      }
    }
  }

  // Clean up component individual files (keep only {Component}Tokens.kt)
  const composeDir = path.join(DIST_DIR, 'compose', 'brands');
  if (fs.existsSync(composeDir)) {
    for (const brand of BRANDS) {
      const componentsDir = path.join(composeDir, brand, 'components');
      if (!fs.existsSync(componentsDir)) continue;

      const componentDirs = fs.readdirSync(componentsDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

      for (const componentName of componentDirs) {
        const componentDir = path.join(componentsDir, componentName);
        const files = fs.readdirSync(componentDir).filter(f => f.endsWith('.kt'));

        // Keep only {Component}Tokens.kt, remove individual files
        const aggregatedFile = `${componentName}Tokens.kt`;
        for (const fileName of files) {
          if (fileName !== aggregatedFile) {
            fs.unlinkSync(path.join(componentDir, fileName));
            removedCount++;
          }
        }
      }

      // Clean up semantic individual files (keep only {Brand}SemanticTokens.kt and individual mode files for backward compat)
      // Actually, let's keep the individual semantic files for backward compatibility
      // as they're referenced by the Theme Provider
    }
  }

  console.log(`  📊 Removed ${removedCount} individual files\n`);
  return { removed: removedCount };
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

  // Build effect tokens
  stats.effectTokens = await buildEffectTokens();

  // Convert to responsive CSS
  stats.responsiveCSS = await convertToResponsiveCSS();

  // Aggregate Compose component files
  stats.composeAggregated = await aggregateComposeComponents();

  // Generate Compose Theme Providers
  stats.composeThemes = await generateComposeThemeProviders();

  // Consolidate Compose Primitives
  stats.composePrimitives = await consolidateComposePrimitives();

  // Aggregate Compose Semantics
  stats.composeSemantics = await aggregateComposeSemantics();

  // Cleanup individual Compose files
  stats.composeCleanup = await cleanupComposeIndividualFiles();

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
  console.log(`   - Effect Builds: ${stats.effectTokens.successfulBuilds}/${stats.effectTokens.totalBuilds}`);
  console.log(`   - Responsive CSS Files: ${stats.responsiveCSS.successfulConversions}/${stats.responsiveCSS.totalConversions}`);
  if (COMPOSE_ENABLED && stats.composeAggregated) {
    console.log(`   - Compose Aggregated: ${stats.composeAggregated.successfulComponents}/${stats.composeAggregated.totalComponents}`);
  }
  if (COMPOSE_ENABLED && stats.composeThemes) {
    console.log(`   - Compose Themes: ${stats.composeThemes.successfulThemes}/${stats.composeThemes.totalThemes}`);
  }
  if (COMPOSE_ENABLED && stats.composePrimitives) {
    console.log(`   - Compose Primitives Consolidated: ${stats.composePrimitives.successful}/${stats.composePrimitives.total}`);
  }
  if (COMPOSE_ENABLED && stats.composeSemantics) {
    console.log(`   - Compose Semantics Aggregated: ${stats.composeSemantics.successfulBrands}/${stats.composeSemantics.totalBrands}`);
  }
  if (COMPOSE_ENABLED && stats.composeCleanup) {
    console.log(`   - Compose Files Cleaned: ${stats.composeCleanup.removed} individual files removed`);
  }
  console.log(`   - Builds erfolgreich: ${successfulBuilds}/${totalBuilds}`);
  console.log(`   - Output-Verzeichnis: dist/\n`);

  console.log(`📁 Struktur:`);
  console.log(`   dist/`);
  console.log(`   ├── css/        (CSS with data-attributes for theme switching)`);
  console.log(`   ├── scss/       (SCSS variables)`);
  console.log(`   ├── js/         (JavaScript ES6)`);
  console.log(`   ├── json/       (JSON)`);
  console.log(`   ├── ios/        (Swift)`);
  console.log(`   ${FLUTTER_ENABLED ? '├' : '└'}── android/    (Android XML resources)`);
  if (FLUTTER_ENABLED) console.log(`   └── flutter/    (Dart classes)`);
  console.log(``);
  console.log(`   Each platform contains:`);
  console.log(`   - shared/              (primitives)`);
  console.log(`   - brands/{brand}/`);
  console.log(`       ├── density/       (3 modes)`);
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
