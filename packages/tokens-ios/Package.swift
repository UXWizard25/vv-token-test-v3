// swift-tools-version:5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

/**
 * BILD Design System Tokens - Swift Package
 *
 * Design tokens for iOS, macOS, tvOS, and watchOS applications.
 * Provides colors, typography, spacing, effects, and component tokens.
 *
 * Usage:
 *   import BildDesignTokens
 *
 *   // Configure the theme
 *   .designSystemTheme(
 *       colorBrand: .bild,
 *       contentBrand: .bild,
 *       darkTheme: false,
 *       sizeClass: .compact,
 *       density: .default
 *   )
 *
 *   // Access tokens
 *   @Environment(\.designSystemTheme) var theme
 *   theme.colors.textColorPrimary
 *   theme.sizing.gridSpaceRespBase
 *
 * Installation:
 *   Xcode: File > Add Package Dependencies
 *   URL: https://github.com/UXWizard25/vv-token-test-v3.git
 *   Product: BildDesignTokens
 */

import PackageDescription

let package = Package(
    name: "BildDesignTokens",
    platforms: [
        .iOS(.v14),
        .macOS(.v11),
        .tvOS(.v14),
        .watchOS(.v7)
    ],
    products: [
        .library(
            name: "BildDesignTokens",
            targets: ["BildDesignTokens"]
        )
    ],
    targets: [
        .target(
            name: "BildDesignTokens",
            path: "Sources/BildDesignTokens"
        )
    ]
)
