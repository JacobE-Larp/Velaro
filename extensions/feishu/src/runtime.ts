import { createPluginRuntimeStore } from "vilaro/plugin-sdk/compat";
import type { PluginRuntime } from "vilaro/plugin-sdk/feishu";

const { setRuntime: setFeishuRuntime, getRuntime: getFeishuRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Feishu runtime not initialized");
export { getFeishuRuntime, setFeishuRuntime };
