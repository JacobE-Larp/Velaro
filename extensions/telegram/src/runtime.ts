import type { PluginRuntime } from "vilaro/plugin-sdk";
import { createPluginRuntimeStore } from "vilaro/plugin-sdk/compat";

const { setRuntime: setTelegramRuntime, getRuntime: getTelegramRuntime } =
  createPluginRuntimeStore<PluginRuntime>("Telegram runtime not initialized");
export { getTelegramRuntime, setTelegramRuntime };
