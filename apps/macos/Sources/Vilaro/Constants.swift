import Foundation

// Stable identifier used for both the macOS LaunchAgent label and Nix-managed defaults suite.
// nix-vilaro writes app defaults into this suite to survive app bundle identifier churn.
let launchdLabel = "ai.vilaro.mac"
let gatewayLaunchdLabel = "ai.vilaro.gateway"
let onboardingVersionKey = "vilaro.onboardingVersion"
let onboardingSeenKey = "vilaro.onboardingSeen"
let currentOnboardingVersion = 7
let pauseDefaultsKey = "vilaro.pauseEnabled"
let iconAnimationsEnabledKey = "vilaro.iconAnimationsEnabled"
let swabbleEnabledKey = "vilaro.swabbleEnabled"
let swabbleTriggersKey = "vilaro.swabbleTriggers"
let voiceWakeTriggerChimeKey = "vilaro.voiceWakeTriggerChime"
let voiceWakeSendChimeKey = "vilaro.voiceWakeSendChime"
let showDockIconKey = "vilaro.showDockIcon"
let defaultVoiceWakeTriggers = ["vilaro"]
let voiceWakeMaxWords = 32
let voiceWakeMaxWordLength = 64
let voiceWakeMicKey = "vilaro.voiceWakeMicID"
let voiceWakeMicNameKey = "vilaro.voiceWakeMicName"
let voiceWakeLocaleKey = "vilaro.voiceWakeLocaleID"
let voiceWakeAdditionalLocalesKey = "vilaro.voiceWakeAdditionalLocaleIDs"
let voicePushToTalkEnabledKey = "vilaro.voicePushToTalkEnabled"
let talkEnabledKey = "vilaro.talkEnabled"
let iconOverrideKey = "vilaro.iconOverride"
let connectionModeKey = "vilaro.connectionMode"
let remoteTargetKey = "vilaro.remoteTarget"
let remoteIdentityKey = "vilaro.remoteIdentity"
let remoteProjectRootKey = "vilaro.remoteProjectRoot"
let remoteCliPathKey = "vilaro.remoteCliPath"
let canvasEnabledKey = "vilaro.canvasEnabled"
let cameraEnabledKey = "vilaro.cameraEnabled"
let systemRunPolicyKey = "vilaro.systemRunPolicy"
let systemRunAllowlistKey = "vilaro.systemRunAllowlist"
let systemRunEnabledKey = "vilaro.systemRunEnabled"
let locationModeKey = "vilaro.locationMode"
let locationPreciseKey = "vilaro.locationPreciseEnabled"
let peekabooBridgeEnabledKey = "vilaro.peekabooBridgeEnabled"
let deepLinkKeyKey = "vilaro.deepLinkKey"
let modelCatalogPathKey = "vilaro.modelCatalogPath"
let modelCatalogReloadKey = "vilaro.modelCatalogReload"
let cliInstallPromptedVersionKey = "vilaro.cliInstallPromptedVersion"
let heartbeatsEnabledKey = "vilaro.heartbeatsEnabled"
let debugPaneEnabledKey = "vilaro.debugPaneEnabled"
let debugFileLogEnabledKey = "vilaro.debug.fileLogEnabled"
let appLogLevelKey = "vilaro.debug.appLogLevel"
let voiceWakeSupported: Bool = ProcessInfo.processInfo.operatingSystemVersion.majorVersion >= 26
