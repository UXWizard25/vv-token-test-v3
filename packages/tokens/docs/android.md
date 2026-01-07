# 🤖 Android Jetpack Compose - Design System Tokens

> **Kotlin-based Design Tokens for Jetpack Compose**
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
- [⚙️ Dependencies](#️-dependencies)
- [📝 Naming Conventions](#-naming-conventions)
- [📖 Related Documentation](#-related-documentation)

---

## 🚀 Quick Start

### 1. Copy Files

```bash
# Copy Compose output to your Android project
cp -r dist/android/compose/* app/src/main/java/com/bild/designsystem/
```

### 2. Set Up Theme (Dual-Axis)

```kotlin
import com.bild.designsystem.shared.DesignSystemTheme
import com.bild.designsystem.shared.ColorBrand
import com.bild.designsystem.shared.ContentBrand
import com.bild.designsystem.shared.WindowSizeClass
import com.bild.designsystem.shared.Density

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            DesignSystemTheme(
                colorBrand = ColorBrand.Bild,        // Color palette
                contentBrand = ContentBrand.Bild,   // Sizing/Typography
                darkTheme = isSystemInDarkTheme(),
                sizeClass = WindowSizeClass.Compact,
                density = Density.Default
            ) {
                MyApp()
            }
        }
    }
}
```

### 3. Use Tokens

```kotlin
@Composable
fun MyScreen() {
    // Semantic Tokens (via Theme) - polymorphic access
    Text(
        text = "Headline",
        color = DesignSystemTheme.colors.textColorPrimary,
        fontSize = DesignSystemTheme.sizing.headline1FontSize
    )

    // Component Tokens (via current() Accessors)
    Button(
        colors = ButtonDefaults.buttonColors(
            containerColor = ButtonTokens.Colors.current().buttonPrimaryBgColorIdle
        )
    ) {
        Text("Click me")
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
│  Axis 1: ColorBrand (Color Palette)                             │
│  ┌──────────────┬──────────────┐                                │
│  │    Bild      │  Sportbild   │   ← Only brands with colors    │
│  └──────────────┴──────────────┘                                │
│                                                                 │
│  Axis 2: ContentBrand (Sizing/Typography)                       │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │    Bild      │  Sportbild   │  Advertorial │  ← All brands   │
│  └──────────────┴──────────────┴──────────────┘                 │
│                                                                 │
│  Combined Usage:                                                │
│  DesignSystemTheme(                                             │
│      colorBrand = ColorBrand.Sportbild,    // SportBILD colors  │
│      contentBrand = ContentBrand.Advertorial // Advert. sizing  │
│  )                                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Why Dual-Axis?

- **Advertorial** has its own sizing/typography but uses BILD or SportBILD colors
- Enables flexible combinations: "Advertorial content styled with SportBILD colors"
- Type-safe polymorphic access via unified interfaces

### Unified Interfaces

All brands implement common interfaces for polymorphic access:

| Interface | Purpose | Implementations |
|-----------|---------|-----------------|
| `DesignColorScheme` | All color tokens | `BildLightColors`, `BildDarkColors`, `SportbildLightColors`, `SportbildDarkColors` |
| `DesignSizingScheme` | All sizing tokens | `BildSizingCompact`, `BildSizingMedium`, `BildSizingExpanded`, `SportbildSizing*`, `AdvertorialSizing*` |
| `DesignTypographyScheme` | All text styles | `BildTypographyCompact`, `BildTypographyMedium`, `BildTypographyExpanded`, `SportbildTypography*`, `AdvertorialTypography*` |
| `DesignEffectsScheme` | All shadow tokens | `EffectsLight`, `EffectsDark` (brand-independent, shared) |
| `DesignDensityScheme` | Density spacing tokens (internal) | `DensityDefault`, `DensityDense`, `DensitySpacious` (brand-independent, shared) |

```kotlin
// Polymorphic access - works with any brand
val colors: DesignColorScheme = DesignSystemTheme.colors
val sizing: DesignSizingScheme = DesignSystemTheme.sizing
val typography: DesignTypographyScheme = DesignSystemTheme.typography
val effects: DesignEffectsScheme = DesignSystemTheme.effects  // Brand-independent

// Access tokens without knowing the specific brand
Text(
    color = colors.textColorPrimary,  // Works for Bild, Sportbild
    style = typography.headline1.toComposeTextStyle()  // Works for all brands
)
```

---

## 🎨 Theme Provider

### DesignSystemTheme (Central Entry Point)

The single, unified theme provider for all brand combinations:

```kotlin
import com.bild.designsystem.shared.DesignSystemTheme
import com.bild.designsystem.shared.ColorBrand
import com.bild.designsystem.shared.ContentBrand
import com.bild.designsystem.shared.WindowSizeClass
import com.bild.designsystem.shared.Density

@Composable
fun MyApp() {
    DesignSystemTheme(
        colorBrand = ColorBrand.Bild,           // or .Sportbild
        contentBrand = ContentBrand.Bild,       // or .Sportbild, .Advertorial
        darkTheme = isSystemInDarkTheme(),
        sizeClass = WindowSizeClass.Compact,    // or .Medium, .Expanded
        density = Density.Default               // or .Dense, .Spacious
    ) {
        // Your app content
    }
}
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `colorBrand` | `ColorBrand` | `Bild` | Color palette (Bild, Sportbild) |
| `contentBrand` | `ContentBrand` | `Bild` | Sizing/Typography (Bild, Sportbild, Advertorial) |
| `darkTheme` | `Boolean` | `isSystemInDarkTheme()` | Light/Dark Mode |
| `sizeClass` | `WindowSizeClass` | `Compact` | Responsive Layout |
| `density` | `Density` | `Default` | UI Density |

### Calculating WindowSizeClass (Material 3)

The Design System uses Material 3 WindowSizeClass breakpoints:

| WindowSizeClass | Width Range | Typical Devices |
|-----------------|-------------|-----------------|
| `Compact` | < 600dp | Phones (portrait) |
| `Medium` | 600dp – 839dp | Small tablets, foldables |
| `Expanded` | ≥ 840dp | Large tablets, desktops |

```kotlin
import androidx.compose.material3.windowsizeclass.calculateWindowSizeClass
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass

@Composable
fun rememberDesignSystemSizeClass(activity: Activity): WindowSizeClass {
    val windowSizeClass = calculateWindowSizeClass(activity)
    return when (windowSizeClass.widthSizeClass) {
        WindowWidthSizeClass.Compact -> WindowSizeClass.Compact
        WindowWidthSizeClass.Medium -> WindowSizeClass.Medium
        WindowWidthSizeClass.Expanded -> WindowSizeClass.Expanded
    }
}
```

---

## 🔑 Token Access

### Semantic Tokens (via DesignSystemTheme)

For global design decisions with polymorphic access:

```kotlin
@Composable
fun SemanticExample() {
    // Colors - automatically Light/Dark, polymorphic type
    val textColor = DesignSystemTheme.colors.textColorPrimary
    val bgColor = DesignSystemTheme.colors.surfaceColorPrimary
    val accentColor = DesignSystemTheme.colors.textColorAccent

    // Sizing - automatically Compact/Medium/Expanded, polymorphic type
    val headlineSize = DesignSystemTheme.sizing.headline1FontSize
    val bodySize = DesignSystemTheme.sizing.bodyFontSize

    // Typography - composite DesignTextStyle objects
    val headlineStyle = DesignSystemTheme.typography.headline1
    Text(
        text = "Hello",
        style = headlineStyle.toComposeTextStyle()
    )

    // Effects/Shadows - brand-independent, only Light/Dark
    val cardShadow = DesignSystemTheme.effects.shadowSoftMd
    Box(modifier = Modifier.then(cardShadow.toModifier())) { ... }

    // Density-Aware Spacing - auto-resolved by WindowSizeClass × Density
    val respSpacing = DesignSystemTheme.stackSpaceRespMd   // Responsive: varies by WindowSizeClass
    val constSpacing = DesignSystemTheme.stackSpaceConstLg // Constant: same across all WindowSizeClasses
    Column(verticalArrangement = Arrangement.spacedBy(respSpacing)) { ... }

    // Query theme state
    val isDark = DesignSystemTheme.isDarkTheme
    val sizeClass = DesignSystemTheme.sizeClass
    val density = DesignSystemTheme.density
    val colorBrand = DesignSystemTheme.colorBrand
    val contentBrand = DesignSystemTheme.contentBrand
}
```

### Component Tokens (via current())

For component-specific tokens with automatic theme selection:

```kotlin
import com.bild.designsystem.bild.components.ButtonTokens
import com.bild.designsystem.bild.components.CardTokens
import com.bild.designsystem.bild.components.MenuTokens

@Composable
fun ComponentExample() {
    // Colors - automatically Light/Dark
    val buttonBg = ButtonTokens.Colors.current().buttonPrimaryBgColorIdle
    val buttonHover = ButtonTokens.Colors.current().buttonPrimaryBgColorHover

    // Sizing - automatically Compact/Medium/Expanded
    val buttonHeight = ButtonTokens.Sizing.current().buttonContentMinHeightSize
    val cardRadius = CardTokens.Sizing.current().cardBorderRadius

    // Typography - composite DesignTextStyle objects (Compact/Medium/Expanded)
    val buttonLabel: DesignTextStyle = ButtonTokens.Typography.current().buttonLabel
    Text(
        text = "Click me",
        style = buttonLabel.toComposeTextStyle()
    )

    // Effects - automatically Light/Dark (for components with shadows)
    val menuShadow = MenuTokens.Effects.current().menuShadow
    Box(modifier = Modifier.then(menuShadow.toModifier())) { ... }

    // Density - automatically Dense/Default/Spacious
    val gap = ButtonTokens.Density.current().denseButtonContentGapSpace
}
```

### Static Access (without Theme)

When you need a specific mode explicitly:

```kotlin
// Direct Light/Dark access
val lightColor = ButtonTokens.Colors.Light.buttonPrimaryBgColorIdle
val darkColor = ButtonTokens.Colors.Dark.buttonPrimaryBgColorIdle

// Direct Compact/Medium/Expanded access
val compactSize = ButtonTokens.Sizing.Compact.buttonLabelFontSize
val mediumSize = ButtonTokens.Sizing.Medium.buttonLabelFontSize
val expandedSize = ButtonTokens.Sizing.Expanded.buttonLabelFontSize

// Direct Dense/Default/Spacious access
val denseGap = ButtonTokens.Density.Dense.denseButtonContentGapSpace
val defaultGap = ButtonTokens.Density.Default.denseButtonContentGapSpace
```

### Primitives (Base Values)

```kotlin
import com.bild.designsystem.shared.DesignTokenPrimitives

// Colors
val red = DesignTokenPrimitives.Colors.bildred
val gray = DesignTokenPrimitives.Colors.bild050

// Spacing
val space2x = DesignTokenPrimitives.Space.space2x
val space4x = DesignTokenPrimitives.Space.space4x

// Sizes
val size4x = DesignTokenPrimitives.Size.size4x
```

---

## 🏷️ Multi-Brand Apps

### Advertorial with Brand Colors

The key use case for Dual-Axis: Advertorial content using another brand's colors:

```kotlin
// Advertorial content with BILD colors
DesignSystemTheme(
    colorBrand = ColorBrand.Bild,
    contentBrand = ContentBrand.Advertorial
) {
    AdvertorialContent()
}

// Advertorial content with SportBILD colors
DesignSystemTheme(
    colorBrand = ColorBrand.Sportbild,
    contentBrand = ContentBrand.Advertorial
) {
    AdvertorialContent()
}
```

### Runtime Brand Switching

```kotlin
@Composable
fun BrandSwitcherDemo() {
    var colorBrand by remember { mutableStateOf(ColorBrand.Bild) }
    var contentBrand by remember { mutableStateOf(ContentBrand.Bild) }

    Column {
        // Color brand selection
        Row {
            ColorBrand.entries.forEach { brand ->
                Button(onClick = { colorBrand = brand }) {
                    Text("Colors: ${brand.name}")
                }
            }
        }

        // Content brand selection
        Row {
            ContentBrand.entries.forEach { brand ->
                Button(onClick = { contentBrand = brand }) {
                    Text("Content: ${brand.name}")
                }
            }
        }

        // Content with selected brands
        DesignSystemTheme(
            colorBrand = colorBrand,
            contentBrand = contentBrand
        ) {
            BrandedContent()
        }
    }
}
```

### White-Label App

```kotlin
// Brands from build config or remote config
val colorBrand = ColorBrand.valueOf(BuildConfig.COLOR_BRAND)
val contentBrand = ContentBrand.valueOf(BuildConfig.CONTENT_BRAND)

DesignSystemTheme(
    colorBrand = colorBrand,
    contentBrand = contentBrand
) {
    MyWhiteLabelApp()
}
```

---

## 📁 File Structure

```
com/bild/designsystem/
├── shared/                              # Brand-independent
│   ├── DesignTokenPrimitives.kt         # All Primitives
│   ├── Density.kt                       # Dense/Default/Spacious
│   ├── WindowSizeClass.kt               # Compact/Medium/Expanded (Material 3)
│   ├── ColorBrand.kt                    # Bild/Sportbild (colors only)
│   ├── ContentBrand.kt                  # Bild/Sportbild/Advertorial (all)
│   ├── DesignColorScheme.kt             # Unified color interface
│   ├── DesignSizingScheme.kt            # Unified sizing interface
│   ├── DesignTypographyScheme.kt        # Unified typography interface
│   ├── DesignTextStyle.kt               # Typography composite type
│   ├── DesignEffectsScheme.kt           # Unified effects interface
│   ├── DropShadow.kt                    # Shadow layer data class
│   ├── ShadowStyle.kt                   # Shadow composite with toModifier()
│   ├── EffectsLight.kt                  # Light mode shadows (brand-independent)
│   ├── EffectsDark.kt                   # Dark mode shadows (brand-independent)
│   └── DesignSystemTheme.kt             # Central Dual-Axis Theme Provider
│
├── bild/                                # Brand: BILD
│   ├── semantic/
│   │   ├── color/
│   │   │   ├── ColorsLight.kt           # BildLightColors : DesignColorScheme
│   │   │   └── ColorsDark.kt            # BildDarkColors
│   │   ├── sizeclass/
│   │   │   ├── SizingCompact.kt         # BildSizingCompact : DesignSizingScheme
│   │   │   ├── SizingMedium.kt          # BildSizingMedium
│   │   │   └── SizingExpanded.kt        # BildSizingExpanded
│   │   └── typography/
│   │       ├── TypographyCompact.kt     # BildTypographyCompact : DesignTypographyScheme
│   │       ├── TypographyMedium.kt      # BildTypographyMedium
│   │       └── TypographyExpanded.kt    # BildTypographyExpanded
│   └── components/
│       ├── Button/
│       │   └── ButtonTokens.kt          # Colors/Sizing/Typography/Density
│       ├── Menu/
│       │   └── MenuTokens.kt            # Colors/Sizing/Typography/Density/Effects
│       └── ... (50+ Components)
│
├── sportbild/                           # Brand: SportBILD
│   └── ... (same structure)
│
└── advertorial/                         # Brand: Advertorial
    └── semantic/                        # No colors (uses ColorBrand)
        ├── sizeclass/                   # Own sizing
        │   ├── SizingCompact.kt
        │   ├── SizingMedium.kt
        │   └── SizingExpanded.kt
        └── typography/                  # Own typography
            ├── TypographyCompact.kt
            ├── TypographyMedium.kt
            └── TypographyExpanded.kt
```

---

## 🔄 Token Type Mapping

Figma token types (`$type`) are automatically mapped to Kotlin types during build:

| Figma `$type` | Kotlin Type | Example Output |
|---------------|-------------|----------------|
| `dimension` | `Dp` | `24.dp` |
| `fontSize` | `TextUnit` | `16.sp` |
| `lineHeight` | `TextUnit` | `24.sp` |
| `letterSpacing` | `TextUnit` | `(-0.5).sp` |
| `fontWeight` | `FontWeight` | `FontWeight.Bold` |
| `number` | `Float` | `4.5f` |
| `fontFamily` | `String` | `"Gotham XNarrow"` |
| `string` | `String` | `"xs/sm/md"` |
| `boolean` | `Boolean` | `true` / `false` |
| `opacity` | `Int` | `50` (0-100 %) |
| `color` | `Color` | `Color(0xFFDD0000)` |
| `shadow` | `ShadowStyle` | (composite type with multiple `DropShadow` layers) |
| `typography` | `DesignTextStyle` | (composite type with font properties) |

### Example Generated Code

```kotlin
// Interface declaration (automatically typed from $type)
interface BildSizingScheme {
    val headline1FontSize: TextUnit     // $type: fontSize
    val bodyFontFamily: String          // $type: fontFamily
    val breakpointName: String          // $type: string
    val gridSpaceRespLg: Dp             // $type: dimension
}

// Implementation with correctly typed values
object BildSizingCompact : BildSizingScheme {
    override val headline1FontSize = 48.sp
    override val bodyFontFamily = "Gotham XNarrow"
    override val breakpointName = "sm"
    override val gridSpaceRespLg = 24.dp
}
```

---

## 📚 API Reference

### Shared Enums

```kotlin
package com.bild.designsystem.shared

// Dual-Axis Brand Enums
enum class ColorBrand {
    Bild,       // BILD color palette
    Sportbild   // SportBILD color palette
}

enum class ContentBrand {
    Bild,        // BILD sizing/typography
    Sportbild,   // SportBILD sizing/typography
    Advertorial  // Advertorial sizing/typography (uses ColorBrand for colors)
}

// Other Enums
enum class Density {
    Dense,      // Compact UI
    Default,    // Standard
    Spacious    // Generous UI
}

enum class WindowSizeClass {
    Compact,    // Phones (Portrait) - width < 600dp
    Medium,     // Small Tablets, Foldables - 600dp ≤ width < 840dp
    Expanded    // Large Tablets, Desktops - width ≥ 840dp
}
```

### Unified Interfaces

```kotlin
package com.bild.designsystem.shared

// Polymorphic color access
@Stable
interface DesignColorScheme {
    val textColorPrimary: Color
    val textColorSecondary: Color
    val surfaceColorPrimary: Color
    // ... 80+ color properties
}

// Polymorphic sizing access
@Stable
interface DesignSizingScheme {
    val gridSpaceRespBase: Dp
    val headline1FontSize: TextUnit
    // ... 180+ sizing properties
}

// Polymorphic typography access (composite DesignTextStyle objects)
@Stable
interface DesignTypographyScheme {
    val headline1: DesignTextStyle
    val headline2: DesignTextStyle
    val body: DesignTextStyle
    // ... 30+ text style properties
}

// Polymorphic effects access (brand-independent shadows)
@Stable
interface DesignEffectsScheme {
    val shadowSoftSm: ShadowStyle
    val shadowSoftMd: ShadowStyle
    val shadowSoftLg: ShadowStyle
    val shadowSoftXl: ShadowStyle
    val shadowHardSm: ShadowStyle
    val shadowHardMd: ShadowStyle
    val shadowHardLg: ShadowStyle
    val shadowHardXl: ShadowStyle
}

// Internal density scheme (brand-independent, not exposed to consumers)
// Consumers should use BreakpointMode resolver properties instead
@Stable
interface DesignDensityScheme {
    // Constant spacing (same across all WindowSizeClasses)
    val densityStackSpaceConst3xs: Dp
    val densityStackSpaceConst2xs: Dp
    val densityStackSpaceConstXs: Dp
    // ... 28 total density tokens
    // Responsive spacing (varies by WindowSizeClass)
    val densityXsStackSpaceRespMd: Dp
    val densitySmStackSpaceRespMd: Dp
    val densityMdStackSpaceRespMd: Dp
    val densityLgStackSpaceRespMd: Dp
    // ...
}
```

### Composite Types

```kotlin
// Typography composite - use .toComposeTextStyle() for Text composable
@Immutable
data class DesignTextStyle(
    val fontFamily: String,
    val fontWeight: FontWeight,
    val fontSize: TextUnit,
    val lineHeight: TextUnit,
    val letterSpacing: TextUnit,
    val textCase: DesignTextCase,
    val textDecoration: TextDecoration
) {
    fun toComposeTextStyle(): TextStyle
}

// Shadow composite - use .toModifier() to apply shadows
@Immutable
data class ShadowStyle(val layers: List<DropShadow>) {
    fun toModifier(): Modifier
}

@Immutable
data class DropShadow(
    val color: Color,
    val offsetX: Float,
    val offsetY: Float,
    val blur: Float,
    val spread: Float
)
```

### Theme Object

```kotlin
object DesignSystemTheme {
    val colors: DesignColorScheme          // Current colors (polymorphic)
    val sizing: DesignSizingScheme         // Current sizing (polymorphic)
    val typography: DesignTypographyScheme // Current typography (polymorphic)
    val effects: DesignEffectsScheme       // Current effects (brand-independent)
    val density: Density                   // Current density mode
    val sizeClass: WindowSizeClass         // Current size class
    val isDarkTheme: Boolean               // Is dark mode active?
    val colorBrand: ColorBrand             // Current color brand
    val contentBrand: ContentBrand         // Current content brand

    // Density-Aware Spacing (Consumer API) - use these, NOT densitySpacing directly
    // Responsive spacing: varies by WindowSizeClass × Density
    val stackSpaceRespSm: Dp               // Resolves density token per WindowSizeClass
    val stackSpaceRespMd: Dp
    val stackSpaceRespLg: Dp
    val stackSpaceRespXl: Dp
    val stackSpaceResp2xl: Dp
    // Constant spacing: same across all WindowSizeClasses, varies by Density only
    val stackSpaceConst3xs: Dp
    val stackSpaceConst2xs: Dp
    val stackSpaceConstXs: Dp
    val stackSpaceConstSm: Dp
    val stackSpaceConstMd: Dp
    val stackSpaceConstLg: Dp
    val stackSpaceConstXl: Dp
    val stackSpaceConst2xl: Dp

    internal val densitySpacing: DesignDensityScheme  // Internal - not for direct use
}
```

> **Important - Single Entry Point Pattern:** Density-aware spacing tokens (`stackSpaceRespMd`, `stackSpaceConstLg`, etc.) are **NOT** part of `DesignSizingScheme`. They are only accessible via `DesignSystemTheme` resolvers, which perform the `WindowSizeClass × Density` matrix lookup internally. This ensures consistent density behavior across the application.

### Component Token Accessors

```kotlin
// Standard component (most components have Colors, Sizing, Typography, Density)
object ButtonTokens {
    object Colors {
        fun current(): ColorTokens    // Theme-aware (Light/Dark)
        object Light : ColorTokens
        object Dark : ColorTokens
    }
    object Sizing {
        fun current(): SizingTokens   // Theme-aware (Compact/Medium/Expanded)
        object Compact : SizingTokens
        object Medium : SizingTokens
        object Expanded : SizingTokens
    }
    object Typography {
        fun current(): TypographyTokens  // Theme-aware (Compact/Medium/Expanded)
        object Compact : TypographyTokens
        object Medium : TypographyTokens
        object Expanded : TypographyTokens
    }
    object Density {
        fun current(): DensityTokens  // Theme-aware (Dense/Default/Spacious)
        object Dense : DensityTokens
        object Default : DensityTokens
        object Spacious : DensityTokens
    }
}

// Components with Effects (Menu, Alert, Teaser, etc.)
object MenuTokens {
    object Colors { ... }
    object Sizing { ... }
    object Typography { ... }
    object Effects {
        fun current(): EffectsTokens  // Theme-aware (Light/Dark)
        object Light : EffectsTokens
        object Dark : EffectsTokens

        interface EffectsTokens {
            val menuShadow: ShadowStyle
            val heyInputShadow: ShadowStyle
        }
    }
}
```

---

## ✅ Best Practices

### 1. Use Dual-Axis for Advertorial

```kotlin
// ✅ Correct: Advertorial with explicit color brand
DesignSystemTheme(
    colorBrand = ColorBrand.Bild,
    contentBrand = ContentBrand.Advertorial
) { ... }

// ❌ Avoid: Assuming Advertorial has its own colors
```

### 2. Prefer Polymorphic Access

```kotlin
// ✅ Polymorphic - works with any brand combination
val color = DesignSystemTheme.colors.textColorPrimary

// ⚠️ Brand-specific - only when you explicitly need brand-specific behavior
val bildColor = BildLightColors.textColorPrimary
```

### 3. Use current() for Automatic Selection

```kotlin
// ✅ Theme-aware - adapts automatically
val color = ButtonTokens.Colors.current().buttonPrimaryBgColorIdle

// ⚠️ Static - only when you explicitly need a specific mode
val lightColor = ButtonTokens.Colors.Light.buttonPrimaryBgColorIdle
```

### 4. WindowSizeClass for Responsive Layouts (Material 3)

```kotlin
@Composable
fun ResponsiveLayout() {
    when (DesignSystemTheme.sizeClass) {
        WindowSizeClass.Compact -> PhoneLayout()
        WindowSizeClass.Medium -> SmallTabletLayout()
        WindowSizeClass.Expanded -> LargeTabletLayout()
    }
}
```

---

## ⚙️ Dependencies

```kotlin
// build.gradle.kts
dependencies {
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.runtime:runtime")
    implementation("androidx.compose.ui:ui")

    // Optional for WindowSizeClass calculation
    implementation("androidx.compose.material3:material3-window-size-class")
}
```

---

## 📝 Naming Conventions

Kotlin tokens use **camelCase** with lowercase letters after numbers:

| Token Type | Example | Pattern |
|------------|---------|---------|
| Spacing | `space1x`, `space2x` | Lowercase after numbers |
| Decimal spacing | `space0p5x`, `space1p25x` | Decimals use `p` for point |
| Colors | `bildred`, `alphaRed50a80` | Lowercase after numbers |
| Typography | `headline1`, `body` | Standard camelCase |
| Effects | `shadowSoftSm`, `shadowHardMd` | Capitalized abbreviations (Sm, Md, Lg) |

### Format-Agnostic Input

The build system normalizes any Figma input format to consistent output:

```kotlin
// All these Figma inputs produce the same Kotlin output:
// "space1x", "space-1-x", "space_1_x" → space1x
// "shadowSoftSM", "shadow-soft-sm" → shadowSoftSm

// Accessing tokens
DesignTokenPrimitives.Space.space1x      // Dp
DesignTokenPrimitives.Space.space2x      // Dp
DesignSystemTheme.effects.shadowSoftSm   // ShadowStyle
DesignSystemTheme.sizing.gridSpaceRespBase // Dp
```

> **Note:** This ensures consistency regardless of how tokens are named in Figma.

---

## 📖 Related Documentation

| Document | Description |
|----------|-------------|
| [CSS](./css.md) | CSS Custom Properties & Shadow DOM |
| [JavaScript/React](./js.md) | ESM tokens with React ThemeProvider |
| [iOS SwiftUI](./ios.md) | Swift tokens for SwiftUI |
| [Tokens README](../README.md) | Token pipeline overview |
| [Main README](../../README.md) | Project overview |
| [CLAUDE.md](../../CLAUDE.md) | Architecture & build details |
