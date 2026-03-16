import type { PluginRuntime } from "vilaro/plugin-sdk";
import { createPluginRuntimeStore } from "vilaro/plugin-sdk/compat";

const { setRuntime: setDiscordRuntime, getRuntime: getDiscordRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Discord runtime not initialized");
export { getDiscordRuntime, setDiscordRuntime };
