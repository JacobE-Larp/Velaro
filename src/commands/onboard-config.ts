import type { VilaroConfig } from "../config/config.js";
import type { DmScope } from "../config/types.base.js";
import type { ToolProfileId } from "../config/types.tools.js";

export const ONBOARDING_DEFAULT_DM_SCOPE: DmScope = "per-channel-peer";
export const ONBOARDING_DEFAULT_TOOLS_PROFILE: ToolProfileId = "coding";

export function applyLocalSetupWorkspaceConfig(
  baseConfig: VilaroConfig,
  workspaceDir: string,
): VilaroConfig {
  const patch: Partial<VilaroConfig> = {};
  if (!baseConfig.agents?.list?.length) {
    patch.agents = {
      list: [{ id: "main", name: "Velaro", default: true }],
    };
  }
  return {
    ...baseConfig,
    agents: {
      ...baseConfig.agents,
      ...patch.agents,
      defaults: {
        ...baseConfig.agents?.defaults,
        workspace: workspaceDir,
      },
    },
    gateway: {
      ...baseConfig.gateway,
      mode: "local",
    },
    session: {
      ...baseConfig.session,
      dmScope: baseConfig.session?.dmScope ?? ONBOARDING_DEFAULT_DM_SCOPE,
    },
    tools: {
      ...baseConfig.tools,
      profile: baseConfig.tools?.profile ?? ONBOARDING_DEFAULT_TOOLS_PROFILE,
    },
  };
}
