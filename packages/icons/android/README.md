# BILD Design System Icons - Android

> **de.bild.design:icons** | Android Vector Drawables for Jetpack Compose and XML layouts

---

## Installation

### GitHub Packages (Maven)

Add the GitHub Packages repository to your `settings.gradle.kts`:

```kotlin
dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
        maven {
            url = uri("https://maven.pkg.github.com/UXWizard25/vv-token-test-v3")
            credentials {
                username = project.findProperty("gpr.user") as String?
                    ?: System.getenv("GITHUB_USER")
                password = project.findProperty("gpr.token") as String?
                    ?: System.getenv("GITHUB_TOKEN")
            }
        }
    }
}
```

Add the dependency to your module's `build.gradle.kts`:

```kotlin
dependencies {
    implementation("de.bild.design:icons:1.0.0")
}
```

### Authentication

Create or update `~/.gradle/gradle.properties`:

```properties
gpr.user=YOUR_GITHUB_USERNAME
gpr.token=YOUR_GITHUB_TOKEN
```

The token needs the `read:packages` scope.

---

## Usage

### XML Layouts

```xml
<ImageView
    android:layout_width="24dp"
    android:layout_height="24dp"
    android:src="@drawable/ic_add"
    app:tint="?attr/colorOnSurface" />
```

### Jetpack Compose (Recommended)

Use the convenience `BildIcon()` composable for consistent sizing and accessibility:

```kotlin
import de.bild.design.icons.*

// Simple usage
BildIcon(BildIcons.Add, contentDescription = "Add item")

// Custom size and color
BildIcon(
    icon = BildIcons.ArrowLeft,
    contentDescription = "Go back",
    size = 32.dp,
    tint = MaterialTheme.colorScheme.primary
)

// Preset sizes (XS, SM, MD, LG, XL)
BildIcon(
    icon = BildIcons.Menu,
    contentDescription = "Menu",
    size = BildIconSize.LG
)

// Decorative icon (null for contentDescription)
BildIcon(BildIcons.Star, contentDescription = null)

// Icon button
BildIconButton(
    icon = BildIcons.Close,
    contentDescription = "Close dialog",
    onClick = { dismiss() }
)

// Icons starting with numbers use underscore prefix
BildIcon(BildIcons._2LigaLogo, contentDescription = "2. Liga")
```

### Direct ImageVector Access

For custom composables, use `BildIcons` directly:

```kotlin
import androidx.compose.material3.Icon
import de.bild.design.icons.BildIcons

Icon(
    imageVector = BildIcons.Add,
    contentDescription = "Add",
    tint = Color.Red
)
```

### Alternative: Resource-based Access

```kotlin
import androidx.compose.ui.res.painterResource
import de.bild.design.icons.R

Icon(
    painter = painterResource(R.drawable.ic_add),
    contentDescription = "Add",
    tint = MaterialTheme.colorScheme.onSurface
)
```

---

## Theming

Icons use `?attr/colorOnSurface` by default for Material 3 compatibility.

### Custom Colors

```xml
<!-- XML -->
<ImageView
    android:src="@drawable/ic_add"
    app:tint="@color/my_custom_color" />
```

```kotlin
// Compose
Icon(
    painter = painterResource(R.drawable.ic_add),
    contentDescription = "Add",
    tint = Color.Red
)
```

---

## API Reference

### BildIcon Composable

```kotlin
@Composable
fun BildIcon(
    icon: ImageVector,
    contentDescription: String?,  // null for decorative icons
    modifier: Modifier = Modifier,
    size: Dp = BildIconSize.MD,
    tint: Color = LocalContentColor.current
)
```

### BildIconButton Composable

```kotlin
@Composable
fun BildIconButton(
    icon: ImageVector,
    contentDescription: String,  // required for buttons
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    size: Dp = BildIconSize.MD,
    tint: Color = LocalContentColor.current,
    enabled: Boolean = true
)
```

### Size Presets

```kotlin
object BildIconSize {
    val XS: Dp = 16.dp
    val SM: Dp = 20.dp
    val MD: Dp = 24.dp  // default
    val LG: Dp = 32.dp
    val XL: Dp = 48.dp
}
```

---

## Naming Convention

| Source SVG | Android Drawable | Compose (BildIcons) |
|------------|------------------|---------------------|
| `add.svg` | `ic_add.xml` | `BildIcons.Add` |
| `arrow-left.svg` | `ic_arrow_left.xml` | `BildIcons.ArrowLeft` |
| `chevron-down.svg` | `ic_chevron_down.xml` | `BildIcons.ChevronDown` |
| `2-liga-logo.svg` | `ic_2_liga_logo.xml` | `BildIcons._2LigaLogo` |

**Conventions:**
- **Drawable files:** `ic_` prefix + snake_case (Android resource naming)
- **Compose API:** PascalCase (Material Icons convention)
- **Numbers:** Drawable allows `ic_2_...`, Kotlin requires `_2...` prefix

---

## Icon Attributes

Custom attributes are available in `attrs_icons.xml` for type-safe icon references:

```xml
<resources>
    <attr name="bildIconAdd" format="reference" />
    <attr name="bildIconMenu" format="reference" />
    <!-- ... -->
</resources>
```

---

## Related Packages

| Package | Purpose |
|---------|---------|
| `@marioschmidt/design-system-icons` | Raw SVG files (npm) |
| `@marioschmidt/design-system-icons-react` | React components (npm) |
| `BildIcons` | iOS Swift Package |

---

## License

MIT
