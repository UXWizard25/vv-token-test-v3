/**
 * DEPRECATED: Flutter and Android XML Token Formats
 *
 * This file contains the deprecated Flutter (Dart) and Android XML token formats
 * that were removed from the main pipeline on 2024-12-04.
 *
 * These formats are preserved for reference and potential future reactivation.
 *
 * REASON FOR DEPRECATION:
 * - Flutter: Not needed for current project scope
 * - Android XML: Jetpack Compose is the preferred Android format
 *
 * TO REACTIVATE:
 * 1. Copy the transforms, formats, and transform groups back to style-dictionary.config.js
 * 2. Add the registrations to the module.exports object
 * 3. Set FLUTTER_ENABLED = true and/or ANDROID_XML_ENABLED = true in build.js
 * 4. Re-add the conditional blocks in build.js (see deprecated/build-conditionals.js)
 *
 * ORIGINAL LOCATIONS:
 * - nameAndroidTransform: lines 492-499
 * - nameFlutterDartTransform: lines 505-512
 * - flutterDartClassFormat: lines 1011-1100
 * - androidResourcesFormat: lines 1368-1428
 * - toAndroidTypographyStyleName: lines 1435-1456
 * - androidXmlTypographyFormat: lines 1462-1534
 * - flutterEffectsFormat: lines 1688-1774
 * - mapFontWeight: lines 1848-1860
 * - flutterTypographyFormat: lines 1882-1955
 * - androidXmlEffectsFormat: lines 2112-2213
 * - Transform Groups: lines 2232-2233
 */

// =============================================================================
// HELPER FUNCTIONS (Flutter-specific)
// =============================================================================

/**
 * Helper: Map font weight number to Flutter FontWeight
 */
function mapFontWeight(weight) {
  if (!weight) return 'FontWeight.w400';
  const w = parseInt(weight);
  if (w >= 900) return 'FontWeight.w900';
  if (w >= 800) return 'FontWeight.w800';
  if (w >= 700) return 'FontWeight.w700';
  if (w >= 600) return 'FontWeight.w600';
  if (w >= 500) return 'FontWeight.w500';
  if (w >= 400) return 'FontWeight.w400';
  if (w >= 300) return 'FontWeight.w300';
  if (w >= 200) return 'FontWeight.w200';
  return 'FontWeight.w100';
}

// =============================================================================
// HELPER FUNCTIONS (Android XML-specific)
// =============================================================================

/**
 * Helper: Convert token name to Android TextAppearance style name
 * Transforms: "ateaser-ateaserkicker" → "ATeaser.Kicker"
 *             "buttonlabel" → "ButtonLabel"
 */
const toAndroidTypographyStyleName = (tokenName, brand) => {
  let cleanName = tokenName;
  const parts = cleanName.split('-').map(part => {
    return part
      .replace(/([a-z])([A-Z])/g, '$1.$2')
      .split('.')
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase())
      .join('');
  });
  const stylePart = parts.join('.');
  const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
  return `TextAppearance.${brandName}.${stylePart}`;
};

// =============================================================================
// TRANSFORMS
// =============================================================================

/**
 * Transform: Name für Android XML (snake_case)
 * Hyphens sind in Android Resource Namen nicht erlaubt!
 */
const nameAndroidTransform = {
  name: 'name/custom/android',
  type: 'name',
  transform: (token) => {
    const lastSegment = token.path[token.path.length - 1];
    // Note: requires nameTransformers.snake from main config
    return nameTransformers.snake(lastSegment);
  }
};

/**
 * Transform: Name für Flutter Dart (camelCase)
 */
const nameFlutterDartTransform = {
  name: 'name/custom/flutter-dart',
  type: 'name',
  transform: (token) => {
    const lastSegment = token.path[token.path.length - 1];
    // Note: requires nameTransformers.camel from main config
    return nameTransformers.camel(lastSegment);
  }
};

// =============================================================================
// TRANSFORM GROUPS
// =============================================================================

const deprecatedTransformGroups = {
  'custom/android': ['name/custom/android', 'color/hex', 'custom/size/px', 'custom/opacity', 'custom/fontWeight', 'custom/number', 'value/round'],
  'custom/flutter': ['name/custom/flutter-dart', 'color/hex', 'custom/size/px', 'custom/opacity', 'custom/fontWeight', 'custom/number', 'value/round'],
};

// =============================================================================
// FORMAT: Flutter Dart Class
// =============================================================================

const flutterDartClassFormat = ({ dictionary, options, file }) => {
  // Note: requires generateUniqueNames, generateFileHeader, getContextString,
  // groupTokensHierarchically from main config
  const className = options.className || file.className || 'StyleDictionary';
  const context = getContextString(options);
  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'camel');

  let output = generateFileHeader({
    fileName: file.destination,
    commentStyle: 'line',
    brand: options.brand,
    context: context
  });

  output += `import 'dart:ui';\n\nclass ${className} {\n    ${className}._();\n\n`;

  const hierarchicalGroups = groupTokensHierarchically(dictionary.allTokens);

  let isFirstTopLevel = true;
  Object.keys(hierarchicalGroups).forEach(topLevel => {
    const subGroups = hierarchicalGroups[topLevel];

    if (!isFirstTopLevel) {
      output += `\n`;
    }
    output += `    // ============================================\n`;
    output += `    // ${topLevel.toUpperCase()}\n`;
    output += `    // ============================================\n\n`;
    isFirstTopLevel = false;

    Object.keys(subGroups).forEach(subLevel => {
      const tokens = subGroups[subLevel];

      if (subLevel) {
        output += `    // ${topLevel} - ${subLevel}\n`;
      }

      tokens.forEach(token => {
        const uniqueName = uniqueNames.get(token.path.join('.'));
        const comment = token.comment || token.description;
        if (comment) {
          output += `    /** ${comment} */\n`;
        }

        let valueOutput;
        const value = token.$value !== undefined ? token.$value : token.value;
        const type = token.$type || token.type;

        if (type === 'color') {
          if (value.startsWith('#')) {
            const hex = value.replace('#', '');
            let argb;
            if (hex.length === 6) {
              argb = 'FF' + hex;
            } else if (hex.length === 8) {
              argb = hex.substring(6, 8) + hex.substring(0, 6);
            } else {
              argb = 'FF000000';
            }
            valueOutput = `Color(0x${argb})`;
          } else if (value.startsWith('rgb')) {
            const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (match) {
              const r = parseInt(match[1]).toString(16).padStart(2, '0');
              const g = parseInt(match[2]).toString(16).padStart(2, '0');
              const b = parseInt(match[3]).toString(16).padStart(2, '0');
              const a = match[4] ? Math.round(parseFloat(match[4]) * 255).toString(16).padStart(2, '0') : 'FF';
              valueOutput = `Color(0x${a}${r}${g}${b})`;
            } else {
              valueOutput = `"${value}"`;
            }
          } else {
            valueOutput = `"${value}"`;
          }
        } else if (typeof value === 'number') {
          valueOutput = value;
        } else if (typeof value === 'string') {
          valueOutput = `"${value}"`;
        } else {
          valueOutput = value;
        }

        output += `    static const ${uniqueName} = ${valueOutput};\n`;
      });

      output += `\n`;
    });
  });

  output += `}\n`;
  return output;
};

// =============================================================================
// FORMAT: Android XML Resources
// =============================================================================

const androidResourcesFormat = ({ dictionary, options, file }) => {
  const context = getContextString(options);
  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'snake');

  let output = `<?xml version="1.0" encoding="UTF-8"?>\n\n`;
  output += generateFileHeader({
    fileName: file.destination,
    commentStyle: 'xml',
    brand: options.brand,
    context: context
  });
  output += `<resources>\n`;

  const hierarchicalGroups = groupTokensHierarchically(dictionary.allTokens);

  let isFirstTopLevel = true;
  Object.keys(hierarchicalGroups).forEach(topLevel => {
    const subGroups = hierarchicalGroups[topLevel];

    if (!isFirstTopLevel) {
      output += `\n`;
    }
    output += `  <!-- ============================================\n`;
    output += `       ${topLevel.toUpperCase()}\n`;
    output += `       ============================================ -->\n\n`;
    isFirstTopLevel = false;

    Object.keys(subGroups).forEach(subLevel => {
      const tokens = subGroups[subLevel];

      if (subLevel) {
        output += `  <!-- ${topLevel} - ${subLevel} -->\n`;
      }

      tokens.forEach(token => {
        const uniqueName = uniqueNames.get(token.path.join('.'));
        const value = token.$value !== undefined ? token.$value : token.value;
        const type = token.$type || token.type;
        const comment = token.comment || token.description;

        let resourceType = 'string';
        if (type === 'color') {
          resourceType = 'color';
        } else if (type === 'dimension' || type === 'number') {
          resourceType = 'dimen';
        }

        output += `  <${resourceType} name="${uniqueName}">${value}</${resourceType}>`;
        if (comment) {
          output += `<!-- ${comment} -->`;
        }
        output += `\n`;
      });

      output += `\n`;
    });
  });

  output += `</resources>\n`;
  return output;
};

// =============================================================================
// FORMAT: Android XML Typography Styles
// =============================================================================

const androidXmlTypographyFormat = ({ dictionary, options }) => {
  const { brand, breakpoint } = options;

  let output = `<?xml version="1.0" encoding="utf-8"?>\n`;
  output += generateFileHeader({
    fileName: `typography_styles.xml`,
    commentStyle: 'xml',
    brand: brand,
    context: `Breakpoint: ${breakpoint}`
  });
  output += `<resources>\n`;

  const hierarchicalGroups = groupTokensHierarchically(dictionary.allTokens);

  let isFirstTopLevel = true;
  Object.keys(hierarchicalGroups).forEach(topLevel => {
    const subGroups = hierarchicalGroups[topLevel];

    if (!isFirstTopLevel) {
      output += `\n`;
    }
    output += `    <!-- ============================================\n`;
    output += `         ${topLevel.toUpperCase()}\n`;
    output += `         ============================================ -->\n\n`;
    isFirstTopLevel = false;

    Object.keys(subGroups).forEach(subLevel => {
      const tokens = subGroups[subLevel];

      if (subLevel) {
        output += `    <!-- ${topLevel} - ${subLevel} -->\n`;
      }

      tokens.forEach(token => {
        if (token.$type === 'typography' && token.$value) {
          const style = token.$value;
          const rawName = token.path[token.path.length - 1];
          const styleName = toAndroidTypographyStyleName(rawName, brand);

          output += `    <style name="${styleName}">\n`;
          if (style.fontFamily) output += `        <item name="android:fontFamily">${style.fontFamily}</item>\n`;
          if (style.fontSize) {
            const size = parseFloat(style.fontSize);
            output += `        <item name="android:textSize">${size}sp</item>\n`;
          }
          if (style.fontWeight && style.fontWeight >= 700) {
            output += `        <item name="android:textStyle">bold</item>\n`;
          }
          if (style.lineHeight) {
            const lineHeight = parseFloat(style.lineHeight);
            output += `        <item name="android:lineHeight">${lineHeight}sp</item>\n`;
          }
          if (style.letterSpacing) {
            const letterSpacing = parseFloat(style.letterSpacing);
            output += `        <item name="android:letterSpacing">${letterSpacing / 16}</item>\n`;
          }
          if (style.textCase === 'UPPER') {
            output += `        <item name="android:textAllCaps">true</item>\n`;
          }
          output += `    </style>\n`;
        }
      });
    });
  });

  output += `</resources>\n`;
  return output;
};

// =============================================================================
// FORMAT: Flutter Effects
// =============================================================================

const flutterEffectsFormat = ({ dictionary, options }) => {
  const { brand, colorMode } = options;
  const className = `Effects${brand.charAt(0).toUpperCase() + brand.slice(1)}${colorMode.charAt(0).toUpperCase() + colorMode.slice(1)}`;
  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'camel');

  let output = generateFileHeader({
    fileName: `effects-${colorMode}.dart`,
    commentStyle: 'line',
    brand: brand,
    context: `Mode: ${colorMode}`
  });

  output += `import 'dart:ui';\n\n`;
  output += `class ${className} {\n`;
  output += `    ${className}._();\n\n`;

  const hierarchicalGroups = groupTokensHierarchically(dictionary.allTokens);

  Object.keys(hierarchicalGroups).forEach(topLevel => {
    const subGroups = hierarchicalGroups[topLevel];

    output += `    // ============================================\n`;
    output += `    // ${topLevel.toUpperCase()}\n`;
    output += `    // ============================================\n\n`;

    Object.keys(subGroups).forEach(subLevel => {
      const tokens = subGroups[subLevel];

      if (subLevel) {
        output += `    // ${topLevel} - ${subLevel}\n`;
      }

      tokens.forEach(token => {
        if (token.$type === 'shadow' && Array.isArray(token.$value)) {
          const uniqueName = uniqueNames.get(token.path.join('.'));

          if (token.comment) {
            output += `    /** ${token.comment} */\n`;
          }

          const shadowsDart = token.$value.map(effect => {
            if (effect.type === 'dropShadow') {
              let colorValue = 'Color(0xFF000000)';
              if (effect.color) {
                const colorStr = effect.color.replace(/\s/g, '');
                if (colorStr.startsWith('rgba')) {
                  const match = colorStr.match(/rgba?\((\d+),(\d+),(\d+),?([\d.]*)\)/);
                  if (match) {
                    const r = parseInt(match[1]).toString(16).padStart(2, '0');
                    const g = parseInt(match[2]).toString(16).padStart(2, '0');
                    const b = parseInt(match[3]).toString(16).padStart(2, '0');
                    const a = match[4] ? Math.round(parseFloat(match[4]) * 255).toString(16).padStart(2, '0') : 'FF';
                    colorValue = `Color(0x${a}${r}${g}${b})`;
                  }
                } else if (colorStr.startsWith('#')) {
                  const hex = colorStr.replace('#', '');
                  if (hex.length === 6) {
                    colorValue = `Color(0xFF${hex})`;
                  } else if (hex.length === 8) {
                    colorValue = `Color(0x${hex.substring(6, 8)}${hex.substring(0, 6)})`;
                  }
                }
              }

              return `BoxShadow(
      offset: Offset(${effect.offsetX || 0}, ${effect.offsetY || 0}),
      blurRadius: ${effect.radius || 0},
      spreadRadius: ${effect.spread || 0},
      color: ${colorValue}
    )`;
            }
            return null;
          }).filter(Boolean);

          output += `    static const ${uniqueName} = [\n      ${shadowsDart.join(',\n      ')}\n    ];\n`;
        }
      });

      output += `\n`;
    });
  });

  output += `}\n`;
  return output;
};

// =============================================================================
// FORMAT: Flutter Typography
// =============================================================================

const flutterTypographyFormat = ({ dictionary, options }) => {
  const { brand, breakpoint, sizeClass } = options;
  const className = `Typography${brand.charAt(0).toUpperCase() + brand.slice(1)}${(sizeClass || breakpoint).charAt(0).toUpperCase() + (sizeClass || breakpoint).slice(1)}`;
  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'camel');

  let output = generateFileHeader({
    fileName: `typography-${sizeClass || breakpoint}.dart`,
    commentStyle: 'line',
    brand: brand,
    context: `SizeClass: ${sizeClass || breakpoint}`
  });

  output += `import 'package:flutter/material.dart';\n\n`;
  output += `/// Typography tokens for ${brand} at ${sizeClass || breakpoint} size class\n`;
  output += `/// Usage: Text('Hello', style: ${className}.display1)\n`;
  output += `class ${className} {\n`;
  output += `    ${className}._();\n\n`;

  const hierarchicalGroups = groupTokensHierarchically(dictionary.allTokens);

  Object.keys(hierarchicalGroups).forEach(topLevel => {
    const subGroups = hierarchicalGroups[topLevel];

    output += `    // ============================================\n`;
    output += `    // ${topLevel.toUpperCase()}\n`;
    output += `    // ============================================\n\n`;

    Object.keys(subGroups).forEach(subLevel => {
      const tokens = subGroups[subLevel];

      if (subLevel) {
        output += `    // ${topLevel} - ${subLevel}\n`;
      }

      tokens.forEach(token => {
        if (token.$type === 'typography' && token.$value) {
          const uniqueName = uniqueNames.get(token.path.join('.'));
          const style = token.$value;

          if (token.comment) {
            output += `    /// ${token.comment}\n`;
          }

          const fontSize = typeof style.fontSize === 'number' ? style.fontSize : parseFloat(style.fontSize) || 16;
          const lineHeight = typeof style.lineHeight === 'number' ? style.lineHeight : parseFloat(style.lineHeight);
          const letterSpacing = typeof style.letterSpacing === 'number' ? style.letterSpacing : parseFloat(style.letterSpacing);
          const heightRatio = lineHeight && fontSize ? (lineHeight / fontSize).toFixed(2) : null;

          output += `    static const TextStyle ${uniqueName} = TextStyle(\n`;
          if (style.fontFamily) output += `      fontFamily: '${style.fontFamily}',\n`;
          output += `      fontSize: ${fontSize},\n`;
          if (style.fontWeight) output += `      fontWeight: ${mapFontWeight(style.fontWeight)},\n`;
          if (heightRatio && heightRatio !== '1.00') output += `      height: ${heightRatio},\n`;
          if (letterSpacing) output += `      letterSpacing: ${letterSpacing},\n`;
          if (style.fontStyle && style.fontStyle !== 'null' && style.fontStyle.toLowerCase() === 'italic') {
            output += `      fontStyle: FontStyle.italic,\n`;
          }
          if (style.textDecoration && style.textDecoration !== 'NONE') {
            const decoration = style.textDecoration.toLowerCase();
            if (decoration === 'underline') output += `      decoration: TextDecoration.underline,\n`;
            else if (decoration === 'line-through' || decoration === 'strikethrough') output += `      decoration: TextDecoration.lineThrough,\n`;
          }
          output += `    );\n\n`;
        }
      });
    });
  });

  output += `}\n`;
  return output;
};

// =============================================================================
// FORMAT: Android XML Effects
// =============================================================================

/**
 * Helper: Calculate Material Design elevation from shadow values
 */
function calculateElevationFromShadow(shadows) {
  if (!Array.isArray(shadows) || shadows.length === 0) return 0;
  const maxBlur = Math.max(...shadows.map(s => s.radius || 0));
  return Math.round(maxBlur / 2);
}

const androidXmlEffectsFormat = ({ dictionary, options }) => {
  const { brand, colorMode } = options;
  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'snake');

  let output = `<?xml version="1.0" encoding="utf-8"?>\n`;

  const header = generateFileHeader({
    fileName: `effects-${colorMode}.xml`,
    commentStyle: 'xml',
    brand: brand,
    context: `Mode: ${colorMode}`
  });

  output += header.replace('-->\n', `\n  NOTE: This file provides both Material Design elevation values and raw shadow data.\n  - Use elevation dimens with CardView, MaterialCardView, or android:elevation\n  - Use string-arrays for custom shadow implementations if needed\n-->\n`);

  output += `<resources>\n`;

  const hierarchicalGroups = groupTokensHierarchically(dictionary.allTokens);

  // First pass: Output elevation dimens
  output += `\n  <!-- ============================================ -->\n`;
  output += `  <!-- MATERIAL DESIGN ELEVATION VALUES -->\n`;
  output += `  <!-- Use with android:elevation or CardView.cardElevation -->\n`;
  output += `  <!-- ============================================ -->\n\n`;

  Object.keys(hierarchicalGroups).forEach(topLevel => {
    const subGroups = hierarchicalGroups[topLevel];

    Object.keys(subGroups).forEach(subLevel => {
      const tokens = subGroups[subLevel];

      tokens.forEach(token => {
        if (token.$type === 'shadow' && Array.isArray(token.$value)) {
          const uniqueName = uniqueNames.get(token.path.join('.'));
          const elevation = calculateElevationFromShadow(token.$value);

          output += `  <dimen name="${uniqueName}_elevation">${elevation}dp</dimen>\n`;
        }
      });
    });
  });

  // Second pass: Output raw shadow data as string-arrays
  Object.keys(hierarchicalGroups).forEach(topLevel => {
    const subGroups = hierarchicalGroups[topLevel];

    output += `\n  <!-- ============================================ -->\n`;
    output += `  <!-- ${topLevel.toUpperCase()} - RAW SHADOW DATA -->\n`;
    output += `  <!-- For custom shadow implementations -->\n`;
    output += `  <!-- ============================================ -->\n\n`;

    Object.keys(subGroups).forEach(subLevel => {
      const tokens = subGroups[subLevel];

      if (subLevel) {
        output += `  <!-- ${topLevel} - ${subLevel} -->\n`;
      }

      tokens.forEach(token => {
        if (token.$type === 'shadow' && Array.isArray(token.$value)) {
          const uniqueName = uniqueNames.get(token.path.join('.'));

          if (token.comment) {
            output += `  <!-- ${token.comment} -->\n`;
          }

          output += `  <string-array name="${uniqueName}_data">\n`;
          token.$value.forEach((effect, idx) => {
            if (effect.type === 'dropShadow') {
              let colorValue = '#FF000000';
              if (effect.color) {
                const colorStr = effect.color.replace(/\s/g, '');
                if (colorStr.startsWith('rgba')) {
                  const match = colorStr.match(/rgba?\((\d+),(\d+),(\d+),?([\d.]*)\)/);
                  if (match) {
                    const r = parseInt(match[1]).toString(16).padStart(2, '0');
                    const g = parseInt(match[2]).toString(16).padStart(2, '0');
                    const b = parseInt(match[3]).toString(16).padStart(2, '0');
                    const a = match[4] ? Math.round(parseFloat(match[4]) * 255).toString(16).padStart(2, '0') : 'FF';
                    colorValue = `#${a}${r}${g}${b}`;
                  }
                } else if (colorStr.startsWith('#')) {
                  colorValue = colorStr;
                }
              }

              output += `    <item>offsetX:${effect.offsetX || 0}|offsetY:${effect.offsetY || 0}|radius:${effect.radius || 0}|spread:${effect.spread || 0}|color:${colorValue}</item>\n`;
            }
          });
          output += `  </string-array>\n\n`;
        }
      });
    });
  });

  output += `</resources>\n`;
  return output;
};

// =============================================================================
// EXPORTS (for reference - these need to be added to main config to reactivate)
// =============================================================================

module.exports = {
  // Transforms
  transforms: {
    'name/custom/android': nameAndroidTransform,
    'name/custom/flutter-dart': nameFlutterDartTransform,
  },

  // Transform Groups
  transformGroups: deprecatedTransformGroups,

  // Formats
  formats: {
    'flutter/class': flutterDartClassFormat,
    'android/resources': androidResourcesFormat,
    'flutter/effects': flutterEffectsFormat,
    'flutter/typography': flutterTypographyFormat,
    'android/effects': androidXmlEffectsFormat,
    'android/typography-styles': androidXmlTypographyFormat,
  },

  // Helpers (for potential reuse)
  helpers: {
    mapFontWeight,
    toAndroidTypographyStyleName,
    calculateElevationFromShadow,
  }
};
