import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolvePluginWebSearchProviders } from "./web-search-providers.js";

const loadVilaroPluginsMock = vi.fn();

vi.mock("./loader.js", () => ({
  loadVilaroPlugins: (...args: unknown[]) => loadVilaroPluginsMock(...args),
}));

describe("resolvePluginWebSearchProviders", () => {
  beforeEach(() => {
    loadVilaroPluginsMock.mockReset();
    loadVilaroPluginsMock.mockReturnValue({
      webSearchProviders: [
        {
          pluginId: "google",
          provider: {
            id: "gemini",
            label: "Gemini",
            hint: "hint",
            envVars: ["GEMINI_API_KEY"],
            placeholder: "AIza...",
            signupUrl: "https://example.com",
            autoDetectOrder: 20,
          },
        },
        {
          pluginId: "brave",
          provider: {
            id: "brave",
            label: "Brave",
            hint: "hint",
            envVars: ["BRAVE_API_KEY"],
            placeholder: "BSA...",
            signupUrl: "https://example.com",
            autoDetectOrder: 10,
          },
        },
      ],
    });
  });

  it("forwards an explicit env to plugin loading", () => {
    const env = { VILARO_HOME: "/srv/vilaro-home" } as NodeJS.ProcessEnv;

    const providers = resolvePluginWebSearchProviders({
      workspaceDir: "/workspace/explicit",
      env,
    });

    expect(providers.map((provider) => provider.id)).toEqual(["brave", "gemini"]);
    expect(loadVilaroPluginsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceDir: "/workspace/explicit",
        env,
      }),
    );
  });

  it("can augment restrictive allowlists for bundled compatibility", () => {
    resolvePluginWebSearchProviders({
      config: {
        plugins: {
          allow: ["openrouter"],
        },
      },
      bundledAllowlistCompat: true,
    });

    expect(loadVilaroPluginsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          plugins: expect.objectContaining({
            allow: expect.arrayContaining(["openrouter", "brave", "perplexity"]),
          }),
        }),
      }),
    );
  });

  it("auto-enables bundled web search provider plugins when entries are missing", () => {
    resolvePluginWebSearchProviders({
      config: {
        plugins: {
          entries: {
            openrouter: { enabled: true },
          },
        },
      },
    });

    expect(loadVilaroPluginsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          plugins: expect.objectContaining({
            entries: expect.objectContaining({
              openrouter: { enabled: true },
              brave: { enabled: true },
              firecrawl: { enabled: true },
              google: { enabled: true },
              moonshot: { enabled: true },
              perplexity: { enabled: true },
              xai: { enabled: true },
            }),
          }),
        }),
      }),
    );
  });

  it("preserves explicit bundled provider entry state", () => {
    resolvePluginWebSearchProviders({
      config: {
        plugins: {
          entries: {
            perplexity: { enabled: false },
          },
        },
      },
    });

    expect(loadVilaroPluginsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        config: expect.objectContaining({
          plugins: expect.objectContaining({
            entries: expect.objectContaining({
              perplexity: { enabled: false },
            }),
          }),
        }),
      }),
    );
  });
});
