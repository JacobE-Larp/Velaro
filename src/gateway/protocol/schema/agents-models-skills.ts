import { Type } from "@sinclair/typebox";
import { NonEmptyString } from "./primitives.js";

export const ModelChoiceSchema = Type.Object(
  {
    id: NonEmptyString,
    name: NonEmptyString,
    provider: NonEmptyString,
    contextWindow: Type.Optional(Type.Integer({ minimum: 1 })),
    reasoning: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false },
);

export const AgentSummarySchema = Type.Object(
  {
    id: NonEmptyString,
    name: Type.Optional(NonEmptyString),
    identity: Type.Optional(
      Type.Object(
        {
          name: Type.Optional(NonEmptyString),
          theme: Type.Optional(NonEmptyString),
          emoji: Type.Optional(NonEmptyString),
          avatar: Type.Optional(NonEmptyString),
          avatarUrl: Type.Optional(NonEmptyString),
        },
        { additionalProperties: false },
      ),
    ),
  },
  { additionalProperties: false },
);

export const AgentsListParamsSchema = Type.Object({}, { additionalProperties: false });

export const AgentsListResultSchema = Type.Object(
  {
    defaultId: NonEmptyString,
    mainKey: NonEmptyString,
    scope: Type.Union([Type.Literal("per-sender"), Type.Literal("global")]),
    agents: Type.Array(AgentSummarySchema),
  },
  { additionalProperties: false },
);

export const AgentsCreateParamsSchema = Type.Object(
  {
    name: NonEmptyString,
    workspace: NonEmptyString,
    emoji: Type.Optional(Type.String()),
    avatar: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

export const AgentsCreateResultSchema = Type.Object(
  {
    ok: Type.Literal(true),
    agentId: NonEmptyString,
    name: NonEmptyString,
    workspace: NonEmptyString,
  },
  { additionalProperties: false },
);

export const AgentsUpdateParamsSchema = Type.Object(
  {
    agentId: NonEmptyString,
    name: Type.Optional(NonEmptyString),
    workspace: Type.Optional(NonEmptyString),
    model: Type.Optional(NonEmptyString),
    avatar: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

export const AgentsUpdateResultSchema = Type.Object(
  {
    ok: Type.Literal(true),
    agentId: NonEmptyString,
  },
  { additionalProperties: false },
);

export const AgentsDeleteParamsSchema = Type.Object(
  {
    agentId: NonEmptyString,
    deleteFiles: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false },
);

export const AgentsDeleteResultSchema = Type.Object(
  {
    ok: Type.Literal(true),
    agentId: NonEmptyString,
    removedBindings: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false },
);

export const AgentsFileEntrySchema = Type.Object(
  {
    name: NonEmptyString,
    path: NonEmptyString,
    missing: Type.Boolean(),
    size: Type.Optional(Type.Integer({ minimum: 0 })),
    updatedAtMs: Type.Optional(Type.Integer({ minimum: 0 })),
    content: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

export const AgentsFilesListParamsSchema = Type.Object(
  {
    agentId: NonEmptyString,
  },
  { additionalProperties: false },
);

export const AgentsFilesListResultSchema = Type.Object(
  {
    agentId: NonEmptyString,
    workspace: NonEmptyString,
    files: Type.Array(AgentsFileEntrySchema),
  },
  { additionalProperties: false },
);

export const AgentsFilesGetParamsSchema = Type.Object(
  {
    agentId: NonEmptyString,
    name: NonEmptyString,
  },
  { additionalProperties: false },
);

export const AgentsFilesGetResultSchema = Type.Object(
  {
    agentId: NonEmptyString,
    workspace: NonEmptyString,
    file: AgentsFileEntrySchema,
  },
  { additionalProperties: false },
);

export const AgentsFilesSetParamsSchema = Type.Object(
  {
    agentId: NonEmptyString,
    name: NonEmptyString,
    content: Type.String(),
  },
  { additionalProperties: false },
);

export const AgentsFilesSetResultSchema = Type.Object(
  {
    ok: Type.Literal(true),
    agentId: NonEmptyString,
    workspace: NonEmptyString,
    file: AgentsFileEntrySchema,
  },
  { additionalProperties: false },
);

export const ModelsListParamsSchema = Type.Object({}, { additionalProperties: false });

export const ModelsListResultSchema = Type.Object(
  {
    models: Type.Array(ModelChoiceSchema),
  },
  { additionalProperties: false },
);

export const SkillsStatusParamsSchema = Type.Object(
  {
    agentId: Type.Optional(NonEmptyString),
  },
  { additionalProperties: false },
);

export const SkillsBinsParamsSchema = Type.Object({}, { additionalProperties: false });

export const SkillsBinsResultSchema = Type.Object(
  {
    bins: Type.Array(NonEmptyString),
  },
  { additionalProperties: false },
);

export const SkillsInstallParamsSchema = Type.Object(
  {
    name: NonEmptyString,
    installId: NonEmptyString,
    timeoutMs: Type.Optional(Type.Integer({ minimum: 1000 })),
  },
  { additionalProperties: false },
);

export const SkillsUpdateParamsSchema = Type.Object(
  {
    skillKey: NonEmptyString,
    enabled: Type.Optional(Type.Boolean()),
    apiKey: Type.Optional(Type.String()),
    env: Type.Optional(Type.Record(NonEmptyString, Type.String())),
  },
  { additionalProperties: false },
);

export const ToolsCatalogParamsSchema = Type.Object(
  {
    agentId: Type.Optional(NonEmptyString),
    includePlugins: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false },
);

export const ToolCatalogProfileSchema = Type.Object(
  {
    id: Type.Union([
      Type.Literal("minimal"),
      Type.Literal("coding"),
      Type.Literal("messaging"),
      Type.Literal("full"),
    ]),
    label: NonEmptyString,
  },
  { additionalProperties: false },
);

export const ToolCatalogEntrySchema = Type.Object(
  {
    id: NonEmptyString,
    label: NonEmptyString,
    description: Type.String(),
    source: Type.Union([Type.Literal("core"), Type.Literal("plugin")]),
    pluginId: Type.Optional(NonEmptyString),
    optional: Type.Optional(Type.Boolean()),
    defaultProfiles: Type.Array(
      Type.Union([
        Type.Literal("minimal"),
        Type.Literal("coding"),
        Type.Literal("messaging"),
        Type.Literal("full"),
      ]),
    ),
  },
  { additionalProperties: false },
);

export const ToolCatalogGroupSchema = Type.Object(
  {
    id: NonEmptyString,
    label: NonEmptyString,
    source: Type.Union([Type.Literal("core"), Type.Literal("plugin")]),
    pluginId: Type.Optional(NonEmptyString),
    tools: Type.Array(ToolCatalogEntrySchema),
  },
  { additionalProperties: false },
);

export const ToolsCatalogResultSchema = Type.Object(
  {
    agentId: NonEmptyString,
    profiles: Type.Array(ToolCatalogProfileSchema),
    groups: Type.Array(ToolCatalogGroupSchema),
  },
  { additionalProperties: false },
);

// velaro.agents.list — enriched multi-agent listing with role and delegation metadata.

export const VelaroAgentsListParamsSchema = Type.Object({}, { additionalProperties: false });

export type VelaroAgentsListParams = Record<string, never>;

export const VelaroAgentRowSchema = Type.Object(
  {
    id: NonEmptyString,
    name: Type.Optional(NonEmptyString),
    role: Type.Union([
      Type.Literal("head"),
      Type.Literal("specialist"),
      Type.Literal("standalone"),
    ]),
    isHead: Type.Boolean(),
    default: Type.Boolean(),
    status: Type.Union([
      Type.Literal("configured"),
      Type.Literal("available"),
      Type.Literal("active"),
    ]),
    delegatesTo: Type.Optional(Type.Array(NonEmptyString)),
    canDelegate: Type.Boolean(),
    /** Runtime IDs this agent is allowed to hand off to (from runtime-handoff plugin config). */
    allowedRuntimes: Type.Optional(Type.Array(NonEmptyString)),
  },
  { additionalProperties: false },
);

export type VelaroAgentRow = {
  id: string;
  name?: string;
  role: "head" | "specialist" | "standalone";
  isHead: boolean;
  default: boolean;
  status: "configured" | "available" | "active";
  delegatesTo?: string[];
  canDelegate: boolean;
  allowedRuntimes?: string[];
};

export const VelaroAgentsSummarySchema = Type.Object(
  {
    total: Type.Integer({ minimum: 0 }),
    configured: Type.Integer({ minimum: 0 }),
    available: Type.Integer({ minimum: 0 }),
    active: Type.Integer({ minimum: 0 }),
    head: Type.Integer({ minimum: 0 }),
    subAgents: Type.Integer({ minimum: 0 }),
    defaultAgentId: Type.String(),
  },
  { additionalProperties: false },
);

export const VelaroAgentsListResultSchema = Type.Object(
  {
    agents: Type.Array(VelaroAgentRowSchema),
    summary: VelaroAgentsSummarySchema,
  },
  { additionalProperties: false },
);

export type VelaroAgentsListResult = {
  agents: VelaroAgentRow[];
  summary: {
    total: number;
    configured: number;
    available: number;
    active: number;
    head: number;
    subAgents: number;
    defaultAgentId: string;
  };
};

// velaro.runtimes.list — list configured execution runtimes from runtime-handoff plugin.

export const VelaroRuntimesListParamsSchema = Type.Object({}, { additionalProperties: false });

export type VelaroRuntimesListParams = Record<string, never>;

export const VelaroRuntimeRowSchema = Type.Object(
  {
    id: NonEmptyString,
    name: Type.Optional(NonEmptyString),
    description: Type.Optional(Type.String()),
    type: Type.Optional(NonEmptyString),
    enabled: Type.Boolean(),
    command: Type.Optional(NonEmptyString),
    allowedAgents: Type.Optional(Type.Array(NonEmptyString)),
    timeoutSeconds: Type.Optional(Type.Integer({ minimum: 1 })),
  },
  { additionalProperties: false },
);

export type VelaroRuntimeRow = {
  id: string;
  name?: string;
  description?: string;
  type?: string;
  enabled: boolean;
  command?: string;
  allowedAgents?: string[];
  timeoutSeconds?: number;
};

export const VelaroRuntimesSummarySchema = Type.Object(
  {
    total: Type.Integer({ minimum: 0 }),
    enabled: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false },
);

export const VelaroRuntimesListResultSchema = Type.Object(
  {
    runtimes: Type.Array(VelaroRuntimeRowSchema),
    summary: VelaroRuntimesSummarySchema,
  },
  { additionalProperties: false },
);

export type VelaroRuntimesListResult = {
  runtimes: VelaroRuntimeRow[];
  summary: {
    total: number;
    enabled: number;
  };
};
