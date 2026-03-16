import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildPluginStatusReport } from "./status.js";

const loadConfigMock = vi.fn();
const loadVilaroPluginsMock = vi.fn();

vi.mock("../config/config.js", () => ({
  loadConfig: () => loadConfigMock(),
}));

vi.mock("./loader.js", () => ({
  loadVilaroPlugins: (...args: unknown[]) => loadVilaroPluginsMock(...args),
}));

vi.mock("../agents/agent-scope.js", () => ({
  resolveAgentWorkspaceDir: () => undefined,
  resolveDefaultAgentId: () => "default",
}));

vi.mock("../agents/workspace.js", () => ({
  resolveDefaultAgentWorkspaceDir: () => "/default-workspace",
}));

describe("buildPluginStatusReport", () => {
  beforeEach(() => {
    loadConfigMock.mockReset();
    loadVilaroPluginsMock.mockReset();
    loadConfigMock.mockReturnValue({});
    loadVilaroPluginsMock.mockReturnValue({
      plugins: [],
      diagnostics: [],
      channels: [],
      providers: [],
      tools: [],
      hooks: [],
      gatewayHandlers: {},
      cliRegistrars: [],
      services: [],
      commands: [],
    });
  });

  it("forwards an explicit env to plugin loading", () => {
    const env = { HOME: "/tmp/vilaro-home" } as NodeJS.ProcessEnv;

    buildPluginStatusReport({
      config: {},
      workspaceDir: "/workspace",
      env,
    });

    expect(loadVilaroPluginsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        config: {},
        workspaceDir: "/workspace",
        env,
      }),
    );
  });
});
