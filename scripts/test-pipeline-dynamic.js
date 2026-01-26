#!/usr/bin/env node

/**
 * Dynamic Pipeline Test Suite
 *
 * Tests that the build pipeline adapts correctly to configuration changes:
 * 1. Adding a new brand
 * 2. Removing a brand
 * 3. Adding a new breakpoint
 * 4. Adding a new density mode
 * 5. Changing data-attributes
 * 6. Cross-reference validation
 *
 * This script modifies pipeline.config.js temporarily, runs builds,
 * and verifies the output adapts dynamically.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG_PATH = path.join(__dirname, '../build-config/tokens/pipeline.config.js');
const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'packages/tokens/dist');
const IOS_DIR = path.join(ROOT_DIR, 'packages/tokens-ios/Sources/BildDesignTokens');
const ANDROID_DIR = path.join(ROOT_DIR, 'packages/tokens-android/src/main/kotlin/com/bild/designsystem');
const TOKENS_DIR = path.join(ROOT_DIR, 'packages/tokens/.tokens');

// Store original config
const originalConfig = fs.readFileSync(CONFIG_PATH, 'utf-8');

let testsPassed = 0;
let testsFailed = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    testsPassed++;
    console.log(`    ✅ ${message}`);
  } else {
    testsFailed++;
    failures.push(message);
    console.log(`    ❌ ${message}`);
  }
}

function restoreConfig() {
  fs.writeFileSync(CONFIG_PATH, originalConfig, 'utf-8');
}

function loadConfig() {
  // Clear require cache
  delete require.cache[require.resolve(CONFIG_PATH)];
  return require(CONFIG_PATH);
}

function modifyConfig(modifications) {
  const config = loadConfig();
  const modified = JSON.parse(JSON.stringify(config));

  // Apply modifications
  for (const [path, value] of Object.entries(modifications)) {
    const parts = path.split('.');
    let obj = modified;
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = value;
  }

  // Write as module.exports
  const configStr = `module.exports = ${JSON.stringify(modified, null, 2)};\n`;
  fs.writeFileSync(CONFIG_PATH, configStr, 'utf-8');
  return modified;
}

function runPreprocess() {
  try {
    execSync('node scripts/tokens/preprocess.js', { cwd: ROOT_DIR, stdio: 'pipe' });
    return true;
  } catch (e) {
    console.log(`    Preprocess error: ${e.stderr?.toString().split('\n')[0] || e.message}`);
    return false;
  }
}

function runBuild() {
  try {
    execSync('node scripts/tokens/build.js', { cwd: ROOT_DIR, stdio: 'pipe', timeout: 180000 });
    return true;
  } catch (e) {
    console.log(`    Build error: ${e.stderr?.toString().split('\n').slice(0, 3).join('\n') || e.message}`);
    return false;
  }
}

function runBundles() {
  try {
    execSync('node scripts/tokens/bundles.js', { cwd: ROOT_DIR, stdio: 'pipe' });
    return true;
  } catch (e) {
    console.log(`    Bundles error: ${e.stderr?.toString().split('\n')[0] || e.message}`);
    return false;
  }
}

function runValidation() {
  try {
    execSync('node scripts/validate-pipeline-config.js', { cwd: ROOT_DIR, stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function fileContains(filePath, searchStr) {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.includes(searchStr);
}

function dirHasFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return false;
  return fs.readdirSync(dirPath).length > 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 1: Baseline Validation
// ═══════════════════════════════════════════════════════════════════════════

function testBaseline() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 1: Baseline Configuration Validation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  assert(runValidation(), 'Pipeline config validates successfully');

  // Run a fresh baseline build to ensure output matches current config
  assert(runPreprocess(), 'Baseline preprocess succeeds');
  assert(runBuild(), 'Baseline build succeeds');
  assert(runBundles(), 'Baseline bundles succeed');

  // Check CSS output exists for all brands
  assert(fileExists(path.join(DIST_DIR, 'css/bundles/bild.css')), 'BILD CSS bundle exists');
  assert(fileExists(path.join(DIST_DIR, 'css/bundles/sportbild.css')), 'SportBILD CSS bundle exists');
  assert(fileExists(path.join(DIST_DIR, 'css/bundles/advertorial.css')), 'Advertorial CSS bundle exists');

  // Check CSS contains correct data-attributes
  const bildCSS = fs.readFileSync(path.join(DIST_DIR, 'css/bundles/bild.css'), 'utf-8');
  assert(bildCSS.includes('data-color-brand="bild"'), 'BILD CSS uses data-color-brand attribute');
  assert(bildCSS.includes('data-content-brand="bild"'), 'BILD CSS uses data-content-brand attribute');
  assert(bildCSS.includes('data-theme="light"'), 'BILD CSS uses data-theme attribute');
  assert(bildCSS.includes('data-theme="dark"'), 'BILD CSS has dark theme');
  assert(bildCSS.includes('data-density="default"'), 'BILD CSS uses data-density attribute');
  assert(bildCSS.includes('data-density="dense"'), 'BILD CSS has dense density');
  assert(bildCSS.includes('data-density="spacious"'), 'BILD CSS has spacious density');

  // Check breakpoints
  assert(bildCSS.includes('@media (min-width: 390px)'), 'BILD CSS has sm breakpoint (390px)');
  assert(bildCSS.includes('@media (min-width: 600px)'), 'BILD CSS has md breakpoint (600px)');
  assert(bildCSS.includes('@media (min-width: 1024px)'), 'BILD CSS has lg breakpoint (1024px)');

  // Check iOS output
  assert(fileExists(path.join(IOS_DIR, 'shared/Enums.swift')), 'iOS Enums.swift exists');
  const enumsSwift = fs.readFileSync(path.join(IOS_DIR, 'shared/Enums.swift'), 'utf-8');
  assert(enumsSwift.includes('case bild'), 'iOS Enums has bild brand');
  assert(enumsSwift.includes('case sportbild'), 'iOS Enums has sportbild brand');
  assert(enumsSwift.includes('case advertorial'), 'iOS Enums has advertorial brand');
  assert(enumsSwift.includes('case compact'), 'iOS Enums has compact sizeClass');
  assert(enumsSwift.includes('case regular'), 'iOS Enums has regular sizeClass');
  assert(enumsSwift.includes('case dense'), 'iOS Enums has dense density');
  assert(enumsSwift.includes('case `default`'), 'iOS Enums has default density');
  assert(enumsSwift.includes('case spacious'), 'iOS Enums has spacious density');

  // Check Android output
  assert(fileExists(path.join(ANDROID_DIR, 'shared/Density.kt')), 'Android Density.kt exists');
  const densityKt = fs.readFileSync(path.join(ANDROID_DIR, 'shared/Density.kt'), 'utf-8');
  assert(densityKt.includes('Dense'), 'Android has Dense density');
  assert(densityKt.includes('Default'), 'Android has Default density');
  assert(densityKt.includes('Spacious'), 'Android has Spacious density');

  // Check Android WindowSizeClass
  assert(fileExists(path.join(ANDROID_DIR, 'shared/WindowSizeClass.kt')), 'Android WindowSizeClass.kt exists');
  const wscKt = fs.readFileSync(path.join(ANDROID_DIR, 'shared/WindowSizeClass.kt'), 'utf-8');
  assert(wscKt.includes('Compact'), 'Android has Compact WindowSizeClass');
  assert(wscKt.includes('Medium'), 'Android has Medium WindowSizeClass');
  assert(wscKt.includes('Expanded'), 'Android has Expanded WindowSizeClass');

  // Check header content
  assert(bildCSS.includes('BILD Design System Tokens'), 'CSS header contains system name');
  assert(bildCSS.includes('Axel Springer Deutschland GmbH'), 'CSS header contains copyright');
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 2: Add New Brand
// ═══════════════════════════════════════════════════════════════════════════

function testAddBrand() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 2: Add New Brand "testbrand"');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const config = loadConfig();
    const modified = JSON.parse(JSON.stringify(config));

    // Add a new brand
    modified.brands.all = ['bild', 'sportbild', 'advertorial', 'testbrand'];
    modified.brands.colorBrands = ['bild', 'sportbild', 'testbrand'];
    modified.brands.contentBrands = ['bild', 'sportbild', 'advertorial', 'testbrand'];
    modified.brands.displayNames.testbrand = 'TestBrand';

    // Add Figma mode mapping for new brand (use BILD's as placeholder)
    modified.source.modes.brands.testbrand = { modeId: '18038:0', figmaName: 'BILD' };

    const configStr = `module.exports = ${JSON.stringify(modified, null, 2)};\n`;
    fs.writeFileSync(CONFIG_PATH, configStr, 'utf-8');

    // Validate
    assert(runValidation(), 'Config validates with new brand');

    // Run preprocess (uses BILD data as placeholder for testbrand)
    const ppResult = runPreprocess();
    assert(ppResult, 'Preprocess succeeds with new brand');

    if (ppResult) {
      // Check that tokens directory was created for the new brand
      // Since testbrand maps to BILD's mode ID, it should produce BILD-like output
      assert(
        fileExists(path.join(TOKENS_DIR, 'brands/testbrand')),
        'Tokens directory created for testbrand'
      );
    }

    // Run build
    const buildResult = runBuild();
    assert(buildResult, 'Build succeeds with new brand');

    if (buildResult) {
      // Check CSS output (build.js creates intermediate brands/ directory)
      assert(
        fileExists(path.join(DIST_DIR, 'css/brands/testbrand')),
        'CSS output directory created for testbrand'
      );

      // Check iOS enums
      if (fileExists(path.join(IOS_DIR, 'shared/Enums.swift'))) {
        const enums = fs.readFileSync(path.join(IOS_DIR, 'shared/Enums.swift'), 'utf-8');
        assert(enums.includes('case testbrand'), 'iOS Enums includes testbrand');
      }

      // Check Android ColorBrand
      if (fileExists(path.join(ANDROID_DIR, 'shared/ColorBrand.kt'))) {
        const colorBrand = fs.readFileSync(path.join(ANDROID_DIR, 'shared/ColorBrand.kt'), 'utf-8');
        assert(colorBrand.includes('Testbrand'), 'Android ColorBrand includes Testbrand');
      }

      // Check Android ContentBrand
      if (fileExists(path.join(ANDROID_DIR, 'shared/ContentBrand.kt'))) {
        const contentBrand = fs.readFileSync(path.join(ANDROID_DIR, 'shared/ContentBrand.kt'), 'utf-8');
        assert(contentBrand.includes('Testbrand'), 'Android ContentBrand includes Testbrand');
      }

      // Run bundles
      const bundleResult = runBundles();
      assert(bundleResult, 'Bundles succeed with new brand');

      if (bundleResult) {
        assert(
          fileExists(path.join(DIST_DIR, 'css/bundles/testbrand.css')),
          'CSS bundle created for testbrand'
        );

        // Verify the bundle has correct data-attributes
        if (fileExists(path.join(DIST_DIR, 'css/bundles/testbrand.css'))) {
          const testBrandCSS = fs.readFileSync(path.join(DIST_DIR, 'css/bundles/testbrand.css'), 'utf-8');
          assert(
            testBrandCSS.includes('data-color-brand="testbrand"'),
            'TestBrand CSS uses correct data-color-brand'
          );
          assert(
            testBrandCSS.includes('data-content-brand="testbrand"'),
            'TestBrand CSS uses correct data-content-brand'
          );
        }
      }
    }
  } finally {
    restoreConfig();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 3: Remove a Brand
// ═══════════════════════════════════════════════════════════════════════════

function testRemoveBrand() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 3: Remove Brand "advertorial"');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const config = loadConfig();
    const modified = JSON.parse(JSON.stringify(config));

    // Remove advertorial
    modified.brands.all = ['bild', 'sportbild'];
    modified.brands.contentBrands = ['bild', 'sportbild'];
    delete modified.brands.displayNames.advertorial;
    delete modified.source.modes.brands.advertorial;

    const configStr = `module.exports = ${JSON.stringify(modified, null, 2)};\n`;
    fs.writeFileSync(CONFIG_PATH, configStr, 'utf-8');

    assert(runValidation(), 'Config validates without advertorial');

    const ppResult = runPreprocess();
    assert(ppResult, 'Preprocess succeeds without advertorial');

    if (ppResult) {
      // advertorial directory should NOT be created
      assert(
        !fileExists(path.join(TOKENS_DIR, 'brands/advertorial')),
        'No tokens directory for removed brand advertorial'
      );
    }

    const buildResult = runBuild();
    assert(buildResult, 'Build succeeds without advertorial');

    if (buildResult) {
      // iOS should not have advertorial in enums
      if (fileExists(path.join(IOS_DIR, 'shared/Enums.swift'))) {
        const enums = fs.readFileSync(path.join(IOS_DIR, 'shared/Enums.swift'), 'utf-8');
        assert(!enums.includes('case advertorial'), 'iOS Enums does NOT include advertorial');
        assert(enums.includes('case bild'), 'iOS Enums still has bild');
        assert(enums.includes('case sportbild'), 'iOS Enums still has sportbild');
      }

      const bundleResult = runBundles();
      assert(bundleResult, 'Bundles succeed without advertorial');

      if (bundleResult) {
        assert(
          !fileExists(path.join(DIST_DIR, 'css/bundles/advertorial.css')),
          'No CSS bundle for removed brand advertorial'
        );
        assert(
          fileExists(path.join(DIST_DIR, 'css/bundles/bild.css')),
          'BILD CSS bundle still exists'
        );
      }
    }
  } finally {
    restoreConfig();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 4: Add New Breakpoint
// ═══════════════════════════════════════════════════════════════════════════

function testAddBreakpoint() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 4: Add New Breakpoint "xl" (1440px)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const config = loadConfig();
    const modified = JSON.parse(JSON.stringify(config));

    // Add xl breakpoint
    modified.modes.breakpoints.xl = { minWidth: 1440, deviceName: 'Large Desktop' };

    // Add corresponding source mode (using lg's mode ID as placeholder)
    modified.source.modes.breakpoints.xl = '7015:2';

    // Also add xl to Android's expanded mapping (xl → expanded too)
    // Don't change iOS/Android sizeClass mappings - they just use the breakpoints they map to

    const configStr = `module.exports = ${JSON.stringify(modified, null, 2)};\n`;
    fs.writeFileSync(CONFIG_PATH, configStr, 'utf-8');

    assert(runValidation(), 'Config validates with xl breakpoint');

    const ppResult = runPreprocess();
    assert(ppResult, 'Preprocess succeeds with xl breakpoint');

    if (ppResult) {
      // Check that typography files now include xl
      const typXL = path.join(TOKENS_DIR, 'brands/bild/semantic/typography/typography-xl.json');
      assert(fileExists(typXL), 'Typography xl.json created for bild');
    }

    const buildResult = runBuild();
    assert(buildResult, 'Build succeeds with xl breakpoint');

    if (buildResult) {
      const bundleResult = runBundles();
      assert(bundleResult, 'Bundles succeed with xl breakpoint');

      if (bundleResult && fileExists(path.join(DIST_DIR, 'css/bundles/bild.css'))) {
        const bildCSS = fs.readFileSync(path.join(DIST_DIR, 'css/bundles/bild.css'), 'utf-8');
        // xl uses same Figma mode ID as lg → values are identical
        // CSS cascade optimization correctly omits redundant xl media query
        // Verify the xl breakpoint token file was generated (preprocess handles it)
        assert(
          fileExists(path.join(TOKENS_DIR, 'brands/bild/breakpoints/breakpoint-xl.json')),
          'XL breakpoint token file generated (same data as lg due to shared mode ID)'
        );
        // Original breakpoints should still be there
        assert(
          bildCSS.includes('@media (min-width: 390px)'),
          'CSS still has sm breakpoint (390px)'
        );
        assert(
          bildCSS.includes('@media (min-width: 1024px)'),
          'CSS still has lg breakpoint (1024px)'
        );
      }
    }
  } finally {
    restoreConfig();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 5: Add New Density Mode
// ═══════════════════════════════════════════════════════════════════════════

function testAddDensityMode() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 5: Add New Density Mode "compact"');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const config = loadConfig();
    const modified = JSON.parse(JSON.stringify(config));

    // Add compact density mode
    modified.modes.density = ['default', 'dense', 'spacious', 'compact'];
    modified.modes.densityDisplayNames.compact = 'Compact';

    // Add source mode mapping (use dense's mode ID as placeholder)
    modified.source.modes.densityModes.compact = '5695:1';

    const configStr = `module.exports = ${JSON.stringify(modified, null, 2)};\n`;
    fs.writeFileSync(CONFIG_PATH, configStr, 'utf-8');

    assert(runValidation(), 'Config validates with compact density mode');

    const ppResult = runPreprocess();
    assert(ppResult, 'Preprocess succeeds with compact density');

    const buildResult = runBuild();
    assert(buildResult, 'Build succeeds with compact density');

    if (buildResult) {
      // Check iOS density enum
      if (fileExists(path.join(IOS_DIR, 'shared/Enums.swift'))) {
        const enums = fs.readFileSync(path.join(IOS_DIR, 'shared/Enums.swift'), 'utf-8');
        assert(enums.includes('case compact'), 'iOS Enums includes compact density');
      }

      // Check Android Density enum
      if (fileExists(path.join(ANDROID_DIR, 'shared/Density.kt'))) {
        const densityKt = fs.readFileSync(path.join(ANDROID_DIR, 'shared/Density.kt'), 'utf-8');
        assert(densityKt.includes('Compact'), 'Android Density includes Compact');
      }

      // Check iOS density resolvers
      if (fileExists(path.join(IOS_DIR, 'shared/DesignSystemTheme.swift'))) {
        const theme = fs.readFileSync(path.join(IOS_DIR, 'shared/DesignSystemTheme.swift'), 'utf-8');
        assert(theme.includes('case .compact:'), 'iOS theme has compact density switch case');
      }

      // Check Android density resolvers
      if (fileExists(path.join(ANDROID_DIR, 'shared/DesignSystemTheme.kt'))) {
        const theme = fs.readFileSync(path.join(ANDROID_DIR, 'shared/DesignSystemTheme.kt'), 'utf-8');
        assert(theme.includes('Density.Compact'), 'Android theme has Density.Compact');
      }

      // Check CSS density
      const bundleResult = runBundles();
      assert(bundleResult, 'Bundles succeed with compact density');

      if (bundleResult && fileExists(path.join(DIST_DIR, 'css/bundles/bild.css'))) {
        const bildCSS = fs.readFileSync(path.join(DIST_DIR, 'css/bundles/bild.css'), 'utf-8');
        assert(
          bildCSS.includes('data-density="compact"'),
          'CSS contains compact density selector'
        );
      }
    }
  } finally {
    restoreConfig();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 6: Change Data Attributes
// ═══════════════════════════════════════════════════════════════════════════

function testCustomDataAttributes() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 6: Custom Data Attributes');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const config = loadConfig();
    const modified = JSON.parse(JSON.stringify(config));

    // Change data-attribute names
    modified.platforms.css.dataAttributes = {
      colorBrand: 'data-brand-color',
      contentBrand: 'data-brand-content',
      theme: 'data-mode',
      density: 'data-spacing',
    };

    const configStr = `module.exports = ${JSON.stringify(modified, null, 2)};\n`;
    fs.writeFileSync(CONFIG_PATH, configStr, 'utf-8');

    assert(runValidation(), 'Config validates with custom data attributes');

    // Need to rebuild from preprocessed tokens
    const buildResult = runBuild();
    assert(buildResult, 'Build succeeds with custom data attributes');

    if (buildResult) {
      const bundleResult = runBundles();
      assert(bundleResult, 'Bundles succeed with custom data attributes');

      if (bundleResult && fileExists(path.join(DIST_DIR, 'css/bundles/bild.css'))) {
        const bildCSS = fs.readFileSync(path.join(DIST_DIR, 'css/bundles/bild.css'), 'utf-8');
        assert(
          bildCSS.includes('data-brand-color="bild"'),
          'CSS uses custom colorBrand attribute'
        );
        assert(
          bildCSS.includes('data-brand-content="bild"'),
          'CSS uses custom contentBrand attribute'
        );
        assert(
          bildCSS.includes('data-mode="light"'),
          'CSS uses custom theme attribute'
        );
        assert(
          bildCSS.includes('data-mode="dark"'),
          'CSS uses custom theme attribute (dark)'
        );
        assert(
          bildCSS.includes('data-spacing="default"'),
          'CSS uses custom density attribute'
        );

        // Make sure old attributes are NOT present
        assert(
          !bildCSS.includes('data-color-brand='),
          'CSS does NOT use old data-color-brand'
        );
        assert(
          !bildCSS.includes('data-content-brand='),
          'CSS does NOT use old data-content-brand'
        );
        assert(
          !bildCSS.includes('data-theme='),
          'CSS does NOT use old data-theme'
        );
      }
    }
  } finally {
    restoreConfig();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 7: Change Identity/Branding
// ═══════════════════════════════════════════════════════════════════════════

function testChangeIdentity() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 7: Custom Identity (Different Design System Name)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const config = loadConfig();
    const modified = JSON.parse(JSON.stringify(config));

    modified.identity.name = 'Acme Design System';
    modified.identity.copyright = 'Acme Corp Inc.';

    const configStr = `module.exports = ${JSON.stringify(modified, null, 2)};\n`;
    fs.writeFileSync(CONFIG_PATH, configStr, 'utf-8');

    assert(runValidation(), 'Config validates with custom identity');

    const buildResult = runBuild();
    assert(buildResult, 'Build succeeds with custom identity');

    if (buildResult) {
      const bundleResult = runBundles();
      assert(bundleResult, 'Bundles succeed with custom identity');

      if (bundleResult && fileExists(path.join(DIST_DIR, 'css/bundles/bild.css'))) {
        const bildCSS = fs.readFileSync(path.join(DIST_DIR, 'css/bundles/bild.css'), 'utf-8');
        assert(
          bildCSS.includes('Acme Design System Tokens'),
          'CSS header uses custom system name'
        );
        assert(
          bildCSS.includes('Acme Corp Inc.'),
          'CSS header uses custom copyright'
        );
        assert(
          !bildCSS.includes('BILD Design System'),
          'CSS does NOT contain old system name'
        );
      }

      // Check iOS files
      if (fileExists(path.join(IOS_DIR, 'shared/Enums.swift'))) {
        const enums = fs.readFileSync(path.join(IOS_DIR, 'shared/Enums.swift'), 'utf-8');
        assert(
          enums.includes('Acme Design System'),
          'iOS files use custom system name'
        );
      }
    }
  } finally {
    restoreConfig();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 8: Hyphen Validation in Names
// ═══════════════════════════════════════════════════════════════════════════

function testHyphenValidation() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 8: Hyphen Validation (Should Reject Hyphens)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test brand name with hyphen
  try {
    const config = loadConfig();
    const modified = JSON.parse(JSON.stringify(config));
    modified.brands.all = ['bild', 'sport-bild', 'advertorial'];
    modified.brands.colorBrands = ['bild', 'sport-bild'];

    const configStr = `module.exports = ${JSON.stringify(modified, null, 2)};\n`;
    fs.writeFileSync(CONFIG_PATH, configStr, 'utf-8');

    assert(!runValidation(), 'Validation rejects brand name with hyphen');
  } finally {
    restoreConfig();
  }

  // Test breakpoint name with hyphen
  try {
    const config = loadConfig();
    const modified = JSON.parse(JSON.stringify(config));
    modified.modes.breakpoints['extra-large'] = { minWidth: 1440, deviceName: 'Extra Large' };
    modified.source.modes.breakpoints['extra-large'] = '7015:2';

    const configStr = `module.exports = ${JSON.stringify(modified, null, 2)};\n`;
    fs.writeFileSync(CONFIG_PATH, configStr, 'utf-8');

    assert(!runValidation(), 'Validation rejects breakpoint name with hyphen');
  } finally {
    restoreConfig();
  }

  // Test density mode with hyphen
  try {
    const config = loadConfig();
    const modified = JSON.parse(JSON.stringify(config));
    modified.modes.density = ['default', 'dense', 'spacious', 'extra-dense'];
    modified.source.modes.densityModes['extra-dense'] = '5695:1';

    const configStr = `module.exports = ${JSON.stringify(modified, null, 2)};\n`;
    fs.writeFileSync(CONFIG_PATH, configStr, 'utf-8');

    assert(!runValidation(), 'Validation rejects density mode with hyphen');
  } finally {
    restoreConfig();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 9: Font Size Unit Toggle
// ═══════════════════════════════════════════════════════════════════════════

function testFontSizeUnit() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 9: Font Size Unit Toggle (px → rem)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const config = loadConfig();
    const modified = JSON.parse(JSON.stringify(config));
    modified.platforms.css.fontSizeUnit = 'rem';

    const configStr = `module.exports = ${JSON.stringify(modified, null, 2)};\n`;
    fs.writeFileSync(CONFIG_PATH, configStr, 'utf-8');

    assert(runValidation(), 'Config validates with rem fontSizeUnit');

    const buildResult = runBuild();
    assert(buildResult, 'Build succeeds with rem fontSizeUnit');

    if (buildResult) {
      const bundleResult = runBundles();
      assert(bundleResult, 'Bundles succeed with rem fontSizeUnit');

      if (bundleResult && fileExists(path.join(DIST_DIR, 'css/bundles/bild.css'))) {
        const bildCSS = fs.readFileSync(path.join(DIST_DIR, 'css/bundles/bild.css'), 'utf-8');
        // Check for rem values in font-size declarations
        assert(
          bildCSS.includes('rem'),
          'CSS contains rem values for font-sizes'
        );
      }
    }
  } finally {
    restoreConfig();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST 10: Minimal Config (2 brands, 2 breakpoints, 2 densities)
// ═══════════════════════════════════════════════════════════════════════════

function testMinimalConfig() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 10: Minimal Config (2 brands, 2 breakpoints, 2 densities)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const config = loadConfig();
    const modified = JSON.parse(JSON.stringify(config));

    // Minimal brands
    modified.brands.all = ['bild', 'sportbild'];
    modified.brands.colorBrands = ['bild', 'sportbild'];
    modified.brands.contentBrands = ['bild', 'sportbild'];
    delete modified.brands.displayNames.advertorial;
    delete modified.source.modes.brands.advertorial;

    // Minimal breakpoints (just xs and lg)
    modified.modes.breakpoints = {
      xs: { minWidth: 320, deviceName: 'Mobile' },
      lg: { minWidth: 1024, deviceName: 'Desktop' },
    };
    modified.source.modes.breakpoints = {
      xs: '7017:0',
      lg: '7015:2',
    };
    // Update sizeClasses to reference available breakpoints
    modified.platforms.ios.sizeClasses = { compact: 'xs', regular: 'lg' };
    modified.platforms.android.sizeClasses = { compact: 'xs', expanded: 'lg' };

    // Minimal density
    modified.modes.density = ['default', 'dense'];
    modified.modes.densityDisplayNames = { default: 'Default', dense: 'Dense' };
    modified.source.modes.densityModes = {
      default: '5695:2',
      dense: '5695:1',
    };

    const configStr = `module.exports = ${JSON.stringify(modified, null, 2)};\n`;
    fs.writeFileSync(CONFIG_PATH, configStr, 'utf-8');

    assert(runValidation(), 'Minimal config validates');

    const ppResult = runPreprocess();
    assert(ppResult, 'Preprocess succeeds with minimal config');

    const buildResult = runBuild();
    assert(buildResult, 'Build succeeds with minimal config');

    if (buildResult) {
      // Check iOS output reflects minimal config
      if (fileExists(path.join(IOS_DIR, 'shared/Enums.swift'))) {
        const enums = fs.readFileSync(path.join(IOS_DIR, 'shared/Enums.swift'), 'utf-8');
        assert(!enums.includes('case advertorial'), 'iOS has no advertorial');
        assert(!enums.includes('case spacious'), 'iOS has no spacious density');
        assert(enums.includes('case dense'), 'iOS still has dense density');
      }

      // Check Android
      if (fileExists(path.join(ANDROID_DIR, 'shared/Density.kt'))) {
        const densityKt = fs.readFileSync(path.join(ANDROID_DIR, 'shared/Density.kt'), 'utf-8');
        assert(!densityKt.includes('Spacious'), 'Android has no Spacious density');
        assert(densityKt.includes('Dense'), 'Android still has Dense density');
      }

      const bundleResult = runBundles();
      assert(bundleResult, 'Bundles succeed with minimal config');

      if (bundleResult && fileExists(path.join(DIST_DIR, 'css/bundles/bild.css'))) {
        const bildCSS = fs.readFileSync(path.join(DIST_DIR, 'css/bundles/bild.css'), 'utf-8');
        // Only one @media query (lg)
        assert(
          !bildCSS.includes('@media (min-width: 390px)'),
          'CSS does NOT have sm breakpoint'
        );
        assert(
          !bildCSS.includes('@media (min-width: 600px)'),
          'CSS does NOT have md breakpoint'
        );
        assert(
          bildCSS.includes('@media (min-width: 1024px)'),
          'CSS still has lg breakpoint'
        );
        // No spacious density
        assert(
          !bildCSS.includes('data-density="spacious"'),
          'CSS does NOT have spacious density'
        );
        assert(
          bildCSS.includes('data-density="dense"'),
          'CSS still has dense density'
        );
      }
    }
  } finally {
    restoreConfig();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   MULTI-DESIGN-SYSTEM PIPELINE DYNAMIC TEST SUITE       ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\n  Testing that build pipeline adapts to config changes...\n`);

  const startTime = Date.now();

  try {
    testBaseline();
    testAddBrand();
    testRemoveBrand();
    testAddBreakpoint();
    testAddDensityMode();
    testCustomDataAttributes();
    testChangeIdentity();
    testHyphenValidation();
    testFontSizeUnit();
    testMinimalConfig();
  } finally {
    // Always restore original config
    restoreConfig();
    console.log('\n  🔄 Original config restored.');
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log(`║   RESULTS: ${testsPassed} passed, ${testsFailed} failed (${duration}s)${' '.repeat(Math.max(0, 20 - String(testsPassed).length - String(testsFailed).length - duration.length))}║`);
  console.log('╚══════════════════════════════════════════════════════════╝');

  if (testsFailed > 0) {
    console.log('\n  Failed tests:');
    for (const f of failures) {
      console.log(`    ❌ ${f}`);
    }
    process.exit(1);
  }
}

main();
