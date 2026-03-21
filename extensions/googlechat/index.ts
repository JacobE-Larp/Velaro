import type { VilaroPluginApi } from "vilaro/plugin-sdk/googlechat";
import { emptyPluginConfigSchema } from "vilaro/plugin-sdk/googlechat";
import { googlechatPlugin } from "./src/channel.js";
import { setGoogleChatRuntime } from "./src/runtime.js";

const plugin = {
  id: "googlechat",
  name: "Google Chat",
  description: "Velaro Google Chat channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: VilaroPluginApi) {
    setGoogleChatRuntime(api.runtime);
    api.registerChannel(googlechatPlugin);
  },
};

export default plugin;
