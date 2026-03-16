// swift-tools-version: 6.2
// Package manifest for the Vilaro macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "Vilaro",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "VilaroIPC", targets: ["VilaroIPC"]),
        .library(name: "VilaroDiscovery", targets: ["VilaroDiscovery"]),
        .executable(name: "Vilaro", targets: ["Vilaro"]),
        .executable(name: "vilaro-mac", targets: ["VilaroMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.2.2"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.1.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.8.0"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.8.1"),
        .package(url: "https://github.com/steipete/Peekaboo.git", branch: "main"),
        .package(path: "../shared/VilaroKit"),
        .package(path: "../../Swabble"),
    ],
    targets: [
        .target(
            name: "VilaroIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "VilaroDiscovery",
            dependencies: [
                .product(name: "VilaroKit", package: "VilaroKit"),
            ],
            path: "Sources/VilaroDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "Vilaro",
            dependencies: [
                "VilaroIPC",
                "VilaroDiscovery",
                .product(name: "VilaroKit", package: "VilaroKit"),
                .product(name: "VilaroChatUI", package: "VilaroKit"),
                .product(name: "VilaroProtocol", package: "VilaroKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
            ],
            exclude: [
                "Resources/Info.plist",
            ],
            resources: [
                .copy("Resources/Vilaro.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "VilaroMacCLI",
            dependencies: [
                "VilaroDiscovery",
                .product(name: "VilaroKit", package: "VilaroKit"),
                .product(name: "VilaroProtocol", package: "VilaroKit"),
            ],
            path: "Sources/VilaroMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "VilaroIPCTests",
            dependencies: [
                "VilaroIPC",
                "Vilaro",
                "VilaroDiscovery",
                .product(name: "VilaroProtocol", package: "VilaroKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
