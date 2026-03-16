import CoreLocation
import Foundation
import VilaroKit
import UIKit

typealias VilaroCameraSnapResult = (format: String, base64: String, width: Int, height: Int)
typealias VilaroCameraClipResult = (format: String, base64: String, durationMs: Int, hasAudio: Bool)

protocol CameraServicing: Sendable {
    func listDevices() async -> [CameraController.CameraDeviceInfo]
    func snap(params: VilaroCameraSnapParams) async throws -> VilaroCameraSnapResult
    func clip(params: VilaroCameraClipParams) async throws -> VilaroCameraClipResult
}

protocol ScreenRecordingServicing: Sendable {
    func record(
        screenIndex: Int?,
        durationMs: Int?,
        fps: Double?,
        includeAudio: Bool?,
        outPath: String?) async throws -> String
}

@MainActor
protocol LocationServicing: Sendable {
    func authorizationStatus() -> CLAuthorizationStatus
    func accuracyAuthorization() -> CLAccuracyAuthorization
    func ensureAuthorization(mode: VilaroLocationMode) async -> CLAuthorizationStatus
    func currentLocation(
        params: VilaroLocationGetParams,
        desiredAccuracy: VilaroLocationAccuracy,
        maxAgeMs: Int?,
        timeoutMs: Int?) async throws -> CLLocation
    func startLocationUpdates(
        desiredAccuracy: VilaroLocationAccuracy,
        significantChangesOnly: Bool) -> AsyncStream<CLLocation>
    func stopLocationUpdates()
    func startMonitoringSignificantLocationChanges(onUpdate: @escaping @Sendable (CLLocation) -> Void)
    func stopMonitoringSignificantLocationChanges()
}

@MainActor
protocol DeviceStatusServicing: Sendable {
    func status() async throws -> VilaroDeviceStatusPayload
    func info() -> VilaroDeviceInfoPayload
}

protocol PhotosServicing: Sendable {
    func latest(params: VilaroPhotosLatestParams) async throws -> VilaroPhotosLatestPayload
}

protocol ContactsServicing: Sendable {
    func search(params: VilaroContactsSearchParams) async throws -> VilaroContactsSearchPayload
    func add(params: VilaroContactsAddParams) async throws -> VilaroContactsAddPayload
}

protocol CalendarServicing: Sendable {
    func events(params: VilaroCalendarEventsParams) async throws -> VilaroCalendarEventsPayload
    func add(params: VilaroCalendarAddParams) async throws -> VilaroCalendarAddPayload
}

protocol RemindersServicing: Sendable {
    func list(params: VilaroRemindersListParams) async throws -> VilaroRemindersListPayload
    func add(params: VilaroRemindersAddParams) async throws -> VilaroRemindersAddPayload
}

protocol MotionServicing: Sendable {
    func activities(params: VilaroMotionActivityParams) async throws -> VilaroMotionActivityPayload
    func pedometer(params: VilaroPedometerParams) async throws -> VilaroPedometerPayload
}

struct WatchMessagingStatus: Sendable, Equatable {
    var supported: Bool
    var paired: Bool
    var appInstalled: Bool
    var reachable: Bool
    var activationState: String
}

struct WatchQuickReplyEvent: Sendable, Equatable {
    var replyId: String
    var promptId: String
    var actionId: String
    var actionLabel: String?
    var sessionKey: String?
    var note: String?
    var sentAtMs: Int?
    var transport: String
}

struct WatchNotificationSendResult: Sendable, Equatable {
    var deliveredImmediately: Bool
    var queuedForDelivery: Bool
    var transport: String
}

protocol WatchMessagingServicing: AnyObject, Sendable {
    func status() async -> WatchMessagingStatus
    func setReplyHandler(_ handler: (@Sendable (WatchQuickReplyEvent) -> Void)?)
    func sendNotification(
        id: String,
        params: VilaroWatchNotifyParams) async throws -> WatchNotificationSendResult
}

extension CameraController: CameraServicing {}
extension ScreenRecordService: ScreenRecordingServicing {}
extension LocationService: LocationServicing {}
