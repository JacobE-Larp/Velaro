import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { withTempDir } from "../test-helpers/temp-dir.js";
import {
  resolveDefaultConfigCandidates,
  resolveConfigPathCandidate,
  resolveConfigPath,
  resolveOAuthDir,
  resolveOAuthPath,
  resolveStateDir,
} from "./paths.js";

describe("oauth paths", () => {
  it("prefers VILARO_OAUTH_DIR over VILARO_STATE_DIR", () => {
    const env = {
      VILARO_OAUTH_DIR: "/custom/oauth",
      VILARO_STATE_DIR: "/custom/state",
    } as NodeJS.ProcessEnv;

    expect(resolveOAuthDir(env, "/custom/state")).toBe(path.resolve("/custom/oauth"));
    expect(resolveOAuthPath(env, "/custom/state")).toBe(
      path.join(path.resolve("/custom/oauth"), "oauth.json"),
    );
  });

  it("derives oauth path from VILARO_STATE_DIR when unset", () => {
    const env = {
      VILARO_STATE_DIR: "/custom/state",
    } as NodeJS.ProcessEnv;

    expect(resolveOAuthDir(env, "/custom/state")).toBe(path.join("/custom/state", "credentials"));
    expect(resolveOAuthPath(env, "/custom/state")).toBe(
      path.join("/custom/state", "credentials", "oauth.json"),
    );
  });
});

describe("state + config path candidates", () => {
  function expectVilaroHomeDefaults(env: NodeJS.ProcessEnv): void {
    const configuredHome = env.VILARO_HOME;
    if (!configuredHome) {
      throw new Error("VILARO_HOME must be set for this assertion helper");
    }
    const resolvedHome = path.resolve(configuredHome);
    expect(resolveStateDir(env)).toBe(path.join(resolvedHome, ".vilaro"));

    const candidates = resolveDefaultConfigCandidates(env);
    expect(candidates[0]).toBe(path.join(resolvedHome, ".vilaro", "vilaro.json"));
  }

  it("uses VILARO_STATE_DIR when set", () => {
    const env = {
      VILARO_STATE_DIR: "/new/state",
    } as NodeJS.ProcessEnv;

    expect(resolveStateDir(env, () => "/home/test")).toBe(path.resolve("/new/state"));
  });

  it("uses VILARO_HOME for default state/config locations", () => {
    const env = {
      VILARO_HOME: "/srv/vilaro-home",
    } as NodeJS.ProcessEnv;
    expectVilaroHomeDefaults(env);
  });

  it("prefers VILARO_HOME over HOME for default state/config locations", () => {
    const env = {
      VILARO_HOME: "/srv/vilaro-home",
      HOME: "/home/other",
    } as NodeJS.ProcessEnv;
    expectVilaroHomeDefaults(env);
  });

  it("orders default config candidates in a stable order", () => {
    const home = "/home/test";
    const resolvedHome = path.resolve(home);
    const candidates = resolveDefaultConfigCandidates({} as NodeJS.ProcessEnv, () => home);
    const expected = [
      path.join(resolvedHome, ".vilaro", "vilaro.json"),
      path.join(resolvedHome, ".vilaro", "vilaro.json"),
      path.join(resolvedHome, ".vilaro", "moldbot.json"),
      path.join(resolvedHome, ".vilaro", "vilaro.json"),
      path.join(resolvedHome, ".vilaro", "vilaro.json"),
      path.join(resolvedHome, ".vilaro", "vilaro.json"),
      path.join(resolvedHome, ".vilaro", "moldbot.json"),
      path.join(resolvedHome, ".vilaro", "vilaro.json"),
      path.join(resolvedHome, ".moldbot", "vilaro.json"),
      path.join(resolvedHome, ".moldbot", "vilaro.json"),
      path.join(resolvedHome, ".moldbot", "moldbot.json"),
      path.join(resolvedHome, ".moldbot", "vilaro.json"),
      path.join(resolvedHome, ".vilaro", "vilaro.json"),
      path.join(resolvedHome, ".vilaro", "vilaro.json"),
      path.join(resolvedHome, ".vilaro", "moldbot.json"),
      path.join(resolvedHome, ".vilaro", "vilaro.json"),
    ];
    expect(candidates).toEqual(expected);
  });

  it("prefers ~/.vilaro when it exists and legacy dir is missing", async () => {
    await withTempDir({ prefix: "vilaro-state-" }, async (root) => {
      const newDir = path.join(root, ".vilaro");
      await fs.mkdir(newDir, { recursive: true });
      const resolved = resolveStateDir({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(newDir);
    });
  });

  it("falls back to existing legacy state dir when ~/.vilaro is missing", async () => {
    await withTempDir({ prefix: "vilaro-state-legacy-" }, async (root) => {
      const legacyDir = path.join(root, ".vilaro");
      await fs.mkdir(legacyDir, { recursive: true });
      const resolved = resolveStateDir({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(legacyDir);
    });
  });

  it("CONFIG_PATH prefers existing config when present", async () => {
    await withTempDir({ prefix: "vilaro-config-" }, async (root) => {
      const legacyDir = path.join(root, ".vilaro");
      await fs.mkdir(legacyDir, { recursive: true });
      const legacyPath = path.join(legacyDir, "vilaro.json");
      await fs.writeFile(legacyPath, "{}", "utf-8");

      const resolved = resolveConfigPathCandidate({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(legacyPath);
    });
  });

  it("respects state dir overrides when config is missing", async () => {
    await withTempDir({ prefix: "vilaro-config-override-" }, async (root) => {
      const legacyDir = path.join(root, ".vilaro");
      await fs.mkdir(legacyDir, { recursive: true });
      const legacyConfig = path.join(legacyDir, "vilaro.json");
      await fs.writeFile(legacyConfig, "{}", "utf-8");

      const overrideDir = path.join(root, "override");
      const env = { VILARO_STATE_DIR: overrideDir } as NodeJS.ProcessEnv;
      const resolved = resolveConfigPath(env, overrideDir, () => root);
      expect(resolved).toBe(path.join(overrideDir, "vilaro.json"));
    });
  });
});
