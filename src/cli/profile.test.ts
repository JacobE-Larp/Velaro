import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs(["node", "vilaro", "gateway", "--dev", "--allow-unconfigured"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "vilaro", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "vilaro", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "vilaro", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "vilaro", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "vilaro", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "vilaro", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it.each([
    ["--dev first", ["node", "vilaro", "--dev", "--profile", "work", "status"]],
    ["--profile first", ["node", "vilaro", "--profile", "work", "--dev", "status"]],
  ])("rejects combining --dev with --profile (%s)", (_name, argv) => {
    const res = parseCliProfileArgs(argv);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join(path.resolve("/home/peter"), ".vilaro-dev");
    expect(env.VILARO_PROFILE).toBe("dev");
    expect(env.VILARO_STATE_DIR).toBe(expectedStateDir);
    expect(env.VILARO_CONFIG_PATH).toBe(path.join(expectedStateDir, "vilaro.json"));
    expect(env.VILARO_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      VILARO_STATE_DIR: "/custom",
      VILARO_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.VILARO_STATE_DIR).toBe("/custom");
    expect(env.VILARO_GATEWAY_PORT).toBe("19099");
    expect(env.VILARO_CONFIG_PATH).toBe(path.join("/custom", "vilaro.json"));
  });

  it("uses VILARO_HOME when deriving profile state dir", () => {
    const env: Record<string, string | undefined> = {
      VILARO_HOME: "/srv/vilaro-home",
      HOME: "/home/other",
    };
    applyCliProfileEnv({
      profile: "work",
      env,
      homedir: () => "/home/fallback",
    });

    const resolvedHome = path.resolve("/srv/vilaro-home");
    expect(env.VILARO_STATE_DIR).toBe(path.join(resolvedHome, ".vilaro-work"));
    expect(env.VILARO_CONFIG_PATH).toBe(path.join(resolvedHome, ".vilaro-work", "vilaro.json"));
  });
});

describe("formatCliCommand", () => {
  it.each([
    {
      name: "no profile is set",
      cmd: "vilaro doctor --fix",
      env: {},
      expected: "vilaro doctor --fix",
    },
    {
      name: "profile is default",
      cmd: "vilaro doctor --fix",
      env: { VILARO_PROFILE: "default" },
      expected: "vilaro doctor --fix",
    },
    {
      name: "profile is Default (case-insensitive)",
      cmd: "vilaro doctor --fix",
      env: { VILARO_PROFILE: "Default" },
      expected: "vilaro doctor --fix",
    },
    {
      name: "profile is invalid",
      cmd: "vilaro doctor --fix",
      env: { VILARO_PROFILE: "bad profile" },
      expected: "vilaro doctor --fix",
    },
    {
      name: "--profile is already present",
      cmd: "vilaro --profile work doctor --fix",
      env: { VILARO_PROFILE: "work" },
      expected: "vilaro --profile work doctor --fix",
    },
    {
      name: "--dev is already present",
      cmd: "vilaro --dev doctor",
      env: { VILARO_PROFILE: "dev" },
      expected: "vilaro --dev doctor",
    },
  ])("returns command unchanged when $name", ({ cmd, env, expected }) => {
    expect(formatCliCommand(cmd, env)).toBe(expected);
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("vilaro doctor --fix", { VILARO_PROFILE: "work" })).toBe(
      "vilaro --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("vilaro doctor --fix", { VILARO_PROFILE: "  jbvilaro  " })).toBe(
      "vilaro --profile jbvilaro doctor --fix",
    );
  });

  it("handles command with no args after vilaro", () => {
    expect(formatCliCommand("vilaro", { VILARO_PROFILE: "test" })).toBe("vilaro --profile test");
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm vilaro doctor", { VILARO_PROFILE: "work" })).toBe(
      "pnpm vilaro --profile work doctor",
    );
  });
});
