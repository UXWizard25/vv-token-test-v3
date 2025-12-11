#!/usr/bin/env node

/**
 * Icon Release Notes Generator
 *
 * Generates release notes from icon build comparison.
 * Creates formatted output for:
 * - GitHub PR descriptions
 * - CHANGELOG entries
 * - Console output
 *
 * Usage:
 *   node generate-icon-release-notes.js [diff-file]
 *
 * Defaults:
 *   diff-file: icons-diff.json
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PATHS = {
  diff: process.argv[2] || path.resolve(__dirname, '../../icons-diff.json'),
  output: path.resolve(__dirname, '../../icons-release-notes.md'),
};

const PLATFORM_EMOJIS = {
  svg: '\uD83C\uDF10',      // 🌐
  react: '\u269B\uFE0F',    // ⚛️
  android: '\uD83E\uDD16',  // 🤖
  ios: '\uD83C\uDF4E',      // 🍎
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
// RELEASE NOTES GENERATION
// ============================================================================

/**
 * Truncate array and add "and X more" suffix
 */
function truncateList(items, maxItems = 10) {
  if (items.length <= maxItems) {
    return items;
  }

  const truncated = items.slice(0, maxItems);
  truncated.push(`... and ${items.length - maxItems} more`);
  return truncated;
}

/**
 * Generate PR description markdown
 */
function generatePRDescription(diff) {
  const lines = [];

  lines.push('## Icon Changes\n');

  if (diff.isFirstBuild) {
    lines.push('> \uD83C\uDF89 **First icon build!**\n');
  }

  // Summary table
  lines.push('| Change Type | Count |');
  lines.push('|-------------|-------|');
  lines.push(`| \u2795 Added | ${diff.summary.added} |`);
  lines.push(`| \u2796 Removed | ${diff.summary.removed} |`);
  lines.push(`| \u270F\uFE0F Modified | ${diff.summary.modified} |`);
  lines.push(`| \u2714\uFE0F Unchanged | ${diff.summary.unchanged} |`);
  lines.push('');

  // Platform breakdown
  lines.push('### Platform Output\n');
  lines.push('| Platform | Icons |');
  lines.push('|----------|-------|');

  for (const [platform, data] of Object.entries(diff.platforms)) {
    const emoji = PLATFORM_EMOJIS[platform] || '\uD83D\uDCE6';
    lines.push(`| ${emoji} ${data.displayName} | ${data.newCount} |`);
  }
  lines.push('');

  // Detailed changes (from SVG as source of truth)
  const svgData = diff.platforms.svg;

  if (svgData.added.length > 0) {
    lines.push('### \u2795 Added Icons\n');
    const addedList = truncateList(svgData.added, 20);
    for (const icon of addedList) {
      lines.push(`- \`${icon}\``);
    }
    lines.push('');
  }

  if (svgData.removed.length > 0) {
    lines.push('### \u2796 Removed Icons\n');
    lines.push('> \u26A0\uFE0F **Breaking Change:** The following icons have been removed.\n');
    const removedList = truncateList(svgData.removed, 20);
    for (const icon of removedList) {
      lines.push(`- \`${icon}\``);
    }
    lines.push('');
  }

  if (svgData.modified.length > 0) {
    lines.push('### \u270F\uFE0F Modified Icons\n');
    const modifiedList = truncateList(svgData.modified, 20);
    for (const icon of modifiedList) {
      lines.push(`- \`${icon}\``);
    }
    lines.push('');
  }

  // Usage examples
  lines.push('### Usage Examples\n');
  lines.push('<details>');
  lines.push('<summary>Show usage examples</summary>\n');

  if (svgData.added.length > 0) {
    const exampleIcon = svgData.added[0];
    const pascalCase = exampleIcon.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
    const camelCase = exampleIcon.replace(/-([a-z])/g, (_, l) => l.toUpperCase());

    lines.push('**React:**');
    lines.push('```tsx');
    lines.push(`import { ${pascalCase} } from '@marioschmidt/design-system-icons';`);
    lines.push('');
    lines.push(`<${pascalCase} size={24} aria-label="Example icon" />`);
    lines.push('```\n');

    lines.push('**Android:**');
    lines.push('```xml');
    lines.push(`<ImageView`);
    lines.push(`    android:src="@drawable/ic_${exampleIcon.replace(/-/g, '_')}"`);
    lines.push(`    app:tint="?attr/colorOnSurface" />`);
    lines.push('```\n');

    lines.push('**iOS (SwiftUI):**');
    lines.push('```swift');
    lines.push(`BildIcon.${camelCase}.image`);
    lines.push('    .foregroundColor(.primary)');
    lines.push('```');
  }

  lines.push('</details>\n');

  return lines.join('\n');
}

/**
 * Generate CHANGELOG entry
 */
function generateChangelog(diff, version = 'UNRELEASED') {
  const lines = [];
  const date = new Date().toISOString().split('T')[0];

  lines.push(`## [${version}] - ${date}\n`);

  const svgData = diff.platforms.svg;

  if (svgData.added.length > 0) {
    lines.push('### Added');
    for (const icon of svgData.added) {
      lines.push(`- Icon: \`${icon}\``);
    }
    lines.push('');
  }

  if (svgData.modified.length > 0) {
    lines.push('### Changed');
    for (const icon of svgData.modified) {
      lines.push(`- Updated icon: \`${icon}\``);
    }
    lines.push('');
  }

  if (svgData.removed.length > 0) {
    lines.push('### Removed');
    lines.push('> **Breaking Change**');
    for (const icon of svgData.removed) {
      lines.push(`- Removed icon: \`${icon}\``);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Generate console summary
 */
function generateConsoleSummary(diff) {
  const lines = [];

  lines.push('');
  lines.push('========================================');
  lines.push('  Icon Release Notes');
  lines.push('========================================');
  lines.push('');

  if (!diff.summary.hasChanges && !diff.isFirstBuild) {
    lines.push('No icon changes to report.');
    return lines.join('\n');
  }

  lines.push(`Total Changes: ${diff.summary.totalChanges}`);
  lines.push('');
  lines.push(`  + Added:    ${diff.summary.added}`);
  lines.push(`  - Removed:  ${diff.summary.removed}`);
  lines.push(`  ~ Modified: ${diff.summary.modified}`);
  lines.push('');

  const svgData = diff.platforms.svg;

  if (svgData.added.length > 0) {
    lines.push('Added:');
    for (const icon of truncateList(svgData.added, 5)) {
      lines.push(`  + ${icon}`);
    }
    lines.push('');
  }

  if (svgData.removed.length > 0) {
    lines.push('Removed (Breaking!):');
    for (const icon of truncateList(svgData.removed, 5)) {
      lines.push(`  - ${icon}`);
    }
    lines.push('');
  }

  if (svgData.modified.length > 0) {
    lines.push('Modified:');
    for (const icon of truncateList(svgData.modified, 5)) {
      lines.push(`  ~ ${icon}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n========================================');
  console.log('  Icon Release Notes Generator');
  console.log('========================================\n');

  // Load diff file
  log.step('Loading comparison data...');

  if (!fs.existsSync(PATHS.diff)) {
    log.error(`Diff file not found: ${PATHS.diff}`);
    log.info('Run "node scripts/icons/compare-icon-builds.js" first');
    return { success: false, error: 'Diff file not found' };
  }

  const diff = JSON.parse(fs.readFileSync(PATHS.diff, 'utf8'));
  log.success('Loaded comparison data');

  // Check for changes
  if (!diff.summary.hasChanges && !diff.isFirstBuild) {
    log.info('No icon changes detected - skipping release notes');
    return { success: true, hasChanges: false };
  }

  // Generate outputs
  log.step('Generating release notes...');

  // PR Description
  const prDescription = generatePRDescription(diff);
  fs.writeFileSync(PATHS.output, prDescription, 'utf8');
  log.success(`Created ${path.basename(PATHS.output)}`);

  // Console summary
  const consoleSummary = generateConsoleSummary(diff);
  console.log(consoleSummary);

  // Output paths for CI
  const result = {
    success: true,
    hasChanges: diff.summary.hasChanges || diff.isFirstBuild,
    summary: diff.summary,
    outputPath: PATHS.output,
    prDescription,
    changelog: generateChangelog(diff),
  };

  return result;
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

module.exports = { main, PATHS, generatePRDescription, generateChangelog };
