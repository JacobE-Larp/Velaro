import type { VilaroConfig } from "./config.js";

export function ensurePluginAllowlisted(cfg: VilaroConfig, pluginId: string): VilaroConfig {
  const allow = cfg.plugins?.allow;
  if (!Array.isArray(allow) || allow.includes(pluginId)) {
    return cfg;
  }
  return {
    ...cfg,
    plugins: {
      ...cfg.plugins,
      allow: [...allow, pluginId],
    },
  };
}
