# 📦 NPM Publishing - Automatisierter Workflow

Deine Design Tokens werden automatisch als NPM Package veröffentlicht, wenn du sie aus Figma pushst.

---

## 🎯 Übersicht

**Package Name:** `@uxwizard25/design-system-tokens`
**Registry:** GitHub Packages (kostenlos & privat)
**Versionierung:** Automatisch (Patch-Version bei jedem Release)
**Workflow:** Figma → PR → Merge → Publish ✅

---

## 🚀 SO FUNKTIONIERT ES

### **Der komplette Ablauf:**

```
1. Figma Variable Visualizer Plugin
   ↓ Push to "figma-tokens" branch
2. GitHub Actions erstellt automatisch Pull Request
   ↓ Build & Validierung
3. Du reviewst PR auf GitHub
   ↓ Merge Pull Request
4. GitHub Actions published automatisch neue Version
   ↓
5. Fertig! Package ist veröffentlicht 🎉
```

**Du brauchst:**
- ✅ Keine Git Tags erstellen
- ✅ Kein manuelles Approve
- ✅ Nur PR mergen

---

## 📝 SCHRITT-FÜR-SCHRITT ANLEITUNG

### **Schritt 1: Figma Variable Visualizer Plugin konfigurieren**

**WICHTIG:** Stelle den Target Branch auf `figma-tokens` (NICHT `main`!)

Im Variable Visualizer Plugin:

```
Repository:      UXWizard25/vv-token-test-v3
Path:            src/design-tokens/
Target branch:   figma-tokens  ← WICHTIG!
Commit message:  Update from VV — [Zeitstempel]
```

**Screenshot-Referenz:**
- Dropdown "Target branch" → Wähle `figma-tokens`
- Wenn Branch nicht existiert, wird er automatisch erstellt

### **Schritt 2: Tokens aus Figma pushen**

1. Öffne Figma
2. Öffne Variable Visualizer Plugin
3. Klicke "Push to GitHub"
4. Fertig! Plugin pusht zu Branch `figma-tokens`

### **Schritt 3: Pull Request wird automatisch erstellt**

**Was passiert automatisch:**

1. GitHub Actions erkennt den Push zu `figma-tokens`
2. Workflow "Auto PR from Figma Tokens" startet
3. Tokens werden gebaut und validiert
4. Pull Request wird erstellt: `figma-tokens` → `main`

**Du bekommst Benachrichtigung:**
```
🎨 Update design tokens from Figma

Build Status: ✅ Success
Successful Builds: 30/30
Files Changed: 5

[View Pull Request]
```

### **Schritt 4: Pull Request reviewen**

Gehe zu: https://github.com/UXWizard25/vv-token-test-v3/pulls

**Im PR siehst du:**

```markdown
## 🎨 Design Token Update

### ✅ Build Results
- Build Status: Success
- Successful Builds: 30/30
- Warnings: 0

### 📝 Changed Files
Files Changed: 5

src/design-tokens/colormode/light-bild.json
src/design-tokens/colormode/dark-bild.json
...

### 🚀 What Happens After Merge?
When you merge this PR:
1. ✅ Tokens will be rebuilt
2. ✅ Package version will be bumped (patch)
3. ✅ Package will be published to GitHub Packages
4. ✅ GitHub Release will be created
```

**Prüfe:**
- ✅ Build erfolgreich?
- ✅ Richtige Dateien geändert?
- ✅ Bereit zum Veröffentlichen?

### **Schritt 5: Pull Request mergen**

Klicke auf **"Merge pull request"** → **"Confirm merge"**

### **Schritt 6: Automatisches Publishing**

**Was jetzt automatisch passiert:**

1. Workflow "Publish Package on Merge" startet
2. Version wird erhöht (z.B. `1.0.0` → `1.0.1`)
3. Tokens werden gebaut
4. Package wird zu GitHub Packages published
5. GitHub Release wird erstellt
6. Git Tag wird erstellt (z.B. `v1.0.1`)

**Nach ca. 3-4 Minuten:**

✅ **Fertig!** Dein Package ist veröffentlicht!

**Du siehst:**
- 📦 Neues Package in: https://github.com/UXWizard25/vv-token-test-v3/packages
- 📋 Neues Release in: https://github.com/UXWizard25/vv-token-test-v3/releases

---

## 📊 VERSIONIERUNG

### **Automatische Patch-Versionierung**

Jeder Merge erhöht automatisch die Patch-Version:

```
1.0.0 → 1.0.1 → 1.0.2 → 1.0.3 → ...
```

### **Für Minor oder Major Updates:**

Wenn du größere Änderungen hast (neue Features oder Breaking Changes):

**Option A: package.json manuell ändern (vor Merge)**

1. Bearbeite `package.json` im PR:
   ```json
   {
     "version": "1.1.0"  // oder 2.0.0 für Major
   }
   ```
2. Merge PR
3. Workflow nutzt die Version aus package.json

**Option B: Nach Merge manuell erhöhen**

```bash
git checkout main
git pull

# Für Minor Update
npm version minor  # 1.0.5 → 1.1.0

# Für Major Update
npm version major  # 1.1.0 → 2.0.0

git push origin main --tags
```

**Semantic Versioning:**
- **Patch** (1.0.0 → 1.0.1): Bug Fixes, kleine Korrekturen
- **Minor** (1.0.0 → 1.1.0): Neue Tokens, neue Features (kompatibel)
- **Major** (1.0.0 → 2.0.0): Breaking Changes (Token umbenannt, entfernt)

---

## 📥 PACKAGE INSTALLIEREN (In anderen Projekten)

### **Einmalige Konfiguration (pro Projekt)**

Erstelle/bearbeite `.npmrc` im Projekt-Root:

```bash
@uxwizard25:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### **GitHub Token erstellen**

1. Gehe zu: https://github.com/settings/tokens
2. Klicke auf **"Generate new token (classic)"**
3. Name: `npm-packages-read`
4. Aktiviere Scope: **`read:packages`**
5. Klicke auf **"Generate token"**
6. Kopiere das Token (zeigt nur einmal!)

### **Token in .npmrc einfügen**

**Option A: Direkt in .npmrc** (einfach)

```bash
@uxwizard25:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=ghp_DEIN_TOKEN_HIER
```

**Option B: Umgebungsvariable** (sicherer)

In `~/.bashrc` oder `~/.zshrc`:
```bash
export GITHUB_TOKEN="ghp_DEIN_TOKEN_HIER"
```

Dann in `.npmrc`:
```bash
@uxwizard25:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### **Package installieren**

```bash
# Neueste Version
npm install @uxwizard25/design-system-tokens

# Spezifische Version
npm install @uxwizard25/design-system-tokens@1.2.3

# Als Dev Dependency
npm install --save-dev @uxwizard25/design-system-tokens
```

### **Package nutzen**

**CSS importieren:**
```css
/* In deiner main.css */
@import '@uxwizard25/design-system-tokens/css/semantic/bild/color/color-bild-light.css';
```

**SCSS importieren:**
```scss
// In deiner main.scss
@import '@uxwizard25/design-system-tokens/scss/semantic/bild/color/color-bild-light';

.my-button {
  background-color: var(--color-brand-primary);
}
```

**JavaScript/TypeScript:**
```javascript
// Import tokens als JS Modul
import tokens from '@uxwizard25/design-system-tokens/json/semantic/bild/color/color-bild-light.json';

console.log(tokens.color.brand.primary); // "#de0000"

// Oder einzelne Dateien
import bildColors from '@uxwizard25/design-system-tokens/js/semantic/bild/color/color-bild-light.js';
```

**Webpack/Vite:**
```javascript
// In deiner main.js oder main.ts
import '@uxwizard25/design-system-tokens/css/semantic/bild/color/color-bild-light.css';

// CSS wird automatisch in dein Bundle aufgenommen
```

---

## 🤖 DEPENDABOT

Dependabot prüft automatisch jeden Montag (9:00 Uhr) auf Updates:

- NPM Dependencies (style-dictionary, nodemon, etc.)
- GitHub Actions Updates

**Wenn Updates verfügbar:**
1. Dependabot erstellt automatisch Pull Request
2. Du bekommst Benachrichtigung
3. Du reviewst und mergst PR

**Dependabot Kommandos (in PR Kommentaren):**

```bash
@dependabot rebase        # PR rebasen
@dependabot recreate      # PR neu erstellen
@dependabot merge         # Auto-merge
@dependabot close         # PR schließen
@dependabot ignore        # Update ignorieren
```

---

## 🔧 WORKFLOWS ÜBERSICHT

### **Workflow 1: Auto PR from Figma Tokens**
- **Datei:** `.github/workflows/auto-pr-from-figma.yml`
- **Trigger:** Push zu Branch `figma-tokens`
- **Macht:**
  - Baut Tokens
  - Validiert Build
  - Erstellt/Updated Pull Request
  - Zeigt Build-Statistiken

### **Workflow 2: Publish Package on Merge**
- **Datei:** `.github/workflows/publish-on-merge.yml`
- **Trigger:** Push zu `main` (nach PR Merge)
- **Macht:**
  - Erhöht Patch-Version
  - Baut Tokens
  - Published zu GitHub Packages
  - Erstellt GitHub Release
  - Erstellt Git Tag

### **Workflow 3: Build Design Tokens** (optional)
- **Datei:** `.github/workflows/build-tokens.yml`
- **Trigger:** Push auf anderen Branches
- **Macht:**
  - Nur Build & Test
  - Kein Publishing

---

## 🆘 TROUBLESHOOTING

### ❌ Problem: "Pull Request wird nicht erstellt"

**Mögliche Ursachen:**

1. **Falscher Target Branch im VV Plugin**
   - ✅ Lösung: Stelle sicher, dass Target Branch = `figma-tokens` ist

2. **Branch `figma-tokens` existiert nicht**
   - ✅ Lösung: VV Plugin erstellt ihn automatisch beim ersten Push

3. **Workflow läuft nicht**
   - ✅ Lösung: Prüfe GitHub Actions Permissions:
     - Settings → Actions → General
     - "Read and write permissions" aktivieren

### ❌ Problem: "Build schlägt fehl"

**Ursache:** Token-Dateien sind fehlerhaft

**Lösung:**
1. Prüfe Build-Log in GitHub Actions
2. Teste lokal: `npm run build`
3. Fixe Fehler in Figma
4. Pushe nochmal

### ❌ Problem: "Publishing schlägt fehl"

**Mögliche Ursachen:**

1. **Keine Package-Permissions**
   - ✅ Lösung: Settings → Actions → General → "Read and write permissions"

2. **Version existiert bereits**
   - ✅ Lösung: Workflow erhöht Version automatisch, sollte nicht passieren
   - Falls doch: Version in package.json manuell erhöhen

3. **NPM Registry nicht erreichbar**
   - ✅ Lösung: Warte 5 Minuten und pushe nochmal

### ❌ Problem: "Kann Package nicht installieren"

**Ursache:** Keine Authentifizierung oder falscher Token

**Lösung:**
1. Prüfe `.npmrc` Datei:
   ```bash
   cat .npmrc
   ```
2. Prüfe ob Token gültig ist:
   ```bash
   echo $GITHUB_TOKEN
   ```
3. Erstelle neuen Token mit `read:packages` Scope

---

## 📚 ZUSAMMENFASSUNG

### **Tägliche Arbeit:**

1. ✅ Tokens in Figma ändern
2. ✅ Variable Visualizer Plugin → "Push to GitHub"
3. ✅ Warte auf PR (automatisch)
4. ✅ PR reviewen
5. ✅ PR mergen
6. ✅ Fertig! Package automatisch published

### **Kosten:**

💰 **0 EUR** - GitHub Packages ist kostenlos für private Repos!

### **Vorteile:**

- ✅ Komplett automatisiert
- ✅ Kein Git Tag erstellen nötig
- ✅ Kein manuelles Approve
- ✅ Code Review durch PR
- ✅ Nachvollziehbare Versionshistorie
- ✅ Automatische Release Notes

---

## 💡 TIPPS

**✅ DO's:**
- Reviewe jeden PR bevor du mergst
- Schreibe aussagekräftige Commit Messages im VV Plugin
- Teste lokal mit `npm run build` wenn unsicher
- Nutze Semantic Versioning korrekt

**❌ DON'Ts:**
- Nicht direkt zu `main` pushen (immer über `figma-tokens`)
- Version nicht manuell in package.json ändern (außer für Minor/Major)
- PR nicht mergen, wenn Build fehlschlägt

---

## 📞 SUPPORT

**Probleme?**

1. Prüfe die Workflow-Logs in GitHub Actions
2. Lies diese Dokumentation nochmal
3. Erstelle ein Issue: https://github.com/UXWizard25/vv-token-test-v3/issues

---

**Viel Erfolg mit deinem automatisierten Token Publishing! 🚀🎨**
