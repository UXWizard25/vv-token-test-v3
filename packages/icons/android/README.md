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

### Jetpack Compose

```kotlin
import androidx.compose.material3.Icon
import androidx.compose.ui.res.painterResource
import de.bild.design.icons.R

Icon(
    painter = painterResource(R.drawable.ic_add),
    contentDescription = "Add",
    tint = MaterialTheme.colorScheme.onSurface
)
```

### ImageVector (Compose)

```kotlin
Icon(
    imageVector = ImageVector.vectorResource(R.drawable.ic_add),
    contentDescription = "Add"
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

## Naming Convention

| Source SVG | Android Drawable |
|------------|------------------|
| `icon-add.svg` | `ic_add.xml` |
| `icon-arrow-left.svg` | `ic_arrow_left.xml` |
| `icon-chevron-down.svg` | `ic_chevron_down.xml` |

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
