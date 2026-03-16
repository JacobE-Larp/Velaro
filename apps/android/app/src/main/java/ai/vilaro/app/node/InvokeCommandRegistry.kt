package ai.vilaro.app.node

import ai.vilaro.app.protocol.VilaroCalendarCommand
import ai.vilaro.app.protocol.VilaroCanvasA2UICommand
import ai.vilaro.app.protocol.VilaroCanvasCommand
import ai.vilaro.app.protocol.VilaroCameraCommand
import ai.vilaro.app.protocol.VilaroCapability
import ai.vilaro.app.protocol.VilaroCallLogCommand
import ai.vilaro.app.protocol.VilaroContactsCommand
import ai.vilaro.app.protocol.VilaroDeviceCommand
import ai.vilaro.app.protocol.VilaroLocationCommand
import ai.vilaro.app.protocol.VilaroMotionCommand
import ai.vilaro.app.protocol.VilaroNotificationsCommand
import ai.vilaro.app.protocol.VilaroPhotosCommand
import ai.vilaro.app.protocol.VilaroSmsCommand
import ai.vilaro.app.protocol.VilaroSystemCommand

data class NodeRuntimeFlags(
  val cameraEnabled: Boolean,
  val locationEnabled: Boolean,
  val smsAvailable: Boolean,
  val voiceWakeEnabled: Boolean,
  val motionActivityAvailable: Boolean,
  val motionPedometerAvailable: Boolean,
  val debugBuild: Boolean,
)

enum class InvokeCommandAvailability {
  Always,
  CameraEnabled,
  LocationEnabled,
  SmsAvailable,
  MotionActivityAvailable,
  MotionPedometerAvailable,
  DebugBuild,
}

enum class NodeCapabilityAvailability {
  Always,
  CameraEnabled,
  LocationEnabled,
  SmsAvailable,
  VoiceWakeEnabled,
  MotionAvailable,
}

data class NodeCapabilitySpec(
  val name: String,
  val availability: NodeCapabilityAvailability = NodeCapabilityAvailability.Always,
)

data class InvokeCommandSpec(
  val name: String,
  val requiresForeground: Boolean = false,
  val availability: InvokeCommandAvailability = InvokeCommandAvailability.Always,
)

object InvokeCommandRegistry {
  val capabilityManifest: List<NodeCapabilitySpec> =
    listOf(
      NodeCapabilitySpec(name = VilaroCapability.Canvas.rawValue),
      NodeCapabilitySpec(name = VilaroCapability.Device.rawValue),
      NodeCapabilitySpec(name = VilaroCapability.Notifications.rawValue),
      NodeCapabilitySpec(name = VilaroCapability.System.rawValue),
      NodeCapabilitySpec(
        name = VilaroCapability.Camera.rawValue,
        availability = NodeCapabilityAvailability.CameraEnabled,
      ),
      NodeCapabilitySpec(
        name = VilaroCapability.Sms.rawValue,
        availability = NodeCapabilityAvailability.SmsAvailable,
      ),
      NodeCapabilitySpec(
        name = VilaroCapability.VoiceWake.rawValue,
        availability = NodeCapabilityAvailability.VoiceWakeEnabled,
      ),
      NodeCapabilitySpec(
        name = VilaroCapability.Location.rawValue,
        availability = NodeCapabilityAvailability.LocationEnabled,
      ),
      NodeCapabilitySpec(name = VilaroCapability.Photos.rawValue),
      NodeCapabilitySpec(name = VilaroCapability.Contacts.rawValue),
      NodeCapabilitySpec(name = VilaroCapability.Calendar.rawValue),
      NodeCapabilitySpec(
        name = VilaroCapability.Motion.rawValue,
        availability = NodeCapabilityAvailability.MotionAvailable,
      ),
      NodeCapabilitySpec(name = VilaroCapability.CallLog.rawValue),
    )

  val all: List<InvokeCommandSpec> =
    listOf(
      InvokeCommandSpec(
        name = VilaroCanvasCommand.Present.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = VilaroCanvasCommand.Hide.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = VilaroCanvasCommand.Navigate.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = VilaroCanvasCommand.Eval.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = VilaroCanvasCommand.Snapshot.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = VilaroCanvasA2UICommand.Push.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = VilaroCanvasA2UICommand.PushJSONL.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = VilaroCanvasA2UICommand.Reset.rawValue,
        requiresForeground = true,
      ),
      InvokeCommandSpec(
        name = VilaroSystemCommand.Notify.rawValue,
      ),
      InvokeCommandSpec(
        name = VilaroCameraCommand.List.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = VilaroCameraCommand.Snap.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = VilaroCameraCommand.Clip.rawValue,
        requiresForeground = true,
        availability = InvokeCommandAvailability.CameraEnabled,
      ),
      InvokeCommandSpec(
        name = VilaroLocationCommand.Get.rawValue,
        availability = InvokeCommandAvailability.LocationEnabled,
      ),
      InvokeCommandSpec(
        name = VilaroDeviceCommand.Status.rawValue,
      ),
      InvokeCommandSpec(
        name = VilaroDeviceCommand.Info.rawValue,
      ),
      InvokeCommandSpec(
        name = VilaroDeviceCommand.Permissions.rawValue,
      ),
      InvokeCommandSpec(
        name = VilaroDeviceCommand.Health.rawValue,
      ),
      InvokeCommandSpec(
        name = VilaroNotificationsCommand.List.rawValue,
      ),
      InvokeCommandSpec(
        name = VilaroNotificationsCommand.Actions.rawValue,
      ),
      InvokeCommandSpec(
        name = VilaroPhotosCommand.Latest.rawValue,
      ),
      InvokeCommandSpec(
        name = VilaroContactsCommand.Search.rawValue,
      ),
      InvokeCommandSpec(
        name = VilaroContactsCommand.Add.rawValue,
      ),
      InvokeCommandSpec(
        name = VilaroCalendarCommand.Events.rawValue,
      ),
      InvokeCommandSpec(
        name = VilaroCalendarCommand.Add.rawValue,
      ),
      InvokeCommandSpec(
        name = VilaroMotionCommand.Activity.rawValue,
        availability = InvokeCommandAvailability.MotionActivityAvailable,
      ),
      InvokeCommandSpec(
        name = VilaroMotionCommand.Pedometer.rawValue,
        availability = InvokeCommandAvailability.MotionPedometerAvailable,
      ),
      InvokeCommandSpec(
        name = VilaroSmsCommand.Send.rawValue,
        availability = InvokeCommandAvailability.SmsAvailable,
      ),
      InvokeCommandSpec(
        name = VilaroCallLogCommand.Search.rawValue,
      ),
      InvokeCommandSpec(
        name = "debug.logs",
        availability = InvokeCommandAvailability.DebugBuild,
      ),
      InvokeCommandSpec(
        name = "debug.ed25519",
        availability = InvokeCommandAvailability.DebugBuild,
      ),
    )

  private val byNameInternal: Map<String, InvokeCommandSpec> = all.associateBy { it.name }

  fun find(command: String): InvokeCommandSpec? = byNameInternal[command]

  fun advertisedCapabilities(flags: NodeRuntimeFlags): List<String> {
    return capabilityManifest
      .filter { spec ->
        when (spec.availability) {
          NodeCapabilityAvailability.Always -> true
          NodeCapabilityAvailability.CameraEnabled -> flags.cameraEnabled
          NodeCapabilityAvailability.LocationEnabled -> flags.locationEnabled
          NodeCapabilityAvailability.SmsAvailable -> flags.smsAvailable
          NodeCapabilityAvailability.VoiceWakeEnabled -> flags.voiceWakeEnabled
          NodeCapabilityAvailability.MotionAvailable -> flags.motionActivityAvailable || flags.motionPedometerAvailable
        }
      }
      .map { it.name }
  }

  fun advertisedCommands(flags: NodeRuntimeFlags): List<String> {
    return all
      .filter { spec ->
        when (spec.availability) {
          InvokeCommandAvailability.Always -> true
          InvokeCommandAvailability.CameraEnabled -> flags.cameraEnabled
          InvokeCommandAvailability.LocationEnabled -> flags.locationEnabled
          InvokeCommandAvailability.SmsAvailable -> flags.smsAvailable
          InvokeCommandAvailability.MotionActivityAvailable -> flags.motionActivityAvailable
          InvokeCommandAvailability.MotionPedometerAvailable -> flags.motionPedometerAvailable
          InvokeCommandAvailability.DebugBuild -> flags.debugBuild
        }
      }
      .map { it.name }
  }
}
