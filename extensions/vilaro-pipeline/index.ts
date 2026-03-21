import type {
  AnyAgentTool,
  VilaroPluginApi,
  VelaroPluginToolFactory,
} from "vilaro/plugin-sdk/pipeline";
import { createPipelineTool } from "./src/pipeline-tool.js";

export default function register(api: VilaroPluginApi) {
  api.registerTool(
    ((ctx) => {
      if (ctx.sandboxed) {
        return null;
      }
      return createPipelineTool(api) as AnyAgentTool;
    }) as VelaroPluginToolFactory,
    { optional: true },
  );
}
