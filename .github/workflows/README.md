# GitHub Actions Workflows

## 📦 Monorepo Structure

This repository uses **npm workspaces** to manage multiple packages:

| Package | npm Name | Build Command |
|---------|----------|---------------|
| `packages/tokens` | `@marioschmidt/design-system-tokens` | `npm run build:tokens` |
| `packages/icons` | `@marioschmidt/design-system-icons` | `npm run build:icons` |
| `packages/components/core` | `@marioschmidt/design-system-components` | `npm run build:components` |
| `packages/components/react` | `@marioschmidt/design-system-react` | `npm run build:react` |
| `packages/components/vue` | `@marioschmidt/design-system-vue` | `npm run build:vue` |

---

## 📋 Available Workflows

### `build-tokens.yml` - Design Token Build Pipeline

Automated build process for Design Tokens from Figma exports.

#### 🚀 Triggers

**Automatic:**
- Push to `main`, `develop`, or `claude/**` branches
- Only when files in the following paths are changed:
  - `src/design-tokens/**` (Figma exports)
  - `scripts/tokens/**` (Build scripts)
  - `build-config/tokens/**` (Style Dictionary config)
  - `package.json` (Dependencies)

**Manual:**
- Via GitHub UI: Actions → "Build Design Tokens" → "Run workflow"
- With options:
  - **Clean Build**: Deletes `node_modules` and `dist` before the build
  - **Commit Outputs**: Commits generated files back to the repository

#### 📦 What Happens?

1. **Repository Checkout** - Fetches the current code
2. **Node.js Setup** - Installs Node.js 20
3. **Dependencies Install** - `npm ci` for reproducible builds
4. **Preprocessing** - Transforms Figma JSON → Style Dictionary format
5. **Token Build** - Generates all output formats (CSS, SCSS, JS, JSON)
6. **Artifacts Upload** - Uploads generated files as build artifacts
7. **Build Summary** - Creates detailed summary in GitHub UI
8. **Optional: Commit** - Commits generated files back (on main or manually)

#### 📊 Build Summary

After each build, a detailed summary is displayed:
- Build status and statistics
- List of generated files
- File count per format
- Error logs on failures

#### 🎯 Manual Build

**Via GitHub UI:**
1. Go to "Actions" tab
2. Select "Build Design Tokens"
3. Click "Run workflow"
4. Select branch
5. Set options (optional):
   - ✅ Clean Build for complete restart
   - ✅ Commit Outputs to commit files
6. Click "Run workflow"

**Via GitHub CLI:**
```bash
# Standard Build
gh workflow run build-tokens.yml

# With branch
gh workflow run build-tokens.yml --ref main

# With options
gh workflow run build-tokens.yml \
  -f clean_build=true \
  -f commit_outputs=true
```

**Via API:**
```bash
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/actions/workflows/build-tokens.yml/dispatches \
  -d '{"ref":"main","inputs":{"clean_build":"true"}}'
```

#### 📥 Build Artifacts

Generated files are stored as artifacts:
- **Name**: `design-tokens-{commit-sha}`
- **Retention**: 30 days
- **Contents**:
  - `dist/` - All generated token files
  - `tokens/` - Intermediate step (Style Dictionary input)
  - `build-output.log` - Complete build logs

**Download:**
1. Go to Actions → Build Run
2. Scroll to "Artifacts"
3. Click to download

#### 🏷️ Release Workflow

For Git tags (e.g., `v1.0.0`), a GitHub Release is automatically created:
- Release with tag name
- ZIP and TAR.GZ archives of generated tokens
- Automatic release notes

**Create a release:**
```bash
git tag v1.0.0
git push origin v1.0.0
```

#### ⚙️ Configuration

**Adjust branch filter:**
```yaml
on:
  push:
    branches:
      - main        # Main branch
      - develop     # Development branch
      - 'claude/**' # All Claude branches
```

**Adjust path filter:**
```yaml
paths:
  - 'src/design-tokens/**'  # Token sources
  - 'scripts/tokens/**'     # Build scripts
  - 'build-config/tokens/**'  # Configuration
```

**Enable auto-commit:**
```yaml
# Always commit on push to main
if: github.event_name == 'push' && github.ref == 'refs/heads/main'

# Or only on manual activation
if: github.event.inputs.commit_outputs == 'true'
```

#### 🔒 Permissions

The workflow requires the following permissions:
- `contents: write` - For commits and releases
- `pull-requests: write` - For PR comments (optional)

#### 🚨 Error Handling

On errors:
1. Build fails (Exit Code ≠ 0)
2. Error summary is displayed in GitHub UI
3. Build logs are available
4. Artifacts are not uploaded
5. No commits are created

**Common errors:**
- **No successful builds**: Preprocessing or build failed
- **Module not found**: `npm ci` failed
- **Git push failed**: Missing permissions

#### 💡 Best Practices

1. **Local test before push:**
   ```bash
   npm run build
   ```

2. **Clean build on issues:**
   - Trigger manually with "Clean Build" option

3. **Branch protection:**
   - Require status checks for main
   - Build must be green

4. **Use artifacts:**
   - Download for local testing
   - Share with team members

5. **Tag releases:**
   - Semantic versioning: `v1.2.3`
   - Only stable versions

#### 📚 Additional Information

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Style Dictionary Docs](https://amzn.github.io/style-dictionary/)

#### 🤝 Troubleshooting

**Workflow not triggering:**
- Check branch filter
- Check path filter (were relevant files changed?)
- Check workflow permissions

**Build failing:**
- Check build logs in Actions tab
- Download artifacts for local analysis
- Test locally: `npm run build`

**Auto-commit not working:**
- Check permissions: `contents: write`
- Check branch protection rules
- Check if `[skip ci]` is in the commit

---

### `publish-on-merge.yml` - Automated Publishing with Impact-Based Versioning

Automatically publishes all packages to npm when changes are merged to main, with intelligent version bumping based on token change impact.

#### 🚀 Triggers

**Automatic:**
- Push to `main` branch

#### 📦 What Happens?

```
Push to main
     │
     ▼
Build current tokens (for comparison)
     │
     ▼
Checkout previous release tag → Build baseline
     │
     ▼
Run compare-builds.js → Calculate impact level
     │
     ├── Tokens REMOVED?   → BREAKING  → npm version minor
     ├── Tokens MODIFIED?  → MODERATE  → npm version patch
     ├── Tokens ADDED?     → MINOR     → npm version patch
     └── No changes?       → NONE      → npm version patch
     │
     ▼
Final build with correct version in headers
     │
     ▼
Publish all packages to npm
     │
     ▼
Create GitHub Release with release notes
```

#### 🎯 Impact-Based Versioning

The workflow analyzes token changes to determine the appropriate version bump:

| Impact Level | Condition | Version Bump | Example Changes |
|--------------|-----------|--------------|-----------------|
| `breaking` | Tokens or files removed | `minor` | Deleted `--button-primary-bg`, removed component file |
| `moderate` | Token values modified | `patch` | Color changed from `#DD0000` to `#EE0000` |
| `minor` | Tokens or files added | `patch` | New `--button-tertiary-*` tokens added |
| `none` | No token changes | `patch` | Only workflow/script changes |

**Note:** Breaking changes bump `minor` instead of `major` during the 0.x/1.x development phase.

#### 🔒 Race Condition Prevention

The workflow uses a concurrency group to prevent parallel publish conflicts:

```yaml
concurrency:
  group: publish-main
  cancel-in-progress: false
```

This ensures:
- Only one publish workflow runs at a time
- Subsequent pushes queue and wait
- No npm version conflicts

#### 📦 Published Packages

All packages are published with synchronized versions:

| Package | npm Name |
|---------|----------|
| Tokens | `@marioschmidt/design-system-tokens` |
| Icons | `@marioschmidt/design-system-icons` |
| Components | `@marioschmidt/design-system-components` |
| React | `@marioschmidt/design-system-react` |
| Vue | `@marioschmidt/design-system-vue` |

#### ⚙️ Key Scripts

| Script | Purpose |
|--------|---------|
| `scripts/tokens/compare-builds.js` | Compares current vs baseline tokens, calculates impact level |
| `scripts/tokens/release-notes.js` | Generates human-readable release notes from diff |
| `scripts/tokens/scan-component-refs.js` | Scans Stencil components for token references |

#### 📋 Release Notes Format

The release notes include structured sections with visual diff information:

| Section | Content |
|---------|---------|
| 🔴 Breaking Changes | Removed tokens grouped by layer |
| 🟡 Visual Changes | Modified tokens with matrix display |
| 🟢 Safe Changes | Added tokens and internal changes |
| 🧩 Affected Stencil Components | Components using changed tokens |
| ⚙️ Technical Details | File lists and build stats |

**Matrix Display for Multi-Context Tokens:**

Color tokens (brand × mode):
```
| | Bild | Sportbild |
|---|---|---|
| ☀️ light | 🟡 `#232629` → `#1a1c1e` | – |
| 🌙 dark | 🟠 `#f2f4f5` → `#ffffff` | – |

> 📊 bild/light: ΔE 4.9 (subtil)
```

Spacing tokens (brand × breakpoint):
```
| | Bild | Sportbild |
|---|---|---|
| 📱 xs | 🟠 `12px` → `16px` | – |
| 💻 md | 🟡 `20px` → `24px` | – |

> 📊 bild/xs: +33% · bild/md: +20%
```

**Visual Indicators:**
- ⚪ keine Änderung / ΔE < 1
- 🟢 minimal (≤10% / ΔE 1-2)
- 🟡 moderat (≤25% / ΔE 2-5)
- 🟠 signifikant (≤50% / ΔE 5-10)
- 🔴 stark (>50% / ΔE > 10)

**Affected Stencil Components:**

The PR comment includes an analysis of which Stencil components are affected by token changes:
- Scans `packages/components/core/src/ds-*/ds-*.css` for `var(--token)` references
- Matches changed tokens against component CSS
- Shows breaking vs visual impact per component

```
| Component | Impact | Changed Tokens |
|-----------|--------|----------------|
| ds-button | 🔴 2 breaking | `--button-primary-bg`, +1 more |
| ds-card | 🟡 3 visual | `--shadow-soft-md`, +2 more |
```

#### 🔒 Permissions

The workflow requires:
- `contents: write` - For version commits and releases
- `NPM_TOKEN` secret - For npm publishing

#### 🚨 Troubleshooting

**Version not bumping correctly:**
- Check `compare-builds.js` output in workflow logs
- Verify baseline tag exists: `git tag -l`
- Check diff output: `scripts/tokens/compare-builds.js --baseline dist-baseline --current packages/tokens/dist`

**Publish failed:**
- Check NPM_TOKEN secret is valid
- Verify npm registry access
- Check for existing version (npm won't republish same version)

**Race condition occurred:**
- Concurrency group should prevent this
- Check if another workflow is running in parallel
- Verify `cancel-in-progress: false` is set

---

**Last updated**: 2025-12-09
