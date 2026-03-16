package ai.vilaro.app.protocol

import org.junit.Assert.assertEquals
import org.junit.Test

class VilaroProtocolConstantsTest {
  @Test
  fun canvasCommandsUseStableStrings() {
    assertEquals("canvas.present", VilaroCanvasCommand.Present.rawValue)
    assertEquals("canvas.hide", VilaroCanvasCommand.Hide.rawValue)
    assertEquals("canvas.navigate", VilaroCanvasCommand.Navigate.rawValue)
    assertEquals("canvas.eval", VilaroCanvasCommand.Eval.rawValue)
    assertEquals("canvas.snapshot", VilaroCanvasCommand.Snapshot.rawValue)
  }

  @Test
  fun a2uiCommandsUseStableStrings() {
    assertEquals("canvas.a2ui.push", VilaroCanvasA2UICommand.Push.rawValue)
    assertEquals("canvas.a2ui.pushJSONL", VilaroCanvasA2UICommand.PushJSONL.rawValue)
    assertEquals("canvas.a2ui.reset", VilaroCanvasA2UICommand.Reset.rawValue)
  }

  @Test
  fun capabilitiesUseStableStrings() {
    assertEquals("canvas", VilaroCapability.Canvas.rawValue)
    assertEquals("camera", VilaroCapability.Camera.rawValue)
    assertEquals("voiceWake", VilaroCapability.VoiceWake.rawValue)
    assertEquals("location", VilaroCapability.Location.rawValue)
    assertEquals("sms", VilaroCapability.Sms.rawValue)
    assertEquals("device", VilaroCapability.Device.rawValue)
    assertEquals("notifications", VilaroCapability.Notifications.rawValue)
    assertEquals("system", VilaroCapability.System.rawValue)
    assertEquals("photos", VilaroCapability.Photos.rawValue)
    assertEquals("contacts", VilaroCapability.Contacts.rawValue)
    assertEquals("calendar", VilaroCapability.Calendar.rawValue)
    assertEquals("motion", VilaroCapability.Motion.rawValue)
    assertEquals("callLog", VilaroCapability.CallLog.rawValue)
  }

  @Test
  fun cameraCommandsUseStableStrings() {
    assertEquals("camera.list", VilaroCameraCommand.List.rawValue)
    assertEquals("camera.snap", VilaroCameraCommand.Snap.rawValue)
    assertEquals("camera.clip", VilaroCameraCommand.Clip.rawValue)
  }

  @Test
  fun notificationsCommandsUseStableStrings() {
    assertEquals("notifications.list", VilaroNotificationsCommand.List.rawValue)
    assertEquals("notifications.actions", VilaroNotificationsCommand.Actions.rawValue)
  }

  @Test
  fun deviceCommandsUseStableStrings() {
    assertEquals("device.status", VilaroDeviceCommand.Status.rawValue)
    assertEquals("device.info", VilaroDeviceCommand.Info.rawValue)
    assertEquals("device.permissions", VilaroDeviceCommand.Permissions.rawValue)
    assertEquals("device.health", VilaroDeviceCommand.Health.rawValue)
  }

  @Test
  fun systemCommandsUseStableStrings() {
    assertEquals("system.notify", VilaroSystemCommand.Notify.rawValue)
  }

  @Test
  fun photosCommandsUseStableStrings() {
    assertEquals("photos.latest", VilaroPhotosCommand.Latest.rawValue)
  }

  @Test
  fun contactsCommandsUseStableStrings() {
    assertEquals("contacts.search", VilaroContactsCommand.Search.rawValue)
    assertEquals("contacts.add", VilaroContactsCommand.Add.rawValue)
  }

  @Test
  fun calendarCommandsUseStableStrings() {
    assertEquals("calendar.events", VilaroCalendarCommand.Events.rawValue)
    assertEquals("calendar.add", VilaroCalendarCommand.Add.rawValue)
  }

  @Test
  fun motionCommandsUseStableStrings() {
    assertEquals("motion.activity", VilaroMotionCommand.Activity.rawValue)
    assertEquals("motion.pedometer", VilaroMotionCommand.Pedometer.rawValue)
  }

  @Test
  fun callLogCommandsUseStableStrings() {
    assertEquals("callLog.search", VilaroCallLogCommand.Search.rawValue)
  }
}
