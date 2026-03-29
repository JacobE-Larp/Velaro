import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { Type } from "@sinclair/typebox";
import type { VilaroPluginApi } from "vilaro/plugin-sdk";
import { jsonResult } from "vilaro/plugin-sdk";

const execFileAsync = promisify(execFile);

// ─── Config types ────────────────────────────────────────────────────────────

type RuntimeType = "cli";

export type RuntimeDefinition = {
  id: string;
  name?: string;
  type?: RuntimeType;
  enabled?: boolean;
  description?: string;
  /** Executable name or path. E.g. "claude". */
  command?: string;
  /**
   * Argument list passed to the command.
   * Use `{{task}}` as a placeholder — it will be substituted with the task string.
   * Interpolation is done per-element; no shell execution.
   */
  argsTemplate?: string[];
  /** Seconds before the subprocess is killed. Default: 60. */
  timeoutSeconds?: number;
  /** Agent IDs allowed to call this runtime. Empty/absent = nobody. */
  allowedAgents?: string[];
  metadata?: Record<string, unknown>;
};

type RuntimeHandoffPluginConfig = {
  /** Master switch. Defaults to true if the plugin entry is enabled. */
  enabled?: boolean;
  runtimes?: Record<string, RuntimeDefinition>;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_TIMEOUT_SECONDS = 60;
/** Hard cap on stdout/stderr bytes returned to the agent. */
const MAX_OUTPUT_BYTES = 100_000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveRuntimes(cfg: RuntimeHandoffPluginConfig): Map<string, RuntimeDefinition> {
  const map = new Map<string, RuntimeDefinition>();
  if (!cfg.runtimes || typeof cfg.runtimes !== "object") return map;
  for (const [id, raw] of Object.entries(cfg.runtimes)) {
    if (!raw || typeof raw !== "object") continue;
    map.set(id, { ...raw, id });
  }
  return map;
}

/** Substitute {{task}} in each arg. Safe: builds array, never uses shell. */
function interpolateArgs(argsTemplate: string[], task: string): string[] {
  return argsTemplate.map((arg) => arg.replaceAll("{{task}}", task));
}

function isAgentAllowed(runtime: RuntimeDefinition, agentId: string): boolean {
  const allowed = runtime.allowedAgents;
  if (!Array.isArray(allowed) || allowed.length === 0) return false;
  return allowed.includes(agentId);
}

function capOutput(text: string): string {
  const enc = new TextEncoder();
  const bytes = enc.encode(text);
  if (bytes.length <= MAX_OUTPUT_BYTES) return text;
  // Trim to byte cap and append notice.
  const slice = new TextDecoder().decode(bytes.slice(0, MAX_OUTPUT_BYTES));
  return `${slice}\n\n[output truncated at ${MAX_OUTPUT_BYTES} bytes]`;
}

function buildRuntimeContext(
  runtimes: Map<string, RuntimeDefinition>,
  agentId: string,
): string | null {
  const accessible = [...runtimes.values()].filter(
    (r) => r.enabled !== false && isAgentAllowed(r, agentId),
  );
  if (accessible.length === 0) return null;

  const lines = accessible.map((r) => {
    const label = r.name ? `${r.id} (${r.name})` : r.id;
    const desc = r.description ? ` — ${r.description}` : "";
    return `- ${label}${desc}`;
  });

  return [
    "## Runtime Handoff",
    "",
    "You can delegate execution tasks to the following runtimes using the `handoff_to_runtime` tool:",
    "",
    ...lines,
    "",
    "Use runtimes for structured execution tasks (coding, browsing, etc.) that benefit from a dedicated operator.",
  ].join("\n");
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const HandoffToRuntimeSchema = Type.Object(
  {
    runtimeId: Type.String({ description: "ID of the runtime to hand off to." }),
    task: Type.String({ description: "Task description or instruction to execute." }),
  },
  { additionalProperties: false },
);

// ─── Config schema ───────────────────────────────────────────────────────────

const runtimeHandoffConfigSchema = {
  safeParse(value: unknown): {
    success: boolean;
    data?: unknown;
    error?: { issues?: Array<{ path: Array<string | number>; message: string }> };
  } {
    if (value === undefined || value === null) return { success: true, data: undefined };
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
      enabled: { type: "boolean" },
      runtimes: { type: "object" },
    },
  },
};

// ─── Plugin ──────────────────────────────────────────────────────────────────

const plugin = {
  id: "runtime-handoff",
  name: "Runtime Handoff",
  description: "Delegates agent tasks to configured execution runtimes (claude-code, etc.).",
  configSchema: runtimeHandoffConfigSchema,
  register(api: VilaroPluginApi) {
    const pluginCfg = (api.pluginConfig ?? {}) as RuntimeHandoffPluginConfig;

    // Master switch — if config says enabled:false, do nothing.
    if (pluginCfg.enabled === false) return;

    const runtimes = resolveRuntimes(pluginCfg);
    if (runtimes.size === 0) return;

    // Inject runtime context into prompts for agents that have access to at least one runtime.
    api.on("before_prompt_build", (_event, ctx) => {
      const agentId = ctx.agentId ?? "";
      const context = buildRuntimeContext(runtimes, agentId);
      if (!context) return;
      return { prependSystemContext: context };
    });

    // Register handoff_to_runtime tool. Factory returns null for agents with no runtime access.
    api.registerTool(
      (toolCtx) => {
        const agentId = toolCtx.agentId ?? "";

        // Check if this agent can reach any runtime at all.
        const accessible = [...runtimes.values()].filter(
          (r) => r.enabled !== false && isAgentAllowed(r, agentId),
        );
        if (accessible.length === 0) return null;

        return {
          name: "handoff_to_runtime",
          label: "Handoff to Runtime",
          description:
            "Delegate a task to a configured execution runtime. Returns the runtime's output.",
          parameters: HandoffToRuntimeSchema,
          execute: async (_toolCallId: string, params: Record<string, unknown>) => {
            const runtimeId = String(params.runtimeId ?? "").trim();
            const task = String(params.task ?? "").trim();

            if (!runtimeId) throw new Error("runtimeId is required");
            if (!task) throw new Error("task is required");

            const runtime = runtimes.get(runtimeId);
            if (!runtime) {
              throw new Error(
                `Runtime "${runtimeId}" not found. Available: ${[...runtimes.keys()].join(", ")}`,
              );
            }
            if (runtime.enabled === false) {
              throw new Error(`Runtime "${runtimeId}" is disabled.`);
            }
            if (!isAgentAllowed(runtime, agentId)) {
              throw new Error(`Agent "${agentId}" is not allowed to use runtime "${runtimeId}".`);
            }

            const command = runtime.command;
            if (!command) {
              throw new Error(`Runtime "${runtimeId}" has no command configured.`);
            }
            const argsTemplate = runtime.argsTemplate ?? [];
            if (!argsTemplate || !argsTemplate.some((arg) => arg.includes("{{task}}"))) {
              throw new Error(
                `Runtime "${runtimeId}" misconfigured: argsTemplate must include {{task}}`,
              );
            }
            const args = interpolateArgs(argsTemplate, task);
            const timeoutMs = (runtime.timeoutSeconds ?? DEFAULT_TIMEOUT_SECONDS) * 1000;

            let stdout = "";
            let stderr = "";
            try {
              const result = await execFileAsync(command, args, { timeout: timeoutMs });
              stdout = result.stdout;
              stderr = result.stderr;
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              throw new Error(`Runtime "${runtimeId}" execution failed: ${msg}`);
            }

            const output = capOutput((stdout + (stderr ? `\n[stderr]: ${stderr}` : "")).trim());
            return jsonResult({ ok: true, runtimeId, output });
          },
        };
      },
      { names: ["handoff_to_runtime"] },
    );
  },
};

export default plugin;
export type { RuntimeHandoffPluginConfig };
