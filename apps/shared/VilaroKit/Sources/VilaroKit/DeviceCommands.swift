import Foundation

public enum VilaroDeviceCommand: String, Codable, Sendable {
    case status = "device.status"
    case info = "device.info"
}

public enum VilaroBatteryState: String, Codable, Sendable {
    case unknown
    case unplugged
    case charging
    case full
}

public enum VilaroThermalState: String, Codable, Sendable {
    case nominal
    case fair
    case serious
    case critical
}

public enum VilaroNetworkPathStatus: String, Codable, Sendable {
    case satisfied
    case unsatisfied
    case requiresConnection
}

public enum VilaroNetworkInterfaceType: String, Codable, Sendable {
    case wifi
    case cellular
    case wired
    case other
}

public struct VilaroBatteryStatusPayload: Codable, Sendable, Equatable {
    public var level: Double?
    public var state: VilaroBatteryState
    public var lowPowerModeEnabled: Bool

    public init(level: Double?, state: VilaroBatteryState, lowPowerModeEnabled: Bool) {
        self.level = level
        self.state = state
        self.lowPowerModeEnabled = lowPowerModeEnabled
    }
}

public struct VilaroThermalStatusPayload: Codable, Sendable, Equatable {
    public var state: VilaroThermalState

    public init(state: VilaroThermalState) {
        self.state = state
    }
}

public struct VilaroStorageStatusPayload: Codable, Sendable, Equatable {
    public var totalBytes: Int64
    public var freeBytes: Int64
    public var usedBytes: Int64

    public init(totalBytes: Int64, freeBytes: Int64, usedBytes: Int64) {
        self.totalBytes = totalBytes
        self.freeBytes = freeBytes
        self.usedBytes = usedBytes
    }
}

public struct VilaroNetworkStatusPayload: Codable, Sendable, Equatable {
    public var status: VilaroNetworkPathStatus
    public var isExpensive: Bool
    public var isConstrained: Bool
    public var interfaces: [VilaroNetworkInterfaceType]

    public init(
        status: VilaroNetworkPathStatus,
        isExpensive: Bool,
        isConstrained: Bool,
        interfaces: [VilaroNetworkInterfaceType])
    {
        self.status = status
        self.isExpensive = isExpensive
        self.isConstrained = isConstrained
        self.interfaces = interfaces
    }
}

public struct VilaroDeviceStatusPayload: Codable, Sendable, Equatable {
    public var battery: VilaroBatteryStatusPayload
    public var thermal: VilaroThermalStatusPayload
    public var storage: VilaroStorageStatusPayload
    public var network: VilaroNetworkStatusPayload
    public var uptimeSeconds: Double

    public init(
        battery: VilaroBatteryStatusPayload,
        thermal: VilaroThermalStatusPayload,
        storage: VilaroStorageStatusPayload,
        network: VilaroNetworkStatusPayload,
        uptimeSeconds: Double)
    {
        self.battery = battery
        self.thermal = thermal
        self.storage = storage
        self.network = network
        self.uptimeSeconds = uptimeSeconds
    }
}

public struct VilaroDeviceInfoPayload: Codable, Sendable, Equatable {
    public var deviceName: String
    public var modelIdentifier: String
    public var systemName: String
    public var systemVersion: String
    public var appVersion: String
    public var appBuild: String
    public var locale: String

    public init(
        deviceName: String,
        modelIdentifier: String,
        systemName: String,
        systemVersion: String,
        appVersion: String,
        appBuild: String,
        locale: String)
    {
        self.deviceName = deviceName
        self.modelIdentifier = modelIdentifier
        self.systemName = systemName
        self.systemVersion = systemVersion
        self.appVersion = appVersion
        self.appBuild = appBuild
        self.locale = locale
    }
}
