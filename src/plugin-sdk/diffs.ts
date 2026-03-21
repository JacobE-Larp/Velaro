// Narrow plugin-sdk surface for the bundled diffs plugin.
// Keep this list additive and scoped to symbols used under extensions/diffs.

export type { VilaroConfig } from "../config/config.js";
export { resolvePreferredVilaroTmpDir } from "../infra/tmp-vilaro-dir.js";
export type {
  AnyAgentTool,
  VilaroPluginApi,
  VelaroPluginConfigSchema,
  PluginLogger,
} from "../plugins/types.js";
