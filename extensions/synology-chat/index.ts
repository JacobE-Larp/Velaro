import type { VilaroPluginApi } from "vilaro/plugin-sdk/synology-chat";
import { emptyPluginConfigSchema } from "vilaro/plugin-sdk/synology-chat";
import { synologyChatPlugin } from "./src/channel.js";
import { setSynologyRuntime } from "./src/runtime.js";

const plugin = {
  id: "synology-chat",
  name: "Synology Chat",
  description: "Native Synology Chat channel plugin for Vilaro",
  configSchema: emptyPluginConfigSchema(),
  register(api: VilaroPluginApi) {
    setSynologyRuntime(api.runtime);
    api.registerChannel({ plugin: synologyChatPlugin });
  },
};

export default plugin;
