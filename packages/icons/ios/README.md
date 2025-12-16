# BildIcons - iOS

> **BILD Design System** | Swift Package for iOS/macOS icons

---

## Installation

### Swift Package Manager

Add the package to your project via Xcode:

1. **File** → **Add Package Dependencies...**
2. Enter the repository URL: `https://github.com/UXWizard25/vv-token-test-v3.git`
3. Select version: **Up to Next Major** from `1.0.0`
4. Add `BildIcons` to your target

### Package.swift

```swift
dependencies: [
    .package(
        url: "https://github.com/UXWizard25/vv-token-test-v3.git",
        from: "1.0.0"
    )
]

targets: [
    .target(
        name: "YourApp",
        dependencies: ["BildIcons"]
    )
]
```

---

## Usage

### SwiftUI

```swift
import BildIcons

struct ContentView: View {
    var body: some View {
        VStack {
            // Using the enum
            BildIcon.add.image
                .foregroundColor(.primary)

            // With custom size
            BildIcon.menu.image
                .font(.system(size: 32))

            // With frame
            BildIcon.search.image
                .frame(width: 48, height: 48)
        }
    }
}
```

### Iterate All Icons

```swift
import BildIcons

struct IconGrid: View {
    var body: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 60))]) {
            ForEach(BildIcon.allCases, id: \.self) { icon in
                VStack {
                    icon.image
                        .font(.title)
                    Text(icon.displayName)
                        .font(.caption2)
                }
            }
        }
    }
}
```

### UIKit

```swift
import BildIcons
import UIKit

let imageView = UIImageView()
imageView.image = UIImage(named: BildIcon.add.rawValue, in: .module, with: nil)
imageView.tintColor = .label
```

---

## API Reference

### BildIcon Enum

```swift
public enum BildIcon: String, CaseIterable {
    case add = "add"
    case menu = "menu"
    case search = "search"
    // ... all icons

    /// SwiftUI Image for this icon
    public var image: Image

    /// Human-readable name for debugging
    public var displayName: String
}
```

---

## Theming

Icons are template images that adapt to the current tint color:

```swift
// SwiftUI
BildIcon.add.image
    .foregroundColor(.red)

// UIKit
imageView.tintColor = .systemRed
```

### Dark Mode

Icons automatically adapt to light/dark mode when using semantic colors:

```swift
BildIcon.add.image
    .foregroundColor(.primary)  // Adapts to color scheme
```

---

## Naming Convention

| Source SVG | Swift Enum Case |
|------------|-----------------|
| `icon-add.svg` | `BildIcon.add` |
| `icon-arrow-left.svg` | `BildIcon.arrowLeft` |
| `icon-chevron-down.svg` | `BildIcon.chevronDown` |

---

## Preview Provider

A preview provider is included for SwiftUI Previews:

```swift
#if DEBUG
struct BildIconPreviews: PreviewProvider {
    static var previews: some View {
        // Shows all icons in a grid
    }
}
#endif
```

---

## Related Packages

| Package | Purpose |
|---------|---------|
| `@marioschmidt/design-system-icons` | Raw SVG files (npm) |
| `@marioschmidt/design-system-icons-react` | React components (npm) |
| `de.bild.design:icons` | Android Vector Drawables |

---

## License

MIT
