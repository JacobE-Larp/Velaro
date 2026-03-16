import Foundation

public enum VilaroCameraCommand: String, Codable, Sendable {
    case list = "camera.list"
    case snap = "camera.snap"
    case clip = "camera.clip"
}

public enum VilaroCameraFacing: String, Codable, Sendable {
    case back
    case front
}

public enum VilaroCameraImageFormat: String, Codable, Sendable {
    case jpg
    case jpeg
}

public enum VilaroCameraVideoFormat: String, Codable, Sendable {
    case mp4
}

public struct VilaroCameraSnapParams: Codable, Sendable, Equatable {
    public var facing: VilaroCameraFacing?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: VilaroCameraImageFormat?
    public var deviceId: String?
    public var delayMs: Int?

    public init(
        facing: VilaroCameraFacing? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: VilaroCameraImageFormat? = nil,
        deviceId: String? = nil,
        delayMs: Int? = nil)
    {
        self.facing = facing
        self.maxWidth = maxWidth
        self.quality = quality
        self.format = format
        self.deviceId = deviceId
        self.delayMs = delayMs
    }
}

public struct VilaroCameraClipParams: Codable, Sendable, Equatable {
    public var facing: VilaroCameraFacing?
    public var durationMs: Int?
    public var includeAudio: Bool?
    public var format: VilaroCameraVideoFormat?
    public var deviceId: String?

    public init(
        facing: VilaroCameraFacing? = nil,
        durationMs: Int? = nil,
        includeAudio: Bool? = nil,
        format: VilaroCameraVideoFormat? = nil,
        deviceId: String? = nil)
    {
        self.facing = facing
        self.durationMs = durationMs
        self.includeAudio = includeAudio
        self.format = format
        self.deviceId = deviceId
    }
}
