# Component Token Extraction - Analysis & Implementation Plan

## 📊 Current State Analysis

### Component Tokens Location

Component tokens are currently distributed across **5 Collections**:

1. **ColorMode** (`VariableCollectionId:588:1979`)
   - Contains: Color-related component tokens
   - Modes: `light` (588:0), `dark` (592:1)
   - Examples: `Component/Button/Primary/buttonPrimaryBrandBgColorIdle`

2. **Density** (`VariableCollectionId:5695:5841`)
   - Contains: Spacing/sizing component tokens
   - Modes: `compact`, `default`, `spacious`
   - Examples: `Component/Button/buttonInlineSpace`

3. **BreakpointMode** (`VariableCollectionId:7017:25696`)
   - Contains: Responsive component tokens
   - Modes: `xs` (7017:0), `sm` (16706:1), `md` (7015:1), `lg` (7015:2)
   - Examples: `Component/Article/aricleMobile1ColGridImageMarginSpace`

4. **BrandTokenMapping** (`VariableCollectionId:18038:10593`)
   - Contains: Brand-specific component overrides
   - Modes: `BILD` (18038:0), `SportBILD` (18094:0), `Advertorial` (18094:1)

5. **BrandColorMapping** (`VariableCollectionId:18212:14495`)
   - Contains: Brand-specific color component overrides
   - Modes: Same as BrandTokenMapping

### Identified Components (39 total)

```
Accordion, Article, AudioPlayer, Avatar, Badge, Breadcrumb, BreakingNews,
Button, Cards, Carousel, Chips, Datepicker, Drawers, Dropdown, Footer, Icon,
InfoElement, Inputfield, Liveticker, Mediaplayer, Menu, Newsticker, Pagination,
Paywall, Quotes, RadioButtons, Search, SectionTitle, Separators, Skeletons,
Sliders, SpecialNavi, Spinners, Table, Tabs, Teaser, ToggleSwitch, Video,
_DSysDocs
```

### Token Path Pattern

All component tokens follow this pattern:
```
Component/{ComponentName}/{SubPath}/{tokenName}
```

Examples:
- `Component/Button/Primary/buttonPrimaryBrandBgColorIdle`
- `Component/Inputfield/inputFieldInlineSpace`
- `Component/Cards/cardBorderRadiusSize`

---

## 🎯 Target Structure

### Desired Output

```
tokens/
└── brands/
    ├── bild/
    │   └── components/
    │       ├── Button/
    │       │   ├── button-color-light.json
    │       │   ├── button-color-dark.json
    │       │   ├── button-density-compact.json
    │       │   ├── button-density-default.json
    │       │   ├── button-density-spacious.json
    │       │   ├── button-breakpoint-xs.json
    │       │   ├── button-breakpoint-sm.json
    │       │   ├── button-breakpoint-md.json
    │       │   └── button-breakpoint-lg.json
    │       ├── Inputfield/
    │       │   └── ... (same structure)
    │       └── Cards/
    │           └── ... (same structure)
    ├── sportbild/
    │   └── components/
    │       └── ... (same structure)
    └── advertorial/
        └── components/
            └── ... (same structure)
```

---

## 🔧 Implementation Strategy

### Step 1: Extract Component Name from Token Path

```javascript
function getComponentName(tokenPath) {
  // Input: "Component/Button/Primary/buttonPrimaryBrandBgColorIdle"
  // Output: "Button"

  const parts = tokenPath.split('/');
  if (parts[0] === 'Component' && parts.length >= 2) {
    return parts[1];
  }
  return null;
}
```

### Step 2: Identify Collection Type

```javascript
function getCollectionType(collectionId) {
  switch (collectionId) {
    case COLLECTION_IDS.COLOR_MODE:
      return 'color';  // → button-color-{mode}.json
    case COLLECTION_IDS.DENSITY:
      return 'density';  // → button-density-{mode}.json
    case COLLECTION_IDS.BREAKPOINT_MODE:
      return 'breakpoint';  // → button-breakpoint-{mode}.json
    case COLLECTION_IDS.BRAND_TOKEN_MAPPING:
    case COLLECTION_IDS.BRAND_COLOR_MAPPING:
      return 'brand-override';  // Include in relevant files
    default:
      return null;
  }
}
```

### Step 3: Group Tokens by Component & Collection Type

```javascript
function groupComponentTokens(pluginData) {
  const components = new Map();
  // Structure: Map<ComponentName, Map<CollectionType, Array<Tokens>>>

  pluginData.collections.forEach(collection => {
    const collectionType = getCollectionType(collection.id);
    if (!collectionType) return;  // Skip non-component collections

    collection.variables.forEach(variable => {
      const componentName = getComponentName(variable.name);
      if (!componentName) return;  // Skip non-component tokens

      if (!components.has(componentName)) {
        components.set(componentName, new Map());
      }

      const componentData = components.get(componentName);
      if (!componentData.has(collectionType)) {
        componentData.set(collectionType, []);
      }

      componentData.get(collectionType).push({
        variable,
        collection
      });
    });
  });

  return components;
}
```

### Step 4: Generate Files per Component × Collection × Mode

```javascript
function generateComponentFiles(components, brand, brandModeId) {
  const outputBase = `tokens/brands/${brand.toLowerCase()}/components`;

  components.forEach((collectionData, componentName) => {
    const componentDir = path.join(outputBase, componentName);
    fs.mkdirSync(componentDir, { recursive: true });

    // Color modes (light, dark)
    if (collectionData.has('color')) {
      COLOR_MODES.forEach((modeId, modeName) => {
        const tokens = extractTokensForMode(
          collectionData.get('color'),
          modeId,
          brandModeId
        );

        writeTokenFile(
          path.join(componentDir, `${componentName.toLowerCase()}-color-${modeName}.json`),
          tokens
        );
      });
    }

    // Density modes (compact, default, spacious)
    if (collectionData.has('density')) {
      DENSITY_MODES.forEach((modeId, modeName) => {
        const tokens = extractTokensForMode(
          collectionData.get('density'),
          modeId,
          brandModeId
        );

        writeTokenFile(
          path.join(componentDir, `${componentName.toLowerCase()}-density-${modeName}.json`),
          tokens
        );
      });
    }

    // Breakpoint modes (xs, sm, md, lg)
    if (collectionData.has('breakpoint')) {
      BREAKPOINTS.forEach((modeId, modeName) => {
        const tokens = extractTokensForMode(
          collectionData.get('breakpoint'),
          modeId,
          brandModeId
        );

        writeTokenFile(
          path.join(componentDir, `${componentName.toLowerCase()}-breakpoint-${modeName}.json`),
          tokens
        );
      });
    }
  });
}
```

---

## 📋 Integration with Existing Preprocessing

### Modified Preprocessing Flow

**Current Flow:**
```
1. Load plugin JSON
2. Create alias lookup
3. Process primitives (shared/)
4. Process brand-specific (brands/{brand}/density, color, breakpoints)
5. Process semantic (brands/{brand}/semantic)
```

**New Flow:**
```
1. Load plugin JSON
2. Create alias lookup
3. Process primitives (shared/) ← unchanged
4. Process brand-specific NON-COMPONENT tokens ← modified
5. Process semantic NON-COMPONENT tokens ← modified
6. *** NEW: Process component tokens by brand *** ← NEW STEP
   - Group by component name
   - Split by collection type (color/density/breakpoint)
   - Generate component-specific files
```

### Filter Function for Non-Component Tokens

```javascript
function isComponentToken(tokenPath) {
  return tokenPath.startsWith('Component/');
}

// Use in existing processing
function processBreakpointTokens(collection, brand, brandModeId) {
  const tokens = collection.variables.filter(v =>
    !isComponentToken(v.name)  // ← NEW: Exclude component tokens
  );

  // ... existing processing logic
}
```

---

## 🎨 Build Script Changes

### New Build Function

```javascript
// Add to scripts/build-tokens-v2.js

async function buildComponentTokens() {
  console.log('\n🧩 Building Component Tokens:\n');

  let totalBuilds = 0;
  let successfulBuilds = 0;

  const components = fs.readdirSync(path.join(TOKENS_DIR, 'brands/bild/components'));

  for (const brand of BRANDS) {
    console.log(`  🏷️  ${brand}:`);

    const componentsDir = path.join(TOKENS_DIR, 'brands', brand, 'components');
    if (!fs.existsSync(componentsDir)) continue;

    const componentNames = fs.readdirSync(componentsDir);

    for (const componentName of componentNames) {
      const componentDir = path.join(componentsDir, componentName);
      if (!fs.statSync(componentDir).isDirectory()) continue;

      const files = fs.readdirSync(componentDir).filter(f => f.endsWith('.json'));

      for (const file of files) {
        const fileName = path.basename(file, '.json');
        const config = {
          source: [path.join(componentDir, file)],
          platforms: createStandardPlatformConfig(
            `${DIST_DIR}/css/brands/${brand}/components/${componentName}`,
            fileName
          )
        };

        try {
          totalBuilds++;
          await new StyleDictionary(config).buildAllPlatforms();
          successfulBuilds++;
        } catch (error) {
          console.error(`     ❌ ${componentName}/${fileName}: ${error.message}`);
        }
      }

      console.log(`     ✅ ${componentName} (${files.length} files)`);
    }
  }

  return { totalBuilds, successfulBuilds };
}
```

### Updated Main Function

```javascript
async function main() {
  // ... existing setup ...

  // Build shared primitives
  stats.sharedPrimitives = await buildSharedPrimitives();

  // Build brand-specific tokens (NON-COMPONENT)
  stats.brandSpecific = await buildBrandSpecificTokens();

  // Build typography tokens
  stats.typographyTokens = await buildTypographyTokens();

  // Build effect tokens
  stats.effectTokens = await buildEffectTokens();

  // *** NEW: Build component tokens ***
  stats.componentTokens = await buildComponentTokens();

  // Create manifest
  createManifest(stats);

  // ... existing summary ...
}
```

---

## 📦 Output Structure Example

### Dist Folder

```
dist/
├── css/
│   ├── shared/
│   │   ├── colorprimitive.css
│   │   └── ...
│   └── brands/
│       ├── bild/
│       │   ├── density/
│       │   │   └── ... (non-component tokens)
│       │   ├── semantic/
│       │   │   └── ... (non-component tokens)
│       │   └── components/          ← NEW
│       │       ├── Button/
│       │       │   ├── button-color-light.css
│       │       │   ├── button-color-dark.css
│       │       │   ├── button-density-compact.css
│       │       │   ├── button-breakpoint-xs.css
│       │       │   └── ...
│       │       ├── Inputfield/
│       │       └── Cards/
│       ├── sportbild/
│       └── advertorial/
├── scss/
│   └── ... (same structure)
├── js/
│   └── ... (same structure)
└── json/
    └── ... (same structure)
```

---

## ✅ Benefits

1. **Clear Component Separation**
   - Each component has its own folder
   - Easy to find all tokens for a specific component

2. **Granular Imports**
   ```javascript
   // Import only Button color tokens (light mode)
   import '@brand/tokens/css/brands/bild/components/Button/button-color-light.css';

   // Import only Button breakpoint tokens (mobile)
   import '@brand/tokens/css/brands/bild/components/Button/button-breakpoint-xs.css';
   ```

3. **Better Maintenance**
   - Component updates isolated to component folder
   - No mixing of component and semantic tokens

4. **Backward Compatible**
   - Existing shared/ and semantic/ structure unchanged
   - Only adds new components/ folder
   - Can be rolled out gradually

---

## 🚀 Next Steps

1. **Modify `scripts/preprocess-plugin-tokens.js`**
   - Add component detection functions
   - Add component grouping logic
   - Add component file generation

2. **Modify `scripts/build-tokens-v2.js`**
   - Add `buildComponentTokens()` function
   - Update main() to include component build
   - Update manifest to track component builds

3. **Test with small subset**
   - Start with Button component only
   - Verify all modes (color, density, breakpoint)
   - Verify all brands (BILD, SportBILD, Advertorial)

4. **Roll out to all components**
   - Apply to all 39 components
   - Update build statistics
   - Update README documentation

---

## ⚠️ Important Considerations

### Brand Overrides

Component tokens in **BrandTokenMapping** and **BrandColorMapping** need special handling:
- These provide brand-specific overrides
- Must be merged into the appropriate component files
- Priority: BrandMapping > Base value

### Alias Resolution

Components may reference:
- Primitives: `{color.red.500}`
- Semantic tokens: `{semantic.brand.primary}`
- Other component tokens: `{Component.Button.buttonPrimaryBgColor}`

Resolution must happen **after** all token types are processed.

### File Size

Some components may have many tokens (e.g., Button):
- ~20-30 color tokens
- ~10-15 density tokens
- ~5-10 breakpoint tokens

This is acceptable - granular imports provide better tree-shaking.

---

**Status:** Ready for implementation
**Branch:** `feature/component-extraction`
**Next:** Modify preprocessing script
