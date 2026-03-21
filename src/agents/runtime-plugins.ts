import type { VilaroConfig } from "../config/config.js";
import { loadVelaroPlugins } from "../plugins/loader.js";
import { resolveUserPath } from "../utils.js";

export function ensureRuntimePluginsLoaded(params: {
  config?: VilaroConfig;
  workspaceDir?: string | null;
}): void {
  const workspaceDir =
    typeof params.workspaceDir === "string" && params.workspaceDir.trim()
      ? resolveUserPath(params.workspaceDir)
      : undefined;

  loadVelaroPlugins({
    config: params.config,
    workspaceDir,
  });
}
