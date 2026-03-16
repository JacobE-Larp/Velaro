import type { PluginRuntime } from "vilaro/plugin-sdk";
import { createPluginRuntimeStore } from "vilaro/plugin-sdk/compat";

const { setRuntime: setSignalRuntime, getRuntime: getSignalRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Signal runtime not initialized");
export { getSignalRuntime, setSignalRuntime };
