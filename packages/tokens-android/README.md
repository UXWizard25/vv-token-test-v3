# BILD Design System Tokens for Android

Design tokens for Android applications using Jetpack Compose.

## Installation

### 1. Add GitHub Packages Repository

Add to your `settings.gradle.kts`:

```kotlin
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
        maven {
            url = uri("https://maven.pkg.github.com/UXWizard25/bild-design-system")
            credentials {
                username = System.getenv("GITHUB_USER") ?: properties["gpr.user"]?.toString() ?: ""
                password = System.getenv("GITHUB_TOKEN") ?: properties["gpr.token"]?.toString() ?: ""
            }
        }
    }
}
```

### 2. Add Dependency

Add to your module's `build.gradle.kts`:

```kotlin
dependencies {
    implementation("de.bild.design:tokens:1.0.0")
}
```

### 3. Configure Credentials

Create or edit `~/.gradle/gradle.properties`:

```properties
gpr.user=YOUR_GITHUB_USERNAME
gpr.token=YOUR_GITHUB_PERSONAL_ACCESS_TOKEN
```

The token needs `read:packages` scope.

## Usage

### Theme Setup

```kotlin
import de.bild.design.tokens.*

@Composable
fun MyApp() {
    DesignSystemTheme(
        colorBrand = ColorBrand.Bild,
        contentBrand = ContentBrand.Bild,
        darkTheme = isSystemInDarkTheme(),
        sizeClass = WindowSizeClass.Compact,
        density = Density.Default
    ) {
        // Your app content
        MyScreen()
    }
}
```

### Accessing Tokens

```kotlin
@Composable
fun MyScreen() {
    Column {
        Text(
            text = "Hello, BILD!",
            color = DesignSystemTheme.colors.textColorPrimary,
            style = DesignSystemTheme.typography.headline1
        )

        Box(
            modifier = Modifier
                .background(DesignSystemTheme.colors.surfaceColorPrimary)
                .padding(DesignSystemTheme.sizing.gridSpaceRespBase)
        ) {
            // Content
        }
    }
}
```

### Available Brands

| Brand | ColorBrand | ContentBrand |
|-------|------------|--------------|
| BILD | `ColorBrand.Bild` | `ContentBrand.Bild` |
| SportBILD | `ColorBrand.Sportbild` | `ContentBrand.Sportbild` |
| Advertorial | - | `ContentBrand.Advertorial` |

**Note:** Advertorial uses BILD or SportBILD colors but has its own typography and sizing.

### Window Size Classes (Material 3)

| Size Class | Width | Devices |
|------------|-------|---------|
| `Compact` | < 600dp | Phones |
| `Medium` | 600-839dp | Foldables, small tablets |
| `Expanded` | >= 840dp | Tablets, desktop |

### Density Modes

| Mode | Use Case |
|------|----------|
| `Density.Default` | Standard spacing |
| `Density.Dense` | Compact layouts, data-heavy views |
| `Density.Spacious` | Hero sections, marketing |

## Token Categories

### Colors

```kotlin
DesignSystemTheme.colors.textColorPrimary
DesignSystemTheme.colors.textColorSecondary
DesignSystemTheme.colors.surfaceColorPrimary
DesignSystemTheme.colors.accentColorPrimary
```

### Sizing

```kotlin
DesignSystemTheme.sizing.gridSpaceRespBase
DesignSystemTheme.sizing.fontSizeBodyMd
DesignSystemTheme.sizing.borderRadiusMd
```

### Typography

```kotlin
DesignSystemTheme.typography.headline1
DesignSystemTheme.typography.bodyMd
DesignSystemTheme.typography.labelSm
```

### Effects

```kotlin
DesignSystemTheme.effects.shadowSoftSm
DesignSystemTheme.effects.shadowSoftMd
DesignSystemTheme.effects.shadowHardLg
```

### Density-Aware Spacing

```kotlin
// Responsive (varies by WindowSizeClass)
DesignSystemTheme.stackSpaceRespMd
DesignSystemTheme.stackSpaceRespLg

// Constant (same across all WindowSizeClasses)
DesignSystemTheme.stackSpaceConstSm
DesignSystemTheme.stackSpaceConstMd
```

## Component Tokens

```kotlin
// Button tokens
ButtonTokens.Colors.current().buttonPrimaryBgColorIdle
ButtonTokens.Typography.current().buttonLabel

// Card tokens
CardTokens.current().cardPadding
CardTokens.current().cardBorderRadius
```

## Requirements

- Android SDK 21+ (minSdk)
- Jetpack Compose 1.6.0+
- Kotlin 1.9.22+

## License

Proprietary - BILD Digital
