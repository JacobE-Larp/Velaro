// Narrow plugin-sdk surface for the bundled vilaro plugin.
// Keep this list additive and scoped to symbols used under extensions/vilaro.

export {
  applyWindowsSpawnProgramPolicy,
  materializeWindowsSpawnProgram,
  resolveWindowsSpawnProgramCandidate,
} from "./windows-spawn.js";
export type {
  AnyAgentTool,
  VilaroPluginApi,
  VelaroPluginToolContext,
  VelaroPluginToolFactory,
} from "../plugins/types.js";
