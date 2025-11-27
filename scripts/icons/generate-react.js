#!/usr/bin/env node

/**
 * React Component Generation Script
 *
 * Generates TypeScript React components from optimized SVGs.
 * Uses SVGR with forwardRef and accessibility support.
 *
 * Input:  dist/icons/svg/*.svg
 * Output: dist/icons/react/*.tsx + index.ts
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PATHS = {
  input: path.resolve(__dirname, '../../dist/icons/svg'),
  output: path.resolve(__dirname, '../../dist/icons/react'),
  config: path.resolve(__dirname, '../../build-config/icons/svgr.config.js'),
};

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

const log = {
  info: (msg) => console.log(`\u2139\uFE0F  ${msg}`),
  success: (msg) => console.log(`\u2705 ${msg}`),
  warn: (msg) => console.log(`\u26A0\uFE0F  ${msg}`),
  error: (msg) => console.error(`\u274C ${msg}`),
  step: (msg) => console.log(`\n\u27A1\uFE0F  ${msg}`),
};

// ============================================================================
// NAME TRANSFORMATIONS
// ============================================================================

/**
 * Convert kebab-case to PascalCase
 * add -> Add
 * arrow-left -> ArrowLeft
 */
function toPascalCase(str) {
  return str
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}

/**
 * Convert SVG attributes to JSX camelCase
 * stroke-width -> strokeWidth
 * stroke-linecap -> strokeLinecap
 */
function convertToJsxAttributes(svgContent) {
  const attributeMap = {
    'stroke-width': 'strokeWidth',
    'stroke-linecap': 'strokeLinecap',
    'stroke-linejoin': 'strokeLinejoin',
    'stroke-miterlimit': 'strokeMiterlimit',
    'stroke-dasharray': 'strokeDasharray',
    'stroke-dashoffset': 'strokeDashoffset',
    'stroke-opacity': 'strokeOpacity',
    'fill-rule': 'fillRule',
    'fill-opacity': 'fillOpacity',
    'clip-rule': 'clipRule',
    'clip-path': 'clipPath',
    'font-size': 'fontSize',
    'font-family': 'fontFamily',
    'font-weight': 'fontWeight',
    'text-anchor': 'textAnchor',
    'dominant-baseline': 'dominantBaseline',
    'xlink:href': 'xlinkHref',
    'xml:space': 'xmlSpace',
  };

  let result = svgContent;
  for (const [kebab, camel] of Object.entries(attributeMap)) {
    // Replace attribute names (e.g., stroke-width="2" -> strokeWidth="2")
    result = result.replace(new RegExp(`${kebab}=`, 'g'), `${camel}=`);
  }

  return result;
}

/**
 * Get all SVG files from input directory
 */
function getSvgFiles() {
  if (!fs.existsSync(PATHS.input)) {
    log.warn(`Input directory does not exist: ${PATHS.input}`);
    log.info('Run "npm run build:icons:svg" first');
    return [];
  }

  const files = fs.readdirSync(PATHS.input)
    .filter(file => file.endsWith('.svg') && !file.startsWith('.'))
    .sort();

  return files;
}

// ============================================================================
// COMPONENT GENERATION
// ============================================================================

/**
 * Load SVGR dynamically (ESM module)
 */
async function loadSvgr() {
  const { transform } = await import('@svgr/core');
  return transform;
}

/**
 * Generate React component template
 */
function generateComponentTemplate(componentName, svgContent) {
  // Extract viewBox from SVG
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

  // Extract inner content (everything inside <svg>...</svg>)
  const innerMatch = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  const rawInnerContent = innerMatch ? innerMatch[1].trim() : '';

  // Convert SVG attributes to JSX camelCase
  const innerContent = convertToJsxAttributes(rawInnerContent);

  return `import * as React from 'react';

export interface ${componentName}Props extends React.SVGProps<SVGSVGElement> {
  /**
   * Icon size (width and height)
   * @default 24
   */
  size?: number | string;
  /**
   * Accessible label for screen readers.
   * If provided, aria-hidden will be set to false.
   */
  'aria-label'?: string;
  /**
   * Hide icon from screen readers (decorative icon)
   * @default true
   */
  'aria-hidden'?: boolean;
  /**
   * Optional title element for tooltip/accessibility
   */
  title?: string;
}

const ${componentName} = React.forwardRef<SVGSVGElement, ${componentName}Props>(
  (
    {
      size = 24,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden = true,
      title,
      ...props
    },
    ref
  ) => {
    const isDecorative = !ariaLabel && ariaHidden;

    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="${viewBox}"
        width={size}
        height={size}
        fill="currentColor"
        role="img"
        aria-hidden={isDecorative}
        aria-label={ariaLabel}
        {...props}
      >
        {title && <title>{title}</title>}
        ${innerContent}
      </svg>
    );
  }
);

${componentName}.displayName = '${componentName}';

export { ${componentName} };
export default ${componentName};
`;
}

/**
 * Generate a single React component
 */
async function generateComponent(filename) {
  const inputPath = path.join(PATHS.input, filename);
  const iconName = filename.replace(/\.svg$/, '');
  const componentName = toPascalCase(iconName);
  const outputPath = path.join(PATHS.output, `${componentName}.tsx`);

  try {
    const svgContent = fs.readFileSync(inputPath, 'utf8');
    const componentCode = generateComponentTemplate(componentName, svgContent);

    fs.writeFileSync(outputPath, componentCode, 'utf8');

    return {
      name: componentName,
      filename: `${componentName}.tsx`,
      success: true,
    };
  } catch (error) {
    return {
      name: componentName,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate index.ts with all exports
 */
function generateIndex(components) {
  const successfulComponents = components.filter(c => c.success);

  // Named exports
  const namedExports = successfulComponents
    .map(c => `export { ${c.name}, type ${c.name}Props } from './${c.name}';`)
    .join('\n');

  // Type for all icon names
  const iconNames = successfulComponents
    .map(c => `  | '${c.name}'`)
    .join('\n');

  const indexContent = `/**
 * BILD Design System Icons - React Components
 *
 * Auto-generated from SVG icons. Do not edit manually.
 * Generated at: ${new Date().toISOString()}
 */

${namedExports}

/**
 * Union type of all available icon names
 */
export type IconName =
${iconNames};

/**
 * Total number of icons: ${successfulComponents.length}
 */
export const ICON_COUNT = ${successfulComponents.length};
`;

  const indexPath = path.join(PATHS.output, 'index.ts');
  fs.writeFileSync(indexPath, indexContent, 'utf8');

  // Also generate index.d.ts for type declarations
  const dtsPath = path.join(PATHS.output, 'index.d.ts');
  fs.writeFileSync(dtsPath, indexContent, 'utf8');

  return indexPath;
}

/**
 * Generate package.json for the react directory
 */
function generatePackageJson() {
  const packageJson = {
    name: '@marioschmidt/design-system-icons-react',
    private: true,
    main: './index.js',
    module: './index.mjs',
    types: './index.d.ts',
    sideEffects: false,
  };

  const packagePath = path.join(PATHS.output, 'package.json');
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), 'utf8');

  return packagePath;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n========================================');
  console.log('  React Component Generation (SVGR)');
  console.log('========================================\n');

  // Get input files
  log.step('Scanning optimized SVGs...');
  const svgFiles = getSvgFiles();

  if (svgFiles.length === 0) {
    log.warn('No optimized SVG files found');
    log.info('Run "npm run build:icons:svg" first');
    return { success: true, count: 0 };
  }

  log.success(`Found ${svgFiles.length} SVG file(s)`);

  // Create output directory
  if (!fs.existsSync(PATHS.output)) {
    fs.mkdirSync(PATHS.output, { recursive: true });
    log.success('Created output directory');
  }

  // Generate all components
  log.step('Generating React components...');
  const results = [];

  for (const file of svgFiles) {
    const result = await generateComponent(file);
    results.push(result);

    if (result.success) {
      log.info(`${result.name}.tsx`);
    } else {
      log.error(`${result.name}: ${result.error}`);
    }
  }

  // Generate index file
  log.step('Generating index.ts...');
  generateIndex(results);
  log.success('Created index.ts with all exports');

  // Generate package.json
  generatePackageJson();
  log.success('Created package.json');

  // Summary
  console.log('\n========================================');
  console.log('  Summary');
  console.log('========================================\n');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  log.success(`Generated: ${successful}/${results.length} components`);

  if (failed > 0) {
    log.error(`Failed: ${failed} component(s)`);
    return { success: false, count: successful, failed };
  }

  log.info(`Output: ${PATHS.output}`);

  return { success: true, count: successful };
}

// Run if called directly
if (require.main === module) {
  main()
    .then(result => {
      if (!result.success) {
        process.exit(1);
      }
    })
    .catch(error => {
      log.error(error.message);
      process.exit(1);
    });
}

module.exports = { main, PATHS, toPascalCase };
