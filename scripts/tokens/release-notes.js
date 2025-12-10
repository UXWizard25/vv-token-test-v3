#!/usr/bin/env node

/**
 * Generate Release Notes - Platform-Specific Release Notes Generator
 *
 * Generates multi-layered release notes from dist comparison data.
 * Supports multiple output formats: PR comment, CHANGELOG, console.
 *
 * Usage:
 *   node scripts/tokens/release-notes.js --diff-file diff.json --format pr-comment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { toDotNotation, figmaPathToTokenName } = require('./compare-builds');

// =============================================================================
// CONSTANTS
// =============================================================================

const IMPACT_EMOJI = {
  breaking: '🔴',
  moderate: '🟡',
  minor: '🟢',
  none: '⚪'
};

const IMPACT_LABELS = {
  breaking: 'Breaking Change',
  moderate: 'Modified',
  minor: 'Added',
  none: 'No Changes'
};

const PLATFORM_ORDER = ['css', 'scss', 'js', 'swift', 'kotlin', 'json'];

const CATEGORY_CONFIG = {
  colors: { icon: '🎨', label: 'Colors' },
  typography: { icon: '📝', label: 'Typography' },
  spacing: { icon: '📏', label: 'Spacing' },
  sizing: { icon: '📐', label: 'Sizing' },
  effects: { icon: '✨', label: 'Effects' },
  other: { icon: '📦', label: 'Other' }
};

const CATEGORY_ORDER = ['colors', 'typography', 'spacing', 'sizing', 'effects', 'other'];

const LAYER_CONFIG = {
  primitive: { icon: '⚙️', label: 'Primitives' },
  semantic: { icon: '🎯', label: 'Semantic' },
  component: { icon: '🧩', label: 'Components' }
};

// Consumption layers are the ones consumers directly use (semantic + component)
const CONSUMPTION_LAYERS = ['semantic', 'component'];

const DIST_DIR = path.join(__dirname, '../../packages/tokens/dist');

// =============================================================================
// TOKEN NAME UTILITIES
// =============================================================================

/**
 * Get the display name for a token in release notes
 * Prefers canonicalName (dot notation) for platform-agnostic display,
 * falls back to displayName (CSS format) for backwards compatibility.
 *
 * @param {Object} token - Token object with canonicalName and/or displayName
 * @returns {string} - The name to display
 */
function getTokenName(token) {
  if (!token) return '';
  // Prefer canonical dot notation, fallback to CSS displayName
  return token.canonicalName || token.displayName || token.name || token.oldName || '';
}

/**
 * Get the old token name from a rename object
 * Prefers pre-computed oldTokenName, falls back to figmaPathToTokenName
 */
function getOldTokenName(rename) {
  if (!rename) return '';
  return rename.oldTokenName || figmaPathToTokenName(rename.oldName) || '';
}

/**
 * Get the new token name from a rename object
 * Prefers pre-computed newTokenName, falls back to figmaPathToTokenName
 */
function getNewTokenName(rename) {
  if (!rename) return '';
  return rename.newTokenName || figmaPathToTokenName(rename.newName) || '';
}

// =============================================================================
// PLATFORM NAME TRANSFORMS
// =============================================================================

/**
 * Convert canonical dot notation to kebab-case (CSS/SCSS)
 * Matches style-dictionary.config.js nameTransformers.kebab
 *
 * @example
 * toKebabCase('button.primary.bg') → 'button-primary-bg'
 * toKebabCase('space.1.x') → 'space-1-x'
 */
function toKebabCase(dotNotation) {
  if (!dotNotation) return '';
  return dotNotation
    .replace(/\./g, '-')           // dots to hyphens
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')  // camelCase splits
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')     // letter→number: red50 → red-50
    .replace(/(\d)([a-zA-Z])/g, '$1-$2')     // number→letter: 1x → 1-x
    .toLowerCase()
    .replace(/-+/g, '-')           // collapse multiple hyphens
    .replace(/^-|-$/g, '');        // trim leading/trailing hyphens
}

/**
 * Convert canonical dot notation to camelCase (JS/JSON/Swift/Kotlin)
 * Matches style-dictionary.config.js nameTransformers.camel
 *
 * @example
 * toCamelCase('button.primary.bg') → 'buttonPrimaryBg'
 * toCamelCase('space.1.x') → 'space1x'
 */
function toCamelCasePlatform(dotNotation) {
  if (!dotNotation) return '';
  // First convert to kebab, then to camel (matches build system flow)
  const kebab = toKebabCase(dotNotation);
  // Keep letters after numbers lowercase (e.g., 1-x → 1x, not 1X)
  let result = kebab.replace(/(\d)-([a-z])/g, '$1$2');
  // Uppercase letters after hyphens (standard camelCase)
  result = result.replace(/-([a-z0-9])/g, (_, letter) => letter.toUpperCase());
  // Prefix with underscore if starts with a number (invalid JS identifier)
  if (/^[0-9]/.test(result)) {
    result = '_' + result;
  }
  return result;
}

// =============================================================================
// ALIAS DETECTION UTILITIES
// =============================================================================

/**
 * Check if a value is a CSS variable reference (alias)
 * Examples: "var(--text-color-primary)", "var(--color-neutral-100, #FFFFFF)"
 */
function isAliasValue(value) {
  if (!value || typeof value !== 'string') return false;
  return value.trim().startsWith('var(--');
}

/**
 * Check if a token change is an alias change (references another token)
 * An alias change is when both old and new values are CSS variable references
 */
function isAliasChange(token) {
  if (!token) return false;
  return isAliasValue(token.oldValue) && isAliasValue(token.newValue);
}

/**
 * Split modified tokens into alias changes and value changes
 */
function splitByChangeType(modifiedTokens) {
  const aliasChanges = [];
  const valueChanges = [];

  for (const token of modifiedTokens) {
    if (isAliasChange(token)) {
      aliasChanges.push(token);
    } else {
      valueChanges.push(token);
    }
  }

  return { aliasChanges, valueChanges };
}

// =============================================================================
// VISUAL DIFF UTILITIES
// =============================================================================

/**
 * Parse hex color to RGB
 */
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length !== 6) return null;
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Convert RGB to LAB color space (for Delta E calculation)
 */
function rgbToLab(rgb) {
  if (!rgb) return null;

  // RGB to XYZ
  let r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  // XYZ to LAB
  const fx = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
  const fy = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
  const fz = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

  return {
    L: (116 * fy) - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz)
  };
}

/**
 * Calculate Delta E (CIE76) between two colors
 * Returns: { deltaE, perception }
 * Perception levels:
 * - < 1: Not perceptible
 * - 1-2: Perceptible through close observation
 * - 2-10: Perceptible at a glance
 * - 11-49: Colors are more similar than opposite
 * - 100: Colors are exact opposite
 */
function calculateDeltaE(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return null;

  const lab1 = rgbToLab(rgb1);
  const lab2 = rgbToLab(rgb2);
  if (!lab1 || !lab2) return null;

  const deltaE = Math.sqrt(
    Math.pow(lab2.L - lab1.L, 2) +
    Math.pow(lab2.a - lab1.a, 2) +
    Math.pow(lab2.b - lab1.b, 2)
  );

  let perception, icon;
  if (deltaE < 1) {
    perception = 'nicht sichtbar';
    icon = '⚪';
  } else if (deltaE < 2) {
    perception = 'kaum sichtbar';
    icon = '🟢';
  } else if (deltaE < 5) {
    perception = 'subtil';
    icon = '🟡';
  } else if (deltaE < 10) {
    perception = 'deutlich';
    icon = '🟠';
  } else {
    perception = 'stark';
    icon = '🔴';
  }

  return { deltaE: Math.round(deltaE * 10) / 10, perception, icon };
}

/**
 * Calculate percentage change for dimensions
 */
function calculateDimensionDiff(oldValue, newValue) {
  // Extract numeric values
  const oldNum = parseFloat(oldValue);
  const newNum = parseFloat(newValue);

  if (isNaN(oldNum) || isNaN(newNum) || oldNum === 0) return null;

  const percentChange = ((newNum - oldNum) / oldNum) * 100;
  const rounded = Math.round(percentChange);

  let icon;
  const absChange = Math.abs(rounded);
  if (absChange === 0) {
    icon = '⚪';
  } else if (absChange <= 10) {
    icon = '🟢';
  } else if (absChange <= 25) {
    icon = '🟡';
  } else if (absChange <= 50) {
    icon = '🟠';
  } else {
    icon = '🔴';
  }

  const sign = rounded > 0 ? '+' : '';
  return { percent: rounded, display: `${sign}${rounded}%`, icon };
}

// =============================================================================
// UTILITIES
// =============================================================================

function exec(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    return '';
  }
}

function truncate(str, maxLength) {
  if (!str) return '';
  str = String(str);
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Format value change for display - handles simple and combined tokens
 */
function formatValueChange(oldValue, newValue) {
  // Simple values (colors, numbers, short strings)
  if (oldValue.length <= 20 && newValue.length <= 20) {
    return `\`${oldValue}\` → \`${newValue}\``;
  }

  // Combined tokens (typography, effects) - try to find what changed
  const isCombined = oldValue.includes(';') || oldValue.includes('{') || oldValue.includes(',');

  if (isCombined) {
    // Extract key differences
    const oldParts = extractKeyValues(oldValue);
    const newParts = extractKeyValues(newValue);

    const changes = [];
    for (const [key, newVal] of Object.entries(newParts)) {
      const oldVal = oldParts[key];
      if (oldVal && oldVal !== newVal) {
        // Show only the changed property
        changes.push(`${key}: \`${oldVal}\` → \`${newVal}\``);
      }
    }

    if (changes.length > 0 && changes.length <= 3) {
      return changes.join(', ');
    }
  }

  // Fallback: show truncated old → new
  return `\`${truncate(oldValue, 35)}\` → \`${truncate(newValue, 35)}\``;
}

/**
 * Extract key-value pairs from combined token values
 */
function extractKeyValues(value) {
  const result = {};

  // CSS-style: "font-size: 40px; line-height: 40px;"
  const cssMatches = value.matchAll(/([\w-]+):\s*([^;,}]+)/g);
  for (const match of cssMatches) {
    const key = match[1].trim();
    const val = match[2].trim().replace(/["']/g, '');
    result[key] = val;
  }

  return result;
}

function loadDiffFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    console.error(`Error parsing diff file: ${e.message}`);
    return null;
  }
}

function tableRow(...cells) {
  return `| ${cells.join(' | ')} |`;
}

/**
 * Get platform names grouped by token for horizontal table display
 * Returns array of { displayName, platforms: { css, scss, js, swift, kotlin, json } }
 */
function getPlatformNamesGroupedByToken(tokens) {
  const results = [];
  const seen = new Set();

  for (const token of tokens) {
    // Skip if we've already processed this token
    if (seen.has(token.normalizedName)) continue;
    seen.add(token.normalizedName);

    // Get unique platforms for this token
    const uniquePlatforms = [...new Map(token.platforms.map(p => [p.key, p])).values()];

    // Only include if token has multiple platforms
    if (uniquePlatforms.length <= 1) continue;

    // Build platform map
    const platformMap = {};
    for (const p of uniquePlatforms) {
      platformMap[p.key] = p.tokenName;
    }

    results.push({
      displayName: token.displayName,
      canonicalName: token.canonicalName,
      platforms: platformMap
    });
  }

  return results;
}

/**
 * Generate horizontal platform names table
 * Grouped by naming convention:
 * - CSS/SCSS: --kebab-case
 * - JS/JSON/Swift/Kotlin: camelCase
 */
function generatePlatformNamesTable(groupedTokens) {
  if (groupedTokens.length === 0) return '';

  let md = '\n<details>\n<summary>Platform-specific names</summary>\n\n';
  md += '| Token | CSS / SCSS | JS / JSON / Swift / Kotlin |\n';
  md += '|-------|------------|----------------------------|\n';

  for (const entry of groupedTokens) {
    const p = entry.platforms;
    // Use CSS for kebab group, JS for camel group (fallback chain)
    const cssName = p.css || p.scss || '-';
    const jsName = p.js || p.json || p.swift || p.kotlin || '-';
    md += `| \`${entry.canonicalName || entry.displayName}\` `;
    md += `| \`${cssName}\` `;
    md += `| \`${jsName}\` |\n`;
  }

  md += '</details>\n';
  return md;
}

// =============================================================================
// LAYER 1: EXECUTIVE SUMMARY
// =============================================================================

/**
 * Generate a preview string showing first few token names
 */
function generatePreview(tokens, max = 2) {
  if (!tokens || tokens.length === 0) return '';
  const names = tokens.slice(0, max).map(t => `\`${getTokenName(t)}\``);
  if (tokens.length > max) {
    return names.join(', ') + `, ...`;
  }
  return names.join(', ');
}

/**
 * Generate type breakdown string (e.g., "Tokens (5), Typography (2)")
 */
function generateTypeBreakdown(counts) {
  const parts = [];
  if (counts.variables > 0) parts.push(`Tokens (${counts.variables})`);
  if (counts.typography > 0) parts.push(`Typography (${counts.typography})`);
  if (counts.effects > 0) parts.push(`Effects (${counts.effects})`);
  return parts.join(', ') || '–';
}

/**
 * Generate category breakdown string for visual changes
 */
function generateCategoryBreakdown(grouped) {
  const parts = [];
  if (grouped.visual.colors.length > 0) parts.push(`Colors (${grouped.visual.colors.length})`);
  if (grouped.visual.spacing.length > 0) parts.push(`Spacing (${grouped.visual.spacing.length})`);
  if (grouped.visual.sizing.length > 0) parts.push(`Sizing (${grouped.visual.sizing.length})`);
  const typoCount = grouped.visual.typography.variables.length + grouped.visual.typography.styles.length;
  if (typoCount > 0) parts.push(`Typography (${typoCount})`);
  const effectsCount = grouped.visual.effects.variables.length + grouped.visual.effects.styles.length;
  if (effectsCount > 0) parts.push(`Effects (${effectsCount})`);
  return parts.join(', ') || '–';
}

function generateExecutiveSummary(diff, options = {}) {
  const { commitSha = '', buildSuccess = true, successfulBuilds = 0, totalBuilds = 0, noBaseline = false } = options;

  if (!diff || !diff.summary) {
    return `## ⚪ Token Update

**Status**: ${buildSuccess ? '✅ Build Successful' : '❌ Build Failed'} (${successfulBuilds}/${totalBuilds})
${commitSha ? `**Commit**: \`${commitSha}\`` : ''}

> ℹ️ No changes detected or diff data unavailable.

---
`;
  }

  const { summary } = diff;
  const impactEmoji = IMPACT_EMOJI[summary.impactLevel] || '⚪';

  let md = `## ${impactEmoji} Token Update\n\n`;

  // Use pre-grouped results if available, otherwise fall back to old logic
  const grouped = diff.grouped;

  if (grouped) {
    // New optimized summary using pre-grouped data
    const { counts } = grouped;
    const hasChanges = counts.breakingRemoved > 0 || counts.breakingRenamed > 0 ||
                       counts.visualModified > 0 || counts.safeAdded > 0 || counts.internalChanges > 0;

    if (hasChanges) {
      md += '### 📊 Summary\n\n';
      md += '| Impact | Type | Count | Preview |\n';
      md += '|--------|------|------:|--------|\n';

      // Breaking: Removed
      if (counts.breakingRemoved > 0) {
        const removedCounts = {
          variables: grouped.breaking.removed.variables.length,
          typography: grouped.breaking.removed.typography.length,
          effects: grouped.breaking.removed.effects.length
        };
        const allRemoved = [
          ...grouped.breaking.removed.variables,
          ...grouped.breaking.removed.typography,
          ...grouped.breaking.removed.effects
        ];
        md += `| 🔴 Breaking | Removed | ${counts.breakingRemoved} | ${generatePreview(allRemoved)} |\n`;
      }

      // Breaking: Renamed
      if (counts.breakingRenamed > 0) {
        const renamedCounts = {
          variables: grouped.breaking.renamed.variables.length,
          typography: grouped.breaking.renamed.typography.length,
          effects: grouped.breaking.renamed.effects.length
        };
        md += `| 🔴 Breaking | Renamed | ${counts.breakingRenamed} | ${generateTypeBreakdown(renamedCounts)} |\n`;
      }

      // Visual: Modified
      if (counts.visualModified > 0) {
        md += `| 🟡 Visual | Modified | ${counts.visualModified} | ${generateCategoryBreakdown(grouped)} |\n`;
      }

      // Safe: Added
      if (counts.safeAdded > 0) {
        const addedCounts = {
          variables: grouped.safe.added.variables.length,
          typography: grouped.safe.added.typography.length,
          effects: grouped.safe.added.effects.length
        };
        md += `| 🟢 Safe | Added | ${counts.safeAdded} | ${generateTypeBreakdown(addedCounts)} |\n`;
      }

      // Internal: Cleanup
      if (counts.internalChanges > 0) {
        md += `| ⚙️ Internal | Cleanup | ${counts.internalChanges} | Primitive layer only |\n`;
      }

      md += '\n';

      // Overall risk indicator
      if (counts.breakingRemoved > 0 || counts.breakingRenamed > 0) {
        md += '**Overall Risk:** 🔴 Breaking Changes Detected\n\n';
      } else if (counts.visualModified > 0) {
        md += '**Overall Risk:** 🟡 Visual Changes\n\n';
      } else {
        md += '**Overall Risk:** 🟢 Safe (Additions Only)\n\n';
      }
    } else {
      md += '⚪ **No token changes detected**\n\n';
    }
  } else {
    // Fallback to old logic if grouped is not available
    const uniqueModified = summary.uniqueTokensModified ?? summary.tokensModified ?? 0;
    const uniqueAdded = summary.uniqueTokensAdded ?? summary.tokensAdded ?? 0;
    const uniqueRemoved = summary.uniqueTokensRemoved ?? summary.tokensRemoved ?? 0;
    const hasChanges = uniqueAdded > 0 || uniqueModified > 0 || uniqueRemoved > 0;

    if (hasChanges) {
      md += '### 📊 Summary\n\n';
      md += '| Type | Count |\n';
      md += '|------|------:|\n';
      if (uniqueRemoved > 0) md += `| 🔴 Removed | ${uniqueRemoved} |\n`;
      if (uniqueModified > 0) md += `| 🟡 Modified | ${uniqueModified} |\n`;
      if (uniqueAdded > 0) md += `| 🟢 Added | ${uniqueAdded} |\n`;
      md += '\n';
    } else {
      md += '⚪ **No token changes detected**\n\n';
    }
  }

  // Warning if no baseline available
  if (noBaseline) {
    md += '> ⚠️ **Hinweis:** Keine Baseline in `main` gefunden. Alle Tokens werden als "Added" angezeigt.\n';
    md += '> Dies kann passieren bei:\n';
    md += '> - Erstem PR (noch keine Tokens in main)\n';
    md += '> - Source-Datei wurde in main gelöscht\n\n';
  }

  // Build status line
  const statusParts = [];
  if (totalBuilds > 0) {
    statusParts.push(`**Build:** ${buildSuccess ? '✅' : '❌'} ${successfulBuilds}/${totalBuilds}`);
  }

  // Affected brands
  const brands = Object.keys(diff.byBrand || {});
  if (brands.length > 0) {
    statusParts.push(`**Brands:** ${brands.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join(', ')}`);
  }

  if (statusParts.length > 0) {
    md += statusParts.join(' · ') + '\n';
  }

  if (commitSha) {
    md += `**Commit:** \`${commitSha}\`\n`;
  }

  md += '\n---\n\n';

  return md;
}

// =============================================================================
// LAYER 2: UNIFIED TOKEN CHANGES
// =============================================================================

/**
 * Generate unified token changes - each token shown once with all affected platforms
 */
function generateUnifiedTokenChanges(diff, options = {}) {
  if (!diff || !diff.byUniqueToken) return '';

  const { maxTokensPerSection = 15 } = options;
  const { added, modified, removed } = diff.byUniqueToken;

  // Check if there are any changes
  if (added.length === 0 && modified.length === 0 && removed.length === 0) {
    return '';
  }

  let md = '## 📝 Token Changes\n\n';

  // Breaking changes (removed)
  if (removed.length > 0) {
    md += `### 🔴 Removed (${removed.length})\n\n`;
    md += '| Token | Value |\n';
    md += '|-------|-------|\n';

    const displayTokens = removed.slice(0, maxTokensPerSection);
    for (const token of displayTokens) {
      md += `| \`${getTokenName(token)}\` | \`${token.value}\` |\n`;
    }

    if (removed.length > maxTokensPerSection) {
      md += `| ... | *${removed.length - maxTokensPerSection} more* |\n`;
    }

    // Platform-specific names (collapsible) - horizontal table
    const groupedTokens = getPlatformNamesGroupedByToken(displayTokens);
    md += generatePlatformNamesTable(groupedTokens);

    md += '\n';
  }

  // Modified tokens - split by change type
  if (modified.length > 0) {
    const { aliasChanges, valueChanges } = splitByChangeType(modified);

    // Value changes (actual color/dimension changes)
    if (valueChanges.length > 0) {
      md += `### 🟡 Value Changes (${valueChanges.length})\n\n`;
      md += '> Actual token values have changed.\n\n';
      md += '| Token | Change |\n';
      md += '|-------|--------|\n';

      const displayTokens = valueChanges.slice(0, maxTokensPerSection);
      for (const token of displayTokens) {
        const changeDisplay = formatValueChange(token.oldValue, token.newValue);
        md += `| \`${getTokenName(token)}\` | ${changeDisplay} |\n`;
      }

      if (valueChanges.length > maxTokensPerSection) {
        md += `| ... | *${valueChanges.length - maxTokensPerSection} more* |\n`;
      }

      md += '\n';
    }

    // Alias changes (reference changes)
    if (aliasChanges.length > 0) {
      md += `### 🔗 Alias Changes (${aliasChanges.length})\n\n`;
      md += '> Tokens now reference different semantic tokens.\n\n';
      md += '| Token | Change |\n';
      md += '|-------|--------|\n';

      const displayTokens = aliasChanges.slice(0, maxTokensPerSection);
      for (const token of displayTokens) {
        const changeDisplay = formatValueChange(token.oldValue, token.newValue);
        md += `| \`${getTokenName(token)}\` | ${changeDisplay} |\n`;
      }

      if (aliasChanges.length > maxTokensPerSection) {
        md += `| ... | *${aliasChanges.length - maxTokensPerSection} more* |\n`;
      }

      md += '\n';
    }

    // Platform-specific names (collapsible) - horizontal table
    const groupedTokens = getPlatformNamesGroupedByToken(modified.slice(0, maxTokensPerSection));
    md += generatePlatformNamesTable(groupedTokens);

    md += '\n';
  }

  // Added tokens
  if (added.length > 0) {
    md += `### 🟢 Added (${added.length})\n\n`;
    md += '> ℹ️ Values may vary by brand/mode.\n\n';
    md += '| Token | Value |\n';
    md += '|-------|-------|\n';

    const displayTokens = added.slice(0, maxTokensPerSection);
    for (const token of displayTokens) {
      md += `| \`${getTokenName(token)}\` | \`${token.value}\` |\n`;
    }

    if (added.length > maxTokensPerSection) {
      md += `| ... | *${added.length - maxTokensPerSection} more* |\n`;
    }

    // Platform-specific names (collapsible) - horizontal table
    const groupedTokens = getPlatformNamesGroupedByToken(displayTokens);
    md += generatePlatformNamesTable(groupedTokens);

    md += '\n';
  }

  md += '---\n\n';

  return md;
}

// =============================================================================
// LAYER 2b: BREAKING CHANGES (Removed + Renamed)
// =============================================================================

/**
 * Generate platform names table for renamed tokens (collapsible)
 * Grouped by naming convention:
 * - CSS/SCSS: --kebab-case
 * - JS/JSON/Swift/Kotlin: camelCase
 */
function generateRenamePlatformTable(renames, diff) {
  if (!renames || renames.length === 0) return '';

  // Use platform info from rename objects if available
  const platformNames = [];
  for (const rename of renames) {
    // If rename has platforms array, use it directly
    if (rename.platforms && rename.platforms.length > 1) {
      const p = {};
      for (const platform of rename.platforms) {
        // Use newName from platform-specific rename info
        p[platform.key] = platform.newName || platform.tokenName;
      }
      platformNames.push({
        oldName: rename.oldName,
        newName: rename.newName,
        platforms: p
      });
    }
  }

  if (platformNames.length === 0) return '';

  let md = '\n<details>\n<summary>🔤 Platform-specific names</summary>\n\n';
  md += '| Old Name | New Name | CSS / SCSS | JS / JSON / Swift / Kotlin |\n';
  md += '|----------|----------|------------|----------------------------|\n';

  for (const entry of platformNames) {
    const p = entry.platforms;
    // Use CSS for kebab group, JS for camel group (fallback chain)
    const cssName = p.css || p.scss || '-';
    const jsName = p.js || p.json || p.swift || p.kotlin || '-';
    md += `| \`${entry.oldName}\` `;
    md += `| \`${entry.newName}\` `;
    md += `| \`${cssName}\` `;
    md += `| \`${jsName}\` |\n`;
  }

  md += '\n</details>\n';
  return md;
}

/**
 * Generate Breaking Changes section
 * Uses pre-grouped data from compare-builds.js for efficiency
 * Breaking = Removed OR Renamed in consumption layer (semantic + component)
 *
 * Optimized structure:
 * - Removed: Variables + Typography + Effects (no value column - tokens have multiple values)
 * - Renamed: Variables + Typography + Effects with migration help
 */
function generateBreakingChangesSection(diff, options = {}) {
  const grouped = diff?.grouped;

  // Use pre-grouped data if available
  if (grouped) {
    const { breaking } = grouped;
    const totalRemoved = breaking.removed.variables.length +
                         breaking.removed.typography.length +
                         breaking.removed.effects.length;
    const totalRenamed = breaking.renamed.variables.length +
                         breaking.renamed.typography.length +
                         breaking.renamed.effects.length;

    if (totalRemoved === 0 && totalRenamed === 0) return '';

    let md = '## 🔴 Breaking Changes\n\n';

    // === REMOVED SECTION ===
    if (totalRemoved > 0) {
      // Count by type for header
      const typeCounts = [];
      if (breaking.removed.variables.length > 0) typeCounts.push(`${breaking.removed.variables.length} Tokens`);
      if (breaking.removed.typography.length > 0) typeCounts.push(`${breaking.removed.typography.length} Typography`);
      if (breaking.removed.effects.length > 0) typeCounts.push(`${breaking.removed.effects.length} Effects`);

      md += `### Removed (${typeCounts.join(', ')})\n\n`;
      md += '| Token | Layer | Category |\n';
      md += '|-------|-------|----------|\n';

      // Variables
      for (const token of breaking.removed.variables) {
        const layer = LAYER_CONFIG[token.layer] || LAYER_CONFIG.semantic;
        const cat = CATEGORY_CONFIG[token.category] || CATEGORY_CONFIG.other;
        md += `| \`${getTokenName(token)}\` | ${layer.icon} ${layer.label} | ${cat.icon} ${cat.label} |\n`;
      }

      // Typography styles
      for (const style of breaking.removed.typography) {
        md += `| \`${style.name}\` | 🎯 Semantic | 📝 Typography |\n`;
      }

      // Effect styles
      for (const style of breaking.removed.effects) {
        md += `| \`${style.name}\` | 🎯 Semantic | ✨ Effects |\n`;
      }

      md += '\n';
    }

    // === RENAMED SECTION ===
    if (totalRenamed > 0) {
      // Count by type for header
      const typeCounts = [];
      if (breaking.renamed.variables.length > 0) typeCounts.push(`${breaking.renamed.variables.length} Tokens`);
      if (breaking.renamed.typography.length > 0) typeCounts.push(`${breaking.renamed.typography.length} Typography`);
      if (breaking.renamed.effects.length > 0) typeCounts.push(`${breaking.renamed.effects.length} Effects`);

      md += `### Renamed (${typeCounts.join(', ')})\n\n`;
      md += '| Old Name | → | New Name | Type |\n';
      md += '|----------|:-:|----------|------|\n';

      // Tokens (Variables)
      for (const rename of breaking.renamed.variables) {
        md += `| \`${getOldTokenName(rename)}\` | → | \`${getNewTokenName(rename)}\` | 🎨 Token |\n`;
      }

      // Typography styles (Combined Tokens)
      for (const rename of breaking.renamed.typography) {
        md += `| \`${getOldTokenName(rename)}\` | → | \`${getNewTokenName(rename)}\` | 📝 Combined |\n`;
      }

      // Effect styles (Combined Tokens)
      for (const rename of breaking.renamed.effects) {
        md += `| \`${getOldTokenName(rename)}\` | → | \`${getNewTokenName(rename)}\` | ✨ Combined |\n`;
      }

      md += '\n';

      // Migration Matrix - platform-specific token names
      const allRenames = [
        ...breaking.renamed.variables,
        ...breaking.renamed.typography,
        ...breaking.renamed.effects
      ];

      md += '<details>\n<summary>📋 Migration Guide (Platform-Specific Names)</summary>\n\n';

      // Platform groups with same naming conventions:
      // - CSS/SCSS: --kebab-case
      // - JS/JSON/Swift/Kotlin: camelCase
      md += '| | CSS / SCSS | JS / JSON / Swift / Kotlin |\n';
      md += '|---|---|---|\n';

      for (const rename of allRenames.slice(0, 20)) {
        const oldToken = getOldTokenName(rename);
        const newToken = getNewTokenName(rename);
        // Convert canonical dot notation to platform-specific formats
        const cssOld = `--${toKebabCase(oldToken)}`;
        const cssNew = `--${toKebabCase(newToken)}`;
        const jsOld = toCamelCasePlatform(oldToken);
        const jsNew = toCamelCasePlatform(newToken);

        md += `| **Old** | \`${cssOld}\` | \`${jsOld}\` |\n`;
        md += `| **New** | \`${cssNew}\` | \`${jsNew}\` |\n`;
        md += `| | | |\n`;
      }

      if (allRenames.length > 20) {
        md += `| | *...${allRenames.length - 20} more* | |\n`;
      }

      md += '\n</details>\n\n';
    }

    md += '---\n\n';
    return md;
  }

  // Fallback to old logic if grouped is not available
  const allRemovedTokens = diff?.byUniqueToken?.removed || [];
  const breakingRemovedTokens = allRemovedTokens.filter(t => CONSUMPTION_LAYERS.includes(t.layer));
  const variableRenames = diff?.renames || [];
  const breakingVariableRenames = variableRenames.filter(r => CONSUMPTION_LAYERS.includes(r.layer));

  if (breakingRemovedTokens.length === 0 && breakingVariableRenames.length === 0) return '';

  let md = '## 🔴 Breaking Changes\n\n';

  if (breakingRemovedTokens.length > 0) {
    md += `### Removed (${breakingRemovedTokens.length})\n\n`;
    md += '| Token | Layer | Category |\n';
    md += '|-------|-------|----------|\n';
    for (const token of breakingRemovedTokens) {
      const layer = LAYER_CONFIG[token.layer] || LAYER_CONFIG.semantic;
      const cat = CATEGORY_CONFIG[token.category] || CATEGORY_CONFIG.other;
      md += `| \`${getTokenName(token)}\` | ${layer.icon} ${layer.label} | ${cat.icon} ${cat.label} |\n`;
    }
    md += '\n';
  }

  if (breakingVariableRenames.length > 0) {
    md += `### Renamed (${breakingVariableRenames.length})\n\n`;
    md += '| Old Name | → | New Name |\n';
    md += '|----------|:-:|----------|\n';
    for (const rename of breakingVariableRenames) {
      md += `| \`${getOldTokenName(rename)}\` | → | \`${getNewTokenName(rename)}\` |\n`;
    }
    md += '\n';
  }

  md += '---\n\n';
  return md;
}

// =============================================================================
// LAYER 3: VISUAL CHANGES (Modified Tokens with Diff Metrics)
// =============================================================================

// Known brands and modes for matrix display
const KNOWN_BRANDS = ['bild', 'sportbild', 'advertorial'];
const KNOWN_MODES = ['light', 'dark'];
const KNOWN_BREAKPOINTS = ['xs', 'sm', 'md', 'lg'];

/**
 * Format a color change with inline delta
 * Output: `#232629`→`#1a1c1e` · Δ 4.9 🟡
 */
function formatColorChangeInline(oldVal, newVal) {
  const deltaE = calculateDeltaE(oldVal, newVal);
  const deltaStr = deltaE ? ` · Δ ${deltaE.deltaE} ${deltaE.icon}` : '';
  return `\`${oldVal}\`→\`${newVal}\`${deltaStr}`;
}

/**
 * Format a dimension change with inline delta
 * Output: `8px`→`12px` · +50% 🟠
 */
function formatDimensionChangeInline(oldVal, newVal) {
  const dimDiff = calculateDimensionDiff(oldVal, newVal);
  const diffStr = dimDiff ? ` · ${dimDiff.display} ${dimDiff.icon}` : '';
  return `\`${oldVal}\`→\`${newVal}\`${diffStr}`;
}

/**
 * Generate a color matrix table for a single token
 * Shows actual values with inline delta (no separate summary line)
 * Rows: modes (light/dark), Columns: brands
 */
function generateColorMatrix(token) {
  const contexts = token.valuesByContext || {};
  const contextKeys = Object.keys(contexts);
  if (contextKeys.length <= 1) return null;

  // Determine which brands and modes are present
  const brands = new Set();
  const modes = new Set();
  for (const key of contextKeys) {
    const ctx = contexts[key];
    if (ctx.brand) brands.add(ctx.brand);
    if (ctx.mode) modes.add(ctx.mode);
  }

  // Need at least 2 contexts for a matrix
  if (brands.size === 0 && modes.size <= 1) return null;

  const brandList = KNOWN_BRANDS.filter(b => brands.has(b));
  const modeList = KNOWN_MODES.filter(m => modes.has(m));

  // If we only have modes (no brand differentiation)
  if (brandList.length === 0 && modeList.length > 1) {
    let md = `**\`${getTokenName(token)}\`**\n\n`;
    md += '| Mode | Change |\n';
    md += '|------|--------|\n';

    for (const mode of modeList) {
      const ctx = contexts[mode] || contexts[`/${mode}`];
      if (ctx) {
        const modeLabel = mode === 'light' ? '☀️' : '🌙';
        md += `| ${modeLabel} ${mode} | ${formatColorChangeInline(ctx.old, ctx.new)} |\n`;
      }
    }
    return md + '\n';
  }

  // Full matrix: brands × modes
  if (brandList.length > 0 && modeList.length > 0) {
    let md = `**\`${getTokenName(token)}\`**\n\n`;
    md += '| Brand | ' + modeList.map(m => m === 'light' ? '☀️ Light' : '🌙 Dark').join(' | ') + ' |\n';
    md += '|---' + modeList.map(() => '|---').join('') + '|\n';

    // Rows are now brands, columns are modes (more compact when brands differ)
    for (const brand of brandList) {
      const cells = modeList.map(mode => {
        const key = `${brand}/${mode}`;
        const ctx = contexts[key];
        if (!ctx) return '–';
        return formatColorChangeInline(ctx.old, ctx.new);
      });

      // Only show row if at least one cell has a change
      const hasChange = cells.some(c => c !== '–');
      if (hasChange) {
        const brandLabel = brand.charAt(0).toUpperCase() + brand.slice(1);
        md += `| ${brandLabel} | ${cells.join(' | ')} |\n`;
      }
    }

    return md + '\n';
  }

  return null;
}

/**
 * Generate a breakpoint matrix table for a single token (typography/sizing/spacing)
 * Shows actual values with change arrows, compact diff summary below
 * Rows: breakpoints (xs/sm/md/lg), Columns: brands
 */
function generateBreakpointMatrix(token) {
  const contexts = token.valuesByContext || {};
  const contextKeys = Object.keys(contexts);
  if (contextKeys.length <= 1) return null;

  // Determine which brands and breakpoints are present
  const brands = new Set();
  const breakpoints = new Set();
  for (const key of contextKeys) {
    const ctx = contexts[key];
    if (ctx.brand) brands.add(ctx.brand);
    if (ctx.breakpoint) breakpoints.add(ctx.breakpoint);
  }

  if (breakpoints.size <= 1) return null;

  const brandList = KNOWN_BRANDS.filter(b => brands.has(b));
  const bpList = KNOWN_BREAKPOINTS.filter(bp => breakpoints.has(bp));

  // Breakpoint labels with icons
  const bpLabels = { xs: '📱', sm: '📱', md: '💻', lg: '🖥️' };

  // If we only have breakpoints (no brand differentiation)
  if (brandList.length === 0 && bpList.length > 1) {
    let md = `**\`${getTokenName(token)}\`**\n\n`;
    md += '| BP | Change |\n';
    md += '|----|--------|\n';

    let hasChanges = false;
    for (const bp of bpList) {
      const ctx = contexts[bp] || contexts[`/${bp}`];
      if (ctx) {
        hasChanges = true;
        // Inline delta format
        md += `| ${bpLabels[bp] || ''} ${bp} | ${formatDimensionChangeInline(ctx.old, ctx.new)} |\n`;
      }
    }

    if (!hasChanges) return null;
    return md + '\n';
  }

  // Full matrix: brands × breakpoints (supports bild, sportbild, advertorial)
  if (brandList.length > 0 && bpList.length > 1) {
    let md = `**\`${getTokenName(token)}\`**\n\n`;
    md += '| | ' + brandList.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join(' | ') + ' |\n';
    md += '|---' + brandList.map(() => '|---').join('') + '|\n';

    let rowsWithChanges = 0;

    for (const bp of bpList) {
      const cells = brandList.map(brand => {
        const key = `${brand}/${bp}`;
        const ctx = contexts[key];
        if (!ctx) return '–';

        // Inline delta format: `12px`→`16px` 🟠+33%
        return formatDimensionChangeInline(ctx.old, ctx.new);
      });

      // Only add row if at least one cell has a change
      const hasChange = cells.some(c => c !== '–');
      if (hasChange) {
        md += `| ${bpLabels[bp] || ''} ${bp} | ${cells.join(' | ')} |\n`;
        rowsWithChanges++;
      }
    }

    if (rowsWithChanges === 0) return null;
    return md + '\n';
  }

  return null;
}

/**
 * Generate simple row for token without multiple contexts
 * Uses inline delta format for consistency
 */
function generateSimpleColorRow(token) {
  return `| \`${getTokenName(token)}\` | ${formatColorChangeInline(token.oldValue, token.newValue)} |\n`;
}

function generateSimpleDimensionRow(token) {
  return `| \`${getTokenName(token)}\` | ${formatDimensionChangeInline(token.oldValue, token.newValue)} |\n`;
}

/**
 * Generate visual changes section - shows modified tokens grouped by category
 * with visual diff calculations (Delta E for colors, % for dimensions)
 * Uses matrix display for tokens with multiple contexts (brand/mode/breakpoint)
 */
function generateVisualChangesSection(diff, options = {}) {
  const { maxTokens = 12 } = options;

  // Get modified tokens (only consumption layer - semantic + component)
  // Primitive layer modifications are shown in Internal Changes
  const allModified = diff?.byUniqueToken?.modified || [];
  const modifiedTokens = allModified.filter(t => CONSUMPTION_LAYERS.includes(t.layer));
  if (modifiedTokens.length === 0) return '';

  // Separate tokens with multiple contexts from simple tokens
  const byCategory = {
    colors: { matrix: [], simple: [] },
    typography: { matrix: [], simple: [] },
    spacing: { matrix: [], simple: [] },
    sizing: { matrix: [], simple: [] },
    effects: { matrix: [], simple: [] },
    other: { simple: [] }
  };

  for (const token of modifiedTokens) {
    const category = token.category || 'other';
    const hasMultiple = token.hasMultipleContexts && Object.keys(token.valuesByContext || {}).length > 1;

    if (category === 'other') {
      byCategory.other.simple.push(token);
    } else if (byCategory[category]) {
      if (hasMultiple) {
        byCategory[category].matrix.push(token);
      } else {
        byCategory[category].simple.push(token);
      }
    }
  }

  let md = '## 🟡 Visual Changes\n\n';
  md += '> Modified tokens with visual impact analysis\n\n';

  // Colors with Delta E (matrix for multi-context, table for simple)
  const colorTotal = byCategory.colors.matrix.length + byCategory.colors.simple.length;
  if (colorTotal > 0) {
    md += `### 🎨 Colors (${colorTotal})\n\n`;

    // Matrix tokens first
    for (const token of byCategory.colors.matrix.slice(0, maxTokens)) {
      const matrix = generateColorMatrix(token);
      if (matrix) {
        md += matrix;
      }
    }

    // Simple tokens in table (2-column with inline delta)
    if (byCategory.colors.simple.length > 0) {
      md += '| Token | Change |\n';
      md += '|-------|--------|\n';
      for (const token of byCategory.colors.simple.slice(0, maxTokens)) {
        md += generateSimpleColorRow(token);
      }
      if (byCategory.colors.simple.length > maxTokens) {
        md += `| ... | *${byCategory.colors.simple.length - maxTokens} more* |\n`;
      }
      md += '\n';
    }
  }

  // Typography
  const typoTotal = byCategory.typography.matrix.length + byCategory.typography.simple.length;
  if (typoTotal > 0) {
    md += `### 📝 Typography (${typoTotal})\n\n`;

    for (const token of byCategory.typography.matrix.slice(0, maxTokens)) {
      const matrix = generateBreakpointMatrix(token);
      if (matrix) {
        md += matrix;
      }
    }

    if (byCategory.typography.simple.length > 0) {
      md += '| Token | Change |\n';
      md += '|-------|--------|\n';
      for (const token of byCategory.typography.simple.slice(0, maxTokens)) {
        md += generateSimpleDimensionRow(token);
      }
      if (byCategory.typography.simple.length > maxTokens) {
        md += `| ... | *${byCategory.typography.simple.length - maxTokens} more* |\n`;
      }
      md += '\n';
    }
  }

  // Spacing
  const spacingTotal = byCategory.spacing.matrix.length + byCategory.spacing.simple.length;
  if (spacingTotal > 0) {
    md += `### 📏 Spacing (${spacingTotal})\n\n`;

    for (const token of byCategory.spacing.matrix.slice(0, maxTokens)) {
      const matrix = generateBreakpointMatrix(token);
      if (matrix) {
        md += matrix;
      }
    }

    if (byCategory.spacing.simple.length > 0) {
      md += '| Token | Change |\n';
      md += '|-------|--------|\n';
      for (const token of byCategory.spacing.simple.slice(0, maxTokens)) {
        md += generateSimpleDimensionRow(token);
      }
      if (byCategory.spacing.simple.length > maxTokens) {
        md += `| ... | *${byCategory.spacing.simple.length - maxTokens} more* |\n`;
      }
      md += '\n';
    }
  }

  // Sizing
  const sizingTotal = byCategory.sizing.matrix.length + byCategory.sizing.simple.length;
  if (sizingTotal > 0) {
    md += `### 📐 Sizing (${sizingTotal})\n\n`;

    for (const token of byCategory.sizing.matrix.slice(0, maxTokens)) {
      const matrix = generateBreakpointMatrix(token);
      if (matrix) {
        md += matrix;
      }
    }

    if (byCategory.sizing.simple.length > 0) {
      md += '| Token | Change |\n';
      md += '|-------|--------|\n';
      for (const token of byCategory.sizing.simple.slice(0, maxTokens)) {
        md += generateSimpleDimensionRow(token);
      }
      if (byCategory.sizing.simple.length > maxTokens) {
        md += `| ... | *${byCategory.sizing.simple.length - maxTokens} more* |\n`;
      }
      md += '\n';
    }
  }

  // Effects (no matrix, just simple display for now)
  const effectsTotal = byCategory.effects.matrix.length + byCategory.effects.simple.length;
  if (effectsTotal > 0) {
    md += `### ✨ Effects (${effectsTotal})\n\n`;
    md += '| Token | Change |\n';
    md += '|-------|--------|\n';

    const allEffects = [...byCategory.effects.matrix, ...byCategory.effects.simple];
    for (const token of allEffects.slice(0, maxTokens)) {
      md += `| \`${getTokenName(token)}\` | \`${token.oldValue}\` → \`${token.newValue}\` |\n`;
    }
    if (allEffects.length > maxTokens) {
      md += `| ... | *${allEffects.length - maxTokens} more* |\n`;
    }
    md += '\n';
  }

  // Other (collapsible)
  if (byCategory.other.simple.length > 0) {
    md += `<details>\n<summary>📦 Other (${byCategory.other.simple.length})</summary>\n\n`;
    md += '| Token | Change |\n';
    md += '|-------|--------|\n';

    for (const token of byCategory.other.simple.slice(0, maxTokens)) {
      md += `| \`${getTokenName(token)}\` | \`${token.oldValue}\` → \`${token.newValue}\` |\n`;
    }
    md += '\n</details>\n\n';
  }

  md += '---\n\n';
  return md;
}

// =============================================================================
// LAYER 4: SAFE CHANGES (Added + Internal)
// =============================================================================

/**
 * Generate safe changes section - combines added tokens and internal (primitive) changes
 * Includes Combined Tokens (Typography Styles, Effects Styles)
 */
function generateSafeChangesSection(diff, options = {}) {
  const { maxTokens = 10 } = options;

  // Use pre-grouped data if available, otherwise fallback
  const grouped = diff?.grouped?.safe;

  // Get added tokens (variables)
  const addedTokens = grouped?.added?.variables || diff?.byUniqueToken?.added || [];

  // Get added combined tokens
  const addedTypography = grouped?.added?.typography || [];
  const addedEffects = grouped?.added?.effects || [];

  // Get renames first (needed to filter removed tokens)
  const variableRenames = diff?.renames || [];
  const nonBreakingRenames = variableRenames.filter(r => !CONSUMPTION_LAYERS.includes(r.layer));

  // Create a Set of renamed old token names (to filter from removed)
  // A renamed token should NOT also appear as removed
  const renamedOldNames = new Set(
    nonBreakingRenames.map(r => getOldTokenName(r).toLowerCase())
  );

  // Get internal changes (primitive layer - no consumer impact)
  const allRemovedTokens = diff?.byUniqueToken?.removed || [];
  const internalRemovedTokensRaw = grouped?.internal?.removed ||
    allRemovedTokens.filter(t => !CONSUMPTION_LAYERS.includes(t.layer));

  // Filter out tokens that were renamed (not truly removed)
  const internalRemovedTokens = internalRemovedTokensRaw.filter(t => {
    const tokenName = getTokenName(t).toLowerCase();
    return !renamedOldNames.has(tokenName);
  });

  // Get internal modified tokens (primitive layer modifications)
  const allModifiedTokens = diff?.byUniqueToken?.modified || [];
  const internalModifiedTokens = grouped?.internal?.modified ||
    allModifiedTokens.filter(t => !CONSUMPTION_LAYERS.includes(t.layer));

  const totalAdded = addedTokens.length + addedTypography.length + addedEffects.length;
  const hasAdded = totalAdded > 0;
  const hasInternal = internalRemovedTokens.length > 0 || internalModifiedTokens.length > 0 || nonBreakingRenames.length > 0;

  if (!hasAdded && !hasInternal) return '';

  let md = '## 🟢 Safe Changes\n\n';

  // Added Tokens section
  if (hasAdded) {
    md += `### ➕ Added Tokens (${totalAdded})\n\n`;

    // Group variable tokens by category
    const byCategory = {
      colors: [],
      typography: [],
      spacing: [],
      sizing: [],
      effects: [],
      other: []
    };

    for (const token of addedTokens) {
      const category = token.category || 'other';
      if (byCategory[category]) {
        byCategory[category].push(token);
      } else {
        byCategory.other.push(token);
      }
    }

    // Variable tokens by category
    for (const [category, tokens] of Object.entries(byCategory)) {
      if (tokens.length === 0) continue;

      const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
      md += `<details>\n<summary>${config.icon} ${config.label} (${tokens.length})</summary>\n\n`;
      md += '| Token | Layer |\n';
      md += '|-------|-------|\n';

      for (const token of tokens.slice(0, maxTokens)) {
        const layerConfig = LAYER_CONFIG[token.layer] || LAYER_CONFIG.semantic;
        md += `| \`${getTokenName(token)}\` | ${layerConfig.icon} ${layerConfig.label} |\n`;
      }

      if (tokens.length > maxTokens) {
        md += `| ... | *${tokens.length - maxTokens} more* |\n`;
      }

      md += '\n</details>\n\n';
    }

    // Added Typography Styles (Combined Tokens)
    if (addedTypography.length > 0) {
      md += `<details>\n<summary>📝 Typography Styles (${addedTypography.length})</summary>\n\n`;
      md += '| Style Name | Properties |\n';
      md += '|------------|------------|\n';

      for (const style of addedTypography.slice(0, maxTokens)) {
        const styleName = style.newName || style.name || 'Unknown';
        const props = style.properties ? Object.keys(style.properties).join(', ') : '–';
        md += `| \`${styleName}\` | ${props} |\n`;
      }

      if (addedTypography.length > maxTokens) {
        md += `| ... | *${addedTypography.length - maxTokens} more* |\n`;
      }

      md += '\n</details>\n\n';
    }

    // Added Effects Styles (Combined Tokens)
    if (addedEffects.length > 0) {
      md += `<details>\n<summary>✨ Effects Styles (${addedEffects.length})</summary>\n\n`;
      md += '| Style Name | Type |\n';
      md += '|------------|------|\n';

      for (const style of addedEffects.slice(0, maxTokens)) {
        const styleName = style.newName || style.name || 'Unknown';
        const effectType = style.effectType || '–';
        md += `| \`${styleName}\` | ${effectType} |\n`;
      }

      if (addedEffects.length > maxTokens) {
        md += `| ... | *${addedEffects.length - maxTokens} more* |\n`;
      }

      md += '\n</details>\n\n';
    }
  }

  // Internal Changes (Primitive Layer)
  if (hasInternal) {
    const totalInternal = internalRemovedTokens.length + internalModifiedTokens.length + nonBreakingRenames.length;
    md += `### 🔧 Internal Changes (${totalInternal})\n\n`;
    md += '<details>\n<summary>Primitive layer changes (no consumer impact)</summary>\n\n';

    if (internalModifiedTokens.length > 0) {
      md += `**Modified (${internalModifiedTokens.length}):**\n\n`;
      md += '| Token | Change |\n';
      md += '|-------|--------|\n';

      for (const token of internalModifiedTokens.slice(0, maxTokens)) {
        md += `| \`${getTokenName(token)}\` | ${formatDimensionChangeInline(token.oldValue, token.newValue)} |\n`;
      }

      if (internalModifiedTokens.length > maxTokens) {
        md += `| ... | *${internalModifiedTokens.length - maxTokens} more* |\n`;
      }
      md += '\n';
    }

    if (internalRemovedTokens.length > 0) {
      md += `**Removed (${internalRemovedTokens.length}):**\n\n`;
      // Simple list of token names (no values needed for removed tokens)
      const tokenNames = internalRemovedTokens.slice(0, maxTokens).map(t => `\`${getTokenName(t)}\``);
      md += tokenNames.join(', ');
      if (internalRemovedTokens.length > maxTokens) {
        md += `, ... (+${internalRemovedTokens.length - maxTokens} more)`;
      }
      md += '\n\n';
    }

    if (nonBreakingRenames.length > 0) {
      md += `**Renamed (${nonBreakingRenames.length}):**\n\n`;
      md += '| Old Name | → | New Name |\n';
      md += '|----------|:---:|----------|\n';

      for (const rename of nonBreakingRenames.slice(0, maxTokens)) {
        md += `| \`${getOldTokenName(rename)}\` | → | \`${getNewTokenName(rename)}\` |\n`;
      }

      if (nonBreakingRenames.length > maxTokens) {
        md += `| ... | | *${nonBreakingRenames.length - maxTokens} more* |\n`;
      }
      md += '\n';
    }

    md += '</details>\n\n';
  }

  md += '---\n\n';
  return md;
}

/**
 * Generate combined token changes section (Typography/Effects property changes)
 */
function generateStyleChangesSection(diff, options = {}) {
  if (!diff?.styleChanges) return '';

  const { maxTokens = 10 } = options;
  const typography = diff.styleChanges.typography || { added: [], modified: [], removed: [] };
  const effects = diff.styleChanges.effects || { added: [], modified: [], removed: [] };

  const totalTypography = typography.added.length + typography.modified.length + typography.removed.length;
  const totalEffects = effects.added.length + effects.modified.length + effects.removed.length;

  if (totalTypography === 0 && totalEffects === 0) return '';

  let md = '## 📝 Combined Token Changes\n\n';

  // Typography changes
  if (totalTypography > 0) {
    md += `<details>\n<summary>📝 Typography (${totalTypography} changes)</summary>\n\n`;

    // Modified with property details
    if (typography.modified.length > 0) {
      md += `**Modified (${typography.modified.length}):**\n\n`;
      md += '| Style | Changed Properties |\n';
      md += '|-------|--------------------|\n';

      for (const style of typography.modified.slice(0, maxTokens)) {
        const propChanges = (style.changedProperties || [])
          .map(p => `${p.property}: ${p.oldValue} → ${p.newValue}`)
          .join(', ');
        const renamed = style.wasRenamed ? ' 🔄' : '';
        md += `| \`${style.name}\`${renamed} | ${propChanges} |\n`;
      }
      md += '\n';
    }

    // Added
    if (typography.added.length > 0) {
      md += `**Added (${typography.added.length}):** `;
      md += typography.added.slice(0, 10).map(s => `\`${s.name}\``).join(', ');
      if (typography.added.length > 10) md += `, +${typography.added.length - 10} more`;
      md += '\n\n';
    }

    // Removed
    if (typography.removed.length > 0) {
      md += `**Removed (${typography.removed.length}):** `;
      md += typography.removed.slice(0, 10).map(s => `\`${s.name}\``).join(', ');
      if (typography.removed.length > 10) md += `, +${typography.removed.length - 10} more`;
      md += '\n\n';
    }

    md += '</details>\n\n';
  }

  // Effects changes
  if (totalEffects > 0) {
    md += `<details>\n<summary>✨ Effects (${totalEffects} changes)</summary>\n\n`;

    // Modified with property details
    if (effects.modified.length > 0) {
      md += `**Modified (${effects.modified.length}):**\n\n`;
      md += '| Style | Changed Properties |\n';
      md += '|-------|--------------------|\n';

      for (const style of effects.modified.slice(0, maxTokens)) {
        const propChanges = (style.changedProperties || [])
          .map(p => p.property)
          .join(', ');
        const renamed = style.wasRenamed ? ' 🔄' : '';
        md += `| \`${style.name}\`${renamed} | ${propChanges} |\n`;
      }
      md += '\n';
    }

    // Added
    if (effects.added.length > 0) {
      md += `**Added (${effects.added.length}):** `;
      md += effects.added.slice(0, 10).map(s => `\`${s.name}\``).join(', ');
      if (effects.added.length > 10) md += `, +${effects.added.length - 10} more`;
      md += '\n\n';
    }

    // Removed
    if (effects.removed.length > 0) {
      md += `**Removed (${effects.removed.length}):** `;
      md += effects.removed.slice(0, 10).map(s => `\`${s.name}\``).join(', ');
      if (effects.removed.length > 10) md += `, +${effects.removed.length - 10} more`;
      md += '\n\n';
    }

    md += '</details>\n\n';
  }

  md += '---\n\n';
  return md;
}

// =============================================================================
// LAYER 2d: AFFECTED COMPONENTS
// =============================================================================

/**
 * Generate affected components section - shows which components have token changes
 */
function generateAffectedComponentsSection(diff, options = {}) {
  if (!diff || !diff.byComponent) return '';

  const components = Object.entries(diff.byComponent);
  if (components.length === 0) return '';

  const { maxComponents = 10 } = options;

  let md = '## 🧩 Affected Components\n\n';

  const displayComponents = components.slice(0, maxComponents);
  for (const [componentName, changes] of displayComponents) {
    const changeCount = changes.length;
    const types = new Set(changes.map(c => c.changeType));
    const icons = [];
    if (types.has('removed')) icons.push('🔴');
    if (types.has('modified')) icons.push('🟡');
    if (types.has('added')) icons.push('🟢');

    md += `- **${componentName}** (${changeCount} changes) ${icons.join(' ')}\n`;
  }

  if (components.length > maxComponents) {
    md += `- *... and ${components.length - maxComponents} more components*\n`;
  }

  md += '\n---\n\n';
  return md;
}

// =============================================================================
// LAYER 5b: DYNAMIC REVIEW CHECKLIST
// =============================================================================

/**
 * Generate dynamic review checklist based on what actually changed
 */
function generateDynamicChecklist(diff, options = {}) {
  if (!diff) return '';

  let md = '## ✅ Review Checklist\n\n';

  const hasRenames = diff.renames?.length > 0;
  const hasBreaking = diff.summary?.uniqueTokensRemoved > 0;
  const hasModified = diff.summary?.uniqueTokensModified > 0;
  const hasAdded = diff.summary?.uniqueTokensAdded > 0;

  // Determine what categories changed
  const changedCategories = new Set();
  if (diff.byCategory) {
    for (const [cat, data] of Object.entries(diff.byCategory)) {
      if ((data.modified?.length || 0) + (data.added?.length || 0) + (data.removed?.length || 0) > 0) {
        changedCategories.add(cat);
      }
    }
  }

  // Breaking changes section
  if (hasBreaking || hasRenames) {
    md += '### ⚠️ Required Actions\n\n';
    if (hasBreaking) {
      md += '- [ ] Migration plan created for removed tokens\n';
      md += '- [ ] Affected codebases identified and updated\n';
    }
    if (hasRenames) {
      md += '- [ ] Renamed tokens updated in codebase (find & replace)\n';
      md += '- [ ] Build verification passed after renames\n';
    }
    md += '\n';
  }

  // Visual review section
  if (hasModified || hasAdded) {
    md += '### 👁️ Visual Review\n\n';
    if (changedCategories.has('colors')) {
      md += '- [ ] Color changes verified in **Light** mode\n';
      md += '- [ ] Color changes verified in **Dark** mode\n';
    }
    if (changedCategories.has('typography')) {
      md += '- [ ] Typography changes reviewed across breakpoints\n';
    }
    if (changedCategories.has('spacing') || changedCategories.has('sizing')) {
      md += '- [ ] Layout changes verified (spacing/sizing)\n';
    }
    if (changedCategories.has('effects')) {
      md += '- [ ] Shadow/effect changes reviewed\n';
    }
    md += '- [ ] Visual regression tests passed\n';
    md += '\n';
  }

  // General checklist
  md += '### 📋 General\n\n';
  md += '- [ ] Changes reviewed with design team\n';
  md += '- [ ] Documentation updated if needed\n';
  md += '- [ ] No unintended side effects observed\n';
  md += '\n---\n\n';

  return md;
}

// =============================================================================
// LAYER 4: TECHNICAL DETAILS
// =============================================================================

function generateTechnicalDetails(diff, options = {}) {
  const { runId = '' } = options;
  const repo = process.env.GITHUB_REPOSITORY || 'UXWizard25/vv-token-test-v3';

  let md = '## ⚙️ Technical Details\n\n';

  // Compact statistics only (no file list - all platforms change together)
  if (diff && diff.summary) {
    const s = diff.summary;
    const uniqueAdded = s.uniqueTokensAdded ?? s.tokensAdded;
    const uniqueModified = s.uniqueTokensModified ?? s.tokensModified;
    const uniqueRemoved = s.uniqueTokensRemoved ?? s.tokensRemoved;
    const filesChanged = s.filesAdded + s.filesModified + s.filesRemoved;
    const totalUnique = uniqueAdded + uniqueModified + uniqueRemoved;
    const platformOccurrences = s.tokensAdded + s.tokensModified + s.tokensRemoved;

    // Compact one-line summary
    md += `**Stats:** ${filesChanged} files · ${totalUnique} unique tokens · ${platformOccurrences} platform occurrences · Impact: **${s.impactLevel}**\n\n`;

    // Detailed breakdown in collapsible
    md += '<details>\n';
    md += '<summary>📊 Detailed Statistics</summary>\n\n';
    md += `| Metric | +Added | ~Modified | -Removed | Total |\n`;
    md += `|--------|--------|-----------|----------|-------|\n`;
    md += `| Unique Tokens | ${uniqueAdded} | ${uniqueModified} | ${uniqueRemoved} | ${totalUnique} |\n`;
    md += `| Platform Occurrences | ${s.tokensAdded} | ${s.tokensModified} | ${s.tokensRemoved} | ${platformOccurrences} |\n`;
    md += `| Files | ${s.filesAdded} | ${s.filesModified} | ${s.filesRemoved} | ${filesChanged} |\n`;
    md += '\n</details>\n\n';
  }

  // Downloads
  if (runId) {
    md += `📥 [Download Build Artifacts](https://github.com/${repo}/actions/runs/${runId})\n\n`;
  }

  return md;
}

// =============================================================================
// REVIEW CHECKLIST
// =============================================================================

function generateReviewChecklist(diff) {
  const hasBreaking = diff?.summary?.tokensRemoved > 0;
  const hasModified = diff?.summary?.tokensModified > 0;

  let md = '## ✅ Review Checklist\n\n';

  if (hasBreaking) {
    md += '- [ ] ⚠️ Breaking changes reviewed\n';
    md += '- [ ] Migration plan created\n';
  }

  md += '- [ ] Token changes reviewed\n';
  md += '- [ ] Affected components identified\n';

  if (hasModified) {
    md += '- [ ] Visual changes validated\n';
  }

  md += '\n---\n\n';

  return md;
}

// =============================================================================
// POST-MERGE INFO
// =============================================================================

function generatePostMergeInfo() {
  return `<details>
<summary>🚀 <b>What happens after merge?</b></summary>

1. ✅ **Fresh Build** — Tokens rebuilt from source
2. 📦 **Version Bump** — Automatic patch version
3. 📤 **NPM Publish** — Package published
4. 🏷️ **GitHub Release** — Tag with release notes

</details>

`;
}

// =============================================================================
// OUTPUT FORMATS
// =============================================================================

/**
 * Generate PR Comment format (compact, optimized structure)
 */
function generatePRComment(diff, options = {}) {
  let md = '';

  // 1. Executive Summary with Impact Table (always)
  md += generateExecutiveSummary(diff, options);

  // 2. Breaking Changes (Removed + Renamed in consumption layer - highest priority)
  md += generateBreakingChangesSection(diff, { maxTokens: 10 });

  // 3. Visual Changes (Modified tokens with diff metrics - colors, dimensions)
  md += generateVisualChangesSection(diff, { maxTokens: 10 });

  // 4. Safe Changes (Added + Internal/Primitive changes)
  md += generateSafeChangesSection(diff, { maxTokens: 10 });

  // 5. Affected Components
  md += generateAffectedComponentsSection(diff, { maxComponents: 8 });

  // 6. Dynamic Review Checklist
  md += generateDynamicChecklist(diff);

  // 7. Technical Details (collapsible)
  md += generateTechnicalDetails(diff, options);

  // Footer
  const repo = process.env.GITHUB_REPOSITORY || 'UXWizard25/vv-token-test-v3';
  md += `---\n\n`;
  md += `**Questions?** [Documentation](https://github.com/${repo}#readme) | [Create Issue](https://github.com/${repo}/issues)\n`;

  return md;
}

/**
 * Generate full CHANGELOG format
 */
function generateChangelog(diff, options = {}) {
  const version = options.version || 'Unreleased';
  const date = new Date().toISOString().split('T')[0];

  let md = `# ${version} (${date})\n\n`;

  md += generateExecutiveSummary(diff, options);
  md += generateUnifiedTokenChanges(diff, { maxTokensPerSection: 50 });
  md += generateTechnicalDetails(diff, options);

  return md;
}

/**
 * Generate console output
 */
function generateConsoleOutput(diff) {
  if (!diff || !diff.summary) {
    return '\n⚪ No changes detected.\n';
  }

  const { summary } = diff;
  const uniqueAdded = summary.uniqueTokensAdded ?? summary.tokensAdded;
  const uniqueModified = summary.uniqueTokensModified ?? summary.tokensModified;
  const uniqueRemoved = summary.uniqueTokensRemoved ?? summary.tokensRemoved;
  const uniqueRenamed = summary.uniqueTokensRenamed ?? 0;

  let output = '\n';
  output += '═══════════════════════════════════════════════════════════\n';
  output += '                    🎨 TOKEN UPDATE\n';
  output += '═══════════════════════════════════════════════════════════\n\n';

  // Impact
  const impactEmoji = IMPACT_EMOJI[summary.impactLevel] || '⚪';
  output += `  Impact: ${impactEmoji} ${summary.impactLevel.toUpperCase()}\n\n`;

  // Stats - show unique counts
  output += '  Unique Token Changes:\n';
  output += `    🔴 Removed:  ${uniqueRemoved} tokens\n`;
  output += `    🟡 Modified: ${uniqueModified} tokens\n`;
  output += `    🟢 Added:    ${uniqueAdded} tokens\n`;
  output += `    🔄 Renamed:  ${uniqueRenamed} tokens\n\n`;

  // Files
  output += '  Files:\n';
  output += `    📁 Added:    ${summary.filesAdded}\n`;
  output += `    📝 Modified: ${summary.filesModified}\n`;
  output += `    🗑️  Removed:  ${summary.filesRemoved}\n\n`;

  // Renames (if any)
  if (diff.renames && diff.renames.length > 0) {
    output += '  Renamed Tokens:\n';
    for (const rename of diff.renames.slice(0, 5)) {
      output += `    🔄 ${getOldTokenName(rename)} → ${getNewTokenName(rename)}\n`;
    }
    if (diff.renames.length > 5) {
      output += `    ... and ${diff.renames.length - 5} more\n`;
    }
    output += '\n';
  }

  // Platform breakdown
  output += '  By Platform:\n';
  for (const platformKey of PLATFORM_ORDER) {
    const platform = diff.platforms[platformKey];
    if (!platform) continue;

    const total = platform.tokensAdded + platform.tokensModified + platform.tokensRemoved;
    if (total === 0) continue;

    output += `    ${platform.icon} ${platform.name.padEnd(16)} +${platform.tokensAdded} / ~${platform.tokensModified} / -${platform.tokensRemoved}\n`;
  }

  output += '\n═══════════════════════════════════════════════════════════\n';

  return output;
}

/**
 * Generate GitHub Release format (optimized, similar structure to PR comment)
 */
function generateGitHubRelease(diff, options = {}) {
  const { version = 'latest', packageSize = '', successfulBuilds = 0, totalBuilds = 0 } = options;
  const repo = process.env.GITHUB_REPOSITORY || 'UXWizard25/vv-token-test-v3';

  let md = `## 🎨 Design System v${version}\n\n`;

  // Installation - All 4 packages
  md += '### 📦 Installation\n\n';
  md += '```bash\n';
  md += '# Design Tokens (CSS, JS, iOS, Android)\n';
  md += `npm install @marioschmidt/design-system-tokens@${version}\n\n`;
  md += '# Web Components (Stencil)\n';
  md += `npm install @marioschmidt/design-system-components@${version}\n\n`;
  md += '# React / Vue Wrappers\n';
  md += `npm install @marioschmidt/design-system-react@${version}\n`;
  md += `npm install @marioschmidt/design-system-vue@${version}\n`;
  md += '```\n\n';

  // Get grouped data
  const grouped = diff?.grouped || {};
  const breakingRemoved = grouped?.breaking?.removed || {};
  const breakingRenamed = grouped?.breaking?.renamed || {};

  // Count removed by type
  const removedVars = breakingRemoved?.variables?.length || 0;
  const removedTypo = breakingRemoved?.typography?.length || 0;
  const removedEffects = breakingRemoved?.effects?.length || 0;
  const totalRemoved = removedVars + removedTypo + removedEffects;

  // Count renamed by type
  const renamedVars = breakingRenamed?.variables?.length || 0;
  const renamedTypo = breakingRenamed?.typography?.length || 0;
  const renamedEffects = breakingRenamed?.effects?.length || 0;
  const totalRenamed = renamedVars + renamedTypo + renamedEffects;

  const hasBreaking = totalRemoved > 0 || totalRenamed > 0;

  // Breaking Changes Section
  if (hasBreaking) {
    md += '---\n\n';
    md += '## 🔴 Breaking Changes\n\n';

    // Removed tokens
    if (totalRemoved > 0) {
      const typeParts = [];
      if (removedVars > 0) typeParts.push(`${removedVars} Tokens`);
      if (removedTypo > 0) typeParts.push(`${removedTypo} Typography`);
      if (removedEffects > 0) typeParts.push(`${removedEffects} Effects`);

      md += `### Removed (${typeParts.join(', ')})\n\n`;
      md += '| Token | Layer | Category |\n';
      md += '|-------|-------|----------|\n';

      // Combine all removed tokens
      const allRemoved = [
        ...(breakingRemoved?.variables || []),
        ...(breakingRemoved?.typography || []),
        ...(breakingRemoved?.effects || [])
      ];

      for (const token of allRemoved.slice(0, 10)) {
        const layerIcon = LAYER_CONFIG[token.layer]?.icon || '📦';
        const layerLabel = LAYER_CONFIG[token.layer]?.label || token.layer;
        const catIcon = CATEGORY_CONFIG[token.category]?.icon || '📦';
        const catLabel = CATEGORY_CONFIG[token.category]?.label || token.category;
        md += `| \`${getTokenName(token)}\` | ${layerIcon} ${layerLabel} | ${catIcon} ${catLabel} |\n`;
      }
      if (allRemoved.length > 10) {
        md += `| ... | | *${allRemoved.length - 10} more* |\n`;
      }
      md += '\n';
    }

    // Renamed tokens
    if (totalRenamed > 0) {
      const typeParts = [];
      if (renamedVars > 0) typeParts.push(`${renamedVars} Tokens`);
      if (renamedTypo > 0) typeParts.push(`${renamedTypo} Typography`);
      if (renamedEffects > 0) typeParts.push(`${renamedEffects} Effects`);

      md += `### Renamed (${typeParts.join(', ')})\n\n`;
      md += '| Old Name | → | New Name | Type |\n';
      md += '|----------|:-:|----------|------|\n';

      // Combine all renames
      const allRenames = [
        ...(breakingRenamed?.variables || []).map(r => ({ ...r, type: '🎨 Token' })),
        ...(breakingRenamed?.typography || []).map(r => ({ ...r, type: '📝 Combined' })),
        ...(breakingRenamed?.effects || []).map(r => ({ ...r, type: '✨ Combined' }))
      ];

      for (const rename of allRenames.slice(0, 10)) {
        md += `| \`${getOldTokenName(rename)}\` | → | \`${getNewTokenName(rename)}\` | ${rename.type} |\n`;
      }
      if (allRenames.length > 10) {
        md += `| ... | | | *${allRenames.length - 10} more* |\n`;
      }
      md += '\n';

      // Migration Matrix - platform-specific token names
      // Platform groups with same naming conventions:
      // - CSS/SCSS: --kebab-case
      // - JS/JSON/Swift/Kotlin: camelCase
      md += '<details>\n';
      md += '<summary>📋 Migration Guide (Platform-Specific Names)</summary>\n\n';
      md += '| | CSS / SCSS | JS / JSON / Swift / Kotlin |\n';
      md += '|---|---|---|\n';

      for (const rename of allRenames.slice(0, 20)) {
        const oldToken = getOldTokenName(rename);
        const newToken = getNewTokenName(rename);
        const cssOld = `--${toKebabCase(oldToken)}`;
        const cssNew = `--${toKebabCase(newToken)}`;
        const jsOld = toCamelCasePlatform(oldToken);
        const jsNew = toCamelCasePlatform(newToken);

        md += `| **Old** | \`${cssOld}\` | \`${jsOld}\` |\n`;
        md += `| **New** | \`${cssNew}\` | \`${jsNew}\` |\n`;
        md += `| | | |\n`;
      }

      if (allRenames.length > 20) {
        md += `| | *...${allRenames.length - 20} more* | |\n`;
      }

      md += '\n</details>\n\n';
    }
  }

  // Visual Changes Section
  const modifiedTokens = diff?.byUniqueToken?.modified?.filter(t => CONSUMPTION_LAYERS.includes(t.layer)) || [];
  if (modifiedTokens.length > 0) {
    md += '---\n\n';
    md += '## 🟡 Visual Changes\n\n';

    // Group by category
    const byCategory = {};
    for (const token of modifiedTokens) {
      const cat = token.category || 'other';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(token);
    }

    // Summary table
    md += '| Category | Tokens | Examples |\n';
    md += '|----------|-------:|----------|\n';

    for (const category of CATEGORY_ORDER) {
      const tokens = byCategory[category];
      if (!tokens || tokens.length === 0) continue;

      const config = CATEGORY_CONFIG[category];
      const examples = tokens.slice(0, 2).map(t => `\`${getTokenName(t)}\``).join(', ');
      const more = tokens.length > 2 ? ', ...' : '';
      md += `| ${config.icon} ${config.label} | ${tokens.length} | ${examples}${more} |\n`;
    }
    md += '\n';

    // Collapsible details
    md += '<details>\n';
    md += '<summary>📝 View All Modified Tokens</summary>\n\n';

    for (const category of CATEGORY_ORDER) {
      const tokens = byCategory[category];
      if (!tokens || tokens.length === 0) continue;

      const config = CATEGORY_CONFIG[category];
      md += `**${config.icon} ${config.label}:**\n`;
      for (const token of tokens.slice(0, 8)) {
        md += `- \`${getTokenName(token)}\`: \`${token.oldValue}\` → \`${token.newValue}\`\n`;
      }
      if (tokens.length > 8) {
        md += `- *... and ${tokens.length - 8} more*\n`;
      }
      md += '\n';
    }

    md += '</details>\n\n';
  }

  // New Features Section
  const addedTokens = diff?.byUniqueToken?.added || [];
  const addedTypography = grouped?.added?.typography || [];
  const addedEffects = grouped?.added?.effects || [];
  const totalAdded = addedTokens.length + addedTypography.length + addedEffects.length;

  if (totalAdded > 0) {
    md += '---\n\n';
    md += '## 🟢 New Features\n\n';

    // Group added tokens by category
    const addedByCategory = {};
    for (const token of addedTokens) {
      const cat = token.category || 'other';
      if (!addedByCategory[cat]) addedByCategory[cat] = 0;
      addedByCategory[cat]++;
    }

    // Summary table
    md += '| Category | Count |\n';
    md += '|----------|------:|\n';

    for (const category of CATEGORY_ORDER) {
      const count = addedByCategory[category] || 0;
      if (count === 0) continue;
      const config = CATEGORY_CONFIG[category];
      md += `| ${config.icon} ${config.label} | ${count} |\n`;
    }

    if (addedTypography.length > 0) {
      md += `| 📝 Typography Styles | ${addedTypography.length} |\n`;
    }
    if (addedEffects.length > 0) {
      md += `| ✨ Effects Styles | ${addedEffects.length} |\n`;
    }
    md += '\n';

    // Collapsible details
    md += '<details>\n';
    md += '<summary>📝 View All Added Tokens</summary>\n\n';

    for (const category of CATEGORY_ORDER) {
      const tokens = addedTokens.filter(t => (t.category || 'other') === category);
      if (tokens.length === 0) continue;

      const config = CATEGORY_CONFIG[category];
      const names = tokens.slice(0, 5).map(t => `\`${getTokenName(t)}\``).join(', ');
      const more = tokens.length > 5 ? `, ... (+${tokens.length - 5} more)` : '';
      md += `**${config.icon} ${config.label}:** ${names}${more}\n\n`;
    }

    if (addedTypography.length > 0) {
      const names = addedTypography.slice(0, 3).map(t => `\`${toDotNotation(t.newName || t.name)}\``).join(', ');
      const more = addedTypography.length > 3 ? `, ... (+${addedTypography.length - 3} more)` : '';
      md += `**📝 Typography Styles:** ${names}${more}\n\n`;
    }

    if (addedEffects.length > 0) {
      const names = addedEffects.slice(0, 3).map(t => `\`${toDotNotation(t.newName || t.name)}\``).join(', ');
      const more = addedEffects.length > 3 ? `, ... (+${addedEffects.length - 3} more)` : '';
      md += `**✨ Effects Styles:** ${names}${more}\n\n`;
    }

    md += '</details>\n\n';
  }

  // Build Info Section
  md += '---\n\n';
  md += '## 📋 Build Info\n\n';
  md += '| Metric | Value |\n';
  md += '|--------|-------|\n';
  if (successfulBuilds > 0 && totalBuilds > 0) {
    md += `| Build Status | ✅ ${successfulBuilds}/${totalBuilds} successful |\n`;
  }
  if (packageSize) {
    md += `| Package Size | ${packageSize} |\n`;
  }
  md += '| Platforms | CSS, SCSS, JS, Swift, Kotlin, JSON |\n';
  md += '| Brands | BILD, SportBILD, Advertorial |\n';
  md += '\n';

  // Links
  md += '### 🔗 Links\n\n';
  md += `- [📖 Documentation](https://github.com/${repo}#readme)\n`;
  md += `- [📦 Tokens on npm](https://www.npmjs.com/package/@marioschmidt/design-system-tokens)\n`;
  md += `- [📦 Components on npm](https://www.npmjs.com/package/@marioschmidt/design-system-components)\n`;
  md += `- [🐛 Report Issue](https://github.com/${repo}/issues)\n`;

  return md;
}

// =============================================================================
// CLI
// =============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    diffFile: null,
    format: 'pr-comment',
    output: null,
    version: null,
    commitSha: '',
    buildSuccess: true,
    successfulBuilds: 0,
    totalBuilds: 0,
    runId: '',
    packageSize: '',
    noBaseline: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    if (arg === '--diff-file' && nextArg) {
      options.diffFile = nextArg;
      i++;
    } else if (arg === '--format' && nextArg) {
      options.format = nextArg;
      i++;
    } else if (arg === '--output' && nextArg) {
      options.output = nextArg;
      i++;
    } else if (arg === '--version' && nextArg) {
      options.version = nextArg;
      i++;
    } else if (arg === '--commit-sha' && nextArg) {
      options.commitSha = nextArg;
      i++;
    } else if (arg === '--build-success' && nextArg) {
      options.buildSuccess = nextArg === 'true';
      i++;
    } else if (arg === '--successful-builds' && nextArg) {
      options.successfulBuilds = parseInt(nextArg) || 0;
      i++;
    } else if (arg === '--total-builds' && nextArg) {
      options.totalBuilds = parseInt(nextArg) || 0;
      i++;
    } else if (arg === '--run-id' && nextArg) {
      options.runId = nextArg;
      i++;
    } else if (arg === '--package-size' && nextArg) {
      options.packageSize = nextArg;
      i++;
    } else if (arg === '--no-baseline' && nextArg) {
      options.noBaseline = nextArg === 'true';
      i++;
    }
  }

  return options;
}

function main() {
  const options = parseArgs();

  // Load diff file
  const diff = options.diffFile ? loadDiffFile(options.diffFile) : null;

  // Generate output based on format
  let output;
  switch (options.format) {
    case 'changelog':
      output = generateChangelog(diff, options);
      break;
    case 'console':
      output = generateConsoleOutput(diff);
      break;
    case 'github-release':
      output = generateGitHubRelease(diff, options);
      break;
    case 'pr-comment':
    default:
      output = generatePRComment(diff, options);
      break;
  }

  // Write or print output
  if (options.output) {
    fs.writeFileSync(options.output, output, 'utf-8');
    console.log(`📄 Release notes written to: ${options.output}`);
  } else {
    console.log(output);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generatePRComment,
  generateChangelog,
  generateConsoleOutput,
  generateGitHubRelease,
  loadDiffFile
};
