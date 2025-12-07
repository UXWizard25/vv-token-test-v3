#!/usr/bin/env node

/**
 * Generate Storybook Documentation from Token JSON
 *
 * This script reads token JSON files and generates MDX documentation
 * that automatically includes all tokens. When new tokens are added
 * in Figma and built, the docs update automatically.
 *
 * Run: node scripts/tokens/generate-docs.js
 */

const fs = require('fs');
const path = require('path');

const TOKENS_DIR = path.join(__dirname, '../../packages/tokens/.tokens');
const DOCS_DIR = path.join(__dirname, '../../packages/components/docs');

/**
 * Convert camelCase token name to kebab-case CSS variable name
 */
function toKebabCase(str) {
  return str
    .replace(/([a-z])(\d)/g, '$1-$2')
    .replace(/(\d)([a-z])/g, '$1-$2')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Generate human-readable name from token key
 */
function toDisplayName(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-z])/g, '$1 $2')
    .replace(/^./, c => c.toUpperCase());
}

/**
 * Load and parse JSON token file
 */
function loadTokens(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Extract tokens from a category object
 */
function extractTokensFromCategory(category, prefix = '') {
  const tokens = [];

  for (const [key, value] of Object.entries(category)) {
    if (value && typeof value === 'object') {
      // If it has $value, it's a token
      if (value.$value !== undefined || value.value !== undefined) {
        const cssVar = `--${toKebabCase(prefix ? `${prefix}-${key}` : key)}`;
        tokens.push({
          name: key,
          displayName: toDisplayName(key),
          cssVar,
          value: value.$value || value.value,
          comment: value.comment || '',
          alias: value.$alias?.token || null
        });
      } else {
        // It's a nested category, recurse
        tokens.push(...extractTokensFromCategory(value, key));
      }
    }
  }

  return tokens;
}

/**
 * Generate color token table rows
 */
function generateColorTableRows(tokens) {
  return tokens.map(token => {
    const usage = token.comment
      ? token.comment.split('.')[0].replace(/^[A-Z]/, c => c.toLowerCase())
      : toDisplayName(token.name);

    return `    <tr>
      <td><code>${token.cssVar}</code></td>
      <td><span className="color-swatch" style={{background: 'var(${token.cssVar})'}}></span></td>
      <td>${usage}</td>
    </tr>`;
  }).join('\n');
}

/**
 * Generate the colors.mdx documentation
 */
function generateColorsDocs() {
  // Load semantic color tokens
  const lightTokensPath = path.join(TOKENS_DIR, 'brands/bild/color/colormode-light.json');
  const lightTokens = loadTokens(lightTokensPath);

  if (!lightTokens || !lightTokens.Semantic) {
    console.error('Could not load semantic color tokens');
    return null;
  }

  const semantic = lightTokens.Semantic;

  // Load primitive colors
  const primitivePath = path.join(TOKENS_DIR, 'shared/colorprimitive.json');
  const primitives = loadTokens(primitivePath);

  // Build sections dynamically from JSON structure keys
  // Skip internal/documentation-only categories
  const skipCategories = ['TextLabels', 'LayerOpacity'];

  let semanticSections = '';

  // Iterate over all top-level keys in the semantic object
  for (const [categoryKey, categoryValue] of Object.entries(semantic)) {
    if (skipCategories.includes(categoryKey)) continue;
    if (!categoryValue || typeof categoryValue !== 'object') continue;

    const tokens = extractTokensFromCategory(categoryValue);
    if (tokens.length > 0) {
      // Generate human-readable title from key (e.g., "Text" -> "Text Colors")
      const title = `${toDisplayName(categoryKey)} Colors`;

      semanticSections += `
<div className="category-header">${title}</div>

<table className="color-table">
  <thead>
    <tr>
      <th>Token</th>
      <th>Preview</th>
      <th>Usage</th>
    </tr>
  </thead>
  <tbody>
${generateColorTableRows(tokens)}
  </tbody>
</table>
`;
    }
  }

  // Generate primitive color grid dynamically from JSON structure
  let primitiveGrid = '';
  if (primitives) {
    // Helper to extract color tokens from a group
    function extractColorTokensFromGroup(obj) {
      const tokens = [];
      for (const [key, value] of Object.entries(obj)) {
        if (value && typeof value === 'object') {
          // Skip TextLabels (documentation-only)
          if (key === 'TextLabels') continue;

          // If it has $value and is a color type, it's a token
          if ((value.$value || value.value) && value.$type === 'color') {
            tokens.push({
              name: key,
              displayName: toDisplayName(key),
              cssVar: `--${toKebabCase(key)}`,
              value: value.$value || value.value
            });
          } else {
            // Recurse into nested objects (e.g., "red", "neutrals" subcategories)
            tokens.push(...extractColorTokensFromGroup(value));
          }
        }
      }
      return tokens;
    }

    const generateColorCards = (tokens) => tokens.map(t => `  <div className="color-card">
    <div className="color-card-swatch" style={{background: 'var(${t.cssVar})'}}></div>
    <div className="color-card-info">
      <div className="color-card-name">${t.displayName}</div>
      <div className="color-card-token">${t.cssVar}</div>
    </div>
  </div>`).join('\n');

    // Iterate over top-level groups in primitives JSON (BILD, Shared, Partner, SportBILD, Opacity, etc.)
    for (const [groupKey, groupValue] of Object.entries(primitives)) {
      // Skip documentation-only groups
      if (groupKey === 'TextLabels') continue;
      if (!groupValue || typeof groupValue !== 'object') continue;

      const tokens = extractColorTokensFromGroup(groupValue);
      if (tokens.length > 0) {
        // Generate readable title from group key
        const title = toDisplayName(groupKey);

        primitiveGrid += `
### ${title}

<div className="color-grid">
${generateColorCards(tokens)}
</div>
`;
      }
    }
  }

  // Final MDX content
  const mdxContent = `import { Meta } from '@storybook/blocks';

<Meta title="Foundations/Colors" />

{/*
  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
  Generated by: scripts/tokens/generate-docs.js
  To update: run npm run build:docs or npm run build:tokens
*/}

<style>
  {\`
    .color-section {
      margin-bottom: 2rem;
    }
    .color-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0 2rem;
    }
    .color-table th, .color-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid var(--border-color-low-contrast);
    }
    .color-table th {
      background: var(--surface-color-secondary);
      font-weight: 600;
      color: var(--text-color-primary);
    }
    .color-table td {
      color: var(--text-color-primary);
    }
    .color-table code {
      background: var(--surface-color-tertiary);
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-size: 0.85em;
    }
    .color-swatch {
      display: inline-block;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid var(--border-color-low-contrast);
      vertical-align: middle;
      margin-right: 8px;
    }
    .color-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
      margin: 1rem 0 2rem;
    }
    .color-card {
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border-color-low-contrast);
      background: var(--surface-color-primary);
    }
    .color-card-swatch {
      height: 64px;
    }
    .color-card-info {
      padding: 12px;
      background: var(--surface-color-primary);
    }
    .color-card-name {
      font-weight: 600;
      font-size: 13px;
      color: var(--text-color-primary);
      margin-bottom: 2px;
    }
    .color-card-token {
      font-size: 11px;
      color: var(--text-color-secondary);
      font-family: monospace;
    }
    .hint-box {
      padding: 12px 16px;
      background: var(--surface-color-tertiary);
      border-radius: 8px;
      border-left: 4px solid var(--core-color-primary);
      margin: 1rem 0;
      font-size: 14px;
      color: var(--text-color-primary);
    }
    .category-header {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-color-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-color-low-contrast);
    }
  \`}
</style>

# Colors

The BILD Design System uses a **4-layer token architecture** for colors.

<div className="hint-box">
  <strong>Live Preview:</strong> All color swatches use CSS custom properties. Switch brands and themes using the <strong>toolbar above</strong> to see values change in real-time.
</div>

---

## Color Primitives

These are the raw color values from Layer 0 (no modes).
${primitiveGrid}
---

## Semantic Colors (ColorMode Collection)

These are meaning-based tokens from Layer 2 that adapt to light/dark mode.
${semanticSections}
---

## Usage

\`\`\`css
/* Using semantic color tokens */
.my-component {
  color: var(--text-color-primary);
  background: var(--surface-color-primary);
  border: 1px solid var(--border-color-low-contrast);
}

/* Highlight text */
.highlight {
  color: var(--text-color-accent);
}

/* Success state */
.success-message {
  color: var(--text-color-success-constant);
  background: var(--surface-color-success);
  border: 1px solid var(--border-color-success);
}
\`\`\`
`;

  return mdxContent;
}

/**
 * Generate the typography.mdx documentation
 */
function generateTypographyDocs() {
  // Load typography tokens (use xs breakpoint as base reference)
  const typographyPath = path.join(TOKENS_DIR, 'brands/bild/semantic/typography/typography-xs.json');
  const typography = loadTokens(typographyPath);

  if (!typography) {
    console.error('Could not load typography tokens');
    return null;
  }

  // Load font primitives
  const fontPrimitivePath = path.join(TOKENS_DIR, 'shared/fontprimitive.json');
  const fontPrimitives = loadTokens(fontPrimitivePath);

  // Generate font families section dynamically
  let fontFamiliesSection = '';
  if (fontPrimitives && fontPrimitives.FontFamily) {
    const allFonts = [];

    // Extract fonts from all brand groups
    for (const [brandKey, brandFonts] of Object.entries(fontPrimitives.FontFamily)) {
      if (!brandFonts || typeof brandFonts !== 'object') continue;

      for (const [fontKey, fontValue] of Object.entries(brandFonts)) {
        if (fontValue && (fontValue.$value || fontValue.value)) {
          allFonts.push({
            name: fontKey,
            displayName: toDisplayName(fontKey).replace('Font Family ', ''),
            cssVar: `--${toKebabCase(fontKey)}`,
            value: fontValue.$value || fontValue.value,
            brand: brandKey
          });
        }
      }
    }

    if (allFonts.length > 0) {
      const fontRows = allFonts.map(f => `    <tr>
      <td>${f.value}</td>
      <td><code>${f.cssVar}</code></td>
      <td>${f.brand}</td>
    </tr>`).join('\n');

      fontFamiliesSection = `
<table className="typo-table">
  <thead>
    <tr>
      <th>Font Family</th>
      <th>CSS Variable</th>
      <th>Brand</th>
    </tr>
  </thead>
  <tbody>
${fontRows}
  </tbody>
</table>
`;
    }
  }

  // Generate font weights section dynamically
  let fontWeightsSection = '';
  if (fontPrimitives && fontPrimitives.FontWeight) {
    const weights = [];

    for (const [weightKey, weightValue] of Object.entries(fontPrimitives.FontWeight)) {
      if (weightValue && (weightValue.$value !== undefined || weightValue.value !== undefined)) {
        weights.push({
          name: weightKey,
          displayName: toDisplayName(weightKey).replace('Font Weight ', ''),
          cssVar: `--${toKebabCase(weightKey)}`,
          value: weightValue.$value || weightValue.value
        });
      }
    }

    if (weights.length > 0) {
      fontWeightsSection = weights.map(w => `<div className="weight-sample">
  <span style={{fontWeight: 'var(${w.cssVar})', fontSize: '18px'}}>${w.displayName} (${w.value})</span>
  <span className="weight-label">${w.cssVar}</span>
</div>`).join('\n\n');
    }
  }

  // Generate typography classes section dynamically from JSON structure
  let typographyClassesSection = '';

  // Iterate over all top-level categories (display, heading, body, label, kicker, etc.)
  for (const [categoryKey, categoryStyles] of Object.entries(typography)) {
    if (!categoryStyles || typeof categoryStyles !== 'object') continue;

    // Extract styles from this category
    const styles = [];
    for (const [styleKey, styleValue] of Object.entries(categoryStyles)) {
      if (styleValue && (styleValue.$value || styleValue.value) && styleValue.$type === 'typography') {
        // Generate CSS class name from style key (e.g., "display1" -> "display-1")
        const className = toKebabCase(styleKey);

        styles.push({
          name: styleKey,
          className: className,
          comment: styleValue.comment || '',
          value: styleValue.$value || styleValue.value
        });
      }
    }

    if (styles.length > 0) {
      // Generate category header
      const categoryTitle = `${toDisplayName(categoryKey)} Styles`;

      typographyClassesSection += `
<div className="category-header">${categoryTitle}</div>

`;

      // Generate style samples
      for (const style of styles) {
        // Extract first sentence of comment as description, or generate a default
        let description = style.comment
          ? style.comment.split('.')[0].trim()
          : `${toDisplayName(style.name)} typography style`;

        typographyClassesSection += `<div className="font-sample">
  <div className="font-sample-label">.${style.className}</div>
  <div className="${style.className}">The quick brown fox jumps over the lazy dog</div>
  <div className="font-sample-desc">${description}</div>
</div>

`;
      }
    }
  }

  // Final MDX content
  const mdxContent = `import { Meta } from '@storybook/blocks';

<Meta title="Foundations/Typography" />

{/*
  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
  Generated by: scripts/tokens/generate-docs.js
  To update: run npm run build:docs or npm run build:tokens
*/}

<style>
  {\`
    .typo-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0 2rem;
    }
    .typo-table th, .typo-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid var(--border-color-low-contrast);
      color: var(--text-color-primary);
    }
    .typo-table th {
      background: var(--surface-color-secondary);
      font-weight: 600;
    }
    .typo-table code {
      background: var(--surface-color-tertiary);
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-size: 0.85em;
    }
    .font-sample {
      padding: 1.5rem;
      background: var(--surface-color-secondary);
      border-radius: 8px;
      margin: 0.5rem 0 1.5rem;
      color: var(--text-color-primary);
    }
    .font-sample-label {
      font-size: 12px;
      color: var(--text-color-secondary);
      margin-bottom: 8px;
      font-family: monospace;
    }
    .font-sample-desc {
      font-size: 12px;
      color: var(--text-color-muted);
      margin-top: 12px;
      line-height: 1.4;
    }
    .hint-box {
      padding: 12px 16px;
      background: var(--surface-color-tertiary);
      border-radius: 8px;
      border-left: 4px solid var(--core-color-primary);
      margin: 1rem 0;
      font-size: 14px;
      color: var(--text-color-primary);
    }
    .category-header {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-color-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-color-low-contrast);
    }
    .weight-sample {
      padding: 12px 16px;
      background: var(--surface-color-secondary);
      border-radius: 8px;
      margin: 8px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .weight-label {
      font-size: 12px;
      color: var(--text-color-secondary);
      font-family: monospace;
    }
  \`}
</style>

# Typography

The design system provides a comprehensive set of typography styles that adapt to brand and breakpoint.

<div className="hint-box">
  <strong>Live Preview:</strong> All typography samples use CSS classes that adapt to the selected brand and viewport size. Switch brands using the <strong>toolbar above</strong> and resize your browser to see responsive scaling.
</div>

---

## Font Families

Font families are brand-specific. The active brand determines which fonts are used.
${fontFamiliesSection}
---

## Font Weights
${fontWeightsSection}

---

## Typography Classes

The following CSS classes are generated from design tokens. They include font-family, font-size, font-weight, line-height, and letter-spacing — all responsive to breakpoints.
${typographyClassesSection}
---

## Responsive Breakpoints

Typography scales automatically based on viewport width:

<table className="typo-table">
  <thead>
    <tr>
      <th>Breakpoint</th>
      <th>Min-Width</th>
      <th>Device Class</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>xs</code></td>
      <td>320px</td>
      <td>Mobile (default)</td>
    </tr>
    <tr>
      <td><code>sm</code></td>
      <td>390px</td>
      <td>Large Mobile</td>
    </tr>
    <tr>
      <td><code>md</code></td>
      <td>600px</td>
      <td>Tablet</td>
    </tr>
    <tr>
      <td><code>lg</code></td>
      <td>1024px</td>
      <td>Desktop</td>
    </tr>
  </tbody>
</table>

**Try it:** Resize your browser window to see typography scale responsively.

---

## Usage

### Using Typography Classes

\`\`\`html
<h1 class="display-1">Main Headline</h1>
<h2 class="heading-1">Section Title</h2>
<p class="body-md">Body text content...</p>
<span class="label-sm">CATEGORY LABEL</span>
\`\`\`

### Using CSS Variables

\`\`\`css
.custom-headline {
  font-family: var(--font-family-gotham-xnarrow);
  font-weight: var(--font-weight-bold);
  font-size: var(--display-1-font-size);
  line-height: var(--display-1-line-height);
}
\`\`\`
`;

  return mdxContent;
}

/**
 * Generate the effects.mdx documentation
 */
function generateEffectsDocs() {
  // Load semantic effects tokens
  const effectsPath = path.join(TOKENS_DIR, 'brands/bild/semantic/effects/effects-light.json');
  const effects = loadTokens(effectsPath);

  if (!effects) {
    console.error('Could not load effects tokens');
    return null;
  }

  // Build shadow sections dynamically from JSON structure
  let shadowSections = '';

  // Iterate over all top-level categories (e.g., dropshadowsoft, dropshadowhard)
  for (const [categoryKey, categoryEffects] of Object.entries(effects)) {
    if (!categoryEffects || typeof categoryEffects !== 'object') continue;

    // Extract shadow tokens from this category
    const shadows = [];
    for (const [effectKey, effectValue] of Object.entries(categoryEffects)) {
      if (effectValue && (effectValue.$value || effectValue.value) && effectValue.$type === 'shadow') {
        // Generate CSS class name from effect key (e.g., "shadowSoftSm" -> "shadow-soft-sm")
        const className = toKebabCase(effectKey);

        shadows.push({
          name: effectKey,
          displayName: toDisplayName(effectKey).replace('Shadow ', '').toUpperCase(),
          className: className,
          cssVar: `--${className}`,
          comment: effectValue.comment || ''
        });
      }
    }

    if (shadows.length > 0) {
      // Generate category title from key (e.g., "dropshadowsoft" -> "Soft Shadows")
      let categoryTitle = toDisplayName(categoryKey)
        .replace('Dropshadow', '')
        .replace('Drop Shadow', '')
        .trim();
      // Capitalize first letter
      categoryTitle = categoryTitle.charAt(0).toUpperCase() + categoryTitle.slice(1) + ' Shadows';

      // Get category description from the first shadow's comment if available
      const categoryDesc = shadows[0].comment || '';

      shadowSections += `
<div className="category-header">${categoryTitle}</div>
${categoryDesc ? `<p className="category-desc">${categoryDesc}</p>` : ''}

<div className="shadow-grid">
${shadows.map(s => `  <div className="shadow-card ${s.className}">
    <div className="shadow-name">${s.displayName}</div>
    <div className="shadow-class">.${s.className}</div>
  </div>`).join('\n')}
</div>
`;
    }
  }

  // Generate shadow tokens table dynamically
  let shadowTokensTable = '';
  const allShadows = [];

  for (const [categoryKey, categoryEffects] of Object.entries(effects)) {
    if (!categoryEffects || typeof categoryEffects !== 'object') continue;

    for (const [effectKey, effectValue] of Object.entries(categoryEffects)) {
      if (effectValue && effectValue.$type === 'shadow') {
        const className = toKebabCase(effectKey);
        // Generate usage description from comment or create a default
        let usage = effectValue.comment
          ? effectValue.comment.split('.')[0].trim()
          : `${toDisplayName(effectKey)} effect`;

        allShadows.push({
          cssVar: `--${className}`,
          usage: usage
        });
      }
    }
  }

  if (allShadows.length > 0) {
    const tokenRows = allShadows.map(s => `    <tr>
      <td><code>${s.cssVar}</code></td>
      <td>${s.usage}</td>
    </tr>`).join('\n');

    shadowTokensTable = `
<table className="effects-table">
  <thead>
    <tr>
      <th>Token</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
${tokenRows}
  </tbody>
</table>
`;
  }

  // Scan for component-level effects dynamically
  let componentEffectsSection = '';
  const componentsDir = path.join(TOKENS_DIR, 'brands/bild/components');

  if (fs.existsSync(componentsDir)) {
    const componentEffects = [];
    const componentDirs = fs.readdirSync(componentsDir);

    for (const componentDir of componentDirs) {
      const effectsLightPath = path.join(componentsDir, componentDir, `${componentDir.toLowerCase()}-effects-light.json`);

      if (fs.existsSync(effectsLightPath)) {
        const compEffects = loadTokens(effectsLightPath);
        if (compEffects) {
          for (const [tokenKey, tokenValue] of Object.entries(compEffects)) {
            if (tokenValue && tokenValue.$type === 'shadow') {
              const cssVar = `--${toKebabCase(tokenKey)}`;
              componentEffects.push({
                component: componentDir,
                cssVar: cssVar,
                comment: tokenValue.comment || ''
              });
            }
          }
        }
      }
    }

    if (componentEffects.length > 0) {
      const compRows = componentEffects.map(c => `    <tr>
      <td>${c.component}</td>
      <td><code>${c.cssVar}</code></td>
    </tr>`).join('\n');

      componentEffectsSection = `
## Component-Level Effects

Some components have their own effect tokens:

<table className="effects-table">
  <thead>
    <tr>
      <th>Component</th>
      <th>Token</th>
    </tr>
  </thead>
  <tbody>
${compRows}
  </tbody>
</table>
`;
    }
  }

  // Final MDX content
  const mdxContent = `import { Meta } from '@storybook/blocks';

<Meta title="Foundations/Effects" />

{/*
  AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
  Generated by: scripts/tokens/generate-docs.js
  To update: run npm run build:docs or npm run build:tokens
*/}

<style>
  {\`
    .effects-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0 2rem;
    }
    .effects-table th, .effects-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid var(--border-color-low-contrast);
      color: var(--text-color-primary);
    }
    .effects-table th {
      background: var(--surface-color-secondary);
      font-weight: 600;
    }
    .effects-table code {
      background: var(--surface-color-tertiary);
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-size: 0.85em;
    }
    .shadow-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 24px;
      margin: 1rem 0 2rem;
      padding: 24px;
      background: var(--surface-color-secondary);
      border-radius: 12px;
    }
    .shadow-card {
      height: 100px;
      background: var(--surface-color-primary);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .shadow-name {
      font-weight: 600;
      font-size: 14px;
      color: var(--text-color-primary);
      margin-bottom: 4px;
    }
    .shadow-class {
      font-size: 11px;
      color: var(--text-color-secondary);
      font-family: monospace;
    }
    .hint-box {
      padding: 12px 16px;
      background: var(--surface-color-tertiary);
      border-radius: 8px;
      border-left: 4px solid var(--core-color-primary);
      margin: 1rem 0;
      font-size: 14px;
      color: var(--text-color-primary);
    }
    .category-header {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-color-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2rem;
      margin-bottom: 0.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-color-low-contrast);
    }
    .category-desc {
      font-size: 14px;
      color: var(--text-color-secondary);
      margin: 0 0 1rem 0;
    }
  \`}
</style>

# Effects

The design system provides predefined shadow effects for elevation and visual depth.

<div className="hint-box">
  <strong>Live Preview:</strong> All shadow cards use CSS classes that adapt to light/dark mode. Toggle the <strong>theme</strong> in the toolbar to see shadows change.
</div>

---

## Shadow Scale

These CSS classes apply predefined shadow values. The shadows automatically adapt to light/dark mode.
${shadowSections}
---

## Shadow Tokens

You can also use CSS custom properties directly for more control:
${shadowTokensTable}
---

${componentEffectsSection}
---

## Usage

### Using CSS Classes

\`\`\`html
<!-- Apply shadow class directly -->
<div class="card shadow-soft-md">
  Card content
</div>

<!-- Interactive shadow on hover -->
<div class="card shadow-soft-sm hover:shadow-soft-md">
  Hoverable card
</div>
\`\`\`

### Using CSS Variables

\`\`\`css
/* Direct token usage */
.my-card {
  box-shadow: var(--shadow-soft-md);
}

/* Interactive shadow transition */
.interactive-card {
  box-shadow: var(--shadow-soft-sm);
  transition: box-shadow 0.2s ease;
}

.interactive-card:hover {
  box-shadow: var(--shadow-soft-md);
}
\`\`\`

### Combining with Other Tokens

\`\`\`css
.floating-panel {
  background: var(--surface-color-primary);
  border: 1px solid var(--border-color-low-contrast);
  border-radius: 8px;
  box-shadow: var(--shadow-soft-lg);
  padding: var(--content-gap-lg);
}
\`\`\`
`;

  return mdxContent;
}

/**
 * Main execution
 */
function main() {
  console.log('Generating Storybook documentation from tokens...\n');

  // Ensure docs directory exists
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }

  // Generate colors documentation
  console.log('Generating colors.mdx...');
  const colorsDocs = generateColorsDocs();
  if (colorsDocs) {
    const colorsPath = path.join(DOCS_DIR, 'colors.mdx');
    fs.writeFileSync(colorsPath, colorsDocs);
    console.log(`  Written: ${colorsPath}`);
  }

  // Generate typography documentation
  console.log('Generating typography.mdx...');
  const typographyDocs = generateTypographyDocs();
  if (typographyDocs) {
    const typographyPath = path.join(DOCS_DIR, 'typography.mdx');
    fs.writeFileSync(typographyPath, typographyDocs);
    console.log(`  Written: ${typographyPath}`);
  }

  // Generate effects documentation
  console.log('Generating effects.mdx...');
  const effectsDocs = generateEffectsDocs();
  if (effectsDocs) {
    const effectsPath = path.join(DOCS_DIR, 'effects.mdx');
    fs.writeFileSync(effectsPath, effectsDocs);
    console.log(`  Written: ${effectsPath}`);
  }

  console.log('\nDocumentation generation complete!');
}

main();
