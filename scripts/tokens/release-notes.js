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

/**
 * Detect if a value is a color
 */
function isColorValue(value) {
  if (!value || typeof value !== 'string') return false;
  return value.startsWith('#') || value.startsWith('rgb');
}

/**
 * Detect if a value is a dimension (px, rem, em, etc.)
 */
function isDimensionValue(value) {
  if (!value || typeof value !== 'string') return false;
  return /^-?\d+(\.\d+)?(px|rem|em|%|pt|vw|vh)?$/i.test(value.trim());
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
      platforms: platformMap
    });
  }

  return results;
}

/**
 * Generate horizontal platform names table
 * Format: | Token | 🌐 CSS | 📜 SCSS | 💛 JS | 🍎 Swift | 🤖 Android |
 */
function generatePlatformNamesTable(groupedTokens) {
  if (groupedTokens.length === 0) return '';

  let md = '\n<details>\n<summary>Platform-specific names</summary>\n\n';
  md += '| Token | 🌐 CSS | 📜 SCSS | 💛 JS | 🍎 Swift | 🤖 Android |\n';
  md += '|-------|--------|--------|-------|----------|------------|\n';

  for (const entry of groupedTokens) {
    const p = entry.platforms;
    md += `| \`${entry.displayName}\` `;
    md += `| \`${p.css || '-'}\` `;
    md += `| \`${p.scss || '-'}\` `;
    md += `| \`${p.js || p.json || '-'}\` `;
    md += `| \`${p.swift || '-'}\` `;
    md += `| \`${p.kotlin || '-'}\` |\n`;
  }

  md += '</details>\n';
  return md;
}

// =============================================================================
// LAYER 1: EXECUTIVE SUMMARY
// =============================================================================

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

  // Collect counts
  const uniqueModified = summary.uniqueTokensModified ?? summary.tokensModified ?? 0;
  const uniqueAdded = summary.uniqueTokensAdded ?? summary.tokensAdded ?? 0;
  const uniqueStylesRenamed = summary.uniqueStylesRenamed ?? 0;

  // Calculate removed counts by layer (consumption vs primitive)
  const removedTokens = diff?.byUniqueToken?.removed || [];
  const breakingRemoved = removedTokens.filter(t => CONSUMPTION_LAYERS.includes(t.layer)).length;
  const internalRemoved = removedTokens.filter(t => !CONSUMPTION_LAYERS.includes(t.layer)).length;

  // Calculate renamed counts by layer (consumption vs primitive)
  const variableRenames = diff?.renames || [];
  const breakingRenames = variableRenames.filter(r => CONSUMPTION_LAYERS.includes(r.layer)).length;
  const internalRenames = variableRenames.filter(r => !CONSUMPTION_LAYERS.includes(r.layer)).length;
  const totalRenames = variableRenames.length + uniqueStylesRenamed;

  // Summary table with Impact classification
  const hasChanges = uniqueAdded > 0 || uniqueModified > 0 || removedTokens.length > 0 || totalRenames > 0;

  if (hasChanges) {
    md += '### 📊 Summary\n\n';
    md += '| Change Type | Count | Impact |\n';
    md += '|-------------|------:|--------|\n';

    // Order: Safe (Added, Internal) -> Visual (Modified) -> Breaking (Removed consumption, Renamed breaking)
    if (uniqueAdded > 0) {
      md += `| ➕ Added | ${uniqueAdded} | 🟢 Safe |\n`;
    }
    if (uniqueModified > 0) {
      md += `| ✏️ Modified | ${uniqueModified} | 🟡 Visual |\n`;
    }
    if (breakingRemoved > 0) {
      md += `| ➖ Removed (breaking) | ${breakingRemoved} | 🔴 Breaking |\n`;
    }
    if (internalRemoved > 0) {
      md += `| ➖ Removed (internal) | ${internalRemoved} | 🟢 Safe |\n`;
    }
    if (breakingRenames > 0) {
      md += `| 🔄 Renamed (breaking) | ${breakingRenames} | 🔴 Breaking |\n`;
    }
    if (internalRenames > 0) {
      md += `| 🔄 Renamed (internal) | ${internalRenames} | 🟢 Safe |\n`;
    }

    md += '\n';

    // Overall risk indicator - only consumption layer changes are breaking
    const hasBreaking = breakingRemoved > 0 || breakingRenames > 0;
    const hasVisual = uniqueModified > 0;
    if (hasBreaking) {
      md += '**Overall Risk:** 🔴 Breaking Changes Detected\n\n';
    } else if (hasVisual) {
      md += '**Overall Risk:** 🟡 Visual Changes\n\n';
    } else {
      md += '**Overall Risk:** 🟢 Safe (Additions Only)\n\n';
    }
  } else {
    md += '⚪ **No token changes detected**\n\n';
  }

  // Warning if no baseline available
  if (noBaseline) {
    md += '> ⚠️ **Hinweis:** Keine Baseline in `main` gefunden. Alle Tokens werden als "Added" angezeigt.\n';
    md += '> Dies kann passieren bei:\n';
    md += '> - Erstem PR (noch keine Tokens in main)\n';
    md += '> - Source-Datei wurde in main gelöscht\n\n';
  }

  // Build status
  if (totalBuilds > 0) {
    md += `**Build:** ${buildSuccess ? '✅' : '❌'} (${successfulBuilds}/${totalBuilds})`;
    if (commitSha) md += ` | **Commit:** \`${commitSha}\``;
    md += '\n';
  }

  // Affected brands
  const brands = Object.keys(diff.byBrand || {});
  if (brands.length > 0) {
    md += `**Brands:** ${brands.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join(', ')}\n`;
  }

  // Affected components
  const components = Object.keys(diff.byComponent || {});
  if (components.length > 0) {
    const displayComponents = components.slice(0, 5);
    const more = components.length > 5 ? ` +${components.length - 5} more` : '';
    md += `**Components:** ${displayComponents.join(', ')}${more}\n`;
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
      md += `| \`${token.displayName}\` | \`${token.value}\` |\n`;
    }

    if (removed.length > maxTokensPerSection) {
      md += `| ... | *${removed.length - maxTokensPerSection} more* |\n`;
    }

    // Platform-specific names (collapsible) - horizontal table
    const groupedTokens = getPlatformNamesGroupedByToken(displayTokens);
    md += generatePlatformNamesTable(groupedTokens);

    md += '\n';
  }

  // Modified tokens
  if (modified.length > 0) {
    md += `### 🟡 Modified (${modified.length})\n\n`;
    md += '> ℹ️ Values may vary by brand/mode.\n\n';
    md += '| Token | Change |\n';
    md += '|-------|--------|\n';

    const displayTokens = modified.slice(0, maxTokensPerSection);
    for (const token of displayTokens) {
      const changeDisplay = formatValueChange(token.oldValue, token.newValue);
      md += `| \`${token.displayName}\` | ${changeDisplay} |\n`;
    }

    if (modified.length > maxTokensPerSection) {
      md += `| ... | *${modified.length - maxTokensPerSection} more* |\n`;
    }

    // Platform-specific names (collapsible) - horizontal table
    const groupedTokens = getPlatformNamesGroupedByToken(displayTokens);
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
      md += `| \`${token.displayName}\` | \`${token.value}\` |\n`;
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
  md += '| Old Name | New Name | CSS | JS | Swift | Kotlin |\n';
  md += '|----------|----------|-----|-------|-------|--------|\n';

  for (const entry of platformNames) {
    const p = entry.platforms;
    md += `| \`${entry.oldName}\` `;
    md += `| \`${entry.newName}\` `;
    md += `| \`${p.css || '-'}\` `;
    md += `| \`${p.js || p.json || '-'}\` `;
    md += `| \`${p.swift || '-'}\` `;
    md += `| \`${p.kotlin || '-'}\` |\n`;
  }

  md += '\n</details>\n';
  return md;
}

/**
 * Generate breaking changes section - shows ONLY breaking changes
 * Breaking = Removed OR Renamed in consumption layer (semantic + component)
 * Internal (primitive) changes are shown in Safe Changes section
 *
 * Structure: Split by layer (Semantic, Component, Typography, Effects)
 * No table limits for breaking changes - all must be visible!
 */
function generateBreakingChangesSection(diff, options = {}) {
  // Collect removed tokens - only consumption layer
  const allRemovedTokens = diff?.byUniqueToken?.removed || [];
  const breakingRemovedTokens = allRemovedTokens.filter(t => CONSUMPTION_LAYERS.includes(t.layer));

  // Split removed by layer
  const removedSemantic = breakingRemovedTokens.filter(t => t.layer === 'semantic');
  const removedComponent = breakingRemovedTokens.filter(t => t.layer === 'component');

  // Collect removed combined tokens (Typography + Effects styles)
  const removedTypography = diff?.styleChanges?.typography?.removed || [];
  const removedEffects = diff?.styleChanges?.effects?.removed || [];

  // Collect breaking renames - only consumption layer
  const variableRenames = diff?.renames || [];
  const styleRenames = diff?.styleRenames || [];
  const breakingVariableRenames = variableRenames.filter(r => CONSUMPTION_LAYERS.includes(r.layer));
  const breakingStyleRenames = styleRenames.filter(r => CONSUMPTION_LAYERS.includes(r.layer));

  // Split renames by layer
  const renamesSemantic = breakingVariableRenames.filter(r => r.layer === 'semantic');
  const renamesComponent = breakingVariableRenames.filter(r => r.layer === 'component');

  const totalBreakingRenames = breakingVariableRenames.length + breakingStyleRenames.length;
  const hasBreakingChanges = breakingRemovedTokens.length > 0 ||
    removedTypography.length > 0 || removedEffects.length > 0 || totalBreakingRenames > 0;

  if (!hasBreakingChanges) return '';

  let md = '## 🔴 Breaking Changes\n\n';
  md += '> ⚠️ **These changes require code updates**\n\n';

  // === REMOVED TOKENS BY LAYER ===
  if (breakingRemovedTokens.length > 0) {
    md += `### ➖ Removed Tokens (${breakingRemovedTokens.length})\n\n`;

    // Semantic Layer
    if (removedSemantic.length > 0) {
      md += `#### 🎯 Semantic (${removedSemantic.length})\n\n`;
      md += '| Token | Previous Value | Category |\n';
      md += '|-------|----------------|----------|\n';
      for (const token of removedSemantic) {
        const cat = CATEGORY_CONFIG[categorizeTokenForDisplay(token.displayName, token.value)] || CATEGORY_CONFIG.other;
        md += `| \`${token.displayName}\` | \`${token.value}\` | ${cat.icon} ${cat.label} |\n`;
      }
      md += '\n';
    }

    // Component Layer
    if (removedComponent.length > 0) {
      md += `#### 🧩 Component (${removedComponent.length})\n\n`;
      md += '| Token | Previous Value | Category |\n';
      md += '|-------|----------------|----------|\n';
      for (const token of removedComponent) {
        const cat = CATEGORY_CONFIG[categorizeTokenForDisplay(token.displayName, token.value)] || CATEGORY_CONFIG.other;
        md += `| \`${token.displayName}\` | \`${token.value}\` | ${cat.icon} ${cat.label} |\n`;
      }
      md += '\n';
    }
  }

  // === REMOVED TYPOGRAPHY STYLES ===
  if (removedTypography.length > 0) {
    md += `#### 📝 Typography Styles (${removedTypography.length})\n\n`;
    md += '| Style Name |\n';
    md += '|------------|\n';
    for (const style of removedTypography) {
      md += `| \`${style.name}\` |\n`;
    }
    md += '\n';
  }

  // === REMOVED EFFECTS ===
  if (removedEffects.length > 0) {
    md += `#### ✨ Effects (${removedEffects.length})\n\n`;
    md += '| Style Name |\n';
    md += '|------------|\n';
    for (const style of removedEffects) {
      md += `| \`${style.name}\` |\n`;
    }
    md += '\n';
  }

  // === RENAMED TOKENS BY LAYER ===
  if (totalBreakingRenames > 0) {
    md += `### 🔄 Renamed Tokens (${totalBreakingRenames})\n\n`;

    // Semantic Layer Renames
    if (renamesSemantic.length > 0) {
      md += `#### 🎯 Semantic (${renamesSemantic.length})\n\n`;
      md += '| Old Name | → | New Name | Category |\n';
      md += '|----------|:-:|----------|----------|\n';
      for (const rename of renamesSemantic) {
        const catConfig = CATEGORY_CONFIG[rename.category] || CATEGORY_CONFIG.other;
        md += `| \`${rename.oldName}\` | → | \`${rename.newName}\` | ${catConfig.icon} |\n`;
      }
      md += generateRenamePlatformTable(renamesSemantic, diff);
      md += '\n';
    }

    // Component Layer Renames
    if (renamesComponent.length > 0) {
      md += `#### 🧩 Component (${renamesComponent.length})\n\n`;
      md += '| Old Name | → | New Name | Category |\n';
      md += '|----------|:-:|----------|----------|\n';
      for (const rename of renamesComponent) {
        const catConfig = CATEGORY_CONFIG[rename.category] || CATEGORY_CONFIG.other;
        md += `| \`${rename.oldName}\` | → | \`${rename.newName}\` | ${catConfig.icon} |\n`;
      }
      md += generateRenamePlatformTable(renamesComponent, diff);
      md += '\n';
    }

    // Style Renames (Typography + Effects)
    if (breakingStyleRenames.length > 0) {
      const typoRenames = breakingStyleRenames.filter(r => r.type === 'typography');
      const effectRenames = breakingStyleRenames.filter(r => r.type === 'effects');

      if (typoRenames.length > 0) {
        md += `#### 📝 Typography Styles (${typoRenames.length})\n\n`;
        md += '| Old Name | → | New Name |\n';
        md += '|----------|:-:|----------|\n';
        for (const rename of typoRenames) {
          md += `| \`${rename.oldName}\` | → | \`${rename.newName}\` |\n`;
        }
        md += '\n';
      }

      if (effectRenames.length > 0) {
        md += `#### ✨ Effects (${effectRenames.length})\n\n`;
        md += '| Old Name | → | New Name |\n';
        md += '|----------|:-:|----------|\n';
        for (const rename of effectRenames) {
          md += `| \`${rename.oldName}\` | → | \`${rename.newName}\` |\n`;
        }
        md += '\n';
      }
    }
  }

  // Migration help for all breaking changes
  const allBreakingRenames = [...breakingVariableRenames, ...breakingStyleRenames];
  if (allBreakingRenames.length > 0) {
    md += '<details>\n<summary>📋 Migration Commands</summary>\n\n';
    md += '```bash\n# Find & Replace suggestions:\n';
    for (const rename of allBreakingRenames.slice(0, 15)) {
      md += `# ${rename.oldName} → ${rename.newName}\n`;
    }
    if (allBreakingRenames.length > 15) {
      md += `# ... and ${allBreakingRenames.length - 15} more\n`;
    }
    md += '```\n\n</details>\n\n';
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
 * Generate a color matrix table for a single token
 * Shows actual values with change arrows, compact delta summary below
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
    let md = `**\`${token.displayName}\`**\n\n`;
    md += '| Mode | Change |\n';
    md += '|------|--------|\n';

    const deltaInfos = [];
    for (const mode of modeList) {
      const ctx = contexts[mode] || contexts[`/${mode}`];
      if (ctx) {
        const deltaE = calculateDeltaE(ctx.old, ctx.new);
        if (deltaE) deltaInfos.push({ mode, ...deltaE });
        md += `| ${mode} | \`${ctx.old}\` → \`${ctx.new}\` |\n`;
      }
    }

    // Compact delta summary
    if (deltaInfos.length > 0) {
      const deltaStr = deltaInfos.map(d => `${d.mode}: ${d.icon} ΔE ${d.deltaE}`).join(' · ');
      md += `\n> ${deltaStr}\n`;
    }
    return md + '\n';
  }

  // Full matrix: brands × modes
  if (brandList.length > 0 && modeList.length > 0) {
    let md = `**\`${token.displayName}\`**\n\n`;
    md += '| | ' + brandList.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join(' | ') + ' |\n';
    md += '|---' + brandList.map(() => '|---').join('') + '|\n';

    const deltaInfos = [];

    for (const mode of modeList) {
      const modeLabel = mode === 'light' ? '☀️' : '🌙';
      const cells = brandList.map(brand => {
        const key = `${brand}/${mode}`;
        const ctx = contexts[key];
        if (!ctx) return '–';

        const deltaE = calculateDeltaE(ctx.old, ctx.new);
        if (deltaE) {
          deltaInfos.push({ brand, mode, ...deltaE });
        }
        // Show values with icon prefix
        return `${deltaE?.icon || '🟡'} \`${ctx.old}\` → \`${ctx.new}\``;
      });
      md += `| ${modeLabel} ${mode} | ${cells.join(' | ')} |\n`;
    }

    // Compact delta summary line
    if (deltaInfos.length > 0) {
      const deltaStr = deltaInfos
        .map(d => `${d.brand}/${d.mode}: ΔE ${d.deltaE} (${d.perception})`)
        .join(' · ');
      md += `\n> 📊 ${deltaStr}\n`;
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
    let md = `**\`${token.displayName}\`**\n\n`;
    md += '| BP | Change |\n';
    md += '|----|--------|\n';

    const diffInfos = [];
    for (const bp of bpList) {
      const ctx = contexts[bp] || contexts[`/${bp}`];
      if (ctx) {
        const dimDiff = calculateDimensionDiff(ctx.old, ctx.new);
        if (dimDiff) diffInfos.push({ bp, ...dimDiff });
        md += `| ${bpLabels[bp] || ''} ${bp} | \`${ctx.old}\` → \`${ctx.new}\` |\n`;
      }
    }

    // Compact diff summary
    if (diffInfos.length > 0) {
      const diffStr = diffInfos.map(d => `${d.bp}: ${d.icon} ${d.display}`).join(' · ');
      md += `\n> ${diffStr}\n`;
    }
    return md + '\n';
  }

  // Full matrix: brands × breakpoints
  if (brandList.length > 0 && bpList.length > 1) {
    let md = `**\`${token.displayName}\`**\n\n`;
    md += '| | ' + brandList.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join(' | ') + ' |\n';
    md += '|---' + brandList.map(() => '|---').join('') + '|\n';

    const diffInfos = [];

    for (const bp of bpList) {
      const cells = brandList.map(brand => {
        const key = `${brand}/${bp}`;
        const ctx = contexts[key];
        if (!ctx) return '–';

        const dimDiff = calculateDimensionDiff(ctx.old, ctx.new);
        if (dimDiff) {
          diffInfos.push({ brand, bp, ...dimDiff, old: ctx.old, new: ctx.new });
        }
        // Show values with icon prefix
        return `${dimDiff?.icon || '🟡'} \`${ctx.old}\` → \`${ctx.new}\``;
      });
      md += `| ${bpLabels[bp] || ''} ${bp} | ${cells.join(' | ')} |\n`;
    }

    // Compact diff summary line
    if (diffInfos.length > 0) {
      const diffStr = diffInfos
        .map(d => `${d.brand}/${d.bp}: ${d.display}`)
        .join(' · ');
      md += `\n> 📊 ${diffStr}\n`;
    }

    return md + '\n';
  }

  return null;
}

/**
 * Generate simple row for token without multiple contexts
 */
function generateSimpleColorRow(token) {
  const deltaE = calculateDeltaE(token.oldValue, token.newValue);
  const diffInfo = deltaE ? `${deltaE.icon} ΔE=${deltaE.deltaE} (${deltaE.perception})` : '';
  return `| \`${token.displayName}\` | \`${token.oldValue}\` → \`${token.newValue}\` | ${diffInfo} |\n`;
}

function generateSimpleDimensionRow(token) {
  const dimDiff = calculateDimensionDiff(token.oldValue, token.newValue);
  const diffDisplay = dimDiff ? `${dimDiff.icon} ${dimDiff.display}` : '';
  return `| \`${token.displayName}\` | \`${token.oldValue}\` → \`${token.newValue}\` | ${diffDisplay} |\n`;
}

/**
 * Generate visual changes section - shows modified tokens grouped by category
 * with visual diff calculations (Delta E for colors, % for dimensions)
 * Uses matrix display for tokens with multiple contexts (brand/mode/breakpoint)
 */
function generateVisualChangesSection(diff, options = {}) {
  const { maxTokens = 12 } = options;

  // Get modified tokens (only atomic value changes, no combined tokens)
  const modifiedTokens = diff?.byUniqueToken?.modified || [];
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
    const category = categorizeTokenForDisplay(token.displayName, token.oldValue);
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

    // Simple tokens in table
    if (byCategory.colors.simple.length > 0) {
      md += '| Token | Change | Visual Diff |\n';
      md += '|-------|--------|-------------|\n';
      for (const token of byCategory.colors.simple.slice(0, maxTokens)) {
        md += generateSimpleColorRow(token);
      }
      if (byCategory.colors.simple.length > maxTokens) {
        md += `| ... | *${byCategory.colors.simple.length - maxTokens} more* | |\n`;
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
      md += '| Token | Change | Diff |\n';
      md += '|-------|--------|------|\n';
      for (const token of byCategory.typography.simple.slice(0, maxTokens)) {
        md += generateSimpleDimensionRow(token);
      }
      if (byCategory.typography.simple.length > maxTokens) {
        md += `| ... | *${byCategory.typography.simple.length - maxTokens} more* | |\n`;
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
      md += '| Token | Change | Diff |\n';
      md += '|-------|--------|------|\n';
      for (const token of byCategory.spacing.simple.slice(0, maxTokens)) {
        md += generateSimpleDimensionRow(token);
      }
      if (byCategory.spacing.simple.length > maxTokens) {
        md += `| ... | *${byCategory.spacing.simple.length - maxTokens} more* | |\n`;
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
      md += '| Token | Change | Diff |\n';
      md += '|-------|--------|------|\n';
      for (const token of byCategory.sizing.simple.slice(0, maxTokens)) {
        md += generateSimpleDimensionRow(token);
      }
      if (byCategory.sizing.simple.length > maxTokens) {
        md += `| ... | *${byCategory.sizing.simple.length - maxTokens} more* | |\n`;
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
      md += `| \`${token.displayName}\` | \`${token.oldValue}\` → \`${token.newValue}\` |\n`;
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
      md += `| \`${token.displayName}\` | \`${token.oldValue}\` → \`${token.newValue}\` |\n`;
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
 */
function generateSafeChangesSection(diff, options = {}) {
  const { maxTokens = 10 } = options;

  // Get added tokens
  const addedTokens = diff?.byUniqueToken?.added || [];

  // Get internal changes (from breaking changes section data)
  const allRemovedTokens = diff?.byUniqueToken?.removed || [];
  const internalRemovedTokens = allRemovedTokens.filter(t => !CONSUMPTION_LAYERS.includes(t.layer));

  const variableRenames = diff?.renames || [];
  const nonBreakingRenames = variableRenames.filter(r => !CONSUMPTION_LAYERS.includes(r.layer));

  const hasAdded = addedTokens.length > 0;
  const hasInternal = internalRemovedTokens.length > 0 || nonBreakingRenames.length > 0;

  if (!hasAdded && !hasInternal) return '';

  let md = '## 🟢 Safe Changes\n\n';

  // Added Tokens grouped by category
  if (hasAdded) {
    md += `### ➕ Added Tokens (${addedTokens.length})\n\n`;

    // Group by category
    const byCategory = {
      colors: [],
      typography: [],
      spacing: [],
      sizing: [],
      effects: [],
      other: []
    };

    for (const token of addedTokens) {
      const category = categorizeTokenForDisplay(token.displayName, token.value);
      if (byCategory[category]) {
        byCategory[category].push(token);
      } else {
        byCategory.other.push(token);
      }
    }

    for (const [category, tokens] of Object.entries(byCategory)) {
      if (tokens.length === 0) continue;

      const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
      md += `<details>\n<summary>${config.icon} ${config.label} (${tokens.length})</summary>\n\n`;
      md += '| Token | Value |\n';
      md += '|-------|-------|\n';

      for (const token of tokens.slice(0, maxTokens)) {
        md += `| \`${token.displayName}\` | \`${token.value}\` |\n`;
      }

      if (tokens.length > maxTokens) {
        md += `| ... | *${tokens.length - maxTokens} more* |\n`;
      }

      md += '\n</details>\n\n';
    }
  }

  // Internal Changes (Primitive Layer)
  if (hasInternal) {
    const totalInternal = internalRemovedTokens.length + nonBreakingRenames.length;
    md += `### 🔧 Internal Changes (${totalInternal})\n\n`;
    md += '<details>\n<summary>Primitive layer cleanup (no consumer impact)</summary>\n\n';

    if (internalRemovedTokens.length > 0) {
      md += `**Removed (${internalRemovedTokens.length}):**\n\n`;
      md += '| Token | Previous Value |\n';
      md += '|-------|----------------|\n';

      for (const token of internalRemovedTokens.slice(0, maxTokens)) {
        md += `| \`${token.displayName}\` | \`${token.value}\` |\n`;
      }

      if (internalRemovedTokens.length > maxTokens) {
        md += `| ... | *${internalRemovedTokens.length - maxTokens} more* |\n`;
      }
      md += '\n';
    }

    if (nonBreakingRenames.length > 0) {
      md += `**Renamed (${nonBreakingRenames.length}):**\n\n`;
      md += '| Old Name | → | New Name |\n';
      md += '|----------|:---:|----------|\n';

      for (const rename of nonBreakingRenames.slice(0, maxTokens)) {
        md += `| \`${rename.oldName}\` | → | \`${rename.newName}\` |\n`;
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
 * Helper to categorize token for display (used for removed tokens)
 */
function categorizeTokenForDisplay(tokenName, value) {
  const name = (tokenName || '').toLowerCase();

  // Color detection by value
  if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
    return 'colors';
  }

  // Name-based detection
  if (/color|bg|background|foreground|fill|stroke|text-color|surface|accent/i.test(name)) {
    return 'colors';
  }
  if (/font-?size|line-?height|letter-?spacing|font-?weight|font-?family|typography/i.test(name)) {
    return 'typography';
  }
  if (/space|gap|inline|stack|inset|margin|padding/i.test(name)) {
    return 'spacing';
  }
  if (/shadow|effect|elevation|blur/i.test(name)) {
    return 'effects';
  }
  if (/size|width|height|radius|border-radius/i.test(name)) {
    return 'sizing';
  }

  return 'other';
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
// LAYER 2c: CATEGORIZED CHANGES (Consumption Layer Only)
// =============================================================================

/**
 * Filter tokens to only include consumption layer (semantic + component)
 */
function filterConsumptionLayer(tokens) {
  if (!tokens) return [];
  return tokens.filter(t => CONSUMPTION_LAYERS.includes(t.layer) || !t.layer);
}

/**
 * Generate categorized changes section - groups changes by token category
 * Only shows consumption layer tokens (semantic + component), not primitives
 */
function generateCategorizedChangesSection(diff, options = {}) {
  if (!diff || !diff.byCategory) return '';

  const { maxTokensPerCategory = 10 } = options;
  let md = '## 📊 Changes by Category\n\n';
  md += '> 🎯 Showing Modified & Added tokens (Removed tokens are in Breaking Changes above)\n\n';
  let hasChanges = false;

  for (const category of CATEGORY_ORDER) {
    const catData = diff.byCategory[category];
    if (!catData) continue;

    // Filter to only consumption layer tokens
    // Note: Removed tokens are shown in Breaking Changes section, not here
    const modified = filterConsumptionLayer(catData.modified || []);
    const added = filterConsumptionLayer(catData.added || []);
    const total = modified.length + added.length;

    if (total === 0) continue;
    hasChanges = true;

    const config = CATEGORY_CONFIG[category];
    md += `<details>\n<summary>${config.icon} <b>${config.label}</b> (${total} changes)</summary>\n\n`;

    // Modified
    if (modified.length > 0) {
      md += `**Modified (${modified.length}):**\n\n`;
      md += '| Token | Old | New |\n|-------|-----|-----|\n';
      for (const token of modified.slice(0, maxTokensPerCategory)) {
        md += `| \`${token.displayName}\` | \`${token.oldValue}\` | \`${token.newValue}\` |\n`;
      }
      if (modified.length > maxTokensPerCategory) {
        md += `| ... | *${modified.length - maxTokensPerCategory} more* | |\n`;
      }
      md += '\n';
    }

    // Added
    if (added.length > 0) {
      md += `**Added (${added.length}):**\n\n`;
      md += '| Token | Value |\n|-------|-------|\n';
      for (const token of added.slice(0, maxTokensPerCategory)) {
        md += `| \`${token.displayName}\` | \`${token.value}\` |\n`;
      }
      if (added.length > maxTokensPerCategory) {
        md += `| ... | *${added.length - maxTokensPerCategory} more* |\n`;
      }
      md += '\n';
    }

    md += '</details>\n\n';
  }

  if (!hasChanges) return '';

  md += '---\n\n';
  return md;
}

// =============================================================================
// LAYER 2e: SOURCE CHANGES (Primitives)
// =============================================================================

/**
 * Generate source changes section for primitive tokens
 * Shows low-level token changes that affect semantic/component layers
 */
function generateSourceChangesSection(diff, options = {}) {
  if (!diff || !diff.byLayer || !diff.byLayer.primitive) return '';

  const { maxTokens = 10 } = options;
  const primitives = diff.byLayer.primitive;

  const modified = primitives.modified || [];
  const added = primitives.added || [];
  const removed = primitives.removed || [];
  const total = modified.length + added.length + removed.length;

  if (total === 0) return '';

  let md = '## ⚙️ Source Changes\n\n';
  md += '<details>\n';
  md += `<summary>Primitive Token Updates (${total} changes)</summary>\n\n`;
  md += '> ℹ️ Low-level tokens that may affect semantic/component values\n\n';

  // Modified primitives
  if (modified.length > 0) {
    md += `**Modified (${modified.length}):**\n\n`;
    md += '| Token | Change | Category |\n';
    md += '|-------|--------|----------|\n';
    for (const token of modified.slice(0, maxTokens)) {
      const cat = CATEGORY_CONFIG[categorizeTokenForDisplay(token.displayName, token.oldValue)] || CATEGORY_CONFIG.other;
      const changeDisplay = `\`${token.oldValue}\` → \`${token.newValue}\``;
      md += `| \`${token.displayName}\` | ${changeDisplay} | ${cat.icon} |\n`;
    }
    if (modified.length > maxTokens) {
      md += `| ... | *${modified.length - maxTokens} more* | |\n`;
    }
    md += '\n';
  }

  // Added primitives
  if (added.length > 0) {
    md += `**Added (${added.length}):**\n\n`;
    md += '| Token | Value | Category |\n';
    md += '|-------|-------|----------|\n';
    for (const token of added.slice(0, maxTokens)) {
      const cat = CATEGORY_CONFIG[categorizeTokenForDisplay(token.displayName, token.value)] || CATEGORY_CONFIG.other;
      md += `| \`${token.displayName}\` | \`${token.value}\` | ${cat.icon} |\n`;
    }
    if (added.length > maxTokens) {
      md += `| ... | *${added.length - maxTokens} more* | |\n`;
    }
    md += '\n';
  }

  // Removed primitives
  if (removed.length > 0) {
    md += `**Removed (${removed.length}):**\n\n`;
    md += '| Token | Previous Value | Category |\n';
    md += '|-------|----------------|----------|\n';
    for (const token of removed.slice(0, maxTokens)) {
      const cat = CATEGORY_CONFIG[categorizeTokenForDisplay(token.displayName, token.value)] || CATEGORY_CONFIG.other;
      md += `| \`${token.displayName}\` | \`${token.value}\` | ${cat.icon} |\n`;
    }
    if (removed.length > maxTokens) {
      md += `| ... | *${removed.length - maxTokens} more* | |\n`;
    }
    md += '\n';
  }

  md += '</details>\n\n';
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
// LAYER 3: PLATFORM DETAILS
// =============================================================================

function generatePlatformDetails(diff, options = {}) {
  if (!diff || !diff.platforms) return '';

  const { maxTokensPerSection = 15 } = options;

  let md = '## 📝 Platform Details\n\n';

  for (const platformKey of PLATFORM_ORDER) {
    const platform = diff.platforms[platformKey];
    if (!platform) continue;

    const totalChanges = platform.tokensAdded + platform.tokensModified + platform.tokensRemoved;
    if (totalChanges === 0 && platform.changes.length === 0) {
      continue;
    }

    // Platform header as collapsible section
    md += `<details>\n`;
    md += `<summary>${platform.icon} <b>${platform.name}</b> — `;
    md += `+${platform.tokensAdded} / ~${platform.tokensModified} / -${platform.tokensRemoved} tokens`;
    md += `</summary>\n\n`;

    // Group changes by type
    const removedFiles = platform.changes.filter(c => c.type === 'removed');
    const modifiedFiles = platform.changes.filter(c => c.type === 'modified');
    const addedFiles = platform.changes.filter(c => c.type === 'added');

    // Breaking changes (removed)
    const hasRemovedTokens = removedFiles.length > 0 || modifiedFiles.some(f => f.changes?.removed?.length > 0);
    if (hasRemovedTokens) {
      md += '#### 🔴 Breaking Changes (Removed)\n\n';
      md += '| Token | Previous Value | File |\n';
      md += '|-------|----------------|------|\n';

      let count = 0;

      for (const file of removedFiles) {
        for (const token of file.tokens.slice(0, 5)) {
          if (count >= maxTokensPerSection) break;
          md += `| \`${token.name}\` | \`${token.value}\` | \`${path.basename(file.file)}\` |\n`;
          count++;
        }
        if (file.tokens.length > 5 && count < maxTokensPerSection) {
          md += `| ... | *${file.tokens.length - 5} more in file* | |\n`;
        }
      }

      for (const file of modifiedFiles) {
        if (!file.changes?.removed) continue;
        for (const token of file.changes.removed.slice(0, 3)) {
          if (count >= maxTokensPerSection) break;
          md += `| \`${token.name}\` | \`${token.value}\` | \`${path.basename(file.file)}\` |\n`;
          count++;
        }
      }

      if (count >= maxTokensPerSection) {
        const totalRemoved = removedFiles.reduce((sum, f) => sum + f.tokens.length, 0) +
          modifiedFiles.reduce((sum, f) => sum + (f.changes?.removed?.length || 0), 0);
        md += `| ... | *${totalRemoved - count} more* | |\n`;
      }

      md += '\n';
    }

    // Modified tokens
    const allModified = modifiedFiles.filter(f => f.changes?.modified?.length > 0);
    if (allModified.length > 0) {
      md += '#### 🟡 Modified\n\n';
      md += '| Token | Old | New | File |\n';
      md += '|-------|-----|-----|------|\n';

      let count = 0;
      for (const file of allModified) {
        for (const token of file.changes.modified) {
          if (count >= maxTokensPerSection) break;
          md += `| \`${token.name}\` | \`${token.oldValue}\` | \`${token.newValue}\` | \`${path.basename(file.file)}\` |\n`;
          count++;
        }
        if (count >= maxTokensPerSection) break;
      }

      if (count >= maxTokensPerSection) {
        const totalModified = allModified.reduce((sum, f) => sum + f.changes.modified.length, 0);
        md += `| ... | | *${totalModified - count} more* | |\n`;
      }

      md += '\n';
    }

    // Added tokens
    const hasAddedTokens = addedFiles.length > 0 || modifiedFiles.some(f => f.changes?.added?.length > 0);
    if (hasAddedTokens) {
      md += '#### 🟢 Added\n\n';
      md += '| Token | Value | File |\n';
      md += '|-------|-------|------|\n';

      let count = 0;

      for (const file of addedFiles) {
        for (const token of file.tokens.slice(0, 5)) {
          if (count >= maxTokensPerSection) break;
          md += `| \`${token.name}\` | \`${token.value}\` | \`${path.basename(file.file)}\` |\n`;
          count++;
        }
      }

      for (const file of modifiedFiles) {
        if (!file.changes?.added) continue;
        for (const token of file.changes.added.slice(0, 3)) {
          if (count >= maxTokensPerSection) break;
          md += `| \`${token.name}\` | \`${token.value}\` | \`${path.basename(file.file)}\` |\n`;
          count++;
        }
      }

      if (count >= maxTokensPerSection) {
        md += `| ... | *more tokens* | |\n`;
      }

      md += '\n';
    }

    md += '</details>\n\n';
  }

  return md;
}

// =============================================================================
// LAYER 4: TECHNICAL DETAILS
// =============================================================================

function generateTechnicalDetails(diff, options = {}) {
  const { runId = '' } = options;
  const repo = process.env.GITHUB_REPOSITORY || 'UXWizard25/vv-token-test-v3';

  let md = '## ⚙️ Technical Details\n\n';

  // Changed files by platform
  md += '<details>\n';
  md += '<summary>📁 <b>All Changed Files</b></summary>\n\n';

  if (diff && diff.platforms) {
    for (const platformKey of PLATFORM_ORDER) {
      const platform = diff.platforms[platformKey];
      if (!platform || platform.changes.length === 0) continue;

      md += `#### ${platform.icon} ${platform.name}\n\n`;

      const files = platform.changes.map(c => c.file).slice(0, 15);
      for (const file of files) {
        md += `- \`${file}\`\n`;
      }

      if (platform.changes.length > 15) {
        md += `- *... and ${platform.changes.length - 15} more files*\n`;
      }

      md += '\n';
    }
  }

  md += '</details>\n\n';

  // Statistics
  md += '<details>\n';
  md += '<summary>📊 <b>Build Statistics</b></summary>\n\n';

  if (diff && diff.summary) {
    const s = diff.summary;
    const uniqueAdded = s.uniqueTokensAdded ?? s.tokensAdded;
    const uniqueModified = s.uniqueTokensModified ?? s.tokensModified;
    const uniqueRemoved = s.uniqueTokensRemoved ?? s.tokensRemoved;

    md += '```\n';
    md += `Files Changed:  ${s.filesAdded + s.filesModified + s.filesRemoved}\n`;
    md += `  - Added:      ${s.filesAdded}\n`;
    md += `  - Modified:   ${s.filesModified}\n`;
    md += `  - Removed:    ${s.filesRemoved}\n`;
    md += `\n`;
    md += `Unique Tokens Changed: ${uniqueAdded + uniqueModified + uniqueRemoved}\n`;
    md += `  - Added:      ${uniqueAdded}\n`;
    md += `  - Modified:   ${uniqueModified}\n`;
    md += `  - Removed:    ${uniqueRemoved}\n`;
    md += `\n`;
    md += `Platform Occurrences: ${s.tokensAdded + s.tokensModified + s.tokensRemoved}\n`;
    md += `  - Added:      ${s.tokensAdded}\n`;
    md += `  - Modified:   ${s.tokensModified}\n`;
    md += `  - Removed:    ${s.tokensRemoved}\n`;
    md += `\n`;
    md += `Impact Level:   ${s.impactLevel}\n`;
    md += '```\n\n';
  }

  md += '</details>\n\n';

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
      const oldSimple = rename.oldName.split('/').pop();
      const newSimple = rename.newName.split('/').pop();
      output += `    🔄 ${oldSimple} → ${newSimple}\n`;
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
 * Generate GitHub Release format (summary-first, consumer-focused)
 */
function generateGitHubRelease(diff, options = {}) {
  const { version = 'latest', packageSize = '', successfulBuilds = 0, totalBuilds = 0 } = options;
  const repo = process.env.GITHUB_REPOSITORY || 'UXWizard25/vv-token-test-v3';

  let md = `## 🎨 Design Tokens v${version}\n\n`;

  // Installation
  md += '### 📦 Installation\n\n';
  md += '```bash\n';
  md += `npm install @marioschmidt/design-system-tokens@${version}\n`;
  md += '```\n\n';

  // Breaking changes first (if any)
  if (diff?.byUniqueToken?.removed?.length > 0) {
    md += '### ⚠️ Breaking Changes\n\n';
    md += `**${diff.byUniqueToken.removed.length} token(s) removed** - Migration may be required\n\n`;

    const removed = diff.byUniqueToken.removed.slice(0, 5);
    md += '| Removed Token | Previous Value |\n';
    md += '|---------------|----------------|\n';
    for (const token of removed) {
      md += `| \`${token.displayName}\` | \`${token.value}\` |\n`;
    }
    if (diff.byUniqueToken.removed.length > 5) {
      md += `| ... | *${diff.byUniqueToken.removed.length - 5} more* |\n`;
    }
    md += '\n';
  }

  // Renamed tokens (if any)
  if (diff?.renames?.length > 0) {
    md += '### 🔄 Renamed Tokens\n\n';
    md += '| Old Name | → | New Name |\n';
    md += '|----------|:---:|----------|\n';
    for (const rename of diff.renames.slice(0, 10)) {
      md += `| \`${rename.oldName}\` | → | \`${rename.newName}\` |\n`;
    }
    if (diff.renames.length > 10) {
      md += `| ... | | *${diff.renames.length - 10} more* |\n`;
    }
    md += '\n';
  }

  // Summary table
  if (diff?.summary) {
    const s = diff.summary;
    const uniqueRemoved = s.uniqueTokensRemoved ?? s.tokensRemoved ?? 0;
    const uniqueModified = s.uniqueTokensModified ?? s.tokensModified ?? 0;
    const uniqueAdded = s.uniqueTokensAdded ?? s.tokensAdded ?? 0;
    const uniqueRenamed = s.uniqueTokensRenamed ?? 0;
    const total = uniqueRemoved + uniqueModified + uniqueAdded + uniqueRenamed;

    if (total > 0) {
      md += '### 📊 Changes Summary\n\n';
      md += '| Type | Count | Impact |\n';
      md += '|------|------:|--------|\n';
      if (uniqueRemoved > 0) {
        md += `| 🔴 Removed | ${uniqueRemoved} | ⚠️ Breaking |\n`;
      }
      if (uniqueRenamed > 0) {
        md += `| 🔄 Renamed | ${uniqueRenamed} | Migration needed |\n`;
      }
      if (uniqueModified > 0) {
        md += `| 🟡 Modified | ${uniqueModified} | Visual changes |\n`;
      }
      if (uniqueAdded > 0) {
        md += `| 🟢 Added | ${uniqueAdded} | New features |\n`;
      }
      md += '\n';
    }
  }

  // Categorized changes (collapsible)
  if (diff?.byCategory) {
    let hasChanges = false;
    for (const cat of CATEGORY_ORDER) {
      const catData = diff.byCategory[cat];
      if (catData && ((catData.modified?.length || 0) + (catData.added?.length || 0) + (catData.removed?.length || 0) > 0)) {
        hasChanges = true;
        break;
      }
    }

    if (hasChanges) {
      md += '<details>\n';
      md += '<summary>📝 <b>View Changes by Category</b></summary>\n\n';

      for (const category of CATEGORY_ORDER) {
        const catData = diff.byCategory[category];
        if (!catData) continue;

        const modified = catData.modified || [];
        const added = catData.added || [];
        const removed = catData.removed || [];
        const total = modified.length + added.length + removed.length;
        if (total === 0) continue;

        const config = CATEGORY_CONFIG[category];
        md += `#### ${config.icon} ${config.label} (${total})\n\n`;

        if (modified.length > 0) {
          md += '**Modified:**\n';
          for (const token of modified.slice(0, 8)) {
            md += `- \`${token.displayName}\`: ${token.oldValue} → ${token.newValue}\n`;
          }
          if (modified.length > 8) md += `- *... and ${modified.length - 8} more*\n`;
          md += '\n';
        }

        if (added.length > 0) {
          md += '**Added:**\n';
          for (const token of added.slice(0, 8)) {
            md += `- \`${token.displayName}\`\n`;
          }
          if (added.length > 8) md += `- *... and ${added.length - 8} more*\n`;
          md += '\n';
        }
      }

      md += '</details>\n\n';
    }
  }

  // Build info
  md += '### 📋 Build Info\n\n';
  if (successfulBuilds > 0 && totalBuilds > 0) {
    md += `- **Build Status:** ✅ ${successfulBuilds}/${totalBuilds} successful\n`;
  }
  if (packageSize) {
    md += `- **Package Size:** ${packageSize}\n`;
  }
  md += '- **Formats:** CSS, SCSS, JavaScript, Swift, Android Compose, JSON\n';
  md += '- **Brands:** BILD, SportBILD, Advertorial\n';
  md += '- **Modes:** Light/Dark, Responsive Breakpoints\n';
  md += '\n';

  // Links
  md += '### 🔗 Links\n\n';
  md += `- [📖 Documentation](https://github.com/${repo}#readme)\n`;
  md += `- [📦 npm Package](https://www.npmjs.com/package/@marioschmidt/design-system-tokens)\n`;
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
