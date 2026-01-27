#!/usr/bin/env node

/**
 * Android Vector Drawable Generation Script
 *
 * Converts optimized SVGs to Android Vector Drawable XML format.
 * Uses svg2vectordrawable for conversion.
 *
 * Input:  dist/icons/svg/*.svg
 * Output: dist/icons/android/drawable/*.xml
 */

const fs = require('fs');
const path = require('path');
const { PATHS: SHARED_PATHS, isIconPipelineEnabled } = require('./paths');
const pipelineConfig = require('../../build-config/pipeline.config.js');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PATHS = {
  input: SHARED_PATHS.svg,
  output: SHARED_PATHS.android,
  kotlin: SHARED_PATHS.androidKotlin,
};

const ANDROID_CONFIG = {
  // Default size in dp (from config)
  width: pipelineConfig.icons.defaultSize,
  height: pipelineConfig.icons.defaultSize,
  // Use black as default - apps should override via app:tint or Compose tint parameter
  // Note: ?attr/colorOnSurface doesn't work with AAPT2 during build time
  // HARDCODED: Required for AAPT2 compatibility
  fillColor: '#000000',
  // Float precision - HARDCODED: Optimal balance between file size and quality
  floatPrecision: 2,
};

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

const log = {
  info: (msg) => console.log(`\u2139\uFE0F  ${msg}`),
  success: (msg) => console.log(`\u2705 ${msg}`),
  warn: (msg) => console.log(`\u26A0\uFE0F  ${msg}`),
  error: (msg) => console.error(`\u274C ${msg}`),
  step: (msg) => console.log(`\n\u27A1\uFE0F  ${msg}`),
};

// ============================================================================
// NAME TRANSFORMATIONS
// ============================================================================

/**
 * Convert to Android resource naming: add -> ic_add
 */
function toAndroidName(name) {
  return `ic_${name.replace(/-/g, '_')}`;
}

/**
 * Convert to Jetpack Compose naming (PascalCase)
 * add -> Add
 * arrow-left -> ArrowLeft
 * 2-liga-logo -> _2LigaLogo (prefixed for Kotlin validity)
 *
 * Following Material Icons convention for Compose.
 */
function toComposeName(name) {
  const pascalCase = name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');

  // Kotlin identifiers cannot start with a number - prefix with underscore
  if (/^[0-9]/.test(pascalCase)) {
    return '_' + pascalCase;
  }
  return pascalCase;
}

/**
 * Get all SVG files from input directory
 */
function getSvgFiles() {
  if (!fs.existsSync(PATHS.input)) {
    log.warn(`Input directory does not exist: ${PATHS.input}`);
    log.info('Run "npm run build:icons:svg" first');
    return [];
  }

  const files = fs.readdirSync(PATHS.input)
    .filter(file => file.endsWith('.svg') && !file.startsWith('.'))
    .sort();

  return files;
}

// ============================================================================
// VECTOR DRAWABLE GENERATION
// ============================================================================

/**
 * Load svg2vectordrawable dynamically
 */
async function loadConverter() {
  const s2v = await import('svg2vectordrawable');
  return s2v.default || s2v;
}

/**
 * Parse viewBox from SVG
 */
function parseViewBox(svgContent) {
  const match = svgContent.match(/viewBox="([^"]+)"/);
  if (match) {
    const [, , width, height] = match[1].split(/\s+/).map(Number);
    return { width: width || 24, height: height || 24 };
  }
  return { width: 24, height: 24 };
}

/**
 * Convert SVG to Vector Drawable manually
 * (Fallback if svg2vectordrawable fails)
 */
function convertToVectorDrawable(svgContent, config) {
  const { width, height } = parseViewBox(svgContent);

  // Check if SVG uses stroke (outline icons) or fill
  const usesStroke = svgContent.includes('stroke=');

  // Extract path data from SVG
  const pathMatches = svgContent.matchAll(/<path[^>]*d="([^"]+)"[^>]*\/?>/g);
  const paths = [];

  for (const match of pathMatches) {
    paths.push(match[1]);
  }

  // Extract circle elements
  const circleMatches = svgContent.matchAll(/<circle[^>]*cx="([^"]+)"[^>]*cy="([^"]+)"[^>]*r="([^"]+)"[^>]*\/?>/g);
  const circles = [];

  for (const match of circleMatches) {
    circles.push({ cx: match[1], cy: match[2], r: match[3] });
  }

  // Build Vector Drawable XML
  const colorAttr = usesStroke ? 'android:strokeColor' : 'android:fillColor';
  const extraAttrs = usesStroke ? `\n        android:strokeWidth="2"` : '';

  let pathElements = paths.map(pathData => `    <path
        ${colorAttr}="${config.fillColor}"${extraAttrs}
        android:pathData="${pathData}"/>`).join('\n');

  // Add circles as paths
  if (circles.length > 0) {
    const circleElements = circles.map(c => {
      // Convert circle to arc path
      const r = parseFloat(c.r);
      const cx = parseFloat(c.cx);
      const cy = parseFloat(c.cy);
      const pathData = `M${cx - r},${cy}a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 -${r * 2},0`;
      return `    <path
        ${colorAttr}="${config.fillColor}"${extraAttrs}
        android:pathData="${pathData}"/>`;
    }).join('\n');
    pathElements = pathElements + '\n' + circleElements;
  }

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="${config.width}dp"
    android:height="${config.height}dp"
    android:viewportWidth="${width}"
    android:viewportHeight="${height}">
${pathElements}
</vector>
`;

  return xml;
}

/**
 * Generate a single Vector Drawable
 */
async function generateVectorDrawable(converter, filename) {
  const inputPath = path.join(PATHS.input, filename);
  const iconName = filename.replace(/\.svg$/, '');
  const androidName = toAndroidName(iconName);
  const outputPath = path.join(PATHS.output, `${androidName}.xml`);

  try {
    const svgContent = fs.readFileSync(inputPath, 'utf8');

    let xmlContent;

    try {
      // Try using svg2vectordrawable
      xmlContent = await converter(svgContent, {
        floatPrecision: ANDROID_CONFIG.floatPrecision,
        xmlTag: true,
      });

      // Replace fill and stroke colors with theme attribute
      xmlContent = xmlContent
        .replace(/android:fillColor="#[0-9a-fA-F]+"/g, `android:fillColor="${ANDROID_CONFIG.fillColor}"`)
        .replace(/android:fillColor="currentColor"/g, `android:fillColor="${ANDROID_CONFIG.fillColor}"`)
        .replace(/android:strokeColor="#[0-9a-fA-F]+"/g, `android:strokeColor="${ANDROID_CONFIG.fillColor}"`)
        .replace(/android:strokeColor="currentColor"/g, `android:strokeColor="${ANDROID_CONFIG.fillColor}"`);

      // Set default dimensions
      xmlContent = xmlContent
        .replace(/android:width="\d+dp"/, `android:width="${ANDROID_CONFIG.width}dp"`)
        .replace(/android:height="\d+dp"/, `android:height="${ANDROID_CONFIG.height}dp"`);

    } catch (conversionError) {
      // Fallback to manual conversion
      log.warn(`Using fallback converter for ${iconName}`);
      xmlContent = convertToVectorDrawable(svgContent, ANDROID_CONFIG);
    }

    fs.writeFileSync(outputPath, xmlContent, 'utf8');

    return {
      name: androidName,
      originalName: iconName,
      success: true,
    };
  } catch (error) {
    return {
      name: androidName,
      originalName: iconName,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate attrs.xml for custom theme attributes
 */
function generateAttrsXml() {
  const attrsContent = `<?xml version="1.0" encoding="utf-8"?>
<!-- BILD Design System Icons - Usage Guide -->
<resources>
    <!--
    Icons are black (#000000) by default. Override the color using:

    XML (ImageView):
    <ImageView
        android:src="@drawable/ic_add"
        app:tint="?attr/colorOnSurface" />

    XML (with theme color):
    <ImageView
        android:src="@drawable/ic_add"
        app:tint="?colorPrimary" />

    Jetpack Compose (recommended):
    BildIcon(
        icon = BildIcons.Add,
        contentDescription = "Add",
        tint = MaterialTheme.colorScheme.onSurface
    )

    Programmatically:
    imageView.setColorFilter(
        ContextCompat.getColor(context, R.color.icon_color),
        PorterDuff.Mode.SRC_IN
    )
    -->
</resources>
`;

  const attrsPath = path.join(PATHS.output, '..', 'values', 'attrs_icons.xml');
  const valuesDir = path.dirname(attrsPath);

  if (!fs.existsSync(valuesDir)) {
    fs.mkdirSync(valuesDir, { recursive: true });
  }

  fs.writeFileSync(attrsPath, attrsContent, 'utf8');
  return attrsPath;
}

/**
 * Generate Kotlin file for Jetpack Compose
 * Provides type-safe access to icons following Material Icons convention.
 * All names are derived from pipeline.config.js
 */
function generateKotlinExtension(icons) {
  // Get config values
  const packageName = pipelineConfig.androidIconPackage;
  const objectName = pipelineConfig.iconObjectName;
  const iconFnName = pipelineConfig.iosIconEnumName; // BildIcon (singular)
  const sizeObjectName = `${iconFnName}Size`;
  const systemName = pipelineConfig.identity.name;
  const defaultSize = pipelineConfig.icons.defaultSize;
  const sizePresets = pipelineConfig.icons.sizePresets;

  const iconProperties = icons
    .filter(i => i.success)
    .map(i => {
      const composeName = toComposeName(i.originalName);
      return `    /**
     * ${i.originalName} icon
     * @see R.drawable.${i.name}
     */
    val ${composeName}: ImageVector
        @Composable
        get() = ImageVector.vectorResource(R.drawable.${i.name})`;
    })
    .join('\n\n');

  const iconList = icons
    .filter(i => i.success)
    .map(i => `        ${toComposeName(i.originalName)}`)
    .join(',\n');

  // Size preset full names for documentation
  const sizeFullNames = {
    xs: 'Extra small',
    sm: 'Small',
    md: 'Medium',
    lg: 'Large',
    xl: 'Extra large',
  };

  // Generate size presets from config
  const sizePresetEntries = Object.entries(sizePresets)
    .map(([key, value]) => {
      const isDefault = value === defaultSize;
      const comment = isDefault ? ` - Default` : '';
      const fullName = sizeFullNames[key] || key.charAt(0).toUpperCase() + key.slice(1);
      return `    /** ${fullName} icon (${value}dp)${comment} */
    val ${key.toUpperCase()}: Dp = ${value}.dp`;
    })
    .join('\n');

  const kotlinContent = `// GENERATED CODE - DO NOT MODIFY BY HAND
// Generated at: ${new Date().toISOString()}
//
// ${systemName} Icons - Jetpack Compose Extension
// To regenerate, run: npm run build:icons:android

package ${packageName}

import androidx.compose.foundation.layout.size
import androidx.compose.material3.Icon
import androidx.compose.material3.LocalContentColor
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.vectorResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * ${systemName} Icons for Jetpack Compose
 *
 * Provides type-safe access to all design system icons following
 * the Material Icons naming convention (PascalCase).
 *
 * Usage:
 * \`\`\`kotlin
 * // Simple usage with convenience function
 * ${iconFnName}(${objectName}.Add, contentDescription = "Add item")
 *
 * // With custom size and color
 * ${iconFnName}(
 *     icon = ${objectName}.ArrowLeft,
 *     contentDescription = "Go back",
 *     size = 32.dp,
 *     tint = MaterialTheme.colorScheme.primary
 * )
 *
 * // Decorative icon (no content description)
 * ${iconFnName}(${objectName}.Decoration, contentDescription = null)
 *
 * // Direct ImageVector usage for custom composables
 * Icon(
 *     imageVector = ${objectName}.Menu,
 *     contentDescription = "Menu"
 * )
 * \`\`\`
 */
object ${objectName} {
${iconProperties}

    /**
     * List of all available icons for iteration/preview
     */
    val allIcons: List<ImageVector>
        @Composable
        get() = listOf(
${iconList}
        )
}

// ============================================================================
// CONVENIENCE COMPOSABLE
// ============================================================================

/**
 * Standard icon sizes following Material Design guidelines
 */
object ${sizeObjectName} {
${sizePresetEntries}
}

/**
 * ${systemName} Icon composable with convenience parameters.
 *
 * This is the recommended way to use icons in your Compose UI.
 * It provides consistent sizing, coloring, and accessibility handling.
 *
 * @param icon The icon to display from [${objectName}]
 * @param contentDescription Text for accessibility. Pass null for decorative icons.
 * @param modifier Modifier to be applied to the icon
 * @param size Icon size (default: ${defaultSize}.dp)
 * @param tint Icon color (default: LocalContentColor)
 *
 * Example:
 * \`\`\`kotlin
 * // Semantic icon (has meaning)
 * ${iconFnName}(${objectName}.Add, contentDescription = "Add item")
 *
 * // Decorative icon (purely visual)
 * ${iconFnName}(${objectName}.Star, contentDescription = null)
 *
 * // With custom styling
 * ${iconFnName}(
 *     icon = ${objectName}.Heart,
 *     contentDescription = "Favorite",
 *     size = ${sizeObjectName}.LG,
 *     tint = Color.Red
 * )
 * \`\`\`
 */
@Composable
fun ${iconFnName}(
    icon: ImageVector,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    size: Dp = ${sizeObjectName}.MD,
    tint: Color = LocalContentColor.current
) {
    Icon(
        imageVector = icon,
        contentDescription = contentDescription,
        modifier = modifier.size(size),
        tint = tint
    )
}

/**
 * ${systemName} Icon button convenience composable.
 *
 * Wraps an icon in a clickable IconButton with proper accessibility.
 *
 * @param icon The icon to display from [${objectName}]
 * @param contentDescription Text for accessibility (required for buttons)
 * @param onClick Action to perform when clicked
 * @param modifier Modifier to be applied to the button
 * @param size Icon size (default: ${defaultSize}.dp)
 * @param tint Icon color (default: LocalContentColor)
 * @param enabled Whether the button is enabled
 *
 * Example:
 * \`\`\`kotlin
 * ${iconFnName}Button(
 *     icon = ${objectName}.Close,
 *     contentDescription = "Close dialog",
 *     onClick = { onDismiss() }
 * )
 * \`\`\`
 */
@Composable
fun ${iconFnName}Button(
    icon: ImageVector,
    contentDescription: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    size: Dp = ${sizeObjectName}.MD,
    tint: Color = LocalContentColor.current,
    enabled: Boolean = true
) {
    androidx.compose.material3.IconButton(
        onClick = onClick,
        modifier = modifier,
        enabled = enabled
    ) {
        ${iconFnName}(
            icon = icon,
            contentDescription = contentDescription,
            size = size,
            tint = tint
        )
    }
}
`;

  // Create Kotlin directory
  if (!fs.existsSync(PATHS.kotlin)) {
    fs.mkdirSync(PATHS.kotlin, { recursive: true });
  }

  const kotlinPath = path.join(PATHS.kotlin, `${objectName}.kt`);
  fs.writeFileSync(kotlinPath, kotlinContent, 'utf8');
  return kotlinPath;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  // Master switch check
  if (!isIconPipelineEnabled()) {
    log.warn('Icon pipeline disabled in config - skipping Android generation');
    return { success: true, count: 0, skipped: true };
  }

  console.log('\n========================================');
  console.log('  Android Vector Drawable Generation');
  console.log('========================================\n');

  // Load converter
  log.step('Loading svg2vectordrawable...');
  let converter;
  try {
    converter = await loadConverter();
    log.success('Loaded svg2vectordrawable');
  } catch (error) {
    log.warn('svg2vectordrawable not available, using fallback');
    converter = null;
  }

  // Get input files
  log.step('Scanning optimized SVGs...');
  const svgFiles = getSvgFiles();

  if (svgFiles.length === 0) {
    log.warn('No optimized SVG files found');
    log.info('Run "npm run build:icons:svg" first');
    return { success: true, count: 0 };
  }

  log.success(`Found ${svgFiles.length} SVG file(s)`);

  // Create output directory
  if (!fs.existsSync(PATHS.output)) {
    fs.mkdirSync(PATHS.output, { recursive: true });
    log.success('Created output directory');
  }

  // Generate all vector drawables
  log.step('Generating Vector Drawables...');
  const results = [];

  for (const file of svgFiles) {
    const result = await generateVectorDrawable(converter, file);
    results.push(result);

    if (result.success) {
      log.info(`${result.name}.xml`);
    } else {
      log.error(`${result.name}: ${result.error}`);
    }
  }

  // Generate attrs.xml
  log.step('Generating theme attributes...');
  generateAttrsXml();
  log.success('Created attrs_icons.xml');

  // Generate Kotlin extension for Compose
  log.step('Generating Kotlin extension for Compose...');
  generateKotlinExtension(results);
  log.success('Created BildIcons.kt');

  // Summary
  console.log('\n========================================');
  console.log('  Summary');
  console.log('========================================\n');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  log.success(`Generated: ${successful}/${results.length} drawables`);

  if (failed > 0) {
    log.error(`Failed: ${failed} drawable(s)`);
    return { success: false, count: successful, failed };
  }

  log.info(`Output: ${PATHS.output}`);

  return { success: true, count: successful };
}

// Run if called directly
if (require.main === module) {
  main()
    .then(result => {
      if (!result.success) {
        process.exit(1);
      }
    })
    .catch(error => {
      log.error(error.message);
      process.exit(1);
    });
}

module.exports = { main, PATHS, toAndroidName };
