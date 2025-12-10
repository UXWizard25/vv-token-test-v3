#!/usr/bin/env node

/**
 * Scan Component Token References
 *
 * Scans Stencil component CSS files to extract token references (CSS custom properties).
 * Used to determine which components are affected by token changes.
 *
 * Usage:
 *   node scripts/tokens/scan-component-refs.js [--components-dir <path>] [--output <path>]
 *
 * Example:
 *   node scripts/tokens/scan-component-refs.js --components-dir packages/components/src --output component-tokens.json
 */

const fs = require('fs');
const path = require('path');

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_COMPONENTS_DIR = path.join(__dirname, '../../packages/components/src');

// =============================================================================
// SCANNER FUNCTIONS
// =============================================================================

/**
 * Extract CSS custom property references from CSS content
 * Matches: var(--token-name) and var(--token-name, fallback)
 *
 * @param {string} cssContent - CSS file content
 * @returns {string[]} - Array of unique token names (e.g., ["--button-stack-space", "--font-weight-bold"])
 */
function extractVarReferences(cssContent) {
  const tokens = new Set();

  // Match var(--token-name) with optional fallback
  // Handles: var(--token), var(--token, fallback), var(--token, var(--other))
  const regex = /var\(\s*(--[a-z0-9-]+)/gi;
  let match;

  while ((match = regex.exec(cssContent)) !== null) {
    tokens.add(match[1].toLowerCase()); // Normalize to lowercase
  }

  return [...tokens].sort();
}

/**
 * Find all component CSS files in a directory
 * Pattern: ds-{name}/ds-{name}.css (Stencil component structure)
 *
 * @param {string} componentsDir - Path to components source directory
 * @returns {Array<{componentName: string, cssPath: string}>}
 */
function findComponentCSSFiles(componentsDir) {
  const components = [];

  if (!fs.existsSync(componentsDir)) {
    console.warn(`⚠️  Components directory not found: ${componentsDir}`);
    return components;
  }

  const entries = fs.readdirSync(componentsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!entry.name.startsWith('ds-')) continue; // Only ds-* components

    const componentDir = path.join(componentsDir, entry.name);
    const cssFileName = `${entry.name}.css`;
    const cssPath = path.join(componentDir, cssFileName);

    if (fs.existsSync(cssPath)) {
      components.push({
        componentName: entry.name,
        cssPath: cssPath
      });
    } else {
      // Also check for .scss files
      const scssPath = path.join(componentDir, `${entry.name}.scss`);
      if (fs.existsSync(scssPath)) {
        components.push({
          componentName: entry.name,
          cssPath: scssPath
        });
      }
    }
  }

  return components;
}

/**
 * Scan all component CSS files and build token reference map
 *
 * @param {string} componentsDir - Path to components source directory
 * @param {Object} options - { silent: boolean }
 * @returns {Object} - { componentName: { tokens: string[], file: string } }
 */
function scanComponentTokenReferences(componentsDir = DEFAULT_COMPONENTS_DIR, options = {}) {
  const { silent = false } = options;
  const log = silent ? () => {} : console.log.bind(console);

  const componentMap = {};
  const cssFiles = findComponentCSSFiles(componentsDir);

  log(`🔍 Scanning ${cssFiles.length} Stencil components in ${componentsDir}...\n`);

  for (const { componentName, cssPath } of cssFiles) {
    try {
      const cssContent = fs.readFileSync(cssPath, 'utf-8');
      const tokens = extractVarReferences(cssContent);

      componentMap[componentName] = {
        tokens: tokens,
        tokenCount: tokens.length,
        file: path.relative(componentsDir, cssPath)
      };

      log(`   ✅ ${componentName}: ${tokens.length} tokens`);
    } catch (error) {
      if (!silent) {
        console.warn(`   ⚠️  Error reading ${cssPath}: ${error.message}`);
      }
    }
  }

  // Calculate totals
  const totalComponents = Object.keys(componentMap).length;
  const totalTokenRefs = Object.values(componentMap).reduce((sum, c) => sum + c.tokenCount, 0);
  const uniqueTokens = new Set(Object.values(componentMap).flatMap(c => c.tokens));

  log(`\n📊 Summary:`);
  log(`   Components scanned: ${totalComponents}`);
  log(`   Total token references: ${totalTokenRefs}`);
  log(`   Unique tokens: ${uniqueTokens.size}`);

  return componentMap;
}

// =============================================================================
// NORMALIZATION FOR MATCHING
// =============================================================================

/**
 * Normalize a token name for cross-format comparison
 * Handles: CSS (--kebab-case), dot notation (token.name), camelCase (tokenName)
 *
 * @param {string} tokenName - Token name in any format
 * @returns {string} - Normalized lowercase alphanumeric string
 *
 * @example
 * normalizeTokenName("--button-primary-bg") → "buttonprimarybg"
 * normalizeTokenName("button.primary.bg") → "buttonprimarybg"
 * normalizeTokenName("buttonPrimaryBg") → "buttonprimarybg"
 */
function normalizeTokenName(tokenName) {
  if (!tokenName) return '';

  return tokenName
    .replace(/^--/, '')           // Remove CSS prefix
    .replace(/[.\-_]/g, '')       // Remove dots, hyphens, underscores
    .toLowerCase();               // Lowercase for comparison
}

// =============================================================================
// AFFECTED COMPONENTS DETECTION
// =============================================================================

/**
 * Find which Stencil components are affected by token changes
 *
 * @param {Object} diff - Diff object from compare-builds.js
 * @param {Object} componentMap - Component token map from scanComponentTokenReferences()
 * @returns {Object} - Affected components with breaking/visual changes
 */
function findAffectedComponents(diff, componentMap) {
  if (!diff || !componentMap) {
    return { components: {}, summary: { breaking: 0, visual: 0, total: 0 } };
  }

  // Collect breaking tokens (removed + renamed in consumption layer)
  const breakingTokens = new Map(); // normalized → { token, type, details }

  // From grouped data (preferred)
  const grouped = diff.grouped;
  if (grouped?.breaking) {
    // Removed variables
    for (const token of grouped.breaking.removed?.variables || []) {
      const name = token.displayName || token.canonicalName || '';
      const normalized = normalizeTokenName(name);
      if (normalized) {
        breakingTokens.set(normalized, {
          name: name,
          type: 'removed',
          details: token
        });
      }
    }

    // Renamed variables (old name is breaking)
    for (const rename of grouped.breaking.renamed?.variables || []) {
      const oldName = rename.oldTokenName || rename.oldName || '';
      // Prefer CSS format (newName) over dot notation (newTokenName)
      const newName = rename.newName || rename.newTokenName || '';
      const normalized = normalizeTokenName(oldName);
      if (normalized) {
        breakingTokens.set(normalized, {
          name: oldName,
          type: 'renamed',
          newName: newName,
          details: rename
        });
      }
    }

    // Removed typography/effects
    for (const style of grouped.breaking.removed?.typography || []) {
      const normalized = normalizeTokenName(style.name);
      if (normalized) {
        breakingTokens.set(normalized, { name: style.name, type: 'removed', details: style });
      }
    }
    for (const style of grouped.breaking.removed?.effects || []) {
      const normalized = normalizeTokenName(style.name);
      if (normalized) {
        breakingTokens.set(normalized, { name: style.name, type: 'removed', details: style });
      }
    }
  }

  // Fallback to byUniqueToken if grouped not available
  if (breakingTokens.size === 0 && diff.byUniqueToken?.removed) {
    for (const token of diff.byUniqueToken.removed) {
      if (['semantic', 'component'].includes(token.layer)) {
        const name = token.displayName || token.canonicalName || '';
        const normalized = normalizeTokenName(name);
        if (normalized) {
          breakingTokens.set(normalized, { name, type: 'removed', details: token });
        }
      }
    }
  }

  // Collect visual tokens (modified in consumption layer)
  const visualTokens = new Map(); // normalized → { token, category, details }

  if (grouped?.visual) {
    const visualCategories = ['colors', 'spacing', 'sizing'];
    for (const category of visualCategories) {
      for (const token of grouped.visual[category] || []) {
        const name = token.displayName || token.canonicalName || '';
        const normalized = normalizeTokenName(name);
        if (normalized) {
          visualTokens.set(normalized, {
            name: name,
            category: category,
            oldValue: token.oldValue,
            newValue: token.newValue,
            details: token
          });
        }
      }
    }

    // Typography variables
    for (const token of grouped.visual.typography?.variables || []) {
      const name = token.displayName || token.canonicalName || '';
      const normalized = normalizeTokenName(name);
      if (normalized) {
        visualTokens.set(normalized, {
          name: name,
          category: 'typography',
          oldValue: token.oldValue,
          newValue: token.newValue,
          details: token
        });
      }
    }

    // Effects variables
    for (const token of grouped.visual.effects?.variables || []) {
      const name = token.displayName || token.canonicalName || '';
      const normalized = normalizeTokenName(name);
      if (normalized) {
        visualTokens.set(normalized, {
          name: name,
          category: 'effects',
          oldValue: token.oldValue,
          newValue: token.newValue,
          details: token
        });
      }
    }
  }

  // Fallback to byUniqueToken if grouped not available
  if (visualTokens.size === 0 && diff.byUniqueToken?.modified) {
    for (const token of diff.byUniqueToken.modified) {
      if (['semantic', 'component'].includes(token.layer)) {
        const name = token.displayName || token.canonicalName || '';
        const normalized = normalizeTokenName(name);
        if (normalized) {
          visualTokens.set(normalized, {
            name,
            category: token.category || 'other',
            oldValue: token.oldValue,
            newValue: token.newValue,
            details: token
          });
        }
      }
    }
  }

  // Match against component token references
  const affectedComponents = {};

  for (const [componentName, componentData] of Object.entries(componentMap)) {
    const breaking = [];
    const visual = [];

    for (const cssToken of componentData.tokens) {
      const normalized = normalizeTokenName(cssToken);

      if (breakingTokens.has(normalized)) {
        const change = breakingTokens.get(normalized);
        breaking.push({
          cssToken: cssToken,
          type: change.type,
          name: change.name,
          newName: change.newName || null,
          details: change.details
        });
      }

      if (visualTokens.has(normalized)) {
        const change = visualTokens.get(normalized);
        visual.push({
          cssToken: cssToken,
          category: change.category,
          name: change.name,
          oldValue: change.oldValue,
          newValue: change.newValue,
          details: change.details
        });
      }
    }

    if (breaking.length > 0 || visual.length > 0) {
      affectedComponents[componentName] = {
        breaking: breaking,
        visual: visual,
        breakingCount: breaking.length,
        visualCount: visual.length,
        totalCount: breaking.length + visual.length
      };
    }
  }

  // Calculate summary
  const summary = {
    breaking: Object.values(affectedComponents).filter(c => c.breakingCount > 0).length,
    visual: Object.values(affectedComponents).filter(c => c.visualCount > 0 && c.breakingCount === 0).length,
    total: Object.keys(affectedComponents).length,
    breakingTokensCount: breakingTokens.size,
    visualTokensCount: visualTokens.size
  };

  return {
    components: affectedComponents,
    summary: summary
  };
}

// =============================================================================
// CLI
// =============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    componentsDir: DEFAULT_COMPONENTS_DIR,
    output: null,
    diffFile: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--components-dir' && args[i + 1]) {
      options.componentsDir = args[++i];
    } else if (args[i] === '--output' && args[i + 1]) {
      options.output = args[++i];
    } else if (args[i] === '--diff-file' && args[i + 1]) {
      options.diffFile = args[++i];
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Scan Component Token References

Usage:
  node scan-component-refs.js [options]

Options:
  --components-dir <path>  Path to Stencil components source (default: packages/components/src)
  --output <path>          Output JSON file for component token map
  --diff-file <path>       Diff JSON file to find affected components
  --help, -h               Show this help message

Examples:
  # Scan components and output to console
  node scan-component-refs.js

  # Scan and save to file
  node scan-component-refs.js --output component-tokens.json

  # Find affected components from diff
  node scan-component-refs.js --diff-file dist-diff.json
`);
      process.exit(0);
    }
  }

  return options;
}

function main() {
  const options = parseArgs();

  console.log('🔍 Stencil Component Token Scanner\n');
  console.log('════════════════════════════════════════════════════════════\n');

  // Scan component token references
  const componentMap = scanComponentTokenReferences(options.componentsDir);

  // If diff file provided, find affected components
  if (options.diffFile) {
    console.log(`\n🔍 Analyzing affected components from ${options.diffFile}...\n`);

    if (!fs.existsSync(options.diffFile)) {
      console.error(`❌ Diff file not found: ${options.diffFile}`);
      process.exit(1);
    }

    try {
      const diff = JSON.parse(fs.readFileSync(options.diffFile, 'utf-8'));
      const affected = findAffectedComponents(diff, componentMap);

      console.log('📊 Affected Components:\n');

      if (affected.summary.total === 0) {
        console.log('   ✅ No Stencil components affected by token changes');
      } else {
        for (const [name, data] of Object.entries(affected.components)) {
          const breakingIcon = data.breakingCount > 0 ? '🔴' : '';
          const visualIcon = data.visualCount > 0 ? '🟡' : '';
          console.log(`   ${breakingIcon}${visualIcon} ${name}: ${data.breakingCount} breaking, ${data.visualCount} visual`);

          for (const b of data.breaking) {
            console.log(`      🔴 ${b.cssToken} (${b.type}${b.newName ? ` → ${b.newName}` : ''})`);
          }
          for (const v of data.visual.slice(0, 3)) {
            console.log(`      🟡 ${v.cssToken} (${v.category})`);
          }
          if (data.visual.length > 3) {
            console.log(`      ... and ${data.visual.length - 3} more visual changes`);
          }
        }

        console.log(`\n📊 Summary: ${affected.summary.breaking} components with breaking changes, ${affected.summary.visual} with visual only`);
      }

      // Output combined result
      if (options.output) {
        const output = {
          componentMap: componentMap,
          affected: affected
        };
        fs.writeFileSync(options.output, JSON.stringify(output, null, 2));
        console.log(`\n📄 Results written to: ${options.output}`);
      }

    } catch (error) {
      console.error(`❌ Error processing diff file: ${error.message}`);
      process.exit(1);
    }
  } else {
    // Output component map only
    if (options.output) {
      fs.writeFileSync(options.output, JSON.stringify(componentMap, null, 2));
      console.log(`\n📄 Component token map written to: ${options.output}`);
    }
  }

  console.log('\n════════════════════════════════════════════════════════════\n');
}

// Run CLI if executed directly
if (require.main === module) {
  main();
}

// Export for use in other modules
module.exports = {
  scanComponentTokenReferences,
  findAffectedComponents,
  extractVarReferences,
  normalizeTokenName,
  findComponentCSSFiles,
  DEFAULT_COMPONENTS_DIR
};
