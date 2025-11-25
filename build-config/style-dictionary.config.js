/**
 * Style Dictionary Konfiguration für BILD Design System (v4)
 *
 * Diese Datei exportiert Custom Transforms und Formats
 * für Style Dictionary v4
 */

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Groups tokens hierarchically by path segments
 * Returns a structure: { topLevel: { subLevel: [tokens] } }
 */
function groupTokensHierarchically(tokens) {
  const grouped = {};

  tokens.forEach(token => {
    const pathSegments = token.path.slice(0, -1); // All segments except last (token name)

    if (pathSegments.length === 0) {
      if (!grouped['Other']) grouped['Other'] = {};
      if (!grouped['Other']['']) grouped['Other'][''] = [];
      grouped['Other'][''].push(token);
      return;
    }

    const topLevel = pathSegments[0]; // First segment (e.g., "Semantic", "Component")
    const subLevel = pathSegments.slice(1).join(' - '); // Remaining segments (e.g., "Text", "Button - Primary")

    if (!grouped[topLevel]) {
      grouped[topLevel] = {};
    }

    if (!grouped[topLevel][subLevel]) {
      grouped[topLevel][subLevel] = [];
    }

    grouped[topLevel][subLevel].push(token);
  });

  return grouped;
}

/**
 * Name transformation functions for different platforms
 */
const nameTransformers = {
  // Kebab-case für CSS, SCSS, Android
  kebab: (str) => {
    return str
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  },

  // camelCase für JavaScript, Flutter
  camel: (str) => {
    const kebab = nameTransformers.kebab(str);
    let camelCase = kebab.replace(/-([a-z0-9])/g, (_, letter) => letter.toUpperCase());

    // Prefix with underscore if starts with a number (invalid JS identifier)
    if (/^[0-9]/.test(camelCase)) {
      camelCase = '_' + camelCase;
    }

    return camelCase;
  },

  // PascalCase für iOS Swift
  pascal: (str) => {
    const camel = nameTransformers.camel(str);
    if (camel.length === 0) return camel;

    // If starts with underscore followed by number, keep underscore
    if (camel.startsWith('_')) {
      return '_' + camel.charAt(1).toUpperCase() + camel.slice(2);
    }

    return camel.charAt(0).toUpperCase() + camel.slice(1);
  }
};

/**
 * Generates unique token names by using the minimum number of path segments needed
 * to avoid collisions. Starts with the last segment, adds previous segments as needed.
 *
 * @param {Array} tokens - Array of tokens to process
 * @param {String} transformType - Type of transformation: 'kebab', 'camel', or 'pascal'
 * @returns {Map} - Map of token path string to unique name
 */
function generateUniqueNames(tokens, transformType = 'kebab') {
  const transformFn = nameTransformers[transformType];
  const nameMap = new Map();
  const collisionGroups = new Map();

  // First pass: Group tokens by their base name (last segment only)
  tokens.forEach(token => {
    const lastSegment = token.path[token.path.length - 1];
    const baseName = transformFn(lastSegment);
    const pathKey = token.path.join('.');

    if (!collisionGroups.has(baseName)) {
      collisionGroups.set(baseName, []);
    }
    collisionGroups.get(baseName).push({ token, pathKey });
  });

  // Second pass: Generate unique names, resolving collisions
  collisionGroups.forEach((tokenGroup, baseName) => {
    if (tokenGroup.length === 1) {
      // No collision - use simple name
      nameMap.set(tokenGroup[0].pathKey, baseName);
    } else {
      // Collision detected - resolve by adding more path segments
      tokenGroup.forEach(({ token, pathKey }) => {
        let uniqueName = baseName;
        let segmentCount = 1;

        // Incrementally add more segments until name is unique within this collision group
        while (segmentCount < token.path.length) {
          segmentCount++;
          const segments = token.path.slice(-segmentCount);
          const candidateName = transformFn(segments.join('-'));

          // Check if candidate is unique within this collision group
          const hasCollision = tokenGroup.some(other => {
            if (other.pathKey === pathKey) return false; // Don't compare with self
            const otherSegments = other.token.path.slice(-segmentCount);
            return transformFn(otherSegments.join('-')) === candidateName;
          });

          if (!hasCollision) {
            uniqueName = candidateName;
            break;
          }
        }

        // Fallback: use full path if still not unique (edge case)
        if (segmentCount >= token.path.length && tokenGroup.length > 1) {
          uniqueName = transformFn(token.path.join('-'));
        }

        nameMap.set(pathKey, uniqueName);
      });
    }
  });

  return nameMap;
}

// ============================================================================
// CUSTOM TRANSFORMS
// ============================================================================

/**
 * Transform: Color zu CSS hex/rgba
 */
const colorCssTransform = {
  name: 'color/css',
  type: 'value',
  filter: (token) => token.$type === 'color' || token.type === 'color',
  transform: (token) => {
    // Wenn bereits ein gültiger Farbwert, direkt zurückgeben
    if (typeof token.$value === 'string' || typeof token.value === 'string') {
      return token.$value || token.value;
    }
    return token.$value || token.value;
  }
};

/**
 * Transform: Color zu iOS UIColor
 */
const colorUIColorTransform = {
  name: 'custom/color/UIColor',
  type: 'value',
  transitive: true,
  filter: (token) => token.$type === 'color' || token.type === 'color',
  transform: (token) => {
    const value = token.$value || token.value;

    // Hex zu UIColor
    if (value.startsWith('#')) {
      const hex = value.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;
      const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;

      return `UIColor(red: ${r.toFixed(3)}, green: ${g.toFixed(3)}, blue: ${b.toFixed(3)}, alpha: ${a.toFixed(3)})`;
    }

    // RGBA zu UIColor
    if (value.startsWith('rgb')) {
      const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
      if (match) {
        const r = parseInt(match[1]) / 255;
        const g = parseInt(match[2]) / 255;
        const b = parseInt(match[3]) / 255;
        const a = match[4] ? parseFloat(match[4]) : 1;

        return `UIColor(red: ${r.toFixed(3)}, green: ${g.toFixed(3)}, blue: ${b.toFixed(3)}, alpha: ${a.toFixed(3)})`;
      }
    }

    return value;
  }
};

/**
 * Transform: Dimension zu px
 */
const sizePxTransform = {
  name: 'custom/size/px',  // Renamed to avoid conflicts with built-in transforms
  type: 'value',
  filter: (token) => {
    const type = token.$type || token.type;
    const value = token.$value || token.value;

    // Only match if type is dimension-related AND value is numeric
    const isMatchingType = ['spacing', 'size', 'fontSize', 'dimension'].includes(type);
    const isNumeric = typeof value === 'number';

    return isMatchingType && isNumeric;
  },
  transform: (token) => {
    const value = token.$value || token.value;

    // Safety check: only transform if value is actually a number
    if (typeof value === 'number') {
      return `${value}px`;
    }

    // If not a number, return unchanged (shouldn't happen due to filter, but safety first)
    return value;
  }
};

/**
 * Transform: Spacing/Sizing zu rem
 */
const sizeRemTransform = {
  name: 'size/rem',
  type: 'value',
  filter: (token) => {
    const type = token.$type || token.type;
    return ['spacing', 'size', 'fontSize', 'dimension'].includes(type);
  },
  transform: (token) => {
    const value = token.$value || token.value;
    if (typeof value === 'number') {
      // Konvertiere px zu rem (angenommen 16px = 1rem)
      return `${value / 16}rem`;
    }
    return value;
  }
};

/**
 * Transform: Name zu CSS Custom Property (Kebab-Case)
 * Verwendet nur das letzte Pfad-Segment für den Token-Namen
 */
const nameKebabTransform = {
  name: 'name/custom/kebab',
  type: 'name',
  transform: (token) => {
    const lastSegment = token.path[token.path.length - 1];
    return nameTransformers.kebab(lastSegment);
  }
};

/**
 * Transform: Name zu gültigem JavaScript Identifier (Camel-Case)
 * Verwendet nur das letzte Pfad-Segment für den Token-Namen
 */
const nameJsTransform = {
  name: 'name/custom/js',
  type: 'name',
  transform: (token) => {
    const lastSegment = token.path[token.path.length - 1];
    return nameTransformers.camel(lastSegment);
  }
};

/**
 * Transform: Name für iOS Swift (PascalCase, behält Unterstriche in Dezimalzahlen)
 * Verwendet nur das letzte Pfad-Segment für den Token-Namen
 */
const nameIosSwiftTransform = {
  name: 'name/custom/ios-swift',
  type: 'name',
  transform: (token) => {
    const lastSegment = token.path[token.path.length - 1];
    return nameTransformers.pascal(lastSegment);
  }
};

/**
 * Transform: Name für Flutter Dart (camelCase, behält Unterstriche in Dezimalzahlen)
 * Verwendet nur das letzte Pfad-Segment für den Token-Namen
 */
const nameFlutterDartTransform = {
  name: 'name/custom/flutter-dart',
  type: 'name',
  transform: (token) => {
    const lastSegment = token.path[token.path.length - 1];
    return nameTransformers.camel(lastSegment);
  }
};

// ============================================================================
// CUSTOM FORMATS
// ============================================================================

/**
 * Format: CSS Custom Properties mit Kategorisierung und Gruppierung
 */
const cssVariablesFormat = ({ dictionary, options, file }) => {
  const selector = options.selector || ':root';
  const { mode, layer, brand } = options;

  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'kebab');

  let output = `/**\n * ${file.destination}\n * Generiert am: ${new Date().toISOString()}\n`;
  if (layer) output += ` * Layer: ${layer}\n`;
  if (mode) output += ` * Mode: ${mode}\n`;
  if (brand) output += ` * Brand: ${brand}\n`;
  output += ` * Nicht manuell bearbeiten!\n */\n\n`;

  const hierarchicalGroups = groupTokensHierarchically(dictionary.allTokens);

  output += `${selector} {\n`;

  let isFirstTopLevel = true;
  Object.keys(hierarchicalGroups).forEach(topLevel => {
    const subGroups = hierarchicalGroups[topLevel];

    // Add top-level header
    if (!isFirstTopLevel) {
      output += `\n`;
    }
    output += `  /* ============================================\n`;
    output += `     ${topLevel.toUpperCase()}\n`;
    output += `     ============================================ */\n\n`;
    isFirstTopLevel = false;

    // Sort sub-level keys
    Object.keys(subGroups).forEach(subLevel => {
      const tokens = subGroups[subLevel];

      // Add sub-level header if exists
      if (subLevel) {
        output += `  /* ${topLevel} - ${subLevel} */\n`;
      }

      // Add tokens
      tokens.forEach(token => {
        const uniqueName = uniqueNames.get(token.path.join('.'));
        const comment = token.comment || token.description;
        if (comment) {
          output += `  /**\n   * ${comment}\n   */\n`;
        }
        output += `  --${uniqueName}: ${token.value};\n`;
      });

      output += `\n`;
    });
  });

  output += `}\n`;
  return output;
};

/**
 * Format: SCSS Variables mit Gruppierung
 */
const scssVariablesFormat = ({ dictionary, options, file }) => {
  const { mode, layer, brand } = options;
  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'kebab');

  let output = `//\n// ${file.destination}\n// Generiert am: ${new Date().toISOString()}\n`;
  if (layer) output += `// Layer: ${layer}\n`;
  if (mode) output += `// Mode: ${mode}\n`;
  if (brand) output += `// Brand: ${brand}\n`;
  output += `// Nicht manuell bearbeiten!\n//\n\n`;

  const hierarchicalGroups = groupTokensHierarchically(dictionary.allTokens);

  let isFirstTopLevel = true;
  Object.keys(hierarchicalGroups).forEach(topLevel => {
    const subGroups = hierarchicalGroups[topLevel];

    if (!isFirstTopLevel) {
      output += `\n`;
    }
    output += `// ============================================\n`;
    output += `// ${topLevel.toUpperCase()}\n`;
    output += `// ============================================\n\n`;
    isFirstTopLevel = false;

    Object.keys(subGroups).forEach(subLevel => {
      const tokens = subGroups[subLevel];

      if (subLevel) {
        output += `// ${topLevel} - ${subLevel}\n`;
      }

      tokens.forEach(token => {
        const uniqueName = uniqueNames.get(token.path.join('.'));
        const comment = token.comment || token.description;
        if (comment) {
          output += `// ${comment}\n`;
        }
        output += `$${uniqueName}: ${token.value};\n`;
      });

      output += `\n`;
    });
  });

  return output;
};

/**
 * Format: JavaScript/TypeScript ES6 Module mit Gruppierung
 */
const javascriptEs6Format = ({ dictionary, options, file }) => {
  const { mode, layer, brand } = options;
  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'camel');

  let output = `/**\n * ${file.destination}\n * Generiert am: ${new Date().toISOString()}\n`;
  if (layer) output += ` * Layer: ${layer}\n`;
  if (mode) output += ` * Mode: ${mode}\n`;
  if (brand) output += ` * Brand: ${brand}\n`;
  output += ` * Nicht manuell bearbeiten!\n */\n\n`;

  const hierarchicalGroups = groupTokensHierarchically(dictionary.allTokens);

  let isFirstTopLevel = true;
  Object.keys(hierarchicalGroups).forEach(topLevel => {
    const subGroups = hierarchicalGroups[topLevel];

    if (!isFirstTopLevel) {
      output += `\n`;
    }
    output += `// ============================================\n`;
    output += `// ${topLevel.toUpperCase()}\n`;
    output += `// ============================================\n\n`;
    isFirstTopLevel = false;

    Object.keys(subGroups).forEach(subLevel => {
      const tokens = subGroups[subLevel];

      if (subLevel) {
        output += `// ${topLevel} - ${subLevel}\n`;
      }

      tokens.forEach(token => {
        const uniqueName = uniqueNames.get(token.path.join('.'));
        const comment = token.comment || token.description;
        if (comment) {
          output += `/** ${comment} */\n`;
        }
        output += `export const ${uniqueName} = "${token.value}";\n`;
      });

      output += `\n`;
    });
  });

  return output;
};

/**
 * Format: JSON strukturiert
 */
const jsonNestedFormat = ({ dictionary }) => {
  return JSON.stringify(dictionary.tokens, null, 2);
};

/**
 * Format: iOS Swift Class mit korrekter className Handhabung und Gruppierung
 */
const iosSwiftClassFormat = ({ dictionary, options, file }) => {
  const className = options.className || file.className || 'StyleDictionary';
  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'pascal');

  let output = `\n//\n// ${file.destination}\n//\n\n`;
  output += `// Do not edit directly, this file was auto-generated.\n\n\n`;
  output += `import UIKit\n\npublic class ${className} {\n`;

  const hierarchicalGroups = groupTokensHierarchically(dictionary.allTokens);

  let isFirstTopLevel = true;
  Object.keys(hierarchicalGroups).forEach(topLevel => {
    const subGroups = hierarchicalGroups[topLevel];

    if (!isFirstTopLevel) {
      output += `\n`;
    }
    output += `    // MARK: - ============================================\n`;
    output += `    // MARK: - ${topLevel.toUpperCase()}\n`;
    output += `    // MARK: - ============================================\n\n`;
    isFirstTopLevel = false;

    Object.keys(subGroups).forEach(subLevel => {
      const tokens = subGroups[subLevel];

      if (subLevel) {
        output += `    // MARK: - ${topLevel} - ${subLevel}\n`;
      }

      tokens.forEach(token => {
        const uniqueName = uniqueNames.get(token.path.join('.'));
        const comment = token.comment || token.description;
        if (comment) {
          output += `    /** ${comment} */\n`;
        }

        let valueOutput;
        const value = token.value;
        const type = token.$type || token.type;

        if (type === 'color') {
          if (value.startsWith('#')) {
            const hex = value.replace('#', '');
            const r = (parseInt(hex.substring(0, 2), 16) / 255).toFixed(3);
            const g = (parseInt(hex.substring(2, 4), 16) / 255).toFixed(3);
            const b = (parseInt(hex.substring(4, 6), 16) / 255).toFixed(3);
            const a = hex.length === 8 ? (parseInt(hex.substring(6, 8), 16) / 255).toFixed(3) : '1.000';
            valueOutput = `UIColor(red: ${r}, green: ${g}, blue: ${b}, alpha: ${a})`;
          } else if (value.startsWith('rgb')) {
            const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (match) {
              const r = (parseInt(match[1]) / 255).toFixed(3);
              const g = (parseInt(match[2]) / 255).toFixed(3);
              const b = (parseInt(match[3]) / 255).toFixed(3);
              const a = match[4] ? parseFloat(match[4]).toFixed(3) : '1.000';
              valueOutput = `UIColor(red: ${r}, green: ${g}, blue: ${b}, alpha: ${a})`;
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

        output += `    public static let ${uniqueName} = ${valueOutput}\n`;
      });

      output += `\n`;
    });
  });

  output += `}\n`;
  return output;
};

/**
 * Format: Flutter Dart Class mit korrekter className Handhabung und Gruppierung
 */
const flutterDartClassFormat = ({ dictionary, options, file }) => {
  const className = options.className || file.className || 'StyleDictionary';
  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'camel');

  let output = `\n//\n// ${file.destination}\n//\n\n`;
  output += `// Do not edit directly, this file was auto-generated.\n\n\n`;
  output += `\nimport 'dart:ui';\n\nclass ${className} {\n    ${className}._();\n\n`;

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
        const value = token.value;
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

// ============================================================================
// COMPOSITE TOKEN FORMATS
// ============================================================================

/**
 * Format: CSS Typography Classes
 * Generiert fertige CSS-Klassen für Typography Composite Tokens
 */
const cssTypographyClassesFormat = ({ dictionary, options }) => {
  const { brand, breakpoint } = options;

  let output = `/**\n`;
  output += ` * Typography Classes - ${brand} / ${breakpoint}\n`;
  output += ` * Generiert am: ${new Date().toISOString()}\n`;
  output += ` * Nicht manuell bearbeiten!\n`;
  output += ` */\n\n`;

  const hierarchicalGroups = groupTokensHierarchically(dictionary.allTokens);

  let isFirstTopLevel = true;
  Object.keys(hierarchicalGroups).forEach(topLevel => {
    const subGroups = hierarchicalGroups[topLevel];

    // Add top-level header
    if (!isFirstTopLevel) {
      output += `\n`;
    }
    output += `/* ============================================\n`;
    output += `   ${topLevel.toUpperCase()}\n`;
    output += `   ============================================ */\n\n`;
    isFirstTopLevel = false;

    Object.keys(subGroups).forEach(subLevel => {
      const tokens = subGroups[subLevel];

      // Add sub-level header if exists
      if (subLevel) {
        output += `/* ${topLevel} - ${subLevel} */\n`;
      }

      tokens.forEach(token => {
        if (token.$type === 'typography' && token.$value) {
          const style = token.$value;
          // Use only the last path segment as class name
          let className = token.path[token.path.length - 1];
          // Remove leading dot if present (token names may already include it)
          if (className.startsWith('.')) {
            className = className.substring(1);
          }

          if (token.comment) {
            output += `/* ${token.comment} */\n`;
          }

          output += `.${className} {\n`;
          if (style.fontFamily) output += `  font-family: ${style.fontFamily};\n`;
          if (style.fontWeight) output += `  font-weight: ${style.fontWeight};\n`;
          if (style.fontSize) output += `  font-size: ${style.fontSize};\n`;
          if (style.lineHeight) output += `  line-height: ${style.lineHeight};\n`;
          if (style.letterSpacing) output += `  letter-spacing: ${style.letterSpacing};\n`;
          if (style.fontStyle && style.fontStyle !== 'null') output += `  font-style: ${style.fontStyle.toLowerCase()};\n`;
          if (style.textCase && style.textCase !== 'ORIGINAL') {
            output += `  text-transform: ${style.textCase.toLowerCase()};\n`;
          }
          if (style.textDecoration && style.textDecoration !== 'NONE') {
            output += `  text-decoration: ${style.textDecoration.toLowerCase()};\n`;
          }
          output += `}\n\n`;
        }
      });
    });
  });

  return output;
};

/**
 * Format: CSS Effect Classes
 * Generiert fertige CSS-Klassen für Effect Composite Tokens
 */
const cssEffectClassesFormat = ({ dictionary, options }) => {
  const { brand, colorMode } = options;

  let output = `/**\n`;
  output += ` * Effect Classes - ${brand} / ${colorMode}\n`;
  output += ` * Generiert am: ${new Date().toISOString()}\n`;
  output += ` * Nicht manuell bearbeiten!\n`;
  output += ` */\n\n`;

  const hierarchicalGroups = groupTokensHierarchically(dictionary.allTokens);

  let isFirstTopLevel = true;
  Object.keys(hierarchicalGroups).forEach(topLevel => {
    const subGroups = hierarchicalGroups[topLevel];

    // Add top-level header
    if (!isFirstTopLevel) {
      output += `\n`;
    }
    output += `/* ============================================\n`;
    output += `   ${topLevel.toUpperCase()}\n`;
    output += `   ============================================ */\n\n`;
    isFirstTopLevel = false;

    Object.keys(subGroups).forEach(subLevel => {
      const tokens = subGroups[subLevel];

      // Add sub-level header if exists
      if (subLevel) {
        output += `/* ${topLevel} - ${subLevel} */\n`;
      }

      tokens.forEach(token => {
        if (token.$type === 'shadow' && Array.isArray(token.$value)) {
          // Use only the last path segment as class name
          let className = token.path[token.path.length - 1];
          // Remove leading dot if present (token names may already include it)
          if (className.startsWith('.')) {
            className = className.substring(1);
          }

          if (token.comment) {
            output += `/* ${token.comment} */\n`;
          }

          output += `.${className} {\n`;

          // Convert to CSS box-shadow
          const shadows = token.$value.map(effect => {
            if (effect.type === 'dropShadow') {
              return `${effect.offsetX}px ${effect.offsetY}px ${effect.radius}px ${effect.spread}px ${effect.color}`;
            }
            return null;
          }).filter(Boolean);

          if (shadows.length > 0) {
            output += `  box-shadow: ${shadows.join(', ')};\n`;
          }

          output += `}\n\n`;
        }
      });
    });
  });

  return output;
};

/**
 * Format: iOS Swift Typography Extension
 */
const iosSwiftTypographyFormat = ({ dictionary, options }) => {
  const { brand, breakpoint, sizeClass } = options;
  const className = `Typography${brand}${sizeClass || breakpoint}`;

  let output = `\n`;
  output += `//\n`;
  output += `// Typography - ${brand} / ${sizeClass || breakpoint}\n`;
  output += `//\n\n`;
  output += `// Do not edit directly, this file was auto-generated.\n\n`;
  output += `import UIKit\n\n`;
  output += `extension UIFont {\n`;
  output += `    struct ${className} {\n`;

  const hierarchicalGroups = groupTokensHierarchically(dictionary.allTokens);

  let isFirstTopLevel = true;
  Object.keys(hierarchicalGroups).forEach(topLevel => {
    const subGroups = hierarchicalGroups[topLevel];

    // Add top-level header
    if (!isFirstTopLevel) {
      output += `\n`;
    }
    output += `        // MARK: - ============================================\n`;
    output += `        // MARK: - ${topLevel.toUpperCase()}\n`;
    output += `        // MARK: - ============================================\n\n`;
    isFirstTopLevel = false;

    Object.keys(subGroups).forEach(subLevel => {
      const tokens = subGroups[subLevel];

      // Add sub-level header if exists
      if (subLevel) {
        output += `        // MARK: - ${topLevel} - ${subLevel}\n`;
      }

      tokens.forEach(token => {
        if (token.$type === 'typography' && token.$value) {
          const style = token.$value;
          // Use only the last path segment as property name
          const propName = token.path[token.path.length - 1];

          if (token.comment) {
            output += `        /** ${token.comment} */\n`;
          }

          const family = style.fontFamily || 'System';
          const size = parseFloat(style.fontSize) || 16;
          const weight = style.fontWeight || 400;

          // Map weight to UIFont.Weight
          let weightString = 'regular';
          if (weight >= 900) weightString = 'black';
          else if (weight >= 800) weightString = 'heavy';
          else if (weight >= 700) weightString = 'bold';
          else if (weight >= 600) weightString = 'semibold';
          else if (weight >= 500) weightString = 'medium';
          else if (weight >= 300) weightString = 'light';
          else if (weight >= 200) weightString = 'ultraLight';
          else if (weight >= 100) weightString = 'thin';

          output += `        static let ${propName} = UIFont(name: "${family}", size: ${size})?.withWeight(.${weightString}) ?? UIFont.systemFont(ofSize: ${size}, weight: .${weightString})\n`;
        }
      });
    });
  });

  output += `    }\n`;
  output += `}\n`;

  return output;
};

/**
 * Format: Android XML Resources with hierarchical grouping
 */
const androidResourcesFormat = ({ dictionary, options, file }) => {
  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'kebab');

  let output = `<?xml version="1.0" encoding="UTF-8"?>\n\n`;
  output += `<!--\n  Do not edit directly, this file was auto-generated.\n-->\n`;
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
        const value = token.value;
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

/**
 * Format: Android XML Typography Styles
 */
const androidXmlTypographyFormat = ({ dictionary, options }) => {
  const { brand, breakpoint } = options;

  let output = `<?xml version="1.0" encoding="utf-8"?>\n`;
  output += `<!--\n`;
  output += `  Typography Styles - ${brand} / ${breakpoint}\n`;
  output += `  Do not edit directly, this file was auto-generated.\n`;
  output += `-->\n`;
  output += `<resources>\n`;

  const hierarchicalGroups = groupTokensHierarchically(dictionary.allTokens);

  let isFirstTopLevel = true;
  Object.keys(hierarchicalGroups).forEach(topLevel => {
    const subGroups = hierarchicalGroups[topLevel];

    // Add top-level header
    if (!isFirstTopLevel) {
      output += `\n`;
    }
    output += `    <!-- ============================================\n`;
    output += `         ${topLevel.toUpperCase()}\n`;
    output += `         ============================================ -->\n\n`;
    isFirstTopLevel = false;

    Object.keys(subGroups).forEach(subLevel => {
      const tokens = subGroups[subLevel];

      // Add sub-level header if exists
      if (subLevel) {
        output += `    <!-- ${topLevel} - ${subLevel} -->\n`;
      }

      tokens.forEach(token => {
        if (token.$type === 'typography' && token.$value) {
          const style = token.$value;
          // Use only the last path segment as style name
          const styleName = token.path[token.path.length - 1];

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
          output += `    </style>\n`;
        }
      });
    });
  });

  output += `</resources>\n`;

  return output;
};

/**
 * Format: iOS Swift Effects
 * Exports shadow tokens as properly formatted Swift code
 */
const iosSwiftEffectsFormat = ({ dictionary, options }) => {
  const { brand, colorMode } = options;
  const className = `Effects${brand}${colorMode.charAt(0).toUpperCase() + colorMode.slice(1)}`;
  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'pascal');

  let output = `\n//\n// Effects - ${brand} / ${colorMode}\n//\n\n`;
  output += `// Do not edit directly, this file was auto-generated.\n\n`;
  output += `import UIKit\n\n`;
  output += `public class ${className} {\n`;

  const hierarchicalGroups = groupTokensHierarchically(dictionary.allTokens);

  Object.keys(hierarchicalGroups).forEach(topLevel => {
    const subGroups = hierarchicalGroups[topLevel];

    output += `    // MARK: - ============================================\n`;
    output += `    // MARK: - ${topLevel.toUpperCase()}\n`;
    output += `    // MARK: - ============================================\n\n`;

    Object.keys(subGroups).forEach(subLevel => {
      const tokens = subGroups[subLevel];

      if (subLevel) {
        output += `    // MARK: - ${topLevel} - ${subLevel}\n`;
      }

      tokens.forEach(token => {
        if (token.$type === 'shadow' && Array.isArray(token.$value)) {
          const uniqueName = uniqueNames.get(token.path.join('.'));

          if (token.comment) {
            output += `    /** ${token.comment} */\n`;
          }

          // Convert shadow array to NSShadow array
          const shadowsSwift = token.$value.map(effect => {
            if (effect.type === 'dropShadow') {
              // Parse color
              let colorValue = 'UIColor.black';
              if (effect.color) {
                const colorStr = effect.color.replace(/\s/g, '');
                if (colorStr.startsWith('rgba')) {
                  const match = colorStr.match(/rgba?\((\d+),(\d+),(\d+),?([\d.]*)\)/);
                  if (match) {
                    const r = (parseInt(match[1]) / 255).toFixed(3);
                    const g = (parseInt(match[2]) / 255).toFixed(3);
                    const b = (parseInt(match[3]) / 255).toFixed(3);
                    const a = match[4] || '1';
                    colorValue = `UIColor(red: ${r}, green: ${g}, blue: ${b}, alpha: ${a})`;
                  }
                }
              }

              return `NSShadow(offset: CGSize(width: ${effect.offsetX || 0}, height: ${effect.offsetY || 0}), blurRadius: ${effect.radius || 0}, color: ${colorValue})`;
            }
            return null;
          }).filter(Boolean);

          output += `    public static let ${uniqueName}: [NSShadow] = [${shadowsSwift.join(', ')}]\n`;
        }
      });

      output += `\n`;
    });
  });

  output += `}\n`;
  return output;
};

/**
 * Format: JavaScript/TypeScript Effects
 * Exports shadow tokens as properly formatted objects
 */
const javascriptEffectsFormat = ({ dictionary, options }) => {
  const { brand, colorMode } = options;
  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'camel');

  let output = `/**\n`;
  output += ` * Effect Tokens - ${brand} / ${colorMode}\n`;
  output += ` * Generiert am: ${new Date().toISOString()}\n`;
  output += ` * Nicht manuell bearbeiten!\n`;
  output += ` */\n\n`;

  const hierarchicalGroups = groupTokensHierarchically(dictionary.allTokens);

  let isFirstTopLevel = true;
  Object.keys(hierarchicalGroups).forEach(topLevel => {
    const subGroups = hierarchicalGroups[topLevel];

    if (!isFirstTopLevel) {
      output += `\n`;
    }
    output += `// ============================================\n`;
    output += `// ${topLevel.toUpperCase()}\n`;
    output += `// ============================================\n\n`;
    isFirstTopLevel = false;

    Object.keys(subGroups).forEach(subLevel => {
      const tokens = subGroups[subLevel];

      if (subLevel) {
        output += `// ${topLevel} - ${subLevel}\n`;
      }

      tokens.forEach(token => {
        if (token.$type === 'shadow' && Array.isArray(token.$value)) {
          const uniqueName = uniqueNames.get(token.path.join('.'));

          if (token.comment) {
            output += `/** ${token.comment} */\n`;
          }

          // Convert shadow array to JS object array
          const shadowsJS = token.$value.map(effect => {
            if (effect.type === 'dropShadow') {
              return `{
    offsetX: ${effect.offsetX || 0},
    offsetY: ${effect.offsetY || 0},
    radius: ${effect.radius || 0},
    spread: ${effect.spread || 0},
    color: "${effect.color || 'rgba(0, 0, 0, 0)'}"
  }`;
            }
            return null;
          }).filter(Boolean);

          output += `export const ${uniqueName} = [\n  ${shadowsJS.join(',\n  ')}\n];\n`;
        }
      });

      output += `\n`;
    });
  });

  return output;
};

/**
 * Format: Flutter Dart Effects
 * Exports shadow tokens as properly formatted Dart objects
 */
const flutterEffectsFormat = ({ dictionary, options }) => {
  const { brand, colorMode } = options;
  const className = `Effects${brand.charAt(0).toUpperCase() + brand.slice(1)}${colorMode.charAt(0).toUpperCase() + colorMode.slice(1)}`;
  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'camel');

  let output = `\n//\n// effects-${colorMode}.dart\n//\n\n`;
  output += `// Do not edit directly, this file was auto-generated.\n\n\n`;
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

          // Convert shadow array to Dart BoxShadow list
          const shadowsDart = token.$value.map(effect => {
            if (effect.type === 'dropShadow') {
              // Parse color
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

/**
 * Format: JavaScript/TypeScript Typography
 * Exports typography tokens as properly formatted objects
 */
const javascriptTypographyFormat = ({ dictionary, options }) => {
  const { brand, breakpoint } = options;
  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'camel');

  let output = `/**\n`;
  output += ` * Typography Tokens - ${brand} / ${breakpoint}\n`;
  output += ` * Generiert am: ${new Date().toISOString()}\n`;
  output += ` * Nicht manuell bearbeiten!\n`;
  output += ` */\n\n`;

  const hierarchicalGroups = groupTokensHierarchically(dictionary.allTokens);

  let isFirstTopLevel = true;
  Object.keys(hierarchicalGroups).forEach(topLevel => {
    const subGroups = hierarchicalGroups[topLevel];

    if (!isFirstTopLevel) {
      output += `\n`;
    }
    output += `// ============================================\n`;
    output += `// ${topLevel.toUpperCase()}\n`;
    output += `// ============================================\n\n`;
    isFirstTopLevel = false;

    Object.keys(subGroups).forEach(subLevel => {
      const tokens = subGroups[subLevel];

      if (subLevel) {
        output += `// ${topLevel} - ${subLevel}\n`;
      }

      tokens.forEach(token => {
        if (token.$type === 'typography' && token.$value) {
          const uniqueName = uniqueNames.get(token.path.join('.'));
          const style = token.$value;

          if (token.comment) {
            output += `/** ${token.comment} */\n`;
          }

          output += `export const ${uniqueName} = {\n`;
          if (style.fontFamily) output += `  fontFamily: "${style.fontFamily}",\n`;
          if (style.fontWeight) output += `  fontWeight: ${style.fontWeight},\n`;
          if (style.fontSize) output += `  fontSize: "${style.fontSize}",\n`;
          if (style.lineHeight) output += `  lineHeight: "${style.lineHeight}",\n`;
          if (style.letterSpacing) output += `  letterSpacing: "${style.letterSpacing}",\n`;
          if (style.fontStyle && style.fontStyle !== 'null') output += `  fontStyle: "${style.fontStyle.toLowerCase()}",\n`;
          if (style.textCase && style.textCase !== 'ORIGINAL') output += `  textTransform: "${style.textCase.toLowerCase()}",\n`;
          if (style.textDecoration && style.textDecoration !== 'NONE') output += `  textDecoration: "${style.textDecoration.toLowerCase()}",\n`;
          output += `};\n`;
        }
      });

      output += `\n`;
    });
  });

  return output;
};

/**
 * Format: Flutter Dart Typography
 * Exports typography tokens as properly formatted Dart objects
 */
const flutterTypographyFormat = ({ dictionary, options }) => {
  const { brand, breakpoint, sizeClass } = options;
  const className = `Typography${brand.charAt(0).toUpperCase() + brand.slice(1)}${(sizeClass || breakpoint).charAt(0).toUpperCase() + (sizeClass || breakpoint).slice(1)}`;
  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'camel');

  let output = `\n//\n// typography-${sizeClass || breakpoint}.dart\n//\n\n`;
  output += `// Do not edit directly, this file was auto-generated.\n\n\n`;
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
        if (token.$type === 'typography' && token.$value) {
          const uniqueName = uniqueNames.get(token.path.join('.'));
          const style = token.$value;

          if (token.comment) {
            output += `    /** ${token.comment} */\n`;
          }

          output += `    static const ${uniqueName} = {\n`;
          if (style.fontFamily) output += `      'fontFamily': '${style.fontFamily}',\n`;
          if (style.fontWeight) output += `      'fontWeight': ${style.fontWeight},\n`;
          if (style.fontSize) output += `      'fontSize': '${style.fontSize}',\n`;
          if (style.lineHeight) output += `      'lineHeight': '${style.lineHeight}',\n`;
          if (style.letterSpacing) output += `      'letterSpacing': '${style.letterSpacing}',\n`;
          if (style.fontStyle && style.fontStyle !== 'null') output += `      'fontStyle': '${style.fontStyle.toLowerCase()}',\n`;
          if (style.textCase && style.textCase !== 'ORIGINAL') output += `      'textTransform': '${style.textCase.toLowerCase()}',\n`;
          if (style.textDecoration && style.textDecoration !== 'NONE') output += `      'textDecoration': '${style.textDecoration.toLowerCase()}',\n`;
          output += `    };\n`;
        }
      });

      output += `\n`;
    });
  });

  output += `}\n`;
  return output;
};

// ============================================================================
// TRANSFORM GROUPS
// ============================================================================

/**
 * Custom Transform Groups die unsere verkürzten Token-Namen verwenden
 * WICHTIG: Wir verwenden NICHT 'attribute/cti' oder 'name/cti/*', da diese
 * den vollständigen Pfad verwenden. Stattdessen nur unsere Custom Name Transforms.
 */
const customTransformGroups = {
  'custom/css': ['name/custom/kebab', 'color/css', 'custom/size/px'],
  'custom/scss': ['name/custom/kebab', 'color/css', 'custom/size/px'],
  'custom/js': ['name/custom/js', 'color/css', 'custom/size/px'],
  'custom/ios-swift': ['name/custom/ios-swift', 'custom/color/UIColor', 'custom/size/px'],
  'custom/android': ['name/custom/kebab', 'color/hex', 'custom/size/px'],
  'custom/flutter': ['name/custom/flutter-dart', 'color/hex', 'custom/size/px']
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  transforms: {
    'color/css': colorCssTransform,
    'custom/color/UIColor': colorUIColorTransform,
    'custom/size/px': sizePxTransform,
    'size/rem': sizeRemTransform,
    'name/custom/kebab': nameKebabTransform,
    'name/custom/js': nameJsTransform,
    'name/custom/ios-swift': nameIosSwiftTransform,
    'name/custom/flutter-dart': nameFlutterDartTransform
  },
  transformGroups: customTransformGroups,
  formats: {
    // Classic Token Formats - Custom versions with hierarchical grouping
    'custom/css/variables': cssVariablesFormat,
    'custom/scss/variables': scssVariablesFormat,
    'custom/javascript/es6': javascriptEs6Format,
    'custom/json/nested': jsonNestedFormat,
    'ios-swift/class': iosSwiftClassFormat,
    'flutter/class': flutterDartClassFormat,
    'android/resources': androidResourcesFormat,

    // Composite Token Formats
    'css/typography-classes': cssTypographyClassesFormat,
    'css/effect-classes': cssEffectClassesFormat,
    'javascript/effects': javascriptEffectsFormat,
    'javascript/typography': javascriptTypographyFormat,
    'flutter/effects': flutterEffectsFormat,
    'flutter/typography': flutterTypographyFormat,
    'ios-swift/effects': iosSwiftEffectsFormat,
    'ios-swift/typography': iosSwiftTypographyFormat,
    'android/typography-styles': androidXmlTypographyFormat
  }
};
