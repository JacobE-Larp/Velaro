import type { PluginRuntime } from "vilaro/plugin-sdk";
import { createPluginRuntimeStore } from "vilaro/plugin-sdk/compat";

const { setRuntime: setWhatsAppRuntime, getRuntime: getWhatsAppRuntime } =
  createPluginRuntimeStore<PluginRuntime>("WhatsApp runtime not initialized");
export { getWhatsAppRuntime, setWhatsAppRuntime };
