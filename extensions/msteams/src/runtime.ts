import { createPluginRuntimeStore } from "vilaro/plugin-sdk/compat";
import type { PluginRuntime } from "vilaro/plugin-sdk/msteams";

const { setRuntime: setMSTeamsRuntime, getRuntime: getMSTeamsRuntime } =
  createPluginRuntimeStore<PluginRuntime>("MSTeams runtime not initialized");
export { getMSTeamsRuntime, setMSTeamsRuntime };
