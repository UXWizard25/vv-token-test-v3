#!/usr/bin/env node

/**
 * Validate Non-JS Outputs Script
 *
 * This script validates that CSS, SCSS, iOS, and Android outputs remain unchanged
 * when modifying the JS output generation. It creates checksums of all non-JS files
 * and compares them against a snapshot.
 *
 * Usage:
 *   npm run validate:snapshot:create  - Create a new snapshot
 *   npm run validate:snapshot:check   - Check current outputs against snapshot
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIST_DIR = path.join(__dirname, '../../dist');
const SNAPSHOT_FILE = path.join(__dirname, '../../.output-snapshot.json');

// Directories to validate (non-JS outputs)
const VALIDATE_DIRS = ['css', 'scss', 'ios', 'android', 'json'];

/**
 * Calculate MD5 hash of a file
 */
function getFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Create snapshot of all non-JS output files
 */
function createSnapshot() {
  console.log('📸 Creating output snapshot...\n');

  const snapshot = {
    createdAt: new Date().toISOString(),
    files: {}
  };

  let totalFiles = 0;

  VALIDATE_DIRS.forEach(dir => {
    const dirPath = path.join(DIST_DIR, dir);
    const files = getAllFiles(dirPath);

    files.forEach(file => {
      const relativePath = path.relative(DIST_DIR, file);
      snapshot.files[relativePath] = {
        hash: getFileHash(file),
        size: fs.statSync(file).size
      };
      totalFiles++;
    });

    console.log(`  ✅ ${dir}/: ${files.length} files`);
  });

  fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2));

  console.log(`\n📊 Snapshot created: ${totalFiles} files`);
  console.log(`   Saved to: ${path.relative(process.cwd(), SNAPSHOT_FILE)}`);

  return snapshot;
}

/**
 * Check current outputs against snapshot
 */
function checkSnapshot() {
  console.log('🔍 Checking outputs against snapshot...\n');

  if (!fs.existsSync(SNAPSHOT_FILE)) {
    console.error('❌ No snapshot found. Run with --create first.');
    process.exit(1);
  }

  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
  console.log(`   Snapshot created: ${snapshot.createdAt}\n`);

  const errors = [];
  const missing = [];
  const added = [];
  let checkedFiles = 0;

  // Check existing files against snapshot
  VALIDATE_DIRS.forEach(dir => {
    const dirPath = path.join(DIST_DIR, dir);
    const files = getAllFiles(dirPath);

    files.forEach(file => {
      const relativePath = path.relative(DIST_DIR, file);
      const snapshotEntry = snapshot.files[relativePath];

      if (!snapshotEntry) {
        added.push(relativePath);
      } else {
        const currentHash = getFileHash(file);
        if (currentHash !== snapshotEntry.hash) {
          errors.push({
            file: relativePath,
            expected: snapshotEntry.hash,
            actual: currentHash
          });
        }
        checkedFiles++;
      }
    });
  });

  // Check for missing files
  Object.keys(snapshot.files).forEach(relativePath => {
    const fullPath = path.join(DIST_DIR, relativePath);
    if (!fs.existsSync(fullPath)) {
      missing.push(relativePath);
    }
  });

  // Report results
  console.log(`📊 Results:`);
  console.log(`   Checked: ${checkedFiles} files`);

  if (added.length > 0) {
    console.log(`\n⚠️  Added files (${added.length}):`);
    added.slice(0, 10).forEach(f => console.log(`   + ${f}`));
    if (added.length > 10) console.log(`   ... and ${added.length - 10} more`);
  }

  if (missing.length > 0) {
    console.log(`\n⚠️  Missing files (${missing.length}):`);
    missing.slice(0, 10).forEach(f => console.log(`   - ${f}`));
    if (missing.length > 10) console.log(`   ... and ${missing.length - 10} more`);
  }

  if (errors.length > 0) {
    console.log(`\n❌ Changed files (${errors.length}):`);
    errors.slice(0, 10).forEach(e => console.log(`   ✗ ${e.file}`));
    if (errors.length > 10) console.log(`   ... and ${errors.length - 10} more`);

    console.log('\n❌ VALIDATION FAILED: Non-JS outputs have changed!');
    process.exit(1);
  }

  if (missing.length === 0 && errors.length === 0) {
    console.log('\n✅ VALIDATION PASSED: All non-JS outputs are unchanged.');
  }

  return { errors, missing, added };
}

/**
 * Show diff for changed files
 */
function showDiff(file1, file2) {
  // Simple line-by-line comparison
  const lines1 = fs.readFileSync(file1, 'utf8').split('\n');
  const lines2 = fs.readFileSync(file2, 'utf8').split('\n');

  const maxLines = Math.max(lines1.length, lines2.length);
  const diffs = [];

  for (let i = 0; i < maxLines; i++) {
    if (lines1[i] !== lines2[i]) {
      diffs.push({
        line: i + 1,
        expected: lines1[i] || '(empty)',
        actual: lines2[i] || '(empty)'
      });
    }
  }

  return diffs;
}

// CLI handling
const args = process.argv.slice(2);
const command = args[0];

if (command === '--create' || command === 'create') {
  createSnapshot();
} else if (command === '--check' || command === 'check') {
  checkSnapshot();
} else {
  console.log(`
Usage:
  node validate-outputs.js --create   Create a new snapshot of non-JS outputs
  node validate-outputs.js --check    Check outputs against snapshot

This script validates CSS, SCSS, iOS, and Android outputs remain unchanged.
`);
}

module.exports = { createSnapshot, checkSnapshot };
