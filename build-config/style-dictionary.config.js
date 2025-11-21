/**
 * Style Dictionary Konfiguration für BILD Design System (v4)
 *
 * Diese Datei exportiert Custom Transforms und Formats
 * für Style Dictionary v4
 */

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
 */
const nameKebabTransform = {
  name: 'name/kebab',
  type: 'name',
  transform: (token) => {
    // Konvertiert Token-Pfad zu Kebab-Case
    return token.path.join('-').toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }
};

/**
 * Transform: Name zu gültigem JavaScript Identifier (Camel-Case)
 */
const nameJsTransform = {
  name: 'name/js',
  type: 'name',
  transform: (token) => {
    // Konvertiert Token-Pfad zu einem gültigen JS Identifier
    return token.path
      .join('-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase())
      // Stelle sicher, dass es nicht mit einer Zahl beginnt
      .replace(/^(\d)/, '_$1');
  }
};

/**
 * Transform: Name für iOS Swift (PascalCase, behält Unterstriche in Dezimalzahlen)
 * Verhindert Namenskollisionen wie size1_25x vs size12_5x -> beide würden Size125x
 */
const nameIosSwiftTransform = {
  name: 'name/ios-swift',
  type: 'name',
  transform: (token) => {
    // Join path segments with dashes
    const name = token.path.join('-');

    // Split by dash, capitalize first letter of each part
    const parts = name.split('-');
    const pascalCased = parts
      .map(part => {
        // Preserve underscores within parts (for decimals like 1_25x)
        // Only capitalize the first letter
        if (part.length === 0) return part;
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');

    return pascalCased;
  }
};

/**
 * Transform: Name für Flutter Dart (camelCase, behält Unterstriche in Dezimalzahlen)
 */
const nameFlutterDartTransform = {
  name: 'name/flutter-dart',
  type: 'name',
  transform: (token) => {
    // Join path segments with dashes
    const name = token.path.join('-');

    // Split by dash, capitalize first letter of each part except first
    const parts = name.split('-');
    const camelCased = parts
      .map((part, index) => {
        if (part.length === 0) return part;
        // First part stays lowercase, rest get capitalized
        if (index === 0) {
          return part.toLowerCase();
        }
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      })
      .join('');

    return camelCased;
  }
};

// ============================================================================
// CUSTOM FORMATS
// ============================================================================

/**
 * Format: CSS Custom Properties mit Kategorisierung
 */
const cssVariablesFormat = ({ dictionary, options, file }) => {
  const selector = options.selector || ':root';
  const { mode, layer, brand } = options;

  // Header
  let output = `/**\n`;
  output += ` * ${file.destination}\n`;
  output += ` * Generiert am: ${new Date().toISOString()}\n`;
  if (layer) output += ` * Layer: ${layer}\n`;
  if (mode) output += ` * Mode: ${mode}\n`;
  if (brand) output += ` * Brand: ${brand}\n`;
  output += ` * Nicht manuell bearbeiten!\n`;
  output += ` */\n\n`;

  // CSS Custom Properties
  output += `${selector} {\n`;

  dictionary.allTokens.forEach(token => {
    const comment = token.comment || token.description;
    if (comment) {
      output += `  /* ${comment} */\n`;
    }
    output += `  --${token.name}: ${token.value};\n`;
  });

  output += `}\n`;

  return output;
};

/**
 * Format: SCSS Variables
 */
const scssVariablesFormat = ({ dictionary, options, file }) => {
  const { mode, layer, brand } = options;

  let output = `//\n`;
  output += `// ${file.destination}\n`;
  output += `// Generiert am: ${new Date().toISOString()}\n`;
  if (layer) output += `// Layer: ${layer}\n`;
  if (mode) output += `// Mode: ${mode}\n`;
  if (brand) output += `// Brand: ${brand}\n`;
  output += `// Nicht manuell bearbeiten!\n`;
  output += `//\n\n`;

  dictionary.allTokens.forEach(token => {
    const comment = token.comment || token.description;
    if (comment) {
      output += `// ${comment}\n`;
    }
    output += `$${token.name}: ${token.value};\n`;
  });

  return output;
};

/**
 * Format: JavaScript/TypeScript ES6 Module
 */
const javascriptEs6Format = ({ dictionary, options, file }) => {
  const { mode, layer, brand } = options;

  let output = `/**\n`;
  output += ` * ${file.destination}\n`;
  output += ` * Generiert am: ${new Date().toISOString()}\n`;
  if (layer) output += ` * Layer: ${layer}\n`;
  if (mode) output += ` * Mode: ${mode}\n`;
  if (brand) output += ` * Brand: ${brand}\n`;
  output += ` * Nicht manuell bearbeiten!\n`;
  output += ` */\n\n`;

  output += `export default {\n`;

  dictionary.allTokens.forEach(token => {
    const comment = token.comment || token.description;
    if (comment) {
      output += `  /** ${comment} */\n`;
    }
    // Escape single quotes in values
    const escapedValue = String(token.value).replace(/'/g, "\\'");
    output += `  '${token.name}': '${escapedValue}',\n`;
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
 * Format: iOS Swift Class mit korrekter className Handhabung
 */
const iosSwiftClassFormat = ({ dictionary, options, file }) => {
  const className = options.className || file.className || 'StyleDictionary';

  let output = `\n`;
  output += `//\n`;
  output += `// ${file.destination}\n`;
  output += `//\n\n`;
  output += `// Do not edit directly, this file was auto-generated.\n\n\n`;
  output += `import UIKit\n\n`;
  output += `public class ${className} {\n`;

  dictionary.allTokens.forEach(token => {
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

    output += `    public static let ${token.name} = ${valueOutput}\n`;
  });

  output += `}\n`;

  return output;
};

/**
 * Format: Flutter Dart Class mit korrekter className Handhabung
 */
const flutterDartClassFormat = ({ dictionary, options, file }) => {
  const className = options.className || file.className || 'StyleDictionary';

  let output = `\n`;
  output += `//\n`;
  output += `// ${file.destination}\n`;
  output += `//\n\n`;
  output += `// Do not edit directly, this file was auto-generated.\n\n\n`;
  output += `\nimport 'dart:ui';\n\n`;
  output += `class ${className} {\n`;
  output += `    ${className}._();\n\n`;

  dictionary.allTokens.forEach(token => {
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

    output += `    static const ${token.name} = ${valueOutput};\n`;
  });

  output += `}\n`;

  return output;
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
    'name/kebab': nameKebabTransform,
    'name/js': nameJsTransform,
    'name/ios-swift': nameIosSwiftTransform,
    'name/flutter-dart': nameFlutterDartTransform
  },
  formats: {
    'css/variables': cssVariablesFormat,
    'scss/variables': scssVariablesFormat,
    'javascript/es6': javascriptEs6Format,
    'json/nested': jsonNestedFormat,
    'ios-swift/class': iosSwiftClassFormat,
    'flutter/class': flutterDartClassFormat
  }
};
