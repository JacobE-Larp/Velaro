// Narrow plugin-sdk surface for the bundled llm-task plugin.
// Keep this list additive and scoped to symbols used under extensions/llm-task.

export { resolvePreferredVilaroTmpDir } from "../infra/tmp-vilaro-dir.js";
export {
  formatThinkingLevels,
  formatXHighModelHint,
  normalizeThinkLevel,
  supportsXHighThinking,
} from "../auto-reply/thinking.js";
export type { AnyAgentTool, VilaroPluginApi } from "../plugins/types.js";
