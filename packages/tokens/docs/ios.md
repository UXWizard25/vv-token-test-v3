# 🍎 iOS SwiftUI - Design System Tokens

> **Swift-based Design Tokens for SwiftUI**
>
> Type-safe, theme-aware, multi-brand ready with **Dual-Axis Architecture**.

---

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🔀 Dual-Axis Architecture](#-dual-axis-architecture)
- [🎨 Theme Provider](#-theme-provider)
- [🔑 Token Access](#-token-access)
- [🏷️ Multi-Brand Apps](#️-multi-brand-apps)
- [📁 File Structure](#-file-structure)
- [🔄 Token Type Mapping](#-token-type-mapping)
- [📚 API Reference](#-api-reference)
- [✅ Best Practices](#-best-practices)
- [🌑 Shadow Support](#-shadow-support)
- [⚙️ Requirements](#️-requirements)
- [📝 Naming Conventions](#-naming-conventions)
- [📖 Related Documentation](#-related-documentation)

---

## 🚀 Quick Start

### 1. Copy Files

```bash
# Copy iOS output to your Xcode project
cp -r dist/ios/* YourProject/Sources/DesignSystem/
```

### 2. Set Up Theme (Dual-Axis)

```swift
import SwiftUI

struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .designSystemTheme(
                    colorBrand: .bild,        // Color palette
                    contentBrand: .bild,      // Sizing/Typography
                    darkTheme: false,
                    sizeClass: .compact,
                    density: .default
                )
        }
    }
}
```

### 3. Use Tokens

```swift
import SwiftUI

struct MyView: View {
    @Environment(\.designSystemTheme) var theme

    var body: some View {
        VStack {
            // Semantic Tokens (via Theme) - polymorphic access
            Text("Headline")
                .foregroundColor(theme.colors.textColorPrimary)
                .textStyle(theme.typography.headline1)  // Typography

            // Typography with TextStyle composite
            Text("Body text")
                .textStyle(theme.typography.body)

            // Component Tokens (via current accessors)
            Button("Click me") { }
                .background(ButtonTokens.Colors.light.buttonPrimaryBrandBgColorIdle)
        }
    }
}
```

---

## 🔀 Dual-Axis Architecture

The design system uses a **Dual-Axis Architecture** that separates color selection from content selection:

```
┌─────────────────────────────────────────────────────────────────┐
│  DUAL-AXIS THEME ARCHITECTURE                                   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Axis 1: ColorBrand (Color Palette + Effects)                   │
│  ┌──────────────┬──────────────┐                                │
│  │    .bild     │  .sportbild  │   ← Only brands with colors    │
│  └──────────────┴──────────────┘                                │
│                                                                 │
│  Axis 2: ContentBrand (Sizing/Typography)                       │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │    .bild     │  .sportbild  │ .advertorial │  ← All brands   │
│  └──────────────┴──────────────┴──────────────┘                 │
│                                                                 │
│  Combined Usage:                                                │
│  .designSystemTheme(                                            │
│      colorBrand: .sportbild,    // SportBILD colors             │
│      contentBrand: .advertorial // Advertorial sizing           │
│  )                                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Why Dual-Axis?

- **Advertorial** has its own sizing/typography but uses BILD or SportBILD colors
- Enables flexible combinations: "Advertorial content styled with SportBILD colors"
- Type-safe polymorphic access via unified protocols

### Unified Protocols

All brands conform to common protocols for polymorphic access:

| Protocol | Purpose | Property Count | Conforming Types |
|----------|---------|----------------|------------------|
| `DesignColorScheme` | All color tokens | 80+ colors | `BildLightColors`, `BildDarkColors`, `SportbildLightColors`, `SportbildDarkColors` |
| `DesignSizingScheme` | All sizing tokens | 180+ values | `BildSizingCompact`, `BildSizingRegular`, `SportbildSizing*`, `AdvertorialSizing*` |
| `DesignTypographyScheme` | All text styles (TextStyle composites) | 37 styles | `BildTypographyCompact`, `BildTypographyRegular`, `SportbildTypography*`, `AdvertorialTypography*` |
| `DesignEffectsScheme` | Shadow/Effect tokens | 8 shadows | `EffectsLight`, `EffectsDark` (brand-independent) |

```swift
// Polymorphic access - works with any brand
let colors: any DesignColorScheme = theme.colors
let sizing: any DesignSizingScheme = theme.sizing
let typography: any DesignTypographyScheme = theme.typography
let effects: any DesignEffectsScheme = theme.effects

// Access tokens without knowing the specific brand
Text("Hello")
    .foregroundColor(colors.textColorPrimary)  // Works for Bild, Sportbild
    .textStyle(typography.headline1)           // TextStyle composite
```

---

## 🎨 Theme Provider

### DesignSystemTheme (Central Entry Point)

The unified theme provider using `@Observable`:

```swift
import SwiftUI

// Singleton access
let theme = DesignSystemTheme.shared

// Or create custom instance
let customTheme = DesignSystemTheme(
    colorBrand: .bild,
    contentBrand: .bild,
    isDarkTheme: false,
    sizeClass: .compact,
    density: .default
)
```

### View Modifier

Apply theme to view hierarchy:

```swift
struct ContentView: View {
    var body: some View {
        MyContent()
            .designSystemTheme(
                colorBrand: .bild,           // or .sportbild
                contentBrand: .bild,         // or .sportbild, .advertorial
                darkTheme: colorScheme == .dark,
                sizeClass: .compact,         // or .regular
                density: .default            // or .dense, .spacious
            )
    }
}
```

### Environment Access

```swift
struct MyView: View {
    @Environment(\.designSystemTheme) var theme

    var body: some View {
        Text("Hello")
            .foregroundColor(theme.colors.textColorPrimary)
    }
}
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `colorBrand` | `ColorBrand` | `.bild` | Color palette (.bild, .sportbild) |
| `contentBrand` | `ContentBrand` | `.bild` | Sizing/Typography (.bild, .sportbild, .advertorial) |
| `isDarkTheme` | `Bool` | `false` | Light/Dark Mode |
| `sizeClass` | `SizeClass` | `.compact` | Responsive Layout |
| `density` | `Density` | `.default` | UI Density |

### Adapting to iOS Size Classes

```swift
import SwiftUI

struct AdaptiveView: View {
    @Environment(\.horizontalSizeClass) var horizontalSizeClass

    var designSizeClass: SizeClass {
        horizontalSizeClass == .compact ? .compact : .regular
    }

    var body: some View {
        MyContent()
            .designSystemTheme(
                colorBrand: .bild,
                contentBrand: .bild,
                sizeClass: designSizeClass
            )
    }
}
```

---

## 🔑 Token Access

### Semantic Tokens (via Theme)

For global design decisions with polymorphic access:

```swift
struct SemanticExample: View {
    @Environment(\.designSystemTheme) var theme

    var body: some View {
        VStack {
            // Colors - automatically Light/Dark, polymorphic type
            Text("Primary")
                .foregroundColor(theme.colors.textColorPrimary)

            Text("Accent")
                .foregroundColor(theme.colors.textColorAccent)

            Rectangle()
                .fill(theme.colors.surfaceColorPrimary)

            // Typography - polymorphic access via unified protocol
            Text("Headline")
                .textStyle(theme.typography.headline1)

            Text("Body text with full typography styling")
                .textStyle(theme.typography.body)

            // Individual TextStyle properties
            let style = theme.typography.headline1
            Text("Custom")
                .font(style.font())
                .tracking(style.letterSpacing)

            // Effects - automatically Light/Dark
            RoundedRectangle(cornerRadius: 8)
                .shadow(theme.effects.shadowSoftMd)

            // Query theme state
            let isDark = theme.isDarkTheme
            let sizeClass = theme.sizeClass
            let colorBrand = theme.colorBrand
            let contentBrand = theme.contentBrand
        }
    }
}
```

### Component Tokens

For component-specific tokens:

```swift
import SwiftUI

struct ComponentExample: View {
    @Environment(\.designSystemTheme) var theme

    var body: some View {
        VStack {
            // Colors - specify Light/Dark explicitly or use theme
            let buttonBg = ButtonTokens.Colors.current(isDark: theme.isDarkTheme)
                .buttonPrimaryBrandBgColorIdle

            // Or access directly
            let lightColor = ButtonTokens.Colors.light.buttonPrimaryBrandBgColorIdle
            let darkColor = ButtonTokens.Colors.dark.buttonPrimaryBrandBgColorIdle

            // Sizing - specify Compact/Regular
            let buttonSizing = ButtonTokens.Sizing.current(sizeClass: theme.sizeClass)

            // Typography
            let typography = ButtonTokens.Typography.current(sizeClass: theme.sizeClass)

            // Density
            let density = ButtonTokens.Density.current(for: theme.density)
        }
    }
}
```

### Static Access

When you need a specific mode explicitly:

```swift
// Direct Light/Dark access
let lightColor = ButtonTokens.Colors.light.buttonPrimaryBrandBgColorIdle
let darkColor = ButtonTokens.Colors.dark.buttonPrimaryBrandBgColorIdle

// Direct Compact/Regular access
let compactSize = ButtonTokens.Sizing.compact.buttonHeight
let regularSize = ButtonTokens.Sizing.regular.buttonHeight

// Direct Density access
let denseGap = ButtonTokens.Density.dense.contentGap
let defaultGap = ButtonTokens.Density.default.contentGap
```

### Primitives (Base Values)

```swift
import SwiftUI

// Colors
let red = DesignTokenPrimitives.Colors.bildred
let gray = DesignTokenPrimitives.Colors.bild050

// Spacing
let space2x = DesignTokenPrimitives.Space.space2x  // CGFloat
let space4x = DesignTokenPrimitives.Space.space4x

// Sizes
let size4x = DesignTokenPrimitives.Size.size4x  // CGFloat

// Fonts
let fontFamily = DesignTokenPrimitives.Font.gothamXNarrow
```

---

## 🏷️ Multi-Brand Apps

### Advertorial with Brand Colors

The key use case for Dual-Axis: Advertorial content using another brand's colors:

```swift
// Advertorial content with BILD colors
ContentView()
    .designSystemTheme(
        colorBrand: .bild,
        contentBrand: .advertorial
    )

// Advertorial content with SportBILD colors
ContentView()
    .designSystemTheme(
        colorBrand: .sportbild,
        contentBrand: .advertorial
    )
```

### Runtime Brand Switching

```swift
struct BrandSwitcherDemo: View {
    @State private var colorBrand: ColorBrand = .bild
    @State private var contentBrand: ContentBrand = .bild

    var body: some View {
        VStack {
            // Color brand picker
            Picker("Colors", selection: $colorBrand) {
                ForEach(ColorBrand.allCases, id: \.self) { brand in
                    Text(brand.rawValue.capitalized).tag(brand)
                }
            }

            // Content brand picker
            Picker("Content", selection: $contentBrand) {
                ForEach(ContentBrand.allCases, id: \.self) { brand in
                    Text(brand.rawValue.capitalized).tag(brand)
                }
            }

            // Themed content
            BrandedContent()
                .designSystemTheme(
                    colorBrand: colorBrand,
                    contentBrand: contentBrand
                )
        }
    }
}
```

### White-Label App

```swift
struct WhiteLabelApp: App {
    // Brand from configuration
    let colorBrand = ColorBrand(rawValue: Config.colorBrand) ?? .bild
    let contentBrand = ContentBrand(rawValue: Config.contentBrand) ?? .bild

    var body: some Scene {
        WindowGroup {
            ContentView()
                .designSystemTheme(
                    colorBrand: colorBrand,
                    contentBrand: contentBrand
                )
        }
    }
}
```

---

## 📁 File Structure

```
DesignSystem/
├── shared/                              # Brand-independent
│   ├── DesignTokenPrimitives.swift      # All Primitives (Colors, Space, Size, Font)
│   ├── Enums.swift                      # Density, SizeClass, ColorBrand, ContentBrand
│   ├── DesignSystemTheme.swift          # Central Dual-Axis Theme Provider
│   ├── Color+Hex.swift                  # Color extension for hex init
│   ├── ShadowStyle.swift                # Shadow value type
│   └── TextStyle.swift                  # Typography value type
│
├── brands/
│   ├── bild/                            # Brand: BILD
│   │   ├── semantic/
│   │   │   ├── color/
│   │   │   │   ├── ColorsLight.swift    # BildLightColors : DesignColorScheme
│   │   │   │   └── ColorsDark.swift     # BildDarkColors : DesignColorScheme
│   │   │   ├── sizeclass/
│   │   │   │   ├── SizingCompact.swift  # BildSizingCompact : DesignSizingScheme
│   │   │   │   └── SizingRegular.swift  # BildSizingRegular : DesignSizingScheme
│   │   │   └── effects/
│   │   │       ├── EffectsLight.swift   # BildEffectsLight : DesignEffectsScheme
│   │   │       └── EffectsDark.swift    # BildEffectsDark : DesignEffectsScheme
│   │   └── components/
│   │       ├── Button/
│   │       │   └── ButtonTokens.swift   # Colors/Sizing/Typography/Density
│   │       ├── Card/
│   │       │   └── CardTokens.swift
│   │       └── ... (50+ Components)
│   │
│   ├── sportbild/                       # Brand: SportBILD
│   │   └── ... (same structure)
│   │
│   └── advertorial/                     # Brand: Advertorial
│       └── semantic/                    # No colors (uses ColorBrand)
│           └── sizeclass/               # Own sizing only
│               ├── SizingCompact.swift
│               └── SizingRegular.swift
```

---

## 🔄 Token Type Mapping

Figma token types (`$type`) are automatically mapped to Swift types during build:

| Figma `$type` | Swift Type | Example Output |
|---------------|------------|----------------|
| `dimension` | `CGFloat` | `24` |
| `fontSize` | `CGFloat` | `16` |
| `lineHeight` | `CGFloat` | `24` |
| `letterSpacing` | `CGFloat` | `-0.5` |
| `fontWeight` | `CGFloat` | `700` |
| `number` | `CGFloat` | `4.5` |
| `fontFamily` | `String` | `"Gotham XNarrow"` |
| `string` | `String` | `"xs/sm/md"` |
| `boolean` | `Bool` | `true` / `false` |
| `opacity` | `CGFloat` | `0.8` (0-1 decimal) |
| `color` | `Color` | `Color(hex: 0xDD0000)` |
| `shadow` | `ShadowStyle` | (composite type) |
| `typography` | `TextStyle` | (composite type) |

> **Note:** Opacity tokens use `CGFloat` (0-1 decimal) in Swift protocols. The per-token type detection ensures correct type mapping for all tokens, including opacity tokens in component color sections.

### Example Generated Code

```swift
// Protocol declaration (automatically typed from $type)
public protocol BildSizingScheme: Sendable {
    var headline1FontSize: CGFloat { get }   // $type: fontSize
    var bodyFontFamily: String { get }       // $type: fontFamily
    var breakpointName: String { get }       // $type: string
}

// Implementation with correctly typed values
public struct BildSizingCompact: BildSizingScheme {
    public let headline1FontSize: CGFloat = 48
    public let bodyFontFamily: String = "Gotham XNarrow"
    public let breakpointName: String = "sm"
}
```

---

## 📚 API Reference

### Enums

```swift
/// Color brands - defines the color palette and effects
public enum ColorBrand: String, CaseIterable, Sendable {
    case bild
    case sportbild
    // Note: Advertorial uses BILD or SportBILD colors
}

/// Content brands - defines sizing, typography, and layout tokens
public enum ContentBrand: String, CaseIterable, Sendable {
    case bild
    case sportbild
    case advertorial
}

/// UI density modes
public enum Density: String, CaseIterable, Sendable {
    case dense
    case `default`
    case spacious
}

/// Size class for responsive layouts (maps to iOS horizontalSizeClass)
public enum SizeClass: String, CaseIterable, Sendable {
    case compact   // Phones (Portrait)
    case regular   // Tablets, Phones (Landscape)
}
```

### Unified Protocols

```swift
/// Unified color scheme protocol
public protocol DesignColorScheme: Sendable {
    var textColorPrimary: Color { get }
    var textColorSecondary: Color { get }
    var surfaceColorPrimary: Color { get }
    var coreColorPrimary: Color { get }
    // ... 20+ color properties
}

/// Unified sizing scheme protocol
public protocol DesignSizingScheme: Sendable {
    var gridSpaceRespBase: CGFloat { get }
    var gridSpaceRespSm: CGFloat { get }
    var sectionSpaceBase: CGFloat { get }
    var pageInlineSpace: CGFloat { get }
    // ... sizing properties
}

/// Unified typography scheme protocol
public protocol DesignTypographyScheme: Sendable {
    var display1: TextStyle { get }
    var headline1: TextStyle { get }
    var body: TextStyle { get }
    var label1: TextStyle { get }
    // ... 37 text style properties
}

/// Unified effects scheme protocol
public protocol DesignEffectsScheme: Sendable {
    var shadowSoftSm: ShadowStyle { get }
    var shadowSoftMd: ShadowStyle { get }
    var shadowSoftLg: ShadowStyle { get }
    // ... effect properties
}
```

### Theme Class

```swift
@Observable
public final class DesignSystemTheme: @unchecked Sendable {
    // Singleton
    public static let shared: DesignSystemTheme

    // Theme State
    public var colorBrand: ColorBrand
    public var contentBrand: ContentBrand
    public var isDarkTheme: Bool
    public var sizeClass: SizeClass
    public var density: Density

    // Computed Accessors (polymorphic)
    public var colors: any DesignColorScheme      // Based on colorBrand + isDarkTheme
    public var sizing: any DesignSizingScheme     // Based on contentBrand + sizeClass
    public var typography: any DesignTypographyScheme  // Based on contentBrand + sizeClass
    public var effects: any DesignEffectsScheme   // Based on isDarkTheme (brand-independent)
}
```

### Component Token Pattern

```swift
public enum ButtonTokens {

    // MARK: - Colors
    public protocol ButtonColorTokens: Sendable {
        var buttonPrimaryBrandBgColorIdle: Color { get }
        var buttonPrimaryBrandBgColorHover: Color { get }
        // ...
    }

    public enum Colors {
        public static func current(isDark: Bool) -> any ButtonColorTokens
        public static var light: Light
        public static var dark: Dark

        public struct Light: ButtonColorTokens { ... }
        public struct Dark: ButtonColorTokens { ... }
    }

    // MARK: - Sizing
    public protocol ButtonSizingTokens: Sendable {
        var buttonHeight: CGFloat { get }
        // ...
    }

    public enum Sizing {
        public static func current(sizeClass: SizeClass) -> any ButtonSizingTokens
        public static var compact: Compact
        public static var regular: Regular

        public struct Compact: ButtonSizingTokens { ... }
        public struct Regular: ButtonSizingTokens { ... }
    }

    // MARK: - Typography
    public enum Typography { ... }

    // MARK: - Density
    public enum Density { ... }
}
```

---

## ✅ Best Practices

### 1. Use Dual-Axis for Advertorial

```swift
// ✅ Correct: Advertorial with explicit color brand
.designSystemTheme(
    colorBrand: .bild,
    contentBrand: .advertorial
)

// ❌ Avoid: Assuming Advertorial has its own colors
```

### 2. Prefer Polymorphic Access

```swift
// ✅ Polymorphic - works with any brand combination
let color = theme.colors.textColorPrimary

// ⚠️ Brand-specific - only when you explicitly need brand-specific behavior
let bildColor = BildLightColors.shared.textColorPrimary
```

### 3. Use Environment for Theme

```swift
// ✅ Use Environment in views
struct MyView: View {
    @Environment(\.designSystemTheme) var theme

    var body: some View {
        Text("Hello")
            .foregroundColor(theme.colors.textColorPrimary)
    }
}
```

### 4. Adapt to iOS Size Classes

```swift
// ✅ Map iOS horizontalSizeClass to design system SizeClass
@Environment(\.horizontalSizeClass) var horizontalSizeClass

var sizeClass: SizeClass {
    horizontalSizeClass == .compact ? .compact : .regular
}
```

---

## 🌑 Shadow Support

Shadows use the custom `ShadowStyle` type:

```swift
public struct ShadowStyle: Sendable {
    public let color: Color
    public let radius: CGFloat
    public let x: CGFloat
    public let y: CGFloat
}

// View extension for easy application
extension View {
    func shadow(_ style: ShadowStyle) -> some View {
        self.shadow(
            color: style.color,
            radius: style.radius,
            x: style.x,
            y: style.y
        )
    }
}

// Usage
RoundedRectangle(cornerRadius: 8)
    .shadow(theme.effects.shadowSoftMd)
```

---

## ⚙️ Requirements

- iOS 17.0+ (for `@Observable`)
- Swift 5.9+
- SwiftUI

---

## 📝 Naming Conventions

Swift tokens use **camelCase** with lowercase letters after numbers:

| Token Type | Example | Pattern |
|------------|---------|---------|
| Spacing | `space1x`, `space2x` | Lowercase after numbers |
| Decimal spacing | `space0p5x`, `space1p25x` | Decimals use `p` for point |
| Colors | `bildred`, `alphaRed50a80` | Lowercase after numbers |
| Typography | `headline1`, `body` | Standard camelCase |
| Effects | `shadowSoftSm`, `shadowHardMd` | Capitalized abbreviations (Sm, Md, Lg) |

### Format-Agnostic Input

The build system normalizes any Figma input format to consistent output:

```swift
// All these Figma inputs produce the same Swift output:
// "space1x", "space-1-x", "space_1_x" → space1x
// "shadowSoftSM", "shadow-soft-sm" → shadowSoftSm

// Accessing tokens
DesignTokenPrimitives.Space.space1x      // 8.0 (CGFloat)
DesignTokenPrimitives.Space.space2x      // 16.0 (CGFloat)
theme.effects.shadowSoftSm               // ShadowStyle
theme.sizing.gridSpaceRespBase           // CGFloat
```

> **Note:** This ensures consistency regardless of how tokens are named in Figma.

---

## 📖 Related Documentation

| Document | Description |
|----------|-------------|
| [CSS](./css.md) | CSS Custom Properties & Shadow DOM |
| [JavaScript/React](./js.md) | ESM tokens with React ThemeProvider |
| [Android Compose](./android.md) | Kotlin tokens for Jetpack Compose |
| [Tokens README](../README.md) | Token pipeline overview |
| [Main README](../../README.md) | Project overview |
| [CLAUDE.md](../../CLAUDE.md) | Architecture & build details |
