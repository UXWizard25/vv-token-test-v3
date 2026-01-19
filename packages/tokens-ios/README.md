# BILD Design System Tokens for iOS

Design tokens for iOS, macOS, tvOS, and watchOS applications using SwiftUI.

## Installation

### Xcode (Recommended)

1. Open your project in Xcode
2. Go to **File > Add Package Dependencies**
3. Enter the repository URL: `https://github.com/UXWizard25/bild-design-system.git`
4. Select version (e.g., `from: "1.0.0"`)
5. Choose the product **BildDesignTokens**

### Package.swift

```swift
dependencies: [
    .package(
        url: "https://github.com/UXWizard25/bild-design-system.git",
        from: "1.0.0"
    )
],
targets: [
    .target(
        name: "YourApp",
        dependencies: ["BildDesignTokens"]
    )
]
```

## Usage

### Theme Setup

```swift
import BildDesignTokens
import SwiftUI

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .designSystemTheme(
                    colorBrand: .bild,
                    contentBrand: .bild,
                    darkTheme: false,
                    sizeClass: .compact,
                    density: .default
                )
        }
    }
}
```

### Accessing Tokens

```swift
import BildDesignTokens

struct ContentView: View {
    @Environment(\.designSystemTheme) var theme

    var body: some View {
        Text("Hello, BILD!")
            .foregroundColor(theme.colors.textColorPrimary)
            .font(.system(size: theme.sizing.fontSizeBodyMd))
    }
}
```

### Available Brands

| Brand | ColorBrand | ContentBrand |
|-------|------------|--------------|
| BILD | `.bild` | `.bild` |
| SportBILD | `.sportbild` | `.sportbild` |
| Advertorial | - | `.advertorial` |

**Note:** Advertorial uses BILD or SportBILD colors but has its own typography and sizing.

### Size Classes

| Size Class | Devices |
|------------|---------|
| `.compact` | iPhone, iPad Split View |
| `.regular` | iPad Full Screen, Mac |

### Density Modes

| Mode | Use Case |
|------|----------|
| `.default` | Standard spacing |
| `.dense` | Compact layouts, data-heavy views |
| `.spacious` | Hero sections, marketing |

## Token Categories

### Colors

```swift
theme.colors.textColorPrimary
theme.colors.textColorSecondary
theme.colors.surfaceColorPrimary
theme.colors.accentColorPrimary
```

### Sizing

```swift
theme.sizing.gridSpaceRespBase
theme.sizing.fontSizeBodyMd
theme.sizing.borderRadiusMd
```

### Typography

```swift
theme.typography.headline1
theme.typography.bodyMd
theme.typography.labelSm
```

### Effects

```swift
theme.effects.shadowSoftSm
theme.effects.shadowSoftMd
theme.effects.shadowHardLg
```

### Density-Aware Spacing

```swift
// Responsive (varies by SizeClass)
theme.stackSpaceRespMd
theme.stackSpaceRespLg

// Constant (same across all SizeClasses)
theme.stackSpaceConstSm
theme.stackSpaceConstMd
```

## Platforms

- iOS 14.0+
- macOS 11.0+
- tvOS 14.0+
- watchOS 7.0+

## License

Proprietary - BILD Digital
