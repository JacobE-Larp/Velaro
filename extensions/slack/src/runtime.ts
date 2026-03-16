import type { PluginRuntime } from "vilaro/plugin-sdk";
import { createPluginRuntimeStore } from "vilaro/plugin-sdk/compat";

const { setRuntime: setSlackRuntime, getRuntime: getSlackRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Slack runtime not initialized");
export { getSlackRuntime, setSlackRuntime };
