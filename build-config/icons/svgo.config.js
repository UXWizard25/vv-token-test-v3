/**
 * SVGO Configuration for Icon Optimization
 *
 * Optimizes SVG icons for all platforms:
 * - Removes unnecessary metadata and editor data
 * - Sets currentColor for theming support
 * - Optimizes paths and precision
 * - Removes hardcoded dimensions (preserves viewBox)
 * - Prefixes IDs with icon name to avoid collisions
 */

const path = require('path');

module.exports = {
  multipass: true,

  plugins: [
    // Remove XML declaration, doctype, comments
    'removeXMLProcInst',
    'removeDoctype',
    'removeComments',

    // Remove metadata and editor data
    'removeMetadata',
    'removeTitle',
    'removeDesc',
    'removeEditorsNSData',

    // Clean up structure
    'removeEmptyAttrs',
    'removeEmptyContainers',
    'removeEmptyText',
    'removeUnusedNS',

    // Optimize groups and defs
    'collapseGroups',
    'removeUselessDefs',

    // Remove hidden elements
    'removeHiddenElems',

    // Prefix IDs with icon name to prevent collisions when multiple icons are in DOM
    // e.g., id="a" in podcast-spotify.svg becomes id="podcast-spotify-a"
    {
      name: 'prefixIds',
      params: {
        delim: '-',
        prefix: (node, info) => {
          // Extract icon name from file path (without extension)
          const basename = path.basename(info.path || '', '.svg');
          // Remove 'icon-' prefix if present
          return basename.replace(/^icon-/, '');
        },
        prefixIds: true,
        prefixClassNames: true,
      },
    },

    // Optimize IDs - but preserve the prefixed IDs (don't minify them)
    {
      name: 'cleanupIds',
      params: {
        remove: false,        // Don't remove IDs
        minify: false,        // Don't minify IDs (keeps the prefixed names)
      },
    },

    // Merge and optimize paths
    'mergePaths',
    'convertPathData',

    // Sort and clean attributes
    'sortAttrs',

    // Remove hardcoded dimensions (keep viewBox)
    {
      name: 'removeDimensions',
    },

    // Set precision for path data
    {
      name: 'convertPathData',
      params: {
        floatPrecision: 2,
        transformPrecision: 2,
      },
    },

    // Convert colors to currentColor for theming
    {
      name: 'convertColors',
      params: {
        currentColor: true,
      },
    },

    // Remove fill/stroke if they equal currentColor or none
    {
      name: 'removeAttrs',
      params: {
        attrs: [
          'fill:none',
          'stroke:none',
          'data-*',
          'class',
          'style',
        ],
      },
    },

    // Add fill="currentColor" to root svg if not present
    {
      name: 'addAttributesToSVGElement',
      params: {
        attributes: [
          { fill: 'currentColor' },
        ],
      },
    },

    // Keep viewBox (don't remove it)
    {
      name: 'removeViewBox',
      active: false,
    },

    // Final cleanup
    'cleanupAttrs',
    'cleanupEnableBackground',
    'cleanupListOfValues',
    'cleanupNumericValues',
    'convertStyleToAttrs',
    'removeNonInheritableGroupAttrs',
    'removeUselessStrokeAndFill',
    'removeUnknownsAndDefaults',
    'sortDefsChildren',
  ],
};
