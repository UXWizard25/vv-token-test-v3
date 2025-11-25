/**
 * Build CSS Bundles with Optimization
 *
 * Creates optimized CSS bundles from individual token files:
 * - Quick Start: All tokens (semantic + components)
 * - Semantic: Only semantic tokens
 * - Components: Individual component bundles
 *
 * Optimization Features:
 * - CSS Nesting for better organization
 * - Metadata headers with brand, version, usage info
 * - Section comments for navigation
 * - Removed unnecessary whitespace
 * - Grouped selectors for readability
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const BUNDLES_DIR = path.join(DIST_DIR, 'bundles');
const BRANDS = ['bild', 'sportbild', 'advertorial'];
const PACKAGE_VERSION = require('../package.json').version;

/**
 * Generates bundle header with metadata
 */
function generateBundleHeader(brand, bundleType) {
  const brandName = brand.charAt(0).toUpperCase() + brand.slice(1);
  const date = new Date().toISOString().split('T')[0];

  const typeDescriptions = {
    'quick-start': 'Complete Bundle - All semantic tokens + all component tokens',
    'semantic': 'Semantic Bundle - Foundation tokens only (colors, spacing, typography, effects)',
    'component': 'Component Bundle - Component-specific tokens'
  };

  return `/**
 * ============================================================================
 * ${brandName} Design System - ${typeDescriptions[bundleType] || 'CSS Bundle'}
 * ============================================================================
 *
 * Brand: ${brandName}
 * Version: ${PACKAGE_VERSION}
 * Generated: ${date}
 *
 * Theme Switching: Use data-brand, data-theme, data-breakpoint, data-density
 *
 * Usage:
 *   <html data-brand="${brand}" data-theme="light" data-breakpoint="lg">
 *
 * Copyright (c) 2024 Axel Springer Deutschland GmbH
 * Proprietary and confidential. All rights reserved.
 * ============================================================================
 */

`;
}

/**
 * Parses CSS and groups rules by selector for nesting
 */
function parseCSS(css) {
  const rules = [];

  // Match CSS rules: selector { properties }
  const ruleRegex = /([^{]+)\{([^}]+)\}/g;
  let match;

  while ((match = ruleRegex.exec(css)) !== null) {
    const selector = match[1].trim();
    const properties = match[2].trim();

    if (selector && properties) {
      rules.push({ selector, properties });
    }
  }

  return rules;
}

/**
 * Groups rules by base selector for CSS nesting
 */
function groupRulesForNesting(rules) {
  const grouped = new Map();

  for (const rule of rules) {
    const { selector, properties } = rule;

    // Check if selector is a data-attribute selector with a class
    const match = selector.match(/^(\[data-[^\]]+\](?:\[data-[^\]]+\])*)\s+\.([a-zA-Z0-9_-]+)$/);

    if (match) {
      // This is a nested rule: [data-brand="x"][data-theme="y"] .classname
      const baseSelector = match[1];
      const className = match[2];

      if (!grouped.has(baseSelector)) {
        grouped.set(baseSelector, { properties: [], classes: [] });
      }

      grouped.get(baseSelector).classes.push({ className, properties });
    } else {
      // This is a regular rule (custom properties block or simple selector)
      if (!grouped.has(selector)) {
        grouped.set(selector, { properties: [], classes: [] });
      }

      // Split properties into individual lines
      const propLines = properties.split(';')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      grouped.get(selector).properties.push(...propLines);
    }
  }

  return grouped;
}

/**
 * Generates optimized CSS with nesting
 */
function generateNestedCSS(grouped) {
  let output = '';

  for (const [selector, data] of grouped.entries()) {
    const { properties, classes } = data;

    // Skip empty blocks
    if (properties.length === 0 && classes.length === 0) {
      continue;
    }

    output += `${selector} {\n`;

    // Add custom properties first
    if (properties.length > 0) {
      for (const prop of properties) {
        output += `  ${prop};\n`;
      }
    }

    // Add nested classes with CSS nesting
    if (classes.length > 0) {
      if (properties.length > 0) {
        output += `\n`; // Separator between properties and classes
      }

      for (const cls of classes) {
        output += `  .${cls.className} {\n`;

        const propLines = cls.properties.split(';')
          .map(p => p.trim())
          .filter(p => p.length > 0);

        for (const prop of propLines) {
          output += `    ${prop};\n`;
        }

        output += `  }\n`;

        if (cls !== classes[classes.length - 1]) {
          output += `\n`; // Space between classes
        }
      }
    }

    output += `}\n\n`;
  }

  return output.trim();
}

/**
 * Detects the type of CSS content for section comments
 */
function detectContentType(selector) {
  if (selector === ':root') return 'primitives';
  if (selector.includes('data-theme')) return 'color-tokens';
  if (selector.includes('data-breakpoint')) return 'breakpoint-tokens';
  if (selector.includes('data-density')) return 'density-tokens';
  return 'other';
}

/**
 * Organizes CSS with section comments
 */
function organizeWithSections(grouped) {
  const sections = {
    primitives: [],
    colorLight: [],
    colorDark: [],
    breakpoints: [],
    density: [],
    other: []
  };

  for (const [selector, data] of grouped.entries()) {
    if (selector === ':root') {
      sections.primitives.push([selector, data]);
    } else if (selector.includes('data-theme="light"')) {
      sections.colorLight.push([selector, data]);
    } else if (selector.includes('data-theme="dark"')) {
      sections.colorDark.push([selector, data]);
    } else if (selector.includes('data-breakpoint')) {
      sections.breakpoints.push([selector, data]);
    } else if (selector.includes('data-density')) {
      sections.density.push([selector, data]);
    } else {
      sections.other.push([selector, data]);
    }
  }

  let output = '';

  // Shared Primitives
  if (sections.primitives.length > 0) {
    output += `/* === SHARED PRIMITIVES === */\n\n`;
    output += generateNestedCSS(new Map(sections.primitives)) + '\n\n';
  }

  // Color Tokens - Light
  if (sections.colorLight.length > 0) {
    output += `/* === COLOR TOKENS (LIGHT MODE) === */\n\n`;
    output += generateNestedCSS(new Map(sections.colorLight)) + '\n\n';
  }

  // Color Tokens - Dark
  if (sections.colorDark.length > 0) {
    output += `/* === COLOR TOKENS (DARK MODE) === */\n\n`;
    output += generateNestedCSS(new Map(sections.colorDark)) + '\n\n';
  }

  // Breakpoint Tokens
  if (sections.breakpoints.length > 0) {
    output += `/* === RESPONSIVE TOKENS & TYPOGRAPHY === */\n\n`;
    output += generateNestedCSS(new Map(sections.breakpoints)) + '\n\n';
  }

  // Density Tokens
  if (sections.density.length > 0) {
    output += `/* === DENSITY TOKENS === */\n\n`;
    output += generateNestedCSS(new Map(sections.density)) + '\n\n';
  }

  // Other (Components, Effects, etc.)
  if (sections.other.length > 0) {
    output += `/* === COMPONENT TOKENS & EFFECTS === */\n\n`;
    output += generateNestedCSS(new Map(sections.other)) + '\n\n';
  }

  return output.trim();
}

/**
 * Optimizes CSS bundle with nesting and structure
 */
function optimizeBundleCSS(css, brand, bundleType) {
  // Remove existing comments
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove excessive whitespace
  css = css.replace(/\n{3,}/g, '\n\n');
  css = css.trim();

  // Parse CSS into rules
  const rules = parseCSS(css);

  // Group rules for nesting
  const grouped = groupRulesForNesting(rules);

  // Organize with section comments
  const organized = organizeWithSections(grouped);

  // Add header
  const header = generateBundleHeader(brand, bundleType);

  return header + organized;
}

/**
 * Combines and optimizes multiple CSS files
 */
async function combineAndOptimize(files, brand, bundleType) {
  let combined = '';

  for (const file of files) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.trim()) {
        combined += content + '\n\n';
      }
    }
  }

  if (!combined.trim()) {
    return '';
  }

  return optimizeBundleCSS(combined, brand, bundleType);
}

/**
 * Ensures directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Build Quick Start Bundles (semantic + all components)
 */
async function buildQuickStartBundles() {
  console.log('\n📦 Building Quick Start Bundles:');

  const quickStartDir = path.join(BUNDLES_DIR, 'quick-start');
  ensureDir(quickStartDir);

  let totalBundles = 0;
  let successfulBundles = 0;

  for (const brand of BRANDS) {
    const brandCssDir = path.join(DIST_DIR, 'css', 'brands', brand);

    if (!fs.existsSync(brandCssDir)) {
      console.log(`  ⚠️  ${brand}: No CSS files found`);
      continue;
    }

    try {
      // Find all CSS files for this brand
      const files = await glob(`${brandCssDir}/**/*.css`);

      if (files.length === 0) {
        console.log(`  ⚠️  ${brand}: No CSS files to bundle`);
        continue;
      }

      // Combine and optimize files
      const bundleContent = await combineAndOptimize(files, brand, 'quick-start');

      // Write bundle
      const bundlePath = path.join(quickStartDir, `${brand}-all.css`);
      fs.writeFileSync(bundlePath, bundleContent);

      const sizeKB = (bundleContent.length / 1024).toFixed(2);
      console.log(`  ✅ ${brand}-all.css (${files.length} files, ${sizeKB} KB)`);

      totalBundles++;
      successfulBundles++;
    } catch (error) {
      console.error(`  ❌ ${brand}: ${error.message}`);
      totalBundles++;
    }
  }

  return { totalBundles, successfulBundles };
}

/**
 * Build Semantic Bundles (only semantic tokens, no components)
 */
async function buildSemanticBundles() {
  console.log('\n📦 Building Semantic Bundles:');

  const semanticDir = path.join(BUNDLES_DIR, 'semantic');
  ensureDir(semanticDir);

  let totalBundles = 0;
  let successfulBundles = 0;

  for (const brand of BRANDS) {
    const brandSemanticDir = path.join(DIST_DIR, 'css', 'brands', brand, 'semantic');

    if (!fs.existsSync(brandSemanticDir)) {
      console.log(`  ⚠️  ${brand}: No semantic files found`);
      continue;
    }

    try {
      // Find all semantic CSS files
      const files = await glob(`${brandSemanticDir}/**/*.css`);

      if (files.length === 0) {
        console.log(`  ⚠️  ${brand}: No semantic CSS files to bundle`);
        continue;
      }

      // Combine and optimize files
      const bundleContent = await combineAndOptimize(files, brand, 'semantic');

      // Write bundle
      const bundlePath = path.join(semanticDir, `${brand}-semantic.css`);
      fs.writeFileSync(bundlePath, bundleContent);

      const sizeKB = (bundleContent.length / 1024).toFixed(2);
      console.log(`  ✅ ${brand}-semantic.css (${files.length} files, ${sizeKB} KB)`);

      totalBundles++;
      successfulBundles++;
    } catch (error) {
      console.error(`  ❌ ${brand}: ${error.message}`);
      totalBundles++;
    }
  }

  return { totalBundles, successfulBundles };
}

/**
 * Build Component Bundles (individual components)
 */
async function buildComponentBundles() {
  console.log('\n📦 Building Component Bundles:');

  const componentsDir = path.join(BUNDLES_DIR, 'components');
  ensureDir(componentsDir);

  let totalBundles = 0;
  let successfulBundles = 0;

  for (const brand of BRANDS) {
    const brandComponentsDir = path.join(DIST_DIR, 'css', 'brands', brand, 'components');

    if (!fs.existsSync(brandComponentsDir)) {
      console.log(`  ⚠️  ${brand}: No components found`);
      continue;
    }

    // Get all component directories
    const componentNames = fs.readdirSync(brandComponentsDir).filter(name => {
      const componentPath = path.join(brandComponentsDir, name);
      return fs.statSync(componentPath).isDirectory();
    });

    console.log(`  🏷️  ${brand}: ${componentNames.length} components`);

    for (const componentName of componentNames) {
      try {
        const componentDir = path.join(brandComponentsDir, componentName);

        // Find all CSS files for this component
        const files = await glob(`${componentDir}/*.css`);

        if (files.length === 0) continue;

        // Combine and optimize files
        const bundleContent = await combineAndOptimize(files, brand, 'component');

        // Write bundle
        const bundlePath = path.join(componentsDir, `${brand}-${componentName.toLowerCase()}.css`);
        fs.writeFileSync(bundlePath, bundleContent);

        totalBundles++;
        successfulBundles++;
      } catch (error) {
        console.error(`     ❌ ${componentName}: ${error.message}`);
        totalBundles++;
      }
    }

    console.log(`     ✅ ${successfulBundles}/${totalBundles} component bundles created`);
  }

  return { totalBundles, successfulBundles };
}

/**
 * Main build function
 */
async function main() {
  console.log('\n🎨 ============================================');
  console.log('   CSS Bundle Builder (with CSS Nesting)');
  console.log('   ============================================\n');

  const startTime = Date.now();

  // Ensure bundles directory exists
  ensureDir(BUNDLES_DIR);

  const stats = {
    quickStart: await buildQuickStartBundles(),
    semantic: await buildSemanticBundles(),
    components: await buildComponentBundles()
  };

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Print summary
  console.log('\n✨ Bundle Build Complete!\n');
  console.log('📊 Statistics:');
  console.log(`   Quick Start: ${stats.quickStart.successfulBundles}/${stats.quickStart.totalBundles} bundles`);
  console.log(`   Semantic: ${stats.semantic.successfulBundles}/${stats.semantic.totalBundles} bundles`);
  console.log(`   Components: ${stats.components.successfulBundles}/${stats.components.totalBundles} bundles`);
  console.log(`   Duration: ${duration}s\n`);
  console.log(`📁 Output: ${BUNDLES_DIR}`);
  console.log(`✨ Features: CSS Nesting, Metadata Headers, Section Comments\n`);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Bundle build failed:', error);
    process.exit(1);
  });
}

module.exports = { main };
