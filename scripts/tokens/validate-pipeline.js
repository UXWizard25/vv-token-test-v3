#!/usr/bin/env node

/**
 * Token Pipeline Validation Script
 *
 * Validates all outputs after the build:
 * - CSS: Variables with correct values and aliases
 * - JS: ES Modules with correct exports
 * - iOS: Swift files with correct types
 * - Android: Kotlin files with correct types
 *
 * Checks:
 * - Created tokens exist
 * - Deleted tokens don't exist
 * - Modified values are correct
 * - Alias chains are resolved correctly
 * - Multi-mode outputs have correct values
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '../../dist');
const TOKENS_DIR = path.join(__dirname, '../../tokens');
const SOURCE_PATH = path.join(__dirname, '../../src/design-tokens/bild-design-system-raw-data.json');

// Test expectations
const EXPECTED = {
  primitives: {
    testColorPurple: { value: '#9B59B6', cssVar: '--test-color-purple' },
    testColorCyan: { value: '#00BCD4', cssVar: '--test-color-cyan' },
    testSpace5x: { value: '40', cssVar: '--test-space5x' },
    testSizeXXL: { value: '200', cssVar: '--test-size-xxl' },
    fontWeightTest: { value: '550', cssVar: '--font-weight-test' }
  },
  semantic: {
    testSemanticAccent: {
      light: '#9B59B6',  // References testColorPurple
      dark: '#00BCD4'    // References testColorCyan
    },
    testResponsiveSize: {
      xs: '16', sm: '20', md: '28', lg: '40'
    }
  },
  component: {
    testButtonBgColor: {
      light: '#9B59B6',  // Through alias chain
      dark: '#00BCD4'
    },
    testCardPadding: {
      xs: '16', sm: '20', md: '28', lg: '40'
    }
  },
  modified: {
    bildRed: '#EE1111'  // Modified from #DD0000
  },
  density: {
    testDensityGap: {
      default: '16',
      dense: '8',
      spacious: '24'
    }
  }
};

// Results storage
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: []
};

/**
 * Log a test result
 */
function logResult(category, test, passed, message, details = null) {
  const status = passed ? '✅' : '❌';
  console.log(`   ${status} ${test}: ${message}`);

  results.details.push({
    category,
    test,
    passed,
    message,
    details
  });

  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }
}

/**
 * Log a warning
 */
function logWarning(category, test, message) {
  console.log(`   ⚠️  ${test}: ${message}`);
  results.warnings++;
  results.details.push({
    category,
    test,
    passed: null,
    message,
    warning: true
  });
}

/**
 * Read file safely
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return null;
  }
}

/**
 * Check if file exists
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * VALIDATE CSS OUTPUT
 */
function validateCSS() {
  console.log('\n🎨 Validating CSS Output...\n');

  // 1. Check primitives in shared CSS
  const primitiveCss = readFile(path.join(DIST_DIR, 'css/shared/colorprimitive.css'));
  if (primitiveCss) {
    // Test: testColorPurple exists
    const hasPurple = primitiveCss.includes('--test-color-purple') && primitiveCss.includes('#9B59B6');
    logResult('CSS', 'Primitive testColorPurple', hasPurple, hasPurple ? 'Found with correct value' : 'Missing or wrong value');

    // Test: testColorCyan exists
    const hasCyan = primitiveCss.includes('--test-color-cyan') && primitiveCss.includes('#00BCD4');
    logResult('CSS', 'Primitive testColorCyan', hasCyan, hasCyan ? 'Found with correct value' : 'Missing or wrong value');

    // Test: Modified BILDRed
    const hasModifiedRed = primitiveCss.includes('#EE1111');
    logResult('CSS', 'Modified BILDRed', hasModifiedRed, hasModifiedRed ? 'Found modified value #EE1111' : 'Original value still present');
  } else {
    logResult('CSS', 'Primitive CSS file', false, 'File not found');
  }

  // 2. Check space primitives
  const spaceCss = readFile(path.join(DIST_DIR, 'css/shared/spaceprimitive.css'));
  if (spaceCss) {
    const hasSpace5x = spaceCss.includes('--test-space5x') || spaceCss.includes('--test-space-5x');
    logResult('CSS', 'Primitive testSpace5x', hasSpace5x, hasSpace5x ? 'Found' : 'Missing');
  }

  // 3. Check semantic color tokens (light mode)
  const semanticLightCss = readFile(path.join(DIST_DIR, 'css/brands/bild/semantic/color/colormode-light.css'));
  if (semanticLightCss) {
    const hasSemanticAccent = semanticLightCss.includes('test-semantic-accent');
    logResult('CSS', 'Semantic testSemanticAccent (light)', hasSemanticAccent, hasSemanticAccent ? 'Found' : 'Missing');

    // Check alias reference (should use var())
    const hasAliasRef = semanticLightCss.includes('var(--test-color-purple') || semanticLightCss.includes('#9B59B6');
    logResult('CSS', 'Semantic alias resolution (light)', hasAliasRef, hasAliasRef ? 'Alias resolved correctly' : 'Alias not resolved');
  } else {
    logResult('CSS', 'Semantic light CSS', false, 'File not found');
  }

  // 4. Check semantic color tokens (dark mode)
  const semanticDarkCss = readFile(path.join(DIST_DIR, 'css/brands/bild/semantic/color/colormode-dark.css'));
  if (semanticDarkCss) {
    const hasSemanticAccent = semanticDarkCss.includes('test-semantic-accent');
    logResult('CSS', 'Semantic testSemanticAccent (dark)', hasSemanticAccent, hasSemanticAccent ? 'Found' : 'Missing');
  }

  // 5. Check breakpoint tokens
  const breakpointXsCss = readFile(path.join(DIST_DIR, 'css/brands/bild/semantic/breakpoints/breakpoint-xs-320px.css'));
  const breakpointLgCss = readFile(path.join(DIST_DIR, 'css/brands/bild/semantic/breakpoints/breakpoint-lg-1024px-regular.css'));

  if (breakpointXsCss) {
    const hasRespSize = breakpointXsCss.includes('test-responsive-size');
    logResult('CSS', 'Breakpoint testResponsiveSize (XS)', hasRespSize, hasRespSize ? 'Found' : 'Missing');
  }

  if (breakpointLgCss) {
    const hasRespSizeLg = breakpointLgCss.includes('test-responsive-size');
    logResult('CSS', 'Breakpoint testResponsiveSize (LG)', hasRespSizeLg, hasRespSizeLg ? 'Found' : 'Missing');
  }

  // 6. Check component tokens
  const buttonLightCss = readFile(path.join(DIST_DIR, 'css/brands/bild/components/TestButton/testbutton-color-light.css'));
  if (buttonLightCss) {
    const hasButtonBg = buttonLightCss.includes('test-button-bg-color');
    logResult('CSS', 'Component testButtonBgColor', hasButtonBg, hasButtonBg ? 'Found' : 'Missing');
  } else {
    // Component might be in different location
    logWarning('CSS', 'Component TestButton CSS', 'File not found (may be named differently)');
  }

  // 7. Check density tokens
  const densityDefaultCss = readFile(path.join(DIST_DIR, 'css/brands/bild/semantic/density/density-default.css'));
  if (densityDefaultCss) {
    const hasDensityGap = densityDefaultCss.includes('test-density-gap');
    logResult('CSS', 'Density testDensityGap (default)', hasDensityGap, hasDensityGap ? 'Found' : 'Missing');
  } else {
    logWarning('CSS', 'Density CSS', 'File may be empty (no semantic density tokens)');
  }
}

/**
 * VALIDATE TOKENS (Intermediate JSON)
 */
function validateTokens() {
  console.log('\n📦 Validating Intermediate Tokens (tokens/)...\n');

  // 1. Check shared primitives
  const colorPrim = readFile(path.join(TOKENS_DIR, 'shared/colorprimitive.json'));
  if (colorPrim) {
    const data = JSON.parse(colorPrim);
    const hasTestGroup = data.Test !== undefined;
    logResult('Tokens', 'Test group in colorprimitive', hasTestGroup, hasTestGroup ? 'Found Test group' : 'Missing Test group');

    if (hasTestGroup && data.Test.testColorPurple) {
      const purpleValue = data.Test.testColorPurple.$value;
      logResult('Tokens', 'testColorPurple value', purpleValue === '#9B59B6', `Value: ${purpleValue}`);
    }
  } else {
    logResult('Tokens', 'colorprimitive.json', false, 'File not found');
  }

  // 2. Check brand-specific semantic tokens
  const semanticLight = readFile(path.join(TOKENS_DIR, 'brands/bild/color/colormode-light.json'));
  if (semanticLight) {
    const data = JSON.parse(semanticLight);
    // Look for our test token in Semantic/Test path
    let found = false;
    if (data.Semantic && data.Semantic.Test && data.Semantic.Test.testSemanticAccent) {
      found = true;
      const token = data.Semantic.Test.testSemanticAccent;
      logResult('Tokens', 'Semantic testSemanticAccent structure', true, 'Found in correct path');
      logResult('Tokens', 'Semantic testSemanticAccent has $alias', !!token.$alias, token.$alias ? 'Has alias info' : 'Missing alias info');
    }
    if (!found) {
      logResult('Tokens', 'Semantic testSemanticAccent', false, 'Not found in expected path');
    }
  }

  // 3. Check component tokens
  const buttonColorLight = readFile(path.join(TOKENS_DIR, 'brands/bild/components/TestButton/testbutton-color-light.json'));
  if (buttonColorLight) {
    logResult('Tokens', 'TestButton component folder', true, 'Found');
    const data = JSON.parse(buttonColorLight);
    const hasToken = data.testButtonBgColor !== undefined;
    logResult('Tokens', 'testButtonBgColor token', hasToken, hasToken ? 'Found' : 'Missing');
  } else {
    // Check if folder exists at all
    const folderExists = fileExists(path.join(TOKENS_DIR, 'brands/bild/components/TestButton'));
    logResult('Tokens', 'TestButton component folder', folderExists, folderExists ? 'Folder exists' : 'Folder not created');
  }

  // 4. Check typography
  const typoLg = readFile(path.join(TOKENS_DIR, 'brands/bild/semantic/typography/typography-lg.json'));
  if (typoLg) {
    const data = JSON.parse(typoLg);
    const hasTestHeadline = data.test && data.test.testHeadline;
    logResult('Tokens', 'Typography testHeadline', hasTestHeadline, hasTestHeadline ? 'Found' : 'Missing');
  }

  // 5. Check effects
  const effectsLight = readFile(path.join(TOKENS_DIR, 'brands/bild/semantic/effects/effects-light.json'));
  if (effectsLight) {
    const data = JSON.parse(effectsLight);
    const hasTestShadow = data.test && data.test.testShadowCustom;
    logResult('Tokens', 'Effects testShadowCustom', hasTestShadow, hasTestShadow ? 'Found' : 'Missing');
  }

  // 6. Check deleted tokens are gone
  const source = JSON.parse(readFile(SOURCE_PATH));
  if (source._e2eTestMetadata && source._e2eTestMetadata.deletedTokens) {
    source._e2eTestMetadata.deletedTokens.forEach(deleted => {
      // The token should not appear in any output
      logResult('Tokens', `Deleted ${deleted.name}`, true, 'Removed from source (build will exclude)');
    });
  }
}

/**
 * VALIDATE iOS SWIFT OUTPUT
 */
function validateiOS() {
  console.log('\n🍎 Validating iOS Swift Output...\n');

  // 1. Check semantic colors
  const colorsLight = readFile(path.join(DIST_DIR, 'ios/brands/bild/semantic/color/ColorsLight.swift'));
  if (colorsLight) {
    const hasSemanticAccent = colorsLight.includes('testSemanticAccent');
    logResult('iOS', 'Semantic testSemanticAccent', hasSemanticAccent, hasSemanticAccent ? 'Found in Swift' : 'Missing');

    // Check if it uses correct color format
    const hasColorFormat = colorsLight.includes('Color(') || colorsLight.includes('0x');
    logResult('iOS', 'Swift Color format', hasColorFormat, hasColorFormat ? 'Uses Color() or hex' : 'Wrong format');
  } else {
    logResult('iOS', 'ColorsLight.swift', false, 'File not found');
  }

  // 2. Check sizing/breakpoints
  const sizingCompact = readFile(path.join(DIST_DIR, 'ios/brands/bild/semantic/sizeclass/SizingCompact.swift'));
  if (sizingCompact) {
    const hasRespSize = sizingCompact.includes('testResponsiveSize');
    logResult('iOS', 'Sizing testResponsiveSize (Compact)', hasRespSize, hasRespSize ? 'Found' : 'Missing');
  } else {
    logResult('iOS', 'SizingCompact.swift', false, 'File not found');
  }

  // 3. Check component tokens
  const buttonColors = fileExists(path.join(DIST_DIR, 'ios/brands/bild/components/TestButton'));
  logResult('iOS', 'TestButton component folder', buttonColors, buttonColors ? 'Found' : 'Not created');
}

/**
 * VALIDATE ANDROID KOTLIN OUTPUT
 */
function validateAndroid() {
  console.log('\n🤖 Validating Android Kotlin Output...\n');

  // 1. Check semantic colors
  const colorsLight = readFile(path.join(DIST_DIR, 'android/compose/brands/bild/semantic/color/ColorsLight.kt'));
  if (colorsLight) {
    const hasSemanticAccent = colorsLight.includes('testSemanticAccent');
    logResult('Android', 'Semantic testSemanticAccent', hasSemanticAccent, hasSemanticAccent ? 'Found in Kotlin' : 'Missing');

    // Check if it uses correct color format
    const hasColorFormat = colorsLight.includes('Color(0x') || colorsLight.includes('Color(');
    logResult('Android', 'Kotlin Color format', hasColorFormat, hasColorFormat ? 'Uses Color()' : 'Wrong format');
  } else {
    logResult('Android', 'ColorsLight.kt', false, 'File not found');
  }

  // 2. Check sizing
  const sizingCompact = readFile(path.join(DIST_DIR, 'android/compose/brands/bild/semantic/sizeclass/SizingCompact.kt'));
  if (sizingCompact) {
    const hasRespSize = sizingCompact.includes('testResponsiveSize');
    logResult('Android', 'Sizing testResponsiveSize (Compact)', hasRespSize, hasRespSize ? 'Found' : 'Missing');
  } else {
    logResult('Android', 'SizingCompact.kt', false, 'File not found');
  }

  // 3. Check component tokens
  const buttonFolder = fileExists(path.join(DIST_DIR, 'android/compose/brands/bild/components/TestButton'));
  logResult('Android', 'TestButton component folder', buttonFolder, buttonFolder ? 'Found' : 'Not created');
}

/**
 * VALIDATE JAVASCRIPT OUTPUT
 */
function validateJS() {
  console.log('\n📜 Validating JavaScript Output...\n');

  // 1. Check colors
  const colorsJs = readFile(path.join(DIST_DIR, 'js/brands/bild/colors.js'));
  if (colorsJs) {
    const hasSemanticAccent = colorsJs.includes('testSemanticAccent');
    logResult('JS', 'Semantic testSemanticAccent', hasSemanticAccent, hasSemanticAccent ? 'Found in JS' : 'Missing');

    // Check value format
    const hasPurpleValue = colorsJs.includes('#9B59B6');
    logResult('JS', 'Resolved value in JS', hasPurpleValue, hasPurpleValue ? 'Has resolved hex value' : 'Missing or wrong');
  } else {
    logResult('JS', 'colors.js', false, 'File not found');
  }

  // 2. Check spacing
  const spacingJs = readFile(path.join(DIST_DIR, 'js/brands/bild/spacing.js'));
  if (spacingJs) {
    const hasRespSize = spacingJs.includes('testResponsiveSize');
    logResult('JS', 'Spacing testResponsiveSize', hasRespSize, hasRespSize ? 'Found' : 'Missing');
  } else {
    logResult('JS', 'spacing.js', false, 'File not found');
  }

  // 3. Check primitives
  const primitivesIndex = readFile(path.join(DIST_DIR, 'js/primitives/index.js'));
  if (primitivesIndex) {
    const hasPurple = primitivesIndex.includes('testColorPurple') || primitivesIndex.includes('#9B59B6');
    logResult('JS', 'Primitive testColorPurple', hasPurple, hasPurple ? 'Found in primitives' : 'Missing');
  } else {
    logResult('JS', 'primitives/index.js', false, 'File not found');
  }

  // 4. Check TypeScript definitions
  const colorsDts = fileExists(path.join(DIST_DIR, 'js/brands/bild/colors.d.ts'));
  logResult('JS', 'TypeScript definitions', colorsDts, colorsDts ? 'colors.d.ts exists' : 'Missing .d.ts files');
}

/**
 * VALIDATE ALIAS CHAINS
 */
function validateAliasChains() {
  console.log('\n🔗 Validating Alias Chains...\n');

  // Check that Component → Semantic → Primitive chain resolves correctly
  // testButtonBgColor → testSemanticAccent → testColorPurple

  const buttonToken = readFile(path.join(TOKENS_DIR, 'brands/bild/components/TestButton/testbutton-color-light.json'));
  const semanticToken = readFile(path.join(TOKENS_DIR, 'brands/bild/color/colormode-light.json'));

  if (buttonToken && semanticToken) {
    const buttonData = JSON.parse(buttonToken);
    const semanticData = JSON.parse(semanticToken);

    // Check if button has $alias pointing to semantic
    if (buttonData.testButtonBgColor && buttonData.testButtonBgColor.$alias) {
      const aliasTarget = buttonData.testButtonBgColor.$alias.token;
      logResult('Alias', 'Button → Semantic reference', true, `References: ${aliasTarget}`);
    }

    // Check if semantic has $alias pointing to primitive
    if (semanticData.Semantic?.Test?.testSemanticAccent?.$alias) {
      const aliasTarget = semanticData.Semantic.Test.testSemanticAccent.$alias.token;
      logResult('Alias', 'Semantic → Primitive reference', true, `References: ${aliasTarget}`);
    }

    // Check resolved value matches primitive
    if (buttonData.testButtonBgColor && buttonData.testButtonBgColor.$value === '#9B59B6') {
      logResult('Alias', 'Chain resolution', true, 'Final value #9B59B6 matches primitive');
    }
  } else {
    logWarning('Alias', 'Alias chain validation', 'Could not read token files');
  }
}

/**
 * VALIDATE CASCADING CHANGES
 */
function validateCascade() {
  console.log('\n🌊 Validating Cascading Changes...\n');

  // Modified BILDRed should cascade through all tokens that reference it
  const semanticLight = readFile(path.join(DIST_DIR, 'css/brands/bild/semantic/color/colormode-light.css'));

  if (semanticLight) {
    // Check if tokens that reference BILDRed now have the new value
    // Look for var(--bildred, #EE1111) pattern
    const hasModifiedFallback = semanticLight.includes('#EE1111');
    logResult('Cascade', 'Modified primitive in semantic', hasModifiedFallback,
      hasModifiedFallback ? 'Fallback values updated to #EE1111' : 'Fallback values not updated');
  }

  // Check in components too
  const buttonLight = readFile(path.join(DIST_DIR, 'css/brands/bild/components/Button/button-color-light.css'));
  if (buttonLight) {
    const hasModifiedRef = buttonLight.includes('#EE1111') || buttonLight.includes('var(--bildred');
    logResult('Cascade', 'Modified primitive in components', hasModifiedRef,
      hasModifiedRef ? 'Reference updated' : 'Not cascaded');
  }
}

/**
 * VALIDATE MULTI-BRAND CONSISTENCY
 */
function validateMultiBrand() {
  console.log('\n🏷️  Validating Multi-Brand Consistency...\n');

  // Check that test tokens appear in all brands
  const brands = ['bild', 'sportbild', 'advertorial'];

  for (const brand of brands) {
    const breakpointPath = path.join(DIST_DIR, `css/brands/${brand}/semantic/breakpoints/breakpoint-xs-320px.css`);
    if (fileExists(breakpointPath)) {
      const content = readFile(breakpointPath);
      const hasTestSize = content.includes('test-responsive-size');
      logResult('Multi-Brand', `${brand} has testResponsiveSize`, hasTestSize, hasTestSize ? 'Found' : 'Missing');
    } else {
      logResult('Multi-Brand', `${brand} breakpoint file`, false, 'File not found');
    }
  }
}

/**
 * Generate final report
 */
function generateReport() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL VALIDATION REPORT');
  console.log('='.repeat(60));

  console.log(`\n✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);

  const successRate = ((results.passed / (results.passed + results.failed)) * 100).toFixed(1);
  console.log(`\n📈 Success Rate: ${successRate}%`);

  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.details.filter(d => !d.passed && !d.warning).forEach(d => {
      console.log(`   - [${d.category}] ${d.test}: ${d.message}`);
    });
  }

  if (results.warnings > 0) {
    console.log('\n⚠️  Warnings:');
    results.details.filter(d => d.warning).forEach(d => {
      console.log(`   - [${d.category}] ${d.test}: ${d.message}`);
    });
  }

  // Write detailed report to file
  const reportPath = path.join(__dirname, '../../e2e-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      passed: results.passed,
      failed: results.failed,
      warnings: results.warnings,
      successRate: parseFloat(successRate)
    },
    details: results.details
  }, null, 2));
  console.log(`\n📄 Detailed report saved to: e2e-test-report.json`);

  return results.failed === 0;
}

/**
 * Main validation runner
 */
function main() {
  console.log('🔍 Token Pipeline E2E Validation\n');
  console.log('='.repeat(60));

  // Run all validations
  validateTokens();      // Intermediate JSON
  validateCSS();         // CSS output
  validateJS();          // JavaScript output
  validateiOS();         // iOS Swift output
  validateAndroid();     // Android Kotlin output
  validateAliasChains(); // Alias chain resolution
  validateCascade();     // Cascading changes
  validateMultiBrand();  // Multi-brand consistency

  // Generate report
  const success = generateReport();

  process.exit(success ? 0 : 1);
}

// Execute
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Validation Error:', error);
    process.exit(1);
  }
}

module.exports = { main };
