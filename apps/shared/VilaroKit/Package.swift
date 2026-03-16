// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "VilaroKit",
    platforms: [
        .iOS(.v18),
        .macOS(.v15),
    ],
    products: [
        .library(name: "VilaroProtocol", targets: ["VilaroProtocol"]),
        .library(name: "VilaroKit", targets: ["VilaroKit"]),
        .library(name: "VilaroChatUI", targets: ["VilaroChatUI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/steipete/ElevenLabsKit", exact: "0.1.0"),
        .package(url: "https://github.com/gonzalezreal/textual", exact: "0.3.1"),
    ],
    targets: [
        .target(
            name: "VilaroProtocol",
            path: "Sources/VilaroProtocol",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "VilaroKit",
            dependencies: [
                "VilaroProtocol",
                .product(name: "ElevenLabsKit", package: "ElevenLabsKit"),
            ],
            path: "Sources/VilaroKit",
            resources: [
                .process("Resources"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "VilaroChatUI",
            dependencies: [
                "VilaroKit",
                .product(
                    name: "Textual",
                    package: "textual",
                    condition: .when(platforms: [.macOS, .iOS])),
            ],
            path: "Sources/VilaroChatUI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "VilaroKitTests",
            dependencies: ["VilaroKit", "VilaroChatUI"],
            path: "Tests/VilaroKitTests",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
