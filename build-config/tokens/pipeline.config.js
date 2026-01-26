/**
 * Multi-Design-System Pipeline Configuration
 *
 * This file contains ALL system-specific values for the token pipeline.
 * To adapt the pipeline for a different design system, only this file
 * needs to be modified (plus the Figma export JSON).
 *
 * Architecture invariants (NOT configurable):
 * - 4-Layer Hierarchy (Primitives → Mapping → Semantic → Components)
 * - Dual-Axis Architecture (ColorBrand + ContentBrand)
 * - Shadow DOM support (:host() selectors always generated)
 * - Effects are brand-independent (only light/dark)
 * - Density is brand-independent (shared across brands)
 * - Typography composite structure (fontFamily, fontWeight, fontSize, lineHeight, letterSpacing, textCase, textDecoration)
 * - Shadow composite structure (color, offsetX, offsetY, radius, spread)
 * - lineHeight as unitless ratio (CSS best practice)
 * - var() reference chains with conditional fallbacks
 * - @media queries for responsive breakpoints
 */

module.exports = {
  // ═══════════════════════════════════════════════════════════════════════════
  // IDENTITY — Who is this design system?
  // ═══════════════════════════════════════════════════════════════════════════
  identity: {
    /** Display name used in file headers and documentation */
    name: 'BILD Design System',
    /** Short identifier used in paths and IDs */
    shortName: 'bild',
    /** Copyright holder for generated file headers */
    copyright: 'Axel Springer Deutschland GmbH',
    /** Repository URL for documentation links */
    repositoryUrl: 'https://github.com/UXWizard25/bild-design-system',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOURCE — Where do tokens come from? (Figma binding)
  // ═══════════════════════════════════════════════════════════════════════════
  source: {
    /** Figma export filename (CodeBridge Plugin output) */
    inputFile: 'bild-design-system-raw-data.json',
    /** Directory containing the input file (relative to repo root) */
    inputDir: 'packages/tokens/src/',
    /** Directory for preprocessed Style Dictionary tokens (relative to repo root) */
    outputDir: 'packages/tokens/.tokens/',

    /**
     * Figma Variable Collection IDs
     * These are stable references tied to the specific Figma file.
     * They change only if collections are recreated in Figma.
     */
    collections: {
      FONT_PRIMITIVE: 'VariableCollectionId:470:1450',
      COLOR_PRIMITIVE: 'VariableCollectionId:539:2238',
      SIZE_PRIMITIVE: 'VariableCollectionId:4072:1817',
      SPACE_PRIMITIVE: 'VariableCollectionId:2726:12077',
      DENSITY: 'VariableCollectionId:5695:5841',
      BRAND_TOKEN_MAPPING: 'VariableCollectionId:18038:10593',
      BRAND_COLOR_MAPPING: 'VariableCollectionId:18212:14495',
      BREAKPOINT_MODE: 'VariableCollectionId:7017:25696',
      COLOR_MODE: 'VariableCollectionId:588:1979',
    },

    /**
     * Figma Variable Mode IDs
     * These map mode names to Figma's internal mode identifiers.
     * They change if modes are renamed or recreated in Figma.
     * ⚠️  Keys must NOT contain hyphens — same constraint as modes/brands sections.
     */
    modes: {
      brands: {
        bild: { modeId: '18038:0', figmaName: 'BILD' },
        sportbild: { modeId: '18094:0', figmaName: 'SportBILD' },
        advertorial: { modeId: '18094:1', figmaName: 'Advertorial' },
      },
      breakpoints: {
        xs: '7017:0',
        sm: '16706:1',
        md: '7015:1',
        lg: '7015:2',
      },
      colorModes: {
        light: '588:0',
        dark: '592:1',
      },
      densityModes: {
        default: '5695:2',
        dense: '5695:1',
        spacious: '5695:3',
      },
    },

    /**
     * Token path conventions
     * How the pipeline identifies different token types from Figma paths.
     */
    pathConventions: {
      /** Tokens starting with this prefix are treated as Component tokens (Layer 3) */
      componentPrefix: 'Component/',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BRANDS — Which brands does this design system support?
  //
  // ⚠️  NAMING CONSTRAINT: Brand names must NOT contain hyphens ('-').
  //     Use camelCase or single words (e.g., 'sportbild', 'myBrand').
  //     Reason: Brand names become CSS custom property segments
  //     (e.g., --density-{brand}-...). Hyphens make parsing ambiguous.
  // ═══════════════════════════════════════════════════════════════════════════
  brands: {
    /** All brands (superset) — no hyphens allowed in names */
    all: ['bild', 'sportbild', 'advertorial'],
    /** ColorBrand axis: brands with own colors + effects */
    colorBrands: ['bild', 'sportbild'],
    /** ContentBrand axis: brands with own sizing/typography */
    contentBrands: ['bild', 'sportbild', 'advertorial'],
    /** Default brand for fallbacks and CompositionLocal defaults */
    defaultBrand: 'bild',
    /** Display names for UI (toolbar labels, documentation) */
    displayNames: { bild: 'BILD', sportbild: 'SportBILD', advertorial: 'Advertorial' },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODES — Which modes/variants does the system support?
  //
  // ⚠️  NAMING CONSTRAINT: All mode names and breakpoint keys must NOT contain
  //     hyphens ('-'). Use camelCase or single words.
  //     Examples: 'light', 'dark', 'highContrast' (NOT 'high-contrast')
  //              'xs', 'sm', 'extraLarge' (NOT 'extra-large')
  //              'default', 'extraDense' (NOT 'extra-dense')
  //     Reason: Mode names are embedded in CSS custom property names
  //     (e.g., --density-{mode}-stack-space-resp-md). Hyphens in mode names
  //     make it impossible to distinguish mode boundaries from token segments.
  //     They also break camelCase conversion for JS/Swift/Kotlin output.
  // ═══════════════════════════════════════════════════════════════════════════
  modes: {
    /** Color modes (theme) — no hyphens allowed */
    color: ['light', 'dark'],
    /** Density modes — no hyphens allowed */
    density: ['default', 'dense', 'spacious'],
    /** Display names for density modes (UI labels, Storybook toolbar) */
    densityDisplayNames: { default: 'Default', dense: 'Dense', spacious: 'Spacious' },
    /** Display names for color modes (release notes, documentation) */
    colorDisplayNames: { light: 'Light', dark: 'Dark' },
    /**
     * Breakpoints with min-width values in px.
     * The first breakpoint (xs) is the base — no @media query generated.
     * All subsequent breakpoints generate @media (min-width: Npx) queries.
     * deviceName is used in documentation and release notes.
     * ⚠️  Keys must NOT contain hyphens (same constraint as mode names).
     */
    breakpoints: {
      xs: { minWidth: 320, deviceName: 'Mobile (default)' },
      sm: { minWidth: 390, deviceName: 'Large Mobile' },
      md: { minWidth: 600, deviceName: 'Tablet' },
      lg: { minWidth: 1024, deviceName: 'Desktop' },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PLATFORMS — Which platform outputs are generated?
  // ═══════════════════════════════════════════════════════════════════════════
  platforms: {
    css: {
      enabled: true,
      /**
       * CSS font-size output unit.
       * - 'px': Traditional pixel values (e.g., "21px")
       * - 'rem': Accessibility-friendly relative units (e.g., "1.3125rem")
       * Note: lineHeight is always unitless (ratio), independent of this.
       * Note: Native platforms are unaffected by this setting.
       */
      fontSizeUnit: 'px',
      /** Base font size for rem calculation (browser default: 16) */
      remBase: 16,
      /**
       * HTML data-attribute names for theme switching.
       * These appear in CSS selectors like [data-color-brand="bild"].
       */
      dataAttributes: {
        colorBrand: 'data-color-brand',
        contentBrand: 'data-content-brand',
        theme: 'data-theme',
        density: 'data-density',
      },
      /**
       * CSS var() fallback strategy per reference type.
       * true = include fallback value (split-loading safety)
       * false = no fallback (fail visible for config errors)
       */
      fallbackStrategy: {
        primitiveRefs: true,
        semanticRefs: false,
        componentRefs: false,
      },
    },

    scss: {
      enabled: false,
    },

    js: {
      enabled: false,
      /** Generate React ThemeProvider, useTheme, useBreakpoint? */
      react: true,
    },

    ios: {
      enabled: true,
      /** Swift Package Manager module name */
      moduleName: 'BildDesignTokens',
      /** Output directory for generated Swift files (relative to repo root) */
      outputDir: 'packages/tokens-ios/Sources/BildDesignTokens/',
      /**
       * iOS SizeClass mapping (Apple HIG: 2 classes)
       * Maps SizeClass names to breakpoint keys from modes.breakpoints
       */
      sizeClasses: {
        compact: 'sm',
        regular: 'lg',
      },
    },

    android: {
      enabled: true,
      /** Kotlin package namespace */
      packageName: 'com.bild.designsystem',
      /** Maven group:artifact ID for publishing */
      mavenCoordinates: 'de.bild.design:tokens',
      /** Output directory for generated Kotlin files (relative to repo root) */
      outputDir: 'packages/tokens-android/src/main/kotlin/com/bild/designsystem/',
      /**
       * Android WindowSizeClass mapping (Material 3: 3 classes)
       * Maps WindowSizeClass names to breakpoint keys from modes.breakpoints
       */
      sizeClasses: {
        compact: 'sm',
        medium: 'md',
        expanded: 'lg',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OUTPUT — How is the output structured?
  // ═══════════════════════════════════════════════════════════════════════════
  output: {
    /** Distribution output directory (relative to repo root) */
    distDir: 'packages/tokens/dist/',
    /**
     * Whether to include Figma description comments per platform.
     * Controls token.comment output as code comments.
     * Does NOT affect file headers, section comments, or structural comments.
     */
    showDescriptions: {
      css: false,
      scss: true,
      js: true,
      ios: true,
      android: true,
    },
    /** Include boolean/visibility tokens in output? */
    booleanTokens: false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PACKAGES — npm/Maven/SPM package identifiers
  // ═══════════════════════════════════════════════════════════════════════════
  packages: {
    tokens: {
      /** npm package name for web tokens */
      npm: '@marioschmidt/design-system-tokens',
    },
    components: {
      /** npm package name for Stencil Web Components */
      npm: '@marioschmidt/design-system-components',
    },
    react: {
      /** npm package name for React wrappers */
      npm: '@marioschmidt/design-system-react',
    },
    vue: {
      /** npm package name for Vue 3 wrappers */
      npm: '@marioschmidt/design-system-vue',
    },
    icons: {
      /** npm package name for SVG icons */
      npm: '@marioschmidt/design-system-icons',
    },
    iconsReact: {
      /** npm package name for React icon components */
      npm: '@marioschmidt/design-system-icons-react',
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STENCIL — Web Component library configuration
  // ═══════════════════════════════════════════════════════════════════════════
  stencil: {
    /** Web Component namespace (used as tag prefix: <bds-button>, loader name, etc.) */
    namespace: 'bds',
    /** Dev server port for Stencil */
    devServerPort: 3333,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPONENTS — Component library structure
  // ═══════════════════════════════════════════════════════════════════════════
  components: {
    /** Tag prefix for web components (e.g., 'ds-' → <ds-button>) */
    prefix: 'ds-',
    /** Source directory for component source files (relative to repo root) */
    srcDir: 'packages/components/core/src',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DEPLOYMENT — Hosting and URL configuration
  // ═══════════════════════════════════════════════════════════════════════════
  deployment: {
    /** Base path for Storybook on GitHub Pages (must match repo name) */
    storybookBasePath: '/bild-design-system/',
  },
};
