# Storybook 10 Migration Plan

> BILD Design System - Migration von Storybook 8.6.14 auf 10.x

---

## Zusammenfassung

| Aspekt | Details |
|--------|---------|
| **Aktuelle Version** | 8.6.14 |
| **Zielversion** | 10.1.8 |
| **Geschätzter Aufwand** | 1-2 Stunden |
| **Risiko** | Mittel |
| **Voraussetzung** | Node.js 20.19+ |

---

## Phase 1: Vorbereitung

### 1.1 Branch erstellen

```bash
git checkout -b feature/storybook-10-migration
```

### 1.2 Node.js Version prüfen

```bash
node --version
# Muss >= 20.19.0 oder >= 22.12.0 sein
```

### 1.3 Aktuellen Build sicherstellen

```bash
npm run build:all
npm run storybook  # Testen ob alles funktioniert
```

---

## Phase 2: Dependencies aktualisieren

### 2.1 Alle Storybook-Pakete updaten

In `package.json` folgende Versionen ändern:

```json
{
  "devDependencies": {
    "@storybook/addon-docs": "^10.1.8",
    "@storybook/addon-essentials": "^10.1.8",
    "@storybook/addon-themes": "^10.1.8",
    "@storybook/blocks": "^10.1.8",
    "@storybook/manager-api": "^10.1.8",
    "@storybook/theming": "^10.1.8",
    "@storybook/web-components-vite": "^10.1.8",
    "storybook": "^10.1.8",
    "storybook-dark-mode": "^4.0.2"
  }
}
```

### 2.2 Dependencies installieren

```bash
rm -rf node_modules package-lock.json
npm install
```

### 2.3 Peer Dependency Warnungen prüfen

Falls `storybook-dark-mode` Peer-Dependency-Fehler zeigt → Phase 4 vorziehen.

---

## Phase 3: Konfiguration migrieren

### 3.1 `main.ts` auf ESM umstellen

**Datei:** `build-config/storybook/main.ts`

**Vorher (CJS-Stil):**
```typescript
import { join, dirname } from 'path';

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}
```

**Nachher (ESM-Stil):**
```typescript
import { dirname } from 'path';
import { fileURLToPath } from 'url';

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(value)));
}
```

### 3.2 `preview.ts` prüfen

**Datei:** `build-config/storybook/preview.ts`

Keine Änderungen erforderlich - verwendet bereits `initialGlobals`.

### 3.3 `DocsContainer.tsx` prüfen

**Datei:** `build-config/storybook/DocsContainer.tsx`

Import prüfen:
```typescript
// Sollte funktionieren, aber testen
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';
```

### 3.4 `themes.ts` prüfen

**Datei:** `build-config/storybook/themes.ts`

Keine Änderungen erforderlich.

---

## Phase 4: Dark Mode Addon (falls Probleme)

### Option A: Testen ob v4.0.2 funktioniert

```bash
npm run storybook
# Dark Mode Toggle testen
```

### Option B: Zu @vueless/storybook-dark-mode wechseln

Falls Option A fehlschlägt:

**1. Package tauschen:**
```json
{
  "devDependencies": {
    "@vueless/storybook-dark-mode": "^1.0.0"
  }
}
```

**2. Imports anpassen in `preview.ts`:**
```typescript
// Vorher
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';

// Nachher
import { DARK_MODE_EVENT_NAME } from '@vueless/storybook-dark-mode';
```

**3. Imports anpassen in `DocsContainer.tsx`:**
```typescript
// Vorher
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';

// Nachher
import { DARK_MODE_EVENT_NAME } from '@vueless/storybook-dark-mode';
```

**4. Addon in `main.ts` anpassen:**
```typescript
addons: [
  getAbsolutePath('@storybook/addon-essentials'),
  getAbsolutePath('@vueless/storybook-dark-mode'),  // Geändert
],
```

### Option C: Native @storybook/addon-themes nutzen

Falls Option A und B fehlschlagen, kann der Dark Mode auch über das native `@storybook/addon-themes` implementiert werden. Dies erfordert jedoch größere Änderungen an der Konfiguration.

---

## Phase 5: CI/CD anpassen

### 5.1 Node.js Version in Workflows

**Dateien:**
- `.github/workflows/build-tokens.yml`
- `.github/workflows/build-icons.yml`
- `.github/workflows/publish-on-merge.yml`
- `.github/workflows/storybook-gh-pages.yml`
- `.github/workflows/auto-pr-from-figma.yml`
- `.github/workflows/auto-pr-from-figma-icons.yml`
- `.github/workflows/publish-icons-on-merge.yml`

**Änderung:**
```yaml
# Vorher
- uses: actions/setup-node@v4
  with:
    node-version: '20'

# Nachher (explizite Version)
- uses: actions/setup-node@v4
  with:
    node-version: '22'
```

Oder mindestens:
```yaml
node-version: '20.19'
```

---

## Phase 6: Testen

### 6.1 Build testen

```bash
npm run build:tokens
npm run build:components
```

### 6.2 Storybook starten

```bash
npm run storybook
```

### 6.3 Checkliste

| Test | Status |
|------|--------|
| Storybook startet ohne Fehler | [ ] |
| Sidebar zeigt alle Stories | [ ] |
| Komponenten rendern korrekt | [ ] |
| Dark Mode Toggle funktioniert | [ ] |
| Color Brand Switcher funktioniert | [ ] |
| Content Brand Switcher funktioniert | [ ] |
| Density Switcher funktioniert | [ ] |
| Docs Pages laden | [ ] |
| Docs Pages: Theme-Wechsel funktioniert | [ ] |
| Autodocs generiert | [ ] |

### 6.4 Storybook Build testen

```bash
npm run build:storybook
```

---

## Phase 7: Aufräumen & Commit

### 7.1 Dependabot PRs schließen

Nach erfolgreicher Migration die folgenden PRs schließen:
- PR #231 (addon-themes)
- PR #232 (addon-docs)
- PR #233 (vite) - optional später separat mergen

### 7.2 Commit erstellen

```bash
git add -A
git commit -m "chore: migrate Storybook 8.6.14 → 10.1.8

BREAKING CHANGE: Storybook 10 requires Node.js 20.19+

- Update all @storybook/* packages to 10.1.8
- Migrate main.ts to ESM (import.meta.resolve)
- Update CI workflows to Node.js 22
- [Optional] Switch to @vueless/storybook-dark-mode"
```

### 7.3 PR erstellen

```bash
git push -u origin feature/storybook-10-migration
```

---

## Rollback-Plan

Falls die Migration fehlschlägt:

```bash
git checkout main
git branch -D feature/storybook-10-migration
```

Oder spezifische Commits rückgängig machen:
```bash
git revert <commit-hash>
```

---

## Optional: Vite 7 Migration (nach Storybook 10)

Nach erfolgreicher Storybook 10 Migration kann Vite aktualisiert werden:

```json
{
  "devDependencies": {
    "vite": "^7.2.7"
  }
}
```

**Voraussetzung:** Storybook 10 ist installiert (builder-vite@10 unterstützt Vite 7).

---

## Referenzen

- [Storybook 10 Migration Guide](https://storybook.js.org/docs/releases/migration-guide)
- [Storybook 10 Release Notes](https://storybook.js.org/blog/storybook-10/)
- [@vueless/storybook-dark-mode](https://github.com/vuelessjs/storybook-dark-mode)
- [ESM in Node.js](https://nodejs.org/api/esm.html)
