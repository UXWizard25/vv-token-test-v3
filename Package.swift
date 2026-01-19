// swift-tools-version:5.9
// The swift-tools-version declares the minimum version of Swift required to build this package.

/**
 * BILD Design System Icons - Root Swift Package
 *
 * This Package.swift at the repository root enables SPM users to add
 * the icons package directly via the repository URL.
 *
 * Installation:
 *   1. In Xcode: File > Add Package Dependencies
 *   2. Enter: https://github.com/UXWizard25/bild-design-system
 *   3. Select version (e.g., from: "1.0.0") or branch
 *
 * Usage:
 *   import BildIcons
 *
 *   BildIcon.add.image
 *       .foregroundColor(.primary)
 */

import PackageDescription

let package = Package(
    name: "BildDesignSystemIcons",
    platforms: [
        .iOS(.v14),
        .macOS(.v11),
        .tvOS(.v14),
        .watchOS(.v7)
    ],
    products: [
        .library(
            name: "BildIcons",
            targets: ["BildIcons"]
        )
    ],
    targets: [
        .target(
            name: "BildIcons",
            path: "packages/icons/ios/Sources/BildIcons",
            resources: [
                .process("Resources")
            ]
        )
    ]
)
