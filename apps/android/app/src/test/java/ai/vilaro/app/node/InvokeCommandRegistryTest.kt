package ai.vilaro.app.node

import ai.vilaro.app.protocol.VilaroCalendarCommand
import ai.vilaro.app.protocol.VilaroCameraCommand
import ai.vilaro.app.protocol.VilaroCallLogCommand
import ai.vilaro.app.protocol.VilaroCapability
import ai.vilaro.app.protocol.VilaroContactsCommand
import ai.vilaro.app.protocol.VilaroDeviceCommand
import ai.vilaro.app.protocol.VilaroLocationCommand
import ai.vilaro.app.protocol.VilaroMotionCommand
import ai.vilaro.app.protocol.VilaroNotificationsCommand
import ai.vilaro.app.protocol.VilaroPhotosCommand
import ai.vilaro.app.protocol.VilaroSmsCommand
import ai.vilaro.app.protocol.VilaroSystemCommand
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class InvokeCommandRegistryTest {
  private val coreCapabilities =
    setOf(
      VilaroCapability.Canvas.rawValue,
      VilaroCapability.Device.rawValue,
      VilaroCapability.Notifications.rawValue,
      VilaroCapability.System.rawValue,
      VilaroCapability.Photos.rawValue,
      VilaroCapability.Contacts.rawValue,
      VilaroCapability.Calendar.rawValue,
      VilaroCapability.CallLog.rawValue,
    )

  private val optionalCapabilities =
    setOf(
      VilaroCapability.Camera.rawValue,
      VilaroCapability.Location.rawValue,
      VilaroCapability.Sms.rawValue,
      VilaroCapability.VoiceWake.rawValue,
      VilaroCapability.Motion.rawValue,
    )

  private val coreCommands =
    setOf(
      VilaroDeviceCommand.Status.rawValue,
      VilaroDeviceCommand.Info.rawValue,
      VilaroDeviceCommand.Permissions.rawValue,
      VilaroDeviceCommand.Health.rawValue,
      VilaroNotificationsCommand.List.rawValue,
      VilaroNotificationsCommand.Actions.rawValue,
      VilaroSystemCommand.Notify.rawValue,
      VilaroPhotosCommand.Latest.rawValue,
      VilaroContactsCommand.Search.rawValue,
      VilaroContactsCommand.Add.rawValue,
      VilaroCalendarCommand.Events.rawValue,
      VilaroCalendarCommand.Add.rawValue,
      VilaroCallLogCommand.Search.rawValue,
    )

  private val optionalCommands =
    setOf(
      VilaroCameraCommand.Snap.rawValue,
      VilaroCameraCommand.Clip.rawValue,
      VilaroCameraCommand.List.rawValue,
      VilaroLocationCommand.Get.rawValue,
      VilaroMotionCommand.Activity.rawValue,
      VilaroMotionCommand.Pedometer.rawValue,
      VilaroSmsCommand.Send.rawValue,
    )

  private val debugCommands = setOf("debug.logs", "debug.ed25519")

  @Test
  fun advertisedCapabilities_respectsFeatureAvailability() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags())

    assertContainsAll(capabilities, coreCapabilities)
    assertMissingAll(capabilities, optionalCapabilities)
  }

  @Test
  fun advertisedCapabilities_includesFeatureCapabilitiesWhenEnabled() {
    val capabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          smsAvailable = true,
          voiceWakeEnabled = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
        ),
      )

    assertContainsAll(capabilities, coreCapabilities + optionalCapabilities)
  }

  @Test
  fun advertisedCommands_respectsFeatureAvailability() {
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags())

    assertContainsAll(commands, coreCommands)
    assertMissingAll(commands, optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_includesFeatureCommandsWhenEnabled() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          smsAvailable = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
          debugBuild = true,
        ),
      )

    assertContainsAll(commands, coreCommands + optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_onlyIncludesSupportedMotionCommands() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        NodeRuntimeFlags(
          cameraEnabled = false,
          locationEnabled = false,
          smsAvailable = false,
          voiceWakeEnabled = false,
          motionActivityAvailable = true,
          motionPedometerAvailable = false,
          debugBuild = false,
        ),
      )

    assertTrue(commands.contains(VilaroMotionCommand.Activity.rawValue))
    assertFalse(commands.contains(VilaroMotionCommand.Pedometer.rawValue))
  }

  private fun defaultFlags(
    cameraEnabled: Boolean = false,
    locationEnabled: Boolean = false,
    smsAvailable: Boolean = false,
    voiceWakeEnabled: Boolean = false,
    motionActivityAvailable: Boolean = false,
    motionPedometerAvailable: Boolean = false,
    debugBuild: Boolean = false,
  ): NodeRuntimeFlags =
    NodeRuntimeFlags(
      cameraEnabled = cameraEnabled,
      locationEnabled = locationEnabled,
      smsAvailable = smsAvailable,
      voiceWakeEnabled = voiceWakeEnabled,
      motionActivityAvailable = motionActivityAvailable,
      motionPedometerAvailable = motionPedometerAvailable,
      debugBuild = debugBuild,
    )

  private fun assertContainsAll(actual: List<String>, expected: Set<String>) {
    expected.forEach { value -> assertTrue(actual.contains(value)) }
  }

  private fun assertMissingAll(actual: List<String>, forbidden: Set<String>) {
    forbidden.forEach { value -> assertFalse(actual.contains(value)) }
  }
}
