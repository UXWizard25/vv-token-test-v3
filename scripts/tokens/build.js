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
const COLOR_BRANDS = ['bild', 'sportbild'];  // Brands with their own color tokens
const CONTENT_BRANDS = ['bild', 'sportbild', 'advertorial'];  // All brands (for sizing/typography)
const BREAKPOINTS = ['xs', 'sm', 'md', 'lg'];
const COLOR_MODES = ['light', 'dark'];
const DENSITY_MODES = ['default', 'dense', 'spacious'];

// Native platforms only use compact (sm) and regular (lg) size classes
const NATIVE_BREAKPOINTS = ['sm', 'lg'];

// Platform output toggles - set to false to disable output generation
const FLUTTER_ENABLED = false;
const COMPOSE_ENABLED = true;
const SWIFTUI_ENABLED = true;       // SwiftUI output in dist/ios/
const ANDROID_XML_ENABLED = false;  // Disabled - Compose is the preferred Android format

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
    // iOS: SwiftUI format - For breakpoint mode, use sizeclass folder and naming, skip non-native breakpoints
    // Skip ios platform when SWIFTUI_ENABLED since swiftui platform generates the same output correctly
    ...((cssOptions.modeType === 'breakpoint' && !isNativeBreakpoint(cssOptions.mode)) || SWIFTUI_ENABLED ? {} : {
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
                return `${componentName}Sizing${sizeClass.charAt(0).toUpperCase() + sizeClass.slice(1)}.swift`;
              }
              return `Sizing${sizeClass.charAt(0).toUpperCase() + sizeClass.slice(1)}.swift`;
            }
            // For color tokens
            if (cssOptions.modeType === 'color' && cssOptions.mode) {
              const mode = cssOptions.mode === 'light' ? 'Light' : 'Dark';
              const isComponent = buildPath.includes('/components/');
              if (isComponent) {
                const componentMatch = buildPath.match(/\/components\/([^/]+)/);
                const componentName = componentMatch ? componentMatch[1] : '';
                return `${componentName}Colors${mode}.swift`;
              }
              return `Colors${mode}.swift`;
            }
            // For density tokens
            if (cssOptions.modeType === 'density' && cssOptions.mode) {
              const densityMode = cssOptions.mode.charAt(0).toUpperCase() + cssOptions.mode.slice(1);
              const isComponent = buildPath.includes('/components/');
              if (isComponent) {
                const componentMatch = buildPath.match(/\/components\/([^/]+)/);
                const componentName = componentMatch ? componentMatch[1] : '';
                return `${componentName}Density${densityMode}.swift`;
              }
              return `Density${densityMode}.swift`;
            }
            return `${fileName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}.swift`;
          })(),
          format: (() => {
            // Use SwiftUI component tokens format based on token type
            const isComponent = buildPath.includes('/components/');
            if (isComponent) {
              return 'swiftui/component-tokens';
            }
            // Semantic tokens
            if (cssOptions.modeType === 'color') {
              return 'swiftui/color-scheme';
            }
            if (cssOptions.modeType === 'breakpoint') {
              return 'swiftui/sizing-scheme';
            }
            return 'swiftui/component-tokens';
          })(),
          filter: tokenFilter,
          options: {
            outputReferences: false,
            brand: (() => {
              const brandMatch = buildPath.match(/\/brands\/([^/]+)/);
              return brandMatch ? brandMatch[1] : 'bild';
            })(),
            component: (() => {
              const componentMatch = buildPath.match(/\/components\/([^/]+)/);
              return componentMatch ? componentMatch[1] : '';
            })(),
            tokenType: (() => {
              if (cssOptions.modeType === 'color') return 'color';
              if (cssOptions.modeType === 'density') return 'density';
              return 'sizing';
            })(),
            mode: (() => {
              if (cssOptions.modeType === 'color') {
                return cssOptions.mode; // light or dark
              }
              if (cssOptions.modeType === 'breakpoint') {
                return getSizeClassName(cssOptions.mode); // compact or regular
              }
              return cssOptions.mode;
            })(),
            sizeClass: getSizeClassName(cssOptions.mode)
          }
        }]
      }
    }),
    // Android XML: For breakpoint mode, use sizeclass folder and naming, skip non-native breakpoints
    // Disabled by default - Compose is the preferred Android format
    ...((cssOptions.modeType === 'breakpoint' && !isNativeBreakpoint(cssOptions.mode)) || !ANDROID_XML_ENABLED ? {} : {
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
          return `${DIST_DIR}/android/compose/${composePath}/`;
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
    }),
    // SwiftUI: For breakpoint mode, use sizeclass folder and naming, skip non-native breakpoints
    // Skip swiftui for overrides (brand mapping layer) - these are intermediate tokens not needed in final output
    // Skip swiftui for individual primitives (they're consolidated into DesignTokenPrimitives.swift)
    ...((cssOptions.modeType === 'breakpoint' && !isNativeBreakpoint(cssOptions.mode)) || !SWIFTUI_ENABLED || cssOptions.skipCompose || cssOptions.skipSwiftUI ? {} : {
      swiftui: {
        transformGroup: 'custom/ios-swift',
        buildPath: (() => {
          let swiftuiPath = buildPath.replace(DIST_DIR + '/css/', '');
          // For semantic breakpoint tokens, change folder from 'breakpoints' to 'sizeclass'
          if (cssOptions.modeType === 'breakpoint' && swiftuiPath.includes('/breakpoints')) {
            swiftuiPath = swiftuiPath.replace('/breakpoints', '/sizeclass');
          }
          return `${DIST_DIR}/ios/${swiftuiPath}/`;
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
                return `${componentName}Sizing${sizeClass.charAt(0).toUpperCase() + sizeClass.slice(1)}.swift`;
              }
              return `Sizing${sizeClass.charAt(0).toUpperCase() + sizeClass.slice(1)}.swift`;
            }
            // For color mode tokens
            if (cssOptions.modeType === 'theme' && cssOptions.mode) {
              const modeName = cssOptions.mode.charAt(0).toUpperCase() + cssOptions.mode.slice(1);
              const isComponent = buildPath.includes('/components/');
              if (isComponent) {
                const componentMatch = buildPath.match(/\/components\/([^/]+)/);
                const componentName = componentMatch ? componentMatch[1] : '';
                return `${componentName}Colors${modeName}.swift`;
              }
              return `Colors${modeName}.swift`;
            }
            // For density tokens
            if (cssOptions.modeType === 'density' && cssOptions.mode) {
              const modeName = cssOptions.mode.charAt(0).toUpperCase() + cssOptions.mode.slice(1);
              const isComponent = buildPath.includes('/components/');
              if (isComponent) {
                const componentMatch = buildPath.match(/\/components\/([^/]+)/);
                const componentName = componentMatch ? componentMatch[1] : '';
                return `${componentName}Density${modeName}.swift`;
              }
              return `Density${modeName}.swift`;
            }
            // Default: PascalCase filename
            return `${fileName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}.swift`;
          })(),
          format: (() => {
            // Choose format based on token type
            if (buildPath.includes('/shared/')) {
              return 'swiftui/primitives';
            }
            // For components, use component-tokens format for all mode types
            if (buildPath.includes('/components/')) {
              return 'swiftui/component-tokens';
            }
            if (cssOptions.modeType === 'theme') {
              return 'swiftui/color-scheme';
            }
            if (cssOptions.modeType === 'breakpoint') {
              return 'swiftui/sizing-scheme';
            }
            if (cssOptions.modeType === 'density') {
              return 'swiftui/sizing-scheme';  // density uses same sizing scheme format
            }
            return 'swiftui/primitives';
          })(),
          filter: tokenFilter,
          options: {
            outputReferences: false,
            brand: cssOptions.brand || '',
            mode: (() => {
              if (cssOptions.modeType === 'breakpoint') {
                return getSizeClassName(cssOptions.mode);
              }
              return cssOptions.mode || '';
            })(),
            sizeClass: (() => {
              if (cssOptions.modeType === 'breakpoint') {
                return getSizeClassName(cssOptions.mode);
              }
              return '';
            })(),
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
            component: (() => {
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

      // iOS: Only compact (sm) and regular (lg) with SwiftUI format
      // Output to semantic/typography/ with sizeclass in filename
      ...(SIZE_CLASS_MAPPING[breakpoint] ? {
        ios: {
          transformGroup: 'custom/ios-swift',
          buildPath: `${DIST_DIR}/ios/brands/${brand}/semantic/typography/`,
          files: [{
            destination: `TypographySizeclass${SIZE_CLASS_MAPPING[breakpoint].charAt(0).toUpperCase() + SIZE_CLASS_MAPPING[breakpoint].slice(1)}.swift`,
            format: 'swiftui/typography',
            options: {
              brand: brandName,
              breakpoint,
              sizeClass: SIZE_CLASS_MAPPING[breakpoint]
            }
          }]
        }
      } : {}),

      // Android XML: Only compact (sm) and regular (lg) with custom format
      // Output to semantic/typography/ with sizeclass in filename
      // Disabled by default - Compose is the preferred Android format
      ...(SIZE_CLASS_MAPPING[breakpoint] && ANDROID_XML_ENABLED ? {
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

      // iOS: SwiftUI Effects format
      ios: {
        transformGroup: 'custom/ios-swift',
        buildPath: `${DIST_DIR}/ios/brands/${brand}/semantic/effects/`,
        files: [{
          destination: `${fileName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}.swift`,
          format: 'swiftui/effects',
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

      // Android XML: Custom Effects format
      // Disabled by default - Compose is the preferred Android format
      ...(ANDROID_XML_ENABLED ? {
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
      } : {})
    }
  };
}

/**
 * Builds Shared Primitive Tokens
 * Note: iOS/SwiftUI primitives are built separately via buildConsolidatedSwiftUIPrimitives()
 * to create a single consolidated DesignTokenPrimitives.swift file
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

    // Skip SwiftUI for individual primitives - they'll be consolidated later
    const config = {
      source: [sourcePath],
      platforms: createStandardPlatformConfig(`${DIST_DIR}/css/shared`, baseName, { skipSwiftUI: true })
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
 * Builds consolidated SwiftUI Primitives
 * Creates: dist/ios/shared/DesignTokenPrimitives.swift
 * Combines all primitive JSON files into a single Swift file with nested enums
 */
async function buildConsolidatedSwiftUIPrimitives() {
  if (!SWIFTUI_ENABLED) {
    return { total: 0, successful: 0 };
  }

  console.log('🍎 Building Consolidated SwiftUI Primitives...');

  const sharedDir = path.join(TOKENS_DIR, 'shared');
  if (!fs.existsSync(sharedDir)) {
    console.log('  ⚠️  No shared/ directory found');
    return { total: 0, successful: 0 };
  }

  // Combine all primitive JSON files
  const files = fs.readdirSync(sharedDir).filter(f => f.endsWith('.json'));
  const sourcePaths = files.map(f => path.join(sharedDir, f));

  const config = {
    source: sourcePaths,
    platforms: {
      swiftui: {
        transformGroup: 'custom/ios-swift',
        buildPath: `${DIST_DIR}/ios/shared/`,
        files: [{
          destination: 'DesignTokenPrimitives.swift',
          format: 'swiftui/primitives',
          filter: (token) => {
            // Exclude TextLabels tokens
            if (token.path && token.path.includes('TextLabels')) {
              return false;
            }
            return true;
          },
          options: {
            outputReferences: false
          }
        }]
      }
    }
  };

  try {
    const sd = new StyleDictionary(config);
    await sd.buildAllPlatforms();
    console.log('     ✅ ios/shared/DesignTokenPrimitives.swift');
    return { total: 1, successful: 1 };
  } catch (error) {
    console.error(`  ❌ Consolidated SwiftUI Primitives: ${error.message}`);
    return { total: 1, successful: 0 };
  }
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
        // Extract density mode from filename (e.g., "density-dense" -> "dense")
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
      // iOS: Only compact (sm) and regular (lg) with SwiftUI typography format
      ...(breakpoint && isNativeBreakpoint(breakpoint) ? {
        ios: {
          transformGroup: 'custom/ios-swift',
          buildPath: `${DIST_DIR}/ios/brands/${brand}/components/${componentName}/`,
          files: [{
            destination: `${componentName}TypographySizing${getSizeClassName(breakpoint).charAt(0).toUpperCase() + getSizeClassName(breakpoint).slice(1)}.swift`,
            format: 'swiftui/typography',
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
      // Android XML: Only compact (sm) and regular (lg) with sizeclass naming
      // Disabled by default - Compose is the preferred Android format
      ...(breakpoint && isNativeBreakpoint(breakpoint) && ANDROID_XML_ENABLED ? {
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
          buildPath: `${DIST_DIR}/android/compose/brands/${brand}/components/${componentName}/`,
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
        transformGroup: 'custom/ios-swift',
        buildPath: `${DIST_DIR}/ios/brands/${brand}/components/${componentName}/`,
        files: [{
          destination: `${componentName}Effects${colorMode ? colorMode.charAt(0).toUpperCase() + colorMode.slice(1) : ''}.swift`,
          format: 'swiftui/effects',
          options: {
            brand: brandName,
            colorMode,
            componentName,
            mode: colorMode
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
      // Android XML: Disabled by default - Compose is the preferred Android format
      ...(ANDROID_XML_ENABLED ? {
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
      } : {})
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

          // Check for density mode (e.g., "button-density-dense" -> mode: "dense", modeType: "density")
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
        ...(ANDROID_XML_ENABLED ? {
          android: {
            shared: 'android/res/values/shared/',
            brands: 'android/res/values/brands/{brand}/',
            sizeClasses: 'android/brands/{brand}/sizeclass-{compact|regular}/'
          }
        } : {}),
        ...(COMPOSE_ENABLED ? {
          compose: {
            shared: 'android/compose/shared/',
            brands: 'android/compose/brands/{brand}/',
            sizeClasses: 'android/compose/brands/{brand}/semantic/sizeclass/'
          }
        } : {}),
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

  const composeDir = path.join(DIST_DIR, 'android', 'compose', 'brands');

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
          density: { default: [], dense: [], spacious: [] },
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
          } else if (lowerFile.includes('densitydense')) {
            tokenGroups.density.dense = tokens;
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
    ...tokenGroups.density.dense,
    ...tokenGroups.density.default,
    ...tokenGroups.density.spacious,
    ...tokenGroups.typography.compact,
    ...tokenGroups.typography.regular
  ];

  const hasColor = allTokens.some(t => t.value.includes('Color('));
  const hasDp = allTokens.some(t => t.value.includes('.dp'));
  const hasSp = allTokens.some(t => t.value.includes('.sp'));
  const hasFontStyle = allTokens.some(t => t.value.includes('FontStyle.'));
  const hasDensityTokens = tokenGroups.density.dense.length > 0 ||
      tokenGroups.density.default.length > 0 ||
      tokenGroups.density.spacious.length > 0;
  const hasColorTokens = tokenGroups.colors.light.length > 0 || tokenGroups.colors.dark.length > 0;
  const hasSizingTokens = tokenGroups.sizing.compact.length > 0 || tokenGroups.sizing.regular.length > 0;
  const hasTypographyTokens = tokenGroups.typography.compact.length > 0 || tokenGroups.typography.regular.length > 0;

  // Need @Composable and Theme imports for current() accessors
  const needsComposable = hasDensityTokens || hasColorTokens || hasSizingTokens || hasTypographyTokens;
  // WindowSizeClass needed for both Sizing and Typography (both use Compact/Regular)
  const needsWindowSizeClass = hasSizingTokens || hasTypographyTokens;

  const imports = ['import androidx.compose.runtime.Immutable'];
  if (needsComposable) {
    imports.push('import androidx.compose.runtime.Composable');
    imports.push('import com.bild.designsystem.shared.DesignSystemTheme');
  }
  if (hasDensityTokens) {
    imports.push('import com.bild.designsystem.shared.Density');
  }
  if (needsWindowSizeClass) {
    imports.push('import com.bild.designsystem.shared.WindowSizeClass');
  }
  if (hasColor) imports.push('import androidx.compose.ui.graphics.Color');
  if (hasFontStyle) imports.push('import androidx.compose.ui.text.font.FontStyle');
  if (hasDp || hasSp) imports.push('import androidx.compose.ui.unit.Dp');
  if (hasDp) imports.push('import androidx.compose.ui.unit.dp');
  if (hasSp) imports.push('import androidx.compose.ui.unit.sp');
  if (hasSp && needsComposable) imports.push('import androidx.compose.ui.unit.TextUnit');

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

  // Colors section with interface and current() accessor
  if (tokenGroups.colors.light.length > 0 || tokenGroups.colors.dark.length > 0) {
    // Collect all unique token names for interface
    const colorTokenNames = new Map();
    [...tokenGroups.colors.light, ...tokenGroups.colors.dark].forEach(t => {
      if (!colorTokenNames.has(t.name)) {
        colorTokenNames.set(t.name, t.value);
      }
    });

    output += `
    // ══════════════════════════════════════════════════════════════
    // COLORS
    // ══════════════════════════════════════════════════════════════
    object Colors {
        /**
         * Returns color tokens for the current theme.
         * Automatically resolves to Light or Dark based on DesignSystemTheme.isDarkTheme
         *
         * Usage:
         *   val bgColor = ${componentName}Tokens.Colors.current().primaryBgIdle
         */
        @Composable
        fun current(): ColorTokens = if (DesignSystemTheme.isDarkTheme) Dark else Light

        /**
         * Interface for color tokens
         */
        interface ColorTokens {
`;
    // Generate interface properties
    colorTokenNames.forEach((value, name) => {
      output += `            val ${name}: Color\n`;
    });
    output += `        }

`;
    if (tokenGroups.colors.light.length > 0) {
      output += `        object Light : ColorTokens {\n`;
      tokenGroups.colors.light.forEach(t => {
        output += `            override val ${t.name} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    if (tokenGroups.colors.dark.length > 0) {
      output += `        object Dark : ColorTokens {\n`;
      tokenGroups.colors.dark.forEach(t => {
        output += `            override val ${t.name} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    output += `    }\n`;
  }

  // Sizing section with interface and current() accessor
  if (tokenGroups.sizing.compact.length > 0 || tokenGroups.sizing.regular.length > 0) {
    // Collect all unique token names for interface
    const sizingTokenNames = new Map();
    [...tokenGroups.sizing.compact, ...tokenGroups.sizing.regular].forEach(t => {
      if (!sizingTokenNames.has(t.name)) {
        sizingTokenNames.set(t.name, t.value);
      }
    });

    output += `
    // ══════════════════════════════════════════════════════════════
    // SIZING (WindowSizeClass)
    // ══════════════════════════════════════════════════════════════
    object Sizing {
        /**
         * Returns sizing tokens for the current window size class.
         * Automatically resolves to Compact or Regular based on DesignSystemTheme.sizeClass
         *
         * Usage:
         *   val fontSize = ${componentName}Tokens.Sizing.current().labelFontSize
         */
        @Composable
        fun current(): SizingTokens = when (DesignSystemTheme.sizeClass) {
            WindowSizeClass.Compact -> Compact
            WindowSizeClass.Regular -> Regular
        }

        /**
         * Interface for sizing tokens
         */
        interface SizingTokens {
`;
    // Generate interface properties
    sizingTokenNames.forEach((value, name) => {
      // Determine type based on value
      let propType = 'Dp';
      if (value.includes('.sp')) propType = 'TextUnit';
      else if (value.includes('Color(')) propType = 'Color';
      else if (!value.includes('.dp') && !value.includes('.sp')) {
        // Check if it's a pure number (Int)
        const numMatch = value.match(/^(\d+)$/);
        if (numMatch) propType = 'Int';
      }
      output += `            val ${name}: ${propType}\n`;
    });
    output += `        }

`;
    if (tokenGroups.sizing.compact.length > 0) {
      output += `        object Compact : SizingTokens {\n`;
      tokenGroups.sizing.compact.forEach(t => {
        output += `            override val ${t.name} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    if (tokenGroups.sizing.regular.length > 0) {
      output += `        object Regular : SizingTokens {\n`;
      tokenGroups.sizing.regular.forEach(t => {
        output += `            override val ${t.name} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    output += `    }\n`;
  }

  // Density section with interface and current() helper
  const hasDensity = tokenGroups.density.dense.length > 0 ||
      tokenGroups.density.default.length > 0 ||
      tokenGroups.density.spacious.length > 0;

  if (hasDensity) {
    // Collect all unique token names across density modes for interface
    const densityTokenNames = new Map();
    [...tokenGroups.density.dense, ...tokenGroups.density.default, ...tokenGroups.density.spacious].forEach(t => {
      if (!densityTokenNames.has(t.name)) {
        densityTokenNames.set(t.name, t.value);
      }
    });

    output += `
    // ══════════════════════════════════════════════════════════════
    // DENSITY
    // ══════════════════════════════════════════════════════════════
    object Density {
        /**
         * Returns density tokens for the current theme density.
         * Automatically resolves to Dense, Default, or Spacious based on DesignSystemTheme.density
         *
         * Usage:
         *   val gap = ${componentName}Tokens.Density.current().contentGap
         */
        @Composable
        fun current(): DensityTokens = when (DesignSystemTheme.density) {
            com.bild.designsystem.shared.Density.Dense -> Dense
            com.bild.designsystem.shared.Density.Default -> Default
            com.bild.designsystem.shared.Density.Spacious -> Spacious
        }

        /**
         * Interface for density-dependent tokens
         */
        interface DensityTokens {
`;
    // Generate interface properties
    densityTokenNames.forEach((value, name) => {
      // Determine type based on value
      let propType = 'Dp';
      if (value.includes('.sp')) propType = 'TextUnit';
      else if (value.includes('Color(')) propType = 'Color';
      else if (!value.includes('.dp') && !value.includes('.sp') && /^\d+$/.test(value.replace(/[^\d]/g, ''))) {
        // Check if it's a pure number (Int)
        if (!value.includes('.')) propType = 'Int';
      }
      output += `            val ${name}: ${propType}\n`;
    });
    output += `        }

`;
    if (tokenGroups.density.dense.length > 0) {
      output += `        object Dense : DensityTokens {\n`;
      tokenGroups.density.dense.forEach(t => {
        output += `            override val ${t.name} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    if (tokenGroups.density.default.length > 0) {
      output += `        object Default : DensityTokens {\n`;
      tokenGroups.density.default.forEach(t => {
        output += `            override val ${t.name} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    if (tokenGroups.density.spacious.length > 0) {
      output += `        object Spacious : DensityTokens {\n`;
      tokenGroups.density.spacious.forEach(t => {
        output += `            override val ${t.name} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    output += `    }\n`;
  }

  // Typography section with interface and current() accessor
  if (tokenGroups.typography.compact.length > 0 || tokenGroups.typography.regular.length > 0) {
    // Collect all unique token names for interface
    const typographyTokenNames = new Map();
    [...tokenGroups.typography.compact, ...tokenGroups.typography.regular].forEach(t => {
      if (!typographyTokenNames.has(t.name)) {
        typographyTokenNames.set(t.name, t.value);
      }
    });

    output += `
    // ══════════════════════════════════════════════════════════════
    // TYPOGRAPHY
    // ══════════════════════════════════════════════════════════════
    object Typography {
        /**
         * Returns typography tokens for the current window size class.
         * Automatically resolves to Compact or Regular based on DesignSystemTheme.sizeClass
         *
         * Usage:
         *   val fontFamily = ${componentName}Tokens.Typography.current().labelFontFamily
         */
        @Composable
        fun current(): TypographyTokens = when (DesignSystemTheme.sizeClass) {
            WindowSizeClass.Compact -> Compact
            WindowSizeClass.Regular -> Regular
        }

        /**
         * Interface for typography tokens
         */
        interface TypographyTokens {
`;
    // Generate interface properties
    typographyTokenNames.forEach((value, name) => {
      // Determine type based on value
      let propType = 'String';
      if (value.includes('.sp')) propType = 'TextUnit';
      else if (value.includes('.dp')) propType = 'Dp';
      else if (value.includes('FontStyle.')) propType = 'FontStyle';
      else if (/^\d+$/.test(value.trim())) propType = 'Int';
      else if (value.startsWith('"') || value.startsWith("'")) propType = 'String';
      output += `            val ${name}: ${propType}\n`;
    });
    output += `        }

`;
    if (tokenGroups.typography.compact.length > 0) {
      output += `        object Compact : TypographyTokens {\n`;
      tokenGroups.typography.compact.forEach(t => {
        output += `            override val ${t.name} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    if (tokenGroups.typography.regular.length > 0) {
      output += `        object Regular : TypographyTokens {\n`;
      tokenGroups.typography.regular.forEach(t => {
        output += `            override val ${t.name} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    output += `    }\n`;
  }

  output += `}
`;

  return output;
}

// ════════════════════════════════════════════════════════════════════════════
// SwiftUI COMPONENT AGGREGATION
// ════════════════════════════════════════════════════════════════════════════

/**
 * Aggregates individual SwiftUI component files into single files per component
 * Creates: dist/ios/brands/{brand}/components/{Component}/{Component}Tokens.swift
 */
async function aggregateSwiftUIComponents() {
  if (!SWIFTUI_ENABLED) {
    return { totalComponents: 0, successfulComponents: 0 };
  }

  console.log('📦 Aggregating SwiftUI component files...');

  let totalComponents = 0;
  let successfulComponents = 0;

  const iosDir = path.join(DIST_DIR, 'ios', 'brands');

  if (!fs.existsSync(iosDir)) {
    console.log('  ⚠️  No iOS output found, skipping aggregation');
    return { totalComponents: 0, successfulComponents: 0 };
  }

  for (const brand of BRANDS) {
    const brandComponentsDir = path.join(iosDir, brand, 'components');

    if (!fs.existsSync(brandComponentsDir)) {
      continue;
    }

    const componentDirs = fs.readdirSync(brandComponentsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const componentName of componentDirs) {
      totalComponents++;
      const componentDir = path.join(brandComponentsDir, componentName);
      const swiftFiles = fs.readdirSync(componentDir)
        .filter(f => f.endsWith('.swift') && !f.endsWith('Tokens.swift'))
        .sort();

      if (swiftFiles.length === 0) continue;

      try {
        // Parse all individual files and collect tokens
        const tokenGroups = {
          colors: { light: [], dark: [] },
          sizing: { compact: [], regular: [] },
          density: { default: [], dense: [], spacious: [] },
          typography: { compact: [], regular: [] }
        };

        for (const swiftFile of swiftFiles) {
          const content = fs.readFileSync(path.join(componentDir, swiftFile), 'utf8');
          const tokens = parseSwiftTokens(content);

          // Categorize based on filename
          // IMPORTANT: Check typography BEFORE sizing because typography files contain "sizing" in name
          const lowerFile = swiftFile.toLowerCase();
          if (lowerFile.includes('colorslight') || lowerFile.includes('colorlight')) {
            tokenGroups.colors.light = tokens;
          } else if (lowerFile.includes('colorsdark') || lowerFile.includes('colordark')) {
            tokenGroups.colors.dark = tokens;
          } else if (lowerFile.includes('typography')) {
            // Typography files (e.g., ButtonTypographySizingCompact.swift)
            if (lowerFile.includes('compact')) {
              tokenGroups.typography.compact = tokens;
            } else if (lowerFile.includes('regular')) {
              tokenGroups.typography.regular = tokens;
            }
          } else if (lowerFile.includes('sizingcompact')) {
            tokenGroups.sizing.compact = tokens;
          } else if (lowerFile.includes('sizingregular')) {
            tokenGroups.sizing.regular = tokens;
          } else if (lowerFile.includes('densitydense')) {
            tokenGroups.density.dense = tokens;
          } else if (lowerFile.includes('densitydefault')) {
            tokenGroups.density.default = tokens;
          } else if (lowerFile.includes('densityspacious')) {
            tokenGroups.density.spacious = tokens;
          }
        }

        // Generate aggregated file
        const aggregatedContent = generateAggregatedSwiftComponentFile(
          brand,
          componentName,
          tokenGroups
        );

        // Write aggregated file
        const outputPath = path.join(componentDir, `${componentName}Tokens.swift`);
        fs.writeFileSync(outputPath, aggregatedContent, 'utf8');

        console.log(`     ✅ ${brand}/${componentName}Tokens.swift`);
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
 * Parses Swift token file and extracts let declarations
 * Supports both explicit types (let x: Type = value) and implicit types (let x = TextStyle(...))
 */
function parseSwiftTokens(content) {
  const tokens = [];

  // Match: public let tokenName: Type = value (explicit type)
  const explicitTypeRegex = /public\s+let\s+(\w+):\s*(\w+)\s*=\s*(.+)/g;
  let match;

  while ((match = explicitTypeRegex.exec(content)) !== null) {
    tokens.push({
      name: match[1],
      type: match[2],
      value: match[3].trim()
    });
  }

  // Match: public let tokenName = TextStyle(...) (implicit type - for typography)
  // This regex captures multi-line TextStyle declarations
  const textStyleRegex = /public\s+let\s+(\w+)\s*=\s*(TextStyle\s*\([^)]+\))/gs;
  while ((match = textStyleRegex.exec(content)) !== null) {
    tokens.push({
      name: match[1],
      type: 'TextStyle',
      value: match[2].replace(/\s+/g, ' ').trim()
    });
  }

  return tokens;
}

/**
 * Generates aggregated Swift file with nested enums
 */
function generateAggregatedSwiftComponentFile(brand, componentName, tokenGroups) {
  const brandPascal = brand.charAt(0).toUpperCase() + brand.slice(1);
  const packageJson = require('../../package.json');
  const version = packageJson.version;

  // Check what token groups exist
  const hasColorTokens = tokenGroups.colors.light.length > 0 || tokenGroups.colors.dark.length > 0;
  const hasSizingTokens = tokenGroups.sizing.compact.length > 0 || tokenGroups.sizing.regular.length > 0;
  const hasDensityTokens = tokenGroups.density.dense.length > 0 ||
      tokenGroups.density.default.length > 0 ||
      tokenGroups.density.spacious.length > 0;
  const hasTypographyTokens = tokenGroups.typography.compact.length > 0 || tokenGroups.typography.regular.length > 0;

  let output = `//
// Do not edit directly, this file was auto-generated.
//
// BILD Design System Tokens v${version}
// Generated by Style Dictionary
//
// Component: ${componentName} | Brand: ${brandPascal}
// Aggregated component tokens with all modes
//
// Copyright (c) 2024 Axel Springer Deutschland GmbH
//

import SwiftUI

/// ${componentName} Design Tokens
///
/// Usage:
///   ${componentName}Tokens.Colors.light.primaryBgIdle
///   ${componentName}Tokens.Sizing.compact.height
///   ${componentName}Tokens.Density.current(for: theme.density).contentGap
public enum ${componentName}Tokens {
`;

  // Colors section
  if (hasColorTokens) {
    const colorTokenNames = new Map();
    [...tokenGroups.colors.light, ...tokenGroups.colors.dark].forEach(t => {
      if (!colorTokenNames.has(t.name)) {
        colorTokenNames.set(t.name, { type: t.type, value: t.value });
      }
    });

    output += `
    // MARK: - Colors

    /// Color tokens protocol
    public protocol ${componentName}ColorTokens: Sendable {
`;
    colorTokenNames.forEach((info, name) => {
      output += `        var ${name}: Color { get }\n`;
    });
    output += `    }

    /// Color scheme accessor
    public enum Colors {
        /// Returns color tokens for the specified theme mode
        public static func current(isDark: Bool) -> any ${componentName}ColorTokens {
            isDark ? Dark.shared : Light.shared
        }

        public static var light: Light { Light.shared }
        public static var dark: Dark { Dark.shared }
`;

    if (tokenGroups.colors.light.length > 0) {
      output += `
        public struct Light: ${componentName}ColorTokens {
            public static let shared = Light()
            private init() {}
`;
      tokenGroups.colors.light.forEach(t => {
        output += `            public let ${t.name}: ${t.type} = ${t.value}\n`;
      });
      output += `        }\n`;
    }

    if (tokenGroups.colors.dark.length > 0) {
      output += `
        public struct Dark: ${componentName}ColorTokens {
            public static let shared = Dark()
            private init() {}
`;
      tokenGroups.colors.dark.forEach(t => {
        output += `            public let ${t.name}: ${t.type} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    output += `    }\n`;
  }

  // Sizing section
  if (hasSizingTokens) {
    const sizingTokenNames = new Map();
    [...tokenGroups.sizing.compact, ...tokenGroups.sizing.regular].forEach(t => {
      if (!sizingTokenNames.has(t.name)) {
        sizingTokenNames.set(t.name, { type: t.type, value: t.value });
      }
    });

    output += `
    // MARK: - Sizing

    /// Sizing tokens protocol
    public protocol ${componentName}SizingTokens: Sendable {
`;
    sizingTokenNames.forEach((info, name) => {
      output += `        var ${name}: ${info.type} { get }\n`;
    });
    output += `    }

    /// Size class accessor
    public enum Sizing {
        /// Returns sizing tokens for the specified size class
        public static func current(for sizeClass: SizeClass) -> any ${componentName}SizingTokens {
            sizeClass == .compact ? Compact.shared : Regular.shared
        }

        public static var compact: Compact { Compact.shared }
        public static var regular: Regular { Regular.shared }
`;

    if (tokenGroups.sizing.compact.length > 0) {
      output += `
        public struct Compact: ${componentName}SizingTokens {
            public static let shared = Compact()
            private init() {}
`;
      tokenGroups.sizing.compact.forEach(t => {
        output += `            public let ${t.name}: ${t.type} = ${t.value}\n`;
      });
      output += `        }\n`;
    }

    if (tokenGroups.sizing.regular.length > 0) {
      output += `
        public struct Regular: ${componentName}SizingTokens {
            public static let shared = Regular()
            private init() {}
`;
      tokenGroups.sizing.regular.forEach(t => {
        output += `            public let ${t.name}: ${t.type} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    output += `    }\n`;
  }

  // Density section
  if (hasDensityTokens) {
    const densityTokenNames = new Map();
    [...tokenGroups.density.dense, ...tokenGroups.density.default, ...tokenGroups.density.spacious].forEach(t => {
      if (!densityTokenNames.has(t.name)) {
        densityTokenNames.set(t.name, { type: t.type, value: t.value });
      }
    });

    output += `
    // MARK: - Density

    /// Density tokens protocol
    public protocol ${componentName}DensityTokens: Sendable {
`;
    densityTokenNames.forEach((info, name) => {
      output += `        var ${name}: ${info.type} { get }\n`;
    });
    output += `    }

    /// Density accessor
    public enum DensityMode {
        /// Returns density tokens for the specified density mode
        public static func current(for density: Density) -> any ${componentName}DensityTokens {
            switch density {
            case .dense: return Dense.shared
            case .default: return Default.shared
            case .spacious: return Spacious.shared
            }
        }

        public static var dense: Dense { Dense.shared }
        public static var \`default\`: Default { Default.shared }
        public static var spacious: Spacious { Spacious.shared }
`;

    if (tokenGroups.density.dense.length > 0) {
      output += `
        public struct Dense: ${componentName}DensityTokens {
            public static let shared = Dense()
            private init() {}
`;
      tokenGroups.density.dense.forEach(t => {
        output += `            public let ${t.name}: ${t.type} = ${t.value}\n`;
      });
      output += `        }\n`;
    }

    if (tokenGroups.density.default.length > 0) {
      output += `
        public struct Default: ${componentName}DensityTokens {
            public static let shared = Default()
            private init() {}
`;
      tokenGroups.density.default.forEach(t => {
        output += `            public let ${t.name}: ${t.type} = ${t.value}\n`;
      });
      output += `        }\n`;
    }

    if (tokenGroups.density.spacious.length > 0) {
      output += `
        public struct Spacious: ${componentName}DensityTokens {
            public static let shared = Spacious()
            private init() {}
`;
      tokenGroups.density.spacious.forEach(t => {
        output += `            public let ${t.name}: ${t.type} = ${t.value}\n`;
      });
      output += `        }\n`;
    }
    output += `    }\n`;
  }

  // Typography section
  if (hasTypographyTokens) {
    const typographyTokenNames = new Map();
    [...tokenGroups.typography.compact, ...tokenGroups.typography.regular].forEach(t => {
      if (!typographyTokenNames.has(t.name)) {
        typographyTokenNames.set(t.name, { type: t.type, value: t.value });
      }
    });

    output += `
    // MARK: - Typography

    /// Typography tokens protocol
    public protocol ${componentName}TypographyTokens: Sendable {
`;
    typographyTokenNames.forEach((info, name) => {
      output += `        var ${name}: ${info.type} { get }\n`;
    });
    output += `    }

    /// Typography accessor
    public enum Typography {
        /// Returns typography tokens for the specified size class
        public static func current(for sizeClass: SizeClass) -> any ${componentName}TypographyTokens {
            sizeClass == .compact ? Compact.shared : Regular.shared
        }

        public static var compact: Compact { Compact.shared }
        public static var regular: Regular { Regular.shared }
`;

    if (tokenGroups.typography.compact.length > 0) {
      output += `
        public struct Compact: ${componentName}TypographyTokens {
            public static let shared = Compact()
            private init() {}
`;
      tokenGroups.typography.compact.forEach(t => {
        output += `            public let ${t.name}: ${t.type} = ${t.value}\n`;
      });
      output += `        }\n`;
    }

    if (tokenGroups.typography.regular.length > 0) {
      output += `
        public struct Regular: ${componentName}TypographyTokens {
            public static let shared = Regular()
            private init() {}
`;
      tokenGroups.typography.regular.forEach(t => {
        output += `            public let ${t.name}: ${t.type} = ${t.value}\n`;
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
 * Cleans up individual SwiftUI component files after aggregation
 */
async function cleanupSwiftUIIndividualComponentFiles() {
  if (!SWIFTUI_ENABLED) {
    return { cleaned: 0 };
  }

  console.log('🧹 Cleaning up individual SwiftUI component files...');

  let cleaned = 0;

  const iosDir = path.join(DIST_DIR, 'ios', 'brands');

  if (!fs.existsSync(iosDir)) {
    return { cleaned: 0 };
  }

  for (const brand of BRANDS) {
    const brandComponentsDir = path.join(iosDir, brand, 'components');

    if (!fs.existsSync(brandComponentsDir)) {
      continue;
    }

    const componentDirs = fs.readdirSync(brandComponentsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const componentName of componentDirs) {
      const componentDir = path.join(brandComponentsDir, componentName);
      const swiftFiles = fs.readdirSync(componentDir)
        .filter(f => f.endsWith('.swift') && !f.endsWith('Tokens.swift'));

      // Only delete individual files if aggregated file exists
      const aggregatedFile = path.join(componentDir, `${componentName}Tokens.swift`);
      if (fs.existsSync(aggregatedFile)) {
        for (const file of swiftFiles) {
          fs.unlinkSync(path.join(componentDir, file));
          cleaned++;
        }
      }
    }
  }

  console.log(`  📊 Cleaned: ${cleaned} individual files\n`);
  return { cleaned };
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

  const composeDir = path.join(DIST_DIR, 'android', 'compose', 'brands');
  const sharedDir = path.join(DIST_DIR, 'android', 'compose', 'shared');

  if (!fs.existsSync(composeDir)) {
    console.log('  ⚠️  No Compose output found, skipping theme generation');
    return { totalThemes: 0, successfulThemes: 0 };
  }

  // Generate shared files (brand-independent) - Dual-Axis Architecture
  if (fs.existsSync(sharedDir)) {
    // Density.kt
    const densityContent = generateSharedDensityFile();
    const densityFile = path.join(sharedDir, 'Density.kt');
    fs.writeFileSync(densityFile, densityContent, 'utf8');
    console.log('     ✅ shared/Density.kt');

    // WindowSizeClass.kt
    const windowSizeClassContent = generateSharedWindowSizeClassFile();
    const windowSizeClassFile = path.join(sharedDir, 'WindowSizeClass.kt');
    fs.writeFileSync(windowSizeClassFile, windowSizeClassContent, 'utf8');
    console.log('     ✅ shared/WindowSizeClass.kt');

    // ColorBrand.kt (Dual-Axis: color palette axis)
    const colorBrandContent = generateColorBrandEnumFile();
    const colorBrandFile = path.join(sharedDir, 'ColorBrand.kt');
    fs.writeFileSync(colorBrandFile, colorBrandContent, 'utf8');
    console.log('     ✅ shared/ColorBrand.kt (Dual-Axis: color palette)');

    // ContentBrand.kt (Dual-Axis: content/sizing axis)
    const contentBrandContent = generateContentBrandEnumFile();
    const contentBrandFile = path.join(sharedDir, 'ContentBrand.kt');
    fs.writeFileSync(contentBrandFile, contentBrandContent, 'utf8');
    console.log('     ✅ shared/ContentBrand.kt (Dual-Axis: content/sizing)');

    // DesignColorScheme.kt (unified interface)
    const designColorSchemeContent = generateDesignColorSchemeFile();
    const designColorSchemeFile = path.join(sharedDir, 'DesignColorScheme.kt');
    fs.writeFileSync(designColorSchemeFile, designColorSchemeContent, 'utf8');
    console.log('     ✅ shared/DesignColorScheme.kt (unified interface)');

    // DesignSizingScheme.kt (unified interface)
    const designSizingSchemeContent = generateDesignSizingSchemeFile();
    const designSizingSchemeFile = path.join(sharedDir, 'DesignSizingScheme.kt');
    fs.writeFileSync(designSizingSchemeFile, designSizingSchemeContent, 'utf8');
    console.log('     ✅ shared/DesignSizingScheme.kt (unified interface)');

    // DesignSystemTheme.kt (central theme provider with Dual-Axis)
    const designSystemThemeContent = generateDesignSystemThemeFile();
    const designSystemThemeFile = path.join(sharedDir, 'DesignSystemTheme.kt');
    fs.writeFileSync(designSystemThemeFile, designSystemThemeContent, 'utf8');
    console.log('     ✅ shared/DesignSystemTheme.kt (Dual-Axis theme provider)');

    // Remove old Brand.kt if it exists (replaced by ColorBrand + ContentBrand)
    const oldBrandFile = path.join(sharedDir, 'Brand.kt');
    if (fs.existsSync(oldBrandFile)) {
      fs.unlinkSync(oldBrandFile);
      console.log('     🗑️  Removed old shared/Brand.kt (replaced by Dual-Axis enums)');
    }

    successfulThemes = 1; // Central theme provider counts as 1
  }

  // Remove old individual brand theme files (Option 3B: single central theme provider)
  for (const brand of BRANDS) {
    const brandDir = path.join(composeDir, brand);
    const themeDir = path.join(brandDir, 'theme');

    if (fs.existsSync(themeDir)) {
      const themeFiles = fs.readdirSync(themeDir).filter(f => f.endsWith('Theme.kt'));
      for (const themeFile of themeFiles) {
        fs.unlinkSync(path.join(themeDir, themeFile));
        console.log(`     🗑️  Removed ${brand}/theme/${themeFile} (using central DesignSystemTheme)`);
      }
      // Remove empty theme directory
      if (fs.readdirSync(themeDir).length === 0) {
        fs.rmdirSync(themeDir);
      }
    }
    totalThemes++;
  }

  console.log(`  📊 Generated: ${successfulThemes}/${totalThemes} theme providers\n`);
  return { totalThemes, successfulThemes };
}

/**
 * Generates the Theme Provider Kotlin file content
 * @param brand - Brand name (e.g., 'bild', 'sportbild', 'advertorial')
 * @param hasColors - Whether the brand has its own color tokens
 */
function generateThemeProviderFile(brand, hasColors = true) {
  const brandPascal = brand.charAt(0).toUpperCase() + brand.slice(1);
  const packageJson = require('../../package.json');
  const version = packageJson.version;

  // For brands without colors, we need to use a shared color scheme (BildColorScheme)
  const colorImports = hasColors
    ? `import com.bild.designsystem.${brand}.semantic.${brandPascal}ColorScheme
import com.bild.designsystem.${brand}.semantic.${brandPascal}LightColors
import com.bild.designsystem.${brand}.semantic.${brandPascal}DarkColors`
    : `// ${brandPascal} uses shared color schemes from other brands (e.g., Bild, Sportbild)
// Import the color scheme you want to use:
import com.bild.designsystem.bild.semantic.BildColorScheme
import com.bild.designsystem.bild.semantic.BildLightColors
import com.bild.designsystem.bild.semantic.BildDarkColors`;

  const colorSchemeType = hasColors ? `${brandPascal}ColorScheme` : 'BildColorScheme';
  const defaultLightColors = hasColors ? `${brandPascal}LightColors` : 'BildLightColors';
  const defaultDarkColors = hasColors ? `${brandPascal}DarkColors` : 'BildDarkColors';

  const colorInjectionNote = hasColors ? '' : `
 * Note: ${brandPascal} does not have its own color tokens.
 * Colors can be injected from other brands (Bild or Sportbild).
 * Default: Uses BildLightColors/BildDarkColors
 *`;

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
${colorImports}
import com.bild.designsystem.${brand}.semantic.${brandPascal}SizingScheme
import com.bild.designsystem.${brand}.semantic.${brandPascal}SizingCompact
import com.bild.designsystem.${brand}.semantic.${brandPascal}SizingRegular
import com.bild.designsystem.shared.Density
import com.bild.designsystem.shared.WindowSizeClass

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSITION LOCALS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * CompositionLocal for current color scheme (Light/Dark)
 * Uses ${colorSchemeType} interface for type-safe access
 */
internal val Local${brandPascal}Colors = staticCompositionLocalOf<${colorSchemeType}> { ${defaultLightColors} }

/**
 * CompositionLocal for current size class (Compact/Regular)
 */
internal val Local${brandPascal}SizeClass = staticCompositionLocalOf { WindowSizeClass.Compact }

/**
 * CompositionLocal for current density (Dense/Default/Spacious)
 */
internal val Local${brandPascal}Density = staticCompositionLocalOf { Density.Default }

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
 *${colorInjectionNote}
 * @param darkTheme Whether to use dark color scheme
 * @param lightColors Light color scheme to use (allows color scheme injection)
 * @param darkColors Dark color scheme to use (allows color scheme injection)
 * @param sizeClass Current window size class for responsive sizing
 * @param density UI density for spacing adjustments
 * @param content Composable content to wrap
 *
 * Usage:
 * \`\`\`kotlin
 * ${brandPascal}Theme(
 *     darkTheme = isSystemInDarkTheme(),
 *     sizeClass = calculateWindowSizeClass(),
 *     density = Density.Default
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
    lightColors: ${colorSchemeType} = ${defaultLightColors},
    darkColors: ${colorSchemeType} = ${defaultDarkColors},
    sizeClass: WindowSizeClass = WindowSizeClass.Compact,
    density: Density = Density.Default,
    content: @Composable () -> Unit
) {
    val colors = if (darkTheme) darkColors else lightColors

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
 *             fontSize = ${brandPascal}Theme.sizing.headline1FontSize
 *         )
 *     }
 * }
 * \`\`\`
 */
object ${brandPascal}Theme {

    /**
     * Current color scheme (Light or Dark based on theme)
     * Type-safe access via ${colorSchemeType} interface
     */
    val colors: ${colorSchemeType}
        @Composable
        @ReadOnlyComposable
        get() = Local${brandPascal}Colors.current

    /**
     * Current sizing values based on WindowSizeClass
     */
    val sizing: ${brandPascal}SizingScheme
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
    val density: Density
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
 * Generates the shared Density enum file
 * Creates: dist/android/compose/shared/Density.kt
 */
function generateSharedDensityFile() {
  const packageJson = require('../../package.json');
  const version = packageJson.version;

  return `/**
 * Do not edit directly, this file was auto-generated.
 *
 * BILD Design System Tokens v${version}
 * Generated by Style Dictionary
 *
 * Shared Density Enum
 * Brand-independent density settings for UI spacing adjustments
 *
 * Copyright (c) 2024 Axel Springer Deutschland GmbH
 */

package com.bild.designsystem.shared

/**
 * UI density for spacing adjustments
 *
 * Density is brand-independent and can be used across all brands.
 * Controls spacing, padding, and other density-related design tokens.
 *
 * Usage:
 * \`\`\`kotlin
 * BildTheme(
 *     density = Density.Default
 * ) {
 *     // Content with default density
 * }
 * \`\`\`
 */
enum class Density {
    /** Dense UI with reduced padding and spacing */
    Dense,
    /** Standard/default spacing */
    Default,
    /** Spacious UI with increased padding and spacing */
    Spacious
}
`;
}

/**
 * Generates the shared WindowSizeClass enum file
 * Creates: dist/android/compose/shared/WindowSizeClass.kt
 */
function generateSharedWindowSizeClassFile() {
  const packageJson = require('../../package.json');
  const version = packageJson.version;

  return `/**
 * Do not edit directly, this file was auto-generated.
 *
 * BILD Design System Tokens v${version}
 * Generated by Style Dictionary
 *
 * Shared WindowSizeClass Enum
 * Brand-independent window size classification for responsive layouts
 *
 * Copyright (c) 2024 Axel Springer Deutschland GmbH
 */

package com.bild.designsystem.shared

/**
 * Window size class for responsive layouts
 *
 * WindowSizeClass is brand-independent and can be used across all brands.
 * Maps to design token breakpoints:
 * - Compact: xs (320px), sm (390px) - Phones in portrait
 * - Regular: md (600px), lg (1024px) - Tablets, phones in landscape, desktops
 *
 * Usage:
 * \`\`\`kotlin
 * BildTheme(
 *     sizeClass = WindowSizeClass.Compact
 * ) {
 *     // Content with compact sizing tokens
 * }
 * \`\`\`
 *
 * Integration with AndroidX WindowSizeClass:
 * \`\`\`kotlin
 * val windowSizeClass = calculateWindowSizeClass(activity)
 * val sizeClass = when (windowSizeClass.widthSizeClass) {
 *     WindowWidthSizeClass.Compact -> WindowSizeClass.Compact
 *     else -> WindowSizeClass.Regular
 * }
 * \`\`\`
 */
enum class WindowSizeClass {
    /** Phones in portrait mode (xs: 320px, sm: 390px breakpoints) */
    Compact,
    /** Tablets, phones in landscape, desktops (md: 600px, lg: 1024px breakpoints) */
    Regular
}
`;
}

/**
 * Generates the ColorBrand enum file (Dual-Axis Architecture)
 * Creates: dist/android/compose/shared/ColorBrand.kt
 * Only brands with their own color tokens (bild, sportbild)
 */
function generateColorBrandEnumFile() {
  const packageJson = require('../../package.json');
  const version = packageJson.version;

  const brandEntries = COLOR_BRANDS.map(brand => {
    const brandPascal = brand.charAt(0).toUpperCase() + brand.slice(1);
    return `    /** ${brandPascal} color palette */
    ${brandPascal}`;
  }).join(',\n');

  return `/**
 * Do not edit directly, this file was auto-generated.
 *
 * BILD Design System Tokens v${version}
 * Generated by Style Dictionary
 *
 * ColorBrand Enum (Dual-Axis Architecture)
 * Defines the color palette axis - only brands with their own color tokens
 *
 * Copyright (c) 2024 Axel Springer Deutschland GmbH
 */

package com.bild.designsystem.shared

/**
 * Color brands in the BILD Design System
 *
 * Determines which color palette to use. Only brands with their own
 * color tokens are included. Advertorial uses colors from BILD or SportBILD.
 *
 * Usage:
 * \`\`\`kotlin
 * DesignSystemTheme(
 *     colorBrand = ColorBrand.Bild,        // Use BILD colors
 *     contentBrand = ContentBrand.Advertorial,  // Use Advertorial sizing
 *     darkTheme = isSystemInDarkTheme()
 * ) {
 *     // Advertorial content with BILD colors
 * }
 * \`\`\`
 */
enum class ColorBrand {
${brandEntries}
}
`;
}

/**
 * Generates the ContentBrand enum file (Dual-Axis Architecture)
 * Creates: dist/android/compose/shared/ContentBrand.kt
 * All brands including those without own colors (advertorial)
 */
function generateContentBrandEnumFile() {
  const packageJson = require('../../package.json');
  const version = packageJson.version;

  const brandEntries = CONTENT_BRANDS.map(brand => {
    const brandPascal = brand.charAt(0).toUpperCase() + brand.slice(1);
    const hasColors = COLOR_BRANDS.includes(brand);
    const note = hasColors ? '' : ' (uses ColorBrand for colors)';
    return `    /** ${brandPascal} content/sizing${note} */
    ${brandPascal}`;
  }).join(',\n');

  return `/**
 * Do not edit directly, this file was auto-generated.
 *
 * BILD Design System Tokens v${version}
 * Generated by Style Dictionary
 *
 * ContentBrand Enum (Dual-Axis Architecture)
 * Defines the content axis - sizing, typography, and layout tokens
 *
 * Copyright (c) 2024 Axel Springer Deutschland GmbH
 */

package com.bild.designsystem.shared

/**
 * Content brands in the BILD Design System
 *
 * Determines which sizing, typography, and layout tokens to use.
 * All brands are included, even those without their own color tokens.
 *
 * Note: Advertorial uses ColorBrand for colors but has its own sizing tokens.
 *
 * Usage:
 * \`\`\`kotlin
 * DesignSystemTheme(
 *     colorBrand = ColorBrand.Sportbild,   // Use SportBILD colors
 *     contentBrand = ContentBrand.Advertorial,  // Use Advertorial sizing
 *     darkTheme = isSystemInDarkTheme()
 * ) {
 *     // Advertorial content with SportBILD colors
 * }
 * \`\`\`
 */
enum class ContentBrand {
${brandEntries}
}
`;
}

/**
 * Generates the unified DesignColorScheme interface
 * Creates: dist/android/compose/shared/DesignColorScheme.kt
 * All color brands implement this interface for polymorphic color access
 */
function generateDesignColorSchemeFile() {
  const packageJson = require('../../package.json');
  const version = packageJson.version;

  // Read color properties from existing BildColorScheme to ensure consistency
  const bildColorsPath = path.join(DIST_DIR, 'android', 'compose', 'brands', 'bild', 'semantic', 'color', 'ColorsLight.kt');
  let colorProperties = [];

  if (fs.existsSync(bildColorsPath)) {
    const content = fs.readFileSync(bildColorsPath, 'utf8');
    // Extract interface properties (handles both "interface X {" and "interface X : Y {")
    const interfaceMatch = content.match(/interface \w+ColorScheme[^{]*\{([^}]+)\}/s);
    if (interfaceMatch) {
      const propsMatch = interfaceMatch[1].matchAll(/val\s+(\w+):\s*Color/g);
      for (const match of propsMatch) {
        colorProperties.push(match[1]);
      }
    }
  }

  // Fallback to essential properties if file not found
  if (colorProperties.length === 0) {
    colorProperties = [
      'textColorPrimary', 'textColorSecondary', 'textColorMuted', 'textColorAccent',
      'surfaceColorPrimary', 'surfaceColorSecondary', 'surfaceColorTertiary',
      'borderColorLowContrast', 'borderColorMediumContrast', 'borderColorHighContrast',
      'coreColorPrimary', 'coreColorSecondary', 'coreColorTertiary'
    ];
  }

  const propertyDeclarations = colorProperties.map(prop => `    val ${prop}: Color`).join('\n');

  return `/**
 * Do not edit directly, this file was auto-generated.
 *
 * BILD Design System Tokens v${version}
 * Generated by Style Dictionary
 *
 * Unified DesignColorScheme Interface (Dual-Axis Architecture)
 * All color brands implement this interface for polymorphic color access
 *
 * Copyright (c) 2024 Axel Springer Deutschland GmbH
 */

package com.bild.designsystem.shared

import androidx.compose.runtime.Stable
import androidx.compose.ui.graphics.Color

/**
 * Unified color scheme interface for the BILD Design System
 *
 * All color brands (BILD, SportBILD) implement this interface,
 * enabling polymorphic color access across brands.
 *
 * This follows the Dual-Axis Architecture:
 * - ColorBrand axis: Determines which color palette (BILD or SportBILD)
 * - ContentBrand axis: Determines sizing/typography (BILD, SportBILD, or Advertorial)
 *
 * Usage:
 * \`\`\`kotlin
 * @Composable
 * fun MyComponent() {
 *     val colors: DesignColorScheme = DesignSystemTheme.colors
 *     Text(
 *         text = "Hello",
 *         color = colors.textColorPrimary
 *     )
 * }
 * \`\`\`
 */
@Stable
interface DesignColorScheme {
${propertyDeclarations}
}
`;
}

/**
 * Generates the unified DesignSizingScheme interface
 * Creates: dist/android/compose/shared/DesignSizingScheme.kt
 */
function generateDesignSizingSchemeFile() {
  const packageJson = require('../../package.json');
  const version = packageJson.version;

  // Read sizing properties from existing BildSizingScheme
  const bildSizingPath = path.join(DIST_DIR, 'android', 'compose', 'brands', 'bild', 'semantic', 'sizeclass', 'SizingCompact.kt');
  let sizingProperties = [];

  if (fs.existsSync(bildSizingPath)) {
    const content = fs.readFileSync(bildSizingPath, 'utf8');
    // Extract interface properties (handles both "interface X {" and "interface X : Y {")
    const interfaceMatch = content.match(/interface \w+SizingScheme[^{]*\{([^}]+)\}/s);
    if (interfaceMatch) {
      const propsMatch = interfaceMatch[1].matchAll(/val\s+(\w+):\s*(\w+)/g);
      for (const match of propsMatch) {
        sizingProperties.push({ name: match[1], type: match[2] });
      }
    }
  }

  // Fallback to essential properties
  if (sizingProperties.length === 0) {
    sizingProperties = [
      { name: 'gridSpaceRespBase', type: 'Dp' },
      { name: 'gridSpaceRespSm', type: 'Dp' },
      { name: 'gridSpaceRespLg', type: 'Dp' },
      { name: 'pageInlineSpace', type: 'Dp' },
      { name: 'sectionSpaceBase', type: 'Dp' }
    ];
  }

  const propertyDeclarations = sizingProperties.map(prop => `    val ${prop.name}: ${prop.type}`).join('\n');

  return `/**
 * Do not edit directly, this file was auto-generated.
 *
 * BILD Design System Tokens v${version}
 * Generated by Style Dictionary
 *
 * Unified DesignSizingScheme Interface (Dual-Axis Architecture)
 * All content brands implement this interface for polymorphic sizing access
 *
 * Copyright (c) 2024 Axel Springer Deutschland GmbH
 */

package com.bild.designsystem.shared

import androidx.compose.runtime.Stable
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit

/**
 * Unified sizing scheme interface for the BILD Design System
 *
 * All content brands (BILD, SportBILD, Advertorial) implement this interface,
 * enabling polymorphic sizing access across brands.
 */
@Stable
interface DesignSizingScheme {
${propertyDeclarations}
}
`;
}

/**
 * Generates the central DesignSystemTheme file with Dual-Axis Architecture
 * Creates: dist/android/compose/shared/DesignSystemTheme.kt
 */
function generateDesignSystemThemeFile() {
  const packageJson = require('../../package.json');
  const version = packageJson.version;

  // Generate color imports for all color brands
  const colorImports = COLOR_BRANDS.map(brand => {
    const brandPascal = brand.charAt(0).toUpperCase() + brand.slice(1);
    return `import com.bild.designsystem.${brand}.semantic.${brandPascal}LightColors
import com.bild.designsystem.${brand}.semantic.${brandPascal}DarkColors`;
  }).join('\n');

  // Generate sizing imports for all content brands
  const sizingImports = CONTENT_BRANDS.map(brand => {
    const brandPascal = brand.charAt(0).toUpperCase() + brand.slice(1);
    return `import com.bild.designsystem.${brand}.semantic.${brandPascal}SizingCompact
import com.bild.designsystem.${brand}.semantic.${brandPascal}SizingRegular`;
  }).join('\n');

  // Generate color selection cases
  const colorCases = COLOR_BRANDS.map(brand => {
    const brandPascal = brand.charAt(0).toUpperCase() + brand.slice(1);
    return `        ColorBrand.${brandPascal} -> if (darkTheme) ${brandPascal}DarkColors else ${brandPascal}LightColors`;
  }).join('\n');

  // Generate sizing selection cases
  const sizingCases = CONTENT_BRANDS.map(brand => {
    const brandPascal = brand.charAt(0).toUpperCase() + brand.slice(1);
    return `        ContentBrand.${brandPascal} -> when (sizeClass) {
            WindowSizeClass.Compact -> ${brandPascal}SizingCompact
            WindowSizeClass.Regular -> ${brandPascal}SizingRegular
        }`;
  }).join('\n');

  return `/**
 * Do not edit directly, this file was auto-generated.
 *
 * BILD Design System Tokens v${version}
 * Generated by Style Dictionary
 *
 * Central Design System Theme Provider (Dual-Axis Architecture)
 * Unified entry point with separate ColorBrand and ContentBrand axes
 *
 * Copyright (c) 2024 Axel Springer Deutschland GmbH
 */

package com.bild.designsystem.shared

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf

// Color imports (ColorBrand axis)
${colorImports}

// Sizing imports (ContentBrand axis)
${sizingImports}

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSITION LOCALS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * CompositionLocal for current color scheme
 * Type: DesignColorScheme (unified interface)
 */
internal val LocalDesignColors = staticCompositionLocalOf<DesignColorScheme> { BildLightColors }

/**
 * CompositionLocal for current sizing scheme
 * Type: DesignSizingScheme (unified interface)
 */
internal val LocalDesignSizing = staticCompositionLocalOf<DesignSizingScheme> { BildSizingCompact }

/**
 * CompositionLocal for current window size class
 */
internal val LocalWindowSizeClass = staticCompositionLocalOf { WindowSizeClass.Compact }

/**
 * CompositionLocal for current density
 */
internal val LocalDensity = staticCompositionLocalOf { Density.Default }

/**
 * CompositionLocal for dark theme state
 */
internal val LocalIsDarkTheme = staticCompositionLocalOf { false }

/**
 * CompositionLocal for current color brand
 */
internal val LocalColorBrand = staticCompositionLocalOf { ColorBrand.Bild }

/**
 * CompositionLocal for current content brand
 */
internal val LocalContentBrand = staticCompositionLocalOf { ContentBrand.Bild }

// ══════════════════════════════════════════════════════════════════════════════
// THEME PROVIDER
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Central Design System Theme Provider (Dual-Axis Architecture)
 *
 * Provides a unified entry point with two independent brand axes:
 * - ColorBrand: Determines color palette (BILD or SportBILD)
 * - ContentBrand: Determines sizing/typography (BILD, SportBILD, or Advertorial)
 *
 * This enables use cases like "Advertorial content with SportBILD colors".
 *
 * @param colorBrand Color palette to use (BILD or SportBILD)
 * @param contentBrand Content/sizing tokens to use (BILD, SportBILD, or Advertorial)
 * @param darkTheme Whether to use dark color scheme
 * @param sizeClass Window size class for responsive sizing
 * @param density UI density for spacing adjustments
 * @param content Composable content to wrap
 *
 * Usage:
 * \`\`\`kotlin
 * // Standard BILD app
 * DesignSystemTheme(
 *     colorBrand = ColorBrand.Bild,
 *     contentBrand = ContentBrand.Bild
 * ) {
 *     MyApp()
 * }
 *
 * // Advertorial with SportBILD colors
 * DesignSystemTheme(
 *     colorBrand = ColorBrand.Sportbild,
 *     contentBrand = ContentBrand.Advertorial
 * ) {
 *     AdvertorialContent()
 * }
 * \`\`\`
 */
@Composable
fun DesignSystemTheme(
    colorBrand: ColorBrand = ColorBrand.Bild,
    contentBrand: ContentBrand = ContentBrand.Bild,
    darkTheme: Boolean = isSystemInDarkTheme(),
    sizeClass: WindowSizeClass = WindowSizeClass.Compact,
    density: Density = Density.Default,
    content: @Composable () -> Unit
) {
    val colors: DesignColorScheme = when (colorBrand) {
${colorCases}
    }

    val sizing: DesignSizingScheme = when (contentBrand) {
${sizingCases}
    }

    CompositionLocalProvider(
        LocalDesignColors provides colors,
        LocalDesignSizing provides sizing,
        LocalWindowSizeClass provides sizeClass,
        LocalDensity provides density,
        LocalIsDarkTheme provides darkTheme,
        LocalColorBrand provides colorBrand,
        LocalContentBrand provides contentBrand,
        content = content
    )
}

// ══════════════════════════════════════════════════════════════════════════════
// THEME ACCESSOR OBJECT
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Accessor object for Design System theme values
 *
 * Provides convenient access to current theme values from any composable.
 *
 * Usage:
 * \`\`\`kotlin
 * @Composable
 * fun MyButton() {
 *     Button(
 *         colors = ButtonDefaults.buttonColors(
 *             containerColor = DesignSystemTheme.colors.coreColorPrimary
 *         )
 *     ) {
 *         Text(
 *             text = "Click me",
 *             fontSize = DesignSystemTheme.sizing.headline1FontSize
 *         )
 *     }
 * }
 * \`\`\`
 */
object DesignSystemTheme {

    /**
     * Current color scheme (based on ColorBrand and dark/light mode)
     */
    val colors: DesignColorScheme
        @Composable
        @ReadOnlyComposable
        get() = LocalDesignColors.current

    /**
     * Current sizing scheme (based on ContentBrand and WindowSizeClass)
     */
    val sizing: DesignSizingScheme
        @Composable
        @ReadOnlyComposable
        get() = LocalDesignSizing.current

    /**
     * Current window size class
     */
    val sizeClass: WindowSizeClass
        @Composable
        @ReadOnlyComposable
        get() = LocalWindowSizeClass.current

    /**
     * Current UI density
     */
    val density: Density
        @Composable
        @ReadOnlyComposable
        get() = LocalDensity.current

    /**
     * Whether dark theme is currently active
     */
    val isDarkTheme: Boolean
        @Composable
        @ReadOnlyComposable
        get() = LocalIsDarkTheme.current

    /**
     * Current color brand
     */
    val colorBrand: ColorBrand
        @Composable
        @ReadOnlyComposable
        get() = LocalColorBrand.current

    /**
     * Current content brand
     */
    val contentBrand: ContentBrand
        @Composable
        @ReadOnlyComposable
        get() = LocalContentBrand.current
}
`;
}

/**
 * Consolidates all primitive files into a single DesignTokenPrimitives.kt file
 * Creates: dist/android/compose/shared/DesignTokenPrimitives.kt
 */
async function consolidateComposePrimitives() {
  if (!COMPOSE_ENABLED) {
    return { total: 0, successful: 0 };
  }

  console.log('📦 Consolidating Compose Primitives...');

  const sharedDir = path.join(DIST_DIR, 'android', 'compose', 'shared');

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
 *   DesignTokenPrimitives.Colors.bildred
 *   DesignTokenPrimitives.Space.space2x
 *   DesignTokenPrimitives.Size.size4x
 *   DesignTokenPrimitives.Font.fontWeightBold
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
 * Creates: dist/android/compose/brands/{brand}/semantic/{Brand}SemanticTokens.kt
 */
async function aggregateComposeSemantics() {
  if (!COMPOSE_ENABLED) {
    return { totalBrands: 0, successfulBrands: 0 };
  }

  console.log('📦 Aggregating Compose Semantic Tokens...');

  let totalBrands = 0;
  let successfulBrands = 0;

  const composeDir = path.join(DIST_DIR, 'android', 'compose', 'brands');

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

          // Match both 'val' and 'override val' declarations
          const valRegex = /^\s*(?:override\s+)?val\s+(\w+)\s*=\s*(.+)$/gm;
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

          // Match both 'val' and 'override val' declarations
          const valRegex = /^\s*(?:override\s+)?val\s+(\w+)\s*=\s*(.+)$/gm;
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
  const sharedDir = path.join(DIST_DIR, 'android', 'compose', 'shared');
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
  const composeDir = path.join(DIST_DIR, 'android', 'compose', 'brands');
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
 * Removes individual SwiftUI primitive files, keeping only DesignTokenPrimitives.swift
 * This follows SwiftUI best practice of consolidated primitives with nested enums
 */
async function cleanupSwiftUIIndividualPrimitives() {
  if (!SWIFTUI_ENABLED) {
    return { removed: 0 };
  }

  console.log('🧹 Cleaning up individual SwiftUI primitive files...');

  let removedCount = 0;

  // Clean up individual primitive files (keep only DesignTokenPrimitives.swift)
  const sharedDir = path.join(DIST_DIR, 'ios', 'shared');
  if (fs.existsSync(sharedDir)) {
    const primitiveFiles = ['Colorprimitive.swift', 'Fontprimitive.swift', 'Sizeprimitive.swift', 'Spaceprimitive.swift'];
    for (const fileName of primitiveFiles) {
      const filePath = path.join(sharedDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        removedCount++;
      }
    }
  }

  console.log(`  📊 Removed ${removedCount} individual Swift primitive files\n`);
  return { removed: removedCount };
}

// ============================================================================
// SWIFTUI POST-PROCESSING FUNCTIONS
// ============================================================================

/**
 * Generates SwiftUI Shared Infrastructure files
 * Creates: dist/ios/shared/*.swift (Enums, TextStyle, Shadow, ColorExtension)
 */
async function generateSwiftUISharedFiles() {
  if (!SWIFTUI_ENABLED) {
    return { total: 0, successful: 0 };
  }

  console.log('🍎 Generating SwiftUI Shared Infrastructure...');

  const sharedDir = path.join(DIST_DIR, 'ios', 'shared');
  if (!fs.existsSync(sharedDir)) {
    fs.mkdirSync(sharedDir, { recursive: true });
  }

  const packageJson = require('../../package.json');
  const version = packageJson.version;
  let successful = 0;

  // Generate Enums.swift (Density, SizeClass, ColorBrand, ContentBrand)
  const enumsContent = `//
// Do not edit directly, this file was auto-generated.
//
// BILD Design System Tokens v${version}
// Generated by Style Dictionary
//
// Copyright (c) 2024 Axel Springer Deutschland GmbH
//

import Foundation

/// UI density modes for the BILD Design System
public enum Density: String, CaseIterable, Sendable {
    case dense
    case \`default\`
    case spacious
}

/// Size class for responsive layouts
/// Maps to iOS UITraitCollection.horizontalSizeClass
public enum SizeClass: String, CaseIterable, Sendable {
    case compact   // Phones (Portrait), small screens - maps to xs/sm breakpoints
    case regular   // Tablets, Phones (Landscape) - maps to md/lg breakpoints
}

/// Color brands - defines the color palette and effects
/// Only brands with their own color schemes are included
public enum ColorBrand: String, CaseIterable, Sendable {
    case bild
    case sportbild
    // Note: Advertorial uses BILD or SportBILD colors
}

/// Content brands - defines sizing, typography, and layout tokens
/// All brands including those without own color schemes
public enum ContentBrand: String, CaseIterable, Sendable {
    case bild
    case sportbild
    case advertorial
}

/// Legacy: Combined brand enum for backwards compatibility
@available(*, deprecated, message: "Use ColorBrand and ContentBrand for dual-axis theming")
public enum Brand: String, CaseIterable, Sendable {
    case bild
    case sportbild
    case advertorial
}
`;
  fs.writeFileSync(path.join(sharedDir, 'Enums.swift'), enumsContent, 'utf8');
  console.log('     ✅ shared/Enums.swift');
  successful++;

  // Generate Color+Hex.swift
  const colorExtContent = `//
// Do not edit directly, this file was auto-generated.
//
// BILD Design System Tokens v${version}
// Generated by Style Dictionary
//
// Copyright (c) 2024 Axel Springer Deutschland GmbH
//

import SwiftUI

public extension Color {
    /// Initialize Color from hex value
    /// - Parameters:
    ///   - hex: Hex color value (e.g., 0xDD0000)
    ///   - alpha: Optional alpha value (0.0 - 1.0)
    init(hex: UInt, alpha: Double = 1.0) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: alpha
        )
    }
}
`;
  fs.writeFileSync(path.join(sharedDir, 'Color+Hex.swift'), colorExtContent, 'utf8');
  console.log('     ✅ shared/Color+Hex.swift');
  successful++;

  // Generate TextStyle.swift
  const textStyleContent = `//
// Do not edit directly, this file was auto-generated.
//
// BILD Design System Tokens v${version}
// Generated by Style Dictionary
//
// Copyright (c) 2024 Axel Springer Deutschland GmbH
//

import SwiftUI

/// Composite typography token representing a complete text style
public struct TextStyle: Equatable, Sendable {
    public let fontFamily: String
    public let fontWeight: Font.Weight
    public let fontSize: CGFloat
    public let lineHeight: CGFloat
    public let letterSpacing: CGFloat
    public let textCase: TextCase
    public let textDecoration: TextDecoration

    public init(
        fontFamily: String,
        fontWeight: Font.Weight,
        fontSize: CGFloat,
        lineHeight: CGFloat,
        letterSpacing: CGFloat,
        textCase: TextCase = .original,
        textDecoration: TextDecoration = .none
    ) {
        self.fontFamily = fontFamily
        self.fontWeight = fontWeight
        self.fontSize = fontSize
        self.lineHeight = lineHeight
        self.letterSpacing = letterSpacing
        self.textCase = textCase
        self.textDecoration = textDecoration
    }

    public enum TextCase: String, Sendable {
        case original = "ORIGINAL"
        case upper = "UPPER"
        case lower = "LOWER"
        case capitalize = "CAPITALIZE"

        var swiftUICase: Text.Case? {
            switch self {
            case .original: return nil
            case .upper: return .uppercase
            case .lower: return .lowercase
            case .capitalize: return nil
            }
        }
    }

    public enum TextDecoration: String, Sendable {
        case none = "NONE"
        case underline = "UNDERLINE"
        case strikethrough = "STRIKETHROUGH"
    }

    /// Create a SwiftUI Font from this text style with Dynamic Type support
    public func font(relativeTo textStyle: Font.TextStyle = .body) -> Font {
        Font.custom(fontFamily, size: fontSize, relativeTo: textStyle)
            .weight(fontWeight)
    }

    /// Line spacing value for SwiftUI (lineHeight - fontSize)
    public var lineSpacing: CGFloat {
        max(0, lineHeight - fontSize)
    }
}

/// View modifier for applying TextStyle
public struct TextStyleModifier: ViewModifier {
    let style: TextStyle
    let relativeTo: Font.TextStyle

    public init(_ style: TextStyle, relativeTo: Font.TextStyle = .body) {
        self.style = style
        self.relativeTo = relativeTo
    }

    public func body(content: Content) -> some View {
        content
            .font(style.font(relativeTo: relativeTo))
            .tracking(style.letterSpacing)
            .lineSpacing(style.lineSpacing)
            .textCase(style.textCase.swiftUICase)
    }
}

public extension View {
    func textStyle(_ style: TextStyle, relativeTo: Font.TextStyle = .body) -> some View {
        modifier(TextStyleModifier(style, relativeTo: relativeTo))
    }
}
`;
  fs.writeFileSync(path.join(sharedDir, 'TextStyle.swift'), textStyleContent, 'utf8');
  console.log('     ✅ shared/TextStyle.swift');
  successful++;

  // Generate ShadowStyle.swift
  const shadowContent = `//
// Do not edit directly, this file was auto-generated.
//
// BILD Design System Tokens v${version}
// Generated by Style Dictionary
//
// Copyright (c) 2024 Axel Springer Deutschland GmbH
//

import SwiftUI

/// Single drop shadow definition
public struct DropShadow: Equatable, Sendable {
    public let color: Color
    public let offsetX: CGFloat
    public let offsetY: CGFloat
    public let radius: CGFloat
    public let spread: CGFloat

    public init(
        color: Color,
        offsetX: CGFloat,
        offsetY: CGFloat,
        radius: CGFloat,
        spread: CGFloat = 0
    ) {
        self.color = color
        self.offsetX = offsetX
        self.offsetY = offsetY
        self.radius = radius
        self.spread = spread
    }
}

/// Composite shadow token (can contain multiple layers)
public struct ShadowStyle: Equatable, Sendable {
    public let shadows: [DropShadow]

    public init(shadows: [DropShadow]) {
        self.shadows = shadows
    }

    public init(_ shadow: DropShadow) {
        self.shadows = [shadow]
    }
}

/// View modifier for applying ShadowStyle (applies all shadow layers)
public struct ShadowStyleModifier: ViewModifier {
    let style: ShadowStyle

    public init(_ style: ShadowStyle) {
        self.style = style
    }

    public func body(content: Content) -> some View {
        style.shadows.reduce(AnyView(content)) { view, shadow in
            AnyView(view.shadow(
                color: shadow.color,
                radius: shadow.radius,
                x: shadow.offsetX,
                y: shadow.offsetY
            ))
        }
    }
}

public extension View {
    func shadowStyle(_ style: ShadowStyle) -> some View {
        modifier(ShadowStyleModifier(style))
    }
}
`;
  fs.writeFileSync(path.join(sharedDir, 'ShadowStyle.swift'), shadowContent, 'utf8');
  console.log('     ✅ shared/ShadowStyle.swift');
  successful++;

  // Generate DesignSystemTheme.swift with dual-axis architecture
  const designSystemThemeContent = `//
// Do not edit directly, this file was auto-generated.
//
// BILD Design System Tokens v${version}
// Generated by Style Dictionary
//
// Copyright (c) 2024 Axel Springer Deutschland GmbH
//

import SwiftUI

// MARK: - Unified Protocols

/// Unified color scheme protocol for all color brands (BILD, SportBILD)
/// Allows interchangeable color schemes across content brands
public protocol DesignColorScheme: Sendable {
    var textColorPrimary: Color { get }
    var textColorSecondary: Color { get }
    var textColorMuted: Color { get }
    var textColorAccent: Color { get }
    var textColorAccentConstant: Color { get }
    var textColorPrimaryInverse: Color { get }
    var textColorPrimaryConstant: Color { get }
    var textColorPrimaryInverseConstant: Color { get }
    var textColorSuccessConstant: Color { get }
    var textColorAttentionHigh: Color { get }
    var textColorAttentionMedium: Color { get }
    var textColorOnDarkSurface: Color { get }
    var surfaceColorPrimary: Color { get }
    var surfaceColorSecondary: Color { get }
    var surfaceColorTertiary: Color { get }
    var surfaceColorQuartenary: Color { get }
    var surfaceColorPrimaryInverse: Color { get }
    var surfaceColorPrimaryConstantLight: Color { get }
    var surfaceColorPrimaryConstantDark: Color { get }
    var surfaceColorSuccess: Color { get }
    var borderColorLowContrast: Color { get }
    var borderColorMediumContrast: Color { get }
    var borderColorHighContrast: Color { get }
    var coreColorPrimary: Color { get }
    var coreColorSecondary: Color { get }
    var coreColorTertiary: Color { get }
}

/// Unified sizing scheme protocol for all content brands
public protocol DesignSizingScheme: Sendable {
    var gridSpaceRespBase: CGFloat { get }
    var gridSpaceRespSm: CGFloat { get }
    var gridSpaceRespLg: CGFloat { get }
    var gridSpaceRespXl: CGFloat { get }
    var sectionSpaceBase: CGFloat { get }
    var sectionSpaceSm: CGFloat { get }
    var sectionSpaceLg: CGFloat { get }
    var pageInlineSpace: CGFloat { get }
}

/// Unified effects scheme protocol for all color brands
public protocol DesignEffectsScheme: Sendable {
    var shadowSoftSm: ShadowStyle { get }
    var shadowSoftMd: ShadowStyle { get }
    var shadowSoftLg: ShadowStyle { get }
    var shadowSoftXl: ShadowStyle { get }
    var shadowHardSm: ShadowStyle { get }
    var shadowHardMd: ShadowStyle { get }
    var shadowHardLg: ShadowStyle { get }
    var shadowHardXl: ShadowStyle { get }
}

// MARK: - Dual-Axis Theme Provider

/// Multi-brand theme provider with dual-axis architecture
/// - ColorBrand axis: Defines colors and effects (BILD, SportBILD)
/// - ContentBrand axis: Defines sizing, typography, layout (BILD, SportBILD, Advertorial)
///
/// Example usage:
/// \`\`\`swift
/// // Advertorial content with BILD colors
/// DesignSystemTheme(colorBrand: .bild, contentBrand: .advertorial)
///
/// // Advertorial content with SportBILD colors
/// DesignSystemTheme(colorBrand: .sportbild, contentBrand: .advertorial)
/// \`\`\`
@Observable
public final class DesignSystemTheme: @unchecked Sendable {

    // MARK: - Shared Instance
    public static let shared = DesignSystemTheme()

    // MARK: - Theme State (Dual-Axis)

    /// Color brand determines the color palette and effects
    public var colorBrand: ColorBrand = .bild

    /// Content brand determines sizing, typography, and layout
    public var contentBrand: ContentBrand = .bild

    /// Dark/Light mode
    public var isDarkTheme: Bool = false

    /// Size class for responsive layouts
    public var sizeClass: SizeClass = .compact

    /// Density mode
    public var density: Density = .default

    private init() {}

    // MARK: - Factory

    public init(
        colorBrand: ColorBrand = .bild,
        contentBrand: ContentBrand = .bild,
        isDarkTheme: Bool = false,
        sizeClass: SizeClass = .compact,
        density: Density = .default
    ) {
        self.colorBrand = colorBrand
        self.contentBrand = contentBrand
        self.isDarkTheme = isDarkTheme
        self.sizeClass = sizeClass
        self.density = density
    }

    // MARK: - Color Access (based on colorBrand)

    /// Current color scheme based on colorBrand and isDarkTheme
    public var colors: any DesignColorScheme {
        switch colorBrand {
        case .bild:
            return isDarkTheme ? BildDarkColors.shared : BildLightColors.shared
        case .sportbild:
            return isDarkTheme ? SportbildDarkColors.shared : SportbildLightColors.shared
        }
    }

    /// Current effects scheme based on colorBrand and isDarkTheme
    public var effects: any DesignEffectsScheme {
        switch colorBrand {
        case .bild:
            return isDarkTheme ? BildEffectsDark.shared : BildEffectsLight.shared
        case .sportbild:
            return isDarkTheme ? SportbildEffectsDark.shared : SportbildEffectsLight.shared
        }
    }

    // MARK: - Sizing Access (based on contentBrand)

    /// Current sizing scheme based on contentBrand and sizeClass
    public var sizing: any DesignSizingScheme {
        switch contentBrand {
        case .bild:
            return sizeClass == .compact ? BildSizingCompact.shared : BildSizingRegular.shared
        case .sportbild:
            return sizeClass == .compact ? SportbildSizingCompact.shared : SportbildSizingRegular.shared
        case .advertorial:
            return sizeClass == .compact ? AdvertorialSizingCompact.shared : AdvertorialSizingRegular.shared
        }
    }
}

// MARK: - Environment Integration

private struct DesignSystemThemeKey: EnvironmentKey {
    static let defaultValue = DesignSystemTheme.shared
}

public extension EnvironmentValues {
    var designSystemTheme: DesignSystemTheme {
        get { self[DesignSystemThemeKey.self] }
        set { self[DesignSystemThemeKey.self] = newValue }
    }
}

// MARK: - View Modifier

public extension View {
    /// Apply design system theme with dual-axis brand selection
    /// - Parameters:
    ///   - colorBrand: Brand for colors and effects (BILD or SportBILD)
    ///   - contentBrand: Brand for sizing, typography, layout (BILD, SportBILD, or Advertorial)
    ///   - darkTheme: Enable dark mode
    ///   - sizeClass: Size class for responsive layouts
    ///   - density: UI density mode
    func designSystemTheme(
        colorBrand: ColorBrand = .bild,
        contentBrand: ContentBrand = .bild,
        darkTheme: Bool = false,
        sizeClass: SizeClass = .compact,
        density: Density = .default
    ) -> some View {
        let theme = DesignSystemTheme(
            colorBrand: colorBrand,
            contentBrand: contentBrand,
            isDarkTheme: darkTheme,
            sizeClass: sizeClass,
            density: density
        )
        return self.environment(\\.designSystemTheme, theme)
    }
}
`;
  fs.writeFileSync(path.join(sharedDir, 'DesignSystemTheme.swift'), designSystemThemeContent, 'utf8');
  console.log('     ✅ shared/DesignSystemTheme.swift');
  successful++;

  console.log(`  📊 Generated ${successful} shared SwiftUI files\n`);
  return { total: 5, successful };
}

/**
 * Generates SwiftUI Theme Provider for color brands only (BILD, SportBILD)
 * Content-only brands like Advertorial use the central DesignSystemTheme
 * Creates: dist/ios/brands/{brand}/theme/{Brand}Theme.swift
 */
async function generateSwiftUIThemeProviders() {
  if (!SWIFTUI_ENABLED) {
    return { totalThemes: 0, successfulThemes: 0 };
  }

  console.log('🎨 Generating SwiftUI Theme Providers (color brands only)...');

  let totalThemes = 0;
  let successfulThemes = 0;

  const iosDir = path.join(DIST_DIR, 'ios', 'brands');

  if (!fs.existsSync(iosDir)) {
    console.log('  ⚠️  No iOS output found, skipping theme generation');
    return { totalThemes: 0, successfulThemes: 0 };
  }

  const packageJson = require('../../package.json');
  const version = packageJson.version;

  // Only generate theme providers for color brands (those with their own color tokens)
  const COLOR_BRANDS = ['bild', 'sportbild'];

  for (const brand of COLOR_BRANDS) {
    totalThemes++;
    const brandDir = path.join(iosDir, brand);

    if (!fs.existsSync(brandDir)) {
      continue;
    }

    try {
      // Create theme directory
      const themeDir = path.join(brandDir, 'theme');
      if (!fs.existsSync(themeDir)) {
        fs.mkdirSync(themeDir, { recursive: true });
      }

      const brandPascal = brand.charAt(0).toUpperCase() + brand.slice(1);
      const brandLower = brand.toLowerCase();

      const themeContent = `//
// Do not edit directly, this file was auto-generated.
//
// BILD Design System Tokens v${version}
// Generated by Style Dictionary
//
// Copyright (c) 2024 Axel Springer Deutschland GmbH
//

import SwiftUI

/// Convenience theme provider for ${brandPascal} brand
/// For multi-brand apps, use DesignSystemTheme with colorBrand and contentBrand axes
@Observable
public final class ${brandPascal}Theme: @unchecked Sendable {

    // MARK: - Shared Instance
    public static let shared = ${brandPascal}Theme()

    // MARK: - Theme State
    public var isDarkTheme: Bool = false
    public var sizeClass: SizeClass = .compact
    public var density: Density = .default

    // MARK: - Token Access

    /// Current color scheme (Light/Dark)
    public var colors: any ${brandPascal}ColorScheme {
        isDarkTheme ? ${brandPascal}DarkColors.shared : ${brandPascal}LightColors.shared
    }

    /// Current sizing scheme (Compact/Regular)
    public var sizing: any ${brandPascal}SizingScheme {
        sizeClass == .compact ? ${brandPascal}SizingCompact.shared : ${brandPascal}SizingRegular.shared
    }

    /// Current effects scheme (Light/Dark)
    public var effects: any ${brandPascal}EffectsScheme {
        isDarkTheme ? ${brandPascal}EffectsDark.shared : ${brandPascal}EffectsLight.shared
    }

    private init() {}
}

// MARK: - Environment Integration

private struct ${brandPascal}ThemeKey: EnvironmentKey {
    static let defaultValue = ${brandPascal}Theme.shared
}

public extension EnvironmentValues {
    var ${brandLower}Theme: ${brandPascal}Theme {
        get { self[${brandPascal}ThemeKey.self] }
        set { self[${brandPascal}ThemeKey.self] = newValue }
    }
}

// MARK: - View Modifier

public extension View {
    /// Apply ${brandPascal} theme to view hierarchy
    func ${brandLower}Theme(
        darkTheme: Bool? = nil,
        sizeClass: SizeClass? = nil,
        density: Density? = nil
    ) -> some View {
        let theme = ${brandPascal}Theme.shared
        if let darkTheme { theme.isDarkTheme = darkTheme }
        if let sizeClass { theme.sizeClass = sizeClass }
        if let density { theme.density = density }
        return self.environment(\\.${brandLower}Theme, theme)
    }
}
`;

      const themeFile = path.join(themeDir, `${brandPascal}Theme.swift`);
      fs.writeFileSync(themeFile, themeContent, 'utf8');

      console.log(`     ✅ ${brand}/theme/${brandPascal}Theme.swift`);
      successfulThemes++;

    } catch (error) {
      console.error(`     ❌ ${brand}: ${error.message}`);
    }
  }

  console.log(`  📊 Generated: ${successfulThemes}/${totalThemes} theme providers\n`);
  return { totalThemes, successfulThemes };
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

  // Generate SwiftUI Shared Infrastructure
  stats.swiftuiShared = await generateSwiftUISharedFiles();

  // Build consolidated SwiftUI Primitives
  stats.swiftuiPrimitives = await buildConsolidatedSwiftUIPrimitives();

  // Aggregate SwiftUI component files
  stats.swiftuiAggregated = await aggregateSwiftUIComponents();

  // Generate SwiftUI Theme Providers
  stats.swiftuiThemes = await generateSwiftUIThemeProviders();

  // Cleanup individual SwiftUI primitive files
  stats.swiftuiCleanup = await cleanupSwiftUIIndividualPrimitives();

  // Cleanup individual SwiftUI component files
  stats.swiftuiComponentCleanup = await cleanupSwiftUIIndividualComponentFiles();

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
  if (SWIFTUI_ENABLED && stats.swiftuiShared) {
    console.log(`   - SwiftUI Shared Files: ${stats.swiftuiShared.successful}/${stats.swiftuiShared.total}`);
  }
  if (SWIFTUI_ENABLED && stats.swiftuiPrimitives) {
    console.log(`   - SwiftUI Primitives Consolidated: ${stats.swiftuiPrimitives.successful}/${stats.swiftuiPrimitives.total}`);
  }
  if (SWIFTUI_ENABLED && stats.swiftuiThemes) {
    console.log(`   - SwiftUI Themes: ${stats.swiftuiThemes.successfulThemes}/${stats.swiftuiThemes.totalThemes}`);
  }
  if (SWIFTUI_ENABLED && stats.swiftuiCleanup) {
    console.log(`   - SwiftUI Primitives Cleaned: ${stats.swiftuiCleanup.removed} individual files removed`);
  }
  if (SWIFTUI_ENABLED && stats.swiftuiAggregated) {
    console.log(`   - SwiftUI Components Aggregated: ${stats.swiftuiAggregated.successfulComponents}/${stats.swiftuiAggregated.totalComponents}`);
  }
  if (SWIFTUI_ENABLED && stats.swiftuiComponentCleanup) {
    console.log(`   - SwiftUI Components Cleaned: ${stats.swiftuiComponentCleanup.cleaned} individual files removed`);
  }
  console.log(`   - Builds erfolgreich: ${successfulBuilds}/${totalBuilds}`);
  console.log(`   - Output-Verzeichnis: dist/\n`);

  console.log(`📁 Struktur:`);
  console.log(`   dist/`);
  console.log(`   ├── css/        (CSS with data-attributes for theme switching)`);
  console.log(`   ├── scss/       (SCSS variables)`);
  console.log(`   ├── js/         (JavaScript ES6)`);
  console.log(`   ├── json/       (JSON)`);
  if (SWIFTUI_ENABLED) console.log(`   ├── ios/        (SwiftUI)`);
  if (COMPOSE_ENABLED) console.log(`   ${FLUTTER_ENABLED ? '├' : '└'}── android/    (Jetpack Compose - Kotlin)`);
  if (ANDROID_XML_ENABLED) console.log(`   ${FLUTTER_ENABLED ? '├' : '└'}── android/    (Android XML resources)`);
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
