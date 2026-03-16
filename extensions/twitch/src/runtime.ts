import { createPluginRuntimeStore } from "vilaro/plugin-sdk/compat";
import type { PluginRuntime } from "vilaro/plugin-sdk/twitch";

const { setRuntime: setTwitchRuntime, getRuntime: getTwitchRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Twitch runtime not initialized");
export { getTwitchRuntime, setTwitchRuntime };
