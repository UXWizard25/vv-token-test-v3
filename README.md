# 🎨 BILD Design System - Token Pipeline

Eine vollständige Token-Pipeline basierend auf **Style Dictionary** für das BILD Design System. Diese Pipeline transformiert Figma-Tokens (exportiert via VariableVisualizer Plugin) in konsumierbare Output-Formate für verschiedene Consuming Layers.

## 📋 Inhaltsverzeichnis

- [Überblick](#überblick)
- [Token-Architektur](#token-architektur)
- [Installation](#installation)
- [Verwendung](#verwendung)
- [Output-Struktur](#output-struktur)
- [Konfiguration](#konfiguration)
- [Entwicklung](#entwicklung)

---

## 🎯 Überblick

Diese Token-Pipeline verarbeitet die Multi-Layer-Architektur des BILD Design Systems:

```
Figma Tokens (JSON)
         ↓
   Preprocessing
         ↓
   Style Dictionary
         ↓
  Output Files (CSS, SCSS, JS, JSON)
```

### Features

✅ **Multi-Layer-Support**: Base → Mapping → Semantic
✅ **Multi-Brand**: BILD, SportBILD, Advertorial
✅ **Multi-Mode**: Light/Dark, Responsive Breakpoints, Density
✅ **Multiple Formate**: CSS, SCSS, JavaScript, TypeScript, JSON
✅ **Alias-Auflösung**: Automatische Referenz-Auflösung zwischen Tokens
✅ **Hot Reload**: Watch-Mode für automatische Builds

---

## 🏗️ Token-Architektur

### Layer-Struktur

Das Design System ist in vier Layers organisiert:

#### 1️⃣ **Base Layer** - Primitive Tokens
Die Grundbausteine ohne Modes (nur "Value").

- **`_ColorPrimitive`**: Basis-Farbpalette
- **`_SpacePrimitive`**: Basis-Abstände
- **`_SizePrimitive`**: Basis-Größen
- **`_FontPrimitive`**: Basis-Typografie

**Output:**
```
dist/base/
  ├── primitive-color-value.css
  ├── primitive-space-value.css
  ├── primitive-size-value.css
  └── primitive-font-value.css
```

#### 2️⃣ **Mapping Layer** - Brand-spezifische Tokens
Verknüpfung der Primitives mit Brand-Identitäten.

- **`BrandTokenMapping`**: Modes: BILD, SportBILD, Advertorial
- **`BrandColorMapping`**: Modes: BILD, SportBILD

**Output:**
```
dist/mapping/
  ├── brand-bild.css
  ├── brand-sportbild.css
  ├── brand-advertorial.css
  ├── brand-color-bild.css
  └── brand-color-sportbild.css
```

#### 3️⃣ **Density Layer** - Dichte-Variationen
Zwischenebene für verschiedene Dichte-Levels.

- **`Density`**: Modes: compact, default, spacious

**Output:**
```
dist/density/
  ├── density-compact.css
  ├── density-default.css
  └── density-spacious.css
```

#### 4️⃣ **Semantic Layer** - Kontext-spezifische Tokens
Die konsumierbare Ebene für Anwendungen.

- **`ColorMode`**: Modes: Light, Dark
- **`BreakpointMode`**: Modes: XS, SM, MD, LG

**Output:**
```
dist/semantic/
  ├── color-light.css
  ├── color-dark.css
  ├── breakpoint-xs.css
  ├── breakpoint-sm.css
  ├── breakpoint-md.css
  └── breakpoint-lg.css
```

---

## 📦 Installation

### Voraussetzungen

- Node.js >= 16.x
- npm >= 8.x

### Setup

```bash
# Dependencies installieren
npm install

# Oder mit pnpm/yarn
pnpm install
yarn install
```

---

## 🚀 Verwendung

### Vollständiger Build

```bash
# 1. Preprocessing: Figma JSON → Token-Dateien
npm run preprocess

# 2. Build: Token-Dateien → Output Files
npm run build:tokens

# Oder beides in einem Schritt:
npm run build
```

### Watch Mode (Entwicklung)

```bash
# Automatischer Rebuild bei Änderungen
npm run watch
```

### Output bereinigen

```bash
npm run clean
```

---

## 📁 Output-Struktur

Nach dem Build enthält das `dist/` Verzeichnis folgende Struktur:

```
dist/
├── manifest.json                    # Übersicht aller generierten Dateien
├── base/                            # Base Layer
│   ├── index.css                    # Sammelt alle Base-Tokens
│   ├── index.scss
│   ├── index.js
│   ├── primitive-color-value.css
│   ├── primitive-color-value.scss
│   ├── primitive-color-value.js
│   ├── primitive-color-value.json
│   └── ...
├── mapping/                         # Mapping Layer
│   ├── index.css
│   ├── brand-bild.css
│   ├── brand-sportbild.css
│   ├── brand-advertorial.css
│   └── ...
├── density/                         # Density Layer
│   ├── index.css
│   ├── density-compact.css
│   ├── density-default.css
│   ├── density-spacious.css
│   └── ...
└── semantic/                        # Semantic Layer
    ├── index.css
    ├── color-light.css
    ├── color-dark.css
    ├── breakpoint-xs.css
    ├── breakpoint-sm.css
    ├── breakpoint-md.css
    ├── breakpoint-lg.css
    └── ...
```

### Datei-Formate

Für jeden Mode werden folgende Formate generiert:

| Format | Verwendung | Beispiel |
|--------|-----------|----------|
| `.css` | CSS Custom Properties mit Data-Attribut-Selector | `:root[data-color="light"]` |
| `-global.css` | CSS Custom Properties für `:root` | Direkte Anwendung |
| `.scss` | SCSS Variables | `$color-primary` |
| `.js` | JavaScript ES6 Module | `import tokens from './color-light.js'` |
| `.d.ts` | TypeScript Definitionen | Type Safety |
| `.json` | Strukturierte JSON | API-Integration |

---

## 🎨 Verwendung in Projekten

### CSS

```css
/* Import einzelner Mode */
@import '@bild-ds/tokens/dist/semantic/color-light.css';
@import '@bild-ds/tokens/dist/semantic/breakpoint-md.css';

/* Oder alle Semantic Tokens */
@import '@bild-ds/tokens/dist/semantic/index.css';

/* Verwendung */
.button {
  background-color: var(--semantic-core-corecolorprimary);
  padding: var(--semantic-spacing-spacing-md);
}
```

### SCSS

```scss
// Import
@import '@bild-ds/tokens/dist/semantic/color-light.scss';

// Verwendung
.button {
  background-color: $semantic-core-corecolorprimary;
  padding: $semantic-spacing-spacing-md;
}
```

### JavaScript/TypeScript

```javascript
// Import
import colorLight from '@bild-ds/tokens/dist/semantic/color-light.js';
import breakpointMd from '@bild-ds/tokens/dist/semantic/breakpoint-md.js';

// Oder alle
import * as semanticTokens from '@bild-ds/tokens/dist/semantic/index.js';

// Verwendung
const primaryColor = colorLight['semantic-core-corecolorprimary'];
```

### React/Styled Components

```jsx
import tokens from '@bild-ds/tokens/dist/semantic/color-light.js';

const Button = styled.button`
  background-color: ${tokens['semantic-core-corecolorprimary']};
  color: ${tokens['semantic-core-corefgonprimary']};
`;
```

---

## ⚙️ Konfiguration

### Preprocessing Anpassungen

Bearbeiten Sie `scripts/preprocess-figma-tokens.js` um:

- Token-Namens-Konventionen anzupassen
- Zusätzliche Transformationen hinzuzufügen
- Filter für spezifische Collections

### Style Dictionary Anpassungen

Bearbeiten Sie `build-config/style-dictionary.config.js` um:

- **Custom Transforms** hinzuzufügen
- **Custom Formats** zu definieren
- **Transform Groups** anzupassen

### Build-Konfiguration

Bearbeiten Sie `scripts/build-tokens.js` um:

- Output-Pfade zu ändern
- Zusätzliche Platforms hinzuzufügen
- Collection-Mappings anzupassen

---

## 🔧 Entwicklung

### Projektstruktur

```
.
├── src/
│   └── design-tokens/
│       └── BILD Design System-variables-full.json    # Figma Export
├── scripts/
│   ├── preprocess-figma-tokens.js                    # Preprocessing
│   └── build-tokens.js                               # Build-Orchestrierung
├── build-config/
│   └── style-dictionary.config.js                    # SD Config & Transforms
├── tokens/                                           # Generiert (gitignore)
│   ├── colormode/
│   ├── breakpointmode/
│   ├── density/
│   └── ...
├── dist/                                             # Generiert (gitignore)
│   ├── base/
│   ├── mapping/
│   ├── density/
│   └── semantic/
├── package.json
└── README.md
```

### Workflow

1. **Figma → Export**
   Exportiere Tokens aus Figma mit VariableVisualizer Plugin

2. **Lege JSON ab**
   Platziere die JSON-Datei in `src/design-tokens/`

3. **Preprocessing**
   `npm run preprocess` transformiert die Struktur

4. **Build**
   `npm run build:tokens` generiert die Output-Files

5. **Konsumieren**
   Importiere die generierten Files in dein Projekt

### Custom Transforms

Füge neue Transforms in `build-config/style-dictionary.config.js` hinzu:

```javascript
StyleDictionary.registerTransform({
  name: 'my-custom-transform',
  type: 'value',
  matcher: (token) => token.type === 'color',
  transformer: (token) => {
    // Deine Transformation
    return transformedValue;
  }
});
```

### Custom Formats

Definiere neue Output-Formate:

```javascript
StyleDictionary.registerFormat({
  name: 'my-custom-format',
  formatter: ({ dictionary, options, file }) => {
    // Generiere deinen Output
    return formattedOutput;
  }
});
```

---

## 📊 Figma Token-Struktur

### Export-Format (VariableVisualizer)

```json
{
  "schemaVersion": 1,
  "collections": [
    {
      "name": "ColorMode",
      "modes": [
        { "name": "Light", "modeId": "588:0" },
        { "name": "Dark", "modeId": "592:1" }
      ],
      "variables": [
        {
          "name": "Semantic/Core/coreColorPrimary",
          "resolvedType": "COLOR",
          "valuesByMode": {
            "588:0": { "type": "VARIABLE_ALIAS", "id": "..." },
            "592:1": { "r": 255, "g": 0, "b": 0, "a": 1 }
          }
        }
      ]
    }
  ]
}
```

### Transformierte Struktur (nach Preprocessing)

```json
{
  "Semantic": {
    "Core": {
      "coreColorPrimary": {
        "value": "{BrandColorMapping.BILD.colorBrand1}",
        "type": "color",
        "comment": "Primary brand color"
      }
    }
  }
}
```

---

## 🧪 Testing

```bash
# Build testen
npm run build

# Output validieren
ls -la dist/semantic/

# Einzelne Datei prüfen
cat dist/semantic/color-light.css
```

---

## 🤝 Contributing

1. Erstelle einen Feature Branch
2. Mache deine Änderungen
3. Teste den kompletten Build
4. Erstelle einen Pull Request

---

## 📝 Lizenz

MIT

---

## 🔗 Ressourcen

- [Style Dictionary Dokumentation](https://amzn.github.io/style-dictionary/)
- [Figma Variables API](https://www.figma.com/plugin-docs/api/properties/figma-variables/)
- [Design Tokens Spezifikation](https://design-tokens.github.io/community-group/)

---

## 🆘 Troubleshooting

### Problem: Preprocessing schlägt fehl

```bash
# Prüfe, ob Figma JSON existiert
ls -la src/design-tokens/

# Prüfe JSON-Format
cat src/design-tokens/*.json | jq .schemaVersion
```

### Problem: Build generiert keine Dateien

```bash
# Prüfe, ob Preprocessing ausgeführt wurde
ls -la tokens/

# Führe Preprocessing manuell aus
npm run preprocess
```

### Problem: Aliases werden nicht aufgelöst

- Prüfe, ob die Variable-IDs in der Figma-JSON korrekt sind
- Stelle sicher, dass alle referenzierten Tokens existieren
- Prüfe die Alias-Lookup-Logik in `preprocess-figma-tokens.js`

---

**Generiert mit ❤️ für das BILD Design System**
