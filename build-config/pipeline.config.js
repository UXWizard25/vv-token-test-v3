/**
 * Multi-Design-System Pipeline Configuration
 *
 * SINGLE SOURCE OF TRUTH for all pipeline settings.
 * To adapt for a different design system, modify rawConfig below + Figma export JSON.
 *
 * 📖 Full documentation: ./PIPELINE-CONFIG.md
 *
 * File structure:
 * ───────────────────────────────────────────────────────────────────────────
 *   ✅ rawConfig        → EDIT THIS: All user-configurable values
 *   ❌ derived          → DO NOT EDIT: Auto-computed from rawConfig
 *   ❌ Runtime funcs    → DO NOT EDIT: Figma validation functions
 * ───────────────────────────────────────────────────────────────────────────
 */

// =============================================================================
// ✅ RAW CONFIG - EDIT THIS SECTION
// =============================================================================
// All user-configurable values are defined here.
// Changes here automatically propagate to derived values and all build scripts.
//
// Sections:
// - identity     → System name, copyright, URLs
// - brands       → Brand definitions with dual-axis support
// - modes        → Color modes, density, breakpoints
// - figma        → Figma collection IDs and file settings
// - css          → CSS-specific output options
// - platforms    → Enable/disable iOS, Android; native mappings
// - paths        → Directory paths for input/output
// - packages     → npm/Maven package names
// - stencil      → Web Components configuration
// - deployment   → Hosting settings
// =============================================================================

const rawConfig = {
  // ===========================================================================
  // IDENTITY
  // Used in generated file headers, documentation, and package metadata.
  // ===========================================================================
  identity: {
    /** Full display name shown in generated file headers and documentation */
    name: 'BILD Design System',

    /** Short identifier used in paths, CSS class prefixes, and IDs */
    shortName: 'bild',

    /** Copyright holder for license headers in generated files */
    copyright: 'Axel Springer Deutschland GmbH',

    /** Repository URL for documentation links and package.json repository field */
    repositoryUrl: 'https://github.com/UXWizard25/bild-design-system',
  },

  // ===========================================================================
  // BRANDS - Dual-Axis Architecture
  //
  // The design system uses TWO INDEPENDENT AXES for brand selection:
  //
  //   ColorBrand axis (data-color-brand)
  //   └── Controls: colors, effects, shadows
  //   └── Figma: BrandColorMapping collection
  //   └── Options: bild, sportbild
  //
  //   ContentBrand axis (data-content-brand)
  //   └── Controls: sizing, typography, spacing
  //   └── Figma: BrandTokenMapping collection
  //   └── Options: bild, sportbild, advertorial
  //
  // This enables combinations like:
  //   data-color-brand="bild" + data-content-brand="advertorial"
  //   → Advertorial content styled with BILD colors
  //
  // Each brand key becomes an identifier used in:
  // - File paths: brands/{key}/...
  // - CSS selectors: [data-color-brand="{key}"], [data-content-brand="{key}"]
  // - Native enums: ColorBrand.{Key}, ContentBrand.{Key}
  // - JS exports: brands.{key}
  //
  // ⚠️  NAMING CONSTRAINT: Keys must NOT contain hyphens ('-').
  //     Use camelCase or single words (e.g., 'sportbild', 'myBrand').
  //     Reason: Keys become CSS custom property segments where hyphens
  //     are used as delimiters, making parsing ambiguous.
  // ===========================================================================
  brands: {
    /**
     * BILD - Main brand (supports both axes)
     *
     * @property {string} figmaName - Exact mode name in Figma (case-sensitive).
     *           Used to match modes across BrandTokenMapping and BrandColorMapping
     *           collections. Must match exactly what appears in Figma.
     * @property {boolean} isDefault - This brand is used for:
     *           - Native CompositionLocal/Environment defaults
     *           - JS createTheme() fallback brand
     *           - Default selection in Storybook toolbar
     * @property {string[]} axes - Which axes this brand supports:
     *           - 'color': Has entry in BrandColorMapping (own colors/effects)
     *           - 'content': Has entry in BrandTokenMapping (own sizing/typography)
     *           Note: These are validated against Figma data at build time.
     */
    bild: {
      figmaName: 'BILD',
      isDefault: true,
      axes: ['color', 'content'],
    },

    /**
     * SportBILD - Sports brand variant (supports both axes)
     */
    sportbild: {
      figmaName: 'SportBILD',
      axes: ['color', 'content'],
    },

    /**
     * Advertorial - Advertising content brand (content axis only)
     *
     * This brand has NO entry in BrandColorMapping - it inherits colors
     * from the ColorBrand axis (either BILD or SportBILD colors).
     * It has its OWN sizing/typography in BrandTokenMapping.
     *
     * Usage example:
     *   data-color-brand="bild" data-content-brand="advertorial"
     *   → Advertorial sizing with BILD red colors
     */
    advertorial: {
      figmaName: 'Advertorial',
      axes: ['content'],
    },
  },

  // ===========================================================================
  // MODES
  // Defines all theming axes: color themes, density variants, and breakpoints.
  //
  // ⚠️  NAMING CONSTRAINT: All mode keys must NOT contain hyphens ('-').
  //     Use camelCase or single words.
  //     Reason: Mode names are embedded in CSS custom property names
  //     (e.g., --density-{mode}-stack-space-resp-md). Hyphens make it
  //     impossible to distinguish mode boundaries from token segments.
  // ===========================================================================
  modes: {
    /**
     * Color/theme modes (light/dark theming)
     * Controls semantic color tokens and effects.
     *
     * @property {string} figmaId - Mode ID from ColorMode collection in Figma.
     *           Found in Figma: Variables → ColorMode collection → mode settings.
     * @property {boolean} [isDefault] - Initial theme for:
     *           - JS createTheme() default colorMode parameter
     *           - SSR/initial page render
     *           - Storybook initial state
     */
    color: {
      light: { figmaId: '588:0', isDefault: true },
      dark: { figmaId: '592:1' },
    },

    /**
     * Density modes for spacing variants
     * Controls stack-space, inline-space, and component-specific spacing.
     *
     * @property {string} figmaId - Mode ID from Density collection in Figma.
     * @property {boolean} [isDefault] - Initial density for:
     *           - JS createTheme() default density parameter
     *           - Native CompositionLocal defaults
     */
    density: {
      default: { figmaId: '5695:2', isDefault: true },
      dense: { figmaId: '5695:1' },
      spacious: { figmaId: '5695:3' },
    },

    /**
     * Responsive breakpoints for @media queries
     * Order in this object determines the cascade order in CSS.
     * The breakpoint with isBase=true is the mobile-first base (no @media query).
     *
     * @property {string} figmaId - Mode ID from BreakpointMode collection in Figma.
     * @property {number} minWidth - CSS min-width value in pixels for @media query.
     *           Example: minWidth: 600 → @media (min-width: 600px) { }
     * @property {boolean} [isBase] - If true, this breakpoint is the mobile-first base:
     *           - No @media query generated (styles apply by default)
     *           - Used as reference for responsive token comparisons
     *           - Typically the smallest breakpoint (mobile)
     */
    breakpoints: {
      xs: { figmaId: '7017:0', minWidth: 320, isBase: true },
      sm: { figmaId: '16706:1', minWidth: 390 },
      md: { figmaId: '7015:1', minWidth: 600 },
      lg: { figmaId: '7015:2', minWidth: 1024 },
    },
  },

  // ===========================================================================
  // FIGMA
  // Figma-specific identifiers. These are stable references tied to the
  // specific Figma file structure. They change only if collections are
  // renamed or recreated in Figma.
  // ===========================================================================
  figma: {
    /**
     * Figma export filename (CodeBridge Plugin output)
     * This file is placed in paths.tokensInput directory.
     */
    inputFile: 'bild-design-system-raw-data.json',

    /**
     * Figma Variable Collection IDs
     * Found in Figma: Variables panel → Collection settings → ID
     * These IDs are stable unless collections are deleted and recreated.
     */
    collections: {
      /** Font families, weights - Layer 0 primitive */
      FONT_PRIMITIVE: 'VariableCollectionId:470:1450',
      /** Color palette (hex values) - Layer 0 primitive */
      COLOR_PRIMITIVE: 'VariableCollectionId:539:2238',
      /** Size scale (px values) - Layer 0 primitive */
      SIZE_PRIMITIVE: 'VariableCollectionId:4072:1817',
      /** Spacing scale (px values) - Layer 0 primitive */
      SPACE_PRIMITIVE: 'VariableCollectionId:2726:12077',
      /** Density variants - Layer 1 mapping (brand-independent) */
      DENSITY: 'VariableCollectionId:5695:5841',
      /** Brand token mapping (sizing, typography) - Layer 1 mapping */
      BRAND_TOKEN_MAPPING: 'VariableCollectionId:18038:10593',
      /** Brand color mapping - Layer 1 mapping (determines colorBrands) */
      BRAND_COLOR_MAPPING: 'VariableCollectionId:18212:14495',
      /** Responsive breakpoints - Layer 2 semantic */
      BREAKPOINT_MODE: 'VariableCollectionId:7017:25696',
      /** Light/dark themes - Layer 2 semantic */
      COLOR_MODE: 'VariableCollectionId:588:1979',
    },

    /**
     * Token path prefix that identifies Component tokens (Layer 3)
     * Tokens with paths starting with this prefix are treated as component tokens.
     * Example: "Component/Button/primary-bg" → component token for Button
     */
    componentPrefix: 'Component/',
  },

  // ===========================================================================
  // CSS
  // CSS-specific output configuration.
  // ===========================================================================
  css: {
    /**
     * CSS font-size output unit
     * - 'px': Traditional pixel values (e.g., "21px") - predictable, design-accurate
     * - 'rem': Accessibility-friendly relative units (e.g., "1.3125rem") - scales with user preference
     *
     * Note: lineHeight is ALWAYS unitless (ratio) regardless of this setting.
     * Note: Native platforms (iOS/Android) are unaffected - they always use pt/dp.
     */
    fontSizeUnit: 'px',

    /**
     * Base font size for rem calculations (browser default: 16px)
     * Only used when fontSizeUnit is 'rem'.
     * Example: 21px with remBase 16 → 1.3125rem
     */
    remBase: 16,

    /**
     * HTML data-attribute names for CSS selector targeting
     * These appear in generated CSS selectors like [data-color-brand="bild"].
     * Also used in Storybook toolbar controls and native platform bindings.
     */
    dataAttributes: {
      /** Attribute for color/effects brand selection */
      colorBrand: 'data-color-brand',
      /** Attribute for content/sizing/typography brand selection */
      contentBrand: 'data-content-brand',
      /** Attribute for light/dark theme selection */
      theme: 'data-theme',
      /** Attribute for density mode selection */
      density: 'data-density',
    },
  },

  // ===========================================================================
  // PLATFORMS
  // Enable/disable platform outputs and platform-specific settings.
  // ===========================================================================
  platforms: {
    /**
     * CSS/Web output
     * Generates: primitives.css, theme files, component files, bundles
     */
    css: {
      enabled: true,
    },

    /**
     * iOS/Swift output (Swift Package Manager)
     * Generates: Swift structs, protocols, theme provider
     */
    ios: {
      enabled: true,

      /** Swift Package Manager module name (import BildDesignTokens) */
      moduleName: 'BildDesignTokens',

      /**
       * iOS SizeClass to breakpoint mapping (Apple HIG: 2 size classes)
       * Maps UIUserInterfaceSizeClass values to breakpoint keys.
       * Used in DesignSystemTheme for responsive token resolution.
       */
      sizeClasses: {
        /** UIUserInterfaceSizeClass.compact → uses 'sm' breakpoint tokens */
        compact: 'sm',
        /** UIUserInterfaceSizeClass.regular → uses 'lg' breakpoint tokens */
        regular: 'lg',
      },
    },

    /**
     * Android/Kotlin output (Maven/Gradle)
     * Generates: Kotlin objects, interfaces, Compose theme provider
     */
    android: {
      enabled: true,

      /** Kotlin package namespace (package com.bild.designsystem) */
      packageName: 'com.bild.designsystem',

      /**
       * Android WindowSizeClass to breakpoint mapping (Material 3: 3 size classes)
       * Maps WindowSizeClass values to breakpoint keys.
       * Used in DesignSystemTheme for responsive token resolution.
       */
      sizeClasses: {
        /** WindowWidthSizeClass.Compact (<600dp) → uses 'sm' breakpoint tokens */
        compact: 'sm',
        /** WindowWidthSizeClass.Medium (600-839dp) → uses 'md' breakpoint tokens */
        medium: 'md',
        /** WindowWidthSizeClass.Expanded (≥840dp) → uses 'lg' breakpoint tokens */
        expanded: 'lg',
      },
    },
  },

  // ===========================================================================
  // PATHS
  // Directory paths relative to repository root.
  // Centrally defined for consistency across all scripts.
  // ===========================================================================
  paths: {
    /** Input directory containing Figma export JSON */
    tokensInput: 'packages/tokens/src/',

    /** Intermediate directory for preprocessed Style Dictionary tokens */
    tokensIntermediate: 'packages/tokens/.tokens/',

    /** Distribution directory for built token outputs (css/, json/) */
    tokensDist: 'packages/tokens/dist/',

    /** iOS Swift output directory */
    iosOutput: 'packages/tokens-ios/Sources/BildDesignTokens/',

    /** Android Kotlin output directory */
    androidOutput: 'packages/tokens-android/src/main/kotlin/com/bild/designsystem/',

    /** Stencil Web Components source directory */
    componentsSrc: 'packages/components/core/src',
  },

  // ===========================================================================
  // PACKAGES
  // Package identifiers for npm, Maven, and SPM registries.
  // ===========================================================================
  packages: {
    /** npm package: @scope/design-system-tokens */
    tokens: '@marioschmidt/design-system-tokens',

    /** npm package: @scope/design-system-components (Stencil) */
    components: '@marioschmidt/design-system-components',

    /** npm package: @scope/design-system-react (React wrappers) */
    react: '@marioschmidt/design-system-react',

    /** npm package: @scope/design-system-vue (Vue 3 wrappers) */
    vue: '@marioschmidt/design-system-vue',
  },

  // ===========================================================================
  // STENCIL
  // Stencil Web Components library configuration.
  // ===========================================================================
  stencil: {
    /**
     * Web Component namespace
     * Used as: tag prefix (<bds-button>), loader name (bds.esm.js), dist folder
     */
    namespace: 'bds',

    /**
     * Component tag prefix for source files
     * Used to identify component CSS files: ds-button.css, ds-card.css
     */
    componentPrefix: 'ds-',

    /** Dev server port for Stencil development */
    devServerPort: 3333,
  },

  // ===========================================================================
  // ICONS
  // Icon pipeline configuration for multi-platform icon generation.
  // ===========================================================================
  icons: {
    /** Master-Switch für Icon-Pipeline */
    enabled: true,

    /** Standardgröße für Icons in dp/pt (alle Plattformen) */
    defaultSize: 24,

    /** Prefix der in Quelldateien entfernt wird (icon-add.svg → add) */
    sourceFilePrefix: 'icon-',

    /** Größen-Presets für alle Plattformen (dp/pt) */
    sizePresets: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 32,
      xl: 48,
    },

    /** Plattform-spezifische Einstellungen */
    platforms: {
      svg: { enabled: true },
      react: {
        enabled: true,
        /** Prefix für Komponentennamen: add → IconAdd */
        componentPrefix: 'Icon',
      },
      android: { enabled: true },
      ios: { enabled: true },
    },
  },

  // ===========================================================================
  // DEPLOYMENT
  // Hosting and deployment configuration.
  // ===========================================================================
  deployment: {
    /**
     * Base path for Storybook on GitHub Pages
     * Must match the repository name for correct asset loading.
     * Example: '/bild-design-system/' for https://user.github.io/bild-design-system/
     */
    storybookBasePath: '/bild-design-system/',
  },

  // ===========================================================================
  // VALIDATION
  // Build-time validation settings for Config ↔ Figma synchronization.
  // ===========================================================================
  validation: {
    /**
     * Strict mode - abort build on critical Config ↔ Figma mismatches.
     *
     * When enabled, the build will FAIL (exit code 1) if:
     * - Brand in config.axes not found in Figma collection
     * - Collection ID in config not found in Figma export
     * - Mode ID in config not found in Figma collection
     *
     * When disabled, these are logged as warnings but build continues.
     *
     * Recommended:
     * - Local development: false (allows incremental work)
     * - CI/CD pipeline: true (prevents broken deployments)
     *
     * Auto-detection: Defaults to true when CI environment variable is set.
     */
    strict: process.env.CI === 'true',

    /**
     * Warn about Figma modes not defined in config.
     *
     * When true, logs a warning if Figma contains brand modes that
     * are not configured in the brands section. This catches cases
     * where designers add new brands but developers haven't updated
     * the config yet.
     *
     * This is always a warning, never an error (even in strict mode),
     * because extra Figma modes don't break the build - they're just
     * ignored.
     */
    warnUnknownFigmaModes: true,
  },
};

// =============================================================================
// ❌ DERIVED VALUES - DO NOT EDIT
// =============================================================================
// These values are AUTO-COMPUTED from rawConfig above.
// Any manual changes will be overwritten or cause inconsistencies.
// To change these values, modify the corresponding rawConfig property instead.
// =============================================================================

const allBrands = Object.keys(rawConfig.brands);
const colorModes = Object.keys(rawConfig.modes.color);
const densityModes = Object.keys(rawConfig.modes.density);
const breakpoints = Object.keys(rawConfig.modes.breakpoints);

const derived = {
  // ---------------------------------------------------------------------------
  // Brand-derived values
  // ---------------------------------------------------------------------------

  /** All brand keys: ['bild', 'sportbild', 'advertorial'] */
  allBrands,

  /** Default brand key (has isDefault: true) */
  defaultBrand: allBrands.find(b => rawConfig.brands[b].isDefault) || allBrands[0],

  /**
   * ColorBrands - Brands that support the COLOR axis (own colors/effects)
   * Derived from brands with axes: ['color', ...] in config.
   * These brands have entries in BrandColorMapping in Figma.
   * @example ['bild', 'sportbild']
   */
  colorBrands: allBrands.filter(b => rawConfig.brands[b].axes?.includes('color')),

  /**
   * ContentBrands - Brands that support the CONTENT axis (own sizing/typography)
   * Derived from brands with axes: ['content', ...] in config.
   * These brands have entries in BrandTokenMapping in Figma.
   * @example ['bild', 'sportbild', 'advertorial']
   */
  contentBrands: allBrands.filter(b => rawConfig.brands[b].axes?.includes('content')),

  /** Brand key → Figma display name mapping */
  brandToFigmaName: Object.fromEntries(
    allBrands.map(key => [key, rawConfig.brands[key].figmaName])
  ),

  /** Figma display name → brand key (reverse lookup) */
  figmaNameToBrand: Object.fromEntries(
    allBrands.map(key => [rawConfig.brands[key].figmaName, key])
  ),

  /** Display names for UI (equals figmaName) */
  brandDisplayNames: Object.fromEntries(
    allBrands.map(key => [key, rawConfig.brands[key].figmaName])
  ),

  // ---------------------------------------------------------------------------
  // Color mode-derived values
  // ---------------------------------------------------------------------------

  /** All color mode keys: ['light', 'dark'] */
  colorModes,

  /** Default color mode key (has isDefault: true) */
  defaultColorMode: colorModes.find(m => rawConfig.modes.color[m].isDefault) || colorModes[0],

  /** Color mode key → Figma mode ID mapping */
  colorModeIds: Object.fromEntries(
    colorModes.map(key => [key, rawConfig.modes.color[key].figmaId])
  ),

  /** Display names for color modes */
  colorModeDisplayNames: Object.fromEntries(
    colorModes.map(key => [key, key.charAt(0).toUpperCase() + key.slice(1)])
  ),

  // ---------------------------------------------------------------------------
  // Density mode-derived values
  // ---------------------------------------------------------------------------

  /** All density mode keys: ['default', 'dense', 'spacious'] */
  densityModes,

  /** Default density mode key (has isDefault: true) */
  defaultDensity: densityModes.find(m => rawConfig.modes.density[m].isDefault) || densityModes[0],

  /** Density mode key → Figma mode ID mapping */
  densityModeIds: Object.fromEntries(
    densityModes.map(key => [key, rawConfig.modes.density[key].figmaId])
  ),

  /** Display names for density modes */
  densityDisplayNames: Object.fromEntries(
    densityModes.map(key => [key, key.charAt(0).toUpperCase() + key.slice(1)])
  ),

  // ---------------------------------------------------------------------------
  // Breakpoint-derived values
  // ---------------------------------------------------------------------------

  /** All breakpoint keys in order: ['xs', 'sm', 'md', 'lg'] */
  breakpoints,

  /** Base breakpoint key (has isBase: true, no @media query) */
  baseBreakpoint: breakpoints.find(bp => rawConfig.modes.breakpoints[bp].isBase) || breakpoints[0],

  /** Breakpoint key → Figma mode ID mapping */
  breakpointModeIds: Object.fromEntries(
    breakpoints.map(key => [key, rawConfig.modes.breakpoints[key].figmaId])
  ),

  /** Breakpoint key → minWidth in px */
  breakpointMinWidths: Object.fromEntries(
    breakpoints.map(key => [key, rawConfig.modes.breakpoints[key].minWidth])
  ),

  // ---------------------------------------------------------------------------
  // Icon-derived values (dynamisch aus identity.shortName)
  // ---------------------------------------------------------------------------

  /** iOS Swift Enum Name: 'bild' → 'BildIcon' */
  iosIconEnumName: rawConfig.identity.shortName.charAt(0).toUpperCase() +
                   rawConfig.identity.shortName.slice(1) + 'Icon',

  /** iOS/Android Module/Object Name: 'bild' → 'BildIcons' */
  iconObjectName: rawConfig.identity.shortName.charAt(0).toUpperCase() +
                  rawConfig.identity.shortName.slice(1) + 'Icons',

  /** Android Kotlin Package: 'bild' → 'de.bild.design.icons' */
  androidIconPackage: `de.${rawConfig.identity.shortName}.design.icons`,

  /** Asset Author String: 'bild' → 'bild-design-system-icons' */
  iconAssetAuthor: `${rawConfig.identity.shortName}-design-system-icons`,
};

// =============================================================================
// ❌ RUNTIME FUNCTIONS - DO NOT EDIT
// =============================================================================
// These functions are used by the pipeline to validate Figma data against config.
// They should not be modified unless you understand the full pipeline architecture.
//
// How validation works:
// ─────────────────────────────────────────────────────────────────────────────
// 1. STATIC source (from config): derived.colorBrands, derived.contentBrands
//    - Derived from brands[].axes property in rawConfig (edit rawConfig instead)
//    - Available immediately without Figma data
//    - Used by: build.js, bundles.js, storybook
//
// 2. RUNTIME source (from Figma): deriveColorBrands(), deriveContentBrands()
//    - Validates against actual BrandColorMapping/BrandTokenMapping collections
//    - Used by: preprocess.js (has access to Figma JSON)
//    - Writes to: metadata.json for downstream validation
//
// If config doesn't match Figma, build.js will warn:
//    "⚠️  Config colorBrands [...] differs from Figma [...]"
// =============================================================================

/**
 * Derives colorBrands from Figma collections (RUNTIME VALIDATION).
 * Validates which brands actually have entries in BrandColorMapping.
 *
 * Use case: preprocess.js validates that config.axes matches Figma structure.
 *
 * @param {Array} collections - Figma collections array from plugin export
 * @returns {string[]} Brand keys that exist in BrandColorMapping
 *
 * @example
 * const colorBrands = deriveColorBrands(pluginData.collections);
 * // Returns: ['bild', 'sportbild'] (advertorial not included - no own colors)
 */
function deriveColorBrands(collections) {
  const collection = collections.find(c => c.id === rawConfig.figma.collections.BRAND_COLOR_MAPPING);
  if (!collection) return [];
  return allBrands.filter(brandKey =>
    collection.modes.some(m => m.name === rawConfig.brands[brandKey].figmaName)
  );
}

/**
 * Derives contentBrands from Figma collections (RUNTIME VALIDATION).
 * Validates which brands actually have entries in BrandTokenMapping.
 *
 * Use case: preprocess.js validates that config.axes matches Figma structure.
 *
 * @param {Array} collections - Figma collections array from plugin export
 * @returns {string[]} Brand keys that exist in BrandTokenMapping
 *
 * @example
 * const contentBrands = deriveContentBrands(pluginData.collections);
 * // Returns: ['bild', 'sportbild', 'advertorial']
 */
function deriveContentBrands(collections) {
  const collection = collections.find(c => c.id === rawConfig.figma.collections.BRAND_TOKEN_MAPPING);
  if (!collection) return [];
  return allBrands.filter(brandKey =>
    collection.modes.some(m => m.name === rawConfig.brands[brandKey].figmaName)
  );
}

/**
 * Checks if a brand has BrandColorMapping (i.e., is a colorBrand).
 * Used during token processing to skip color generation for inherited brands.
 *
 * @param {Array} collections - Figma collections array
 * @param {string} brandKey - Brand key to check (e.g., 'advertorial')
 * @returns {boolean} True if brand exists in BrandColorMapping
 *
 * @example
 * if (!hasBrandColorMapping(collections, 'advertorial')) {
 *   // Skip color token generation for advertorial
 * }
 */
function hasBrandColorMapping(collections, brandKey) {
  const figmaName = rawConfig.brands[brandKey]?.figmaName || brandKey;
  const collection = collections.find(c => c.id === rawConfig.figma.collections.BRAND_COLOR_MAPPING);
  return collection?.modes.some(m => m.name === figmaName) ?? false;
}

// =============================================================================
// EXPORT - Flat structure for easy destructuring
// =============================================================================

module.exports = {
  // Raw config sections (spread for flat access)
  ...rawConfig,

  // Derived values (spread for flat access)
  ...derived,

  // Runtime functions
  deriveColorBrands,
  deriveContentBrands,
  hasBrandColorMapping,
};
