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
  return `\`${truncate(oldValue, 25)}\` → \`${truncate(newValue, 25)}\``;
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
    md += `| \`${truncate(entry.displayName, 20)}\` `;
    md += `| \`${truncate(p.css || '-', 18)}\` `;
    md += `| \`${truncate(p.scss || '-', 18)}\` `;
    md += `| \`${truncate(p.js || p.json || '-', 16)}\` `;
    md += `| \`${truncate(p.swift || '-', 18)}\` `;
    md += `| \`${truncate(p.kotlin || '-', 18)}\` |\n`;
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

  // Quick stats - use unique token counts for clear summary
  const stats = [];
  const uniqueRemoved = summary.uniqueTokensRemoved ?? summary.tokensRemoved;
  const uniqueModified = summary.uniqueTokensModified ?? summary.tokensModified;
  const uniqueAdded = summary.uniqueTokensAdded ?? summary.tokensAdded;
  const uniqueRenamed = summary.uniqueTokensRenamed ?? 0;

  if (uniqueRemoved > 0) {
    stats.push(`🔴 **${uniqueRemoved} Removed**`);
  }
  if (uniqueRenamed > 0) {
    stats.push(`🔄 **${uniqueRenamed} Renamed**`);
  }
  if (uniqueModified > 0) {
    stats.push(`🟡 **${uniqueModified} Modified**`);
  }
  if (uniqueAdded > 0) {
    stats.push(`🟢 **${uniqueAdded} Added**`);
  }

  if (stats.length > 0) {
    md += stats.join(' | ') + '\n\n';
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
      md += `| \`${truncate(token.displayName, 40)}\` | \`${truncate(token.value, 30)}\` |\n`;
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
      md += `| \`${truncate(token.displayName, 35)}\` | ${changeDisplay} |\n`;
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
      md += `| \`${truncate(token.displayName, 40)}\` | \`${truncate(token.value, 30)}\` |\n`;
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
// LAYER 2b: RENAMED TOKENS
// =============================================================================

/**
 * Generate renamed tokens section - shows tokens that were renamed (detected via Figma Variable ID)
 */
function generateRenamesSection(diff, options = {}) {
  if (!diff || !diff.renames || diff.renames.length === 0) return '';

  const { maxTokens = 20 } = options;
  const renames = diff.renames;

  let md = '## 🔄 Renamed Tokens\n\n';
  md += '> ✅ Auto-detected via Figma Variable ID (100% confidence)\n\n';
  md += '| Old Name | → | New Name | Category |\n';
  md += '|----------|:---:|----------|----------|\n';

  const displayRenames = renames.slice(0, maxTokens);
  for (const rename of displayRenames) {
    const catConfig = CATEGORY_CONFIG[rename.category] || CATEGORY_CONFIG.other;
    md += `| \`${truncate(rename.oldName, 35)}\` | → | \`${truncate(rename.newName, 35)}\` | ${catConfig.icon} |\n`;
  }

  if (renames.length > maxTokens) {
    md += `| ... | | *${renames.length - maxTokens} more* | |\n`;
  }

  // Migration help
  md += '\n<details>\n<summary>📋 Migration Commands</summary>\n\n';
  md += '```bash\n# Find & Replace suggestions:\n';
  for (const rename of renames.slice(0, 5)) {
    // Extract last part of path for simpler token name
    const oldSimple = rename.oldName.split('/').pop();
    const newSimple = rename.newName.split('/').pop();
    md += `# ${oldSimple} → ${newSimple}\n`;
  }
  if (renames.length > 5) {
    md += `# ... and ${renames.length - 5} more\n`;
  }
  md += '```\n\n</details>\n\n';

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
  md += '> 🎯 Showing semantic & component layer tokens (consumer-facing)\n\n';
  let hasChanges = false;

  for (const category of CATEGORY_ORDER) {
    const catData = diff.byCategory[category];
    if (!catData) continue;

    // Filter to only consumption layer tokens
    const modified = filterConsumptionLayer(catData.modified || []);
    const added = filterConsumptionLayer(catData.added || []);
    const removed = filterConsumptionLayer(catData.removed || []);
    const total = modified.length + added.length + removed.length;

    if (total === 0) continue;
    hasChanges = true;

    const config = CATEGORY_CONFIG[category];
    md += `<details>\n<summary>${config.icon} <b>${config.label}</b> (${total} changes)</summary>\n\n`;

    // Modified
    if (modified.length > 0) {
      md += `**Modified (${modified.length}):**\n\n`;
      md += '| Token | Old | New |\n|-------|-----|-----|\n';
      for (const token of modified.slice(0, maxTokensPerCategory)) {
        md += `| \`${truncate(token.displayName, 30)}\` | \`${truncate(token.oldValue, 15)}\` | \`${truncate(token.newValue, 15)}\` |\n`;
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
        md += `| \`${truncate(token.displayName, 35)}\` | \`${truncate(token.value, 20)}\` |\n`;
      }
      if (added.length > maxTokensPerCategory) {
        md += `| ... | *${added.length - maxTokensPerCategory} more* |\n`;
      }
      md += '\n';
    }

    // Removed
    if (removed.length > 0) {
      md += `**Removed (${removed.length}):**\n\n`;
      md += '| Token | Previous Value |\n|-------|----------------|\n';
      for (const token of removed.slice(0, maxTokensPerCategory)) {
        md += `| \`${truncate(token.displayName, 35)}\` | \`${truncate(token.value, 20)}\` |\n`;
      }
      if (removed.length > maxTokensPerCategory) {
        md += `| ... | *${removed.length - maxTokensPerCategory} more* |\n`;
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
      const changeDisplay = `\`${truncate(token.oldValue, 12)}\` → \`${truncate(token.newValue, 12)}\``;
      md += `| \`${truncate(token.displayName, 28)}\` | ${changeDisplay} | ${cat.icon} |\n`;
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
      md += `| \`${truncate(token.displayName, 28)}\` | \`${truncate(token.value, 18)}\` | ${cat.icon} |\n`;
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
      md += `| \`${truncate(token.displayName, 28)}\` | \`${truncate(token.value, 18)}\` | ${cat.icon} |\n`;
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

/**
 * Helper to categorize token for display (simplified version)
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
          md += `| \`${truncate(token.name, 35)}\` | \`${truncate(token.value, 25)}\` | \`${truncate(path.basename(file.file), 30)}\` |\n`;
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
          md += `| \`${truncate(token.name, 35)}\` | \`${truncate(token.value, 25)}\` | \`${truncate(path.basename(file.file), 30)}\` |\n`;
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
          md += `| \`${truncate(token.name, 30)}\` | \`${truncate(token.oldValue, 18)}\` | \`${truncate(token.newValue, 18)}\` | \`${truncate(path.basename(file.file), 25)}\` |\n`;
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
          md += `| \`${truncate(token.name, 35)}\` | \`${truncate(token.value, 25)}\` | \`${truncate(path.basename(file.file), 30)}\` |\n`;
          count++;
        }
      }

      for (const file of modifiedFiles) {
        if (!file.changes?.added) continue;
        for (const token of file.changes.added.slice(0, 3)) {
          if (count >= maxTokensPerSection) break;
          md += `| \`${truncate(token.name, 35)}\` | \`${truncate(token.value, 25)}\` | \`${truncate(path.basename(file.file), 30)}\` |\n`;
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

  // 1. Executive Summary (always)
  md += generateExecutiveSummary(diff, options);

  // 2. Renamed Tokens (if any - high priority)
  md += generateRenamesSection(diff, { maxTokens: 10 });

  // 3. Categorized Changes (consumption layer: semantic + component)
  md += generateCategorizedChangesSection(diff, { maxTokensPerCategory: 8 });

  // 4. Affected Components
  md += generateAffectedComponentsSection(diff, { maxComponents: 8 });

  // 5. Source Changes (primitive layer - collapsible, for advanced users)
  md += generateSourceChangesSection(diff, { maxTokens: 8 });

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
      md += `| \`${truncate(token.displayName, 35)}\` | \`${truncate(token.value, 25)}\` |\n`;
    }
    if (diff.byUniqueToken.removed.length > 5) {
      md += `| ... | *${diff.byUniqueToken.removed.length - 5} more* |\n`;
    }
    md += '\n';
  }

  // Renamed tokens (if any)
  if (diff?.renames?.length > 0) {
    md += '### 🔄 Renamed Tokens\n\n';
    md += '> ✅ Auto-detected via Figma Variable ID\n\n';
    md += '| Old Name | → | New Name |\n';
    md += '|----------|:---:|----------|\n';
    for (const rename of diff.renames.slice(0, 8)) {
      md += `| \`${truncate(rename.oldName, 30)}\` | → | \`${truncate(rename.newName, 30)}\` |\n`;
    }
    if (diff.renames.length > 8) {
      md += `| ... | | *${diff.renames.length - 8} more* |\n`;
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
          for (const token of modified.slice(0, 5)) {
            md += `- \`${truncate(token.displayName, 35)}\`: ${truncate(token.oldValue, 12)} → ${truncate(token.newValue, 12)}\n`;
          }
          if (modified.length > 5) md += `- *... and ${modified.length - 5} more*\n`;
          md += '\n';
        }

        if (added.length > 0) {
          md += '**Added:**\n';
          for (const token of added.slice(0, 5)) {
            md += `- \`${truncate(token.displayName, 35)}\`\n`;
          }
          if (added.length > 5) md += `- *... and ${added.length - 5} more*\n`;
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
