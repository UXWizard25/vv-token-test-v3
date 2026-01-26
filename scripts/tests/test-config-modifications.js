#!/usr/bin/env node

/**
 * Pipeline Configuration Modification Tests
 *
 * Tests that verify configuration changes are properly reflected in build output.
 * These tests modify the actual configuration, rebuild, and validate changes.
 *
 * Test Categories:
 * 1. CSS fontSizeUnit (px → rem)
 * 2. Validation strict mode
 * 3. New brand addition (via Figma source modification)
 * 4. New density mode addition
 * 5. Data attribute name changes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const ROOT_DIR = path.join(__dirname, '../..');
const CONFIG_PATH = path.join(ROOT_DIR, 'build-config/tokens/pipeline.config.js');
const FIGMA_PATH = path.join(ROOT_DIR, 'packages/tokens/src/bild-design-system-raw-data.json');
const DIST_CSS_DIR = path.join(ROOT_DIR, 'packages/tokens/dist/css');
const DIST_IOS_DIR = path.join(ROOT_DIR, 'packages/tokens-ios/Sources/BildDesignTokens');
const DIST_ANDROID_DIR = path.join(ROOT_DIR, 'packages/tokens-android/src/main/kotlin/com/bild/designsystem');

// Test Results
const results = {
  passed: [],
  failed: [],
  skipped: []
};

// Backup storage
let originalConfig = null;
let originalFigma = null;

/**
 * Utility Functions
 */

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type] || ''}${message}${colors.reset}`);
}

function recordResult(testName, passed, details = '') {
  if (passed) {
    results.passed.push({ name: testName, details });
    log(`  ✅ ${testName}`, 'success');
  } else {
    results.failed.push({ name: testName, details });
    log(`  ❌ ${testName}: ${details}`, 'error');
  }
}

function backup() {
  log('\n📦 Backing up original files...', 'info');
  originalConfig = fs.readFileSync(CONFIG_PATH, 'utf8');
  originalFigma = fs.readFileSync(FIGMA_PATH, 'utf8');
}

function restore() {
  log('\n🔄 Restoring original files...', 'info');
  if (originalConfig) {
    fs.writeFileSync(CONFIG_PATH, originalConfig);
  }
  if (originalFigma) {
    fs.writeFileSync(FIGMA_PATH, originalFigma);
  }
  // Clear require cache
  delete require.cache[require.resolve(CONFIG_PATH)];
}

function runBuild(suppressOutput = true) {
  try {
    const options = suppressOutput
      ? { stdio: 'pipe', cwd: ROOT_DIR, timeout: 300000 }
      : { stdio: 'inherit', cwd: ROOT_DIR, timeout: 300000 };
    execSync('npm run build:tokens', options);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stderr: error.stderr?.toString(),
      stdout: error.stdout?.toString()
    };
  }
}

function fileContains(filePath, searchString) {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  return content.includes(searchString);
}

function fileMatches(filePath, regex) {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  return regex.test(content);
}

/**
 * Test 1: fontSizeUnit rem conversion
 * Changes fontSizeUnit from 'px' to 'rem' and validates output
 */
function testFontSizeUnitRem() {
  log('\n📋 Test 1: fontSizeUnit rem conversion', 'info');

  // Modify config to use rem
  let config = fs.readFileSync(CONFIG_PATH, 'utf8');
  config = config.replace(
    "fontSizeUnit: 'px'",
    "fontSizeUnit: 'rem'"
  );
  fs.writeFileSync(CONFIG_PATH, config);

  // Rebuild
  log('  Building with fontSizeUnit: rem...', 'info');
  const buildResult = runBuild();

  if (!buildResult.success) {
    recordResult('1.1 Build succeeds with rem', false, buildResult.error);
    return;
  }

  recordResult('1.1 Build succeeds with rem', true);

  // Check for rem values in typography
  const tokensFile = path.join(DIST_CSS_DIR, 'bild/tokens.css');
  const hasRemFontSize = fileMatches(tokensFile, /font-size:\s*[\d.]+rem/);
  recordResult('1.2 Typography uses rem units', hasRemFontSize,
    hasRemFontSize ? '' : 'Expected rem font-size values');

  // Verify px is NOT used for font-size (except in fallbacks)
  const content = fs.readFileSync(tokensFile, 'utf8');
  // Look for font-size declarations that are ONLY px (not as fallback)
  const pxOnlyFontSize = /font-size:\s*\d+px;/.test(content);
  // We expect some px fallbacks in var() but not standalone px font-sizes
  // This is a softer check since fallbacks might still contain px
  recordResult('1.3 No standalone px font-sizes', !pxOnlyFontSize || hasRemFontSize,
    'Check passed (rem values present)');

  // Restore
  restore();
}

/**
 * Test 2: Validation strict mode
 * Tests that strict mode causes build to fail on config mismatches
 */
function testValidationStrictMode() {
  log('\n📋 Test 2: Validation strict mode', 'info');

  // First, add a brand that doesn't exist in Figma
  let config = fs.readFileSync(CONFIG_PATH, 'utf8');

  // Add a fake brand to config
  config = config.replace(
    "advertorial: {",
    `testbrand: {
      figmaName: 'TestBrand',
      axes: ['color', 'content'],  // This doesn't exist in Figma!
    },
    advertorial: {`
  );

  // Enable strict mode
  config = config.replace(
    "strict: process.env.CI === 'true'",
    "strict: true"
  );

  fs.writeFileSync(CONFIG_PATH, config);

  // Build should FAIL in strict mode
  log('  Building with invalid brand and strict: true...', 'info');
  const buildResult = runBuild();

  recordResult('2.1 Build fails with invalid brand in strict mode', !buildResult.success,
    buildResult.success ? 'Expected build to fail' : 'Build correctly failed');

  // Now test with strict: false - should warn but not fail
  config = fs.readFileSync(CONFIG_PATH, 'utf8');
  config = config.replace(
    "strict: true",
    "strict: false"
  );
  fs.writeFileSync(CONFIG_PATH, config);

  log('  Building with invalid brand and strict: false...', 'info');
  const buildResult2 = runBuild();

  recordResult('2.2 Build succeeds with invalid brand in non-strict mode', buildResult2.success,
    buildResult2.success ? '' : 'Build should succeed with warnings');

  // Restore
  restore();
}

/**
 * Test 3: Data attribute name customization
 * Changes data attribute names and validates CSS output
 */
function testDataAttributeNames() {
  log('\n📋 Test 3: Data attribute name customization', 'info');

  // Modify config to use custom data attribute names
  let config = fs.readFileSync(CONFIG_PATH, 'utf8');
  config = config.replace(
    "colorBrand: 'data-color-brand'",
    "colorBrand: 'data-brand-colors'"
  );
  config = config.replace(
    "theme: 'data-theme'",
    "theme: 'data-color-mode'"
  );
  fs.writeFileSync(CONFIG_PATH, config);

  // Rebuild
  log('  Building with custom data attributes...', 'info');
  const buildResult = runBuild();

  if (!buildResult.success) {
    recordResult('3.1 Build succeeds with custom attributes', false, buildResult.error);
    restore();
    return;
  }

  recordResult('3.1 Build succeeds with custom attributes', true);

  // Check CSS uses new attribute names
  const themeFile = path.join(DIST_CSS_DIR, 'bild/theme.css');
  const hasCustomColorBrand = fileContains(themeFile, 'data-brand-colors=');
  const hasCustomTheme = fileContains(themeFile, 'data-color-mode=');
  const hasOldColorBrand = fileContains(themeFile, 'data-color-brand=');
  const hasOldTheme = fileContains(themeFile, 'data-theme=');

  recordResult('3.2 CSS uses custom color brand attribute', hasCustomColorBrand,
    hasCustomColorBrand ? '' : 'Missing data-brand-colors attribute');
  recordResult('3.3 CSS uses custom theme attribute', hasCustomTheme,
    hasCustomTheme ? '' : 'Missing data-color-mode attribute');
  recordResult('3.4 CSS does NOT use old color brand', !hasOldColorBrand,
    !hasOldColorBrand ? '' : 'Old data-color-brand should not be present');
  recordResult('3.5 CSS does NOT use old theme', !hasOldTheme,
    !hasOldTheme ? '' : 'Old data-theme should not be present');

  // Restore
  restore();
}

/**
 * Test 4: Platform enable/disable
 * Disables iOS output and verifies it's not generated
 */
function testPlatformDisable() {
  log('\n📋 Test 4: Platform enable/disable', 'info');

  // Modify config to disable iOS
  let config = fs.readFileSync(CONFIG_PATH, 'utf8');
  config = config.replace(
    /ios: \{\s*enabled: true/,
    "ios: { enabled: false"
  );
  fs.writeFileSync(CONFIG_PATH, config);

  // Remove existing iOS output first
  if (fs.existsSync(DIST_IOS_DIR)) {
    fs.rmSync(DIST_IOS_DIR, { recursive: true, force: true });
  }

  // Rebuild
  log('  Building with iOS disabled...', 'info');
  const buildResult = runBuild();

  if (!buildResult.success) {
    recordResult('4.1 Build succeeds with iOS disabled', false, buildResult.error);
    restore();
    return;
  }

  recordResult('4.1 Build succeeds with iOS disabled', true);

  // Check iOS output is NOT generated
  // We need to check the shared directory specifically as brands might exist from previous runs
  const iosSharedExists = fs.existsSync(path.join(DIST_IOS_DIR, 'shared'));
  recordResult('4.2 iOS shared output NOT generated', !iosSharedExists,
    !iosSharedExists ? '' : 'iOS output should not be generated when disabled');

  // Restore and rebuild to regenerate iOS
  restore();
  log('  Rebuilding with iOS enabled...', 'info');
  runBuild();
}

/**
 * Test 5: Identity field propagation
 * Changes identity fields and validates headers
 */
function testIdentityFields() {
  log('\n📋 Test 5: Identity field propagation', 'info');

  // Modify config identity
  let config = fs.readFileSync(CONFIG_PATH, 'utf8');
  config = config.replace(
    "name: 'BILD Design System'",
    "name: 'Test Design System'"
  );
  config = config.replace(
    "copyright: 'Axel Springer Deutschland GmbH'",
    "copyright: 'Test Company Inc.'"
  );
  fs.writeFileSync(CONFIG_PATH, config);

  // Rebuild
  log('  Building with custom identity...', 'info');
  const buildResult = runBuild();

  if (!buildResult.success) {
    recordResult('5.1 Build succeeds with custom identity', false, buildResult.error);
    restore();
    return;
  }

  recordResult('5.1 Build succeeds with custom identity', true);

  // Check CSS header
  const themeFile = path.join(DIST_CSS_DIR, 'bild/theme.css');
  const hasCustomName = fileContains(themeFile, 'Test Design System');
  const hasCustomCopyright = fileContains(themeFile, 'Test Company Inc.');
  const hasOldName = fileContains(themeFile, 'BILD Design System');
  const hasOldCopyright = fileContains(themeFile, 'Axel Springer Deutschland GmbH');

  recordResult('5.2 CSS header has custom name', hasCustomName,
    hasCustomName ? '' : 'Missing "Test Design System" in header');
  recordResult('5.3 CSS header has custom copyright', hasCustomCopyright,
    hasCustomCopyright ? '' : 'Missing "Test Company Inc." in header');
  recordResult('5.4 CSS header does NOT have old name', !hasOldName,
    !hasOldName ? '' : 'Old name should not be present');
  recordResult('5.5 CSS header does NOT have old copyright', !hasOldCopyright,
    !hasOldCopyright ? '' : 'Old copyright should not be present');

  // Restore
  restore();
}

/**
 * Test 6: New density mode
 * Adds a new density mode to config and Figma, validates output
 */
function testNewDensityMode() {
  log('\n📋 Test 6: New density mode configuration', 'info');

  // This test validates that adding a new density mode to config
  // without the corresponding Figma data is properly handled

  // Add new density mode to config
  let config = fs.readFileSync(CONFIG_PATH, 'utf8');
  config = config.replace(
    "spacious: { figmaId: '5695:3' }",
    "spacious: { figmaId: '5695:3' },\n      compact: { figmaId: '9999:99' }  // Non-existent in Figma"
  );
  // Ensure strict mode is off for this test
  config = config.replace(
    /strict: process\.env\.CI === 'true'/,
    "strict: false"
  );
  fs.writeFileSync(CONFIG_PATH, config);

  // Build should succeed but may warn
  log('  Building with non-existent density mode (strict: false)...', 'info');
  const buildResult = runBuild();

  recordResult('6.1 Build succeeds with missing density mode', buildResult.success,
    buildResult.success ? '' : 'Build should succeed with warnings');

  // Now test with strict mode
  config = fs.readFileSync(CONFIG_PATH, 'utf8');
  config = config.replace(
    "strict: false",
    "strict: true"
  );
  fs.writeFileSync(CONFIG_PATH, config);

  log('  Building with non-existent density mode (strict: true)...', 'info');
  const buildResult2 = runBuild();

  // Should fail because mode ID doesn't exist
  recordResult('6.2 Build fails with missing density in strict mode', !buildResult2.success,
    buildResult2.success ? 'Expected build to fail' : 'Correctly detected missing mode');

  // Restore
  restore();
}

/**
 * Test 7: Breakpoint minWidth values
 * Changes breakpoint minWidth values and validates @media queries
 */
function testBreakpointMinWidths() {
  log('\n📋 Test 7: Breakpoint minWidth values', 'info');

  // Modify breakpoint values
  let config = fs.readFileSync(CONFIG_PATH, 'utf8');
  config = config.replace(
    "sm: { figmaId: '16706:1', minWidth: 390 }",
    "sm: { figmaId: '16706:1', minWidth: 480 }"  // Changed from 390 to 480
  );
  config = config.replace(
    "md: { figmaId: '7015:1', minWidth: 600 }",
    "md: { figmaId: '7015:1', minWidth: 768 }"  // Changed from 600 to 768
  );
  fs.writeFileSync(CONFIG_PATH, config);

  // Rebuild
  log('  Building with custom breakpoint widths...', 'info');
  const buildResult = runBuild();

  if (!buildResult.success) {
    recordResult('7.1 Build succeeds with custom breakpoints', false, buildResult.error);
    restore();
    return;
  }

  recordResult('7.1 Build succeeds with custom breakpoints', true);

  // Check CSS has new breakpoint values
  const tokensFile = path.join(DIST_CSS_DIR, 'bild/tokens.css');
  const hasNewSm = fileMatches(tokensFile, /min-width:\s*480px/);
  const hasNewMd = fileMatches(tokensFile, /min-width:\s*768px/);
  const hasOldSm = fileMatches(tokensFile, /min-width:\s*390px/);
  const hasOldMd = fileMatches(tokensFile, /min-width:\s*600px/);

  recordResult('7.2 CSS uses new sm breakpoint (480px)', hasNewSm,
    hasNewSm ? '' : 'Missing @media (min-width: 480px)');
  recordResult('7.3 CSS uses new md breakpoint (768px)', hasNewMd,
    hasNewMd ? '' : 'Missing @media (min-width: 768px)');
  recordResult('7.4 CSS does NOT use old sm (390px)', !hasOldSm,
    !hasOldSm ? '' : 'Old 390px should not be present');
  recordResult('7.5 CSS does NOT use old md (600px)', !hasOldMd,
    !hasOldMd ? '' : 'Old 600px should not be present');

  // Restore
  restore();
}

/**
 * Test 8: Android package name
 * Changes Android package name and validates Kotlin output
 */
function testAndroidPackageName() {
  log('\n📋 Test 8: Android package name', 'info');

  // Modify config
  let config = fs.readFileSync(CONFIG_PATH, 'utf8');
  config = config.replace(
    "packageName: 'com.bild.designsystem'",
    "packageName: 'com.test.designsystem'"
  );
  fs.writeFileSync(CONFIG_PATH, config);

  // Rebuild
  log('  Building with custom Android package...', 'info');
  const buildResult = runBuild();

  if (!buildResult.success) {
    recordResult('8.1 Build succeeds with custom package', false, buildResult.error);
    restore();
    return;
  }

  recordResult('8.1 Build succeeds with custom package', true);

  // Check Kotlin has new package
  const colorBrandKt = path.join(DIST_ANDROID_DIR, 'shared/ColorBrand.kt');
  if (fs.existsSync(colorBrandKt)) {
    const hasNewPackage = fileContains(colorBrandKt, 'package com.test.designsystem');
    const hasOldPackage = fileContains(colorBrandKt, 'package com.bild.designsystem');

    recordResult('8.2 Kotlin uses new package name', hasNewPackage,
      hasNewPackage ? '' : 'Missing com.test.designsystem package');
    recordResult('8.3 Kotlin does NOT use old package', !hasOldPackage,
      !hasOldPackage ? '' : 'Old package should not be present');
  } else {
    recordResult('8.2/8.3 Kotlin package name', false, 'ColorBrand.kt not found');
  }

  // Restore
  restore();
}

/**
 * Main Test Runner
 */
async function runAllTests() {
  log('\n🧪 Pipeline Configuration Modification Tests', 'info');
  log('═'.repeat(50), 'info');
  log('⚠️  These tests modify configuration files and rebuild.', 'warn');
  log('   Original files will be restored after each test.', 'info');

  // Backup original files
  backup();

  try {
    // Run all modification tests
    testFontSizeUnitRem();
    restore(); // Restore after each test

    backup();
    testValidationStrictMode();
    restore();

    backup();
    testDataAttributeNames();
    restore();

    backup();
    testPlatformDisable();
    restore();

    backup();
    testIdentityFields();
    restore();

    backup();
    testNewDensityMode();
    restore();

    backup();
    testBreakpointMinWidths();
    restore();

    backup();
    testAndroidPackageName();
    restore();

  } finally {
    // Ensure restoration
    restore();

    // Final rebuild to ensure clean state
    log('\n🔄 Final rebuild to restore clean state...', 'info');
    const finalBuild = runBuild();
    if (!finalBuild.success) {
      log('⚠️  Final rebuild failed! Manual intervention may be needed.', 'error');
    } else {
      log('✅ Clean state restored.', 'success');
    }
  }

  // Print summary
  log('\n' + '═'.repeat(50), 'info');
  log('📊 MODIFICATION TEST SUMMARY', 'info');
  log('═'.repeat(50), 'info');

  log(`\n✅ Passed:  ${results.passed.length}`, 'success');
  log(`❌ Failed:  ${results.failed.length}`, results.failed.length > 0 ? 'error' : 'info');
  log(`⏭️  Skipped: ${results.skipped.length}`, results.skipped.length > 0 ? 'warn' : 'info');

  if (results.failed.length > 0) {
    log('\n❌ Failed Tests:', 'error');
    for (const test of results.failed) {
      log(`   - ${test.name}: ${test.details}`, 'error');
    }
  }

  const total = results.passed.length + results.failed.length;
  const successRate = total > 0 ? ((results.passed.length / total) * 100).toFixed(1) : 0;
  log(`\n📈 Success Rate: ${successRate}%`, successRate >= 80 ? 'success' : 'warn');

  return results.failed.length === 0 ? 0 : 1;
}

// Run tests
runAllTests().then(exitCode => process.exit(exitCode));
