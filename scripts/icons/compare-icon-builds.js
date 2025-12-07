#!/usr/bin/env node

/**
 * Icon Build Comparison Script
 *
 * Compares two icon builds to detect changes:
 * - Added icons
 * - Removed icons
 * - Modified icons (content changes)
 *
 * Used by CI to generate release notes and PR descriptions.
 *
 * Usage:
 *   node compare-icon-builds.js [old-dir] [new-dir]
 *
 * Defaults:
 *   old-dir: dist-icons-old
 *   new-dir: dist/icons
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PATHS = {
  oldBuild: process.argv[2] || path.resolve(__dirname, '../../dist-icons-old'),
  newBuild: process.argv[3] || path.resolve(__dirname, '../../packages/icons/dist'),
  output: path.resolve(__dirname, '../../icons-diff.json'),
};

const PLATFORMS = [
  { name: 'svg', dir: 'svg', extension: '.svg', displayName: 'SVG' },
  { name: 'react', dir: 'react', extension: '.tsx', displayName: 'React' },
  { name: 'android', dir: 'android/drawable', extension: '.xml', displayName: 'Android' },
  { name: 'flutter', dir: 'flutter/lib', extension: '.dart', displayName: 'Flutter' },
  { name: 'ios', dir: 'ios/Assets.xcassets/Icons', extension: '.imageset', displayName: 'iOS', isDir: true },
];

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
// FILE UTILITIES
// ============================================================================

/**
 * Calculate MD5 hash of file content
 */
function hashFile(filePath) {
  try {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  } catch {
    return null;
  }
}

/**
 * Calculate hash of directory content (for iOS imagesets)
 */
function hashDirectory(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) return null;

    const files = fs.readdirSync(dirPath).sort();
    const hashes = files.map(file => {
      const filePath = path.join(dirPath, file);
      return hashFile(filePath);
    });

    return crypto.createHash('md5').update(hashes.join('')).digest('hex');
  } catch {
    return null;
  }
}

/**
 * Get all icons from a platform directory
 */
function getIcons(baseDir, platform) {
  const platformDir = path.join(baseDir, platform.dir);

  if (!fs.existsSync(platformDir)) {
    return new Map();
  }

  const icons = new Map();

  try {
    const entries = fs.readdirSync(platformDir);

    for (const entry of entries) {
      // Skip non-icon files
      if (entry.startsWith('.') || entry === 'index.ts' || entry === 'index.d.ts' ||
          entry === 'package.json' || entry === 'manifest.json' || entry === 'Contents.json') {
        continue;
      }

      const fullPath = path.join(platformDir, entry);

      if (platform.isDir) {
        // For iOS imagesets (directories)
        if (entry.endsWith(platform.extension) && fs.statSync(fullPath).isDirectory()) {
          const iconName = entry.replace(platform.extension, '');
          icons.set(iconName, {
            path: fullPath,
            hash: hashDirectory(fullPath),
          });
        }
      } else {
        // For regular files
        if (entry.endsWith(platform.extension)) {
          const iconName = entry.replace(platform.extension, '');
          icons.set(iconName, {
            path: fullPath,
            hash: hashFile(fullPath),
          });
        }
      }
    }
  } catch (error) {
    log.warn(`Could not read ${platform.name}: ${error.message}`);
  }

  return icons;
}

/**
 * Compare icons between old and new build
 */
function compareIcons(oldIcons, newIcons) {
  const added = [];
  const removed = [];
  const modified = [];
  const unchanged = [];

  // Find added and modified
  for (const [name, newData] of newIcons) {
    const oldData = oldIcons.get(name);

    if (!oldData) {
      added.push(name);
    } else if (oldData.hash !== newData.hash) {
      modified.push(name);
    } else {
      unchanged.push(name);
    }
  }

  // Find removed
  for (const [name] of oldIcons) {
    if (!newIcons.has(name)) {
      removed.push(name);
    }
  }

  return { added, removed, modified, unchanged };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n========================================');
  console.log('  Icon Build Comparison');
  console.log('========================================\n');

  // Check directories exist
  log.step('Checking build directories...');

  if (!fs.existsSync(PATHS.oldBuild)) {
    log.warn(`Old build not found: ${PATHS.oldBuild}`);
    log.info('This is likely the first build - treating all icons as new');
  }

  if (!fs.existsSync(PATHS.newBuild)) {
    log.error(`New build not found: ${PATHS.newBuild}`);
    log.info('Run "npm run build:icons" first');
    return { success: false, error: 'New build not found' };
  }

  const hasOldBuild = fs.existsSync(PATHS.oldBuild);

  // Compare each platform
  log.step('Comparing platforms...');

  const results = {
    generatedAt: new Date().toISOString(),
    oldBuild: PATHS.oldBuild,
    newBuild: PATHS.newBuild,
    isFirstBuild: !hasOldBuild,
    summary: {
      added: 0,
      removed: 0,
      modified: 0,
      unchanged: 0,
    },
    platforms: {},
  };

  for (const platform of PLATFORMS) {
    log.info(`Comparing ${platform.displayName}...`);

    const oldIcons = hasOldBuild ? getIcons(PATHS.oldBuild, platform) : new Map();
    const newIcons = getIcons(PATHS.newBuild, platform);

    const comparison = compareIcons(oldIcons, newIcons);

    results.platforms[platform.name] = {
      displayName: platform.displayName,
      oldCount: oldIcons.size,
      newCount: newIcons.size,
      ...comparison,
    };

    // Update summary (use SVG as the source of truth)
    if (platform.name === 'svg') {
      results.summary.added = comparison.added.length;
      results.summary.removed = comparison.removed.length;
      results.summary.modified = comparison.modified.length;
      results.summary.unchanged = comparison.unchanged.length;
    }

    // Log platform results
    if (comparison.added.length > 0) {
      log.success(`  Added: ${comparison.added.length}`);
    }
    if (comparison.removed.length > 0) {
      log.warn(`  Removed: ${comparison.removed.length}`);
    }
    if (comparison.modified.length > 0) {
      log.info(`  Modified: ${comparison.modified.length}`);
    }
  }

  // Calculate total changes
  const totalChanges = results.summary.added + results.summary.removed + results.summary.modified;
  results.summary.totalChanges = totalChanges;
  results.summary.hasChanges = totalChanges > 0;

  // Write results
  log.step('Writing comparison results...');
  fs.writeFileSync(PATHS.output, JSON.stringify(results, null, 2), 'utf8');
  log.success(`Created ${path.basename(PATHS.output)}`);

  // Summary
  console.log('\n========================================');
  console.log('  Summary');
  console.log('========================================\n');

  if (!results.summary.hasChanges && !results.isFirstBuild) {
    log.info('No icon changes detected');
  } else {
    console.log(`  Added:     ${results.summary.added}`);
    console.log(`  Removed:   ${results.summary.removed}`);
    console.log(`  Modified:  ${results.summary.modified}`);
    console.log(`  Unchanged: ${results.summary.unchanged}`);
    console.log('');
    log.success(`Total changes: ${totalChanges}`);
  }

  return {
    success: true,
    ...results.summary,
    outputPath: PATHS.output,
  };
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

module.exports = { main, PATHS, PLATFORMS };
