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
    /** Author/team name for package.json and Maven POM */
    author: 'BILD Design System Team',
    /** SPDX license identifier */
    license: 'MIT',
    /** Repository URL for documentation links */
    repositoryUrl: 'https://github.com/UXWizard25/bild-design-system',
    /** Git repository URL (for package.json and Maven SCM) */
    gitUrl: 'https://github.com/UXWizard25/bild-design-system.git',
    /** Issues URL for bug reports */
    issuesUrl: 'https://github.com/UXWizard25/bild-design-system/issues',
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

    // Note: Mode IDs are auto-discovered from Figma source at build time.
    // Only collection IDs need to be configured here.

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
  // MODES — Explicit Mode ID → Key mappings
  //
  // All modes are explicitly mapped from Figma Mode IDs to pipeline keys.
  // This provides stability: renaming modes in Figma won't break the build.
  //
  // Mode IDs are stable in Figma and only change when a mode is deleted
  // and recreated. Mode names can be freely changed by designers.
  //
  // ⚠️  NAMING CONSTRAINT: All keys must NOT contain hyphens ('-').
  //     Use camelCase or single words.
  //     Reason: Keys become CSS custom property segments.
  //
  // To find Mode IDs: Look in bild-design-system-raw-data.json under
  // collections[].modes[].modeId
  // ═══════════════════════════════════════════════════════════════════════════
  modes: {
    /**
     * Brand mappings (Figma Mode ID → Pipeline Key)
     *
     * colorBrands: Brands with their own color palette (from BrandColorMapping)
     * contentBrands: Brands with their own sizing/typography (from BrandTokenMapping)
     * default: Default brand key (used for fallbacks)
     */
    brands: {
      // BrandColorMapping collection modes
      color: {
        '18212:0': 'bild',       // "BILD"
        '18212:1': 'sportbild',  // "SportBILD"
      },
      // BrandTokenMapping collection modes
      content: {
        '18038:0': 'bild',        // "BILD"
        '18094:0': 'sportbild',   // "SportBILD"
        '18094:1': 'advertorial', // "Advertorial"
      },
      default: 'bild',
    },

    /**
     * Color mode mappings (Figma Mode ID → Pipeline Key)
     * From ColorMode collection
     */
    colorModes: {
      '588:0': 'light',  // "Light"
      '592:1': 'dark',   // "Dark"
    },

    /**
     * Density mode mappings (Figma Mode ID → Pipeline Key)
     * From Density collection
     */
    densityModes: {
      '5695:2': 'default',   // "default"
      '5695:1': 'dense',     // "dense"
      '5695:3': 'spacious',  // "spacious"
    },

    /**
     * Breakpoint mappings (Figma Mode ID → Key + CSS config)
     * From BreakpointMode collection
     *
     * minWidth: CSS @media (min-width) value in px
     * deviceName: Human-readable name for docs/release notes
     */
    breakpoints: {
      '7017:0':  { key: 'xs', minWidth: 320, deviceName: 'Mobile (default)' },   // "XS - 320px"
      '16706:1': { key: 'sm', minWidth: 390, deviceName: 'Large Mobile' },       // "SM - 390px (compact)"
      '7015:1':  { key: 'md', minWidth: 600, deviceName: 'Tablet' },             // "MD - 600px"
      '7015:2':  { key: 'lg', minWidth: 1024, deviceName: 'Desktop' },           // "LG - 1024px (regular)"
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
      /** npm package description */
      description: 'BILD Design System Icons - Optimized SVG Assets',
      /** iOS Swift Package Manager configuration */
      ios: {
        packageName: 'BildDesignSystemIcons',
        productName: 'BildIcons',
        targetName: 'BildIcons',
        /** Minimum Swift tools version for Package.swift */
        swiftToolsVersion: '5.9',
        /** Minimum iOS deployment target */
        iosVersion: '15.0',
      },
      /** Android configuration for Gradle/Maven */
      android: {
        namespace: 'de.bild.design.icons',
        mavenGroupId: 'de.bild.design',
        mavenArtifactId: 'icons',
        /** Maven POM name */
        mavenName: 'BILD Design System Icons',
        /** Maven POM description */
        mavenDescription: 'Vector drawable icons for Android from the BILD Design System',
        /** Android SDK versions */
        compileSdk: 34,
        minSdk: 21,
        /** Kotlin compiler extension version for Compose */
        kotlinCompilerExtensionVersion: '1.5.8',
        /** Dependency versions */
        versions: {
          androidGradlePlugin: '8.2.0',
          kotlinGradlePlugin: '1.9.22',
          composeUi: '1.6.0',
          composeMaterial3: '1.2.0',
          composeFoundation: '1.6.0',
        },
      },
    },
    iconsReact: {
      /** npm package name for React icon components */
      npm: '@marioschmidt/design-system-icons-react',
      /** npm package description */
      description: 'BILD Design System Icons - React Components',
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

  // ═══════════════════════════════════════════════════════════════════════════
  // ICONS — Icon Pipeline Configuration
  // ═══════════════════════════════════════════════════════════════════════════
  icons: {
    /**
     * Naming configuration for generated code.
     * These values determine how icon types/classes are named in generated code.
     */
    naming: {
      /**
       * Prefix for generated types/classes.
       * Used for: BildIcon (enum), BildIcons (object), BildIconSize, BildIconButton
       * Should be PascalCase.
       */
      prefix: 'Bild',
      /**
       * Author string for iOS asset catalog Contents.json files.
       * Identifies the generator in Xcode.
       */
      author: 'bild-design-system-icons',
    },

    /**
     * Icon size configuration (shared across platforms).
     * All values are in dp (Android), pt (iOS), or px (Web).
     */
    sizing: {
      /** Default icon size used when no size is specified */
      defaultSize: 24,
      /**
       * Named size presets available across platforms.
       * Keys become enum cases (XS, SM, MD, LG, XL) in generated code.
       */
      presets: {
        xs: 16,
        sm: 20,
        md: 24,
        lg: 32,
        xl: 48,
      },
    },

    /**
     * SVG processing configuration.
     */
    svg: {
      /**
       * Regex pattern to strip from input filenames.
       * Example: "icon-add.svg" → "add.svg" (with pattern /^icon-/)
       * Set to null to disable prefix stripping.
       */
      inputPrefixStrip: /^icon-/,
    },

    /**
     * Platform-specific icon settings.
     */
    platforms: {
      react: {
        /**
         * Component name prefix for React components.
         * Example: 'Icon' → IconAdd, IconArrowLeft
         * Following Heroicons naming convention.
         */
        componentPrefix: 'Icon',
      },
      android: {
        /**
         * Android resource file prefix.
         * Example: 'ic_' → ic_add.xml, ic_arrow_left.xml
         * Following Android resource naming conventions.
         */
        resourcePrefix: 'ic_',
        /**
         * Default fill color attribute for Vector Drawables.
         * Uses Material theme attribute for dynamic theming.
         */
        fillColor: '?attr/colorOnSurface',
        /**
         * Float precision for path coordinate values.
         * Lower values = smaller files, higher values = more precision.
         */
        floatPrecision: 2,
      },
      ios: {
        /**
         * Asset catalog template rendering intent.
         * 'template' = icon can be tinted with foreground color.
         * 'original' = icon uses original colors.
         */
        renderingIntent: 'template',
      },
    },

    /**
     * Optional outputs (set to null to disable).
     */
    outputs: {
      /**
       * Path for Stencil TypeScript icon types file (relative to repo root).
       * This file exports ICON_NAMES array and IconName type.
       * Set to null to skip generation.
       */
      stencilTypesPath: 'packages/components/core/src/icons.ts',
    },
  },
};
