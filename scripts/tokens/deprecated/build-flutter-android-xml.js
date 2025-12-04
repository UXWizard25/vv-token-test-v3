/**
 * DEPRECATED: Flutter and Android XML Build Configuration Blocks
 *
 * This file contains the deprecated build configuration blocks for Flutter (Dart)
 * and Android XML token generation that were removed from build.js on 2024-12-04.
 *
 * These configurations are preserved for reference and potential future reactivation.
 *
 * REASON FOR DEPRECATION:
 * - Flutter: Not needed for current project scope
 * - Android XML: Jetpack Compose is the preferred Android format
 *
 * TO REACTIVATE:
 * 1. Add these feature flags to build.js:
 *    const FLUTTER_ENABLED = true;
 *    const ANDROID_XML_ENABLED = true;
 *
 * 2. Copy the conditional blocks below back into the appropriate functions in build.js
 *
 * 3. Re-add the transforms and formats from deprecated/flutter-android-xml-formats.js
 *    to style-dictionary.config.js
 */

// =============================================================================
// FEATURE FLAGS (add to top of build.js)
// =============================================================================

// const FLUTTER_ENABLED = false;
// const ANDROID_XML_ENABLED = false;  // Disabled - Compose is the preferred Android format

// =============================================================================
// CONDITIONAL BLOCKS FOR createClassicConfig()
// Around line 228-320 in original build.js
// =============================================================================

/*
// Android XML: For breakpoint mode, use sizeclass folder and naming, skip non-native breakpoints
...((cssOptions.modeType === 'breakpoint' && !isNativeBreakpoint(cssOptions.mode)) || !ANDROID_XML_ENABLED ? {} : {
  android: {
    transformGroup: 'custom/android',
    buildPath: (() => {
      let androidPath = buildPath.replace(DIST_DIR + '/css/', '');
      if (cssOptions.modeType === 'breakpoint' && androidPath.includes('/breakpoints')) {
        androidPath = androidPath.replace('/breakpoints', '/sizeclass');
      }
      return `${DIST_DIR}/android/res/values/${androidPath}/`;
    })(),
    files: [{
      destination: (() => {
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
      if (cssOptions.modeType === 'breakpoint' && flutterPath.includes('/breakpoints')) {
        flutterPath = flutterPath.replace('/breakpoints', '/sizeclass');
      }
      return `${DIST_DIR}/flutter/${flutterPath}/`;
    })(),
    files: [{
      destination: (() => {
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
              // ... className logic
            }
          }
          // ... default className logic
        })()
      }
    }]
  }
}),
*/

// =============================================================================
// CONDITIONAL BLOCKS FOR createTypographyConfig()
// Around line 635-720 in original build.js
// =============================================================================

/*
// Flutter: Custom Typography format
...(FLUTTER_ENABLED && isNativeBreakpoint(breakpoint, 'ios') ? {
  flutter: {
    transforms: ['attribute/cti'],
    buildPath: `${DIST_DIR}/flutter/brands/${brand}/semantic/typography/`,
    files: [{
      destination: `typography_sizeclass_${getSizeClassName(breakpoint, 'ios')}.dart`,
      format: 'flutter/typography',
      options: {
        brand: brandName,
        breakpoint,
        sizeClass: getSizeClassName(breakpoint, 'ios')
      }
    }]
  }
} : {}),

// Android XML: Custom Typography format
...(isNativeBreakpoint(breakpoint, 'android') && ANDROID_XML_ENABLED ? {
  android: {
    transforms: ['attribute/cti'],
    buildPath: `${DIST_DIR}/android/brands/${brand}/semantic/typography/`,
    files: [{
      destination: `typography-sizeclass-${getSizeClassName(breakpoint, 'android')}.xml`,
      format: 'android/typography-styles',
      options: {
        brand: brandName,
        breakpoint,
        sizeClass: getSizeClassName(breakpoint, 'android')
      }
    }]
  }
} : {})
*/

// =============================================================================
// CONDITIONAL BLOCKS FOR createEffectConfig()
// Around line 777-837 in original build.js
// =============================================================================

/*
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

// Android XML: Custom Effects format
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
*/

// =============================================================================
// CONDITIONAL BLOCKS FOR createComponentTypographyConfig()
// Around line 1152-1183 in original build.js
// =============================================================================

/*
// Flutter: Component Typography
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

// Android XML: Component Typography
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
*/

// =============================================================================
// CONDITIONAL BLOCKS FOR createComponentEffectsConfig()
// Around line 1264-1310 in original build.js
// =============================================================================

/*
// Flutter: Component Effects
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

// Android XML: Component Effects
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
*/

// =============================================================================
// PATH CONFIG BLOCK
// Around line 2491-2510 in original build.js
// =============================================================================

/*
...(ANDROID_XML_ENABLED ? {
  android: {
    shared: 'android/res/values/shared/',
    brands: 'android/res/values/brands/{brand}/'
  }
} : {}),

...(FLUTTER_ENABLED ? {
  flutter: {
    shared: 'flutter/shared/',
    brands: 'flutter/brands/{brand}/'
  }
} : {}),
*/

// =============================================================================
// CONSOLE OUTPUT BLOCK
// Around line 8009-8011 in original build.js
// =============================================================================

/*
if (COMPOSE_ENABLED) console.log(`   ${FLUTTER_ENABLED ? '├' : '└'}── android/    (Jetpack Compose)`);
if (ANDROID_XML_ENABLED) console.log(`   ${FLUTTER_ENABLED ? '├' : '└'}── android/    (Android XML)`);
if (FLUTTER_ENABLED) console.log(`   └── flutter/    (Dart classes)`);
*/

module.exports = {
  description: 'Deprecated Flutter and Android XML build configuration blocks',
  deprecatedAt: '2024-12-04',
  reason: 'Flutter not needed; Jetpack Compose is preferred over Android XML'
};
