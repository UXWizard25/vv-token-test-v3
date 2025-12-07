#!/usr/bin/env node

/**
 * React Component TypeScript Compilation Script
 *
 * Compiles TypeScript React components to JavaScript.
 * Generates ESM output with declaration files.
 *
 * Input:  dist/icons/react-src/*.tsx
 * Output: dist/icons/react/*.js + *.d.ts
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PATHS = {
  src: path.resolve(__dirname, '../../packages/icons/dist/react-src'),
  output: path.resolve(__dirname, '../../packages/icons/dist/react'),
  tsconfig: path.resolve(__dirname, '../../build-config/icons/tsconfig.json'),
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
// MAIN
// ============================================================================

async function main() {
  console.log('\n========================================');
  console.log('  TypeScript Compilation');
  console.log('========================================\n');

  // Check if source directory exists
  if (!fs.existsSync(PATHS.src)) {
    log.warn('Source directory does not exist');
    log.info('Run React generation first');
    return { success: true, count: 0 };
  }

  // Count TSX files
  const tsxFiles = fs.readdirSync(PATHS.src)
    .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'));

  if (tsxFiles.length === 0) {
    log.warn('No TypeScript files found');
    return { success: true, count: 0 };
  }

  log.step(`Compiling ${tsxFiles.length} TypeScript files...`);

  // Create output directory
  if (!fs.existsSync(PATHS.output)) {
    fs.mkdirSync(PATHS.output, { recursive: true });
  }

  try {
    // Run TypeScript compiler
    execSync(`npx tsc --project ${PATHS.tsconfig}`, {
      cwd: path.resolve(__dirname, '../..'),
      stdio: 'pipe',
    });

    log.success('TypeScript compilation successful');

    // Copy package.json to output
    const packageJsonSrc = path.join(PATHS.src, 'package.json');
    const packageJsonDest = path.join(PATHS.output, 'package.json');
    if (fs.existsSync(packageJsonSrc)) {
      fs.copyFileSync(packageJsonSrc, packageJsonDest);
    }

    // Generate package.json for the react directory with proper exports
    const packageJson = {
      name: '@marioschmidt/design-system-icons-react',
      private: true,
      type: 'module',
      main: './index.js',
      module: './index.js',
      types: './index.d.ts',
      sideEffects: false,
      exports: {
        '.': {
          types: './index.d.ts',
          import: './index.js',
          default: './index.js',
        },
        './*': {
          types: './*.d.ts',
          import: './*.js',
          default: './*.js',
        },
      },
    };

    fs.writeFileSync(packageJsonDest, JSON.stringify(packageJson, null, 2), 'utf8');
    log.success('Created package.json');

    // Count output files
    const outputFiles = fs.readdirSync(PATHS.output)
      .filter(file => file.endsWith('.js'));

    log.info(`Output: ${PATHS.output}`);

    return { success: true, count: outputFiles.length };
  } catch (error) {
    log.error('TypeScript compilation failed');
    log.error(error.message);

    if (error.stdout) {
      console.error(error.stdout.toString());
    }
    if (error.stderr) {
      console.error(error.stderr.toString());
    }

    return { success: false, error: error.message };
  }
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

module.exports = { main, PATHS };
