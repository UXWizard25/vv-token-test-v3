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
                username = providers.gradleProperty("gpr.user").orNull
                    ?: System.getenv("GITHUB_USERNAME")
                password = providers.gradleProperty("gpr.token").orNull
                    ?: System.getenv("GITHUB_TOKEN")
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

The token needs `read:packages` scope. Generate at: GitHub → Settings → Developer settings → Personal access tokens

## Usage

### Theme Setup

```kotlin
import com.bild.designsystem.shared.*

@Composable
fun MyApp() {
    DesignSystemTheme(
        colorBrand = ColorBrand.Bild,           // Colors & Effects
        contentBrand = ContentBrand.Bild,       // Sizing & Typography
        darkTheme = isSystemInDarkTheme(),
        sizeClass = WindowSizeClass.Compact,
        density = Density.Default
    ) {
        MyScreen()
    }
}
```

### Accessing Tokens

```kotlin
@Composable
fun MyScreen() {
    Column(
        modifier = Modifier
            .background(DesignSystemTheme.colors.bgColorPrimary)
            .padding(DesignSystemTheme.sizing.gridSpaceRespBase)
    ) {
        Text(
            text = "Hello",
            color = DesignSystemTheme.colors.textColorPrimary
        )
    }
}
```

### Available Brands

| Axis | Options | Controls |
|------|---------|----------|
| **ColorBrand** | `Bild`, `Sportbild` | Colors, Effects |
| **ContentBrand** | `Bild`, `Sportbild`, `Advertorial` | Sizing, Typography |

### Size Classes (Material 3)

| Size Class | Width | Devices |
|------------|-------|---------|
| `Compact` | < 600dp | Phones |
| `Medium` | 600-839dp | Foldables, small tablets |
| `Expanded` | ≥ 840dp | Tablets, desktop |

### Density Modes

| Mode | Use Case |
|------|----------|
| `Density.Default` | Standard UI |
| `Density.Dense` | Data tables, lists |
| `Density.Spacious` | Hero sections, marketing |

## Token Categories

```kotlin
// Colors
DesignSystemTheme.colors.textColorPrimary
DesignSystemTheme.colors.bgColorPrimary
DesignSystemTheme.colors.textColorBrand

// Sizing
DesignSystemTheme.sizing.gridSpaceRespBase

// Typography
DesignSystemTheme.typography.headline1

// Effects
DesignSystemTheme.effects.shadowSoftMd

// Density-Aware Spacing
DesignSystemTheme.stackSpaceRespMd   // Responsive
DesignSystemTheme.stackSpaceConstLg  // Constant
```

## Documentation

For complete API documentation, see [USAGE.md](src/main/kotlin/com/bild/designsystem/USAGE.md).

## Requirements

- Android SDK 21+ (minSdk)
- Jetpack Compose 1.6.0+
- Kotlin 1.9.22+

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Could not resolve de.bild.design:tokens" | Check GitHub credentials in `gradle.properties` |
| "Unresolved reference: DesignSystemTheme" | Run Gradle Sync, Rebuild Project |

## License

Proprietary - Axel Springer Deutschland GmbH
