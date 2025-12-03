#!/usr/bin/env node

/**
 * Token Pipeline End-to-End Test Script
 *
 * Tests all operations on all layers:
 * - Create: New tokens
 * - Modify: Change values
 * - Delete: Remove tokens
 * - Alias: Change reference targets
 *
 * Additional tests:
 * - Multi-Mode: Light/Dark, Breakpoints, Brands
 * - Composite: Typography, Shadow
 * - Alias-Chains: Primitive → Semantic → Component
 * - Cross-Collection: References between collections
 */

const fs = require('fs');
const path = require('path');

const SOURCE_PATH = path.join(__dirname, '../../src/design-tokens/bild-design-system-raw-data.json');
const BACKUP_PATH = path.join(__dirname, '../../src/design-tokens/bild-design-system-raw-data.backup.json');

// Test token IDs (using high numbers to avoid conflicts)
const TEST_IDS = {
  // Primitive layer - new tokens
  PRIM_COLOR_TEST: 'VariableID:99900:1',
  PRIM_COLOR_TEST2: 'VariableID:99900:2',
  PRIM_SPACE_TEST: 'VariableID:99900:3',
  PRIM_SIZE_TEST: 'VariableID:99900:4',
  PRIM_FONT_TEST: 'VariableID:99900:5',

  // Semantic layer - new tokens
  SEM_COLOR_TEST: 'VariableID:99901:1',
  SEM_SIZE_TEST: 'VariableID:99901:2',

  // Component layer - new tokens
  COMP_BUTTON_TEST: 'VariableID:99902:1',
  COMP_CARD_TEST: 'VariableID:99902:2',

  // Alias chain test
  ALIAS_CHAIN_SEM: 'VariableID:99903:1',
  ALIAS_CHAIN_COMP: 'VariableID:99903:2',
};

// Collection IDs (from preprocess.js)
const COLLECTION_IDS = {
  FONT_PRIMITIVE: 'VariableCollectionId:470:1450',
  COLOR_PRIMITIVE: 'VariableCollectionId:539:2238',
  SIZE_PRIMITIVE: 'VariableCollectionId:4072:1817',
  SPACE_PRIMITIVE: 'VariableCollectionId:2726:12077',
  DENSITY: 'VariableCollectionId:5695:5841',
  BRAND_TOKEN_MAPPING: 'VariableCollectionId:18038:10593',
  BRAND_COLOR_MAPPING: 'VariableCollectionId:18212:14495',
  BREAKPOINT_MODE: 'VariableCollectionId:7017:25696',
  COLOR_MODE: 'VariableCollectionId:588:1979'
};

// Mode IDs
const MODE_IDS = {
  // ColorMode
  LIGHT: '588:0',
  DARK: '592:1',
  // Breakpoints
  XS: '7017:0',
  SM: '16706:1',
  MD: '7015:1',
  LG: '7015:2',
  // Brands (BrandTokenMapping)
  BILD_BTM: '18038:0',
  SPORTBILD_BTM: '18094:0',
  ADVERTORIAL_BTM: '18094:1',
  // Brands (BrandColorMapping)
  BILD_BCM: '18212:0',
  SPORTBILD_BCM: '18212:1',
  // Density
  DENSITY_DEFAULT: '5695:0',
  DENSITY_DENSE: '5695:1',
  DENSITY_SPACIOUS: '5695:2',
};

/**
 * Load source data
 */
function loadSource() {
  console.log('📥 Loading source data...');
  const data = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8'));
  console.log(`   ✅ Loaded ${data.collections.length} collections`);
  return data;
}

/**
 * Find collection by ID
 */
function findCollection(data, collectionId) {
  return data.collections.find(c => c.id === collectionId);
}

/**
 * Add a new variable to a collection
 */
function addVariable(collection, variable) {
  collection.variables.push(variable);
  collection.variableIds.push(variable.id);
}

/**
 * Remove a variable from a collection by ID
 */
function removeVariable(collection, variableId) {
  collection.variables = collection.variables.filter(v => v.id !== variableId);
  collection.variableIds = collection.variableIds.filter(id => id !== variableId);
}

/**
 * Modify a variable's value
 */
function modifyVariable(collection, variableId, modeId, newValue) {
  const variable = collection.variables.find(v => v.id === variableId);
  if (variable) {
    variable.valuesByMode[modeId] = newValue;
    return true;
  }
  return false;
}

/**
 * TEST SCENARIO 1: CREATE - Add new primitive tokens
 */
function testCreate(data) {
  console.log('\n🧪 TEST: CREATE - Adding new primitive tokens...');

  // 1.1 New Color Primitive
  const colorPrim = findCollection(data, COLLECTION_IDS.COLOR_PRIMITIVE);
  addVariable(colorPrim, {
    id: TEST_IDS.PRIM_COLOR_TEST,
    name: 'Test/testColorPurple',
    description: 'E2E Test: New purple color primitive',
    resolvedType: 'COLOR',
    valuesByMode: { '539:0': '#9B59B6' },
    scopes: ['ALL_FILLS'],
    hiddenFromPublishing: false,
    variableCollectionId: COLLECTION_IDS.COLOR_PRIMITIVE
  });
  console.log('   ✅ Added testColorPurple (#9B59B6)');

  // 1.2 Second Color Primitive (for alias testing)
  addVariable(colorPrim, {
    id: TEST_IDS.PRIM_COLOR_TEST2,
    name: 'Test/testColorCyan',
    description: 'E2E Test: New cyan color primitive',
    resolvedType: 'COLOR',
    valuesByMode: { '539:0': '#00BCD4' },
    scopes: ['ALL_FILLS'],
    hiddenFromPublishing: false,
    variableCollectionId: COLLECTION_IDS.COLOR_PRIMITIVE
  });
  console.log('   ✅ Added testColorCyan (#00BCD4)');

  // 1.3 New Space Primitive
  const spacePrim = findCollection(data, COLLECTION_IDS.SPACE_PRIMITIVE);
  addVariable(spacePrim, {
    id: TEST_IDS.PRIM_SPACE_TEST,
    name: 'Space/testSpace5x',
    description: 'E2E Test: 5x spacing (40px)',
    resolvedType: 'FLOAT',
    valuesByMode: { '2726:0': 40 },
    scopes: ['GAP'],
    hiddenFromPublishing: false,
    variableCollectionId: COLLECTION_IDS.SPACE_PRIMITIVE
  });
  console.log('   ✅ Added testSpace5x (40)');

  // 1.4 New Size Primitive
  const sizePrim = findCollection(data, COLLECTION_IDS.SIZE_PRIMITIVE);
  addVariable(sizePrim, {
    id: TEST_IDS.PRIM_SIZE_TEST,
    name: 'Size/testSizeXXL',
    description: 'E2E Test: XXL size (200px)',
    resolvedType: 'FLOAT',
    valuesByMode: { '4072:0': 200 },
    scopes: ['WIDTH_HEIGHT'],
    hiddenFromPublishing: false,
    variableCollectionId: COLLECTION_IDS.SIZE_PRIMITIVE
  });
  console.log('   ✅ Added testSizeXXL (200)');

  // 1.5 New Font Primitive
  const fontPrim = findCollection(data, COLLECTION_IDS.FONT_PRIMITIVE);
  addVariable(fontPrim, {
    id: TEST_IDS.PRIM_FONT_TEST,
    name: 'FontWeight/fontWeightTest',
    description: 'E2E Test: Test font weight (550)',
    resolvedType: 'FLOAT',
    valuesByMode: { '470:0': 550 },
    scopes: ['FONT_WEIGHT'],
    hiddenFromPublishing: false,
    variableCollectionId: COLLECTION_IDS.FONT_PRIMITIVE
  });
  console.log('   ✅ Added fontWeightTest (550)');

  return data;
}

/**
 * TEST SCENARIO 2: CREATE SEMANTIC - Add semantic tokens with aliases
 */
function testCreateSemantic(data) {
  console.log('\n🧪 TEST: CREATE SEMANTIC - Adding semantic tokens with aliases...');

  // 2.1 New Semantic Color (references primitive, multi-mode)
  const colorMode = findCollection(data, COLLECTION_IDS.COLOR_MODE);
  addVariable(colorMode, {
    id: TEST_IDS.SEM_COLOR_TEST,
    name: 'Semantic/Test/testSemanticAccent',
    description: 'E2E Test: Semantic accent color with light/dark modes',
    resolvedType: 'COLOR',
    valuesByMode: {
      [MODE_IDS.LIGHT]: { type: 'VARIABLE_ALIAS', id: TEST_IDS.PRIM_COLOR_TEST },  // Purple in light
      [MODE_IDS.DARK]: { type: 'VARIABLE_ALIAS', id: TEST_IDS.PRIM_COLOR_TEST2 }   // Cyan in dark
    },
    scopes: ['ALL_FILLS'],
    hiddenFromPublishing: false,
    variableCollectionId: COLLECTION_IDS.COLOR_MODE
  });
  console.log('   ✅ Added testSemanticAccent (Purple in Light, Cyan in Dark)');

  // 2.2 New Breakpoint Size (multi-breakpoint)
  const breakpointMode = findCollection(data, COLLECTION_IDS.BREAKPOINT_MODE);
  addVariable(breakpointMode, {
    id: TEST_IDS.SEM_SIZE_TEST,
    name: 'Semantic/Test/testResponsiveSize',
    description: 'E2E Test: Responsive size across breakpoints',
    resolvedType: 'FLOAT',
    valuesByMode: {
      [MODE_IDS.XS]: 16,
      [MODE_IDS.SM]: 20,
      [MODE_IDS.MD]: 28,
      [MODE_IDS.LG]: { type: 'VARIABLE_ALIAS', id: TEST_IDS.PRIM_SPACE_TEST }  // 40px from primitive
    },
    scopes: ['WIDTH_HEIGHT', 'GAP'],
    hiddenFromPublishing: false,
    variableCollectionId: COLLECTION_IDS.BREAKPOINT_MODE
  });
  console.log('   ✅ Added testResponsiveSize (16/20/28/40 across breakpoints)');

  return data;
}

/**
 * TEST SCENARIO 3: CREATE COMPONENT - Add component tokens with alias chains
 */
function testCreateComponent(data) {
  console.log('\n🧪 TEST: CREATE COMPONENT - Adding component tokens...');

  // 3.1 Component Button Token (references semantic)
  const colorMode = findCollection(data, COLLECTION_IDS.COLOR_MODE);
  addVariable(colorMode, {
    id: TEST_IDS.COMP_BUTTON_TEST,
    name: 'Component/TestButton/testButtonBgColor',
    description: 'E2E Test: Button background color (alias chain)',
    resolvedType: 'COLOR',
    valuesByMode: {
      [MODE_IDS.LIGHT]: { type: 'VARIABLE_ALIAS', id: TEST_IDS.SEM_COLOR_TEST },
      [MODE_IDS.DARK]: { type: 'VARIABLE_ALIAS', id: TEST_IDS.SEM_COLOR_TEST }
    },
    scopes: ['FRAME_FILL'],
    hiddenFromPublishing: false,
    variableCollectionId: COLLECTION_IDS.COLOR_MODE
  });
  console.log('   ✅ Added testButtonBgColor (references testSemanticAccent)');

  // 3.2 Component Card Token (references breakpoint semantic)
  const breakpointMode = findCollection(data, COLLECTION_IDS.BREAKPOINT_MODE);
  addVariable(breakpointMode, {
    id: TEST_IDS.COMP_CARD_TEST,
    name: 'Component/TestCard/testCardPadding',
    description: 'E2E Test: Card padding (references responsive size)',
    resolvedType: 'FLOAT',
    valuesByMode: {
      [MODE_IDS.XS]: { type: 'VARIABLE_ALIAS', id: TEST_IDS.SEM_SIZE_TEST },
      [MODE_IDS.SM]: { type: 'VARIABLE_ALIAS', id: TEST_IDS.SEM_SIZE_TEST },
      [MODE_IDS.MD]: { type: 'VARIABLE_ALIAS', id: TEST_IDS.SEM_SIZE_TEST },
      [MODE_IDS.LG]: { type: 'VARIABLE_ALIAS', id: TEST_IDS.SEM_SIZE_TEST }
    },
    scopes: ['GAP'],
    hiddenFromPublishing: false,
    variableCollectionId: COLLECTION_IDS.BREAKPOINT_MODE
  });
  console.log('   ✅ Added testCardPadding (references testResponsiveSize)');

  return data;
}

/**
 * TEST SCENARIO 4: MODIFY - Change existing token values
 */
function testModify(data) {
  console.log('\n🧪 TEST: MODIFY - Changing existing token values...');

  // 4.1 Modify a primitive color (BILDRed → test different shade)
  // We'll store the original for comparison
  const colorPrim = findCollection(data, COLLECTION_IDS.COLOR_PRIMITIVE);
  const bildRed = colorPrim.variables.find(v => v.name.includes('BILDRed') && !v.name.includes('Alpha') && !v.name.includes('035') && !v.name.includes('053'));
  if (bildRed) {
    const originalValue = bildRed.valuesByMode['539:0'];
    bildRed._originalValue = originalValue;  // Store for validation
    bildRed.valuesByMode['539:0'] = '#EE1111';  // Slightly different red
    bildRed.description = (bildRed.description || '') + ' [MODIFIED by E2E Test]';
    console.log(`   ✅ Modified BILDRed: ${originalValue} → #EE1111`);
  }

  // 4.2 Modify a semantic token value (direct value, not alias)
  const colorMode = findCollection(data, COLLECTION_IDS.COLOR_MODE);
  // Find a token with direct value (not alias)
  const semanticToken = colorMode.variables.find(v =>
    v.name.includes('Semantic') &&
    typeof v.valuesByMode[MODE_IDS.LIGHT] === 'string' &&
    v.valuesByMode[MODE_IDS.LIGHT].startsWith('#')
  );
  if (semanticToken) {
    const originalValue = semanticToken.valuesByMode[MODE_IDS.LIGHT];
    semanticToken._originalValue = originalValue;
    semanticToken.valuesByMode[MODE_IDS.LIGHT] = '#AABBCC';
    console.log(`   ✅ Modified ${semanticToken.name}: ${originalValue} → #AABBCC`);
  }

  // 4.3 Modify a breakpoint value
  const breakpointMode = findCollection(data, COLLECTION_IDS.BREAKPOINT_MODE);
  const bpToken = breakpointMode.variables.find(v =>
    typeof v.valuesByMode[MODE_IDS.XS] === 'number'
  );
  if (bpToken) {
    const originalValue = bpToken.valuesByMode[MODE_IDS.XS];
    bpToken._originalValueXS = originalValue;
    bpToken.valuesByMode[MODE_IDS.XS] = 999;  // Obvious test value
    console.log(`   ✅ Modified ${bpToken.name} XS: ${originalValue} → 999`);
  }

  return data;
}

/**
 * TEST SCENARIO 5: DELETE - Mark tokens for deletion tracking
 */
function testDelete(data) {
  console.log('\n🧪 TEST: DELETE - Removing tokens...');

  // We'll track what we delete for validation
  data._deletedTokens = [];

  // 5.1 Delete a primitive that's NOT referenced (safe delete)
  const colorPrim = findCollection(data, COLLECTION_IDS.COLOR_PRIMITIVE);
  // Find a color that's less likely to be referenced
  const toDelete = colorPrim.variables.find(v => v.name.includes('SportBILD') && v.name.includes('Alpha'));
  if (toDelete) {
    data._deletedTokens.push({
      id: toDelete.id,
      name: toDelete.name,
      collection: 'ColorPrimitive',
      type: 'primitive'
    });
    removeVariable(colorPrim, toDelete.id);
    console.log(`   ✅ Deleted primitive: ${toDelete.name}`);
  }

  // 5.2 Delete a semantic token
  const colorMode = findCollection(data, COLLECTION_IDS.COLOR_MODE);
  const semanticToDelete = colorMode.variables.find(v =>
    v.name.includes('Semantic') &&
    v.name.includes('Info') &&
    !v.name.includes('Component')
  );
  if (semanticToDelete) {
    data._deletedTokens.push({
      id: semanticToDelete.id,
      name: semanticToDelete.name,
      collection: 'ColorMode',
      type: 'semantic'
    });
    removeVariable(colorMode, semanticToDelete.id);
    console.log(`   ✅ Deleted semantic: ${semanticToDelete.name}`);
  }

  return data;
}

/**
 * TEST SCENARIO 6: ALIAS CHANGE - Switch reference targets
 */
function testAliasChange(data) {
  console.log('\n🧪 TEST: ALIAS CHANGE - Switching reference targets...');

  // Find a semantic token that references a primitive, and change the reference
  const colorMode = findCollection(data, COLLECTION_IDS.COLOR_MODE);

  const aliasToken = colorMode.variables.find(v => {
    const lightValue = v.valuesByMode[MODE_IDS.LIGHT];
    return lightValue &&
           typeof lightValue === 'object' &&
           lightValue.type === 'VARIABLE_ALIAS' &&
           v.name.includes('Semantic');
  });

  if (aliasToken) {
    const oldRef = aliasToken.valuesByMode[MODE_IDS.LIGHT].id;
    aliasToken._originalAliasId = oldRef;
    // Change to our test color
    aliasToken.valuesByMode[MODE_IDS.LIGHT] = {
      type: 'VARIABLE_ALIAS',
      id: TEST_IDS.PRIM_COLOR_TEST  // Now references testColorPurple
    };
    console.log(`   ✅ Changed alias in ${aliasToken.name}: ${oldRef} → ${TEST_IDS.PRIM_COLOR_TEST}`);
  }

  return data;
}

/**
 * TEST SCENARIO 7: COMPOSITE TOKENS - Add typography and shadow
 */
function testCompositeTokens(data) {
  console.log('\n🧪 TEST: COMPOSITE - Adding typography and shadow styles...');

  // 7.1 Add new Typography style
  if (!data.textStyles) data.textStyles = [];

  data.textStyles.push({
    id: 'S:e2e-test-typography-1',
    name: 'Global/Test/testHeadline',
    description: 'E2E Test: Custom headline style',
    fontName: { family: 'Gotham', style: 'Bold' },
    fontSize: 48,
    lineHeight: { unit: 'PIXELS', value: 56 },
    letterSpacing: { unit: 'PIXELS', value: -1 },
    textCase: 'ORIGINAL',
    textDecoration: 'NONE',
    boundVariables: {
      fontSize: { type: 'VARIABLE_ALIAS', id: TEST_IDS.SEM_SIZE_TEST }
    }
  });
  console.log('   ✅ Added testHeadline typography style');

  // 7.2 Add new Effect style (shadow)
  if (!data.effectStyles) data.effectStyles = [];

  data.effectStyles.push({
    id: 'S:e2e-test-shadow-1',
    name: 'Global/Test/testShadowCustom',
    description: 'E2E Test: Custom shadow effect',
    effects: [{
      type: 'DROP_SHADOW',
      visible: true,
      color: { r: 0, g: 0, b: 0, a: 0.25 },
      offset: { x: 0, y: 8 },
      radius: 24,
      spread: -4,
      blendMode: 'NORMAL',
      boundVariables: {
        color: { type: 'VARIABLE_ALIAS', id: TEST_IDS.PRIM_COLOR_TEST }
      }
    }]
  });
  console.log('   ✅ Added testShadowCustom effect style');

  // 7.3 Add Component Typography
  data.textStyles.push({
    id: 'S:e2e-test-component-typo-1',
    name: 'Component/TestButton/testButtonLabel',
    description: 'E2E Test: Button label typography',
    fontName: { family: 'Gotham Condensed', style: 'Bold' },
    fontSize: 16,
    lineHeight: { unit: 'PIXELS', value: 20 },
    letterSpacing: { unit: 'PIXELS', value: 0.5 },
    textCase: 'UPPER',
    textDecoration: 'NONE'
  });
  console.log('   ✅ Added Component/TestButton/testButtonLabel typography');

  // 7.4 Add Component Effect
  data.effectStyles.push({
    id: 'S:e2e-test-component-effect-1',
    name: 'Component/TestCard/testCardShadow',
    description: 'E2E Test: Card shadow effect',
    effects: [{
      type: 'DROP_SHADOW',
      visible: true,
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 0, y: 4 },
      radius: 12,
      spread: 0,
      blendMode: 'NORMAL'
    }]
  });
  console.log('   ✅ Added Component/TestCard/testCardShadow effect');

  return data;
}

/**
 * TEST SCENARIO 8: CROSS-COLLECTION - Density tokens
 */
function testCrossCollection(data) {
  console.log('\n🧪 TEST: CROSS-COLLECTION - Adding density variants...');

  const density = findCollection(data, COLLECTION_IDS.DENSITY);

  // Add a density token that varies by mode
  density.variables.push({
    id: 'VariableID:99904:1',
    name: 'Test/testDensityGap',
    description: 'E2E Test: Gap that changes with density',
    resolvedType: 'FLOAT',
    valuesByMode: {
      [MODE_IDS.DENSITY_DEFAULT]: 16,
      [MODE_IDS.DENSITY_DENSE]: 8,
      [MODE_IDS.DENSITY_SPACIOUS]: 24
    },
    scopes: ['GAP'],
    hiddenFromPublishing: false,
    variableCollectionId: COLLECTION_IDS.DENSITY
  });
  density.variableIds.push('VariableID:99904:1');
  console.log('   ✅ Added testDensityGap (16/8/24 for default/dense/spacious)');

  return data;
}

/**
 * Save modified source
 */
function saveSource(data) {
  console.log('\n💾 Saving modified source...');

  // Store test metadata
  data._e2eTestMetadata = {
    timestamp: new Date().toISOString(),
    testIds: TEST_IDS,
    deletedTokens: data._deletedTokens || []
  };

  fs.writeFileSync(SOURCE_PATH, JSON.stringify(data, null, 2), 'utf8');
  console.log('   ✅ Saved modified source file');
}

/**
 * Main test runner
 */
function main() {
  console.log('🚀 Token Pipeline E2E Test - Modifying Source Data\n');
  console.log('=' .repeat(60));

  let data = loadSource();

  // Run all test scenarios
  data = testCreate(data);           // 1. Create primitives
  data = testCreateSemantic(data);   // 2. Create semantic tokens
  data = testCreateComponent(data);  // 3. Create component tokens
  data = testModify(data);           // 4. Modify existing values
  data = testDelete(data);           // 5. Delete tokens
  data = testAliasChange(data);      // 6. Change alias references
  data = testCompositeTokens(data);  // 7. Add typography/effects
  data = testCrossCollection(data);  // 8. Cross-collection (density)

  saveSource(data);

  console.log('\n' + '=' .repeat(60));
  console.log('✨ Source modification complete!');
  console.log('\nNext steps:');
  console.log('  1. Run: npm run build:tokens');
  console.log('  2. Run: node scripts/tokens/validate-pipeline.js');

  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`   - New Primitives: 5 (color, space, size, font)`);
  console.log(`   - New Semantic Tokens: 2 (color, size)`);
  console.log(`   - New Component Tokens: 2 (button, card)`);
  console.log(`   - New Typography Styles: 2 (semantic + component)`);
  console.log(`   - New Effect Styles: 2 (semantic + component)`);
  console.log(`   - Modified Tokens: 3`);
  console.log(`   - Deleted Tokens: ${(data._deletedTokens || []).length}`);
  console.log(`   - Alias Changes: 1`);
  console.log(`   - Density Tokens: 1`);
}

// Execute
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

module.exports = { main, TEST_IDS, COLLECTION_IDS, MODE_IDS };
