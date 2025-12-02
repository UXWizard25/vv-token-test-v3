# Android Jetpack Compose - Design System Tokens

> **Kotlin-based Design Tokens for Jetpack Compose**
>
> Type-safe, theme-aware, multi-brand ready.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Theme Provider](#theme-provider)
- [Token Access](#token-access)
- [Multi-Brand Apps](#multi-brand-apps)
- [File Structure](#file-structure)
- [API Reference](#api-reference)

---

## Quick Start

### 1. Copy Files

```bash
# Copy Compose output to your Android project
cp -r dist/android/compose/* app/src/main/java/com/bild/designsystem/
```

### 2. Set Up Theme

```kotlin
import com.bild.designsystem.bild.theme.BildTheme
import com.bild.designsystem.shared.WindowSizeClass
import com.bild.designsystem.shared.Density

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            BildTheme(
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
    // Semantic Tokens (via Theme)
    Text(
        text = "Headline",
        color = BildTheme.colors.textColorPrimary,
        fontSize = BildTheme.sizing.headline1FontSize
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

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  SHARED (brand-independent)                                     │
│  ─────────────────────────────────────────────────────────────  │
│  Density          │ Dense, Default, Spacious                    │
│  WindowSizeClass  │ Compact, Regular                            │
│  Brand            │ Bild, Sportbild, Advertorial                │
│  DesignSystemTheme│ Multi-Brand Theme Provider                  │
│  DesignTokenPrimitives │ Colors, Spacing, Sizes, Fonts          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  BRAND-SPECIFIC (e.g., Bild)                                    │
│  ─────────────────────────────────────────────────────────────  │
│  BildTheme        │ CompositionLocal Theme Provider             │
│    .colors        │ → BildColorScheme (Light/Dark)              │
│    .sizing        │ → BildSizingScheme (Compact/Regular)        │
│    .density       │ → Density Enum                              │
│    .sizeClass     │ → WindowSizeClass Enum                      │
│    .isDarkTheme   │ → Boolean                                   │
├─────────────────────────────────────────────────────────────────┤
│  COMPONENT TOKENS                                               │
│  ─────────────────────────────────────────────────────────────  │
│  ButtonTokens, CardTokens, TeaserTokens, ...                    │
│    .Colors.current()      │ → ColorTokens (Light/Dark)          │
│    .Sizing.current()      │ → SizingTokens (Compact/Regular)    │
│    .Typography.current()  │ → TypographyTokens (Compact/Regular)│
│    .Density.current()     │ → DensityTokens (Dense/Default/...) │
└─────────────────────────────────────────────────────────────────┘
```

---

## Theme Provider

### BildTheme (Single-Brand)

```kotlin
import com.bild.designsystem.bild.theme.BildTheme
import com.bild.designsystem.shared.WindowSizeClass
import com.bild.designsystem.shared.Density

@Composable
fun MyApp() {
    BildTheme(
        darkTheme = isSystemInDarkTheme(),
        sizeClass = WindowSizeClass.Compact,  // or .Regular
        density = Density.Default              // or .Dense, .Spacious
    ) {
        // Your app content
    }
}
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `darkTheme` | `Boolean` | `isSystemInDarkTheme()` | Light/Dark Mode |
| `sizeClass` | `WindowSizeClass` | `Compact` | Responsive Layout |
| `density` | `Density` | `Default` | UI Density |
| `lightColors` | `BildColorScheme` | `BildLightColors` | Custom Light Colors |
| `darkColors` | `BildColorScheme` | `BildDarkColors` | Custom Dark Colors |

### Calculating WindowSizeClass

```kotlin
import androidx.compose.material3.windowsizeclass.calculateWindowSizeClass
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass

@Composable
fun rememberDesignSystemSizeClass(activity: Activity): WindowSizeClass {
    val windowSizeClass = calculateWindowSizeClass(activity)
    return when (windowSizeClass.widthSizeClass) {
        WindowWidthSizeClass.Compact -> WindowSizeClass.Compact
        else -> WindowSizeClass.Regular
    }
}
```

---

## Token Access

### Semantic Tokens (via BildTheme)

For global design decisions:

```kotlin
@Composable
fun SemanticExample() {
    // Colors - automatically Light/Dark
    val textColor = BildTheme.colors.textColorPrimary
    val bgColor = BildTheme.colors.surfaceColorPrimary
    val accentColor = BildTheme.colors.textColorAccent

    // Sizing - automatically Compact/Regular
    val headlineSize = BildTheme.sizing.headline1FontSize
    val bodySize = BildTheme.sizing.body1FontSize

    // Query theme state
    val isDark = BildTheme.isDarkTheme
    val sizeClass = BildTheme.sizeClass
    val density = BildTheme.density
}
```

### Component Tokens (via current())

For component-specific tokens with automatic theme selection:

```kotlin
import com.bild.designsystem.bild.components.ButtonTokens
import com.bild.designsystem.bild.components.CardTokens
import com.bild.designsystem.bild.components.TeaserTokens

@Composable
fun ComponentExample() {
    // Colors - automatically Light/Dark
    val buttonBg = ButtonTokens.Colors.current().buttonPrimaryBgColorIdle
    val buttonHover = ButtonTokens.Colors.current().buttonPrimaryBgColorHover

    // Sizing - automatically Compact/Regular
    val buttonHeight = ButtonTokens.Sizing.current().buttonContentMinHeightSize
    val cardRadius = CardTokens.Sizing.current().cardBorderRadius

    // Typography - automatically Compact/Regular
    val fontFamily = ButtonTokens.Typography.current().buttonLabelFontFamily
    val fontSize = ButtonTokens.Typography.current().buttonLabelFontSize
    val fontWeight = ButtonTokens.Typography.current().buttonLabelFontWeight

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

// Direct Compact/Regular access
val compactSize = ButtonTokens.Sizing.Compact.buttonLabelFontSize
val regularSize = ButtonTokens.Sizing.Regular.buttonLabelFontSize

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

## Multi-Brand Apps

### DesignSystemTheme (Central Entry Point)

For apps that support multiple brands:

```kotlin
import com.bild.designsystem.shared.Brand
import com.bild.designsystem.shared.DesignSystemTheme
import com.bild.designsystem.shared.WindowSizeClass
import com.bild.designsystem.shared.Density

@Composable
fun MultiBrandApp(brand: Brand) {
    DesignSystemTheme(
        brand = brand,
        darkTheme = isSystemInDarkTheme(),
        sizeClass = WindowSizeClass.Compact,
        density = Density.Default
    ) {
        // Content uses the correct brand tokens automatically
        MyAppContent()
    }
}
```

### White-Label App

```kotlin
// Brand from build config or remote config
val brand = Brand.valueOf(BuildConfig.BRAND_NAME)  // "Bild", "Sportbild", "Advertorial"

DesignSystemTheme(brand = brand) {
    MyWhiteLabelApp()
}
```

### Runtime Brand Switching

```kotlin
@Composable
fun BrandSwitcherDemo() {
    var currentBrand by remember { mutableStateOf(Brand.Bild) }

    Column {
        // Brand selection
        Row {
            Brand.values().forEach { brand ->
                Button(onClick = { currentBrand = brand }) {
                    Text(brand.name)
                }
            }
        }

        // Content with selected brand
        DesignSystemTheme(brand = currentBrand) {
            BrandedContent()
        }
    }
}
```

---

## File Structure

```
com/bild/designsystem/
├── shared/                              # Brand-independent
│   ├── DesignTokenPrimitives.kt         # All Primitives
│   ├── Density.kt                       # Dense/Default/Spacious
│   ├── WindowSizeClass.kt               # Compact/Regular
│   ├── Brand.kt                         # Bild/Sportbild/Advertorial
│   └── DesignSystemTheme.kt             # Multi-Brand Theme
│
├── bild/                                # Brand: BILD
│   ├── theme/
│   │   └── BildTheme.kt                 # Theme Provider
│   ├── semantic/
│   │   ├── BildSemanticTokens.kt        # Aggregated Semantic Tokens
│   │   ├── color/
│   │   │   ├── ColorsLight.kt           # BildColorScheme + BildLightColors
│   │   │   └── ColorsDark.kt            # BildDarkColors
│   │   └── sizeclass/
│   │       ├── SizingCompact.kt         # BildSizingScheme + BildSizingCompact
│   │       └── SizingRegular.kt         # BildSizingRegular
│   └── components/
│       ├── Button/
│       │   └── ButtonTokens.kt          # Colors/Sizing/Typography/Density
│       ├── Card/
│       │   └── CardTokens.kt
│       ├── Teaser/
│       │   └── TeaserTokens.kt
│       └── ... (50+ Components)
│
├── sportbild/                           # Brand: SportBILD
│   └── ... (same structure)
│
└── advertorial/                         # Brand: Advertorial
    └── ... (same structure)
```

---

## API Reference

### Shared Enums

```kotlin
package com.bild.designsystem.shared

enum class Density {
    Dense,      // Compact UI
    Default,    // Standard
    Spacious    // Generous UI
}

enum class WindowSizeClass {
    Compact,    // Phones (Portrait)
    Regular     // Tablets, Phones (Landscape)
}

enum class Brand {
    Bild,
    Sportbild,
    Advertorial
}
```

### Theme Object

```kotlin
object BildTheme {
    val colors: BildColorScheme      // Current colors (Light/Dark)
    val sizing: BildSizingScheme     // Current sizes (Compact/Regular)
    val density: Density             // Current density
    val sizeClass: WindowSizeClass   // Current size class
    val isDarkTheme: Boolean         // Is dark mode active?
}
```

### Component Token Accessors

```kotlin
object ButtonTokens {
    object Colors {
        fun current(): ColorTokens    // Theme-aware (Light/Dark)
        object Light : ColorTokens
        object Dark : ColorTokens
    }
    object Sizing {
        fun current(): SizingTokens   // Theme-aware (Compact/Regular)
        object Compact : SizingTokens
        object Regular : SizingTokens
    }
    object Typography {
        fun current(): TypographyTokens  // Theme-aware (Compact/Regular)
        object Compact : TypographyTokens
        object Regular : TypographyTokens
    }
    object Density {
        fun current(): DensityTokens  // Theme-aware (Dense/Default/Spacious)
        object Dense : DensityTokens
        object Default : DensityTokens
        object Spacious : DensityTokens
    }
}
```

---

## Best Practices

### 1. Semantic vs Component Tokens

```kotlin
// ✅ Semantic Tokens for global UI elements
Text(color = BildTheme.colors.textColorPrimary)

// ✅ Component Tokens for specific components
Button(containerColor = ButtonTokens.Colors.current().buttonPrimaryBgColorIdle)
```

### 2. Use current() for Automatic Selection

```kotlin
// ✅ Theme-aware - adapts automatically
val color = ButtonTokens.Colors.current().buttonPrimaryBgColorIdle

// ⚠️ Static - only when you explicitly need a specific mode
val lightColor = ButtonTokens.Colors.Light.buttonPrimaryBgColorIdle
```

### 3. WindowSizeClass for Responsive Layouts

```kotlin
@Composable
fun ResponsiveLayout() {
    when (BildTheme.sizeClass) {
        WindowSizeClass.Compact -> PhoneLayout()
        WindowSizeClass.Regular -> TabletLayout()
    }
}
```

### 4. Density for Accessibility

```kotlin
// Density is set in the theme and applied automatically
BildTheme(density = Density.Spacious) {
    // All density tokens have larger values
}
```

---

## Dependencies

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

## Related Documentation

| Document | Description |
|----------|-------------|
| [README.md](./README.md) | Project Overview |
| [README.tokens.md](./README.tokens.md) | All Platforms |
| [CLAUDE.md](./CLAUDE.md) | Build Pipeline Details |

---

**Generated by BILD Design System Token Pipeline**
