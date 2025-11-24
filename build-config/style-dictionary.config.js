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

  // Generate unique names with collision detection
  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'kebab');

  // Header
  let output = `/**\n`;
  output += ` * ${file.destination}\n`;
  output += ` * Generiert am: ${new Date().toISOString()}\n`;
  if (layer) output += ` * Layer: ${layer}\n`;
  if (mode) output += ` * Mode: ${mode}\n`;
  if (brand) output += ` * Brand: ${brand}\n`;
  output += ` * Nicht manuell bearbeiten!\n`;
  output += ` */\n\n`;

  // Gruppiere Tokens nach ihren Pfad-Segmenten
  const groupedTokens = {};
  dictionary.allTokens.forEach(token => {
    // Erstelle Gruppen-Schlüssel aus allen Segmenten außer dem letzten
    const pathSegments = token.path.slice(0, -1);
    const groupKey = pathSegments.join(' - ');

    if (!groupedTokens[groupKey]) {
      groupedTokens[groupKey] = [];
    }
    groupedTokens[groupKey].push(token);
  });

  // CSS Custom Properties
  output += `${selector} {\n`;

  let isFirstGroup = true;
  Object.keys(groupedTokens).sort().forEach(groupKey => {
    const tokens = groupedTokens[groupKey];

    // Füge Gruppierungs-Kommentar hinzu
    if (groupKey) {
      if (!isFirstGroup) {
        output += `\n`;
      }
      output += `  /* ${groupKey} */\n`;
      isFirstGroup = false;
    }

    tokens.forEach(token => {
      const uniqueName = uniqueNames.get(token.path.join('.'));
      const comment = token.comment || token.description;
      if (comment) {
        output += `  /**\n`;
        output += `   * ${comment}\n`;
        output += `   */\n`;
      }
      output += `  --${uniqueName}: ${token.value};\n`;
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

  // Generate unique names with collision detection
  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'kebab');

  let output = `//\n`;
  output += `// ${file.destination}\n`;
  output += `// Generiert am: ${new Date().toISOString()}\n`;
  if (layer) output += `// Layer: ${layer}\n`;
  if (mode) output += `// Mode: ${mode}\n`;
  if (brand) output += `// Brand: ${brand}\n`;
  output += `// Nicht manuell bearbeiten!\n`;
  output += `//\n\n`;

  // Gruppiere Tokens nach ihren Pfad-Segmenten
  const groupedTokens = {};
  dictionary.allTokens.forEach(token => {
    const pathSegments = token.path.slice(0, -1);
    const groupKey = pathSegments.join(' - ');

    if (!groupedTokens[groupKey]) {
      groupedTokens[groupKey] = [];
    }
    groupedTokens[groupKey].push(token);
  });

  let isFirstGroup = true;
  Object.keys(groupedTokens).sort().forEach(groupKey => {
    const tokens = groupedTokens[groupKey];

    if (groupKey) {
      if (!isFirstGroup) {
        output += `\n`;
      }
      output += `// ${groupKey}\n`;
      isFirstGroup = false;
    }

    tokens.forEach(token => {
      const uniqueName = uniqueNames.get(token.path.join('.'));
      const comment = token.comment || token.description;
      if (comment) {
        output += `// ${comment}\n`;
      }
      output += `$${uniqueName}: ${token.value};\n`;
    });
  });

  return output;
};

/**
 * Format: JavaScript/TypeScript ES6 Module mit Gruppierung
 */
const javascriptEs6Format = ({ dictionary, options, file }) => {
  const { mode, layer, brand } = options;

  // Generate unique names with collision detection (camelCase for JS)
  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'camel');

  let output = `/**\n`;
  output += ` * ${file.destination}\n`;
  output += ` * Generiert am: ${new Date().toISOString()}\n`;
  if (layer) output += ` * Layer: ${layer}\n`;
  if (mode) output += ` * Mode: ${mode}\n`;
  if (brand) output += ` * Brand: ${brand}\n`;
  output += ` * Nicht manuell bearbeiten!\n`;
  output += ` */\n\n`;

  output += `export default {\n`;

  // Gruppiere Tokens nach ihren Pfad-Segmenten
  const groupedTokens = {};
  dictionary.allTokens.forEach(token => {
    const pathSegments = token.path.slice(0, -1);
    const groupKey = pathSegments.join(' - ');

    if (!groupedTokens[groupKey]) {
      groupedTokens[groupKey] = [];
    }
    groupedTokens[groupKey].push(token);
  });

  let isFirstGroup = true;
  Object.keys(groupedTokens).sort().forEach(groupKey => {
    const tokens = groupedTokens[groupKey];

    if (groupKey) {
      if (!isFirstGroup) {
        output += `\n`;
      }
      output += `  // ${groupKey}\n`;
      isFirstGroup = false;
    }

    tokens.forEach(token => {
      const uniqueName = uniqueNames.get(token.path.join('.'));
      const comment = token.comment || token.description;
      if (comment) {
        output += `  /** ${comment} */\n`;
      }
      // Escape single quotes in values
      const escapedValue = String(token.value).replace(/'/g, "\\'");
      output += `  '${uniqueName}': '${escapedValue}',\n`;
    });
  });

  output += `};\n`;

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

  // Generate unique names with collision detection (PascalCase for Swift)
  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'pascal');

  let output = `\n`;
  output += `//\n`;
  output += `// ${file.destination}\n`;
  output += `//\n\n`;
  output += `// Do not edit directly, this file was auto-generated.\n\n\n`;
  output += `import UIKit\n\n`;
  output += `public class ${className} {\n`;

  // Gruppiere Tokens nach ihren Pfad-Segmenten
  const groupedTokens = {};
  dictionary.allTokens.forEach(token => {
    const pathSegments = token.path.slice(0, -1);
    const groupKey = pathSegments.join(' - ');

    if (!groupedTokens[groupKey]) {
      groupedTokens[groupKey] = [];
    }
    groupedTokens[groupKey].push(token);
  });

  let isFirstGroup = true;
  Object.keys(groupedTokens).sort().forEach(groupKey => {
    const tokens = groupedTokens[groupKey];

    if (groupKey) {
      if (!isFirstGroup) {
        output += `\n`;
      }
      output += `    // MARK: - ${groupKey}\n`;
      isFirstGroup = false;
    }

    tokens.forEach(token => {
      const uniqueName = uniqueNames.get(token.path.join('.'));
      const comment = token.comment || token.description;
      if (comment) {
        output += `    /** ${comment} */\n`;
      }

      // Determine the type based on token type
      let valueOutput;
      const value = token.value;
      const type = token.$type || token.type;

      if (type === 'color') {
        // Transform color to UIColor directly in format
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
            valueOutput = `"${value}"`;  // Fallback
          }
        } else {
          valueOutput = `"${value}"`;  // Fallback for other color formats
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
  });

  output += `}\n`;

  return output;
};

/**
 * Format: Flutter Dart Class mit korrekter className Handhabung und Gruppierung
 */
const flutterDartClassFormat = ({ dictionary, options, file }) => {
  const className = options.className || file.className || 'StyleDictionary';

  // Generate unique names with collision detection (camelCase for Flutter)
  const uniqueNames = generateUniqueNames(dictionary.allTokens, 'camel');

  let output = `\n`;
  output += `//\n`;
  output += `// ${file.destination}\n`;
  output += `//\n\n`;
  output += `// Do not edit directly, this file was auto-generated.\n\n\n`;
  output += `\nimport 'dart:ui';\n\n`;
  output += `class ${className} {\n`;
  output += `    ${className}._();\n\n`;

  // Gruppiere Tokens nach ihren Pfad-Segmenten
  const groupedTokens = {};
  dictionary.allTokens.forEach(token => {
    const pathSegments = token.path.slice(0, -1);
    const groupKey = pathSegments.join(' - ');

    if (!groupedTokens[groupKey]) {
      groupedTokens[groupKey] = [];
    }
    groupedTokens[groupKey].push(token);
  });

  let isFirstGroup = true;
  Object.keys(groupedTokens).sort().forEach(groupKey => {
    const tokens = groupedTokens[groupKey];

    if (groupKey) {
      if (!isFirstGroup) {
        output += `\n`;
      }
      output += `    // ${groupKey}\n`;
      isFirstGroup = false;
    }

    tokens.forEach(token => {
      const uniqueName = uniqueNames.get(token.path.join('.'));
      const comment = token.comment || token.description;
      if (comment) {
        output += `    /** ${comment} */\n`;
      }

      // Determine the type based on token type
      let valueOutput;
      const value = token.value;
      const type = token.$type || token.type;

      if (type === 'color') {
        // Transform color to Flutter Color directly in format
        if (value.startsWith('#')) {
          const hex = value.replace('#', '');
          let argb;
          if (hex.length === 6) {
            argb = 'FF' + hex; // Add full opacity
          } else if (hex.length === 8) {
            // Convert RGBA to ARGB
            argb = hex.substring(6, 8) + hex.substring(0, 6);
          } else {
            argb = 'FF000000'; // Fallback
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

  dictionary.allTokens.forEach(token => {
    if (token.$type === 'typography' && token.$value) {
      const style = token.$value;
      const className = token.path.join('-');

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

  dictionary.allTokens.forEach(token => {
    if (token.$type === 'shadow' && Array.isArray(token.$value)) {
      const className = token.path.join('-');

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

  dictionary.allTokens.forEach(token => {
    if (token.$type === 'typography' && token.$value) {
      const style = token.$value;
      const propName = token.path.join('_');

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

  output += `    }\n`;
  output += `}\n`;

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

  dictionary.allTokens.forEach(token => {
    if (token.$type === 'typography' && token.$value) {
      const style = token.$value;
      const styleName = token.path.join('_');

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

  output += `</resources>\n`;

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
    // Classic Token Formats
    'css/variables': cssVariablesFormat,
    'scss/variables': scssVariablesFormat,
    'javascript/es6': javascriptEs6Format,
    'json/nested': jsonNestedFormat,
    'ios-swift/class': iosSwiftClassFormat,
    'flutter/class': flutterDartClassFormat,

    // Composite Token Formats
    'css/typography-classes': cssTypographyClassesFormat,
    'css/effect-classes': cssEffectClassesFormat,
    'ios-swift/typography': iosSwiftTypographyFormat,
    'android/typography-styles': androidXmlTypographyFormat
  }
};
