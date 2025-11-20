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

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  transforms: {
    'color/css': colorCssTransform,
    'size/rem': sizeRemTransform,
    'name/kebab': nameKebabTransform,
    'name/js': nameJsTransform
  },
  formats: {
    'css/variables': cssVariablesFormat,
    'scss/variables': scssVariablesFormat,
    'javascript/es6': javascriptEs6Format,
    'json/nested': jsonNestedFormat
  }
};
