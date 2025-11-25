/**
 * Build CSS Bundles
 *
 * Creates optimized CSS bundles from individual token files
 * - Quick Start: All tokens (semantic + components)
 * - Semantic: Only semantic tokens
 * - Components: Individual component bundles
 *
 * All bundles use "clean" format: no comments, but formatted/readable
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const BUNDLES_DIR = path.join(DIST_DIR, 'bundles');
const BRANDS = ['bild', 'sportbild', 'advertorial'];

/**
 * Removes all CSS comments while preserving formatting
 * Clean format: no comments, but indentation and newlines remain
 */
function removeComments(css) {
  // Remove block comments /* ... */
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');

  // Remove line comments (if any)
  css = css.replace(/\/\/.*$/gm, '');

  // Remove empty lines (more than 2 consecutive newlines)
  css = css.replace(/\n{3,}/g, '\n\n');

  // Trim leading/trailing whitespace
  css = css.trim();

  return css;
}

/**
 * Combines multiple CSS files into one bundle
 */
async function combineFiles(files) {
  let combined = '';

  for (const file of files) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      const cleaned = removeComments(content);

      if (cleaned.trim()) {
        combined += cleaned + '\n\n';
      }
    }
  }

  return combined.trim();
}

/**
 * Ensures directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Build Quick Start Bundles (semantic + all components)
 */
async function buildQuickStartBundles() {
  console.log('\n📦 Building Quick Start Bundles:');

  const quickStartDir = path.join(BUNDLES_DIR, 'quick-start');
  ensureDir(quickStartDir);

  let totalBundles = 0;
  let successfulBundles = 0;

  for (const brand of BRANDS) {
    const brandCssDir = path.join(DIST_DIR, 'css', 'brands', brand);

    if (!fs.existsSync(brandCssDir)) {
      console.log(`  ⚠️  ${brand}: No CSS files found`);
      continue;
    }

    try {
      // Find all CSS files for this brand
      const files = await glob(`${brandCssDir}/**/*.css`);

      if (files.length === 0) {
        console.log(`  ⚠️  ${brand}: No CSS files to bundle`);
        continue;
      }

      // Combine all files
      const bundleContent = await combineFiles(files);

      // Write bundle
      const bundlePath = path.join(quickStartDir, `${brand}-all.css`);
      fs.writeFileSync(bundlePath, bundleContent);

      const sizeKB = (bundleContent.length / 1024).toFixed(2);
      console.log(`  ✅ ${brand}-all.css (${files.length} files, ${sizeKB} KB)`);

      totalBundles++;
      successfulBundles++;
    } catch (error) {
      console.error(`  ❌ ${brand}: ${error.message}`);
      totalBundles++;
    }
  }

  return { totalBundles, successfulBundles };
}

/**
 * Build Semantic Bundles (only semantic tokens, no components)
 */
async function buildSemanticBundles() {
  console.log('\n📦 Building Semantic Bundles:');

  const semanticDir = path.join(BUNDLES_DIR, 'semantic');
  ensureDir(semanticDir);

  let totalBundles = 0;
  let successfulBundles = 0;

  for (const brand of BRANDS) {
    const brandSemanticDir = path.join(DIST_DIR, 'css', 'brands', brand, 'semantic');

    if (!fs.existsSync(brandSemanticDir)) {
      console.log(`  ⚠️  ${brand}: No semantic files found`);
      continue;
    }

    try {
      // Find all semantic CSS files
      const files = await glob(`${brandSemanticDir}/**/*.css`);

      if (files.length === 0) {
        console.log(`  ⚠️  ${brand}: No semantic CSS files to bundle`);
        continue;
      }

      // Combine all files
      const bundleContent = await combineFiles(files);

      // Write bundle
      const bundlePath = path.join(semanticDir, `${brand}-semantic.css`);
      fs.writeFileSync(bundlePath, bundleContent);

      const sizeKB = (bundleContent.length / 1024).toFixed(2);
      console.log(`  ✅ ${brand}-semantic.css (${files.length} files, ${sizeKB} KB)`);

      totalBundles++;
      successfulBundles++;
    } catch (error) {
      console.error(`  ❌ ${brand}: ${error.message}`);
      totalBundles++;
    }
  }

  return { totalBundles, successfulBundles };
}

/**
 * Build Component Bundles (individual components)
 */
async function buildComponentBundles() {
  console.log('\n📦 Building Component Bundles:');

  const componentsDir = path.join(BUNDLES_DIR, 'components');
  ensureDir(componentsDir);

  let totalBundles = 0;
  let successfulBundles = 0;

  for (const brand of BRANDS) {
    const brandComponentsDir = path.join(DIST_DIR, 'css', 'brands', brand, 'components');

    if (!fs.existsSync(brandComponentsDir)) {
      console.log(`  ⚠️  ${brand}: No components found`);
      continue;
    }

    // Get all component directories
    const componentNames = fs.readdirSync(brandComponentsDir).filter(name => {
      const componentPath = path.join(brandComponentsDir, name);
      return fs.statSync(componentPath).isDirectory();
    });

    console.log(`  🏷️  ${brand}: ${componentNames.length} components`);

    for (const componentName of componentNames) {
      try {
        const componentDir = path.join(brandComponentsDir, componentName);

        // Find all CSS files for this component
        const files = await glob(`${componentDir}/*.css`);

        if (files.length === 0) continue;

        // Combine all files
        const bundleContent = await combineFiles(files);

        // Write bundle
        const bundlePath = path.join(componentsDir, `${brand}-${componentName.toLowerCase()}.css`);
        fs.writeFileSync(bundlePath, bundleContent);

        totalBundles++;
        successfulBundles++;
      } catch (error) {
        console.error(`     ❌ ${componentName}: ${error.message}`);
        totalBundles++;
      }
    }

    console.log(`     ✅ ${successfulBundles}/${totalBundles} component bundles created`);
  }

  return { totalBundles, successfulBundles };
}

/**
 * Main build function
 */
async function main() {
  console.log('\n🎨 ============================================');
  console.log('   CSS Bundle Builder');
  console.log('   ============================================\n');

  const startTime = Date.now();

  // Ensure bundles directory exists
  ensureDir(BUNDLES_DIR);

  const stats = {
    quickStart: await buildQuickStartBundles(),
    semantic: await buildSemanticBundles(),
    components: await buildComponentBundles()
  };

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Print summary
  console.log('\n✨ Bundle Build Complete!\n');
  console.log('📊 Statistics:');
  console.log(`   Quick Start: ${stats.quickStart.successfulBundles}/${stats.quickStart.totalBundles} bundles`);
  console.log(`   Semantic: ${stats.semantic.successfulBundles}/${stats.semantic.totalBundles} bundles`);
  console.log(`   Components: ${stats.components.successfulBundles}/${stats.components.totalBundles} bundles`);
  console.log(`   Duration: ${duration}s\n`);
  console.log(`📁 Output: ${BUNDLES_DIR}\n`);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Bundle build failed:', error);
    process.exit(1);
  });
}

module.exports = { main };
