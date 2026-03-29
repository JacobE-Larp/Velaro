import { loadConfig } from "../../config/config.js";
import type {
  VelaroRuntimeRow,
  VelaroRuntimesListResult,
} from "../protocol/schema/agents-models-skills.js";
import type { GatewayRequestHandlers } from "./types.js";

export const runtimesHandlers: GatewayRequestHandlers = {
  "velaro.runtimes.list": ({ respond }) => {
    const cfg = loadConfig();

    // Read runtime-handoff plugin config.
    const pluginCfg = cfg.plugins?.entries?.["runtime-handoff"]?.config;
    const pluginEnabled =
      pluginCfg == null || (pluginCfg as { enabled?: boolean }).enabled !== false;
    const rawRuntimes =
      pluginEnabled &&
      pluginCfg != null &&
      typeof pluginCfg === "object" &&
      !Array.isArray(pluginCfg)
        ? ((pluginCfg as { runtimes?: unknown }).runtimes ?? {})
        : {};

    const runtimes: VelaroRuntimeRow[] = [];

    if (rawRuntimes && typeof rawRuntimes === "object" && !Array.isArray(rawRuntimes)) {
      for (const [id, raw] of Object.entries(rawRuntimes as Record<string, unknown>)) {
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
          continue;
        }
        const entry = raw as Record<string, unknown>;

        const enabled = entry.enabled !== false;
        const name =
          typeof entry.name === "string" && entry.name.trim() ? entry.name.trim() : undefined;
        const description = typeof entry.description === "string" ? entry.description : undefined;
        const type =
          typeof entry.type === "string" && entry.type.trim() ? entry.type.trim() : undefined;
        const command =
          typeof entry.command === "string" && entry.command.trim()
            ? entry.command.trim()
            : undefined;
        const allowedAgents = Array.isArray(entry.allowedAgents)
          ? entry.allowedAgents.filter((a): a is string => typeof a === "string")
          : undefined;
        const timeoutSeconds =
          typeof entry.timeoutSeconds === "number" && entry.timeoutSeconds >= 1
            ? Math.floor(entry.timeoutSeconds)
            : undefined;

        runtimes.push({
          id,
          ...(name !== undefined ? { name } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(type !== undefined ? { type } : {}),
          enabled,
          ...(command !== undefined ? { command } : {}),
          ...(allowedAgents !== undefined ? { allowedAgents } : {}),
          ...(timeoutSeconds !== undefined ? { timeoutSeconds } : {}),
        });
      }
    }

    const enabledCount = runtimes.filter((r) => r.enabled).length;
    const result: VelaroRuntimesListResult = {
      runtimes,
      summary: {
        total: runtimes.length,
        enabled: enabledCount,
      },
    };

    respond(true, result, undefined);
  },
};
