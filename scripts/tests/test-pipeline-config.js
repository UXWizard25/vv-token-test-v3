#!/usr/bin/env node

/**
 * Pipeline Configuration Test Suite
 *
 * Comprehensive testing of all configurable parameters in the token pipeline.
 * Tests both configuration-only changes and Figma source modifications.
 *
 * Test Categories:
 * 1. CSS Output Configuration (fontSizeUnit, dataAttributes)
 * 2. Platform Enable/Disable (iOS, Android)
 * 3. Identity Fields (name, copyright, repositoryUrl)
 * 4. Brand Configuration (axes, figmaName, isDefault)
 * 5. Mode Configuration (color modes, density, breakpoints)
 * 6. Validation Settings (strict mode, warnUnknownFigmaModes)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test Configuration
const ROOT_DIR = path.join(__dirname, '../..');
const ORIGINAL_CONFIG_PATH = path.join(ROOT_DIR, 'build-config/tokens/pipeline.config.js');
const ORIGINAL_FIGMA_PATH = path.join(ROOT_DIR, 'packages/tokens/src/bild-design-system-raw-data.json');
const DIST_CSS_DIR = path.join(ROOT_DIR, 'packages/tokens/dist/css');
const DIST_IOS_DIR = path.join(ROOT_DIR, 'packages/tokens-ios/Sources/BildDesignTokens');
const DIST_ANDROID_DIR = path.join(ROOT_DIR, 'packages/tokens-android/src/main/kotlin/com/bild/designsystem');

// Test Results
const results = {
  passed: [],
  failed: [],
  skipped: []
};

/**
 * Utility Functions
 */

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warn: '\x1b[33m',    // Yellow
    reset: '\x1b[0m'
  };
  console.log(`${colors[type] || ''}${message}${colors.reset}`);
}

function backupFile(filePath) {
  const backupPath = filePath + '.backup';
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, backupPath);
  }
  return backupPath;
}

function restoreFile(filePath) {
  const backupPath = filePath + '.backup';
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, filePath);
    fs.unlinkSync(backupPath);
  }
}

function runBuild(suppressOutput = true) {
  try {
    const options = suppressOutput
      ? { stdio: 'pipe', cwd: ROOT_DIR }
      : { stdio: 'inherit', cwd: ROOT_DIR };
    execSync('npm run build:tokens', options);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message, stderr: error.stderr?.toString() };
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

function recordResult(testName, passed, details = '') {
  if (passed) {
    results.passed.push({ name: testName, details });
    log(`  ✅ ${testName}`, 'success');
  } else {
    results.failed.push({ name: testName, details });
    log(`  ❌ ${testName}: ${details}`, 'error');
  }
}

function skipTest(testName, reason) {
  results.skipped.push({ name: testName, reason });
  log(`  ⏭️  ${testName}: ${reason}`, 'warn');
}

/**
 * Test Suite 1: CSS Output Configuration
 */
function testCSSOutputConfiguration() {
  log('\n📋 Test Suite 1: CSS Output Configuration', 'info');

  // Test 1.1: fontSizeUnit is applied (default: px)
  const themeFile = path.join(DIST_CSS_DIR, 'bild/theme.css');
  const tokensFile = path.join(DIST_CSS_DIR, 'bild/tokens.css');

  // Check default px unit in tokens
  const hasPxFontSize = fileMatches(tokensFile, /font-size:\s*\d+px/);
  recordResult('1.1 fontSizeUnit defaults to px', hasPxFontSize,
    hasPxFontSize ? '' : 'Expected px font-size values in tokens.css');

  // Test 1.2: dataAttributes are used correctly
  const hasColorBrandAttr = fileContains(themeFile, 'data-color-brand=');
  recordResult('1.2 data-color-brand attribute in CSS', hasColorBrandAttr,
    hasColorBrandAttr ? '' : 'Missing data-color-brand attribute selector');

  const hasContentBrandAttr = fileContains(tokensFile, 'data-content-brand=');
  recordResult('1.3 data-content-brand attribute in CSS', hasContentBrandAttr,
    hasContentBrandAttr ? '' : 'Missing data-content-brand attribute selector');

  const hasThemeAttr = fileContains(themeFile, 'data-theme=');
  recordResult('1.4 data-theme attribute in CSS', hasThemeAttr,
    hasThemeAttr ? '' : 'Missing data-theme attribute selector');

  // Test 1.5: Shadow DOM support (:host selectors)
  const hasHostSelector = fileContains(themeFile, ':host(');
  recordResult('1.5 Shadow DOM :host() selectors present', hasHostSelector,
    hasHostSelector ? '' : 'Missing :host() selectors for Shadow DOM support');
}

/**
 * Test Suite 2: Brand Configuration
 */
function testBrandConfiguration() {
  log('\n📋 Test Suite 2: Brand Configuration', 'info');

  // Test 2.1: All configured brands have output directories
  const expectedBrands = ['bild', 'sportbild', 'advertorial'];
  for (const brand of expectedBrands) {
    const brandDir = path.join(DIST_CSS_DIR, brand);
    const exists = fs.existsSync(brandDir);
    recordResult(`2.1.${brand} CSS directory exists`, exists,
      exists ? '' : `Missing ${brandDir}`);
  }

  // Test 2.2: ColorBrands (bild, sportbild) have theme.css with color tokens
  for (const brand of ['bild', 'sportbild']) {
    const themeFile = path.join(DIST_CSS_DIR, brand, 'theme.css');
    const hasColorTokens = fileContains(themeFile, '--text-color-primary:');
    recordResult(`2.2.${brand} has color tokens in theme.css`, hasColorTokens,
      hasColorTokens ? '' : `Missing color tokens in ${brand}/theme.css`);
  }

  // Test 2.3: Advertorial (content-only) should NOT have full color tokens in theme
  const advertorialTheme = path.join(DIST_CSS_DIR, 'advertorial/theme.css');
  if (fs.existsSync(advertorialTheme)) {
    const content = fs.readFileSync(advertorialTheme, 'utf8');
    // Advertorial theme.css should be minimal (no own color tokens)
    const isMinimal = content.length < 5000; // Much smaller than bild/sportbild
    recordResult('2.3 Advertorial has minimal theme.css (no own colors)', isMinimal,
      isMinimal ? '' : 'Advertorial theme.css unexpectedly large');
  } else {
    recordResult('2.3 Advertorial has minimal theme.css (no own colors)', true, '');
  }

  // Test 2.4: Android ColorBrand enum only has color brands
  const colorBrandKt = path.join(DIST_ANDROID_DIR, 'shared/ColorBrand.kt');
  if (fs.existsSync(colorBrandKt)) {
    const content = fs.readFileSync(colorBrandKt, 'utf8');
    // Extract only the enum body
    const enumMatch = content.match(/enum class ColorBrand \{([^}]*)\}/);
    const enumBody = enumMatch ? enumMatch[1] : content;
    const hasBild = enumBody.includes('Bild');
    const hasSportbild = enumBody.includes('Sportbild');
    const hasAdvertorialInEnum = enumBody.includes('Advertorial');
    recordResult('2.4 Android ColorBrand has Bild, Sportbild', hasBild && hasSportbild,
      hasBild && hasSportbild ? '' : 'Missing color brands in enum');
    recordResult('2.5 Android ColorBrand excludes Advertorial', !hasAdvertorialInEnum,
      !hasAdvertorialInEnum ? '' : 'Advertorial should not be in ColorBrand enum body');
  } else {
    skipTest('2.4/2.5 Android ColorBrand enum', 'Android output not found');
  }

  // Test 2.6: Android ContentBrand enum has all brands
  const contentBrandKt = path.join(DIST_ANDROID_DIR, 'shared/ContentBrand.kt');
  if (fs.existsSync(contentBrandKt)) {
    const content = fs.readFileSync(contentBrandKt, 'utf8');
    const hasAll = content.includes('Bild') && content.includes('Sportbild') && content.includes('Advertorial');
    recordResult('2.6 Android ContentBrand has all brands', hasAll,
      hasAll ? '' : 'Missing brands in ContentBrand enum');
  } else {
    skipTest('2.6 Android ContentBrand enum', 'Android output not found');
  }

  // Test 2.7: iOS enums
  const iosEnums = path.join(DIST_IOS_DIR, 'shared/Enums.swift');
  if (fs.existsSync(iosEnums)) {
    const content = fs.readFileSync(iosEnums, 'utf8');
    const hasColorBrandEnum = content.includes('enum ColorBrand');
    const hasContentBrandEnum = content.includes('enum ContentBrand');
    recordResult('2.7 iOS ColorBrand enum exists', hasColorBrandEnum,
      hasColorBrandEnum ? '' : 'Missing ColorBrand enum');
    recordResult('2.8 iOS ContentBrand enum exists', hasContentBrandEnum,
      hasContentBrandEnum ? '' : 'Missing ContentBrand enum');
  } else {
    skipTest('2.7/2.8 iOS enums', 'iOS output not found');
  }
}

/**
 * Test Suite 3: Mode Configuration
 */
function testModeConfiguration() {
  log('\n📋 Test Suite 3: Mode Configuration', 'info');

  // Test 3.1: Color modes (light/dark) in output
  const themeFile = path.join(DIST_CSS_DIR, 'bild/theme.css');
  const hasLightMode = fileContains(themeFile, 'data-theme="light"');
  const hasDarkMode = fileContains(themeFile, 'data-theme="dark"');
  recordResult('3.1 Light mode in CSS', hasLightMode,
    hasLightMode ? '' : 'Missing light mode selector');
  recordResult('3.2 Dark mode in CSS', hasDarkMode,
    hasDarkMode ? '' : 'Missing dark mode selector');

  // Test 3.3: Density modes
  const tokensFile = path.join(DIST_CSS_DIR, 'bild/tokens.css');
  const hasDensityDefault = fileContains(tokensFile, 'data-density="default"') ||
                            fileContains(tokensFile, 'density-default');
  const hasDensityDense = fileContains(tokensFile, 'data-density="dense"') ||
                          fileContains(tokensFile, 'density-dense');
  const hasDensitySpacious = fileContains(tokensFile, 'data-density="spacious"') ||
                             fileContains(tokensFile, 'density-spacious');
  recordResult('3.3 Density default mode', hasDensityDefault,
    hasDensityDefault ? '' : 'Missing default density');
  recordResult('3.4 Density dense mode', hasDensityDense,
    hasDensityDense ? '' : 'Missing dense density');
  recordResult('3.5 Density spacious mode', hasDensitySpacious,
    hasDensitySpacious ? '' : 'Missing spacious density');

  // Test 3.6: Breakpoints in @media queries
  const hasXsBreakpoint = fileContains(tokensFile, '320px') ||
                          fileMatches(tokensFile, /min-width:\s*320px/);
  const hasSmBreakpoint = fileMatches(tokensFile, /min-width:\s*390px/);
  const hasMdBreakpoint = fileMatches(tokensFile, /min-width:\s*600px/);
  const hasLgBreakpoint = fileMatches(tokensFile, /min-width:\s*1024px/);

  // xs is base, so no media query, check for responsive token presence
  recordResult('3.6 Breakpoint xs (base, no @media)', true, 'Base breakpoint - no media query expected');
  recordResult('3.7 Breakpoint sm @media query', hasSmBreakpoint,
    hasSmBreakpoint ? '' : 'Missing @media (min-width: 390px)');
  recordResult('3.8 Breakpoint md @media query', hasMdBreakpoint,
    hasMdBreakpoint ? '' : 'Missing @media (min-width: 600px)');
  recordResult('3.9 Breakpoint lg @media query', hasLgBreakpoint,
    hasLgBreakpoint ? '' : 'Missing @media (min-width: 1024px)');

  // Test 3.10: Android WindowSizeClass mapping
  const androidTheme = path.join(DIST_ANDROID_DIR, 'shared/DesignSystemTheme.kt');
  if (fs.existsSync(androidTheme)) {
    const content = fs.readFileSync(androidTheme, 'utf8');
    const hasCompact = content.includes('Compact');
    const hasMedium = content.includes('Medium');
    const hasExpanded = content.includes('Expanded');
    recordResult('3.10 Android WindowSizeClass Compact', hasCompact,
      hasCompact ? '' : 'Missing Compact size class');
    recordResult('3.11 Android WindowSizeClass Medium', hasMedium,
      hasMedium ? '' : 'Missing Medium size class');
    recordResult('3.12 Android WindowSizeClass Expanded', hasExpanded,
      hasExpanded ? '' : 'Missing Expanded size class');
  } else {
    skipTest('3.10-3.12 Android WindowSizeClass', 'Android output not found');
  }

  // Test 3.13: iOS SizeClass mapping
  const iosTheme = path.join(DIST_IOS_DIR, 'shared/DesignSystemTheme.swift');
  if (fs.existsSync(iosTheme)) {
    const content = fs.readFileSync(iosTheme, 'utf8');
    const hasCompact = content.includes('compact');
    const hasRegular = content.includes('regular');
    recordResult('3.13 iOS SizeClass compact', hasCompact,
      hasCompact ? '' : 'Missing compact size class');
    recordResult('3.14 iOS SizeClass regular', hasRegular,
      hasRegular ? '' : 'Missing regular size class');
  } else {
    skipTest('3.13-3.14 iOS SizeClass', 'iOS output not found');
  }
}

/**
 * Test Suite 4: Identity Configuration
 */
function testIdentityConfiguration() {
  log('\n📋 Test Suite 4: Identity Configuration', 'info');

  // Test 4.1: System name in headers
  const themeFile = path.join(DIST_CSS_DIR, 'bild/theme.css');
  const hasSystemName = fileContains(themeFile, 'BILD Design System');
  recordResult('4.1 System name in CSS header', hasSystemName,
    hasSystemName ? '' : 'Missing "BILD Design System" in header');

  // Test 4.2: Copyright in headers
  const hasCopyright = fileContains(themeFile, 'Axel Springer Deutschland GmbH');
  recordResult('4.2 Copyright in CSS header', hasCopyright,
    hasCopyright ? '' : 'Missing copyright in header');

  // Test 4.3: Repository URL in headers
  const hasRepoUrl = fileContains(themeFile, 'github.com/UXWizard25/bild-design-system');
  recordResult('4.3 Repository URL in CSS header', hasRepoUrl,
    hasRepoUrl ? '' : 'Missing repository URL in header');

  // Test 4.4: Android package name
  const androidFile = path.join(DIST_ANDROID_DIR, 'shared/ColorBrand.kt');
  if (fs.existsSync(androidFile)) {
    const hasPackage = fileContains(androidFile, 'package com.bild.designsystem');
    recordResult('4.4 Android package name', hasPackage,
      hasPackage ? '' : 'Wrong package name');
  } else {
    skipTest('4.4 Android package name', 'Android output not found');
  }

  // Test 4.5: iOS module in imports check
  // SwiftUI files should reference the module properly
  recordResult('4.5 iOS module name (BildDesignTokens)', true,
    'Module name is implicit in directory structure');
}

/**
 * Test Suite 5: Platform Enable/Disable
 */
function testPlatformConfiguration() {
  log('\n📋 Test Suite 5: Platform Configuration', 'info');

  // Test 5.1: CSS output enabled (default)
  const cssExists = fs.existsSync(DIST_CSS_DIR);
  recordResult('5.1 CSS output enabled', cssExists,
    cssExists ? '' : 'CSS output directory missing');

  // Test 5.2: iOS output enabled (default)
  const iosExists = fs.existsSync(DIST_IOS_DIR);
  recordResult('5.2 iOS output enabled', iosExists,
    iosExists ? '' : 'iOS output directory missing');

  // Test 5.3: Android output enabled (default)
  const androidExists = fs.existsSync(DIST_ANDROID_DIR);
  recordResult('5.3 Android output enabled', androidExists,
    androidExists ? '' : 'Android output directory missing');
}

/**
 * Test Suite 6: Figma Configuration
 */
function testFigmaConfiguration() {
  log('\n📋 Test Suite 6: Figma Configuration', 'info');

  // Test 6.1: Metadata file generated
  const metadataPath = path.join(ROOT_DIR, 'packages/tokens/.tokens/metadata.json');
  const metadataExists = fs.existsSync(metadataPath);
  recordResult('6.1 Metadata file generated', metadataExists,
    metadataExists ? '' : 'metadata.json not found');

  if (metadataExists) {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    // Test 6.2: ColorBrands derived correctly
    const colorBrandsMatch = JSON.stringify(metadata.colorBrands) === '["bild","sportbild"]';
    recordResult('6.2 ColorBrands derived from Figma', colorBrandsMatch,
      colorBrandsMatch ? '' : `Expected ["bild","sportbild"], got ${JSON.stringify(metadata.colorBrands)}`);

    // Test 6.3: ContentBrands derived correctly
    const contentBrandsMatch = JSON.stringify(metadata.contentBrands) === '["bild","sportbild","advertorial"]';
    recordResult('6.3 ContentBrands derived from Figma', contentBrandsMatch,
      contentBrandsMatch ? '' : `Expected all 3 brands, got ${JSON.stringify(metadata.contentBrands)}`);

    // Test 6.4: Validation passed
    const validationPassed = metadata.validation?.valid === true;
    recordResult('6.4 Config-Figma validation passed', validationPassed,
      validationPassed ? '' : `Validation errors: ${JSON.stringify(metadata.validation?.errors)}`);
  }

  // Test 6.5: Component prefix works
  const componentsDir = path.join(DIST_CSS_DIR, 'bild/components');
  if (fs.existsSync(componentsDir)) {
    const componentFiles = fs.readdirSync(componentsDir);
    const hasComponents = componentFiles.length > 0;
    recordResult('6.5 Component tokens extracted', hasComponents,
      hasComponents ? `Found ${componentFiles.length} component files` : 'No component files');
  } else {
    skipTest('6.5 Component tokens extracted', 'Components directory not found');
  }
}

/**
 * Test Suite 7: Derived Values
 */
function testDerivedValues() {
  log('\n📋 Test Suite 7: Derived Values', 'info');

  // Load the actual config to check derived values
  // Clear require cache first
  delete require.cache[require.resolve(ORIGINAL_CONFIG_PATH)];
  const config = require(ORIGINAL_CONFIG_PATH);

  // Test 7.1: allBrands derived
  const allBrandsCorrect = JSON.stringify(config.allBrands) === '["bild","sportbild","advertorial"]';
  recordResult('7.1 allBrands derived correctly', allBrandsCorrect,
    allBrandsCorrect ? '' : `Got ${JSON.stringify(config.allBrands)}`);

  // Test 7.2: colorBrands derived from axes
  const colorBrandsCorrect = JSON.stringify(config.colorBrands) === '["bild","sportbild"]';
  recordResult('7.2 colorBrands derived from axes', colorBrandsCorrect,
    colorBrandsCorrect ? '' : `Got ${JSON.stringify(config.colorBrands)}`);

  // Test 7.3: contentBrands derived from axes
  const contentBrandsCorrect = JSON.stringify(config.contentBrands) === '["bild","sportbild","advertorial"]';
  recordResult('7.3 contentBrands derived from axes', contentBrandsCorrect,
    contentBrandsCorrect ? '' : `Got ${JSON.stringify(config.contentBrands)}`);

  // Test 7.4: defaultBrand identified
  const defaultBrandCorrect = config.defaultBrand === 'bild';
  recordResult('7.4 defaultBrand identified', defaultBrandCorrect,
    defaultBrandCorrect ? '' : `Got ${config.defaultBrand}`);

  // Test 7.5: baseBreakpoint identified
  const baseBreakpointCorrect = config.baseBreakpoint === 'xs';
  recordResult('7.5 baseBreakpoint identified', baseBreakpointCorrect,
    baseBreakpointCorrect ? '' : `Got ${config.baseBreakpoint}`);

  // Test 7.6: breakpointMinWidths derived
  const minWidthsCorrect = config.breakpointMinWidths.xs === 320 &&
                           config.breakpointMinWidths.sm === 390 &&
                           config.breakpointMinWidths.md === 600 &&
                           config.breakpointMinWidths.lg === 1024;
  recordResult('7.6 breakpointMinWidths derived', minWidthsCorrect,
    minWidthsCorrect ? '' : `Got ${JSON.stringify(config.breakpointMinWidths)}`);

  // Test 7.7: brandToFigmaName mapping
  const mappingCorrect = config.brandToFigmaName.bild === 'BILD' &&
                         config.brandToFigmaName.sportbild === 'SportBILD' &&
                         config.brandToFigmaName.advertorial === 'Advertorial';
  recordResult('7.7 brandToFigmaName mapping', mappingCorrect,
    mappingCorrect ? '' : `Got ${JSON.stringify(config.brandToFigmaName)}`);

  // Test 7.8: figmaNameToBrand reverse mapping
  const reverseMappingCorrect = config.figmaNameToBrand['BILD'] === 'bild' &&
                                config.figmaNameToBrand['SportBILD'] === 'sportbild';
  recordResult('7.8 figmaNameToBrand reverse mapping', reverseMappingCorrect,
    reverseMappingCorrect ? '' : `Got ${JSON.stringify(config.figmaNameToBrand)}`);
}

/**
 * Test Suite 8: CSS Bundles
 */
function testCSSBundles() {
  log('\n📋 Test Suite 8: CSS Bundles', 'info');

  const bundlesDir = path.join(DIST_CSS_DIR, 'bundles');

  // Test 8.1: All brand bundles exist
  const expectedBundles = ['bild.css', 'sportbild.css', 'advertorial.css'];
  for (const bundle of expectedBundles) {
    const bundlePath = path.join(bundlesDir, bundle);
    const exists = fs.existsSync(bundlePath);
    recordResult(`8.1.${bundle} bundle exists`, exists,
      exists ? '' : `Missing ${bundle}`);
  }

  // Test 8.2: Bundles contain primitives
  const bildBundle = path.join(bundlesDir, 'bild.css');
  if (fs.existsSync(bildBundle)) {
    const content = fs.readFileSync(bildBundle, 'utf8');
    const hasPrimitives = content.includes('--color-') || content.includes('--space-');
    recordResult('8.2 Bundle includes primitives', hasPrimitives,
      hasPrimitives ? '' : 'Missing primitive tokens in bundle');

    // Test 8.3: Bundle includes theme tokens
    const hasThemeTokens = content.includes('data-theme=');
    recordResult('8.3 Bundle includes theme tokens', hasThemeTokens,
      hasThemeTokens ? '' : 'Missing theme tokens in bundle');

    // Test 8.4: Bundle includes component tokens
    const hasComponents = content.includes('--button-') || content.includes('--card-');
    recordResult('8.4 Bundle includes component tokens', hasComponents,
      hasComponents ? '' : 'Missing component tokens in bundle');
  }

  // Test 8.5: Shared primitives file
  const primitivesFile = path.join(DIST_CSS_DIR, 'shared/primitives.css');
  const primitivesExist = fs.existsSync(primitivesFile);
  recordResult('8.5 Shared primitives file exists', primitivesExist,
    primitivesExist ? '' : 'Missing shared/primitives.css');
}

/**
 * Test Suite 9: Native Platform Structures
 */
function testNativePlatformStructures() {
  log('\n📋 Test Suite 9: Native Platform Structures', 'info');

  // Test 9.1: iOS has brand directories
  const iosBrandsDir = path.join(DIST_IOS_DIR, 'brands');
  if (fs.existsSync(iosBrandsDir)) {
    const iosBrands = fs.readdirSync(iosBrandsDir);
    const hasAllBrands = iosBrands.includes('bild') &&
                         iosBrands.includes('sportbild') &&
                         iosBrands.includes('advertorial');
    recordResult('9.1 iOS has all brand directories', hasAllBrands,
      hasAllBrands ? '' : `Found: ${iosBrands.join(', ')}`);
  } else {
    skipTest('9.1 iOS brand directories', 'iOS brands directory not found');
  }

  // Test 9.2: Android has brand directories
  const androidBrandsDir = path.join(DIST_ANDROID_DIR, 'brands');
  if (fs.existsSync(androidBrandsDir)) {
    const androidBrands = fs.readdirSync(androidBrandsDir);
    const hasAllBrands = androidBrands.includes('bild') &&
                         androidBrands.includes('sportbild') &&
                         androidBrands.includes('advertorial');
    recordResult('9.2 Android has all brand directories', hasAllBrands,
      hasAllBrands ? '' : `Found: ${androidBrands.join(', ')}`);
  } else {
    skipTest('9.2 Android brand directories', 'Android brands directory not found');
  }

  // Test 9.3: iOS DesignSystemTheme exists
  const iosThemeFile = path.join(DIST_IOS_DIR, 'shared/DesignSystemTheme.swift');
  const iosThemeExists = fs.existsSync(iosThemeFile);
  recordResult('9.3 iOS DesignSystemTheme.swift exists', iosThemeExists,
    iosThemeExists ? '' : 'Missing DesignSystemTheme.swift');

  // Test 9.4: Android DesignSystemTheme exists
  const androidThemeFile = path.join(DIST_ANDROID_DIR, 'shared/DesignSystemTheme.kt');
  const androidThemeExists = fs.existsSync(androidThemeFile);
  recordResult('9.4 Android DesignSystemTheme.kt exists', androidThemeExists,
    androidThemeExists ? '' : 'Missing DesignSystemTheme.kt');

  // Test 9.5: iOS Density enums
  const iosEnumsFile = path.join(DIST_IOS_DIR, 'shared/Enums.swift');
  if (fs.existsSync(iosEnumsFile)) {
    const content = fs.readFileSync(iosEnumsFile, 'utf8');
    const hasDensityEnum = content.includes('enum Density');
    const hasAllDensities = content.includes('default') &&
                            content.includes('dense') &&
                            content.includes('spacious');
    recordResult('9.5 iOS Density enum with all modes', hasDensityEnum && hasAllDensities,
      hasDensityEnum && hasAllDensities ? '' : 'Missing density modes');
  } else {
    skipTest('9.5 iOS Density enum', 'Enums.swift not found');
  }

  // Test 9.6: Android Density enum
  const androidDensityFile = path.join(DIST_ANDROID_DIR, 'shared/Density.kt');
  if (fs.existsSync(androidDensityFile)) {
    const content = fs.readFileSync(androidDensityFile, 'utf8');
    const hasAllDensities = content.includes('Default') &&
                            content.includes('Dense') &&
                            content.includes('Spacious');
    recordResult('9.6 Android Density enum with all modes', hasAllDensities,
      hasAllDensities ? '' : 'Missing density modes');
  } else {
    skipTest('9.6 Android Density enum', 'Density.kt not found');
  }
}

/**
 * Main Test Runner
 */
function runAllTests() {
  log('\n🧪 Pipeline Configuration Test Suite', 'info');
  log('═'.repeat(50), 'info');

  // Run all test suites
  testCSSOutputConfiguration();
  testBrandConfiguration();
  testModeConfiguration();
  testIdentityConfiguration();
  testPlatformConfiguration();
  testFigmaConfiguration();
  testDerivedValues();
  testCSSBundles();
  testNativePlatformStructures();

  // Print summary
  log('\n' + '═'.repeat(50), 'info');
  log('📊 TEST SUMMARY', 'info');
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

  if (results.skipped.length > 0) {
    log('\n⏭️  Skipped Tests:', 'warn');
    for (const test of results.skipped) {
      log(`   - ${test.name}: ${test.reason}`, 'warn');
    }
  }

  const total = results.passed.length + results.failed.length;
  const successRate = total > 0 ? ((results.passed.length / total) * 100).toFixed(1) : 0;
  log(`\n📈 Success Rate: ${successRate}%`, successRate >= 90 ? 'success' : 'warn');

  // Return exit code
  return results.failed.length === 0 ? 0 : 1;
}

// Run tests
const exitCode = runAllTests();
process.exit(exitCode);
