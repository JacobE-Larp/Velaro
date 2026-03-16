import type { VilaroPluginApi } from "vilaro/plugin-sdk";
import { emptyPluginConfigSchema } from "vilaro/plugin-sdk";
import { discordPlugin } from "./src/channel.js";
import { setDiscordRuntime } from "./src/runtime.js";
import { registerDiscordSubagentHooks } from "./src/subagent-hooks.js";

const plugin = {
  id: "discord",
  name: "Discord",
  description: "Discord channel plugin",
  configSchema: emptyPluginConfigSchema(),
  register(api: VilaroPluginApi) {
    setDiscordRuntime(api.runtime);
    api.registerChannel({ plugin: discordPlugin });
    if (api.registrationMode !== "full") {
      return;
    }
    registerDiscordSubagentHooks(api);
  },
};

export default plugin;
