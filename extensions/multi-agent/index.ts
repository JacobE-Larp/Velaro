import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Type } from "@sinclair/typebox";
import type { VilaroPluginApi } from "vilaro/plugin-sdk";
import { jsonResult } from "vilaro/plugin-sdk";

const execFileAsync = promisify(execFile);

type AgentRole = "head" | "specialist";

type AgentMeta = {
  role?: AgentRole;
  delegatesTo?: string[];
};

type MultiAgentPluginConfig = {
  agents?: Record<string, AgentMeta>;
};

const DEFAULT_DELEGATE_TIMEOUT_MS = 60_000;

const DelegateToAgentSchema = Type.Object(
  {
    agentId: Type.String({ description: "The ID of the sub-agent to delegate to." }),
    task: Type.String({ description: "The task or message to send to the sub-agent." }),
  },
  { additionalProperties: false },
);

function resolveAgentMeta(pluginCfg: MultiAgentPluginConfig, agentId: string): AgentMeta {
  return pluginCfg.agents?.[agentId] ?? {};
}

function buildSubAgentContext(
  delegatesTo: string[],
  agentList: Array<{ id: string; name?: string }>,
): string {
  const lines = delegatesTo.map((id) => {
    const entry = agentList.find((a) => a.id === id);
    const label = entry?.name ? `${id} (${entry.name})` : id;
    return `- ${label}`;
  });
  return [
    "## Multi-Agent Coordination",
    "",
    "You are the head agent. You can delegate tasks to specialist sub-agents using the `delegate_to_agent` tool.",
    "",
    "Available sub-agents:",
    ...lines,
    "",
    "Delegate when a task is clearly within a sub-agent's specialty. One-hop only: sub-agents cannot delegate further.",
  ].join("\n");
}

const multiAgentConfigSchema = {
  safeParse(value: unknown): {
    success: boolean;
    data?: unknown;
    error?: { issues?: Array<{ path: Array<string | number>; message: string }> };
  } {
    if (value === undefined || value === null) {
      return { success: true, data: undefined };
    }
    if (typeof value !== "object" || Array.isArray(value)) {
      return {
        success: false,
        error: { issues: [{ path: [], message: "expected config object" }] },
      };
    }
    return { success: true, data: value };
  },
  jsonSchema: {
    type: "object",
    additionalProperties: false,
    properties: {
      agents: {
        type: "object",
        additionalProperties: {
          type: "object",
          properties: {
            role: { type: "string", enum: ["head", "specialist"] },
            delegatesTo: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
  },
};

const plugin = {
  id: "multi-agent",
  name: "Multi-Agent",
  description:
    "Role-based multi-agent coordination with delegation from head to specialist agents.",
  configSchema: multiAgentConfigSchema,
  register(api: VilaroPluginApi) {
    const pluginCfg = (api.pluginConfig ?? {}) as MultiAgentPluginConfig;

    // Inject context into head agent prompts so it knows about its sub-agents.
    api.on("before_prompt_build", (_event, ctx) => {
      const agentId = ctx.agentId ?? "";
      const meta = resolveAgentMeta(pluginCfg, agentId);
      if (meta.role !== "head") return;

      const delegatesTo = meta.delegatesTo ?? [];
      if (delegatesTo.length === 0) return;

      const agentList = (api.config.agents?.list ?? []).map((a) => ({
        id: String(a.id ?? ""),
        name: typeof a.name === "string" ? a.name : undefined,
      }));

      return {
        prependSystemContext: buildSubAgentContext(delegatesTo, agentList),
      };
    });

    // Register the delegate_to_agent tool. The factory returns null for non-head agents,
    // so the tool only appears for agents with role="head".
    api.registerTool(
      (toolCtx) => {
        const agentId = toolCtx.agentId ?? "";
        const meta = resolveAgentMeta(pluginCfg, agentId);
        if (meta.role !== "head") return null;

        const delegatesTo = new Set(meta.delegatesTo ?? []);
        const timeoutMs = DEFAULT_DELEGATE_TIMEOUT_MS;

        return {
          name: "delegate_to_agent",
          label: "Delegate to Agent",
          description:
            "Delegate a task to a specialist sub-agent. One-hop only: sub-agents cannot delegate further.",
          parameters: DelegateToAgentSchema,
          // execute receives (toolCallId, params, signal?)
          execute: async (_toolCallId: string, params: Record<string, unknown>) => {
            const targetId = String(params.agentId ?? "").trim();
            const task = String(params.task ?? "").trim();

            if (!targetId) {
              throw new Error("agentId is required");
            }
            if (targetId === agentId) {
              throw new Error("Cannot delegate to self.");
            }
            if (!delegatesTo.has(targetId)) {
              throw new Error(
                `Agent "${targetId}" is not in the delegation list. Allowed: ${[...delegatesTo].join(", ")}`,
              );
            }
            if (!task) {
              throw new Error("task is required");
            }

            try {
              const { stdout } = await execFileAsync(
                "vilaro",
                ["agent", "--agent", targetId, "--message", task],
                { timeout: timeoutMs },
              );
              return jsonResult({ ok: true, agentId: targetId, output: stdout.trim() });
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              throw new Error(`Delegation to "${targetId}" failed: ${msg}`);
            }
          },
        };
      },
      { names: ["delegate_to_agent"] },
    );
  },
};

export default plugin;
