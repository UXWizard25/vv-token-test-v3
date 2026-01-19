# BildIcons - iOS

> **BILD Design System** | Swift Package for iOS/macOS icons

---

## Installation

### Swift Package Manager

Add the package to your project via Xcode:

1. **File** → **Add Package Dependencies...**
2. Enter the repository URL: `https://github.com/UXWizard25/bild-design-system.git`
3. Select version: **Up to Next Major** from `1.0.0`
4. Add `BildIcons` to your target

### Package.swift

```swift
dependencies: [
    .package(
        url: "https://github.com/UXWizard25/bild-design-system.git",
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

### SwiftUI (Recommended)

```swift
import BildIcons

struct ContentView: View {
    var body: some View {
        VStack {
            // Simple usage with convenience method
            BildIcon.add.icon()

            // Custom size and color
            BildIcon.menu.icon(size: 32, color: .blue)

            // Preset sizes (.xs, .sm, .md, .lg, .xl)
            BildIcon.search.icon(size: .lg, color: .red)

            // Icon button
            BildIcon.close.button {
                dismiss()
            }

            // Accessible icon with label
            BildIcon.add.accessibleIcon(label: "Add item")

            // Decorative icon (hidden from screen readers)
            BildIcon.star.decorativeIcon()
        }
    }
}
```

### Raw Image Access

For more control, use the raw `Image`:

```swift
import BildIcons

BildIcon.add.image
    .resizable()
    .frame(width: 24, height: 24)
    .foregroundColor(.primary)
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
public enum BildIcon: String, CaseIterable, Sendable {
    case add = "add"
    case arrowLeft = "arrowLeft"
    case _2LigaLogo = "_2LigaLogo"  // Numbers use underscore prefix
    // ... all icons

    /// SwiftUI Image for this icon
    public var image: Image

    /// Human-readable name for debugging
    public var displayName: String
}
```

### Convenience Methods

```swift
public extension BildIcon {
    /// Icon with custom size and color
    func icon(size: CGFloat = 24, color: Color = .primary) -> some View

    /// Icon with preset size (.xs, .sm, .md, .lg, .xl)
    func icon(size: Size, color: Color = .primary) -> some View

    /// Icon button with action
    func button(size: CGFloat = 24, color: Color = .primary, action: () -> Void) -> some View

    /// Accessible icon with screen reader label
    func accessibleIcon(label: String, size: CGFloat = 24, color: Color = .primary) -> some View

    /// Decorative icon hidden from screen readers
    func decorativeIcon(size: CGFloat = 24, color: Color = .primary) -> some View
}
```

### Size Presets

```swift
BildIcon.Size.xs   // 16pt
BildIcon.Size.sm   // 20pt
BildIcon.Size.md   // 24pt (default)
BildIcon.Size.lg   // 32pt
BildIcon.Size.xl   // 48pt
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
